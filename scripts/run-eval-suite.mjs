#!/usr/bin/env node
/**
 * run-eval-suite.mjs
 * Iterates all evals/ categories, runs the appropriate validator against each
 * fixture, and compares result.valid (+ optional warning checks) against the
 * expected outcome declared in each category's manifest.json.
 *
 * Exit 0 — all fixtures produced the expected outcome.
 * Exit 1 — one or more fixtures produced an unexpected outcome.
 *
 * Usage: node scripts/run-eval-suite.mjs [--verbose]
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const EVALS_DIR = join(REPO_ROOT, 'evals');
const VERBOSE = process.argv.includes('--verbose');

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

function ok(msg)   { return `${GREEN}✔${RESET} ${msg}`; }
function fail(msg) { return `${RED}✖${RESET} ${msg}`; }
function warn(msg) { return `${YELLOW}!${RESET} ${msg}`; }

// ─── YAML parser (minimal, compatible with all fixture files) ─────────────────

const PARSE_YAML_PATH = join(
  REPO_ROOT,
  'skills/okhp3-process-narrative/scripts/parse-yaml-minimal.mjs'
);
const { parseYaml } = await import(PARSE_YAML_PATH);

/**
 * The minimal YAML parser coerces quoted numeric strings like "0.1" to the
 * number 0.1. Validators that use `isNonEmptyString()` (e.g. validatePir)
 * would then reject these fields. Normalise any top-level version fields that
 * were coerced to numbers back to their string form.
 */
function normalizeVersionFields(parsed) {
  if (!parsed || typeof parsed !== 'object') return parsed;
  const versionKeys = ['pir_version', 'pns_version', 'version'];
  for (const key of versionKeys) {
    if (typeof parsed[key] === 'number') {
      parsed[key] = String(parsed[key]);
    }
  }
  return parsed;
}

// ─── Validators (lazy-loaded once per module path) ────────────────────────────

const moduleCache = new Map();

async function loadModule(relPath) {
  if (moduleCache.has(relPath)) return moduleCache.get(relPath);
  const absPath = join(REPO_ROOT, relPath);
  if (!existsSync(absPath)) throw new Error(`Module not found: ${relPath}`);
  const mod = await import(absPath);
  moduleCache.set(relPath, mod);
  return mod;
}

// ─── BPMN trace validator (inline) ───────────────────────────────────────────

const TRACEABLE_NODE_RE = /^\s*(start|end|task(?::[a-zA-Z]+)?|xor|and|or)\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"[^"]*"$/;
const PNS_TRACE_RE = /^#\s*pns:/;

function checkBpmnTraceability(bpmnSource) {
  const errors = [];
  const lines = bpmnSource.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!TRACEABLE_NODE_RE.test(trimmed)) continue;

    const prevLine = (i > 0 ? lines[i - 1] : '').trim();
    if (!PNS_TRACE_RE.test(prevLine)) {
      const idMatch = trimmed.match(/^\w+\s+(\w+)\s+/);
      const elementId = idMatch ? idMatch[1] : '(unknown)';
      const keyword = trimmed.split(/\s+/)[0];
      errors.push(
        `Element "${elementId}" (${keyword}) at line ${i + 1} has no ` +
        `"# pns:<activity-id>" trace comment on the preceding line`
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings: [] };
}

// ─── Run one fixture ──────────────────────────────────────────────────────────

