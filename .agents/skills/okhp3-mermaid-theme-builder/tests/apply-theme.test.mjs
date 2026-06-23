/**
 * apply-theme.test.mjs
 * Tests for apply-theme.mjs using node:test runner.
 * Run with: node --test tests/apply-theme.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { applyTheme } from "../scripts/apply-theme.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "assets", "fixtures");

const flowchart = readFileSync(join(fixturesDir, "flowchart-basic.mmd"), "utf-8");

test("apply overkill-hill to flowchart fixture — init on line 1", () => {
  const result = applyTheme(flowchart, "overkill-hill");
  const firstLine = result.split("\n")[0];
  assert.ok(firstLine.startsWith("%%{init:"), `First line should be init block, got: ${firstLine}`);
});

test("apply overkill-hill to flowchart fixture — theme is base", () => {
  const result = applyTheme(flowchart, "overkill-hill");
  assert.ok(result.includes('"theme": "base"'), `Result should contain "theme": "base"`);
});

test("apply overkill-hill to flowchart fixture — all required vars present", () => {
  const result = applyTheme(flowchart, "overkill-hill");
  const required = ["primaryColor", "primaryTextColor", "background", "mainBkg", "nodeBorder", "titleColor", "lineColor"];
  for (const v of required) {
    assert.ok(result.includes(`"${v}"`), `Result should contain variable "${v}"`);
  }
});

test("apply ocean-depth — init block contains correct primaryColor", () => {
  const result = applyTheme(flowchart, "ocean-depth");
  assert.ok(result.includes('"primaryColor": "#1a4f8a"'), `Expected ocean-depth primaryColor #1a4f8a`);
});

test("apply askjamie — init block contains correct lineColor", () => {
  const result = applyTheme(flowchart, "askjamie");
  assert.ok(result.includes('"lineColor": "#2d6f7e"'), `Expected askjamie lineColor #2d6f7e`);
});

test("diagram already has init — old block is replaced, not doubled", () => {
  const codeWithInit = `%%{init: {"theme": "dark"}}%%\nflowchart LR\n  A --> B`;
  const result = applyTheme(codeWithInit, "forest-sage");
  const initMatches = result.match(/%%\{init:/g) || [];
  assert.equal(initMatches.length, 1, "Should have exactly one %%{init: block");
  assert.ok(!result.includes('"theme": "dark"'), "Old theme should be replaced");
  assert.ok(result.includes('"theme": "base"'), "New theme should be base");
});

test("diagram with complex init block — replaced cleanly", () => {
  const codeWithInit = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#ff0000"}}}%%\nsequenceDiagram\n  Alice->>Bob: Hi`;
  const result = applyTheme(codeWithInit, "violet-mist");
  const initMatches = result.match(/%%\{init:/g) || [];
  assert.equal(initMatches.length, 1, "Should have exactly one %%{init: block");
  assert.ok(result.includes('"primaryColor": "#6d28d9"'), "Should use violet-mist primaryColor");
});

test("palette missing required variable — throws error with variable name", () => {
  const badPalette = {
    id: "test-bad",
    display: "Bad Palette",
    themeVariables: {
      primaryColor: "#123456",
    },
  };
  assert.throws(
    () => applyTheme(flowchart, badPalette),
    (err) => {
      assert.ok(err.message.includes("primaryTextColor"), `Error should mention missing variable name, got: ${err.message}`);
      return true;
    }
  );
});

test("invalid palette ID — throws error", () => {
  assert.throws(
    () => applyTheme(flowchart, "nonexistent-palette"),
    /not found/
  );
});

test("apply glee-fully — contains correct fontFamily", () => {
  const result = applyTheme(flowchart, "glee-fully");
  assert.ok(result.includes("Open Sans"), `Expected glee-fully fontFamily to contain Open Sans`);
});

test("apply theme preserves diagram code content", () => {
  const result = applyTheme(flowchart, "slate-ember");
  assert.ok(result.includes("flowchart TD"), "Result should contain original flowchart declaration");
  assert.ok(result.includes('A(["Start"])') || result.includes("A"), "Result should contain diagram content");
});

test("apply all 7 palettes without errors", () => {
  const ids = ["ocean-depth", "forest-sage", "slate-ember", "violet-mist", "overkill-hill", "glee-fully", "askjamie"];
  for (const id of ids) {
    assert.doesNotThrow(() => applyTheme(flowchart, id), `Should not throw for palette: ${id}`);
  }
});
