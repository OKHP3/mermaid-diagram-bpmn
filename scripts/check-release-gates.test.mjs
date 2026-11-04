import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { commandExecutable, executeCommand, parseCommandJson, auditVulnerabilities, licenseEvidence, packageManagerEvidence } from "./release-gate-command.mjs";

test("uses the Windows pnpm command shim and keeps native commands unchanged", () => {
  assert.equal(commandExecutable("pnpm", "win32"), "pnpm.cmd");
  assert.equal(commandExecutable("git", "win32"), "git");
  assert.equal(commandExecutable("pnpm", "linux"), "pnpm");
});

test("missing command is an explicit failure instead of empty JSON", () => {
  const result = executeCommand("__missing_release_gate_command__", [], {}, "linux");
  assert.throws(() => parseCommandJson(result, "pnpm audit", { allowNonzero: true }), /command failed/);
});

test("malformed JSON is rejected", () => {
  assert.throws(
    () => parseCommandJson({ stdout: "{broken", exitCode: 0, error: null }, "pnpm audit"),
    /invalid JSON/,
  );
});

test("valid clean audit JSON is accepted", () => {
  const result = parseCommandJson({
    stdout: JSON.stringify({ metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 } }, advisories: {} }),
    exitCode: 0,
    error: null,
  }, "pnpm audit", { allowNonzero: true });
  assert.equal(result.metadata.vulnerabilities.high, 0);
});

test("valid high-severity audit JSON is retained when audit exits nonzero", () => {
  const audit = parseCommandJson({
    stdout: JSON.stringify({ metadata: { vulnerabilities: { critical: 0, high: 1 } }, advisories: {} }),
    exitCode: 1,
    error: Object.assign(new Error("audit reports vulnerabilities"), { status: 1 }),
  }, "pnpm audit", { allowNonzero: true });
  assert.equal(audit.metadata.vulnerabilities.high, 1);
});

test("license command failure is rejected even if it emits JSON", () => {
  const result = { stdout: "{}", exitCode: 1, error: Object.assign(new Error("license command failed"), { status: 1 }) };
  assert.throws(() => parseCommandJson(result, "pnpm licenses list"), /exited with status 1/);
});

test("absent or invalid high/critical counts cannot imply a clean audit", () => {
  for (const counts of [{}, {high:0}, {high:-1,critical:0}, {high:"0",critical:0}]) {
    assert.throws(() => auditVulnerabilities({metadata:{vulnerabilities:counts}}), /invalid vulnerability counts/);
  }
  assert.deepEqual(auditVulnerabilities({metadata:{vulnerabilities:{high:0,critical:0}}}), {high:0,critical:0});
});

test("license evidence rejects empty, error, and malformed workspace scans", () => {
  for (const data of [{}, [], {error:"failed"}, {MIT:[]}, {MIT:[{name:"x"}]}]) {
    assert.throws(() => licenseEvidence(data, new Set(["MIT"])), /[Ii]nvalid license/);
  }
});

test("unknown packages and changed development-tool versions still block release", () => {
  const result = licenseEvidence({Unknown:[
    {name:"@replit/vite-plugin-dev-banner",versions:["0.1.2"]},
    {name:"@replit/vite-plugin-dev-banner",versions:["0.1.3"]},
    {name:"runtime-library",versions:["1.0.0"]},
    {name:"khroma",versions:["2.1.0"],paths:["fixture"]},
  ]}, new Set(["MIT"]), () => Buffer.from("unverified license"));
  assert.equal(result.developmentOnly.length, 1);
  assert.equal(result.unknown.length, 3);
  assert.equal(result.resolved.length, 0);
});

test("package-manager verification follows the exact declaration and rejects mismatches", () => {
  assert.equal(packageManagerEvidence("pnpm@11.28.10", "11.28.10", true).matches, true);
  for (const args of [["pnpm@11.28.10","10.26.1",true], ["pnpm@11.28.10","11.28.10",false], ["pnpm@next","next",true]]) {
    assert.equal(packageManagerEvidence(...args).matches, false);
  }
});

const elkExpression = "EPL-2.0 OR GPL-3.0-or-later";
const reviewedElk = { name: "elkjs", versions: ["0.12.1"], paths: ["fixture"] };

function installedElkLicense() {
  const appRequire = createRequire(new URL("../app/package.json", import.meta.url));
  const mermaidRequire = createRequire(appRequire.resolve("mermaid"));
  return readFileSync(join(dirname(mermaidRequire.resolve("elkjs/package.json")), "LICENSE.md"));
}

test("reviewed ELK license bytes resolve to the already allowed EPL alternative", () => {
  const licenseBytes = installedElkLicense();
  const readPaths = [];
  const result = licenseEvidence({ [elkExpression]: [reviewedElk] }, new Set(["EPL-2.0"]), path => {
    readPaths.push(path);
    return licenseBytes;
  });
  assert.deepEqual(readPaths, [join("fixture", "LICENSE.md")]);
  assert.deepEqual(result.unknown, []);
  assert.deepEqual(result.resolved, [{ name: "elkjs", versions: ["0.12.1"], license: "EPL-2.0",
    declaredLicense: elkExpression, evidence: "Selected reviewed EPL-2.0 alternative; verified installed LICENSE.md SHA-256" }]);
});

test("ELK resolution does not approve other packages, versions, policies or expressions", () => {
  const cases = [
    [elkExpression, { ...reviewedElk, name: "other-library" }, new Set(["EPL-2.0"])],
    [elkExpression, { ...reviewedElk, versions: ["0.12.2"] }, new Set(["EPL-2.0"])],
    [elkExpression, { ...reviewedElk, versions: ["0.12.1", "0.12.2"] }, new Set(["EPL-2.0"])],
    [elkExpression, reviewedElk, new Set(["MIT"])],
    ...["GPL-3.0-or-later", "EPL-2.0 AND GPL-3.0-or-later", "MIT OR Unreviewed", "Unknown"]
      .map(expression => [expression, reviewedElk, new Set(["EPL-2.0", "MIT"])]),
  ];
  for (const [expression, pkg, allowed] of cases) {
    const result = licenseEvidence({ [expression]: [pkg] }, allowed, () => assert.fail("Unreviewed metadata must not reach file verification"));
    assert.equal(result.unknown.length, 1, expression);
    assert.deepEqual(result.resolved, []);
  }
});

test("ELK resolution rejects absent or changed license evidence at every installed path", () => {
  for (const paths of [undefined, [], "fixture", [""], [null], ["changed"]]) {
    const result = licenseEvidence({ [elkExpression]: [{ ...reviewedElk, paths }] }, new Set(["EPL-2.0"]), () => Buffer.from("changed license"));
    assert.equal(result.unknown.length, 1);
    assert.deepEqual(result.resolved, []);
  }
  const licenseBytes = installedElkLicense();
  const mixed = licenseEvidence({ [elkExpression]: [{ ...reviewedElk, paths: ["verified", "changed"] }] }, new Set(["EPL-2.0"]), path =>
    path === join("verified", "LICENSE.md") ? licenseBytes : Buffer.from("changed license"));
  assert.equal(mixed.unknown.length, 1);
  assert.deepEqual(mixed.resolved, []);
  assert.throws(() => licenseEvidence({ [elkExpression]: [reviewedElk] }, new Set(["EPL-2.0"]), () => {
    throw new Error("Missing installed license file");
  }), /Missing installed license/);
});
