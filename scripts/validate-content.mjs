#!/usr/bin/env node
/**
 * validate-content.mjs
 *
 * Content-drift validator for BPMN for Mermaid (Task #211).
 *
 * Detects divergence between public-facing documentation claims and the
 * canonical values that live in checked source files, emitting a clear
 * failure message (file:line) for each offending claim.
 *
 * Checks
 * ──────
 *   1. TEST COUNT       — "N as of YYYY-MM-DD" in release-checklist.md must
 *                         match scripts/content-canon.json testCount.
 *   2. MERMAID VERSION  — every "mermaid@X.Y.Z" citation in key doc files
 *                         must equal MERMAID_VERSION_TARGET in bpmn-plugin.ts.
 *   3. PLUGIN VERSION   — every "@okhp3/mermaid-diagram-bpmn@X.Y.Z" citation
 *                         in key doc files must equal the version field in
 *                         lib/bpmn-plugin/package.json.
 *
 * Usage (from workspace root)
 * ───────────────────────────
 *   node scripts/validate-content.mjs          # exits 0 = clean, 1 = drift
 *   pnpm run check:content                     # same, via package.json script
 *
 * Environment-variable overrides (used by validate-content.test.mjs)
 * ──────────────────────────────────────────────────────────────────
 *   CONTENT_CANON_OVERRIDE        — alternative path for content-canon.json
 *   CONTENT_CHECKLIST_OVERRIDE    — alternative path for release-checklist.md
 *   CONTENT_VERSION_DOC_OVERRIDE  — alternative path for docs/version-checklist.md
 *
 * HOW TO FIX FAILURES
 * ───────────────────
 *   Test count:    bump scripts/content-canon.json testCount + testCountUpdated,
 *                  then update the matching claim in app/docs/release-checklist.md.
 *   Mermaid ver:   update the citation in the flagged doc to match
 *                  MERMAID_VERSION_TARGET in app/src/lib/bpmn-plugin.ts.
 *   Plugin ver:    update the citation in the flagged doc to match
 *                  the version in lib/bpmn-plugin/package.json.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');

// ── Helpers ───────────────────────────────────────────────────────────────────

function readText(abs) {
  if (!existsSync(abs)) {
    console.error(`[validate-content] MISSING expected file: ${abs}`);
    process.exit(1);
  }
  return readFileSync(abs, 'utf-8');
}

function readJson(abs) {
  return JSON.parse(readText(abs));
}

/**
 * Find every occurrence of `pattern` (with one capture group) in `text`.
 * Returns [{ value, line }] — line is 1-based.
 */
function findAll(text, pattern) {
  const hits = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const re = new RegExp(pattern.source, 'g');
    let m;
    while ((m = re.exec(lines[i])) !== null) {
      hits.push({ value: m[1], line: i + 1 });
    }
  }
  return hits;
}

// ── File paths (override-aware) ───────────────────────────────────────────────

const CANON_PATH       = process.env.CONTENT_CANON_OVERRIDE
  ?? resolve(ROOT, 'scripts/content-canon.json');
const CHECKLIST_PATH   = process.env.CONTENT_CHECKLIST_OVERRIDE
  ?? resolve(ROOT, 'app/docs/release-checklist.md');
const VERSION_DOC_PATH = process.env.CONTENT_VERSION_DOC_OVERRIDE
  ?? resolve(ROOT, 'docs/version-checklist.md');
const README_PATH      = resolve(ROOT, 'README.md');
const LEDGER_PATH      = resolve(ROOT, 'app/docs/capability-ledger.md');
const PLUGIN_SRC_PATH  = resolve(ROOT, 'app/src/lib/bpmn-plugin.ts');
const PLUGIN_PKG_PATH  = resolve(ROOT, 'lib/bpmn-plugin/package.json');

// Labels for error messages (show the logical name, not the tmp path when overridden)
const CHECKLIST_LABEL   = process.env.CONTENT_CHECKLIST_OVERRIDE
  ? 'app/docs/release-checklist.md (override)' : 'app/docs/release-checklist.md';
const VERSION_DOC_LABEL = process.env.CONTENT_VERSION_DOC_OVERRIDE
  ? 'docs/version-checklist.md (override)' : 'docs/version-checklist.md';

// ── Load canonical sources ────────────────────────────────────────────────────

const canon = readJson(CANON_PATH);

