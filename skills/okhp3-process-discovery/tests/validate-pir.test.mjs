/**
 * validate-pir.test.mjs
 * Tests for PIR validation, completeness scoring, and stakeholder register generation.
 *
 * Run: node --test skills/okhp3-process-discovery/tests/validate-pir.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dir, '..');

// Import scripts
const { validatePir } = await import(join(SKILL_ROOT, 'scripts/validate-pir.mjs'));
const { scoreIntakeCompleteness } = await import(join(SKILL_ROOT, 'scripts/score-intake-completeness.mjs'));
const { generateStakeholderRegister } = await import(join(SKILL_ROOT, 'scripts/generate-stakeholder-register.mjs'));

// ─── Minimal YAML parser (key: value, nested objects, arrays with -) ─────────
// Handles the specific structure used in PIR fixture files:
//   - top-level scalars: key: value
//   - nested objects: key:\n  subkey: value
//   - arrays of objects: key:\n  - field: value\n    field2: value2

function parseYamlSimple(text) {
  const lines = text.split('\n');
  let pos = 0;

  function getIndent(line) {
    if (line.trim() === '' || line.trim().startsWith('#')) return -1;
    return line.search(/\S/);
  }

  function coerce(v) {
    if (v === 'null' || v === '~') return null;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return v;
  }

  function stripQuotes(v) {
    return v.replace(/^["']|["']$/g, '');
  }

  function skipEmpty() {
    while (pos < lines.length && (lines[pos].trim() === '' || lines[pos].trim().startsWith('#'))) {
      pos++;
    }
  }

  function peek() {
    let i = pos;
    while (i < lines.length && (lines[i].trim() === '' || lines[i].trim().startsWith('#'))) i++;
    return i < lines.length ? lines[i] : null;
  }

  function parseObject(minIndent) {
    const obj = {};
    while (true) {
      skipEmpty();
      if (pos >= lines.length) break;
      const line = lines[pos];
      const indent = getIndent(line);
      if (indent < minIndent) break;
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) break;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) { pos++; continue; }

      const key = trimmed.slice(0, colonIdx).trim();
      const rest = stripQuotes(trimmed.slice(colonIdx + 1).trim());
      pos++;

      if (rest !== '' && rest !== 'null' && rest !== '~') {
        obj[key] = coerce(rest);
      } else if (rest === 'null' || rest === '~') {
        obj[key] = null;
      } else {
        // Empty value — look ahead
        const nextLine = peek();
        if (nextLine === null) {
          obj[key] = null;
          continue;
        }
        const nextIndent = getIndent(nextLine);
        const nextTrimmed = nextLine.trim();
        if (nextIndent > indent && nextTrimmed.startsWith('- ')) {
          obj[key] = parseArray(nextIndent);
        } else if (nextIndent > indent) {
          obj[key] = parseObject(nextIndent);
        } else {
          obj[key] = null;
        }
      }
    }
    return obj;
  }

  function parseArray(minIndent) {
    const arr = [];
    while (true) {
      skipEmpty();
      if (pos >= lines.length) break;
      const line = lines[pos];
      const indent = getIndent(line);
      if (indent < minIndent) break;
      const trimmed = line.trim();
      if (!trimmed.startsWith('- ')) break;

      // First field is inline after `- `
      const firstContent = trimmed.slice(2);
      const item = {};
      const ci = firstContent.indexOf(':');
      if (ci !== -1) {
        const k = firstContent.slice(0, ci).trim();
        const v = stripQuotes(firstContent.slice(ci + 1).trim());
        item[k] = coerce(v);
      }
      pos++;

      // Continuation fields are indented more than the `- ` line
      while (true) {
        skipEmpty();
        if (pos >= lines.length) break;
        const nextLine = lines[pos];
        const nextIndent = getIndent(nextLine);
        const nextTrimmed = nextLine.trim();
        if (nextIndent <= indent) break;
        if (nextTrimmed.startsWith('- ')) break;
        const ci2 = nextTrimmed.indexOf(':');
        if (ci2 !== -1) {
          const k = nextTrimmed.slice(0, ci2).trim();
          const v = stripQuotes(nextTrimmed.slice(ci2 + 1).trim());
          item[k] = coerce(v);
        }
        pos++;
      }
      arr.push(item);
    }
    return arr;
  }

  return parseObject(0);
}

function readFixture(name) {
  const raw = readFileSync(join(SKILL_ROOT, 'assets/fixtures', name), 'utf8');
  return parseYamlSimple(raw);
}

// ─── Fixture loading ──────────────────────────────────────────────────────────

test('purchase-approval fixture parses without error', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  assert.ok(pir.process_name, 'process_name must be present in fixture');
  assert.ok(pir.process_id, 'process_id must be present in fixture');
});

test('support-triage fixture parses without error', () => {
  const pir = readFixture('intake-support-triage.yaml');
  assert.ok(pir.process_name, 'process_name must be present in fixture');
  assert.ok(pir.process_id, 'process_id must be present in fixture');
});

test('quote-to-order fixture parses without error', () => {
  const pir = readFixture('intake-quote-to-order.yaml');
  assert.ok(pir.process_name, 'process_name must be present in fixture');
  assert.ok(pir.process_id, 'process_id must be present in fixture');
});

// ─── validatePir — fixture validation ────────────────────────────────────────

test('validatePir passes on purchase-approval fixture', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  const result = validatePir(pir);
  assert.ok(result.valid, `Expected valid PIR, got errors: ${result.errors.join('; ')}`);
});

test('validatePir passes on support-triage fixture', () => {
  const pir = readFixture('intake-support-triage.yaml');
  const result = validatePir(pir);
  assert.ok(result.valid, `Expected valid PIR, got errors: ${result.errors.join('; ')}`);
});

test('validatePir passes on quote-to-order fixture', () => {
  const pir = readFixture('intake-quote-to-order.yaml');
  const result = validatePir(pir);
  assert.ok(result.valid, `Expected valid PIR, got errors: ${result.errors.join('; ')}`);
});

// ─── validatePir — error detection ───────────────────────────────────────────

test('validatePir returns error for empty object', () => {
  const result = validatePir({});
  assert.ok(!result.valid, 'Empty object must fail validation');
  assert.ok(result.errors.length > 0, 'Empty object must produce errors');
});

test('validatePir returns error for null input', () => {
  const result = validatePir(null);
  assert.ok(!result.valid, 'null input must fail validation');
  assert.ok(result.errors.some(e => e.includes('non-null object')));
});

test('validatePir catches missing process_name', () => {
  const result = validatePir({
    pir_version: '0.1', process_id: 'p1', process_owner: 'Mgr',
    department: 'IT', elicitation_method: 'interview', status: 'draft',
    trigger: { description: 'Something starts', event_type: 'manual' },
    actors: [
      { role_id: 'a1', role_name: 'Requester', type: 'initiator' },
      { role_id: 'a2', role_name: 'Approver', type: 'approver' },
    ],
    inputs: [{ id: 'i1', name: 'Request Form' }],
    outputs: [{ id: 'o1', name: 'Approval' }],
    steps: [
      { id: 's1', description: 'Submit form', actor_role_id: 'a1' },
      { id: 's2', description: 'Review form', actor_role_id: 'a2' },
      { id: 's3', description: 'Approve form', actor_role_id: 'a2' },
    ],
  });
  assert.ok(result.errors.some(e => e.includes('process_name')), 'Must report missing process_name');
});

test('validatePir catches invalid elicitation_method', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  pir.elicitation_method = 'brainstorm';
  const result = validatePir(pir);
  assert.ok(!result.valid, 'Invalid elicitation_method must fail');
  assert.ok(result.errors.some(e => e.includes('elicitation_method')));
});

test('validatePir catches insufficient actors (< 2)', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  pir.actors = [{ role_id: 'r1', role_name: 'Solo', type: 'initiator' }];
  const result = validatePir(pir);
  assert.ok(!result.valid, 'Single actor must fail validation');
  assert.ok(result.errors.some(e => e.includes('at least 2')));
});

test('validatePir catches missing initiator', () => {
  const result = validatePir({
    pir_version: '0.1', process_id: 'p1', process_name: 'Test', process_owner: 'Mgr',
    department: 'IT', elicitation_method: 'interview', status: 'draft',
    trigger: { description: 'Starts', event_type: 'manual' },
    actors: [
      { role_id: 'a1', role_name: 'Performer A', type: 'performer' },
      { role_id: 'a2', role_name: 'Performer B', type: 'performer' },
    ],
    inputs: [{ id: 'i1', name: 'Input' }],
    outputs: [{ id: 'o1', name: 'Output' }],
    steps: [
      { id: 's1', description: 'Step 1', actor_role_id: 'a1' },
      { id: 's2', description: 'Step 2', actor_role_id: 'a2' },
      { id: 's3', description: 'Step 3', actor_role_id: 'a1' },
    ],
  });
  assert.ok(!result.valid, 'Missing initiator must fail validation');
  assert.ok(result.errors.some(e => e.includes('initiator')));
});

test('validatePir catches fewer than 3 steps', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  pir.steps = [
    { id: 's1', description: 'Only step', actor_role_id: 'req' },
    { id: 's2', description: 'Second step', actor_role_id: 'mgr' },
  ];
  const result = validatePir(pir);
  assert.ok(!result.valid, 'Fewer than 3 steps must fail validation');
  assert.ok(result.errors.some(e => e.includes('3')));
});

test('validatePir catches duplicate role_ids', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  pir.actors = [
    { role_id: 'dup', role_name: 'Actor A', type: 'initiator' },
    { role_id: 'dup', role_name: 'Actor B', type: 'approver' },
  ];
  const result = validatePir(pir);
  assert.ok(!result.valid);
  assert.ok(result.errors.some(e => e.includes('duplicate')));
});

test('validatePir catches invalid control type', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  pir.controls = [{ id: 'c1', type: 'mystery', description: 'Some control' }];
  const result = validatePir(pir);
  assert.ok(!result.valid);
  assert.ok(result.errors.some(e => e.includes('type') && e.includes('mystery')));
});

// ─── scoreIntakeCompleteness — score bands ────────────────────────────────────

test('scoreIntakeCompleteness returns 0 for empty object', () => {
  const result = scoreIntakeCompleteness({});
  assert.equal(result.score, 0, 'Empty object must score 0');
  assert.equal(result.ready_for_narrative, false, 'Empty object must not be ready');
});

test('scoreIntakeCompleteness returns 100 for complete purchase-approval fixture', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  const result = scoreIntakeCompleteness(pir);
  assert.equal(result.score, 100, `Expected score 100, got ${result.score}`);
  assert.equal(result.ready_for_narrative, true, 'Complete fixture must be ready for narrative');
});

test('scoreIntakeCompleteness returns 100 for complete support-triage fixture', () => {
  const pir = readFixture('intake-support-triage.yaml');
  const result = scoreIntakeCompleteness(pir);
  assert.equal(result.score, 100, `Expected score 100, got ${result.score}`);
  assert.equal(result.ready_for_narrative, true);
});

test('scoreIntakeCompleteness returns 100 for complete quote-to-order fixture', () => {
  const pir = readFixture('intake-quote-to-order.yaml');
  const result = scoreIntakeCompleteness(pir);
  assert.equal(result.score, 100, `Expected score 100, got ${result.score}`);
  assert.equal(result.ready_for_narrative, true);
});

test('scoreIntakeCompleteness score < 70 sets ready_for_narrative false', () => {
  const pir = {
    process_name: 'Thin PIR',
    elicitation_method: 'interview',
    trigger: { description: 'Someone starts it', event_type: 'manual' },
    actors: [
      { role_id: 'a1', role_name: 'User', type: 'initiator' },
      { role_id: 'a2', role_name: 'Approver', type: 'approver' },
    ],
    // Missing: inputs, outputs, steps, exceptions, business_rules, systems, controls
  };
  const result = scoreIntakeCompleteness(pir);
  assert.ok(result.score < 70, `Score ${result.score} should be below 70`);
  assert.equal(result.ready_for_narrative, false);
});

test('scoreIntakeCompleteness breakdown has all expected sections', () => {
  const result = scoreIntakeCompleteness({});
  const expectedSections = [
    'process_name', 'elicitation_method', 'trigger', 'actors',
    'inputs', 'outputs', 'steps', 'exceptions',
    'business_rules', 'systems', 'controls',
  ];
  for (const section of expectedSections) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(result.breakdown, section),
      `breakdown must include section: ${section}`
    );
  }
});

test('scoreIntakeCompleteness all breakdown possible values sum to 100', () => {
  const result = scoreIntakeCompleteness({});
  const total = Object.values(result.breakdown).reduce((sum, s) => sum + s.possible, 0);
  assert.equal(total, 100, `breakdown possible values must sum to 100, got ${total}`);
});

test('scoreIntakeCompleteness partial trigger scores half points', () => {
  const pir = { trigger: { description: 'Only description, no event_type' } };
  const result = scoreIntakeCompleteness(pir);
  assert.ok(result.breakdown.trigger.earned > 0, 'Partial trigger must earn some points');
  assert.ok(result.breakdown.trigger.earned < result.breakdown.trigger.possible, 'Partial trigger must not earn full points');
});

// ─── generateStakeholderRegister ─────────────────────────────────────────────

test('generateStakeholderRegister returns valid register for purchase-approval fixture', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  const result = generateStakeholderRegister(pir);
  assert.ok(result.valid, `Expected valid register, got errors: ${result.errors.join('; ')}`);
  assert.ok(result.register, 'register must be present');
  assert.ok(Array.isArray(result.register.stakeholders), 'stakeholders must be an array');
});

test('generateStakeholderRegister derives one stakeholder per actor', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  const result = generateStakeholderRegister(pir);
  assert.equal(
    result.register.stakeholders.length,
    pir.actors.length,
    'register must have the same count as PIR actors'
  );
});

test('generateStakeholderRegister maps role_id to stakeholder_id', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  const result = generateStakeholderRegister(pir);
  const ids = result.register.stakeholders.map(s => s.stakeholder_id);
  const actorIds = pir.actors.map(a => a.role_id);
  for (const id of actorIds) {
    assert.ok(ids.includes(id), `stakeholder_id "${id}" must appear in register`);
  }
});

test('generateStakeholderRegister assigns engagement_strategy based on role', () => {
  const pir = readFixture('intake-purchase-approval.yaml');
  const result = generateStakeholderRegister(pir);
  const approver = result.register.stakeholders.find(s => s.primary_role === 'approver');
  assert.ok(approver, 'Must have an approver entry');
  assert.ok(
    approver.engagement_strategy.toLowerCase().includes('consult'),
    'Approver engagement strategy must include "Consult"'
  );
  const initiator = result.register.stakeholders.find(s => s.primary_role === 'initiator');
  assert.ok(initiator, 'Must have an initiator entry');
  assert.ok(
    initiator.engagement_strategy.toLowerCase().includes('collaborate'),
    'Initiator engagement strategy must include "Collaborate"'
  );
});

test('generateStakeholderRegister fails for empty actors array', () => {
  const result = generateStakeholderRegister({ process_id: 'p1', actors: [] });
  assert.ok(!result.valid, 'Empty actors must fail');
  assert.ok(result.errors.length > 0);
});

test('generateStakeholderRegister fails for missing actors key', () => {
  const result = generateStakeholderRegister({ process_id: 'p1' });
  assert.ok(!result.valid, 'Missing actors must fail');
});

test('generateStakeholderRegister register has expected top-level fields', () => {
  const pir = readFixture('intake-support-triage.yaml');
  const result = generateStakeholderRegister(pir);
  assert.ok(result.valid);
  const reg = result.register;
  assert.equal(reg.stakeholder_register_version, '0.1');
  assert.ok(isNonEmptyString(reg.process_id), 'process_id must be present');
  assert.ok(isNonEmptyString(reg.generated_from_pir), 'generated_from_pir must be present');
  assert.ok(isNonEmptyString(reg.generated_date), 'generated_date must be present');
});

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

test('generateStakeholderRegister works for all three canonical fixtures', () => {
  const fixtures = [
    'intake-purchase-approval.yaml',
    'intake-support-triage.yaml',
    'intake-quote-to-order.yaml',
  ];
  for (const name of fixtures) {
    const pir = readFixture(name);
    const result = generateStakeholderRegister(pir);
    assert.ok(result.valid, `${name}: expected valid register, got: ${result.errors.join('; ')}`);
    assert.ok(result.register.stakeholders.length > 0, `${name}: stakeholders must be non-empty`);
  }
});
