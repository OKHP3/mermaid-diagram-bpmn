#!/usr/bin/env node
/**
 * Verifies that the initial-bundle gate fails when a manifest's index chunk
 * exceeds its canonical gzip ceiling.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHECK = resolve(__dirname, 'check-bundle-size.mjs');

test('exits 1 when an initial index chunk exceeds the gzip ceiling', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'bpmn-bundle-size-'));
  const manifestPath = join(fixture, 'dist/public/.vite/manifest.json');
  const chunkPath = join(fixture, 'dist/public/assets/index-fixture.js');
  const canonPath = join(fixture, 'content-canon.json');

  try {
    mkdirSync(dirname(manifestPath), { recursive: true });
    mkdirSync(dirname(chunkPath), { recursive: true });
    writeFileSync(
      manifestPath,
      JSON.stringify({
        'index.html': {
          file: 'assets/index-fixture.js',
          isEntry: true,
        },
      }),
    );
    writeFileSync(chunkPath, randomBytes(2_048));
    writeFileSync(canonPath, JSON.stringify({ bundleSizeCeilingKbGzip: 1 }));

    const result = spawnSync(
      process.execPath,
      [CHECK, '--manifest', manifestPath, '--canon', canonPath],
      { encoding: 'utf8', timeout: 15_000 },
    );
    const output = (result.stdout ?? '') + (result.stderr ?? '');

    assert.equal(result.status, 1, `expected an oversized bundle to fail; output:\n${output}`);
    assert.match(output, /exceeding.*ceiling/i);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});