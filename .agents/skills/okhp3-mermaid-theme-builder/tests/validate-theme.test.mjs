/**
 * validate-theme.test.mjs
 * Tests for validate-theme.mjs using node:test runner.
 * Run with: node --test tests/validate-theme.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateTheme } from "../scripts/validate-theme.mjs";
import { applyTheme } from "../scripts/apply-theme.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const palettesPath = join(__dirname, "..", "assets", "palettes.json");
const palettes = JSON.parse(readFileSync(palettesPath, "utf-8"));

const validCode = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "primaryTextColor": "#ffffff", "primaryBorderColor": "#0d3060", "lineColor": "#2563eb", "secondaryColor": "#0ea5e9", "tertiaryColor": "#e0f2fe", "background": "#f0f9ff", "mainBkg": "#dbeafe", "nodeBorder": "#1d4ed8", "clusterBkg": "#e0f2fe", "titleColor": "#1e3a5f", "edgeLabelBackground": "#f0f9ff", "fontFamily": "DM Sans, system-ui, sans-serif"}}}%%
flowchart TD
    A[Start] --> B{Decision}
    B --> C[Yes]`;

test("valid themed diagram — valid: true, no errors", () => {
  const result = validateTheme(validCode);
  assert.equal(result.valid, true, `Expected valid: true, errors: ${JSON.stringify(result.errors)}`);
  assert.deepEqual(result.errors, []);
});

test("valid themed diagram — has correct shape", () => {
  const result = validateTheme(validCode);
  assert.ok("valid" in result, "Result should have valid field");
  assert.ok("errors" in result, "Result should have errors field");
  assert.ok("warnings" in result, "Result should have warnings field");
  assert.ok(Array.isArray(result.errors), "errors should be array");
  assert.ok(Array.isArray(result.warnings), "warnings should be array");
});

test("invalid hex (#GGGGGG) — error with variable name", () => {
  const code = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#GGGGGG", "background": "#ffffff", "mainBkg": "#ffffff", "nodeBorder": "#888888", "titleColor": "#000000", "lineColor": "#888888"}}}%%\nflowchart TD\n  A --> B`;
  const result = validateTheme(code);
  assert.equal(result.valid, false);
  const errorHasPrimaryColor = result.errors.some((e) => e.includes("primaryColor"));
  assert.ok(errorHasPrimaryColor, `Expected error mentioning primaryColor, got: ${JSON.stringify(result.errors)}`);
});

test("invalid hex (#ZZZZZZ) — error with variable name", () => {
  const code = `%%{init: {"theme": "base", "themeVariables": {"titleColor": "#ZZXXYY"}}}%%\nflowchart TD\n  A --> B`;
  const result = validateTheme(code);
  assert.equal(result.valid, false);
  const errorHasTitleColor = result.errors.some((e) => e.includes("titleColor"));
  assert.ok(errorHasTitleColor, `Expected error mentioning titleColor, got: ${JSON.stringify(result.errors)}`);
});

test("missing px suffix on fontSize — error", () => {
  const code = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "fontSize": "14", "background": "#ffffff"}}}%%\nflowchart TD\n  A --> B`;
  const result = validateTheme(code);
  assert.equal(result.valid, false);
  const errorHasFontSize = result.errors.some((e) => e.includes("fontSize"));
  assert.ok(errorHasFontSize, `Expected error mentioning fontSize, got: ${JSON.stringify(result.errors)}`);
});

test("fontSize without px (number only) — error", () => {
  const code = `%%{init: {"theme": "base", "themeVariables": {"fontSize": "16"}}}%%\nflowchart TD\n  A --> B`;
  const result = validateTheme(code);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("fontSize")));
});

test("unknown variable name — warning (not error)", () => {
  const code = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "magicInvisibleColor": "#aabbcc"}}}%%\nflowchart TD\n  A --> B`;
  const result = validateTheme(code);
  const hasWarning = result.warnings.some((w) => w.includes("magicInvisibleColor"));
  assert.ok(hasWarning, `Expected warning for unknown variable, got warnings: ${JSON.stringify(result.warnings)}`);
});

test("theme is not base — error", () => {
  const code = `%%{init: {"theme": "dark", "themeVariables": {"primaryColor": "#1a4f8a"}}}%%\nflowchart TD\n  A --> B`;
  const result = validateTheme(code);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("base")));
});

test("no init block at all — error", () => {
  const code = `flowchart TD\n  A --> B`;
  const result = validateTheme(code);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test("init not on line 1 — error", () => {
  const code = `flowchart TD\n%%{init: {"theme": "base"}}%%\n  A --> B`;
  const result = validateTheme(code);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("line 1")));
});

test("all 7 named palettes applied to flowchart — each passes validation", () => {
  const flowchart = readFileSync(
    join(__dirname, "..", "assets", "fixtures", "flowchart-basic.mmd"),
    "utf-8"
  );
  for (const palette of palettes) {
    const themed = applyTheme(flowchart, palette);
    const result = validateTheme(themed);
    assert.equal(
      result.valid,
      true,
      `Palette "${palette.id}" failed validation: ${JSON.stringify(result.errors)}`
    );
  }
});

test("valid fontSize with px — no error", () => {
  const code = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "fontSize": "14px", "background": "#ffffff"}}}%%\nflowchart TD\n  A --> B`;
  const result = validateTheme(code);
  const fontSizeError = result.errors.some((e) => e.includes("fontSize"));
  assert.ok(!fontSizeError, `Should not error on valid fontSize "14px", errors: ${JSON.stringify(result.errors)}`);
});
