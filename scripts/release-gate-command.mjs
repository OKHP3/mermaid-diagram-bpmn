import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function commandExecutable(name, platform = process.platform) {
  return platform === "win32" && name === "pnpm" ? "pnpm.cmd" : name;
}

export function executeCommand(name, args, options = {}, platform = process.platform) {
  try {
    const pnpmEntry = name === "pnpm" && /(?:^|[/\\])pnpm\.(?:mjs|cjs|js)$/.test(process.env.npm_execpath ?? "")
      ? process.env.npm_execpath : null;
    const stdout = execFileSync(pnpmEntry ? process.execPath : commandExecutable(name, platform), pnpmEntry ? [pnpmEntry, ...args] : args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      // Windows batch shims (including pnpm.cmd) require a command shell.
      // Call sites pass fixed argument arrays, never user-supplied shell text.
      ...(platform === "win32" && name === "pnpm" && !pnpmEntry ? { shell: true } : {}),
      ...options,
    });
    return { stdout, exitCode: 0, error: null };
  } catch (error) {
    return { stdout: error.stdout?.toString() ?? "", exitCode: error.status ?? null, error };
  }
}

export function parseCommandJson(result, label, { allowNonzero = false } = {}) {
  if (result.error && (result.exitCode === null || result.stdout.trim() === "")) {
    throw new Error(`${label} command failed${result.error.code ? ` (${result.error.code})` : ""}: ${result.error.message}`);
  }
  if (result.exitCode !== 0 && !allowNonzero) {
    throw new Error(`${label} command exited with status ${result.exitCode}`);
  }
  if (!result.stdout.trim()) throw new Error(`${label} returned empty JSON output`);
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`${label} returned invalid JSON: ${error.message}`);
  }
}

export function auditVulnerabilities(audit) {
  const counts = audit?.metadata?.vulnerabilities;
  if (!counts || Array.isArray(counts) || !["critical", "high"].every(
    key => Number.isInteger(counts[key]) && counts[key] >= 0,
  )) throw new Error("pnpm audit returned invalid vulnerability counts");
  return counts;
}

// These exact Replit tools run only during Vite serve, never production build.
// Missing metadata remains visible and any version change requires review.
const developmentOnly = new Set([
  "@replit/vite-plugin-cartographer@0.6.1",
  "@replit/vite-plugin-dev-banner@0.1.2",
  "@replit/vite-plugin-runtime-error-modal@0.0.6",
]);

export function licenseEvidence(data, allowed, readFile = readFileSync) {
  if (!data || typeof data !== "object" || Array.isArray(data) ||
      Object.hasOwn(data, "error") || Object.keys(data).length === 0) {
    throw new Error("pnpm licenses list returned invalid license data");
  }
  const evidence = { observed: Object.keys(data), unknown: [], resolved: [], developmentOnly: [] };
  for (const [license, packages] of Object.entries(data)) {
    if (!Array.isArray(packages) || packages.length === 0) throw new Error("Invalid license package list");
    for (const pkg of packages) {
      if (!pkg.name || !Array.isArray(pkg.versions) || !pkg.versions.length) throw new Error("Invalid license package record");
      if (allowed.has(license)) continue;
      if (license === "Unknown" && pkg.versions.every(version => developmentOnly.has(`${pkg.name}@${version}`))) {
        evidence.developmentOnly.push({ name: pkg.name, versions: pkg.versions, license });
        continue;
      }
      if (license === "Unknown" && pkg.name === "khroma" && pkg.versions.length === 1 && pkg.versions[0] === "2.1.0" && pkg.paths?.length) {
        const verified = pkg.paths.every(path => createHash("sha256").update(readFile(join(path, "license"))).digest("hex") ===
          "66b333b0f66759a0b710459e03f7029abe17f4358114a128d2c972e642961b49");
        if (verified) {
          evidence.resolved.push({ name: pkg.name, versions: pkg.versions, license: "MIT", evidence: "Verified installed license file SHA-256" });
          continue;
        }
      }
      evidence.unknown.push({ name: pkg.name, versions: pkg.versions, license });
    }
  }
  return evidence;
}

export function packageManagerEvidence(declared, installed, lockfilePresent) {
  return {
    declared, installed, lockfilePresent,
    matches: lockfilePresent && /^pnpm@\d+\.\d+\.\d+$/.test(declared ?? "") && declared === `pnpm@${installed}`,
  };
}
