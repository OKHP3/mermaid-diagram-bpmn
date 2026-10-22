import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadFile, parseYaml } from '../scripts/parse-yaml-minimal.mjs';
import { validatePns } from '../scripts/validate-pns.mjs';
import { scorePnsQuality } from '../scripts/score-pns-quality.mjs';
import { generateRaci } from '../../okhp3-raci-governance-matrix/scripts/generate-raci.mjs';
import { generateSipoc } from '../../okhp3-sipoc-generation/scripts/generate-sipoc.mjs';
import { generateMeasuresRegister } from '../../okhp3-process-measures-controls/scripts/generate-measures-register.mjs';
import { generateSop } from '../../okhp3-sop-work-instructions/scripts/generate-sop.mjs';
import { runValidationSuite } from '../../okhp3-process-validation-scoring/scripts/run-validation-suite.mjs';

const fixturePath = fileURLToPath(new URL('../assets/fixtures/pns-example.yaml', import.meta.url));
const fixture = await loadFile(fixturePath);
const pir = { validation: { completeness_score: 90, ready_for_narrative: true } };

test('the published PNS example validates and produces populated downstream artifacts', () => {
  const validation = validatePns(fixture);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  const score = scorePnsQuality(fixture);
  assert.equal(score.ready_for_publication, true, JSON.stringify(score));
  const raci = generateRaci(fixture).raci;
  const sipoc = generateSipoc(fixture).sipoc;
  const registers = generateMeasuresRegister(fixture);
  const sop = generateSop(fixture).sop;
  assert.equal(raci.matrix.length, fixture.activity_sequence.activities.length);
  assert.equal(sipoc.process.length, fixture.activity_sequence.activities.length);
  assert.equal(registers.measuresRegister.kpis.length, fixture.kpis.length);
  assert.ok(sipoc.suppliers.includes('Vendor'));
  assert.ok(raci.matrix.every(row => row.R.length > 0 && row.A));
  assert.ok(sop.includes(fixture.activity_sequence.activities[0].description));
  const suite = runValidationSuite({ pns: fixture, pir });
  assert.equal(suite.valid, true, suite.errors.join('\n'));
  assert.equal(suite.report.ready_for_publication, true);
});

test('quoted schema versions remain strings and inline RACI lists remain arrays', () => {
  const parsed = parseYaml('pns_version: "0.1"\nresponsible: [role-requester, "Finance, lead"]\nempty: []\n');
  assert.equal(parsed.pns_version, '0.1');
  assert.deepEqual(parsed.responsible, ['role-requester', 'Finance, lead']);
  assert.deepEqual(parsed.empty, []);
});

for (const [label, mutate] of [
  ['unknown lifecycle', pns => { pns.status = 'approved'; }],
  ['empty process box', pns => { pns.process_box.trigger = ''; }],
  ['unknown responsible role', pns => { pns.roles_and_raci.raci_matrix[0].responsible = ['unknown-role']; }],
  ['unknown consulted role', pns => { pns.roles_and_raci.raci_matrix[0].consulted = ['unknown-role']; }],
  ['duplicate accountability entry', pns => { pns.roles_and_raci.raci_matrix.push(structuredClone(pns.roles_and_raci.raci_matrix[0])); }],
  ['missing required section', pns => { delete pns.process_box; }],
  ['missing responsible role', pns => { pns.roles_and_raci.raci_matrix[0].responsible = []; }],
  ['multiple accountable roles', pns => { pns.roles_and_raci.raci_matrix[0].accountable = ['role-requester', 'role-director']; }],
  ['unresolved publication question', pns => { pns.open_questions = [{ id: 'q1', question: 'Who approves?', must_resolve_before_publish: true }]; }],
]) {
  test(`both validators and publication scores reject ${label}`, () => {
    const pns = structuredClone(fixture);
    mutate(pns);
    assert.equal(validatePns(pns).valid, false);
    assert.equal(scorePnsQuality(pns).ready_for_publication, false);
    const suite = runValidationSuite({ pns, pir });
    assert.equal(suite.valid, false);
    assert.equal(suite.report.ready_for_publication, false);
  });
}

test('a forged stored score cannot make an invalid PNS publishable', () => {
  const pns = structuredClone(fixture);
  pns.kpis[0].formula = '';
  pns.validation = { pns_quality_score: 100, ready_for_publication: true };
  assert.equal(scorePnsQuality(pns).ready_for_publication, false);
  assert.equal(runValidationSuite({ pns, pir }).report.ready_for_publication, false);
});

