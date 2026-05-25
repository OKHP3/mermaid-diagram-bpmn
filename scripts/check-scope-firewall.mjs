#!/usr/bin/env node
/**
 * check-scope-firewall.mjs
 * Scans a target directory recursively for employer-proprietary references
 * that must not appear in shareable process documentation.
 *
 * Usage: node scripts/check-scope-firewall.mjs <target-directory>
 * Export: checkScopeFirewall(targetDir) → { valid, errors, warnings, scan_summary }
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const FORBIDDEN_PATTERNS = [
  { pattern: 'BFS', label: 'employer abbreviation BFS' },
  {
    pattern: ['B', 'u', 'i', 'l', 'd', 'e', 'r', 's', ' ', 'F', 'i', 'r', 's', 't', ' ', 'S', 'o', 'u', 'r', 'c', 'e'].join(''),
    label: 'employer full name'
  },
  {
    pattern: ['B', 'u', 'i', 'l', 'd', 'e', 'r', 's', 'F', 'i', 'r', 's', 't', 'S', 'o', 'u', 'r', 'c', 'e'].join(''),
    label: 'employer name (no space)'
  },
  { pattern: '#E8611A', label: 'employer brand colour #E8611A (orange)' },
  { pattern: '#e8611a', label: 'employer brand colour #e8611a (orange, lowercase)' },
  { pattern: '#003865', label: 'employer brand colour #003865 (navy)' },
  { pattern: '#003865'.toLowerCase(), label: 'employer brand colour (navy, lowercase)' },
];

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.local', 'coverage']);
const TEXT_EXTENSIONS = new Set([
  '.md', '.yaml', '.yml', '.json', '.mjs', '.js', '.ts', '.tsx', '.jsx',
  '.txt', '.mmd', '.html', '.css', '.svg',
]);

/**
 * Scan a directory recursively for forbidden patterns.
 * @param {string} targetDir  Absolute or relative path to scan
 * @returns {{ valid: boolean, errors: string[], warnings: string[], scan_summary: object }}
 */
export function checkScopeFirewall(targetDir) {
  const errors = [];
  const warnings = [];
  let filesScanned = 0;
  let filesSkipped = 0;
  const matchesByPattern = {};
  for (const { label } of FORBIDDEN_PATTERNS) matchesByPattern[label] = 0;

  if (!existsSync(targetDir)) {
    errors.push(`Target directory "${targetDir}" does not exist`);
    return {
      valid: false, errors, warnings,
      scan_summary: { files_scanned: 0, files_skipped: 0, matches_by_pattern: matchesByPattern },
    };
  }

  function scanDir(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      warnings.push(`Could not read directory: ${dir}`);
      return;
    }

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) { filesSkipped++; continue; }
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = entry.name.slice(entry.name.lastIndexOf('.'));
      if (!TEXT_EXTENSIONS.has(ext)) { filesSkipped++; continue; }

      let content;
      try {
        content = readFileSync(full, 'utf8');
      } catch {
        warnings.push(`Could not read file: ${relative(targetDir, full)}`);
        filesSkipped++;
        continue;
      }
      filesScanned++;

      const lines = content.split('\n');
      for (const { pattern, label } of FORBIDDEN_PATTERNS) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(pattern)) {
            const relPath = relative(targetDir, full);
            errors.push(
              `${relPath}:${i + 1}: contains forbidden ${label} — remove before publishing`
            );
            matchesByPattern[label] = (matchesByPattern[label] || 0) + 1;
          }
        }
      }
    }
  }

  scanDir(targetDir);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    scan_summary: {
      files_scanned: filesScanned,
      files_skipped: filesSkipped,
      matches_by_pattern: matchesByPattern,
    },
  };
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const [, , targetDir] = process.argv;
  if (!targetDir) {
    console.log('Usage: node check-scope-firewall.mjs <target-directory>');
    console.log('Scans for employer-proprietary references that must not appear in published docs.');
    process.exit(0);
  }
  const result = checkScopeFirewall(targetDir);
  const s = result.scan_summary;
  console.log(`Scope Firewall: ${result.valid ? 'PASS' : 'FAIL'}`);
  console.log(`  Scanned: ${s.files_scanned} file(s), skipped: ${s.files_skipped}`);
  if (result.errors.length > 0) {
    for (const e of result.errors) console.error(`  ERROR: ${e}`);
    process.exit(1);
  }
  if (result.warnings.length > 0) {
    for (const w of result.warnings) console.warn(`  WARN: ${w}`);
  }
  console.log('No forbidden references found.');
}
