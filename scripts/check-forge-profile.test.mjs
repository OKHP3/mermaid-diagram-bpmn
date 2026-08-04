#!/usr/bin/env node
/**
 * check-forge-profile.test.mjs
 *
 * Verifies that check-forge-profile.mjs:
 *   - exits 0 when all tokens match the profiles
 *   - exits 1 and names the drifted token when a CSS value changes
 *
 * Uses the env-var path overrides (FORGE_TOKENS_CSS_OVERRIDE,
 * INDEX_CSS_OVERRIDE) added to the script for testability.  Real
 * profile YAML files are always used so the tests stay in sync with
 * the actual profiles.
 *
 * Run:  node --test scripts/check-forge-profile.test.mjs
 *       pnpm run brand:check:test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = resolve(__dirname, '..');
const script    = resolve(__dirname, 'check-forge-profile.mjs');

const REAL_FORGE_TOKENS = resolve(root, 'app/src/styles/forge-tokens.css');
const REAL_INDEX_CSS    = resolve(root, 'app/src/index.css');

/** Spawn the check script and return { exitCode, stdout }. */
function runCheck(env = {}) {
  const result = spawnSync(process.execPath, [script], {
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    timeout: 15_000,
  });
  return {
    exitCode: result.status ?? 1,
    stdout:   (result.stdout ?? '') + (result.stderr ?? ''),
  };
}

/** Write content to a unique temp file and return its absolute path. */
function writeTmp(content, suffix = '.css') {
  const path = join(tmpdir(), `bpmn-brand-test-${randomBytes(6).toString('hex')}${suffix}`);
  writeFileSync(path, content, 'utf-8');
  return path;
}

// ─── 1. Sanity: real files pass ───────────────────────────────────────────────

test('exits 0 with real forge-tokens.css and index.css (no drift)', () => {
  const { exitCode } = runCheck();
  assert.equal(exitCode, 0, 'brand:check should exit 0 with the real source files');
});

// ─── 2. Drift in forge-tokens.css ────────────────────────────────────────────
// Inject a wrong value for --mermaid-primary-color (real value is #111827).

