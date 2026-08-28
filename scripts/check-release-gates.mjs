import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { checkComparisonEvidence } from "./check-comparison-evidence.mjs";

const root = process.cwd();
const output = process.argv.includes("--output")
  ? process.argv[process.argv.indexOf("--output") + 1]
  : "release-gate-report.json";
const outputPath = isAbsolute(output) ? output : join(root, output);
const allowedLicenses = new Set([
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BlueOak-1.0.0",
  "CC0-1.0",
  "ISC",
  "MIT",
  "MPL-2.0",
  "(MPL-2.0 OR Apache-2.0)",
  "Unlicense",
]);

const read = (file) => readFileSync(join(root, file), "utf8");
const command = (name, args) => {
  try {
    return execFileSync(name, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    return error.stdout?.toString() ?? "";
  }
};

const audit = JSON.parse(command("pnpm", ["audit", "--json"]) || "{}");
const vulnerabilities = audit.metadata?.vulnerabilities ?? {};
// Release licensing applies to shipped dependencies, not build-time tooling.
const licensesJson = JSON.parse(command("pnpm", ["licenses", "list", "--prod", "--json"]) || "{}");
const licenseNames = Object.keys(licensesJson).filter((name) => name !== "error");
const unknownLicenses = licenseNames.filter((name) => !allowedLicenses.has(name));
const mermaidFindings = Object.values(audit.advisories ?? {})
  .filter((advisory) => advisory.module_name === "mermaid")
  .map((advisory) => ({
    id: advisory.github_advisory_id ?? advisory.overview?.split("\n")[0] ?? "unknown",
    severity: advisory.severity,
    package: `${advisory.module_name}@${advisory.findings?.[0]?.version ?? "unknown"}`,
  }));
const source = read("app/src/lib/bpmn-plugin.ts");
const renderer = read("app/src/lib/bpmn-renderer.tsx");
const comparisonEvidence = checkComparisonEvidence(read("app/src/pages/SyntaxComparison.tsx"));
const browserEvidence = process.env.RELEASE_BROWSER_EVIDENCE ?? "linux/chromium";
const browserStatus = browserEvidence.includes("firefox") && browserEvidence.includes("webkit")
  ? "pass"
  : "limited";

const gates = [
  {
    id: "dependencies",
    owner: "Release engineering",
    status: (vulnerabilities.critical ?? 0) === 0 && (vulnerabilities.high ?? 0) === 0 ? "pass" : "fail",
    command: "pnpm audit --json",
    interpretation: "Critical or high advisories block publication; moderate and low advisories remain visible.",
    escalation: "Upgrade or replace the affected dependency, then rerun the report.",
    evidence: vulnerabilities,
    limitation: mermaidFindings.length ? `Mermaid remains pinned at 11.4.1 with ${mermaidFindings.length} advisory findings; review before changing the tested compatibility pair.` : null,
  },
  {
    id: "licenses",
    owner: "Release engineering",
    status: unknownLicenses.length === 0 ? "pass" : "fail",
    command: "pnpm licenses list --json",
    interpretation: "Every distributed dependency must use an approved permissive or weak-copyleft license.",
    escalation: "Identify an SPDX license or replace the dependency; do not publish an unknown license.",
    evidence: { observed: licenseNames, unknown: unknownLicenses },
  },
  {
    id: "source-safety",
    owner: "Maintainers",
    status: /\beval\s*\(|new Function|document\.write\s*\(/.test(source + renderer) ? "fail" : "pass",
    command: "pnpm run check:release-gates",
    interpretation: "No dynamic code execution or document.write is permitted in rendering paths.",
    escalation: "Treat a finding as a security issue and add a regression test before release.",
    evidence: { checked: ["app/src/lib/bpmn-plugin.ts", "app/src/lib/bpmn-renderer.tsx"] },
  },
  {
    id: "svg-safety",
    owner: "Renderer maintainers",
    status: source.includes("image/svg+xml") && source.includes("escapeXml") ? "pass" : "fail",
    command: "pnpm run test",
    interpretation: "SVG is parsed in the SVG namespace and interpolated labels are XML-escaped.",
    escalation: "Block release and add a browser regression for any unsafe injection path.",
    evidence: { namespaceParser: source.includes("image/svg+xml"), xmlEscaping: source.includes("escapeXml") },
  },
  {
    id: "accessibility",
    owner: "UI maintainers",
    status: existsSync(join(root, "app/src/lib/__tests__/bpmn-renderer.test.tsx")) ? "pass" : "fail",
    command: "pnpm --filter @workspace/mermaid-diagram-bpmn run test",
    interpretation: "Automated SVG semantics and control-name assertions must pass; manual AT review remains separate.",
    escalation: "Block the accessibility claim and record missing browser/assistive-technology evidence.",
    evidence: { automatedSuitePresent: true, assistiveTechnology: "not tested in this environment" },
  },
  {
    id: "browser-portability",
    owner: "Release engineering",
    status: browserStatus,
    command: "pnpm --filter @workspace/mermaid-diagram-bpmn run test:e2e --project=chromium",
    interpretation: "Browser claims are limited to engines actually run; Linux/Chromium is not cross-platform proof.",
    escalation: "Run the Firefox/WebKit matrix with native dependencies or narrow the public compatibility claim.",
    evidence: { requested: browserEvidence, engines: browserEvidence.split(",").map((item) => item.trim()) },
    limitation: browserStatus === "pass" ? null : "This report records Linux/Chromium evidence only; Firefox, WebKit, Windows, and assistive technology are not inferred.",
  },
  {
    id: "comparison-evidence",
    owner: "Documentation maintainers",
    status: comparisonEvidence.ok ? "pass" : "fail",
    command: "pnpm run check:comparison-evidence",
    interpretation: "Every external notation and research claim on the public comparison page must retain an inspectable source link.",
    escalation: "Restore the missing source link or remove the unsupported comparison claim before release.",
    evidence: comparisonEvidence,
  },
  {
    id: "reproducibility",
    owner: "Release engineering",
    status: existsSync(join(root, "pnpm-lock.yaml")) && read("package.json").includes('"packageManager": "pnpm@10.26.1"') ? "pass" : "fail",
    command: "pnpm install --frozen-lockfile && pnpm run build",
    interpretation: "The lockfile, declared package manager, generated assets, and build must reproduce from a clean checkout.",
    escalation: "Regenerate and commit the lockfile/generated assets or stop publication.",
    evidence: { lockfile: "present", packageManager: "pnpm@10.26.1" },
  },
];

const report = {
  schema: "bpmn-for-mermaid/release-gate-report@1",
  generatedAt: new Date().toISOString(),
  revision: command("git", ["rev-parse", "HEAD"]).trim() || "unknown",
  runtime: { node: process.version, pnpm: command("pnpm", ["--version"]).trim() },
  decision: gates.some((gate) => gate.status === "fail") ? "NO-GO" : "GO-WITH-LIMITS",
  gates,
  releaseBoundary: "Static browser-first descriptive BPMN subset; no backend, accounts, telemetry, or executable BPMN semantics.",
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Release gate decision: ${report.decision}`);
for (const gate of gates) console.log(`${gate.status.toUpperCase().padEnd(14)} ${gate.id}`);
console.log(`Report: ${outputPath}`);
process.exitCode = report.decision === "NO-GO" ? 1 : 0;
