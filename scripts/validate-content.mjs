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
 *   2. MERMAID VERSION  — every "mermaid@X.Y.Z" citation in public doc files
 *                         must equal MERMAID_VERSION_TARGET in bpmn-plugin.ts.
 *   3. PLUGIN VERSION   — every "@okhp3/mermaid-diagram-bpmn@X.Y.Z" citation
 *                         in public doc files must equal the version field in
 *                         lib/bpmn-plugin/package.json.
 *
 * Intentionally excluded files (changelog / historical decision records)
 * ──────────────────────────────────────────────────────────────────────
 *   app/docs/decisions.md     — records the plugin version that was current
 *   app/docs/as-built-prd.md  — at the time of each decision/build; those
 *                               historical @X.Y.Z strings are correct and
 *                               must not be updated to the latest version.
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
 *   CONTENT_LEDGER_OVERRIDE       — alternative path for docs/capability-ledger.md
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

/**
 * Read a file, failing loudly if it does not exist.
 * All primary scan sources are required — missing files indicate a repo
 * structural problem that must not be silently ignored.
 */
function readRequired(abs, label) {
  if (!existsSync(abs)) {
    console.error(
      `[validate-content] FAIL: required file not found: ${label}\n` +
      `  Resolved to: ${abs}\n` +
      `  If this file was intentionally removed, update the source list in validate-content.mjs.`,
    );
    process.exit(1);
  }
  return readFileSync(abs, 'utf-8');
}

function readJson(abs, label) {
  return JSON.parse(readRequired(abs, label));
}

/**
 * Find every occurrence of `pattern` (with one capture group) in `text`.
 * Returns [{ value, line }] — line is 1-based.
 */
