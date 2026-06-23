/**
 * validate-skill.test.mjs — visual-process-modeling
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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'visual-process-modeling');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('BPMN')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/bpmn-beta-syntax.md',
  'scripts/validate-bpmn-beta.mjs',
  'scripts/normalize-bpmn-beta.mjs',
  'scripts/repair-bpmn-beta.mjs',
  'scripts/lint-process-model.mjs',
  'assets/fixtures/process-model-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('SKILL.md documents DMN trigger rule (≥3 gateways)', () => {
  assert.ok(read('SKILL.md').includes('≥3') || read('SKILL.md').includes('>= 3') || read('SKILL.md').includes('three or more'));
});

test('validateBpmnBeta exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/validate-bpmn-beta.mjs'));
  assert.equal(typeof mod.validateBpmnBeta, 'function');
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
