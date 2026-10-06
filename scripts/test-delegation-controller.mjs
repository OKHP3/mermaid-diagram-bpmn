import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const run = path.resolve(dir, "..");
const source = JSON.parse(
  fs.readFileSync(path.join(run, "docs/delegation/program.json"), "utf8"),
);
source.tasks.find((t) => t.id === "T04").status = "running";
source.tasks.find((t) => t.id === "T04").attempt = 1;
source.tasks.find((t) => t.id === "T04").thread = {
  threadId: "fixture-thread",
};
const repo = fs.mkdtempSync(path.join(os.tmpdir(), "bpmn-delegation-"));
const root = path.join(repo, ".local/delegation-2026-10-05");
fs.mkdirSync(root, { recursive: true });
fs.mkdirSync(path.join(repo, "scripts"), { recursive: true });
const controller = path.join(repo, "scripts/delegation-controller.mjs");
fs.copyFileSync(
  path.join(run, "scripts/delegation-controller.mjs"),
  controller,
);
const task = source.tasks.find((t) => t.id === "T04");
const output = path.join(repo, task.outputDirectory);
fs.mkdirSync(output, { recursive: true });
const report = task.outputDirectory + "/report.md";
const reportAbs = path.join(repo, report);
fs.writeFileSync(reportAbs, "Fixture acceptance evidence only.\n");
const receiptPath = path.join(output, "receipt.json");
const registry = path.join(root, "program.json");
const results = [];
const receipt = () => ({
  taskId: task.id,
  attempt: task.attempt,
  threadId: task.thread.threadId,
  outcome: "completed",
  changedPaths: [report],
  checks: task.acceptance.map((criterion) => ({
    criterion,
    result: "pass",
    evidence: report,
  })),
  tokensUsed: null,
  tokenSource: "unknown",
});
const reset = (p = source, r = receipt()) => {
  fs.writeFileSync(registry, JSON.stringify(p));
  fs.writeFileSync(receiptPath, JSON.stringify(r));
};
const check = (name, args, shouldPass) => {
  const r = spawnSync(process.execPath, [controller, ...args], {
    encoding: "utf8",
  });
  const passed = (r.status === 0) === shouldPass;
  results.push({
    name,
    passed,
    exitCode: r.status,
    output: (r.stdout + r.stderr).trim().slice(0, 900),
  });
  if (!passed) process.exitCode = 1;
};
reset();
check("valid DAG/budgets", ["validate"], true);
reset();
check("ready preparation tasks can be listed", ["ready"], true);
reset();
check("valid reviewed receipt accepted", ["accept", "T04", "--reviewed"], true);
reset();
check("explicit superintendent review required", ["accept", "T04"], false);
reset();
fs.unlinkSync(receiptPath);
check("missing receipt rejected", ["accept", "T04", "--reviewed"], false);
let r = receipt();
r.threadId = "wrong-thread";
reset(source, r);
check("wrong thread rejected", ["accept", "T04", "--reviewed"], false);
r = receipt();
r.attempt++;
reset(source, r);
check("stale attempt rejected", ["accept", "T04", "--reviewed"], false);
r = receipt();
r.outcome = "partial";
reset(source, r);
check("partial outcome rejected", ["accept", "T04", "--reviewed"], false);
r = receipt();
r.checks[0].result = "fail";
reset(source, r);
check("failed criterion rejected", ["accept", "T04", "--reviewed"], false);
r = receipt();
r.checks.pop();
reset(source, r);
check("missing criterion rejected", ["accept", "T04", "--reviewed"], false);
r = receipt();
r.checks[0].evidence = task.outputDirectory + "/missing.md";
reset(source, r);
check("missing artifact rejected", ["accept", "T04", "--reviewed"], false);
r = receipt();
r.changedPaths = [task.outputDirectory + "/../T03/escape.md"];
const escape = path.join(repo, r.changedPaths[0]);
fs.mkdirSync(path.dirname(escape), { recursive: true });
fs.writeFileSync(escape, "Escape fixture.\n");
reset(source, r);
check(
  "normalized owner traversal rejected",
  ["accept", "T04", "--reviewed"],
  false,
);
r = receipt();
r.tokensUsed = 2000001;
r.tokenSource = "local-goal";
reset(source, r);
check(
  "reported duty ceiling exceeded rejected",
  ["accept", "T04", "--reviewed"],
  false,
);
r = receipt();
r.tokensUsed = 0;
r.tokenSource = "unknown";
reset(source, r);
check("unknown usage cannot be zero", ["accept", "T04", "--reviewed"], false);
let p = structuredClone(source);
p.tasks[0].dependencies = ["T23"];
reset(p);
check("dependency cycle rejected", ["validate"], false);
p = structuredClone(source);
p.tasks[0].dependencies = ["MISSING"];
reset(p);
check("missing dependency rejected", ["validate"], false);
p = structuredClone(source);
p.tasks[0].goalBudgetTokens = 2000001;
reset(p);
check("working budget beyond ceiling rejected", ["validate"], false);
p = structuredClone(source);
p.tasks.slice(4, 8).forEach((t) => (t.status = "running"));
reset(p);
check("concurrency ceiling rejected", ["validate"], false);
for (const [name, paths, pass] of [
  [
    "equivalent normalized paths collide",
    [".local/shared/", "./.local/shared/"],
    false,
  ],
  [
    "parent directory ownership collides",
    [".local/shared/", ".local/shared/nested/"],
    false,
  ],
  [
    "sibling prefixes do not collide",
    [".local/shared-a/", ".local/shared-ab/"],
    true,
  ],
  ["distinct files do not collide", [".local/file", ".local/file-more"], true],
]) {
  p = structuredClone(source);
  p.tasks[0].status = "running";
  p.tasks[1].status = "running";
  p.tasks[0].writePaths = [paths[0]];
  p.tasks[1].writePaths = [paths[1]];
  reset(p);
  check(name, ["validate"], pass);
}
reset();
check(
  "canonical implementation source gate blocks attachment",
  ["attach", "T05", "fixture-thread"],
  false,
);
reset();
for (let i = 1; i <= 8; i++) {
  const proposal = path.join(root, "proposal-" + i + ".json");
  fs.writeFileSync(
    proposal,
    JSON.stringify({
      id: "NEW" + i,
      title: "Fixture proposal " + i,
      evidence: report,
      acceptance: ["Fixture check"],
      ownerPaths: [task.outputDirectory + "/fixture/"],
      goalBudgetTokens: 1000,
    }),
  );
  check("intake reservation " + i, ["propose", proposal], i <= 7);
}
fs.mkdirSync(path.join(repo, "docs/delegation"), { recursive: true });
fs.copyFileSync(
  path.join(run, "docs/delegation/program.json"),
  path.join(repo, "docs/delegation/program.json"),
);
check(
  "fresh private run initializes",
  ["init", "--registry", ".local/new-run/program.json"],
  true,
);
check(
  "initialization preserves existing run",
  ["init", "--registry", ".local/new-run/program.json"],
  false,
);
check(
  "public registry mutation rejected",
  ["init", "--registry", "docs/delegation/program.json"],
  false,
);
check(
  "outside workspace registry rejected",
  ["init", "--registry", "../outside.json"],
  false,
);
console.log(
  JSON.stringify(
    {
      checks: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed),
    },
    null,
    2,
  ),
);
const cleanupRelative = path.relative(os.tmpdir(), repo);
if (
  !cleanupRelative.startsWith("bpmn-delegation-") ||
  cleanupRelative.includes(path.sep) ||
  path.isAbsolute(cleanupRelative)
)
  throw new Error("Unsafe sandbox cleanup path");
fs.rmSync(repo, { recursive: true, force: true });
