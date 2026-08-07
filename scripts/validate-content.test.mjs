#!/usr/bin/env node
/**
 * validate-content.test.mjs
 *
 * Verifies that validate-content.mjs:
 *   - exits 0 when all content claims match canonical sources
 *   - exits 1 (with an informative message) when the test-count claim is stale
 *   - exits 1 when a Mermaid version citation is wrong
 *   - exits 1 when a plugin version citation is wrong
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
const REAL_README      = resolve(ROOT, 'README.md');
const REAL_CAPABILITY  = resolve(ROOT, 'app/docs/capability-ledger.md');
const REAL_VERSION_DOC = resolve(ROOT, 'docs/version-checklist.md');

/** Write content to a unique temp file and return its path. */
function writeTmp(content, ext = '.md') {
  const p = join(tmpdir(), `bpmn-content-test-${randomBytes(6).toString('hex')}${ext}`);
  writeFileSync(p, content, 'utf-8');
  return p;
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
  const canon = JSON.parse(readFileSync(REAL_CANON, 'utf-8'));

  // Build a stale checklist: use a count that is clearly wrong
  const staleCount = canon.testCount + 999;
  const realContent = readFileSync(REAL_CHECKLIST, 'utf-8');

  // Replace the real count with the stale one
  const staleContent = realContent.replace(
    /(\d{3,4})\s+as of (\d{4}-\d{2}-\d{2})/,
    `${staleCount} as of $2`,
  );
  const stalePath = writeTmp(staleContent, '.md');

  const { exitCode, output } = runValidator({
    CONTENT_CHECKLIST_OVERRIDE: stalePath,
  });

  assert.equal(exitCode, 1, `expected exit 1 for stale test count; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('test-count') ||
    output.toLowerCase().includes('fail'),
    `output should mention test-count or fail; got:\n${output}`,
  );
});

test('validate-content exits 1 when content-canon.json testCount disagrees with checklist', () => {
  // Flip the situation: keep real checklist, inject a stale canon
  const realChecklist = readFileSync(REAL_CHECKLIST, 'utf-8');
  const realCanon     = JSON.parse(readFileSync(REAL_CANON, 'utf-8'));

  // A canon that claims a different count
  const staleCanon = { ...realCanon, testCount: realCanon.testCount + 999 };
  const staleCanonPath = writeTmp(JSON.stringify(staleCanon, null, 2), '.json');

  const { exitCode, output } = runValidator({
    CONTENT_CANON_OVERRIDE: staleCanonPath,
  });

  assert.equal(exitCode, 1, `expected exit 1 when canon disagrees; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('test-count') ||
    output.toLowerCase().includes('fail'),
    `output should mention test-count or fail; got:\n${output}`,
  );
});

// ─── Check 2: Mermaid version citation ───────────────────────────────────────

test('validate-content exits 1 when a mermaid@X.Y.Z citation is wrong', () => {
  // The mermaid@X.Y.Z citation lives in docs/version-checklist.md, not the
  // release-checklist — inject a stale version into version-checklist via its override.
  const realContent = readFileSync(REAL_VERSION_DOC, 'utf-8');

  // Confirm this file actually has the pattern before testing
  assert.ok(
    /mermaid@\d+\.\d+\.\d+/.test(realContent),
    'docs/version-checklist.md should contain a mermaid@X.Y.Z citation',
  );

  const staleContent = realContent.replace(
    /mermaid@(\d+\.\d+\.\d+)/,
    'mermaid@0.0.0-stale',
  );
  const stalePath = writeTmp(staleContent, '.md');

  const { exitCode, output } = runValidator({
    CONTENT_VERSION_DOC_OVERRIDE: stalePath,
  });

  assert.equal(exitCode, 1, `expected exit 1 for stale mermaid version; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('mermaid@') ||
    output.toLowerCase().includes('fail'),
    `output should mention mermaid@ citation; got:\n${output}`,
  );
});

// ─── Check 3: Plugin version citation ────────────────────────────────────────

test('validate-content exits 1 when a plugin version citation is wrong', () => {
  const realContent = readFileSync(REAL_VERSION_DOC, 'utf-8');

  const staleContent = realContent.replace(
    /@okhp3\/mermaid-diagram-bpmn@(\d+\.\d+\.\d+)/,
    '@okhp3/mermaid-diagram-bpmn@0.0.0-stale',
  );
  const stalePath = writeTmp(staleContent, '.md');

  const { exitCode, output } = runValidator({
    CONTENT_VERSION_DOC_OVERRIDE: stalePath,
  });

  assert.equal(exitCode, 1, `expected exit 1 for stale plugin version; output:\n${output}`);
  assert.ok(
    output.toLowerCase().includes('mermaid-diagram-bpmn') ||
    output.toLowerCase().includes('fail'),
    `output should mention plugin citation; got:\n${output}`,
  );
});
