/**
 * detect-diagram.test.mjs
 * Tests for the detect-diagram.mjs script.
 *
 * Run: node --test skills/okhp3-mermaid-theme-builder/tests/detect-diagram.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectDiagram } from '../scripts/detect-diagram.mjs';

test('detects flowchart', () => {
  const result = detectDiagram('flowchart TD\n  A --> B');
  assert.equal(result.family, 'flowchart');
  assert.equal(result.keyword, 'flowchart');
  assert.equal(result.confidence, 'high');
  assert.equal(result.warnings.length, 0);
});

test('detects graph as flowchart family', () => {
  const result = detectDiagram('graph LR\n  A --> B');
  assert.equal(result.family, 'flowchart');
  assert.equal(result.keyword, 'graph');
});

test('detects sequenceDiagram', () => {
  const result = detectDiagram('sequenceDiagram\n  A->>B: Hello');
  assert.equal(result.family, 'sequence');
  assert.ok(result.warnings.some((w) => w.includes('partial')), 'Should warn about partial support');
});

test('detects classDiagram', () => {
  const result = detectDiagram('classDiagram\n  class Foo {}');
  assert.equal(result.family, 'class');
});

test('detects gantt with reduced compat warning', () => {
  const result = detectDiagram('gantt\n  title Plan');
  assert.equal(result.family, 'gantt');
  assert.ok(result.warnings.length > 0, 'Gantt should produce a reduced-compat warning');
});

test('detects erDiagram', () => {
  const result = detectDiagram('erDiagram\n  CUSTOMER ||--o{ ORDER : places');
  assert.equal(result.family, 'er');
});

test('detects stateDiagram-v2', () => {
  const result = detectDiagram('stateDiagram-v2\n  [*] --> Active');
  assert.equal(result.family, 'state');
});

test('detects stateDiagram (legacy)', () => {
  const result = detectDiagram('stateDiagram\n  [*] --> Active');
  assert.equal(result.family, 'state');
});

test('detects pie with reduced compat warning', () => {
  const result = detectDiagram('pie\n  "A" : 30');
  assert.equal(result.family, 'pie');
  assert.ok(result.warnings.length > 0);
});

test('detects journey', () => {
  const result = detectDiagram('journey\n  title My Journey');
  assert.equal(result.family, 'journey');
});

test('detects bpmn-beta with OKHP3 prototype warning', () => {
  const result = detectDiagram('bpmn-beta\nstart s1 "Start"');
  assert.equal(result.family, 'bpmn-beta');
  assert.equal(result.keyword, 'bpmn-beta');
  assert.ok(result.warnings.some((w) => w.includes('prototype')), 'Should warn about prototype status');
});

test('detects mindmap with reduced compat warning', () => {
  const result = detectDiagram('mindmap\n  root((Main))');
  assert.equal(result.family, 'mindmap');
  assert.ok(result.warnings.length > 0);
});

test('detects xychart-beta', () => {
  const result = detectDiagram('xychart-beta\n  x-axis [A, B]');
  assert.equal(result.family, 'xychart-beta');
});

test('strips code fences before detection', () => {
  const source = '```mermaid\nflowchart LR\n  A --> B\n```';
  const result = detectDiagram(source);
  assert.equal(result.family, 'flowchart');
});

test('strips %%{init}%% block before detection', () => {
  const source = "%%{init: {'theme': 'base'}}%%\nflowchart TD\n  A --> B";
  const result = detectDiagram(source);
  assert.equal(result.family, 'flowchart');
});

test('returns unknown for unrecognized keyword with low confidence', () => {
  const result = detectDiagram('notadiagram\n  something');
  assert.equal(result.family, 'unknown');
  assert.equal(result.confidence, 'low');
  assert.ok(result.warnings.length > 0);
});

test('returns unknown for empty input with warning', () => {
  const result = detectDiagram('');
  assert.equal(result.family, 'unknown');
  assert.equal(result.confidence, 'low');
  assert.ok(result.warnings.length > 0);
});

test('detects flowchart from fixture file', async () => {
  const { readFileSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dir = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(__dir, '../assets/fixtures/flowchart-basic.mmd'), 'utf-8');
  const result = detectDiagram(source);
  assert.equal(result.family, 'flowchart');
  assert.equal(result.confidence, 'high');
});

test('detects sequence from fixture file', async () => {
  const { readFileSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dir = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(__dir, '../assets/fixtures/sequence-basic.mmd'), 'utf-8');
  const result = detectDiagram(source);
  assert.equal(result.family, 'sequence');
});

test('detects state from fixture file', async () => {
  const { readFileSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dir = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(__dir, '../assets/fixtures/state-basic.mmd'), 'utf-8');
  const result = detectDiagram(source);
  assert.equal(result.family, 'state');
});

test('detects gantt from fixture file', async () => {
  const { readFileSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dir = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(__dir, '../assets/fixtures/gantt-basic.mmd'), 'utf-8');
  const result = detectDiagram(source);
  assert.equal(result.family, 'gantt');
});
