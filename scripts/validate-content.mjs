#!/usr/bin/env node
/**
 * validate-content.mjs
 *
 * Content-drift validator for BPMN for Mermaid.
 *
 * Detects divergence between public-facing documentation claims and the
 * canonical values that live in checked source files, emitting a clear
 * failure message (file:line) for each offending claim.
 *
 * Checks
 * ──────
 *   1. TEST COUNT       — "N as of YYYY-MM-DD" in release-checklist.md must
 *                         match scripts/content-canon.json testCount. The
 *                         separate check-test-count.mjs step compares that
 *                         canonical value with the latest Vitest result.
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
 *   CONTENT_HOME_OVERRIDE         — alternative path for app/src/pages/Home.tsx
 *   CONTENT_AGENT_SKILLS_OVERRIDE — alternative path for app/src/pages/AgentSkills.tsx
 *   CONTENT_README_OVERRIDE       — alternative path for README.md
 *   CONTENT_PROMOTION_OVERRIDE    — alternative path for docs/promotion-strategy.md
 *   CONTENT_ROADMAP_OVERRIDE      — alternative path for app/docs/roadmap.md
 *
 * HOW TO FIX FAILURES
 * ───────────────────
 *   Test count:    bump scripts/content-canon.json testCount + testCountUpdated,
 *                  then update the matching claim in app/docs/release-checklist.md.
 *   Mermaid ver:   update the citation in the flagged doc to match
 *                  MERMAID_VERSION_TARGET in app/src/lib/bpmn-plugin.ts.
 *   Plugin ver:    update the citation in the flagged doc to match
 *                  the version in lib/bpmn-plugin/package.json.
 *   Banned claim:  remove the flagged phrase from the source file and replace it
 *                  with approved differentiation copy (see docs/strategy.md
 *                  §BP-SKILL positioning). Do NOT add new entries to BANNED_CLAIMS
 *                  without also adding a matching test case in validate-content.test.mjs.
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
const HOME_PATH         = process.env.CONTENT_HOME_OVERRIDE
  ?? resolve(ROOT, 'app/src/pages/Home.tsx');
const AGENT_SKILLS_PATH = process.env.CONTENT_AGENT_SKILLS_OVERRIDE
  ?? resolve(ROOT, 'app/src/pages/AgentSkills.tsx');
const README_PATH       = process.env.CONTENT_README_OVERRIDE
  ?? resolve(ROOT, 'README.md');
const PROMOTION_PATH    = process.env.CONTENT_PROMOTION_OVERRIDE
  ?? resolve(ROOT, 'docs/promotion-strategy.md');
const ROADMAP_PATH      = process.env.CONTENT_ROADMAP_OVERRIDE
  ?? resolve(ROOT, 'app/docs/roadmap.md');
const PLUGIN_SRC_PATH   = resolve(ROOT, 'app/src/lib/bpmn-plugin.ts');
const PLUGIN_PKG_PATH   = resolve(ROOT, 'lib/bpmn-plugin/package.json');

// Labels for error messages (show logical name when an override is active)
function label(envKey, defaultPath) {
  return process.env[envKey] ? `${defaultPath} (override)` : defaultPath;
}

const CHECKLIST_LABEL      = label('CONTENT_CHECKLIST_OVERRIDE',    'app/docs/release-checklist.md');
const VERSION_DOC_LABEL    = label('CONTENT_VERSION_DOC_OVERRIDE',  'docs/version-checklist.md');
const LEDGER_LABEL         = label('CONTENT_LEDGER_OVERRIDE',       'docs/capability-ledger.md');
const HOME_LABEL           = label('CONTENT_HOME_OVERRIDE',         'app/src/pages/Home.tsx');
const AGENT_SKILLS_LABEL   = label('CONTENT_AGENT_SKILLS_OVERRIDE', 'app/src/pages/AgentSkills.tsx');
const README_LABEL         = label('CONTENT_README_OVERRIDE',       'README.md');
const PROMOTION_LABEL      = label('CONTENT_PROMOTION_OVERRIDE',    'docs/promotion-strategy.md');
const ROADMAP_LABEL        = label('CONTENT_ROADMAP_OVERRIDE',       'app/docs/roadmap.md');

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

// ── Check 4: Banned claims ────────────────────────────────────────────────────
//
// Retired positioning phrases that must not re-appear in public-facing source
// files. These were removed per the strategy record (docs/strategy.md §BP-SKILL
// positioning, updated 2026-08-07) and docs/promotion-strategy.md.
//
// To add a new banned phrase: append an entry to BANNED_CLAIMS and add a
// matching test case in validate-content.test.mjs.
//
// Required files — a missing file is a failure (same policy as other checks).

const BANNED_CLAIMS = [
  {
    phrase: 'Zero implement',
    reason:
      'Retired 2026-08-07 — "Zero implement a BABOK knowledge area" is factually ' +
      'incorrect; at least two BABOK-implementing packages exist. ' +
      'Use "lifecycle-complete, BPMN-integrated" positioning instead ' +
      '(docs/strategy.md §BP-SKILL positioning).',
  },
  {
    phrase: '89,000+',
    reason:
      'Stale ecosystem figure — superseded by the 93,000–164,000+ range ' +
      'sourced from GuildSkills/OpenAgentSkill as of 2026-08-07. ' +
      'Update to the current range or remove the numeric claim.',
  },
  {
    phrase: 'first standards-conformant',
    reason:
      'Retired 2026-08-07 — "first standards-conformant" is a uniqueness claim ' +
      'that cannot be substantiated. Do not reuse "first standards-conformant" in ' +
      'any external post or public-facing copy (docs/promotion-strategy.md). ' +
      'Use "lifecycle-complete, BPMN-integrated" positioning instead.',
  },
];

const BANNED_CLAIMS_SOURCES = [
  [HOME_PATH,         HOME_LABEL],
  [AGENT_SKILLS_PATH, AGENT_SKILLS_LABEL],
  [README_PATH,       README_LABEL],
  [PROMOTION_PATH,    PROMOTION_LABEL],
  [ROADMAP_PATH,      ROADMAP_LABEL],
];

for (const [filePath, fileLabel] of BANNED_CLAIMS_SOURCES) {
  if (!existsSync(filePath)) {
    failures.push(
      `  ${fileLabel} — required file not found (path: ${filePath}). ` +
      `If intentionally removed, update BANNED_CLAIMS_SOURCES in validate-content.mjs.`,
    );
    continue;
  }
  const text  = readRequired(filePath, fileLabel);
  const lines = text.split('\n');
  for (const { phrase, reason } of BANNED_CLAIMS) {
    const phraseLower = phrase.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(phraseLower)) {
        fail(
          fileLabel,
          i + 1,
          `retired claim phrase "${phrase}" must not appear in public-facing source. ${reason}`,
        );
      }
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
    `(testCount=${canon.testCount}, mermaid@${MERMAID_VERSION_TARGET}, plugin@${PLUGIN_VERSION}, ` +
    `banned-claims clean in public app and Markdown sources)`,
  );
  process.exit(0);
}
