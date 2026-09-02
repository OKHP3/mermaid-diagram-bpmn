#!/usr/bin/env node
/**
 * Failure-mode and integration checks for install-content-hook.mjs.
 *
 * Every test uses a temporary Git repository, so the real checkout's hooks
 * are never changed.
 */

import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const INSTALLER = resolve(ROOT, 'scripts/install-content-hook.mjs');
const START_MARKER = '# BEGIN BPMN FOR MERMAID PUBLIC CLAIMS CHECK';
const END_MARKER = '# END BPMN FOR MERMAID PUBLIC CLAIMS CHECK';
const temporaryRepositories = [];

function createRepository() {
  const repository = mkdtempSync(join(tmpdir(), 'bpmn-content-hook-'));
  temporaryRepositories.push(repository);
  execFileSync('git', ['init', '--quiet', repository]);
  return repository;
}

function hookPath(repository) {
  const gitHooksPath = execFileSync('git', ['-C', repository, 'rev-parse', '--git-path', 'hooks'], {
    encoding: 'utf8',
  }).trim();
  return resolve(repository, gitHooksPath, 'pre-commit');
}

function runInstaller(repository, ...args) {
  return spawnSync(process.execPath, [INSTALLER, ...args], {
    cwd: repository,
    encoding: 'utf8',
  });
}

afterEach(() => {
  while (temporaryRepositories.length > 0) {
    rmSync(temporaryRepositories.pop(), { recursive: true, force: true });
  }
});

test('installs an executable pre-commit hook that runs the content check', () => {
  const repository = createRepository();
  const result = runInstaller(repository);
  const installedHook = hookPath(repository);

  assert.equal(result.status, 0, result.stderr);
  const hook = readFileSync(installedHook, 'utf8');
  assert.match(hook, /^#!\/bin\/sh/);
  assert.ok(hook.includes(START_MARKER));
  assert.match(hook, /pnpm run check:content/);
  assert.ok(hook.includes(END_MARKER));
  assert.equal(statSync(installedHook).mode & 0o111, 0o111);
});

test('the generated hook forwards the content check result', () => {
  const repository = createRepository();
  assert.equal(runInstaller(repository).status, 0);

  const fakeBin = mkdtempSync(join(tmpdir(), 'bpmn-content-hook-bin-'));
  const invocationLog = join(fakeBin, 'invocation.log');
  const fakePnpm = join(fakeBin, 'pnpm');
  writeFileSync(
    fakePnpm,
    '#!/bin/sh\nprintf "%s\\n" "$*" > "$CONTENT_HOOK_TEST_LOG"\nexit "$CONTENT_HOOK_TEST_EXIT"\n',
    { encoding: 'utf8', mode: 0o755 },
  );
  chmodSync(fakePnpm, 0o755);

  const result = spawnSync('sh', [hookPath(repository)], {
    cwd: repository,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${fakeBin}:${process.env.PATH}`,
      CONTENT_HOOK_TEST_LOG: invocationLog,
      CONTENT_HOOK_TEST_EXIT: '7',
    },
  });

  assert.equal(result.status, 7, result.stderr);
  assert.equal(readFileSync(invocationLog, 'utf8').trim(), 'run check:content');
  rmSync(fakeBin, { recursive: true, force: true });
});

test('does not overwrite an existing unrelated pre-commit hook', () => {
  const repository = createRepository();
  const existingHook = hookPath(repository);
  const original = '#!/bin/sh\necho existing hook\n';
  writeFileSync(existingHook, original, { encoding: 'utf8', mode: 0o755 });

  const result = runInstaller(repository);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /refusing to overwrite/i);
  assert.equal(readFileSync(existingHook, 'utf8'), original);
});

test('removes only the unchanged hook created by the installer', () => {
  const repository = createRepository();
  const installedHook = hookPath(repository);
  assert.equal(runInstaller(repository).status, 0);
  assert.equal(runInstaller(repository, '--remove').status, 0);
  assert.equal(runInstaller(repository, '--remove').status, 0);
  assert.equal(runInstaller(repository).status, 0);
  writeFileSync(installedHook, `${readFileSync(installedHook, 'utf8')}echo custom\n`);

  const result = runInstaller(repository, '--remove');

  assert.equal(result.status, 1);
  assert.match(result.stderr, /refusing to delete/i);
  assert.match(readFileSync(installedHook, 'utf8'), /echo custom/);
});