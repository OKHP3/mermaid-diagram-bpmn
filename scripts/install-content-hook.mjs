#!/usr/bin/env node
/**
 * Install or remove the optional public-claims pre-commit check.
 *
 * This intentionally writes to the local repository's .git/hooks directory
 * rather than committing a hook. Contributors must opt in explicitly, and
 * removal only affects a hook created by this installer.
 */

import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const REMOVE_FLAG = '--remove';
const HOOK_NAME = 'pre-commit';
const START_MARKER = '# BEGIN BPMN FOR MERMAID PUBLIC CLAIMS CHECK';
const END_MARKER = '# END BPMN FOR MERMAID PUBLIC CLAIMS CHECK';

const HOOK_CONTENT = `#!/bin/sh
${START_MARKER}
# This hook is managed by pnpm run content:hook:install.
# Remove it with pnpm run content:hook:remove.
pnpm run check:content
status=$?
if [ "$status" -ne 0 ]; then
  printf '%s\\n' '[content-hook] Public-claims check failed; commit aborted.' >&2
fi
exit "$status"
${END_MARKER}
`;

function fail(message) {
  console.error(`[content-hook] FAIL: ${message}`);
  process.exitCode = 1;
}

function gitPath(args, label) {
  try {
    return execFileSync('git', args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    fail(`could not find a Git repository (${label}); run this command from a checkout`);
    return null;
  }
}

function resolveGitPath(gitPathValue) {
  return resolve(process.cwd(), gitPathValue);
}

function readHook(hookPath) {
  if (!existsSync(hookPath)) return null;
  if (!lstatSync(hookPath).isFile()) {
    fail(`${hookPath} exists but is not a regular file; refusing to change it`);
    return null;
  }
  return readFileSync(hookPath, 'utf8');
}

function install(hookPath) {
  const existing = readHook(hookPath);
  if (existing === null && process.exitCode) return;

  if (existing !== null && existing !== HOOK_CONTENT) {
    if (existing.includes(START_MARKER) || existing.includes(END_MARKER)) {
      fail(
        `${hookPath} contains a managed public-claims hook but has been modified; ` +
        'restore the installer version or remove it manually before reinstalling',
      );
    } else {
      fail(
        `${hookPath} already exists; refusing to overwrite an existing pre-commit hook. ` +
        'Combine the checks manually or remove the existing hook first',
      );
    }
    return;
  }

  if (existing === HOOK_CONTENT) {
    console.log(`[content-hook] Already installed at ${hookPath}`);
    return;
  }

  mkdirSync(dirname(hookPath), { recursive: true });
  const temporaryPath = `${hookPath}.tmp-${process.pid}`;
  writeFileSync(temporaryPath, HOOK_CONTENT, { encoding: 'utf8', mode: 0o755 });
  renameSync(temporaryPath, hookPath);
  chmodSync(hookPath, 0o755);
  console.log(`[content-hook] Installed at ${hookPath}`);
}

function remove(hookPath) {
  const existing = readHook(hookPath);
  if (existing === null && process.exitCode) return;

  if (existing === null) {
    console.log('[content-hook] No managed public-claims hook is installed');
    return;
  }

  if (existing !== HOOK_CONTENT) {
    if (existing.includes(START_MARKER) || existing.includes(END_MARKER)) {
      fail(
        `${hookPath} contains a managed public-claims hook but has been modified; ` +
        'refusing to delete it',
      );
    } else {
      console.log('[content-hook] Existing pre-commit hook is unrelated; leaving it unchanged');
    }
    return;
  }

  unlinkSync(hookPath);
  console.log(`[content-hook] Removed ${hookPath}`);
}

const unexpectedArgs = process.argv.slice(2).filter((arg) => arg !== REMOVE_FLAG);
if (unexpectedArgs.length > 0) {
  fail(`unknown argument(s): ${unexpectedArgs.join(', ')}; use ${REMOVE_FLAG} to remove`);
} else {
  const gitHooksPath = gitPath(['rev-parse', '--git-path', 'hooks'], 'hooks');
  if (gitHooksPath) {
    const hookPath = join(resolveGitPath(gitHooksPath), HOOK_NAME);
    if (process.argv.includes(REMOVE_FLAG)) {
      remove(hookPath);
    } else {
      install(hookPath);
    }
  }
}