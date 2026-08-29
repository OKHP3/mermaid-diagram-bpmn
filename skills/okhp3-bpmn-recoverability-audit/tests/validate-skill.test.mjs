/**
 * validate-skill.test.mjs — okhp3-bpmn-recoverability-audit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dir, '..');

function read(rel) { return readFileSync(join(SKILL_ROOT, rel), 'utf-8'); }
function exists(rel) { return existsSync(join(SKILL_ROOT, rel)); }

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
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

// very small YAML-ish reader for the flat/nested-map parts of the fixture we
// need for enum assertions — avoids adding a yaml dependency to this package.
function readSimpleYamlValue(content, key) {
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = content.match(re);
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, '');
}

test('SKILL.md exists', () => assert.ok(exists('SKILL.md')));
test('name matches directory', () => {
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'okhp3-bpmn-recoverability-audit');
});
test('bp_skill_version present', () => assert.ok(read('SKILL.md').includes('bp_skill_version')));
test('depends_on references okhp3-bpmn-to-process-narrative', () => {
  assert.ok(read('SKILL.md').includes('okhp3-bpmn-to-process-narrative'));
});
test('states the boundary against okhp3-process-validation-scoring', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('okhp3-process-validation-scoring'));
  assert.ok(content.includes('V8'));
});
test('never claims ready_for_publication', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('ready_for_publication'));
  assert.ok(/never (mark|set)/i.test(content), 'must explicitly disclaim setting ready_for_publication');
});
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024,
    `description length was ${fm.description.length}`);
});

const FILES = [
  'package.json',
  'README.md',
  'license',
  'references/recoverability-boundary.md',
  'scripts/audit-diagram-fidelity.mjs',
  'assets/fixtures/fidelity-report-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});

test('package.json name matches @bp-skill scope', () => {
  assert.equal(JSON.parse(read('package.json')).name, '@bp-skill/okhp3-bpmn-recoverability-audit');
});

test('license is MIT text', () => {
  assert.ok(read('license').includes('MIT License'));
  assert.ok(read('license').includes('OverKill Hill P³'));
});

test('recoverability-boundary.md documents all 13 pns.yaml sections', () => {
  const content = read('references/recoverability-boundary.md');
  const sections = [
    'process_box', 'activity_sequence', 'roles_and_raci', 'business_rules',
    'decision_points', 'exception_paths', 'systems_and_integrations', 'kpis',
    'controls_and_compliance', 'open_questions', 'babok_core_concepts',
    'revision_history', 'validation',
  ];
  for (const s of sections) {
    assert.ok(content.includes(s), `recoverability-boundary.md must document section "${s}"`);
  }
});

test('recoverability-boundary.md uses the yes/partial/no rating vocabulary', () => {
  const content = read('references/recoverability-boundary.md');
  assert.ok(content.includes('**yes**'));
  assert.ok(content.includes('**partial**'));
  assert.ok(content.includes('**no**'));
});

test('auditDiagramFidelity exports named function', async () => {
  const mod = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  assert.equal(typeof mod.auditDiagramFidelity, 'function');
});

test('RECOVERABILITY_TABLE is exported and non-empty', async () => {
  const mod = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  assert.ok(Array.isArray(mod.RECOVERABILITY_TABLE));
  assert.ok(mod.RECOVERABILITY_TABLE.length > 15);
});

test('auditDiagramFidelity returns { valid, errors, warnings, report }', async () => {
  const { auditDiagramFidelity } = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  const result = auditDiagramFidelity({});
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(typeof result.report === 'object');
});

test('auditDiagramFidelity fails cleanly when pns is missing', async () => {
  const { auditDiagramFidelity } = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  const result = auditDiagramFidelity({});
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
  assert.equal(result.report.completeness_verdict, 'insufficient');
});

test('auditDiagramFidelity returns insufficient for an empty activity sequence', async () => {
  const { auditDiagramFidelity } = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  const pns = { process_id: 'p1', narrative_provenance: 'diagram-derived', activity_sequence: { activities: [] } };
  const result = auditDiagramFidelity({ pns });
  assert.equal(result.report.completeness_verdict, 'insufficient');
});

test('auditDiagramFidelity returns partial-diagram-derived for a plausible diagram-only PNS', async () => {
  const { auditDiagramFidelity } = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  const pns = {
    process_id: 'proc-purchase-approval-diagram-derived',
    process_name: 'Purchase Order Approval (diagram-derived reconstruction)',
    narrative_provenance: 'diagram-derived',
    process_box: { trigger: 'Start event: Need identified', outputs: [{ name: 'Approved PO' }] },
    activity_sequence: {
      activities: [
        { id: 'act-001', description: 'Submit purchase request', actor_role_id: 'role-requester' },
        { id: 'act-002', description: 'Review purchase request', actor_role_id: 'role-finance-manager' },
      ],
    },
    roles_and_raci: { roles: [{ role_id: 'role-requester' }, { role_id: 'role-finance-manager' }], raci_matrix: [] },
    decision_points: [{ id: 'gw-001', description: 'Approved?', outcomes: ['yes', 'no'] }],
    exception_paths: [{ id: 'exc-001', description: 'Missing vendor quote' }],
    business_rules: [], kpis: [], systems_and_integrations: [], controls_and_compliance: [],
    open_questions: [], babok_core_concepts: {}, revision_history: [], validation: {},
  };
  const result = auditDiagramFidelity({ pns });
  assert.equal(result.report.completeness_verdict, 'partial-diagram-derived');
  assert.ok(result.report.recoverable_from_diagram.length > 0);
  assert.ok(result.report.unrecoverable_from_diagram.length > 0);
  assert.ok(result.report.recommended_next_action.includes('okhp3-elicitation-interviews'));
  assert.ok(!('ready_for_publication' in result.report));
});

test('auditDiagramFidelity returns full when a qualifying pir.yaml is supplied', async () => {
  const { auditDiagramFidelity } = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  const pns = {
    process_id: 'p1',
    activity_sequence: { activities: [{ id: 'act-001', description: 'Do the thing', actor_role_id: 'r1' }] },
    roles_and_raci: { roles: [{ role_id: 'r1' }] },
  };
  const pir = { validation: { completeness_score: 90, ready_for_narrative: true } };
  const result = auditDiagramFidelity({ pns, pir });
  assert.equal(result.report.completeness_verdict, 'full');
});

test('auditDiagramFidelity warns when a diagram-derived tag coexists with a qualifying pir.yaml', async () => {
  const { auditDiagramFidelity } = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  const pns = {
    process_id: 'p1',
    narrative_provenance: 'diagram-derived',
    activity_sequence: { activities: [{ id: 'act-001', description: 'Do the thing', actor_role_id: 'r1' }] },
    roles_and_raci: { roles: [{ role_id: 'r1' }] },
  };
  const pir = { validation: { completeness_score: 90, ready_for_narrative: true } };
  const result = auditDiagramFidelity({ pns, pir });
  assert.ok(result.warnings.some(w => w.includes('qualifying pir.yaml')));
});

test('auditDiagramFidelity flags a field populated despite being unrecoverable-by-grammar', async () => {
  const { auditDiagramFidelity } = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/audit-diagram-fidelity.mjs')).href);
  const pns = {
    process_id: 'p1',
    narrative_provenance: 'diagram-derived',
    activity_sequence: {
      activities: [
        { id: 'act-001', description: 'Submit', actor_role_id: 'r1' },
        { id: 'act-002', description: 'Review', actor_role_id: 'r2' },
      ],
    },
    roles_and_raci: { roles: [{ role_id: 'r1' }, { role_id: 'r2' }] },
    kpis: [{ id: 'kpi-001', name: 'Cycle time', formula: 'end - start', data_source: 'ERP' }],
  };
  const result = auditDiagramFidelity({ pns });
  const kpiEntry = result.report.unrecoverable_from_diagram.find(e => e.section === 'kpis');
  assert.ok(kpiEntry, 'kpis must still be listed as unrecoverable-by-grammar');
  assert.equal(kpiEntry.populated_in_this_pns, true);
  assert.ok(result.warnings.some(w => w.includes('kpis') && w.includes('fabrication')));
});

test('fixture fidelity-report-example.yaml has a valid completeness_verdict', () => {
  const content = read('assets/fixtures/fidelity-report-example.yaml');
  const verdict = readSimpleYamlValue(content, 'completeness_verdict');
  assert.ok(['full', 'partial-diagram-derived', 'insufficient'].includes(verdict),
    `completeness_verdict "${verdict}" must be one of full | partial-diagram-derived | insufficient`);
});

test('fixture fidelity-report-example.yaml declares diagram-derived provenance', () => {
  const content = read('assets/fixtures/fidelity-report-example.yaml');
  assert.ok(content.includes('narrative_provenance: diagram-derived'));
});

test('fixture fidelity-report-example.yaml carries the validation boundary notice', () => {
  const content = read('assets/fixtures/fidelity-report-example.yaml');
  assert.ok(content.includes("not a substitute for okhp3-process-validation-scoring"));
});
