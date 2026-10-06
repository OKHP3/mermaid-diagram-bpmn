import { execFileSync } from "node:child_process";

export function commandExecutable(name, platform = process.platform) {
  return platform === "win32" && name === "pnpm" ? "pnpm.cmd" : name;
}

export function executeCommand(name, args, options = {}, platform = process.platform) {
  try {
    const stdout = execFileSync(commandExecutable(name, platform), args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      // Windows batch shims (including pnpm.cmd) require a command shell.
      // Call sites pass fixed argument arrays, never user-supplied shell text.
      ...(platform === "win32" && name === "pnpm" ? { shell: true } : {}),
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
