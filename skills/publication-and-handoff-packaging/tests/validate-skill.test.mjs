/**
 * validate-skill.test.mjs — publication-and-handoff-packaging
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'publication-and-handoff-packaging');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('standards_refs non-empty', () => assert.ok(read('SKILL.md').includes('ISO 9001')));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/publication-checklist.md',
  'scripts/build-publication-bundle.mjs',
  'assets/fixtures/handoff-manifest-example.yaml',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('buildPublicationBundle exports named function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/build-publication-bundle.mjs'));
  assert.equal(typeof mod.buildPublicationBundle, 'function');
});

test('buildPublicationBundle returns error for missing dir', async () => {
  const { buildPublicationBundle } = await import(join(SKILL_ROOT, 'scripts/build-publication-bundle.mjs'));
  const result = buildPublicationBundle('/nonexistent/path/proc-test');
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('buildPublicationBundle returns { valid, errors, warnings, manifest, approvals } shape', async () => {
  const { buildPublicationBundle } = await import(join(SKILL_ROOT, 'scripts/build-publication-bundle.mjs'));
  // Create a minimal temp dir with required files
  const tmp = join(tmpdir(), `bp-skill-test-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  const required = ['pir.yaml', 'pns.yaml', 'bpmn-beta.mmd', 'sop.md'];
  for (const f of required) writeFileSync(join(tmp, f), `# ${f}\n`);
  writeFileSync(join(tmp, 'validation-report.yaml'), 'ready_for_publication: true\n');
  const result = buildPublicationBundle(tmp, { processId: 'test', qualityBand: 'B', compositeScore: 80 });
  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
});

test('publication-checklist.md documents required artifact list', () => {
  const content = read('references/publication-checklist.md');
  assert.ok(content.includes('pir.yaml'));
  assert.ok(content.includes('pns.yaml'));
  assert.ok(content.includes('bpmn-beta.mmd'));
  assert.ok(content.includes('sop.md'));
});

test('package.json test script correct', () => {
  assert.equal(JSON.parse(read('package.json')).scripts?.test, 'node --test tests/*.test.mjs');
});
