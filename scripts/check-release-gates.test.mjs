import { test } from "node:test";
import assert from "node:assert/strict";
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
