#!/usr/bin/env node
/**
 * validate-content.test.mjs
 *
 * Verifies that validate-content.mjs:
 *   - exits 0 when all content claims match canonical sources
 *   - exits 1 (with an informative message) when the test-count claim is stale
 *   - exits 1 when content-canon.json testCount disagrees with checklist
 *   - exits 1 when a Mermaid version citation is wrong (version-checklist.md)
 *   - exits 1 when a Mermaid version citation is wrong (capability-ledger.md)
 *   - exits 1 when a plugin version citation is wrong (version-checklist.md)
 *   - exits 1 when a required file is missing from the scan set
 *
 * The tests inject stale content via environment-variable overrides rather
 * than touching the real committed files.
 *
 * Run:  node --test scripts/validate-content.test.mjs
 *       pnpm run check:content:test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');

const VALIDATOR        = resolve(__dirname, 'validate-content.mjs');
const REAL_CHECKLIST   = resolve(ROOT, 'app/docs/release-checklist.md');
const REAL_CANON       = resolve(ROOT, 'scripts/content-canon.json');
const REAL_VERSION_DOC = resolve(ROOT, 'docs/version-checklist.md');
const REAL_LEDGER      = resolve(ROOT, 'docs/capability-ledger.md');
const REAL_HOME        = resolve(ROOT, 'app/src/pages/Home.tsx');
const REAL_AGENT_SKILLS = resolve(ROOT, 'app/src/pages/AgentSkills.tsx');

/** Write content to a unique temp file and return its path. */
function writeTmp(content, ext = '.md') {
  const p = join(tmpdir(), `bpmn-content-test-${randomBytes(6).toString('hex')}${ext}`);
  writeFileSync(p, content, 'utf-8');
  return p;
}

/** Path to a guaranteed non-existent file (for missing-file tests). */
function nonExistentPath() {
  return join(tmpdir(), `bpmn-missing-${randomBytes(6).toString('hex')}.md`);
}

/** Run validate-content.mjs with optional env-var overrides. */
function runValidator(env = {}) {
  const result = spawnSync(process.execPath, [VALIDATOR], {
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    timeout: 15_000,
  });
  return {
    exitCode: result.status ?? 1,
    output:   (result.stdout ?? '') + (result.stderr ?? ''),
  };
}

// ─── Baseline: clean run ──────────────────────────────────────────────────────

test('validate-content exits 0 when all claims match canonical sources', () => {
  const { exitCode, output } = runValidator();
  assert.equal(exitCode, 0, `expected exit 0; output:\n${output}`);
  assert.ok(output.includes('OK'), `output should contain OK; got:\n${output}`);
});

// ─── Check 1: Test count ──────────────────────────────────────────────────────

test('validate-content exits 1 when test count in release-checklist is stale', () => {
  const canon      = JSON.parse(readFileSync(REAL_CANON, 'utf-8'));
  const staleCount = canon.testCount + 999;
  const realContent = readFileSync(REAL_CHECKLIST, 'utf-8');

  const staleContent = realContent.replace(
    /(\d{3,4})\s+as of (\d{4}-\d{2}-\d{2})/,
    `${staleCount} as of $2`,
  );
  const stalePath = writeTmp(staleContent, '.md');

  const { exitCode, output } = runValidator({ CONTENT_CHECKLIST_OVERRIDE: stalePath });

  assert.equal(exitCode, 1, `expected exit 1 for stale test count; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('test-count') ||
    output.toLowerCase().includes('fail'),
    `output should mention test-count or fail; got:\n${output}`,
  );
});

test('validate-content exits 1 when content-canon.json testCount disagrees with checklist', () => {
  const realCanon  = JSON.parse(readFileSync(REAL_CANON, 'utf-8'));
  const staleCanon = { ...realCanon, testCount: realCanon.testCount + 999 };
  const staleCanonPath = writeTmp(JSON.stringify(staleCanon, null, 2), '.json');

  const { exitCode, output } = runValidator({ CONTENT_CANON_OVERRIDE: staleCanonPath });

  assert.equal(exitCode, 1, `expected exit 1 when canon disagrees; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('test-count') ||
    output.toLowerCase().includes('fail'),
    `output should mention test-count or fail; got:\n${output}`,
  );
});

// ─── Check 2: Mermaid version citation ───────────────────────────────────────

