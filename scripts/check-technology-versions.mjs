import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import {
  audit,
  collectInventory,
  formatReport,
  read,
  root,
} from "./technology-inventory.mjs";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
function option(flag) {
  const index = args.indexOf(flag);
  if (index < 0) return null;
  if (!args[index + 1] || args[index + 1].startsWith("--"))
    throw new Error(`Missing value for ${flag}`);
  return args[index + 1];
}
function save(path, text) {
  mkdirSync(dirname(resolve(path)), { recursive: true });
  writeFileSync(path, text);
}
try {
  const output = option("--output"),
    json = option("--json");
  const files = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const report = await audit(collectInventory(files, read));
  report.sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  report.auditNode = process.version;
  report.sourceDirty = Boolean(
    execFileSync(
      "git",
      ["status", "--porcelain", "--", ...report.inventory.sources],
      {
        cwd: root,
        encoding: "utf8",
      },
    ).trim(),
  );
  const markdown = formatReport(report);
  if (output) save(output, markdown);
  else console.log(markdown);
  if (json) save(json, JSON.stringify(report, null, 2) + "\n");
  if (args.includes("--ci") && process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + "\n");
  console.log(
    `Technology audit: ${report.complete ? "PASS" : "INCOMPLETE"}; ${Object.keys(report.npm).length} registry lookups; ${report.errors.length} failures.`,
  );
  // Missing evidence must not masquerade as no available updates.
  if (!report.complete) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
