#!/usr/bin/env node
/**
 * Enforces the gzip budget for Vite's initial JavaScript entry chunk.
 *
 * Usage:
 *   pnpm run check:bundle-size
 *   node scripts/check-bundle-size.mjs --manifest /path/to/manifest.json --canon /path/to/content-canon.json
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function optionValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a file path.`);
  }
  return value;
}

function readRequired(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} was not found at ${path}. Run the app build before this check.`);
  }
  return readFileSync(path);
}

function readJson(path, label) {
  try {
    return JSON.parse(readRequired(path, label).toString('utf8'));
  } catch (error) {
    throw new Error(`Could not read ${label}: ${error.message}`);
  }
}

function formatKb(bytes) {
  return `${(bytes / 1_000).toFixed(2)} kB`;
}

function findInitialChunk(manifest) {
  const chunks = Object.entries(manifest).filter(([, entry]) =>
    entry &&
    typeof entry === 'object' &&
    typeof entry.file === 'string' &&
    /(^|\/)index-[^/]+\.js$/.test(entry.file),
  );

  const entry = chunks.find(([, chunk]) => chunk.isEntry) ?? chunks[0];
  if (!entry) {
    throw new Error('Vite manifest has no initial index-*.js chunk.');
  }
  return entry;
}

function main() {
  const manifestOverride = optionValue('--manifest');
  const canonOverride = optionValue('--canon');
  const manifestPath = manifestOverride
    ? resolve(manifestOverride)
    : resolve(ROOT, 'app/dist/public/.vite/manifest.json');
  const canonPath = canonOverride
    ? resolve(canonOverride)
    : resolve(ROOT, 'scripts/content-canon.json');
  const manifest = readJson(manifestPath, 'Vite manifest');
  const canon = readJson(canonPath, 'content canon');
  const ceilingKb = canon.bundleSizeCeilingKbGzip;

  if (!Number.isFinite(ceilingKb) || ceilingKb <= 0) {
    throw new Error('scripts/content-canon.json must define a positive bundleSizeCeilingKbGzip number.');
  }

  const [manifestKey, chunk] = findInitialChunk(manifest);
  const chunkPath = resolve(dirname(manifestPath), '..', chunk.file);
  const gzipBytes = gzipSync(readRequired(chunkPath, `Initial chunk (${manifestKey})`)).length;
  const ceilingBytes = ceilingKb * 1_000;

  if (gzipBytes > ceilingBytes) {
    throw new Error(
      `Initial bundle ${chunk.file} is ${formatKb(gzipBytes)} gzip, exceeding the ${ceilingKb} kB gzip ceiling.`,
    );
  }

  console.log(
    `[bundle-size] OK: ${chunk.file} is ${formatKb(gzipBytes)} gzip ` +
    `(ceiling ${ceilingKb} kB).`,
  );
}

try {
  main();
} catch (error) {
  console.error(`[bundle-size] FAIL: ${error.message}`);
  process.exitCode = 1;
}