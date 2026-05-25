/**
 * validate-pns.test.mjs
 * Behavioral tests for all 5 okhp3-process-narrative scripts.
 * Tests fixture validation, V-rule violations, quality scoring, SIPOC, RACI, and rule extraction.
 *
 * Run: node --test tests/validate-pns.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseYaml } from '../scripts/parse-yaml-minimal.mjs';
import { validatePns } from '../scripts/validate-pns.mjs';
import { scorePnsQuality } from '../scripts/score-pns-quality.mjs';
import { generateSipoc } from '../scripts/generate-sipoc.mjs';
import { generateRaci } from '../scripts/generate-raci.mjs';
import { extractBusinessRules } from '../scripts/extract-business-rules.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(__dir, '../assets/fixtures');

function loadFixture(name) {
  const text = readFileSync(join(FIXTURE_DIR, name), 'utf-8');
  return parseYaml(text);
}

const FIXTURES = {
  purchaseApproval: loadFixture('pns-purchase-approval.yaml'),
  supportTriage: loadFixture('pns-support-triage.yaml'),
  quoteToOrder: loadFixture('pns-quote-to-order.yaml'),
};

// ─── Fixture parsing sanity ───────────────────────────────────────────────────

test('purchase-approval fixture parses correctly', () => {
  const pns = FIXTURES.purchaseApproval;
  assert.equal(pns.process_id, 'proc-001');
  assert.equal(pns.process_name, 'Purchase Approval');
  assert.ok(pns.sections, 'sections must be present');
  assert.ok(pns.sections.process_box, 'process_box must be present');
});

test('support-triage fixture parses correctly', () => {
  const pns = FIXTURES.supportTriage;
  assert.equal(pns.process_id, 'proc-002');
  assert.equal(pns.process_name, 'Support Triage');
  assert.ok(pns.sections.activity_sequence, 'activity_sequence must be present');
});

test('quote-to-order fixture parses correctly', () => {
  const pns = FIXTURES.quoteToOrder;
  assert.equal(pns.process_id, 'proc-003');
  assert.equal(pns.process_name, 'Quote to Order');
  assert.ok(pns.sections.kpis, 'kpis must be present');
});

test('all three fixtures have 11 authored sections + top-level validation', () => {
  const AUTHORED_SECTIONS = [
    'process_box', 'activity_sequence', 'roles_and_raci', 'business_rules',
    'decision_points', 'exception_paths', 'kpis', 'systems_and_integrations',
    'controls_and_compliance', 'open_questions', 'revision_history',
  ];
  for (const [name, pns] of Object.entries(FIXTURES)) {
    for (const key of AUTHORED_SECTIONS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(pns.sections || {}, key),
        `${name} fixture missing section: ${key}`
      );
    }
    assert.ok(
      Object.prototype.hasOwnProperty.call(pns, 'validation'),
      `${name} fixture missing top-level validation block`
    );
  }
});

// ─── V1–V7 validation — fixtures pass ────────────────────────────────────────

for (const [fixtureName, pns] of Object.entries(FIXTURES)) {
  test(`validatePns: ${fixtureName} passes with zero errors`, () => {
    const result = validatePns(pns);
    assert.deepEqual(result.errors, [], `${fixtureName} should have no errors, got: ${result.errors.join('; ')}`);
  });

  test(`validatePns: ${fixtureName} fires all 7 rules`, () => {
    const result = validatePns(pns);
    const expected = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'];
    for (const rule of expected) {
      assert.ok(result.rules_fired.includes(rule), `${fixtureName} should fire rule ${rule}`);
    }
  });

  test(`validatePns: ${fixtureName} valid = true`, () => {
    const result = validatePns(pns);
    assert.equal(result.valid, true, `${fixtureName} should be valid`);
  });
}

// ─── Deliberate V-rule violations ─────────────────────────────────────────────

test('V1: missing process_name triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.process_name = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V1]') && e.includes('process_name')));
});

test('V1: missing process_id triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.process_id = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V1]') && e.includes('process_id')));
});

test('V1: invalid status triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.status = 'pending';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V1]') && e.includes('status')));
});

test('V1: fewer than 4 babok_core_concepts triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.babok_core_concepts = { change: 'short', need: 'short' };
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V1]') && e.includes('babok_core_concepts')));
});

test('V1: missing required section triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  delete pns.sections.kpis;
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V1]') && e.includes('kpis')));
});

test('V2: activity with empty description triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.activity_sequence.activities[0].description = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V2]') && e.includes('description')));
});

test('V2: activity with empty actor_role_id triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.activity_sequence.activities[0].actor_role_id = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V2]') && e.includes('actor_role_id')));
});

test('V2: business rule with empty source triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.business_rules[0].source = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V2]') && e.includes('source')));
});

test('V3: RACI entry with empty accountable triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.roles_and_raci.raci_matrix[0].accountable = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V3]') && e.includes('Accountable')));
});

test('V3: RACI entry with empty responsible array triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.roles_and_raci.raci_matrix[0].responsible = [];
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V3]') && e.includes('Responsible')));
});

test('V3: activity with no RACI entry triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.activity_sequence.activities.push({ id: 'act-99', description: 'Orphan activity', actor_role_id: 'employee' });
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V3]') && e.includes('act-99')));
});

test('V5: KPI with empty formula triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.kpis[0].formula = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V5]') && e.includes('formula')));
});

test('V5: KPI with empty data_source triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.kpis[0].data_source = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V5]') && e.includes('data_source')));
});

test('V6: decision point with only 1 outcome triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.decision_points[0].outcomes = [{ label: 'Approved', next_activity: 'act-04' }];
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V6]') && e.includes('2 outcomes')));
});

test('V6: exception path with empty handling triggers error', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.exception_paths[0].handling = '';
  const result = validatePns(pns);
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('[V6]') && e.includes('handling')));
});

test('V7: empty controls_and_compliance triggers warning (not error)', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  pns.sections.controls_and_compliance = [];
  const result = validatePns(pns);
  assert.equal(result.errors.filter((e) => e.includes('[V7]')).length, 0, 'V7 must not produce errors');
  assert.ok(result.warnings.some((w) => w.includes('[V7]')), 'V7 must produce a warning');
});

// ─── Quality scoring — fixtures ───────────────────────────────────────────────

for (const [fixtureName, pns] of Object.entries(FIXTURES)) {
  test(`scorePnsQuality: ${fixtureName} scores ≥90`, () => {
    const result = scorePnsQuality(pns);
    assert.ok(result.score >= 90, `${fixtureName} scored ${result.score}/100, expected ≥90`);
  });

  test(`scorePnsQuality: ${fixtureName} ready_for_publication = true`, () => {
    const result = scorePnsQuality(pns);
    assert.equal(result.ready_for_publication, true, `${fixtureName} should be ready for publication`);
  });

  test(`scorePnsQuality: ${fixtureName} breakdown has all 11 sections`, () => {
    const result = scorePnsQuality(pns);
    const EXPECTED_KEYS = [
      'process_box', 'activity_sequence', 'roles_and_raci',
      'business_rules', 'decision_points', 'exception_paths',
      'kpis', 'systems_and_integrations', 'controls_and_compliance',
      'babok_core_concepts', 'apqc_pcf_mapping',
    ];
    for (const key of EXPECTED_KEYS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(result.breakdown, key),
        `${fixtureName} breakdown missing section: ${key}`
      );
    }
  });
}

test('scorePnsQuality: empty PNS scores 0', () => {
  const result = scorePnsQuality({});
  assert.equal(result.score, 0);
  assert.equal(result.ready_for_publication, false);
});

test('scorePnsQuality: below-threshold PNS triggers warning', () => {
  const result = scorePnsQuality({});
  assert.ok(result.warnings.some((w) => w.includes('below the publication threshold')));
});

// ─── SIPOC generation ─────────────────────────────────────────────────────────

test('generateSipoc: purchase-approval produces non-empty suppliers', () => {
  const result = generateSipoc(FIXTURES.purchaseApproval);
  assert.equal(result.valid, true);
  assert.ok(result.sipoc.suppliers.length > 0, 'suppliers must be non-empty');
});

test('generateSipoc: purchase-approval inputs match process_box.inputs names', () => {
  const result = generateSipoc(FIXTURES.purchaseApproval);
  assert.ok(result.sipoc.inputs.includes('Purchase request form'));
});

test('generateSipoc: process column has same count as activities', () => {
  const pns = FIXTURES.purchaseApproval;
  const result = generateSipoc(pns);
  const actCount = pns.sections.activity_sequence.activities.length;
  assert.equal(result.sipoc.process.length, actCount);
});

test('generateSipoc: process steps are ordered correctly', () => {
  const result = generateSipoc(FIXTURES.purchaseApproval);
  assert.equal(result.sipoc.process[0].step, 1);
  assert.equal(result.sipoc.process[0].id, 'act-01');
});

test('generateSipoc: outputs match process_box.outputs names', () => {
  const result = generateSipoc(FIXTURES.purchaseApproval);
  assert.ok(result.sipoc.outputs.includes('Approved purchase order'));
});

test('generateSipoc: customers are derived from process_box.outputs consumers', () => {
  const result = generateSipoc(FIXTURES.purchaseApproval);
  assert.ok(result.sipoc.customers.length > 0, 'customers must be non-empty');
});

test('generateSipoc: sipoc has process_id and process_name', () => {
  const result = generateSipoc(FIXTURES.quoteToOrder);
  assert.equal(result.sipoc.process_id, 'proc-003');
  assert.equal(result.sipoc.process_name, 'Quote to Order');
});

test('generateSipoc: support-triage has 3-system process context', () => {
  const result = generateSipoc(FIXTURES.supportTriage);
  assert.ok(result.sipoc.process.length >= 5, 'support-triage should have ≥5 process steps');
});

// ─── RACI generation ──────────────────────────────────────────────────────────

test('generateRaci: purchase-approval produces matrix with 5 rows', () => {
  const result = generateRaci(FIXTURES.purchaseApproval);
  assert.equal(result.valid, true);
  assert.equal(result.raci.matrix.length, 5);
});

test('generateRaci: each matrix row has R, A, C, I fields', () => {
  const result = generateRaci(FIXTURES.purchaseApproval);
  for (const row of result.raci.matrix) {
    assert.ok(Array.isArray(row.R), `row ${row.activity_id} R must be array`);
    assert.ok(typeof row.A === 'string', `row ${row.activity_id} A must be string`);
    assert.ok(Array.isArray(row.C), `row ${row.activity_id} C must be array`);
    assert.ok(Array.isArray(row.I), `row ${row.activity_id} I must be array`);
  }
});

test('generateRaci: each matrix row has non-empty accountable', () => {
  const result = generateRaci(FIXTURES.purchaseApproval);
  for (const row of result.raci.matrix) {
    assert.ok(row.A && row.A.trim() !== '', `row ${row.activity_id} must have Accountable`);
  }
});

test('generateRaci: roles array contains all defined roles', () => {
  const result = generateRaci(FIXTURES.purchaseApproval);
  const roleIds = result.raci.roles.map((r) => r.id);
  assert.ok(roleIds.includes('employee'), 'roles must include employee');
  assert.ok(roleIds.includes('finance_mgr'), 'roles must include finance_mgr');
});

test('generateRaci: quote-to-order produces matrix with 6 rows', () => {
  const result = generateRaci(FIXTURES.quoteToOrder);
  assert.equal(result.raci.matrix.length, 6);
});

test('generateRaci: matrix rows include activity description', () => {
  const result = generateRaci(FIXTURES.purchaseApproval);
  assert.ok(result.raci.matrix[0].description.length > 0, 'description must be non-empty');
});

// ─── Business rule extraction ──────────────────────────────────────────────────

test('extractBusinessRules: purchase-approval returns ≥3 primary rules', () => {
  const result = extractBusinessRules(FIXTURES.purchaseApproval);
  assert.equal(result.valid, true);
  const primary = result.rules.filter((r) => r.type === 'business_rule');
  assert.ok(primary.length >= 3, `expected ≥3 primary rules, got ${primary.length}`);
});

test('extractBusinessRules: decision criteria are included as derived rules', () => {
  const result = extractBusinessRules(FIXTURES.purchaseApproval);
  const derived = result.rules.filter((r) => r.type === 'decision_criterion');
  assert.ok(derived.length >= 1, 'expected ≥1 derived decision_criterion rule');
});

test('extractBusinessRules: all rules have id, description, source, type', () => {
  const result = extractBusinessRules(FIXTURES.purchaseApproval);
  for (const rule of result.rules) {
    assert.ok(rule.id, `rule missing id`);
    assert.ok(rule.description, `rule ${rule.id} missing description`);
    assert.ok(rule.source, `rule ${rule.id} missing source`);
    assert.ok(rule.type, `rule ${rule.id} missing type`);
  }
});

test('extractBusinessRules: deduplication removes identical descriptions', () => {
  const pns = structuredClone(FIXTURES.purchaseApproval);
  const dupe = { ...pns.sections.business_rules[0], id: 'br-dupe' };
  pns.sections.business_rules.push(dupe);
  const result = extractBusinessRules(pns);
  const descs = result.rules.map((r) => r.description);
  const unique = new Set(descs);
  assert.equal(descs.length, unique.size, 'duplicate descriptions must be removed');
});

test('extractBusinessRules: support-triage returns ≥3 rules total', () => {
  const result = extractBusinessRules(FIXTURES.supportTriage);
  assert.ok(result.rules.length >= 3, `expected ≥3 rules, got ${result.rules.length}`);
});

test('extractBusinessRules: quote-to-order has rules with source citations', () => {
  const result = extractBusinessRules(FIXTURES.quoteToOrder);
  const withSource = result.rules.filter((r) => r.source && r.source !== '(unspecified)');
  assert.ok(withSource.length >= 3, 'expected ≥3 rules with explicit source citations');
});
