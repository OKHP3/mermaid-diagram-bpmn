#!/usr/bin/env node
/**
 * Check that the public syntax comparison keeps evidence links for every
 * external notation and research claim it presents.
 *
 * This is intentionally a source check rather than a claim-truth verifier:
 * it catches an accidentally uncited or removed source before publication,
 * while the linked sources and dated review notes remain the responsibility of
 * the comparison maintainer.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const COMPARISON_SOURCE_PATH = "app/src/pages/SyntaxComparison.tsx";

export const REQUIRED_EVIDENCE = [
  {
    id: "dfki-7699",
    label: "DFKI #7699 proposal",
    markers: ["DFKI #7699", "https://github.com/mermaid-js/mermaid/issues/7699"],
  },
  {
    id: "derari",
    label: "@derari live prototype",
    markers: ["@derari", "https://derari.github.io/mermaid-bpmn/editor.html"],
  },
  {
    id: "plantuml",
    label: "PlantUML activity-beta",
    markers: ["PlantUML", "https://plantuml.com/activity-diagram-beta"],
  },
  {
    id: "mermaid-flowchart",
    label: "Mermaid flowchart",
    markers: ["Mermaid flowchart", "https://mermaid.js.org/syntax/flowchart.html"],
  },
  {
    id: "llm-research",
    label: "LLM-friendliness research",
    markers: ["LLM-friendliness research", "https://arxiv.org/abs/2507.11356"],
  },
];

export function checkComparisonEvidence(source) {
  const missing = [];

  for (const evidence of REQUIRED_EVIDENCE) {
    for (const marker of evidence.markers) {
      if (!source.includes(marker)) {
        missing.push({
          id: evidence.id,
          label: evidence.label,
          marker,
        });
      }
    }
  }

  return {
    ok: missing.length === 0,
    source: COMPARISON_SOURCE_PATH,
    checked: REQUIRED_EVIDENCE.map(({ id, label }) => ({ id, label })),
    missing,
  };
}

function main() {
  const root = resolve(new URL("..", import.meta.url).pathname);
  let source;
  try {
    source = readFileSync(resolve(root, COMPARISON_SOURCE_PATH), "utf8");
  } catch (error) {
    console.error(
      `[check-comparison-evidence] FAIL: unable to read ${COMPARISON_SOURCE_PATH}\n` +
      `  ${error.message}`,
    );
    process.exitCode = 1;
    return;
  }

  const result = checkComparisonEvidence(source);
  if (!result.ok) {
    console.error(
      `[check-comparison-evidence] FAIL: public comparison evidence is incomplete.\n` +
      result.missing.map((item) => `  - ${item.label}: missing ${item.marker}`).join("\n") +
      `\n  Restore the source link or remove the unsupported comparison claim before release.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[check-comparison-evidence] OK: ${result.checked.length} comparison evidence records are linked.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  main();
}