function findAll(text, pattern) {
  const hits  = [];
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

const CANON_PATH        = process.env.CONTENT_CANON_OVERRIDE
  ?? resolve(ROOT, 'scripts/content-canon.json');
const CHECKLIST_PATH    = process.env.CONTENT_CHECKLIST_OVERRIDE
  ?? resolve(ROOT, 'app/docs/release-checklist.md');
const VERSION_DOC_PATH  = process.env.CONTENT_VERSION_DOC_OVERRIDE
  ?? resolve(ROOT, 'docs/version-checklist.md');
const LEDGER_PATH       = process.env.CONTENT_LEDGER_OVERRIDE
  ?? resolve(ROOT, 'docs/capability-ledger.md');
const README_PATH       = resolve(ROOT, 'README.md');
const ROADMAP_PATH      = resolve(ROOT, 'app/docs/roadmap.md');
const PLUGIN_SRC_PATH   = resolve(ROOT, 'app/src/lib/bpmn-plugin.ts');
const PLUGIN_PKG_PATH   = resolve(ROOT, 'lib/bpmn-plugin/package.json');

// Labels for error messages (show logical name when an override is active)
function label(envKey, defaultPath) {
  return process.env[envKey] ? `${defaultPath} (override)` : defaultPath;
}

const CHECKLIST_LABEL   = label('CONTENT_CHECKLIST_OVERRIDE',   'app/docs/release-checklist.md');
const VERSION_DOC_LABEL = label('CONTENT_VERSION_DOC_OVERRIDE', 'docs/version-checklist.md');
const LEDGER_LABEL      = label('CONTENT_LEDGER_OVERRIDE',      'docs/capability-ledger.md');

// ── Load canonical sources ────────────────────────────────────────────────────

const canon = readJson(CANON_PATH, 'scripts/content-canon.json');

// MERMAID_VERSION_TARGET — extracted from bpmn-plugin.ts at runtime
const pluginSrc = readRequired(PLUGIN_SRC_PATH, 'app/src/lib/bpmn-plugin.ts');
const mvtMatch  = pluginSrc.match(/MERMAID_VERSION_TARGET\s*=\s*['"]([^'"]+)['"]/);
if (!mvtMatch) {
  console.error('[validate-content] FAIL: MERMAID_VERSION_TARGET not found in app/src/lib/bpmn-plugin.ts');
  process.exit(1);
}
const MERMAID_VERSION_TARGET = mvtMatch[1];

// Plugin version — from lib/bpmn-plugin/package.json
const pluginPkg      = readJson(PLUGIN_PKG_PATH, 'lib/bpmn-plugin/package.json');
const PLUGIN_VERSION = pluginPkg.version;

// ── Accumulated failures ──────────────────────────────────────────────────────

const failures = [];

function fail(fileLabel, line, message) {
  failures.push(`  ${fileLabel}:${line} — ${message}`);
}

// ── Check 1: Test count ───────────────────────────────────────────────────────
//
// Pattern: "N as of YYYY-MM-DD" in release-checklist.md.
// The number N must equal canon.testCount.

{
  const text = readRequired(CHECKLIST_PATH, CHECKLIST_LABEL);
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
// Every "mermaid@X.Y.Z" occurrence in public doc files must match
// MERMAID_VERSION_TARGET from bpmn-plugin.ts.
//
// Required files are loaded with readRequired() — a missing file is a failure.
// app/docs/roadmap.md is optional; it may not always cite a Mermaid version.

const MERMAID_CITATION_SOURCES = [
  // [path, label, required]
  [CHECKLIST_PATH,   CHECKLIST_LABEL,   true],
  [VERSION_DOC_PATH, VERSION_DOC_LABEL, true],
  [LEDGER_PATH,      LEDGER_LABEL,      true],
  [README_PATH,      'README.md',       true],
  [ROADMAP_PATH,     'app/docs/roadmap.md', false],
];

for (const [filePath, fileLabel, required] of MERMAID_CITATION_SOURCES) {
  if (!existsSync(filePath)) {
    if (required) {
      failures.push(
        `  ${fileLabel} — required file not found (path: ${filePath}). ` +
        `If intentionally removed, update the source list in validate-content.mjs.`,
      );
    }
    continue;
  }
  const text = readRequired(filePath, fileLabel);
  const hits = findAll(text, /mermaid@(\d+\.\d+\.\d+)/);
  for (const { value, line } of hits) {
    if (value !== MERMAID_VERSION_TARGET) {
      fail(
        fileLabel,
        line,
        `mermaid@${value} does not match MERMAID_VERSION_TARGET=${MERMAID_VERSION_TARGET} ` +
        `(app/src/lib/bpmn-plugin.ts). Update the citation or the target constant.`,
      );
    }
  }
}

// ── Check 3: Plugin version citations ─────────────────────────────────────────
//
// Every "@okhp3/mermaid-diagram-bpmn@X.Y.Z" occurrence in public doc files
// must match the version in lib/bpmn-plugin/package.json.
//
// Intentionally excluded: app/docs/decisions.md and app/docs/as-built-prd.md
// (historical changelog records — their @X.Y.Z strings are correct for the
// version that existed at the time of the decision and must not be updated).

const PLUGIN_CITATION_SOURCES = [
  // [path, label, required]
  [CHECKLIST_PATH,   CHECKLIST_LABEL,   true],
  [VERSION_DOC_PATH, VERSION_DOC_LABEL, true],
  [LEDGER_PATH,      LEDGER_LABEL,      true],
  [README_PATH,      'README.md',       true],
  [ROADMAP_PATH,     'app/docs/roadmap.md', false],
];

for (const [filePath, fileLabel, required] of PLUGIN_CITATION_SOURCES) {
  if (!existsSync(filePath)) {
    if (required) {
      failures.push(
        `  ${fileLabel} — required file not found (path: ${filePath}). ` +
        `If intentionally removed, update the source list in validate-content.mjs.`,
      );
    }
    continue;
  }
  const text = readRequired(filePath, fileLabel);
  const hits = findAll(text, /@okhp3\/mermaid-diagram-bpmn@(\d+\.\d+\.\d+)/);
  for (const { value, line } of hits) {
    if (value !== PLUGIN_VERSION) {
      fail(
        fileLabel,
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
