#!/usr/bin/env node
/**
 * Regression tests for check-version-status.mjs.
 *
 * The fixtures are copied from the real checklist and edited in /tmp so each
 * test proves a specific release-state drift condition fails the validator.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const VALIDATOR = resolve(__dirname, 'check-version-status.mjs');
const REAL_CHECKLIST = resolve(ROOT, 'docs/version-checklist.md');

function writeFixture(content) {
  const path = join(tmpdir(), `bpmn-version-status-${randomBytes(6).toString('hex')}.md`);
  writeFileSync(path, content, 'utf8');
  return path;
}

function runValidator(checklistPath) {
  const result = spawnSync(process.execPath, [VALIDATOR], {
    encoding: 'utf8',
    env: {
      ...process.env,
      ...(checklistPath ? { VERSION_CHECKLIST_OVERRIDE: checklistPath } : {}),
    },
    timeout: 15_000,
  });
  return {
    exitCode: result.status ?? 1,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

function realChecklist() {
  return readFileSync(REAL_CHECKLIST, 'utf8');
}

test('check-version-status exits 0 for the authoritative checklist', () => {
  const { exitCode, output } = runValidator();
  assert.equal(exitCode, 0, `expected exit 0; output:\n${output}`);
  assert.match(output, /V0\.4 is the lowest incomplete \[CURRENT\]/);
});

test('fails when a [DONE] section contains an unchecked criterion', () => {
  const fixture = realChecklist().replace(
    '### V0.3 — BP-SKILL suite — 15-skill pipeline scaffolded `[DONE]`',
    '### V0.3 — BP-SKILL suite — 15-skill pipeline scaffolded `[DONE]`',
  ).replace(
    '- [x] 15-skill pipeline designed and documented (`skills/*/SKILL.md`)',
    '- [ ] 15-skill pipeline designed and documented (`skills/*/SKILL.md`)',
  );
  const { exitCode, output } = runValidator(writeFixture(fixture));
  assert.equal(exitCode, 1, `expected exit 1; output:\n${output}`);
  assert.match(output, /V0\.3 is marked \[DONE\].*unchecked criterion/s);
});

test('fails when completed criteria are left marked [CURRENT]', () => {
  const fixture = realChecklist().replace(
    '### V0.3 — BP-SKILL suite — 15-skill pipeline scaffolded `[DONE]`',
    '### V0.3 — BP-SKILL suite — 15-skill pipeline scaffolded `[CURRENT]`',
  );
  const { exitCode, output } = runValidator(writeFixture(fixture));
  assert.equal(exitCode, 1, `expected exit 1; output:\n${output}`);
  assert.match(output, /V0\.3 has only checked criteria but is marked \[CURRENT\]/);
  assert.match(output, /V0\.3 is marked \[CURRENT\].*all of its criteria are checked/s);
});

test('fails when a higher incomplete version is marked [CURRENT]', () => {
  const fixture = realChecklist()
    .replace(
      '### V0.4 — Content and interactivity `[CURRENT]`',
      '### V0.4 — Content and interactivity `[PLANNED]`',
    )
    .replace(
      '### V0.5 — Validation tooling `[PLANNED]`',
      '### V0.5 — Validation tooling `[CURRENT]`',
    );
  const { exitCode, output } = runValidator(writeFixture(fixture));
  assert.equal(exitCode, 1, `expected exit 1; output:\n${output}`);
  assert.match(output, /V0\.5 is marked \[CURRENT\].*V0\.4 is the lowest incomplete/s);
});

test('fails when no incomplete version is marked [CURRENT]', () => {
  const fixture = realChecklist().replace(
    '### V0.4 — Content and interactivity `[CURRENT]`',
    '### V0.4 — Content and interactivity `[PLANNED]`',
  );
  const { exitCode, output } = runValidator(writeFixture(fixture));
  assert.equal(exitCode, 1, `expected exit 1; output:\n${output}`);
  assert.match(output, /Expected exactly one \[CURRENT\] version.*V0\.4/s);
});