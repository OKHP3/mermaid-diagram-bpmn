#!/usr/bin/env node
/**
 * Check that the public Roadmap keeps the evidence links that support its
 * completed contribution-path claims.
 *
 * This is intentionally a source check rather than a network health probe:
 * it catches an accidentally removed or changed link in CI, while a human
 * maintainer remains responsible for reviewing whether each source still
 * supports the associated claim.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const ROADMAP_SOURCE_PATH = "app/src/pages/Roadmap.tsx";

export const REQUIRED_EVIDENCE = [
  {
    id: "mermaid-issue-7699",
    label: "Mermaid issue #7699",
    marker: "https://github.com/mermaid-js/mermaid/issues/7699",
  },
  {
    id: "mermaid-issue-2623",
    label: "Mermaid issue #2623",
    marker: "https://github.com/mermaid-js/mermaid/issues/2623",
  },
  {
    id: "mermaid-issue-660",
    label: "Mermaid issue #660",
    marker: "https://github.com/mermaid-js/mermaid/issues/660",
  },
  {
    id: "live-plugin-demo",
    label: "live Mermaid plugin demo",
    marker: 'href="/mermaid-host-demo"',
  },
  {
    id: "published-npm-package",
    label: "published npm package",
    marker: "https://www.npmjs.com/package/@okhp3/mermaid-diagram-bpmn",
  },
  {
    id: "dsl-reference",
    label: "DSL Reference",
    marker: 'href="/dsl"',
  },
];

export function checkRoadmapEvidence(source) {
  const missing = REQUIRED_EVIDENCE
    .filter(({ marker }) => !source.includes(marker))
    .map(({ id, label, marker }) => ({ id, label, marker }));

  return {
    ok: missing.length === 0,
    source: ROADMAP_SOURCE_PATH,
    checked: REQUIRED_EVIDENCE.map(({ id, label, marker }) => ({ id, label, marker })),
    missing,
  };
}

function main() {
  const root = resolve(new URL("..", import.meta.url).pathname);
  let source;
  try {
    source = readFileSync(resolve(root, ROADMAP_SOURCE_PATH), "utf8");
  } catch (error) {
    console.error(
      `[check-roadmap-evidence] FAIL: unable to read ${ROADMAP_SOURCE_PATH}\n` +
      `  ${error.message}`,
    );
    process.exitCode = 1;
    return;
  }

  const result = checkRoadmapEvidence(source);
  if (!result.ok) {
    console.error(
      `[check-roadmap-evidence] FAIL: Roadmap evidence is incomplete.\n` +
      result.missing.map((item) => `  - ${item.label}: missing ${item.marker}`).join("\n") +
      `\n  Restore the link or review the related claim before release.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[check-roadmap-evidence] OK: ${result.checked.length} Roadmap evidence links are present.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  main();
}