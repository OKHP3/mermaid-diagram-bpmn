/**
 * validate-bpmn-beta.test.mjs
 * Tests for the validate-bpmn-beta script.
 * Runs with: node --test tests/validate-bpmn-beta.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateBpmnBeta } from '../scripts/validate-bpmn-beta.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const examplesDir = resolve(__dirname, '../assets/canonical-examples');

// ─── Canonical Examples ────────────────────────────────────────────────────────

test('canonical: purchase-order-approval passes with zero errors', () => {
  const code = readFileSync(resolve(examplesDir, 'purchase-order-approval.bpmn-beta.mmd'), 'utf8');
  const result = validateBpmnBeta(code);
  assert.equal(result.errors.length, 0, `Expected 0 errors, got: ${JSON.stringify(result.errors)}`);
  assert.ok(result.valid);
});

test('canonical: support-ticket-triage passes with zero errors', () => {
  const code = readFileSync(resolve(examplesDir, 'support-ticket-triage.bpmn-beta.mmd'), 'utf8');
  const result = validateBpmnBeta(code);
  assert.equal(result.errors.length, 0, `Expected 0 errors, got: ${JSON.stringify(result.errors)}`);
  assert.ok(result.valid);
});

test('canonical: employee-onboarding passes with zero errors', () => {
  const code = readFileSync(resolve(examplesDir, 'employee-onboarding.bpmn-beta.mmd'), 'utf8');
  const result = validateBpmnBeta(code);
  assert.equal(result.errors.length, 0, `Expected 0 errors, got: ${JSON.stringify(result.errors)}`);
  assert.ok(result.valid);
});

test('canonical: cross-pool-collaboration passes with zero errors', () => {
  const code = readFileSync(resolve(examplesDir, 'cross-pool-collaboration.bpmn-beta.mmd'), 'utf8');
  const result = validateBpmnBeta(code);
  assert.equal(result.errors.length, 0, `Expected 0 errors, got: ${JSON.stringify(result.errors)}`);
  assert.ok(result.valid);
});

// ─── VR-001: Missing start event ──────────────────────────────────────────────

test('VR-001: missing start event produces error', () => {
  const code = `bpmn-beta
task:user t1 "Do Something"
end e1 "Done"
t1 --> e1`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-001');
  assert.ok(ruleError, `VR-001 error not found. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── VR-002: Missing end event ────────────────────────────────────────────────

test('VR-002: missing end event produces error', () => {
  const code = `bpmn-beta
start s1 "Begin"
task:user t1 "Do Something"
s1 --> t1`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-002');
  assert.ok(ruleError, `VR-002 error not found. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── VR-003: Flow referencing undeclared source ────────────────────────────────

test('VR-003: flow with undeclared source ID produces error', () => {
  const code = `bpmn-beta
start s1 "Start"
end e1 "End"
s1 --> ghost
ghost --> e1`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-003' || e.ruleId === 'VR-004');
  assert.ok(ruleError, `VR-003/VR-004 error not found. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── VR-004: Flow referencing undeclared target ────────────────────────────────

test('VR-004: flow with undeclared target ID produces error', () => {
  const code = `bpmn-beta
start s1 "Start"
end e1 "End"
s1 --> nowhere`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-004');
  assert.ok(ruleError, `VR-004 error not found. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── VR-005: XOR with only one outgoing flow ───────────────────────────────────

test('VR-005: XOR gateway with only one outgoing flow produces error', () => {
  const code = `bpmn-beta
start s1 "Start"
xor g1 "Decision?"
end e1 "End"
s1 --> g1
g1 --> e1: "only path"`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-005');
  assert.ok(ruleError, `VR-005 error not found. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── VR-006: XOR outgoing flows without condition labels ──────────────────────

test('VR-006: XOR gateway with unlabeled outgoing flow produces error', () => {
  const code = `bpmn-beta
start s1 "Start"
xor g1 "Decision?"
task:user t1 "Path A"
task:user t2 "Path B"
end e1 "End"
s1 --> g1
g1 --> t1
g1 --> t2: "path B"
t1 --> e1
t2 --> e1`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-006');
  assert.ok(ruleError, `VR-006 error not found. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── VR-007: Orphan element ────────────────────────────────────────────────────

test('VR-007: orphan element (not in any flow) produces error', () => {
  const code = `bpmn-beta
start s1 "Start"
task:user t1 "Connected Task"
task:user orphan "Orphan Task"
end e1 "End"
s1 --> t1
t1 --> e1`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-007');
  assert.ok(ruleError, `VR-007 error not found. Errors: ${JSON.stringify(result.errors)}`);
  assert.ok(ruleError.element === 'orphan', `Expected orphan element, got: ${ruleError.element}`);
});

// ─── VR-008: Sequence flow crossing pool boundary ─────────────────────────────

test('VR-008: sequence flow crossing pool boundary produces error', () => {
  const code = `bpmn-beta
pool buyer "Buyer" {
  start s1 "Start"
  task:user t1 "Create PO"
  s1 --> t1
}

pool vendor "Vendor" {
  task:receive t2 "Receive PO"
  end e1 "Done"
  t2 --> e1
}

t1 --> t2`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-008');
  assert.ok(ruleError, `VR-008 error not found. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── VR-009: Unbalanced brackets ─────────────────────────────────────────────

test('VR-009: unbalanced pool bracket produces parse error', () => {
  const code = `bpmn-beta
pool p1 "Process" {
  start s1 "Start"
  end e1 "End"
  s1 --> e1`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const hasError = result.errors.some(e =>
    e.ruleId === 'PARSE' && e.message.toLowerCase().includes('unclosed')
  );
  assert.ok(hasError, `Expected unclosed bracket error. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── VR-011: Reserved keyword as ID ──────────────────────────────────────────

test('VR-011: reserved keyword used as element ID produces error', () => {
  const code = `bpmn-beta
start s1 "Start"
task:user end "Process Request"
end e1 "Done"
s1 --> end
end --> e1`;
  const result = validateBpmnBeta(code);
  assert.ok(!result.valid);
  const ruleError = result.errors.find(e => e.ruleId === 'VR-011');
  assert.ok(ruleError, `VR-011 error not found. Errors: ${JSON.stringify(result.errors)}`);
});

// ─── Out-of-scope element keywords ───────────────────────────────────────────

test('out-of-scope keywords (event:message, event:timer) produce warnings, not errors', () => {
  const code = `bpmn-beta
start s1 "Start"
event:message ev1 "Message Received"
end e1 "Done"
s1 --> ev1
ev1 --> e1`;
  const result = validateBpmnBeta(code);
  const warningForExp = result.warnings.some(w => w.message.includes('experimental'));
  assert.ok(warningForExp, `Expected experimental keyword warning. Warnings: ${JSON.stringify(result.warnings)}`);
});

// ─── Valid minimal diagram ────────────────────────────────────────────────────

test('minimal valid diagram (start → task → end) passes', () => {
  const code = `bpmn-beta
start s1 "Begin"
task:user t1 "Do Work"
end e1 "Complete"
s1 --> t1
t1 --> e1`;
  const result = validateBpmnBeta(code);
  assert.ok(result.valid, `Expected valid, got errors: ${JSON.stringify(result.errors)}`);
  assert.equal(result.errors.length, 0);
});

// ─── Init block handling ──────────────────────────────────────────────────────

test('diagram with %%{init}%% block before bpmn-beta is valid', () => {
  const code = `%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#0d4f6c' } }}%%
bpmn-beta
start s1 "Begin"
task:service t1 "Process"
end e1 "Done"
s1 --> t1
t1 --> e1`;
  const result = validateBpmnBeta(code);
  assert.ok(result.valid, `Expected valid, got errors: ${JSON.stringify(result.errors)}`);
});
