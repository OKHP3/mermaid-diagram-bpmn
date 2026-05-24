/**
 * validate-skill.test.mjs
 * Skill metadata and file presence tests.
 * Runs with: node --test tests/validate-skill.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateBpmnBeta } from '../scripts/validate-bpmn-beta.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(__dirname, '..');

// ─── SKILL.md presence and frontmatter ───────────────────────────────────────

test('SKILL.md exists and is non-empty', () => {
  const path = resolve(skillRoot, 'SKILL.md');
  assert.ok(existsSync(path), 'SKILL.md must exist');
  const content = readFileSync(path, 'utf8');
  assert.ok(content.length > 100, 'SKILL.md must be non-empty (>100 chars)');
});

test('SKILL.md has valid YAML frontmatter block', () => {
  const content = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatterMatch, 'SKILL.md must have a YAML frontmatter block (--- delimited)');
});

test('SKILL.md name field exactly equals okhp3-bpmn-for-mermaid', () => {
  const content = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatterMatch, 'Frontmatter required');
  const nameMatch = frontmatterMatch[1].match(/^name:\s*(.+)$/m);
  assert.ok(nameMatch, 'name field must be present in frontmatter');
  assert.equal(nameMatch[1].trim(), 'okhp3-bpmn-for-mermaid', 'name field must exactly equal okhp3-bpmn-for-mermaid');
});

test('SKILL.md description is between 100 and 1024 characters', () => {
  const content = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatterMatch, 'Frontmatter required');
  const descMatch = frontmatterMatch[1].match(/^description:\s*(.+)$/m);
  assert.ok(descMatch, 'description field must be present in frontmatter');
  const desc = descMatch[1].trim();
  assert.ok(desc.length >= 100, `description must be ≥100 chars, got ${desc.length}`);
  assert.ok(desc.length <= 1024, `description must be ≤1024 chars, got ${desc.length}`);
});

test('SKILL.md contains dual compliance requirement statement', () => {
  const content = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
  assert.ok(
    content.includes('Dual Compliance') || content.includes('dual compliance'),
    'SKILL.md must contain the dual compliance requirement section'
  );
});

test('SKILL.md contains scope boundaries section', () => {
  const content = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
  assert.ok(
    content.includes('Scope Boundaries') || content.includes('Out of scope'),
    'SKILL.md must contain a scope boundaries section'
  );
});

test('SKILL.md does not contain full BPMN conformance claims', () => {
  const content = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8').toLowerCase();
  const forbidden = ['full bpmn 2.0 conformance', 'executable bpmn', 'bpmn xml compatible'];
  for (const phrase of forbidden) {
    assert.ok(!content.includes(phrase), `SKILL.md must not contain: "${phrase}"`);
  }
});

// ─── Reference files presence ─────────────────────────────────────────────────

const REQUIRED_REFERENCES = [
  'references/bpmn-beta-dsl-reference.md',
  'references/bpmn-2-element-catalog.md',
  'references/compliance-matrix.md',
  'references/pool-lane-message-flow-rules.md',
  'references/unsupported-and-deferred-features.md',
  'references/theming-integration.md',
  'references/scope-firewall.md',
];

for (const ref of REQUIRED_REFERENCES) {
  test(`reference file exists: ${ref}`, () => {
    const path = resolve(skillRoot, ref);
    assert.ok(existsSync(path), `Reference file must exist: ${ref}`);
    const content = readFileSync(path, 'utf8');
    assert.ok(content.length > 200, `Reference file must not be a stub (>200 chars): ${ref}`);
  });
}

// ─── Script files presence ────────────────────────────────────────────────────

const REQUIRED_SCRIPTS = [
  'scripts/validate-bpmn-beta.mjs',
  'scripts/normalize-bpmn-beta.mjs',
  'scripts/lint-process-model.mjs',
  'scripts/generate-element-inventory.mjs',
];

for (const script of REQUIRED_SCRIPTS) {
  test(`script file exists: ${script}`, () => {
    const path = resolve(skillRoot, script);
    assert.ok(existsSync(path), `Script file must exist: ${script}`);
  });
}

// ─── Asset JSON validity ──────────────────────────────────────────────────────

test('assets/element-vocabulary.json parses as valid JSON', () => {
  const path = resolve(skillRoot, 'assets/element-vocabulary.json');
  assert.ok(existsSync(path), 'element-vocabulary.json must exist');
  const content = readFileSync(path, 'utf8');
  let parsed;
  assert.doesNotThrow(() => { parsed = JSON.parse(content); }, 'element-vocabulary.json must be valid JSON');
  assert.ok(Array.isArray(parsed), 'element-vocabulary.json must be a JSON array');
  assert.ok(parsed.length > 0, 'element-vocabulary.json must have at least one entry');
});

test('assets/validation-rules.json parses as valid JSON', () => {
  const path = resolve(skillRoot, 'assets/validation-rules.json');
  assert.ok(existsSync(path), 'validation-rules.json must exist');
  const content = readFileSync(path, 'utf8');
  let parsed;
  assert.doesNotThrow(() => { parsed = JSON.parse(content); }, 'validation-rules.json must be valid JSON');
  assert.ok(Array.isArray(parsed), 'validation-rules.json must be a JSON array');
  assert.ok(parsed.length >= 12, `Must have at least 12 validation rules, got ${parsed.length}`);
});

test('all validation rule IDs are unique', () => {
  const content = readFileSync(resolve(skillRoot, 'assets/validation-rules.json'), 'utf8');
  const rules = JSON.parse(content);
  const ids = rules.map(r => r['rule-id']);
  const uniqueIds = new Set(ids);
  assert.equal(uniqueIds.size, ids.length, `Duplicate rule IDs found: ${ids.filter((id, i) => ids.indexOf(id) !== i).join(', ')}`);
});

// ─── Canonical examples presence and validity ─────────────────────────────────

const REQUIRED_EXAMPLES = [
  'assets/canonical-examples/purchase-order-approval.bpmn-beta.mmd',
  'assets/canonical-examples/support-ticket-triage.bpmn-beta.mmd',
  'assets/canonical-examples/employee-onboarding.bpmn-beta.mmd',
  'assets/canonical-examples/cross-pool-collaboration.bpmn-beta.mmd',
];

for (const example of REQUIRED_EXAMPLES) {
  test(`canonical example exists: ${example}`, () => {
    const path = resolve(skillRoot, example);
    assert.ok(existsSync(path), `Canonical example must exist: ${example}`);
  });

  test(`canonical example contains bpmn-beta keyword: ${example}`, () => {
    const path = resolve(skillRoot, example);
    const content = readFileSync(path, 'utf8');
    assert.ok(
      content.trim().startsWith('bpmn-beta') || content.includes('\nbpmn-beta\n') || content.includes('\nbpmn-beta'),
      `${example} must contain 'bpmn-beta' as the diagram type keyword`
    );
  });

  test(`canonical example passes validate-bpmn-beta with zero errors: ${example}`, () => {
    const path = resolve(skillRoot, example);
    const content = readFileSync(path, 'utf8');
    const result = validateBpmnBeta(content);
    assert.equal(
      result.errors.length,
      0,
      `${example} must pass validation with 0 errors. Got: ${JSON.stringify(result.errors)}`
    );
  });
}

// ─── SKILL.md references all required files ───────────────────────────────────

test('SKILL.md references all 7 required reference files', () => {
  const content = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
  const refs = [
    'bpmn-beta-dsl-reference.md',
    'bpmn-2-element-catalog.md',
    'compliance-matrix.md',
    'pool-lane-message-flow-rules.md',
    'unsupported-and-deferred-features.md',
    'theming-integration.md',
    'scope-firewall.md',
  ];
  for (const ref of refs) {
    assert.ok(content.includes(ref), `SKILL.md must reference: ${ref}`);
  }
});

test('SKILL.md references all 4 required script files', () => {
  const content = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
  const scripts = [
    'validate-bpmn-beta.mjs',
    'normalize-bpmn-beta.mjs',
    'lint-process-model.mjs',
    'generate-element-inventory.mjs',
  ];
  for (const script of scripts) {
    assert.ok(content.includes(script), `SKILL.md must reference: ${script}`);
  }
});
