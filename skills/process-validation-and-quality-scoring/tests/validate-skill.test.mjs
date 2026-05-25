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
