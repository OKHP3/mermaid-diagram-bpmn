#!/usr/bin/env node
/**
 * check-generated.test.mjs
 *
 * Verifies that the --check mode of both generator scripts:
 *   - exits 0 when the committed file is up to date (fresh run matches)
 *   - exits 1 when the committed file has drifted (a stale line was appended)
 *
 * Both scripts support a COMMITTED_OUT env-var override so the test can
 * inject a fake "committed" file without touching the real generated files.
 *
 * Run:  node --test scripts/check-generated.test.mjs
 *       pnpm run check:generated:test
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

const PNS_SCRIPT       = resolve(__dirname, 'extract-pns-transitions.mjs');
const DEPS_SCRIPT      = resolve(__dirname, 'extract-skill-deps.mjs');
const REAL_PNS_FILE    = resolve(root, 'app/src/data/pns-transitions-auto.ts');
const REAL_DEPS_FILE   = resolve(root, 'app/src/data/skill-deps-auto.ts');

/** Write content to a unique temp .ts file and return its absolute path. */
function writeTmp(content) {
  const p = join(tmpdir(), `bpmn-gen-test-${randomBytes(6).toString('hex')}.ts`);
  writeFileSync(p, content, 'utf-8');
  return p;
}

/** Run a script in --check mode with optional env-var overrides. */
function runCheck(scriptPath, env = {}) {
  const result = spawnSync(process.execPath, [scriptPath, '--check'], {
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    timeout: 20_000,
  });
  return {
    exitCode: result.status ?? 1,
    output:   (result.stdout ?? '') + (result.stderr ?? ''),
  };
}

// ─── extract-pns-transitions.mjs ─────────────────────────────────────────────

test('pns-transitions --check exits 0 when committed file is up to date', () => {
  // Point COMMITTED_OUT at the real committed file — generator output should match.
  const { exitCode } = runCheck(PNS_SCRIPT, {
    PNS_TRANSITIONS_COMMITTED_OVERRIDE: REAL_PNS_FILE,
  });
  assert.equal(exitCode, 0, 'should exit 0 when pns-transitions-auto.ts is current');
});

test('pns-transitions --check exits 1 when committed file has a stale line', () => {
  // Append a whitespace comment to make the "committed" file differ from fresh output.
  const original = readFileSync(REAL_PNS_FILE, 'utf-8');
  const stale    = original + '// stale-marker\n';
  const stalePath = writeTmp(stale);

  const { exitCode, output } = runCheck(PNS_SCRIPT, {
    PNS_TRANSITIONS_COMMITTED_OVERRIDE: stalePath,
  });

  assert.equal(exitCode, 1, 'should exit 1 when pns-transitions-auto.ts is stale');
  assert.ok(
    output.toLowerCase().includes('stale') || output.toLowerCase().includes('fail'),
    `failure output should mention stale/fail; got:\n${output}`,
  );
});

// ─── extract-skill-deps.mjs ───────────────────────────────────────────────────

test('skill-deps --check exits 0 when committed file is up to date', () => {
  const { exitCode } = runCheck(DEPS_SCRIPT, {
    SKILL_DEPS_COMMITTED_OVERRIDE: REAL_DEPS_FILE,
  });
  assert.equal(exitCode, 0, 'should exit 0 when skill-deps-auto.ts is current');
});

test('skill-deps --check exits 1 when committed file has a stale line', () => {
  const original  = readFileSync(REAL_DEPS_FILE, 'utf-8');
  const stale     = original + '// stale-marker\n';
  const stalePath = writeTmp(stale);

  const { exitCode, output } = runCheck(DEPS_SCRIPT, {
    SKILL_DEPS_COMMITTED_OVERRIDE: stalePath,
  });

  assert.equal(exitCode, 1, 'should exit 1 when skill-deps-auto.ts is stale');
  assert.ok(
    output.toLowerCase().includes('stale') || output.toLowerCase().includes('fail'),
    `failure output should mention stale/fail; got:\n${output}`,
  );
});