// MERMAID_VERSION_TARGET — extracted from bpmn-plugin.ts at runtime
const pluginSrc = readText(PLUGIN_SRC_PATH);
const mvtMatch  = pluginSrc.match(/MERMAID_VERSION_TARGET\s*=\s*['"]([^'"]+)['"]/);
if (!mvtMatch) {
  console.error('[validate-content] FAIL: MERMAID_VERSION_TARGET not found in app/src/lib/bpmn-plugin.ts');
  process.exit(1);
}
const MERMAID_VERSION_TARGET = mvtMatch[1];

// Plugin version — from lib/bpmn-plugin/package.json
const pluginPkg      = readJson(PLUGIN_PKG_PATH);
const PLUGIN_VERSION = pluginPkg.version;

// ── Accumulated failures ──────────────────────────────────────────────────────

const failures = [];

function fail(label, line, message) {
  failures.push(`  ${label}:${line} — ${message}`);
}

// ── Check 1: Test count ───────────────────────────────────────────────────────
//
// Pattern: "N as of YYYY-MM-DD" in release-checklist.md.
// The number N must equal canon.testCount.

{
  const text = readText(CHECKLIST_PATH);
  const hits = findAll(text, /(\d{3,4})\s+as of \d{4}-\d{2}-\d{2}/);

  if (hits.length === 0) {
    failures.push(
      `  ${CHECKLIST_LABEL} — no "N as of YYYY-MM-DD" test-count claim found; ` +
      `expected one citing ${canon.testCount}`,
    );
  } else {
    for (const { value, line } of hits) {
      const claimed = parseInt(value, 10);
      if (claimed !== canon.testCount) {
        fail(
          CHECKLIST_LABEL,
          line,
          `test-count claim is ${claimed} but canon is ${canon.testCount} ` +
          `(scripts/content-canon.json). ` +
          `Update the claim or run the suite and bump the canon.`,
        );
      }
    }
  }
}

// ── Check 2: Mermaid version citations ────────────────────────────────────────
//
// Every "mermaid@X.Y.Z" occurrence in key doc files must match
// MERMAID_VERSION_TARGET from bpmn-plugin.ts.

const MERMAID_CITATION_SOURCES = [
  [CHECKLIST_PATH,   CHECKLIST_LABEL],
  [VERSION_DOC_PATH, VERSION_DOC_LABEL],
  [README_PATH,      'README.md'],
  [LEDGER_PATH,      'app/docs/capability-ledger.md'],
];

for (const [filePath, label] of MERMAID_CITATION_SOURCES) {
  if (!existsSync(filePath)) continue;
  const text = readText(filePath);
  const hits = findAll(text, /mermaid@(\d+\.\d+\.\d+)/);
  for (const { value, line } of hits) {
    if (value !== MERMAID_VERSION_TARGET) {
      fail(
        label,
        line,
        `mermaid@${value} does not match MERMAID_VERSION_TARGET=${MERMAID_VERSION_TARGET} ` +
        `(app/src/lib/bpmn-plugin.ts). Update the citation or the target constant.`,
      );
    }
  }
}

// ── Check 3: Plugin version citations ─────────────────────────────────────────
//
// Every "@okhp3/mermaid-diagram-bpmn@X.Y.Z" occurrence in key doc files
// must match the version in lib/bpmn-plugin/package.json.

const PLUGIN_CITATION_SOURCES = [
  [CHECKLIST_PATH,   CHECKLIST_LABEL],
  [VERSION_DOC_PATH, VERSION_DOC_LABEL],
  [README_PATH,      'README.md'],
  [LEDGER_PATH,      'app/docs/capability-ledger.md'],
];

for (const [filePath, label] of PLUGIN_CITATION_SOURCES) {
  if (!existsSync(filePath)) continue;
  const text = readText(filePath);
  const hits = findAll(text, /@okhp3\/mermaid-diagram-bpmn@(\d+\.\d+\.\d+)/);
  for (const { value, line } of hits) {
    if (value !== PLUGIN_VERSION) {
      fail(
        label,
        line,
        `@okhp3/mermaid-diagram-bpmn@${value} does not match plugin version ${PLUGIN_VERSION} ` +
        `(lib/bpmn-plugin/package.json). Update the citation or bump the package version.`,
      );
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(
    `\n[validate-content] FAIL — ${failures.length} content-drift violation${failures.length !== 1 ? 's' : ''} found:\n` +
    failures.join('\n') +
    '\n\nSee scripts/validate-content.mjs header for fix instructions.\n',
  );
  process.exit(1);
} else {
  console.log(
    `[validate-content] OK — all content claims match canonical sources ` +
    `(testCount=${canon.testCount}, mermaid@${MERMAID_VERSION_TARGET}, plugin@${PLUGIN_VERSION})`,
  );
  process.exit(0);
}