test('validate-content exits 1 when a mermaid citation is stale in version-checklist.md', () => {
  const realContent = readFileSync(REAL_VERSION_DOC, 'utf-8');

  assert.ok(
    /mermaid@\d+\.\d+\.\d+/.test(realContent),
    'docs/version-checklist.md should contain a mermaid@X.Y.Z citation',
  );

  const staleContent = realContent.replace(/mermaid@(\d+\.\d+\.\d+)/, 'mermaid@0.0.0-stale');
  const stalePath    = writeTmp(staleContent, '.md');

  const { exitCode, output } = runValidator({ CONTENT_VERSION_DOC_OVERRIDE: stalePath });

  assert.equal(exitCode, 1, `expected exit 1 for stale mermaid version; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('mermaid@') || output.toLowerCase().includes('fail'),
    `output should mention mermaid@; got:\n${output}`,
  );
});

test('validate-content exits 1 when a mermaid citation is stale in capability-ledger.md', () => {
  const realContent = readFileSync(REAL_LEDGER, 'utf-8');

  // If the ledger has no mermaid@ citation currently, inject one to prove the check fires.
  const hasCitation = /mermaid@\d+\.\d+\.\d+/.test(realContent);
  const testContent = hasCitation
    ? realContent.replace(/mermaid@(\d+\.\d+\.\d+)/, 'mermaid@0.0.0-stale')
    : realContent + '\nmermaid@0.0.0-stale cited here for test purposes\n';

  const stalePath = writeTmp(testContent, '.md');

  const { exitCode, output } = runValidator({ CONTENT_LEDGER_OVERRIDE: stalePath });

  assert.equal(exitCode, 1, `expected exit 1 for stale mermaid in ledger; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('mermaid@') || output.toLowerCase().includes('fail'),
    `output should mention mermaid@; got:\n${output}`,
  );
});

// ─── Check 3: Plugin version citation ────────────────────────────────────────

test('validate-content exits 1 when a plugin version citation is stale in version-checklist.md', () => {
  const realContent = readFileSync(REAL_VERSION_DOC, 'utf-8');
  const staleContent = realContent.replace(
    /@okhp3\/mermaid-diagram-bpmn@(\d+\.\d+\.\d+)/,
    '@okhp3/mermaid-diagram-bpmn@0.0.0-stale',
  );
  const stalePath = writeTmp(staleContent, '.md');

  const { exitCode, output } = runValidator({ CONTENT_VERSION_DOC_OVERRIDE: stalePath });

  assert.equal(exitCode, 1, `expected exit 1 for stale plugin version; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('mermaid-diagram-bpmn') || output.toLowerCase().includes('fail'),
    `output should mention plugin citation; got:\n${output}`,
  );
});

test('validate-content exits 1 when a plugin version citation is stale in capability-ledger.md', () => {
  const realContent = readFileSync(REAL_LEDGER, 'utf-8');

  assert.ok(
    /@okhp3\/mermaid-diagram-bpmn@\d+\.\d+\.\d+/.test(realContent),
    'docs/capability-ledger.md should contain an @okhp3/mermaid-diagram-bpmn@X.Y.Z citation',
  );

  const staleContent = realContent.replace(
    /@okhp3\/mermaid-diagram-bpmn@(\d+\.\d+\.\d+)/,
    '@okhp3/mermaid-diagram-bpmn@0.0.0-stale',
  );
  const stalePath = writeTmp(staleContent, '.md');

  const { exitCode, output } = runValidator({ CONTENT_LEDGER_OVERRIDE: stalePath });

  assert.equal(exitCode, 1, `expected exit 1 for stale plugin in ledger; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('mermaid-diagram-bpmn') || output.toLowerCase().includes('fail'),
    `output should mention plugin citation; got:\n${output}`,
  );
});

// ─── Required-file enforcement ────────────────────────────────────────────────

