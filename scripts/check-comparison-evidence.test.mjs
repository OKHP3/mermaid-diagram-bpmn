#!/usr/bin/env node
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  checkComparisonEvidence,
  COMPARISON_SOURCE_PATH,
  REQUIRED_EVIDENCE,
} from "./check-comparison-evidence.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);

test("the public syntax comparison links every required evidence source", () => {
  const source = readFileSync(resolve(root, COMPARISON_SOURCE_PATH), "utf8");
  const result = checkComparisonEvidence(source);

  assert.equal(result.ok, true);
  assert.deepEqual(result.missing, []);
  assert.equal(result.checked.length, REQUIRED_EVIDENCE.length);
});

test("reports the exact missing source marker", () => {
  const source = "DFKI #7699 https://github.com/mermaid-js/mermaid/issues/7699";
  const result = checkComparisonEvidence(source);

  assert.equal(result.ok, false);
  assert.ok(result.missing.some((item) =>
    item.id === "derari" &&
    item.marker === "https://derari.github.io/mermaid-bpmn/editor.html",
  ));
});

test("does not treat a plain research citation as an evidence link", () => {
  const source = readFileSync(resolve(root, COMPARISON_SOURCE_PATH), "utf8")
    .replace("https://arxiv.org/abs/2507.11356", "");
  const result = checkComparisonEvidence(source);

  assert.equal(result.ok, false);
  assert.deepEqual(
    result.missing.filter((item) => item.id === "llm-research").map((item) => item.marker),
    ["https://arxiv.org/abs/2507.11356"],
  );
});