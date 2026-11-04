import {
  readFileSync,
  appendFileSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compareVersions, isStable } from "./technology-inventory.mjs";

export function releaseState(
  metadata,
  releases,
  current,
  candidate,
  ageHours,
  now = Date.now(),
) {
  if (
    !isStable(current) ||
    (candidate && !isStable(candidate)) ||
    !Number.isFinite(ageHours) ||
    ageHours < 0
  )
    throw new Error("Invalid release policy or pinned version");
  const published = Object.keys(metadata.versions ?? {})
    .filter(
      (v) =>
        isStable(v) &&
        !metadata.versions[v].deprecated &&
        Date.parse(metadata.time?.[v]) <= now,
    )
    .sort(compareVersions);
  const latest = published.at(-1);
  if (!latest) throw new Error("npm returned no dated stable Mermaid release");
  const vendor = new Map(
    releases
      .filter(
        (r) =>
          !r.draft &&
          !r.prerelease &&
          /^mermaid@\d+\.\d+\.\d+$/.test(r.tag_name) &&
          Date.parse(r.published_at) <= now,
      )
      .map((r) => [r.tag_name.slice(8), r]),
  );
  if (!vendor.has(latest))
    throw new Error(
      `npm ${latest} has no matching stable Mermaid GitHub release; do not advance`,
    );
  const releaseTime = (v) =>
    Math.max(
      Date.parse(metadata.time[v]),
      Date.parse(vendor.get(v).published_at),
    );
  const eligible = published
    .filter(
      (v) => vendor.has(v) && releaseTime(v) + ageHours * 3_600_000 <= now,
    )
    .at(-1);
  const dispatch = Boolean(
    eligible &&
    compareVersions(eligible, current) > 0 &&
    (!candidate || compareVersions(eligible, candidate) > 0),
  );
  const status = dispatch
    ? "ready-for-candidate"
    : compareVersions(latest, current) <= 0
      ? "current"
      : candidate && compareVersions(candidate, latest) >= 0
        ? "candidate-awaiting-review"
        : "waiting-for-maturity";
  return {
    checkedAt: new Date(now).toISOString(),
    current,
    candidate: candidate ?? null,
    latest,
    eligible: eligible ?? null,
    latestPublishedAt: new Date(releaseTime(latest)).toISOString(),
    latestEligibleAt: new Date(
      releaseTime(latest) + ageHours * 3_600_000,
    ).toISOString(),
    status,
    dispatch,
    latestReleaseUrl: vendor.get(latest).html_url,
    dispatchTarget: dispatch
      ? {
          version: eligible,
          eligibleAt: new Date(
            releaseTime(eligible) + ageHours * 3_600_000,
          ).toISOString(),
          releaseUrl: vendor.get(eligible).html_url,
        }
      : null,
  };
}

async function getJson(url, github = false) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    headers:
      github && process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {},
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const root = new URL("../", import.meta.url);
    const current = JSON.parse(readFileSync(new URL("app/package.json", root)))
      .devDependencies.mermaid;
    const policy = JSON.parse(
      readFileSync(new URL(".github/vendor-update-policy.json", root)),
    );
    const [metadata, releases] = await Promise.all([
      getJson("https://registry.npmjs.org/mermaid"),
      getJson(
        "https://api.github.com/repos/mermaid-js/mermaid/releases?per_page=100",
        true,
      ),
    ]);
    const result = releaseState(
      metadata,
      releases,
      current,
      process.env.MERMAID_CANDIDATE_VERSION || undefined,
      policy.minimumReleaseAgeHours,
    );
    const output = JSON.stringify(result, null, 2) + "\n";
    console.log(output);
    const outputIndex = process.argv.indexOf("--output");
    if (outputIndex >= 0) {
      const path = process.argv[outputIndex + 1];
      if (!path) throw new Error("--output requires a path");
      mkdirSync(dirname(resolve(path)), { recursive: true });
      writeFileSync(path, output);
    }
    if (process.env.GITHUB_OUTPUT)
      appendFileSync(
        process.env.GITHUB_OUTPUT,
        `dispatch=${result.dispatch}\n`,
      );
    if (process.env.GITHUB_STEP_SUMMARY)
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `## Mermaid release detection\n\nPinned: ${result.current}. Latest stable: ${result.latest}. Candidate: ${result.candidate ?? "none"}.\n\nStatus: **${result.status}**. Latest release eligible at ${result.latestEligibleAt}.\n\n[Latest vendor release](${result.latestReleaseUrl}). ${result.dispatchTarget ? `Dispatching candidate ${result.dispatchTarget.version}, eligible since ${result.dispatchTarget.eligibleAt}: ${result.dispatchTarget.releaseUrl}.` : "No new candidate dispatch requested."} Detection is separate from compatibility validation, merge and deployment.\n`,
      );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
