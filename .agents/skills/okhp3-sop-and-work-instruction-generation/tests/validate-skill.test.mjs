/**
 * validate-skill.test.mjs — sop-and-work-instruction-generation
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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'sop-and-work-instruction-generation');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('ISO 9001')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/sop-structure-rules.md',
  'scripts/generate-sop.mjs',
  'assets/fixtures/sop-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('generateSop exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/generate-sop.mjs'));
  assert.equal(typeof mod.generateSop, 'function');
});

test('generateSop returns { valid, errors, warnings, sop } where sop is a string', async () => {
  const { generateSop } = await import(join(SKILL_ROOT, 'scripts/generate-sop.mjs'));
  const result = generateSop({ process_id: 'test', process_name: 'Test', status: 'approved' });
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.equal(typeof result.sop, 'string');
  assert.ok(result.sop.length > 0, 'sop output must not be empty string');
});

test('generateSop includes H1 heading with process name', async () => {
  const { generateSop } = await import(join(SKILL_ROOT, 'scripts/generate-sop.mjs'));
  const result = generateSop({ process_id: 'test', process_name: 'My Test Process', status: 'approved' });
  assert.ok(result.sop.includes('My Test Process'), 'SOP must include process name in H1');
});

test('sop-structure-rules.md documents all required SOP sections', () => {
  const content = read('references/sop-structure-rules.md');
  assert.ok(content.includes('Purpose'));
  assert.ok(content.includes('Scope'));
  assert.ok(content.includes('Responsibilities'));
  assert.ok(content.includes('Exception'));
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
