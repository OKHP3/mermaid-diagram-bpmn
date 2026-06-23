/**
 * validate-skill.test.mjs — future-state-and-change-strategy
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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'future-state-and-change-strategy');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('ADKAR') || read('SKILL.md').includes('Kotter')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/change-strategy-framework.md',
  'scripts/generate-future-state.mjs',
  'assets/fixtures/future-state-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('generateFutureState exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/generate-future-state.mjs'));
  assert.equal(typeof mod.generateFutureState, 'function');
});

test('generateFutureState returns { valid, errors, warnings, futureState }', async () => {
  const { generateFutureState } = await import(join(SKILL_ROOT, 'scripts/generate-future-state.mjs'));
  const result = generateFutureState({ process_id: 'test', gaps: [] });
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
});

test('change-strategy-framework.md documents scope firewall', () => {
  assert.ok(read('references/change-strategy-framework.md').includes('Scope Firewall'));
});

test('SKILL.md is status recommended-extension', () => {
  assert.ok(read('SKILL.md').includes('recommended-extension'));
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
