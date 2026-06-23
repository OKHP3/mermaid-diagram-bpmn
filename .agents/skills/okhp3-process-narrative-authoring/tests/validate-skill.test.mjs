/**
 * validate-skill.test.mjs — process-narrative-authoring
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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'process-narrative-authoring');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('ISO 9001')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/pns-schema.md',
  'scripts/validate-pns.mjs',
  'scripts/score-pns-quality.mjs',
  'assets/fixtures/pns-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('pns-schema.md documents 13 required sections', () => {
  const content = read('references/pns-schema.md');
  assert.ok(content.includes('13 Required'), '13 Required Sections must be documented');
});

test('pns-schema.md documents 9-state lifecycle', () => {
  const content = read('references/pns-schema.md');
  assert.ok(content.includes('9 States'), 'PNS lifecycle states must be documented');
});

test('validatePns exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/validate-pns.mjs'));
  assert.equal(typeof mod.validatePns, 'function');
});

test('scorePnsQuality exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/score-pns-quality.mjs'));
  assert.equal(typeof mod.scorePnsQuality, 'function');
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
