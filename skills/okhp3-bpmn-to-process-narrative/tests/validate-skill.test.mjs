/**
 * validate-skill.test.mjs — okhp3-bpmn-to-process-narrative
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

test('SKILL.md exists', () => assert.ok(exists('SKILL.md')));
test('name matches directory', () => {
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'okhp3-bpmn-to-process-narrative');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('BPMN')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'package.json',
  'README.md',
  'license',
  'references/reversal-mapping.md',
  'scripts/reverse-bpmn-beta.mjs',
  'assets/fixtures/reversed-pns-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('SKILL.md documents the vision/OCR scope boundary', () => {
  const content = read('SKILL.md');
  assert.ok(content.toLowerCase().includes('vision'));
  assert.ok(content.toLowerCase().includes('ocr'));
  assert.ok(content.includes('bpmn-beta DSL TEXT/grammar') || content.includes('bpmn-beta` DSL TEXT/grammar') || content.toLowerCase().includes('does not do vision, image, or ocr parsing'));
});

test('SKILL.md documents narrative_provenance as an optional, non-schema-breaking field', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('narrative_provenance'));
  assert.ok(content.includes('diagram-derived'));
  assert.ok(content.toLowerCase().includes('optional'));
});

test('SKILL.md documents the V8 / pir.yaml validation-scoring limitation', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('V8'));
  assert.ok(content.includes('pir.yaml'));
  assert.ok(content.includes('okhp3-process-validation-scoring'));
  assert.ok(content.includes('okhp3-bpmn-recoverability-audit'));
});

test('SKILL.md About footer matches the four-line brand-standard verbatim', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('Built by [Jamie Hill](https://overkillhill.com)'));
  assert.ok(content.includes('MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.'));
});

test('reverseBpmnBeta exports named function', async () => {
  const mod = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/reverse-bpmn-beta.mjs')).href);
  assert.equal(typeof mod.reverseBpmnBeta, 'function');
  assert.equal(typeof mod.parseBpmnBeta, 'function');
  assert.equal(typeof mod.toYaml, 'function');
  assert.equal(typeof mod.toMarkdown, 'function');
});

test('reverseBpmnBeta round-trips a real bpmn-beta fixture into a pns.yaml-shaped object', async () => {
  const mod = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/reverse-bpmn-beta.mjs')).href);
  const source = [
    'bpmn-beta',
    'pool proc "Test Process" {',
    '  lane requester "Requester" {',
    '    start s1 "Request Submitted"',
    '    task:user t1 "Submit Request"',
    '  }',
    '  lane approver "Approver" {',
    '    task t2 "Review Request"',
    '    xor g1 "Approved?"',
    '    end e1 "Done"',
    '    end e2 "Rejected"',
    '  }',
    '  s1 --> t1',
    '  t1 --> t2',
    '  t2 --> g1',
    '  g1 --> e1: "yes"',
    '  g1 --> e2: "no"',
    '}',
  ].join('\n');

  const { pns, warnings } = mod.reverseBpmnBeta(source, { date: '2026-01-01' });

  assert.equal(pns.narrative_provenance, 'diagram-derived');
  assert.equal(pns.process_box.trigger, 'Request Submitted');
  assert.equal(pns.activity_sequence.activities.length, 2);
  assert.equal(pns.decision_points.length, 1);
  assert.equal(pns.decision_points[0].outcomes.length, 2);
  assert.deepEqual(pns.decision_points[0].unrecoverable_from_diagram, ['criteria']);
  assert.equal(pns.roles_and_raci.roles.length, 2);
  assert.equal(pns.business_rules.length, 0);
  assert.equal(pns.kpis_unrecoverable_from_diagram, true);
  assert.ok(Array.isArray(warnings));

  const yaml = mod.toYaml(pns);
  assert.ok(yaml.includes('narrative_provenance: diagram-derived'));

  const md = mod.toMarkdown(pns);
  assert.ok(md.includes('diagram-derived'));
});

test('parallel (and) gateways are not emitted as decision_points', async () => {
  const mod = await import(pathToFileURL(join(SKILL_ROOT, 'scripts/reverse-bpmn-beta.mjs')).href);
  const source = [
    'bpmn-beta',
    'start s1 "Start"',
    'task t1 "Do A"',
    'and g1 "Split"',
    'task t2 "Do B"',
    'task t3 "Do C"',
    'end e1 "End"',
    's1 --> t1',
    't1 --> g1',
    'g1 --> t2',
    'g1 --> t3',
    't2 --> e1',
    't3 --> e1',
  ].join('\n');

  const { pns, warnings } = mod.reverseBpmnBeta(source, { date: '2026-01-01' });
  assert.equal(pns.decision_points.length, 0);
  assert.ok(warnings.some((w) => w.includes('parallel')));
});

test('fixture reversed-pns-example.yaml has narrative_provenance: diagram-derived', () => {
  const content = read('assets/fixtures/reversed-pns-example.yaml');
  assert.ok(/narrative_provenance:\s*diagram-derived/.test(content));
});

test('fixture reversed-pns-example.yaml carries all 13 canonical PNS section keys', () => {
  const content = read('assets/fixtures/reversed-pns-example.yaml');
  const requiredKeys = [
    'process_box', 'activity_sequence', 'roles_and_raci', 'business_rules',
    'decision_points', 'exception_paths', 'kpis', 'systems_and_integrations',
    'controls_and_compliance', 'open_questions', 'babok_core_concepts',
    'revision_history', 'validation',
  ];
  for (const key of requiredKeys) {
    assert.ok(new RegExp(`^${key}:`, 'm').test(content), `missing section key: ${key}`);
  }
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
