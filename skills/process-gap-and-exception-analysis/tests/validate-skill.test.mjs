/**
 * validate-skill.test.mjs — process-gap-and-exception-analysis
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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'process-gap-and-exception-analysis');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('ISO 9001') || read('SKILL.md').includes('BABOK')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/gap-analysis-framework.md',
  'scripts/analyze-gaps.mjs',
  'assets/fixtures/gap-analysis-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('analyzeGaps exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/analyze-gaps.mjs'));
  assert.equal(typeof mod.analyzeGaps, 'function');
});

test('analyzeGaps returns { valid, errors, warnings, gaps, exceptionCatalog, summary }', async () => {
  const { analyzeGaps } = await import(join(SKILL_ROOT, 'scripts/analyze-gaps.mjs'));
  const result = analyzeGaps({ process_id: 'test', steps: [] });
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.gaps));
  assert.ok(typeof result.summary === 'object');
});

test('gap-analysis-framework.md documents 4 gap types', () => {
  const content = read('references/gap-analysis-framework.md');
  assert.ok(content.includes('Type 1'), 'must document Type 1 (Structural)');
  assert.ok(content.includes('Type 2'), 'must document Type 2 (Execution)');
  assert.ok(content.includes('Type 3'), 'must document Type 3 (Exception)');
  assert.ok(content.includes('Type 4'), 'must document Type 4 (Compliance)');
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
