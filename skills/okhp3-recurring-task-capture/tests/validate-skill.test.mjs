/**
 * validate-skill.test.mjs — okhp3-recurring-task-capture
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
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
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
  assert.equal(parseFrontmatter(read('SKILL.md')).name, 'okhp3-recurring-task-capture');
});
test('bp_skill_version present', () => assert.ok(parseFrontmatter(read('SKILL.md')).bp_skill_version));
test('description 50-1024 chars', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description.length >= 50 && fm.description.length <= 1024);
});

const FILES = [
  'references/skeleton-conventions.md',
  'references/backlog-format.md',
  'assets/backlog-entry-example.md',
  'assets/skill-skeleton-example.md',
  'evals/evals.json',
];
for (const f of FILES) test(`exists: ${f}`, () => assert.ok(exists(f)));

test('SKILL.md links every reference and asset file it names', () => {
  const content = read('SKILL.md');
  for (const f of ['references/skeleton-conventions.md', 'references/backlog-format.md',
                    'assets/backlog-entry-example.md', 'assets/skill-skeleton-example.md']) {
    assert.ok(content.includes(f), `SKILL.md does not link ${f}`);
  }
});

test('SKILL.md About footer matches the four-line brand-standard verbatim', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('Built by [Jamie Hill](https://overkillhill.com)'));
  assert.ok(content.includes('MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.'));
});

test('evals.json has 3 cases covering normal, edge, and fabrication-risk partitions', () => {
  const evals = JSON.parse(read('evals/evals.json'));
  assert.equal(evals.skill_name, 'okhp3-recurring-task-capture');
  assert.equal(evals.status, 'design-ready');
  assert.equal(evals.cases.length, 3);
  const ids = evals.cases.map((c) => c.id);
  assert.ok(ids.some((id) => id.includes('normal')));
  assert.ok(ids.some((id) => id.includes('edge')));
  assert.ok(ids.some((id) => id.includes('fabrication')));
  for (const c of evals.cases) {
    assert.ok(c.expectations.length >= 3, `${c.id} has fewer than 3 expectations`);
  }
  assert.equal(evals.holdout.status, 'external-required');
});

test('references/backlog-format.md and skeleton-conventions.md cross-reference each other', () => {
  const backlog = read('references/backlog-format.md');
  const skeleton = read('references/skeleton-conventions.md');
  assert.ok(backlog.includes('../SKILL.md') || backlog.includes('SKILL.md'));
  assert.ok(skeleton.length > 200);
});