test('validate-content exits 1 when the capability ledger is missing', () => {
  const { exitCode, output } = runValidator({
    CONTENT_LEDGER_OVERRIDE: nonExistentPath(),
  });

  assert.equal(exitCode, 1, `expected exit 1 for missing ledger; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('not found') ||
    output.toLowerCase().includes('missing') ||
    output.toLowerCase().includes('fail'),
    `output should mention missing/not found; got:\n${output}`,
  );
});

// ─── Check 4: Banned claims ───────────────────────────────────────────────────

test('validate-content exits 1 when Home.tsx contains the retired "Zero implement" phrase', () => {
  // Inject the retired BABOK uniqueness claim into a copy of Home.tsx.
  const realContent = readFileSync(REAL_HOME, 'utf-8');
  const staleContent = realContent +
    '\n// INJECTED FOR TEST: Zero implement a BABOK knowledge area\n';
  const stalePath = writeTmp(staleContent, '.tsx');

  const { exitCode, output } = runValidator({ CONTENT_HOME_OVERRIDE: stalePath });

  assert.equal(exitCode, 1, `expected exit 1 for banned phrase "Zero implement"; output:\n${output}`);
  assert.ok(
    output.includes('Zero implement') || output.toLowerCase().includes('fail'),
    `output should mention the banned phrase; got:\n${output}`,
  );
});

test('validate-content exits 1 when Home.tsx contains the stale "89,000+" ecosystem figure', () => {
  const realContent = readFileSync(REAL_HOME, 'utf-8');
  const staleContent = realContent +
    '\n// INJECTED FOR TEST: 89,000+ skills on agentskills.io\n';
  const stalePath = writeTmp(staleContent, '.tsx');

  const { exitCode, output } = runValidator({ CONTENT_HOME_OVERRIDE: stalePath });

  assert.equal(exitCode, 1, `expected exit 1 for stale figure "89,000+"; output:\n${output}`);
  assert.ok(
    output.includes('89,000+') || output.toLowerCase().includes('fail'),
    `output should mention the banned phrase; got:\n${output}`,
  );
});

test('validate-content exits 1 when AgentSkills.tsx contains the retired "Zero implement" phrase', () => {
  const realContent = readFileSync(REAL_AGENT_SKILLS, 'utf-8');
  const staleContent = realContent +
    '\n// INJECTED FOR TEST: Zero implement a BABOK knowledge area\n';
  const stalePath = writeTmp(staleContent, '.tsx');

  const { exitCode, output } = runValidator({ CONTENT_AGENT_SKILLS_OVERRIDE: stalePath });

  assert.equal(exitCode, 1, `expected exit 1 for banned phrase in AgentSkills.tsx; output:\n${output}`);
  assert.ok(
    output.includes('Zero implement') || output.toLowerCase().includes('fail'),
    `output should mention the banned phrase; got:\n${output}`,
  );
});

test('validate-content exits 1 when Home.tsx source file is missing from banned-claims scan', () => {
  const { exitCode, output } = runValidator({
    CONTENT_HOME_OVERRIDE: nonExistentPath(),
  });

  assert.equal(exitCode, 1, `expected exit 1 for missing Home.tsx; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('not found') ||
    output.toLowerCase().includes('missing') ||
    output.toLowerCase().includes('fail'),
    `output should mention missing/not found; got:\n${output}`,
  );
});

test('validate-content exits 1 when Home.tsx contains the retired "first standards-conformant" uniqueness claim', () => {
  // Checks both the exact casing used in docs/promotion-strategy.md and a
  // capitalised variant to confirm the comparison is case-insensitive.
  const realContent = readFileSync(REAL_HOME, 'utf-8');

  // Lowercase variant (as it appears in the promotion-strategy retirement note)
  const staleContentLower = realContent +
    '\n// INJECTED FOR TEST: BP-SKILL is the first standards-conformant skill suite\n';
  const stalePathLower = writeTmp(staleContentLower, '.tsx');

  const { exitCode: exitLower, output: outputLower } =
    runValidator({ CONTENT_HOME_OVERRIDE: stalePathLower });

  assert.equal(exitLower, 1,
    `expected exit 1 for "first standards-conformant" (lowercase); output:\n${outputLower}`);
  assert.ok(
    outputLower.toLowerCase().includes('first standards-conformant') ||
    outputLower.toLowerCase().includes('fail'),
    `output should mention the banned phrase; got:\n${outputLower}`,
  );

  // Capitalised variant — confirms case-insensitive matching
  const staleContentCaps = realContent +
    '\n// INJECTED FOR TEST: BP-SKILL is the First Standards-Conformant skill suite\n';
  const stalePathCaps = writeTmp(staleContentCaps, '.tsx');

  const { exitCode: exitCaps, output: outputCaps } =
    runValidator({ CONTENT_HOME_OVERRIDE: stalePathCaps });

  assert.equal(exitCaps, 1,
    `expected exit 1 for "First Standards-Conformant" (caps); output:\n${outputCaps}`);
  assert.ok(
    outputCaps.toLowerCase().includes('first standards-conformant') ||
    outputCaps.toLowerCase().includes('fail'),
    `output should mention the banned phrase; got:\n${outputCaps}`,
  );
});
