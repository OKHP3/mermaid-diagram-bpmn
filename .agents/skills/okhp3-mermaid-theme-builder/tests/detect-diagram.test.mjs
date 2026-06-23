/**
 * detect-diagram.test.mjs
 * Tests for detect-diagram.mjs using node:test runner.
 * Run with: node --test tests/detect-diagram.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { detectDiagramFamily } from "../scripts/detect-diagram.mjs";

test("detects flowchart LR", () => {
  const result = detectDiagramFamily("flowchart LR\n  A --> B");
  assert.equal(result.family, "flowchart");
  assert.equal(result.confidence, "high");
  assert.equal(result.warnings.length, 0);
});

test("detects flowchart TD", () => {
  const result = detectDiagramFamily("flowchart TD\n  A --> B\n  B --> C");
  assert.equal(result.family, "flowchart");
  assert.equal(result.confidence, "high");
});

test("detects graph TD (flowchart alias)", () => {
  const result = detectDiagramFamily("graph TD\n  A --> B");
  assert.equal(result.family, "flowchart");
  assert.equal(result.confidence, "high");
});

test("detects sequenceDiagram", () => {
  const result = detectDiagramFamily("sequenceDiagram\n  Alice->>Bob: Hi\n  Bob->>Alice: Hello");
  assert.equal(result.family, "sequenceDiagram");
  assert.equal(result.confidence, "high");
});

test("detects classDiagram", () => {
  const result = detectDiagramFamily("classDiagram\n  Animal <|-- Duck");
  assert.equal(result.family, "classDiagram");
  assert.equal(result.confidence, "high");
});

test("detects gantt", () => {
  const result = detectDiagramFamily("gantt\n  title A Plan\n  dateFormat YYYY-MM-DD");
  assert.equal(result.family, "gantt");
  assert.equal(result.confidence, "high");
});

test("detects stateDiagram", () => {
  const result = detectDiagramFamily("stateDiagram\n  [*] --> Active");
  assert.equal(result.family, "stateDiagram");
  assert.equal(result.confidence, "high");
});

test("detects stateDiagram-v2", () => {
  const result = detectDiagramFamily("stateDiagram-v2\n  [*] --> Active");
  assert.equal(result.family, "stateDiagram");
  assert.equal(result.confidence, "high");
});

test("detects erDiagram", () => {
  const result = detectDiagramFamily("erDiagram\n  CUSTOMER ||--o{ ORDER : places");
  assert.equal(result.family, "erDiagram");
  assert.equal(result.confidence, "high");
});

test("input with %%{init}%% prefix still detects correctly", () => {
  const code = `%%{init: {"theme": "dark"}}%%\nflowchart TD\n  A --> B`;
  const result = detectDiagramFamily(code);
  assert.equal(result.family, "flowchart");
  assert.equal(result.confidence, "high");
});

test("input with multi-line %%{init}%% prefix still detects", () => {
  const code = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a"}}}%%\nsequenceDiagram\n  Alice->>Bob: Hi`;
  const result = detectDiagramFamily(code);
  assert.equal(result.family, "sequenceDiagram");
  assert.equal(result.confidence, "high");
});

test("unknown keyword returns confidence low", () => {
  const result = detectDiagramFamily("notADiagram\n  something here");
  assert.equal(result.family, "unknown");
  assert.equal(result.confidence, "low");
  assert.ok(result.warnings.length > 0);
});

test("empty string returns unknown with low confidence", () => {
  const result = detectDiagramFamily("");
  assert.equal(result.family, "unknown");
  assert.equal(result.confidence, "low");
});

test("detects pie chart", () => {
  const result = detectDiagramFamily('pie\n  title Sales\n  "A": 40\n  "B": 60');
  assert.equal(result.family, "pie");
  assert.equal(result.confidence, "high");
});

test("detects mindmap", () => {
  const result = detectDiagramFamily("mindmap\n  root((Root))");
  assert.equal(result.family, "mindmap");
  assert.equal(result.confidence, "high");
});
