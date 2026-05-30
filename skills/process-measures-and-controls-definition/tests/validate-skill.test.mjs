/**
 * validate-skill.test.mjs — process-measures-and-controls-definition
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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'process-measures-and-controls-definition');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('COSO') || read('SKILL.md').includes('ISO 9001')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/kpi-design-rules.md',
  'scripts/generate-measures-register.mjs',
  'assets/fixtures/measures-register-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('generateMeasuresRegister exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/generate-measures-register.mjs'));
  assert.equal(typeof mod.generateMeasuresRegister, 'function');
});

test('generateMeasuresRegister returns { valid, errors, warnings, measuresRegister, controlsRegister }', async () => {
  const { generateMeasuresRegister } = await import(join(SKILL_ROOT, 'scripts/generate-measures-register.mjs'));
  const result = generateMeasuresRegister({ process_id: 'test', kpis: [], controls_and_compliance: [] });
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(result.measuresRegister && typeof result.measuresRegister === 'object');
  assert.ok(result.controlsRegister && typeof result.controlsRegister === 'object');
});

test('kpi-design-rules.md documents 4 COSO control types', () => {
  const content = read('references/kpi-design-rules.md');
  for (const t of ['Preventive', 'Detective', 'Corrective', 'Directive']) {
    assert.ok(content.includes(t), `must document COSO control type: ${t}`);
  }
});

test('SKILL.md is status recommended-extension', () => {
  assert.ok(read('SKILL.md').includes('recommended-extension'));
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
