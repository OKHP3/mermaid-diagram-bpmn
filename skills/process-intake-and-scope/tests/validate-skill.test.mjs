/**
 * validate-skill.test.mjs — process-intake-and-scope
 * Run: node --test skills/process-intake-and-scope/tests/validate-skill.test.mjs
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

test('SKILL.md has valid frontmatter', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm, 'frontmatter must be present');
});

test('name matches directory', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.equal(fm.name, 'process-intake-and-scope');
});

test('bp_skill_version is present', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.bp_skill_version, 'bp_skill_version must be present');
});

test('standards_refs is non-empty', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('standards_refs'), 'standards_refs must be present');
  assert.ok(content.includes('BABOK'), 'standards_refs must reference BABOK');
});

test('description is 50–1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50, 'description must be ≥50 chars');
  assert.ok(fm.description.length <= 1024, 'description must be ≤1024 chars');
});

const REQUIRED_FILES = [
  'references/pir-schema.md',
  'scripts/generate-pir.mjs',
  'scripts/validate-pir.mjs',
  'scripts/score-intake-completeness.mjs',
  'assets/fixtures/intake-purchase-approval.yaml',
];

for (const f of REQUIRED_FILES) {
  test(`file exists: ${f}`, () => assert.ok(exists(f), `${f} must exist`));
}

test('scripts have no React/DOM imports', () => {
  const FORBIDDEN = ["from 'react'", 'from "react"', 'document.', 'window.'];
  for (const f of ['scripts/generate-pir.mjs']) {
    if (!exists(f)) continue;
    const src = read(f);
    for (const fb of FORBIDDEN) assert.ok(!src.includes(fb), `${f} must not use "${fb}"`);
  }
});

test('generatePir exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/generate-pir.mjs'));
  assert.equal(typeof mod.generatePir, 'function');
});

test('generatePir returns { valid, errors, warnings, pir }', async () => {
  const { generatePir } = await import(join(SKILL_ROOT, 'scripts/generate-pir.mjs'));
  const result = generatePir({ processName: 'Test Process' });
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(result.pir && typeof result.pir === 'object');
});

test('package.json has correct test script', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts?.test, 'node --test tests/*.test.mjs');
});
