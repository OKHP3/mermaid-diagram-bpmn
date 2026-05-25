/**
 * validate-skill.test.mjs
 * Validates the okhp3-process-discovery skill package against
 * the Agent Skills spec and project-specific acceptance criteria.
 *
 * Run: node --test skills/okhp3-process-discovery/tests/validate-skill.test.mjs
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

// --- Frontmatter parser (no external deps) ---
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

// === Structural tests ===

test('SKILL.md exists', () => {
  assert.ok(exists('SKILL.md'), 'SKILL.md must exist at skill root');
});

test('SKILL.md has valid YAML frontmatter', () => {
  const content = read('SKILL.md');
  const fm = parseFrontmatter(content);
  assert.ok(fm, 'SKILL.md must have YAML frontmatter delimited by ---');
});

test('name field equals okhp3-process-discovery', () => {
  const content = read('SKILL.md');
  const fm = parseFrontmatter(content);
  assert.equal(fm.name, 'okhp3-process-discovery', 'name must be okhp3-process-discovery');
});

test('parent directory matches name field', () => {
  const parts = SKILL_ROOT.split('/');
  const dirName = parts[parts.length - 1];
  assert.equal(dirName, 'okhp3-process-discovery', 'parent directory must match name field');
});

test('description is present and within 1024 characters', () => {
  const content = read('SKILL.md');
  const fm = parseFrontmatter(content);
  assert.ok(fm.description && fm.description.length > 0, 'description must be non-empty');
  assert.ok(fm.description.length <= 1024, `description must be <=1024 chars, got ${fm.description.length}`);
});

test('SKILL.md body is under 500 lines', () => {
  const content = read('SKILL.md');
  const lines = content.split('\n').length;
  assert.ok(lines <= 500, `SKILL.md must be under 500 lines, got ${lines}`);
});

test('license field is present', () => {
  const content = read('SKILL.md');
  const fm = parseFrontmatter(content);
  assert.ok(fm.license, 'license field must be present');
});

test('metadata.produces field contains pir.yaml', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('produces:'), 'SKILL.md frontmatter must include produces field');
  assert.ok(content.includes('pir.yaml'), 'produces must include pir.yaml');
});

test('metadata.produces field contains stakeholder-register.yaml', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('stakeholder-register.yaml'), 'produces must include stakeholder-register.yaml');
});

test('metadata.depends_on field is present', () => {
  const content = read('SKILL.md');
  assert.ok(content.includes('depends_on:'), 'SKILL.md frontmatter must include depends_on field');
});

// === Reference files exist ===

const EXPECTED_REFERENCES = [
  'references/babok-elicitation-techniques.md',
  'references/intake-question-framework.md',
  'references/stakeholder-identification-rules.md',
  'references/pir-schema.md',
  'references/scope-firewall.md',
];

for (const ref of EXPECTED_REFERENCES) {
  test(`reference file exists: ${ref}`, () => {
    assert.ok(exists(ref), `${ref} must exist`);
  });
}

// === Asset files exist ===

const EXPECTED_ASSETS = [
  'assets/pir-template.yaml',
  'assets/stakeholder-register-template.yaml',
];

for (const asset of EXPECTED_ASSETS) {
  test(`asset file exists: ${asset}`, () => {
    assert.ok(exists(asset), `${asset} must exist`);
  });
}

// === Fixture files exist ===

const EXPECTED_FIXTURES = [
  'assets/fixtures/intake-purchase-approval.yaml',
  'assets/fixtures/intake-support-triage.yaml',
  'assets/fixtures/intake-quote-to-order.yaml',
];

for (const fixture of EXPECTED_FIXTURES) {
  test(`fixture file exists: ${fixture}`, () => {
    assert.ok(exists(fixture), `${fixture} must exist`);
  });
}

test('all fixture YAML files are non-empty', () => {
  for (const f of EXPECTED_FIXTURES) {
    assert.ok(exists(f), `${f} must exist`);
    const content = read(f);
    assert.ok(content.trim().length > 0, `${f} must not be empty`);
  }
});

// === Script files exist ===

const EXPECTED_SCRIPTS = [
  'scripts/validate-pir.mjs',
  'scripts/generate-stakeholder-register.mjs',
  'scripts/score-intake-completeness.mjs',
];

for (const script of EXPECTED_SCRIPTS) {
  test(`script file exists: ${script}`, () => {
    assert.ok(exists(script), `${script} must exist`);
  });
}

// === No React/UI imports in scripts ===

test('scripts do not import React, Tailwind, or browser DOM APIs', () => {
  const FORBIDDEN_IMPORTS = [
    'from "react"', "from 'react'",
    'require("react")', "require('react')",
    'document.', 'window.', 'localStorage',
  ];
  for (const script of EXPECTED_SCRIPTS) {
    if (!exists(script)) continue;
    const content = read(script);
    for (const forbidden of FORBIDDEN_IMPORTS) {
      assert.ok(
        !content.includes(forbidden),
        `Script ${script} contains forbidden import/usage: "${forbidden}"`
      );
    }
  }
});

// === Scripts return the correct shape ===

test('validate-pir.mjs exports validatePir function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/validate-pir.mjs'));
  assert.ok(typeof mod.validatePir === 'function', 'validatePir must be a named export');
});

test('score-intake-completeness.mjs exports scoreIntakeCompleteness function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/score-intake-completeness.mjs'));
  assert.ok(typeof mod.scoreIntakeCompleteness === 'function', 'scoreIntakeCompleteness must be a named export');
});

test('generate-stakeholder-register.mjs exports generateStakeholderRegister function', async () => {
  const mod = await import(join(SKILL_ROOT, 'scripts/generate-stakeholder-register.mjs'));
  assert.ok(typeof mod.generateStakeholderRegister === 'function', 'generateStakeholderRegister must be a named export');
});

test('validatePir returns { valid, errors, warnings } shape', async () => {
  const { validatePir } = await import(join(SKILL_ROOT, 'scripts/validate-pir.mjs'));
  const result = validatePir({});
  assert.ok(typeof result.valid === 'boolean', 'valid must be boolean');
  assert.ok(Array.isArray(result.errors), 'errors must be array');
  assert.ok(Array.isArray(result.warnings), 'warnings must be array');
});

test('scoreIntakeCompleteness returns { score, ready_for_narrative, breakdown, warnings } shape', async () => {
  const { scoreIntakeCompleteness } = await import(join(SKILL_ROOT, 'scripts/score-intake-completeness.mjs'));
  const result = scoreIntakeCompleteness({});
  assert.ok(typeof result.score === 'number', 'score must be number');
  assert.ok(typeof result.ready_for_narrative === 'boolean', 'ready_for_narrative must be boolean');
  assert.ok(result.breakdown && typeof result.breakdown === 'object', 'breakdown must be object');
  assert.ok(Array.isArray(result.warnings), 'warnings must be array');
});

test('generateStakeholderRegister returns { valid, errors, warnings, register } shape', async () => {
  const { generateStakeholderRegister } = await import(join(SKILL_ROOT, 'scripts/generate-stakeholder-register.mjs'));
  const result = generateStakeholderRegister({});
  assert.ok(typeof result.valid === 'boolean', 'valid must be boolean');
  assert.ok(Array.isArray(result.errors), 'errors must be array');
  assert.ok(Array.isArray(result.warnings), 'warnings must be array');
});

// === Scope firewall — no BFS content ===

const ALL_SKILL_FILES = [
  'SKILL.md',
  ...EXPECTED_REFERENCES,
  ...EXPECTED_ASSETS,
  ...EXPECTED_SCRIPTS,
];

test('no BFS / Builders FirstSource strings in skill package (except scope-firewall.md)', () => {
  const FORBIDDEN = ['Builders FirstSource'];
  for (const relPath of ALL_SKILL_FILES) {
    if (relPath === 'references/scope-firewall.md') continue;
    if (!exists(relPath)) continue;
    const content = read(relPath);
    for (const term of FORBIDDEN) {
      assert.ok(
        !content.includes(term),
        `Forbidden term "${term}" found in ${relPath}`
      );
    }
  }
});

// === SKILL.md content quality ===

test('SKILL.md references okhp3-process-narrative as the downstream handoff', () => {
  const content = read('SKILL.md');
  assert.ok(
    content.includes('okhp3-process-narrative'),
    'SKILL.md must reference okhp3-process-narrative as the handoff target'
  );
});

test('SKILL.md references the 3-skill pipeline', () => {
  const content = read('SKILL.md');
  assert.ok(
    content.includes('okhp3-bpmn-for-mermaid'),
    'SKILL.md must reference okhp3-bpmn-for-mermaid as part of the pipeline'
  );
});

test('SKILL.md does not claim to produce BPMN diagrams', () => {
  const content = read('SKILL.md');
  const body = content.replace(/^---[\s\S]*?---/, '');
  const FORBIDDEN_CLAIMS = [
    'produces a bpmn',
    'generates a bpmn',
    'creates a bpmn diagram',
    'outputs a bpmn',
  ];
  for (const claim of FORBIDDEN_CLAIMS) {
    assert.ok(
      !body.toLowerCase().includes(claim),
      `SKILL.md body contains forbidden claim: "${claim}"`
    );
  }
});

test('package.json has correct test script', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts?.test, 'node --test tests/*.test.mjs', 'test script must be "node --test tests/*.test.mjs"');
});