test('exits 1 when --mermaid-primary-color drifts from the diagram profile', () => {
  const original = readFileSync(REAL_FORGE_TOKENS, 'utf-8');
  const drifted  = original.replace(
    /--mermaid-primary-color\s*:\s*#111827\s*;/,
    '--mermaid-primary-color: #badbad;',
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const forgeFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ FORGE_TOKENS_CSS_OVERRIDE: forgeFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when --mermaid-primary-color drifts');
  assert.ok(
    stdout.includes('mermaid-primary-color') || stdout.includes('primaryColor'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});

// ─── 3. Drift in forge-tokens.css (code-panel primitive) ─────────────────────
// Inject a wrong value for --okh-forge-code-bg (real value is #0f1f1c).

test('exits 1 when --okh-forge-code-bg drifts from the diagram profile', () => {
  const original = readFileSync(REAL_FORGE_TOKENS, 'utf-8');
  const drifted  = original.replace(
    /--okh-forge-code-bg\s*:\s*#0f1f1c\s*;/,
    '--okh-forge-code-bg: #123456;',
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const forgeFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ FORGE_TOKENS_CSS_OVERRIDE: forgeFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when --okh-forge-code-bg drifts');
  assert.ok(
    stdout.includes('okh-forge-code-bg') || stdout.includes('diagram-bg'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});

// ─── 4. Drift in index.css ────────────────────────────────────────────────────
// Inject a wrong value for .forge-parse-error-text color (real value is #e87c5c).

test('exits 1 when .forge-parse-error-text color drifts from the diagram profile', () => {
  const original = readFileSync(REAL_INDEX_CSS, 'utf-8');
  const drifted  = original.replace(
    /\.forge-parse-error-text\s*\{[^}]*color\s*:\s*#e87c5c/s,
    m => m.replace('#e87c5c', '#ffffff'),
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const indexFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ INDEX_CSS_OVERRIDE: indexFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when forge-parse-error-text color drifts');
  assert.ok(
    stdout.includes('parse-error-text') || stdout.includes('error-text'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});

// ─── 5. Drift in forge-tokens.css (diagram-grid-size) ───────────────────────
// Inject a wrong value for --diagram-grid-size (real value is 24px).

test('exits 1 when --diagram-grid-size drifts from the diagram profile', () => {
  const original = readFileSync(REAL_FORGE_TOKENS, 'utf-8');
  const drifted  = original.replace(
    /--diagram-grid-size\s*:\s*24px\s*;/,
    '--diagram-grid-size: 99px;',
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const forgeFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ FORGE_TOKENS_CSS_OVERRIDE: forgeFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when --diagram-grid-size drifts');
  assert.ok(
    stdout.includes('diagram-grid-size') || stdout.includes('dot-grid'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});

// ─── 6. Drift in index.css (tab border) ──────────────────────────────────────
// Inject a wrong value for .forge-code-panel-tab border-color (real value is #2a3124).

test('exits 1 when .forge-code-panel-tab border-color drifts from the diagram profile', () => {
  const original = readFileSync(REAL_INDEX_CSS, 'utf-8');
  // Replace only the declaration value, not the comment that also contains #2a3124.
  const drifted  = original.replace(
    /border-color:\s*#2a3124(\s*!important)/,
    'border-color: #aabbcc$1',
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const indexFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ INDEX_CSS_OVERRIDE: indexFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when tab border-color drifts');
  assert.ok(
    stdout.includes('tab-border') || stdout.includes('forge-code-panel-tab'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});

// ─── 7. Drift in index.css (tab-fg-muted) ────────────────────────────────────
// Inject a wrong value for .forge-code-panel-tab color (real: rgba(230, 223, 201, 0.55)).

test('exits 1 when .forge-code-panel-tab color drifts from the diagram profile', () => {
  const original = readFileSync(REAL_INDEX_CSS, 'utf-8');
  const drifted  = original.replace(
    'color: rgba(230, 223, 201, 0.55);',
    'color: rgba(0, 0, 0, 0.55);',
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const indexFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ INDEX_CSS_OVERRIDE: indexFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when tab color drifts');
  assert.ok(
    stdout.includes('tab-fg-muted') || stdout.includes('forge-code-panel-tab'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});

// ─── 8. Drift in index.css (placeholder) ─────────────────────────────────────
// Inject a wrong value for .forge-code-panel::placeholder color (real: rgba(212, 201, 181, 0.30)).

test('exits 1 when .forge-code-panel::placeholder color drifts from the diagram profile', () => {
  const original = readFileSync(REAL_INDEX_CSS, 'utf-8');
  const drifted  = original.replace(
    'color: rgba(212, 201, 181, 0.30);',
    'color: rgba(0, 0, 0, 0.30);',
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const indexFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ INDEX_CSS_OVERRIDE: indexFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when placeholder color drifts');
  assert.ok(
    stdout.includes('placeholder') || stdout.includes('forge-code-panel'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});

// ─── 9. Drift in index.css (error-bg-tint) ───────────────────────────────────
// Inject a wrong value for .forge-parse-error-bar background (real: rgba(196, 106, 44, 0.12)).

test('exits 1 when .forge-parse-error-bar background drifts from the diagram profile', () => {
  const original = readFileSync(REAL_INDEX_CSS, 'utf-8');
  const drifted  = original.replace(
    /\.forge-parse-error-bar\s*\{[^}]*background\s*:\s*rgba\(196[^;]+;/s,
    m => m.replace(/background\s*:\s*rgba\(196[^;]+;/, 'background: rgba(0, 0, 0, 0.12);'),
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const indexFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ INDEX_CSS_OVERRIDE: indexFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when parse-error-bar background drifts');
  assert.ok(
    stdout.includes('error-bg-tint') || stdout.includes('parse-error-bar'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});

// ─── 10. Drift in index.css (error-border) ───────────────────────────────────
// Inject a wrong value for .forge-parse-error-bar border-color (real: #4a2018).

test('exits 1 when .forge-parse-error-bar border-color drifts from the diagram profile', () => {
  const original = readFileSync(REAL_INDEX_CSS, 'utf-8');
  const drifted  = original.replace(
    /\.forge-parse-error-bar\s*\{[^}]*border-color\s*:\s*#4a2018\s*;/s,
    m => m.replace('#4a2018', '#000000'),
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const indexFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ INDEX_CSS_OVERRIDE: indexFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when parse-error-bar border-color drifts');
  assert.ok(
    stdout.includes('error-border') || stdout.includes('parse-error-bar'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});
// ─── 11. Drift in forge-tokens.css (forge-grid-size) ─────────────────────────
// Inject a wrong value for --forge-grid-size (real value is 32px).

test('exits 1 when --forge-grid-size drifts from the forge profile', () => {
  const original = readFileSync(REAL_FORGE_TOKENS, 'utf-8');
  const drifted  = original.replace(
    /--forge-grid-size\s*:\s*32px\s*;/,
    '--forge-grid-size: 99px;',
  );
  assert.notEqual(original, drifted, 'fixture mutation must change the file content');

  const forgeFixture = writeTmp(drifted);
  const { exitCode, stdout } = runCheck({ FORGE_TOKENS_CSS_OVERRIDE: forgeFixture });

  assert.equal(exitCode, 1, 'brand:check should exit 1 when --forge-grid-size drifts');
  assert.ok(
    stdout.includes('forge-grid-size') || stdout.includes('grid.size'),
    `failure output should name the drifted token; got:\n${stdout}`,
  );
});
