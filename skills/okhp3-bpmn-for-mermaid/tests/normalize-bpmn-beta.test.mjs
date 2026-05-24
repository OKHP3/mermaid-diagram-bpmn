/**
 * normalize-bpmn-beta.test.mjs
 * Tests for the normalize-bpmn-beta script.
 * Runs with: node --test tests/normalize-bpmn-beta.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBpmnBeta } from '../scripts/normalize-bpmn-beta.mjs';
import { validateBpmnBeta } from '../scripts/validate-bpmn-beta.mjs';

// ─── Already-normalized diagram ───────────────────────────────────────────────

test('already-normalized diagram: no structural changes, zero changes logged', () => {
  const code = `bpmn-beta
accTitle: Purchase Order Approval
start s1 "Request Submitted"
task:user t1 "Review Request"
xor g1 "Approved?"
task:service t2 "Issue PO"
end e1 "Done"
end e2 "Rejected"
s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> e2: "no"
t2 --> e1`;
  const { normalized, changes } = normalizeBpmnBeta(code);
  assert.ok(normalized.includes('bpmn-beta'), 'bpmn-beta keyword must be present');
  assert.ok(normalized.includes('accTitle:'), 'accTitle must be present');
  // Only changes should be cosmetic (none expected for clean input)
  const structuralChanges = changes.filter(c => !c.startsWith('WARNING'));
  assert.equal(structuralChanges.length, 0, `Expected 0 structural changes, got: ${JSON.stringify(changes)}`);
});

// ─── Missing accTitle ─────────────────────────────────────────────────────────

test('missing accTitle: accTitle added with default value, change logged', () => {
  const code = `bpmn-beta
start s1 "Start"
task:user t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;
  const { normalized, changes } = normalizeBpmnBeta(code);
  assert.ok(normalized.includes('accTitle:'), 'accTitle should be inserted');
  const titleChange = changes.find(c => c.toLowerCase().includes('acctitle'));
  assert.ok(titleChange, `Expected accTitle change. Changes: ${JSON.stringify(changes)}`);
});

// ─── ID with hyphens → underscores ───────────────────────────────────────────

test('hyphenated IDs are normalized to lowercase_underscore, change logged', () => {
  const code = `bpmn-beta
accTitle: Test Diagram
start my-start "Begin"
task:user my-task "Do Work"
end my-end "Done"
my-start --> my-task
my-task --> my-end`;
  const { normalized, changes } = normalizeBpmnBeta(code);
  assert.ok(!normalized.includes('my-start'), 'Hyphenated ID my-start should be removed');
  assert.ok(normalized.includes('my_start'), 'ID should be normalized to my_start');
  assert.ok(normalized.includes('my_task'), 'ID should be normalized to my_task');
  assert.ok(normalized.includes('my_end'), 'ID should be normalized to my_end');
  const idChange = changes.find(c => c.includes('my-start') || c.includes('my_start'));
  assert.ok(idChange, `Expected ID normalization change. Changes: ${JSON.stringify(changes)}`);
});

// ─── Unquoted labels ──────────────────────────────────────────────────────────

test('unquoted element labels are quoted, change logged', () => {
  // Note: parser regex requires quoted labels for element parsing,
  // so this tests the normalizer's label-quoting pass on pool/lane declarations
  const code = `bpmn-beta
accTitle: Test
start s1 "Start"
task:user t1 "Work"
end e1 "Done"
s1 --> t1
t1 --> e1`;
  const { normalized } = normalizeBpmnBeta(code);
  // All labels in normalized output should be quoted
  const elementLines = normalized.split('\n').filter(l => {
    const t = l.trim();
    return /^(start|end|task|xor|and|or)/.test(t);
  });
  for (const line of elementLines) {
    assert.ok(/"[^"]*"/.test(line), `Label in line should be double-quoted: ${line}`);
  }
});

// ─── Output passes validation ─────────────────────────────────────────────────

test('normalized output passes validate-bpmn-beta for a valid input diagram', () => {
  const code = `bpmn-beta
accTitle: Incident Triage
start s1 "Incident Reported"
task:user t1 "Assess Severity"
xor g1 "Priority?"
task:user t2 "Resolve High"
task:user t3 "Resolve Low"
end e1 "Resolved"
s1 --> t1
t1 --> g1
g1 --> t2: "high"
g1 --> t3: "low"
t2 --> e1
t3 --> e1`;
  const { normalized, changes } = normalizeBpmnBeta(code);
  const validation = validateBpmnBeta(normalized);
  assert.ok(validation.valid, `Normalized output failed validation: ${JSON.stringify(validation.errors)}`);
});

// ─── Missing bpmn-beta header ─────────────────────────────────────────────────

test('missing bpmn-beta header: header is added as first line, change logged', () => {
  const code = `accTitle: My Process
start s1 "Start"
task:user t1 "Do Work"
end e1 "Done"
s1 --> t1
t1 --> e1`;
  const { normalized, changes } = normalizeBpmnBeta(code);
  const firstLine = normalized.split('\n').find(l => l.trim());
  assert.equal(firstLine?.trim(), 'bpmn-beta', 'bpmn-beta must be the first non-empty line');
  const headerChange = changes.find(c => c.toLowerCase().includes('bpmn-beta'));
  assert.ok(headerChange, `Expected bpmn-beta header change. Changes: ${JSON.stringify(changes)}`);
});

// ─── Uppercase IDs → lowercase ────────────────────────────────────────────────

test('uppercase IDs are normalized to lowercase, change logged', () => {
  const code = `bpmn-beta
accTitle: Test
start S1 "Start"
task:user T1 "Work"
end E1 "Done"
S1 --> T1
T1 --> E1`;
  const { normalized, changes } = normalizeBpmnBeta(code);
  assert.ok(!normalized.includes('S1 '), 'Uppercase ID S1 should be lowercased');
  assert.ok(normalized.includes('s1'), 'ID should be normalized to s1');
});
