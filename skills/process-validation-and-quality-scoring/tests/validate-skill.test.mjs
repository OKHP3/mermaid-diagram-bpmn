/**
 * validate-skill.test.mjs — process-validation-and-quality-scoring
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dir, '..');

function read(rel) { return readFileSync(join(SKILL_ROOT, rel), 'utf-8'); }
function exists(rel) { return existsSync(join(SKILL_ROOT, rel)); }

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !key.startsWith('#') && !key.startsWith('-')) fm[key] = val;
  }
  return fm;
}

test('SKILL.md exists', () => assert.ok(exists('SKILL.md')));
test('name matches directory', () => {
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'process-validation-and-quality-scoring');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('ISO 9001')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/validation-rules.md',
  'scripts/run-validation-suite.mjs',
  'assets/fixtures/validation-report-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('runValidationSuite exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  assert.equal(typeof mod.runValidationSuite, 'function');
});

test('runValidationSuite returns { valid, errors, warnings, report }', async () => {
  const { runValidationSuite } = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  const result = runValidationSuite({});
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(typeof result.report === 'object');
  assert.ok(typeof result.report.composite_score === 'number');
  assert.ok(['A', 'B', 'C', 'D'].includes(result.report.band));
});

test('validation-rules.md documents V1 through V9', () => {
  const content = read('references/validation-rules.md');
  for (let i = 1; i <= 9; i++) {
    assert.ok(content.includes(`## V${i}`), `must document rule V${i}`);
  }
});

test('validation-rules.md documents 4 quality bands A-D', () => {
  const content = read('references/validation-rules.md');
  for (const band of ['Band A', 'Band B', 'Band C', 'Band D']) {
    assert.ok(content.includes(band) || content.includes(`| ${band[5]}`), `must document ${band}`);
  }
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});

// ─── Behavioural tests for V4, publication gate, and V9 ──────────────────────

test('V4 is included in rules_run when pns is provided', async () => {
  const { runValidationSuite } = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  const minimalPns = {
    pns_version: '1', process_id: 'p1', process_name: 'P', process_owner: 'O',
    department: 'D', status: 'draft',
    process_box: {}, activity_sequence: { activities: [] }, roles_and_raci: {},
    business_rules: [], decision_points: [], exception_paths: [], kpis: [],
    systems_and_integrations: [], controls_and_compliance: [], open_questions: [],
    babok_core_concepts: {}, revision_history: [], validation: {},
  };
  const result = runValidationSuite({ pns: minimalPns });
  const ruleIds = result.report.rules_run.map(r => r.rule_id);
  assert.ok(ruleIds.includes('V4'), `V4 must appear in rules_run, got: ${ruleIds.join(', ')}`);
});

test('V4 warns on compound activity description (semicolon)', async () => {
  const { runValidationSuite } = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  const pns = {
    pns_version: '1', process_id: 'p1', process_name: 'P', process_owner: 'O',
    department: 'D', status: 'draft',
    process_box: {}, activity_sequence: { activities: [{ id: 'act-001', description: 'Do this; then do that', actor_role_id: 'r1' }] },
    roles_and_raci: { raci_matrix: [{ activity_id: 'act-001', accountable: 'r1', responsible: ['r1'] }] },
    business_rules: [], decision_points: [], exception_paths: [], kpis: [],
    systems_and_integrations: [], controls_and_compliance: [], open_questions: [],
    babok_core_concepts: {}, revision_history: [], validation: {},
  };
  const result = runValidationSuite({ pns });
  const v4 = result.report.rules_run.find(r => r.rule_id === 'V4');
  assert.ok(v4, 'V4 rule must be present');
  const hasWarn = v4.findings.some(f => f.includes('semicolon'));
  assert.ok(hasWarn, `expected semicolon warning, got: ${JSON.stringify(v4.findings)}`);
});

test('V4 warns on subordinate-conjunction opener', async () => {
  const { runValidationSuite } = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  const pns = {
    pns_version: '1', process_id: 'p1', process_name: 'P', process_owner: 'O',
    department: 'D', status: 'draft',
    process_box: {}, activity_sequence: { activities: [{ id: 'act-001', description: 'When the request is received, send a reply', actor_role_id: 'r1' }] },
    roles_and_raci: { raci_matrix: [{ activity_id: 'act-001', accountable: 'r1', responsible: ['r1'] }] },
    business_rules: [], decision_points: [], exception_paths: [], kpis: [],
    systems_and_integrations: [], controls_and_compliance: [], open_questions: [],
    babok_core_concepts: {}, revision_history: [], validation: {},
  };
  const result = runValidationSuite({ pns });
  const v4 = result.report.rules_run.find(r => r.rule_id === 'V4');
  assert.ok(v4, 'V4 rule must be present');
  const hasWarn = v4.findings.some(f => f.includes('subordinate conjunction'));
  assert.ok(hasWarn, `expected subordinate conjunction warning, got: ${JSON.stringify(v4.findings)}`);
});

test('blocking errors force ready_for_publication to false even if band is A/B', async () => {
  const { runValidationSuite } = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  // PNS with a V2 error (missing actor_role_id) but a high stored pns_quality_score
  const pns = {
    pns_version: '1', process_id: 'p1', process_name: 'P', process_owner: 'O',
    department: 'D', status: 'draft',
    process_box: { trigger: 'receipt' },
    activity_sequence: { activities: [{ id: 'act-001', description: 'Do the thing' }] }, // missing actor_role_id → V2 error
    roles_and_raci: { roles: ['r1', 'r2'], raci_matrix: [{ activity_id: 'act-001', accountable: 'r1', responsible: ['r1'] }] },
    business_rules: [{ id: 'br-001', description: 'Rule', source: 'Policy A' }],
    decision_points: [{ id: 'gw-001', outcomes: ['yes', 'no'] }],
    exception_paths: [{ id: 'exc-001', handling: 'escalate' }],
    kpis: [{ id: 'kpi-001', formula: 'count', data_source: 'DB' }],
    systems_and_integrations: [], controls_and_compliance: [{ id: 'ctrl-001' }], open_questions: [],
    babok_core_concepts: {}, revision_history: [],
    validation: { pns_quality_score: 95, ready_for_publication: true }, // high stored score
  };
  const pirOk = { validation: { completeness_score: 90, ready_for_narrative: true } };
  const result = runValidationSuite({ pir: pirOk, pns });
  assert.equal(result.valid, false, 'valid should be false when blocking errors exist');
  assert.equal(result.report.ready_for_publication, false,
    `ready_for_publication must be false when blocking errors exist, band=${result.report.band}`);
});

test('ready_for_publication is true when all blocking rules pass and band is A or B', async () => {
  const { runValidationSuite } = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  const pns = {
    pns_version: '1', process_id: 'p1', process_name: 'P', process_owner: 'O',
    department: 'D', status: 'draft',
    process_box: { trigger: 'receipt' },
    activity_sequence: { activities: [{ id: 'act-001', description: 'Review request', actor_role_id: 'r1' }] },
    roles_and_raci: { roles: ['r1', 'r2'], raci_matrix: [{ activity_id: 'act-001', accountable: 'r1', responsible: ['r1'] }] },
    business_rules: [{ id: 'br-001', description: 'Rule', source: 'Policy A' }],
    decision_points: [{ id: 'gw-001', outcomes: ['yes', 'no'] }],
    exception_paths: [{ id: 'exc-001', handling: 'escalate' }],
    kpis: [{ id: 'kpi-001', formula: 'count', data_source: 'DB' }],
    systems_and_integrations: [], controls_and_compliance: [{ id: 'ctrl-001' }], open_questions: [],
    babok_core_concepts: {}, revision_history: [],
    validation: { pns_quality_score: 90, ready_for_publication: true },
  };
  const pirOk = { validation: { completeness_score: 90, ready_for_narrative: true } };
  const result = runValidationSuite({ pir: pirOk, pns });
  // If band is A or B and no blocking errors, ready_for_publication should be true
  const band = result.report.band;
  if (band === 'A' || band === 'B') {
    assert.equal(result.report.ready_for_publication, true,
      `expected ready_for_publication=true for band ${band} with no blocking errors`);
  }
});

test('V9 warns when bpmn-beta header keyword is missing', async () => {
  const { runValidationSuite } = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  const bpmn = 'start(S) --> task(T) --> end(E)'; // valid-ish structure but no bpmn-beta header
  const result = runValidationSuite({ bpmn });
  const v9 = result.report.rules_run.find(r => r.rule_id === 'V9');
  assert.ok(v9, 'V9 must be in rules_run');
  const hasHeaderWarn = v9.findings.some(f => f.includes('bpmn-beta'));
  assert.ok(hasHeaderWarn, `expected bpmn-beta header warning, got: ${JSON.stringify(v9.findings)}`);
});

test('V9 passes for a structurally sound bpmn-beta diagram with pool/lane', async () => {
  const { runValidationSuite } = await import(join(SKILL_ROOT, 'scripts/run-validation-suite.mjs'));
  const bpmn = [
    'bpmn-beta',
    'pool Purchasing {',
    '  lane Requester {',
    '    start(S) --> task(Submit) --> end(E)',
    '  }',
    '}',
  ].join('\n');
  const result = runValidationSuite({ bpmn });
  const v9 = result.report.rules_run.find(r => r.rule_id === 'V9');
  assert.ok(v9, 'V9 must be in rules_run');
  assert.equal(v9.status, 'pass', `expected V9 pass, got warnings: ${JSON.stringify(v9.findings)}`);
});