for (const [skill, script, args, expected] of [
  ['okhp3-process-narrative-authoring', 'validate-pns.mjs', [], 'PNS Validation: PASS'],
  ['okhp3-process-measures-controls', 'generate-measures-register.mjs', [], 'Measures register KPIs: 2'],
  ['okhp3-sop-work-instructions', 'generate-sop.mjs', [], 'Submit purchase request form'],
  ['okhp3-process-validation-scoring', 'run-validation-suite.mjs', ['--pns', fixturePath, '--pir', fileURLToPath(new URL('../../okhp3-process-intake-and-scope/assets/fixtures/intake-purchase-approval.yaml', import.meta.url))], 'Ready for publication: true'],
]) {
  test(`${script} reads the actual YAML artifact`, () => {
    const cli = fileURLToPath(new URL(`../../${skill}/scripts/${script}`, import.meta.url));
    const result = spawnSync(process.execPath, [cli, ...(args.length ? args : [fixturePath])], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.ok(result.stdout.includes(expected), result.stdout);
  });
}


test('portable scoring bundles exactly match the canonical validator and scorer', () => {
  for (const file of ['validate-pns.mjs', 'score-pns-quality.mjs']) {
    const canonical = readFileSync(new URL(`../scripts/${file}`, import.meta.url), 'utf8');
    const bundled = readFileSync(new URL(`../../okhp3-process-validation-scoring/scripts/${file}`, import.meta.url), 'utf8');
    assert.equal(bundled, canonical);
  }
});

test('artifact initialization writes canonical YAML and keeps the blank draft unpublishable', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'bp-skill-scaffold-'));
  try {
    const initializer = fileURLToPath(new URL('../../../scripts/init-process-artifact.mjs', import.meta.url));
    const copy = join(temp, 'scripts/init-process-artifact.mjs');
    mkdirSync(dirname(copy), { recursive: true });
    copyFileSync(initializer, copy);
    const template = join(temp, 'skills/okhp3-process-narrative-authoring/assets/pns-template.yaml');
    mkdirSync(dirname(template), { recursive: true });
    copyFileSync(new URL('../assets/pns-template.yaml', import.meta.url), template);
    const result = spawnSync(process.execPath, [copy, 'proc-contract-check'], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    const pns = await loadFile(join(temp, 'artifacts/proc-contract-check/pns.yaml'));
    assert.equal(pns.process_id, 'proc-contract-check');
    assert.equal(pns.status, 'draft-intake');
    assert.ok('process_box' in pns && 'babok_core_concepts' in pns);
    assert.equal(scorePnsQuality(pns).ready_for_publication, false);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});


test('a high PIR score cannot substitute for explicit readiness or a missing PNS', () => {
  const notReady = { validation: { completeness_score: 100, ready_for_narrative: false } };
  assert.equal(runValidationSuite({ pns: fixture, pir: notReady }).report.ready_for_publication, false);
  assert.equal(runValidationSuite({ pir }).report.ready_for_publication, false);
});

test('the downloaded YAML equals the canonical template and remains unpublishable', () => {
  const generator = fileURLToPath(new URL('../../../app/scripts/generate-skill-files.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [generator], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const downloaded = readFileSync(new URL('../../../app/public/pns-template.yaml', import.meta.url), 'utf8');
  const canonical = readFileSync(new URL('../assets/pns-template.yaml', import.meta.url), 'utf8');
  assert.equal(downloaded, canonical);
  assert.equal(scorePnsQuality(parseYaml(downloaded)).ready_for_publication, false);
});


test('the public lifecycle contains only states accepted by the transition checker', async () => {
  const { checkPnsStatusTransition } = await import('../../../scripts/check-pns-status-transition.mjs');
  const registry = readFileSync(new URL('../../../app/src/data/skills-registry.ts', import.meta.url), 'utf8');
  const lifecycle = registry.slice(registry.indexOf('export const PNS_LIFECYCLE'), registry.indexOf('export const PNS_SECTIONS'));
  const states = [...lifecycle.matchAll(/status: "([^"]+)"/g)].map(match => match[1]);
  assert.equal(states.length, 9);
  for (const status of states) assert.equal(checkPnsStatusTransition(status, status).valid, true, status);
});


test('all portable YAML readers preserve quoted versions and inline role lists', async () => {
  for (const skill of ['okhp3-process-intake-and-scope', 'okhp3-stakeholder-and-role-mapping',
    'okhp3-raci-governance-matrix', 'okhp3-sipoc-generation', 'okhp3-process-measures-controls',
    'okhp3-sop-work-instructions', 'okhp3-process-validation-scoring', 'okhp3-publication-handoff-packaging']) {
    const reader = await import(`../../${skill}/scripts/parse-yaml-minimal.mjs`);
    assert.deepEqual(reader.parseYaml('version: "0.1"\nroles: [requester, manager]\n'),
      { version: '0.1', roles: ['requester', 'manager'] }, skill);
  }
});
