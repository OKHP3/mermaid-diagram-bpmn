/**
 * validate-skill.test.mjs
 * Structural validation of the okhp3-process-narrative skill package.
 *
 * Run: node --test tests/validate-skill.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dir, '..');

function read(relPath) {
  return readFileSync(join(SKILL_ROOT, relPath), 'utf-8');
}
function exists(relPath) {
  return existsSync(join(SKILL_ROOT, relPath));
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    fm[key] = val;
  }
  return fm;
}

// === Structural ===

test('SKILL.md exists', () => {
  assert.ok(exists('SKILL.md'), 'SKILL.md must exist at skill root');
});

test('SKILL.md has valid YAML frontmatter', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm, 'SKILL.md must have frontmatter delimited by ---');
});

test('name field equals okhp3-process-narrative', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.equal(fm.name, 'okhp3-process-narrative');
});

test('parent directory matches name field', () => {
  const parts = SKILL_ROOT.split('/');
  assert.equal(parts[parts.length - 1], 'okhp3-process-narrative');
});

test('description is present and within 1024 characters', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.description && fm.description.length > 0, 'description must be non-empty');
  assert.ok(fm.description.length <= 1024, `description must be ≤1024 chars, got ${fm.description.length}`);
});

test('SKILL.md body is under 500 lines', () => {
  const lines = read('SKILL.md').split('\n').length;
  assert.ok(lines <= 500, `SKILL.md must be under 500 lines, got ${lines}`);
});

test('license field is present', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.license, 'license field must be present');
});

// === Pipeline metadata ===

test('consumes field references pir.yaml', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.consumes && fm.consumes.includes('pir.yaml'), 'consumes must reference pir.yaml');
});

test('consumes field references stakeholder-register.yaml', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.consumes && fm.consumes.includes('stakeholder-register.yaml'), 'consumes must reference stakeholder-register.yaml');
});

test('produces field references pns.yaml', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.produces && fm.produces.includes('pns.yaml'), 'produces must reference pns.yaml');
});

test('depends_on references okhp3-process-discovery', () => {
  const fm = parseFrontmatter(read('SKILL.md'));
  assert.ok(fm.depends_on && fm.depends_on.includes('okhp3-process-discovery'), 'depends_on must reference okhp3-process-discovery');
});

// === Reference files ===

const EXPECTED_REFERENCES = [
  'references/pns-schema.md',
  'references/iso9001-process-box-rules.md',
  'references/babok-core-concept-model.md',
  'references/validation-rules.md',
  'references/scope-firewall.md',
];

for (const ref of EXPECTED_REFERENCES) {
  test(`reference file exists: ${ref}`, () => {
    assert.ok(exists(ref), `${ref} must exist`);
  });
}

// === Asset files ===

const EXPECTED_ASSETS = [
  'assets/pns-template.yaml',
  'assets/fixtures/pns-purchase-approval.yaml',
  'assets/fixtures/pns-support-triage.yaml',
  'assets/fixtures/pns-quote-to-order.yaml',
];

for (const asset of EXPECTED_ASSETS) {
  test(`asset file exists: ${asset}`, () => {
    assert.ok(exists(asset), `${asset} must exist`);
  });
}

// === Script files ===

const EXPECTED_SCRIPTS = [
  'scripts/parse-yaml-minimal.mjs',
  'scripts/validate-pns.mjs',
  'scripts/score-pns-quality.mjs',
  'scripts/generate-sipoc.mjs',
  'scripts/generate-raci.mjs',
  'scripts/extract-business-rules.mjs',
];

for (const script of EXPECTED_SCRIPTS) {
  test(`script file exists: ${script}`, () => {
    assert.ok(exists(script), `${script} must exist`);
  });
}

// === Script exports return-shape contract ===

test('validate-pns.mjs exports validatePns function', async () => {
  const mod = await import('../scripts/validate-pns.mjs');
  assert.equal(typeof mod.validatePns, 'function', 'validatePns must be exported');
});

test('validatePns returns { valid, errors, warnings, rules_fired }', async () => {
  const { validatePns } = await import('../scripts/validate-pns.mjs');
  const result = validatePns({});
  assert.ok(typeof result.valid === 'boolean', 'valid must be boolean');
  assert.ok(Array.isArray(result.errors), 'errors must be array');
  assert.ok(Array.isArray(result.warnings), 'warnings must be array');
  assert.ok(Array.isArray(result.rules_fired), 'rules_fired must be array');
});

test('score-pns-quality.mjs exports scorePnsQuality function', async () => {
  const mod = await import('../scripts/score-pns-quality.mjs');
  assert.equal(typeof mod.scorePnsQuality, 'function');
});

test('scorePnsQuality returns { valid, errors, warnings, score, ready_for_publication, breakdown }', async () => {
  const { scorePnsQuality } = await import('../scripts/score-pns-quality.mjs');
  const result = scorePnsQuality({});
  assert.ok(typeof result.valid === 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(typeof result.score === 'number');
  assert.ok(typeof result.ready_for_publication === 'boolean');
  assert.ok(result.breakdown && typeof result.breakdown === 'object');
});

test('generate-sipoc.mjs exports generateSipoc function', async () => {
  const mod = await import('../scripts/generate-sipoc.mjs');
  assert.equal(typeof mod.generateSipoc, 'function');
});

test('generateSipoc returns { valid, errors, warnings, sipoc }', async () => {
  const { generateSipoc } = await import('../scripts/generate-sipoc.mjs');
  const result = generateSipoc({});
  assert.ok(typeof result.valid === 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
});

test('generate-raci.mjs exports generateRaci function', async () => {
  const mod = await import('../scripts/generate-raci.mjs');
  assert.equal(typeof mod.generateRaci, 'function');
});

test('generateRaci returns { valid, errors, warnings, raci }', async () => {
  const { generateRaci } = await import('../scripts/generate-raci.mjs');
  const result = generateRaci({});
  assert.ok(typeof result.valid === 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
});

test('extract-business-rules.mjs exports extractBusinessRules function', async () => {
  const mod = await import('../scripts/extract-business-rules.mjs');
  assert.equal(typeof mod.extractBusinessRules, 'function');
});

test('extractBusinessRules returns { valid, errors, warnings, rules }', async () => {
  const { extractBusinessRules } = await import('../scripts/extract-business-rules.mjs');
  const result = extractBusinessRules({});
  assert.ok(typeof result.valid === 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(Array.isArray(result.rules));
});

// === Scope firewall — no employer-owned content strings ===

const ALL_SKILL_FILES = [
  'SKILL.md',
  ...EXPECTED_REFERENCES.filter((f) => f !== 'references/scope-firewall.md'),
  ...EXPECTED_SCRIPTS,
];

test('no employer name strings in skill package (except scope-firewall.md)', () => {
  const EMPLOYER = 'Builder' + 's' + '\x20' + 'First' + 'Source';
  for (const relPath of ALL_SKILL_FILES) {
    if (!exists(relPath)) continue;
    const content = read(relPath);
    assert.ok(
      !content.includes(EMPLOYER),
      `Employer name found in ${relPath}`
    );
  }
});

// === No React/DOM imports in scripts ===

test('scripts do not import React or browser DOM APIs', () => {
  const FORBIDDEN = ["from 'react'", 'from "react"', 'document.', 'window.', 'localStorage'];
  for (const script of EXPECTED_SCRIPTS) {
    if (!exists(script)) continue;
    const content = read(script);
    for (const f of FORBIDDEN) {
      assert.ok(!content.includes(f), `Script ${script} contains forbidden: "${f}"`);
    }
  }
});

// === Fixture files are non-empty and contain required top-level keys ===

for (const fixture of EXPECTED_ASSETS.filter((f) => f.startsWith('assets/fixtures/'))) {
  test(`fixture is non-empty and has pns_version: ${fixture}`, () => {
    assert.ok(exists(fixture), `${fixture} must exist`);
    const content = read(fixture);
    assert.ok(content.trim().length > 100, `${fixture} must not be near-empty`);
    assert.ok(content.includes('pns_version:'), `${fixture} must contain pns_version:`);
    assert.ok(content.includes('process_id:'), `${fixture} must contain process_id:`);
    assert.ok(content.includes('sections:'), `${fixture} must contain sections:`);
  });
}

// === Pipeline references ===

test('SKILL.md references okhp3-process-discovery as predecessor', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('okhp3-process-discovery'), 'SKILL.md must reference okhp3-process-discovery');
});

test('SKILL.md references okhp3-bpmn-for-mermaid as successor', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('okhp3-bpmn-for-mermaid'), 'SKILL.md must reference the next skill in the pipeline');
});

test('SKILL.md references pns.yaml handoff to successor', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('pns.yaml'), 'SKILL.md must mention the pns.yaml handoff artifact');
});
