/**
 * validate-skill.test.mjs — as-is-process-capture
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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'as-is-process-capture');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('BPM CBOK')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/as-is-capture-rules.md',
  'scripts/assign-step-ids.mjs',
  'assets/fixtures/as-is-process-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('assignStepIds exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/assign-step-ids.mjs'));
  assert.equal(typeof mod.assignStepIds, 'function');
});

test('assignStepIds returns { valid, errors, warnings, steps }', async () => {
  const { assignStepIds } = await import(join(SKILL_ROOT, 'scripts/assign-step-ids.mjs'));
  const result = assignStepIds([{ description: 'Submit form', actor_role_id: 'role-a' }]);
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.steps));
  assert.equal(result.steps[0].id, 'act-001');
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
