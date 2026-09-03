#!/usr/bin/env node
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  checkRoadmapEvidence,
  ROADMAP_SOURCE_PATH,
  REQUIRED_EVIDENCE,
} from "./check-roadmap-evidence.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);

test("the Roadmap keeps every required contribution evidence link", () => {
  const source = readFileSync(resolve(root, ROADMAP_SOURCE_PATH), "utf8");
  const result = checkRoadmapEvidence(source);

  assert.equal(result.ok, true);
  assert.deepEqual(result.missing, []);
  assert.equal(result.checked.length, REQUIRED_EVIDENCE.length);
});

test("reports the exact missing evidence marker", () => {
  const source = REQUIRED_EVIDENCE
    .filter(({ id }) => id !== "published-npm-package")
    .map(({ marker }) => marker)
    .join("\n");
  const result = checkRoadmapEvidence(source);

  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, [{
    id: "published-npm-package",
    label: "published npm package",
    marker: "https://www.npmjs.com/package/@okhp3/mermaid-diagram-bpmn",
  }]);
});

test("keeps route evidence distinct from external issue evidence", () => {
  const routeEvidence = REQUIRED_EVIDENCE.filter(({ id }) =>
    ["live-plugin-demo", "dsl-reference"].includes(id),
  );

  assert.deepEqual(routeEvidence.map(({ marker }) => marker), [
    'href="/mermaid-host-demo"',
    'href="/dsl"',
  ]);
});