async function runFixture(categoryDir, manifest, fixture) {
  const fixturePath = join(categoryDir, fixture.file);
  if (!existsSync(fixturePath)) {
    return {
      file: fixture.file,
      expected: fixture.expected,
      outcome: 'error',
      passed: false,
      detail: `Fixture file not found: ${fixture.file}`,
      errors: [],
      warnings: [],
    };
  }

  let result;

  try {
    if (manifest.validator_type === 'bpmn-trace') {
      const source = readFileSync(fixturePath, 'utf8');
      result = checkBpmnTraceability(source);
    } else {
      const rawContent = readFileSync(fixturePath, 'utf8');
      const parsed = normalizeVersionFields(parseYaml(rawContent));

      const mod = await loadModule(manifest.validator_module);
      const fn = mod[manifest.validator_fn];
      if (typeof fn !== 'function') {
        throw new Error(
          `Export "${manifest.validator_fn}" is not a function in ${manifest.validator_module}`
        );
      }
      result = fn(parsed);
    }
  } catch (err) {
    return {
      file: fixture.file,
      expected: fixture.expected,
      outcome: 'error',
      passed: false,
      detail: `Runtime error: ${err.message}`,
      errors: [],
      warnings: [],
    };
  }

  const failPattern = manifest.fail_on_warnings_matching;
  const hasMatchingWarning = failPattern
    ? (result.warnings || []).some(w => w.includes(failPattern))
    : false;

  const effectivelyFailing = !result.valid || hasMatchingWarning;
  const actualOutcome = effectivelyFailing ? 'fail' : 'pass';
  const passed = actualOutcome === fixture.expected;

  return {
    file: fixture.file,
    expected: fixture.expected,
    outcome: actualOutcome,
    passed,
    detail: passed
      ? null
      : `Expected "${fixture.expected}" but got "${actualOutcome}"` +
        (hasMatchingWarning ? ` (V7 warning triggered: ${failPattern})` : '') +
        (!result.valid && result.errors.length > 0 ? ` — first error: ${result.errors[0]}` : ''),
    errors: result.errors || [],
    warnings: result.warnings || [],
  };
}

// ─── Run one eval category ────────────────────────────────────────────────────

async function runCategory(categoryName) {
  const categoryDir = join(EVALS_DIR, categoryName);
  const manifestPath = join(categoryDir, 'manifest.json');

  if (!existsSync(manifestPath)) {
    return {
      category: categoryName,
      skipped: true,
      reason: 'manifest.json not found',
      fixtures: [],
      passed: 0,
      failed: 0,
    };
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    return {
      category: categoryName,
      skipped: true,
      reason: `Failed to parse manifest.json: ${err.message}`,
      fixtures: [],
      passed: 0,
      failed: 0,
    };
  }

  const results = [];
  for (const fixture of (manifest.fixtures || [])) {
    const r = await runFixture(categoryDir, manifest, fixture);
    results.push(r);
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return { category: categoryName, skipped: false, fixtures: results, passed, failed };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

if (!existsSync(EVALS_DIR)) {
  console.error(`${RED}${BOLD}Error:${RESET} evals/ directory not found at ${EVALS_DIR}`);
  process.exit(1);
}

const categoryNames = readdirSync(EVALS_DIR, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

if (categoryNames.length === 0) {
  console.error(`${YELLOW}Warning:${RESET} No eval categories found in evals/`);
  process.exit(0);
}

console.log(`\n${BOLD}BP-SKILL Eval Suite${RESET}  (${categoryNames.length} categories)\n`);

let totalPass = 0;
let totalFail = 0;

for (const name of categoryNames) {
  const cat = await runCategory(name);

  if (cat.skipped) {
    console.log(`  ${DIM}[skip]${RESET}  ${name}  — ${cat.reason}`);
    continue;
  }

  const catLabel = cat.failed === 0
    ? `${GREEN}${BOLD}PASS${RESET}`
    : `${RED}${BOLD}FAIL${RESET}`;

  console.log(`  ${catLabel}  ${BOLD}${name}${RESET}  (${cat.passed}/${cat.fixtures.length} fixtures)`);

  for (const f of cat.fixtures) {
    const icon = f.passed ? ok(f.file) : fail(f.file);
    const tag  = f.passed
      ? `${DIM}[expected ${f.expected}]${RESET}`
      : `${RED}[expected ${f.expected}, got ${f.outcome}]${RESET}`;
    console.log(`         ${icon}  ${tag}`);

    if (!f.passed && f.detail) {
      console.log(`         ${DIM}  → ${f.detail}${RESET}`);
    }

    if (VERBOSE && !f.passed) {
      for (const e of f.errors)   console.log(`           ${RED}ERR${RESET}  ${e}`);
      for (const w of f.warnings) console.log(`           ${YELLOW}WARN${RESET} ${w}`);
    }
  }

  totalPass += cat.passed;
  totalFail += cat.failed;
}

const grandLabel = totalFail === 0
  ? `${GREEN}${BOLD}ALL PASS${RESET}`
  : `${RED}${BOLD}FAILURES${RESET}`;

const totalFixtures = totalPass + totalFail;
console.log(`\n  ${grandLabel}  ${totalPass}/${totalFixtures} fixtures passed\n`);

process.exit(totalFail > 0 ? 1 : 0);
