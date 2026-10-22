#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['validate-pns.mjs', 'score-pns-quality.mjs'];

// Bundle the canonical implementation so the scoring skill has no sibling runtime dependency.
export function syncPnsValidator(check = false) {
  const drift = [];
  for (const file of files) {
    const source = resolve(root, 'skills/okhp3-process-narrative-authoring/scripts', file);
    const target = resolve(root, 'skills/okhp3-process-validation-scoring/scripts', file);
    const expected = readFileSync(source, 'utf8');
    if (check) {
      let actual;
      try { actual = readFileSync(target, 'utf8'); } catch { /* Missing is drift. */ }
      if (actual !== expected) drift.push(file);
    } else writeFileSync(target, expected);
  }
  if (drift.length) throw new Error(`PNS validator bundle drift: ${drift.join(', ')}. Run node scripts/sync-pns-validator.mjs.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncPnsValidator(process.argv.includes('--check'));
}
