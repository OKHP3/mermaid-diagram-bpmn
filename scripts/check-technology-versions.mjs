import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const isCi = process.argv.includes("--ci");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function parseOutdated(stdout) {
  if (!stdout) return [];

  try {
    const data = JSON.parse(stdout);
    return Object.entries(data)
      .map(([name, details]) => ({ name, ...details }))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    throw new Error(`Could not parse pnpm outdated output: ${error.message}`);
  }
}

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getRuntimeReleases() {
  const [nodeReleases, pnpmPackage] = await Promise.all([
    getJson("https://nodejs.org/dist/index.json"),
    getJson("https://registry.npmjs.org/pnpm/latest"),
  ]);

  const latestLts = nodeReleases.find(
    (release) => release.lts && !release.version.includes("-"),
  );
  const latestCurrent = nodeReleases.find(
    (release) => !release.lts && !release.version.includes("-"),
  );

  return {
    nodeLts: latestLts?.version ?? "unavailable",
    nodeCurrent: latestCurrent?.version ?? "unavailable",
    pnpm: pnpmPackage.version ?? "unavailable",
  };
}

function formatReport(outdated, runtime) {
  const generated = new Date().toISOString().slice(0, 10);
  const lines = [
    "# Technology version audit",
    "",
    `Generated: ${generated}`,
    "",
    "The package list comes from the workspace lockfile and npm registry metadata.",
    "Dependabot remains responsible for opening update pull requests.",
    "",
    "## Runtime",
    "",
    "| Technology | Running in audit | Latest stable reference |",
    "| --- | --- | --- |",
    `| Node.js | ${process.version} | LTS ${runtime.nodeLts}; current ${runtime.nodeCurrent} |`,
    `| pnpm | ${run(pnpmCommand, ["--version"]).stdout} | ${runtime.pnpm} |`,
    "",
    "## npm packages with available updates",
    "",
  ];

  if (outdated.length === 0) {
    lines.push("No package updates were reported by pnpm.");
    return lines.join("\n");
  }

  lines.push(
    "| Package | Resolved | Wanted | Latest |",
    "| --- | ---: | ---: | ---: |",
  );
  for (const update of outdated) {
    lines.push(
      `| \`${update.name}\` | ${update.current} | ${update.wanted} | ${update.latest} |`,
    );
  }

  return lines.join("\n");
}

async function main() {
  const outdatedResult = run(pnpmCommand, [
    "outdated",
    "--recursive",
    "--format",
    "json",
  ]);
  const outdated = parseOutdated(outdatedResult.stdout);

  let runtime;
  try {
    runtime = await getRuntimeReleases();
  } catch (error) {
    runtime = {
      nodeLts: `unavailable: ${error.message}`,
      nodeCurrent: "unavailable",
      pnpm: "unavailable",
    };
  }

  const report = formatReport(outdated, runtime);
  console.log(report);

  if (isCi && process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
