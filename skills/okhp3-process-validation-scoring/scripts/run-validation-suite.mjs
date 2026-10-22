#!/usr/bin/env node
/**
 * run-validation-suite.mjs
 * Orchestrates V1–V9 validation checks across all BP-SKILL process artifacts
 * and returns a composite 0–100 quality score with band classification.
 *
 * Usage: node run-validation-suite.mjs --pir <pir.yaml> --pns <pns.yaml> [--bpmn <bpmn.mmd>]
 * Named exports: runValidationSuite(opts) → { valid, errors, warnings, report }
 */

const BLOCKING_RULES = new Set(['V1', 'V2', 'V3', 'V5', 'V6', 'V8']);

import { validatePns } from './validate-pns.mjs';
import { scorePnsQuality } from './score-pns-quality.mjs';

function checkPns(pns) {
  const result = validatePns(pns);
  return ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'].map(rule => {
    const errors = result.errors.filter(message => message.startsWith(`[${rule}]`));
    const warnings = result.warnings.filter(message => message.startsWith(`[${rule}]`));
    return { rule, severity: ['V4', 'V7'].includes(rule) ? 'warning' : 'error',
      status: errors.length ? 'fail' : warnings.length ? 'warn' : 'pass', errors, warnings };
  });
}

// ─── V8: PIR completeness gate ───────────────────────────────────────────────
function checkV8(pir) {
  const errors = [];
  const warnings = [];
  const validation = pir?.validation || {};
  const score = typeof validation.completeness_score === 'number' ? validation.completeness_score : -1;
  const ready = validation.ready_for_narrative;

  if (score < 0) errors.push('V8: pir.validation.completeness_score is missing or not a number');
  else if (score < 70) errors.push(`V8: PIR completeness_score is ${score} — must be ≥70`);

  if (ready !== true) errors.push('V8: ready_for_narrative must be explicitly true');

  return { rule: 'V8', severity: 'error', status: errors.length === 0 ? 'pass' : 'fail', errors, warnings };
}

// ─── V9: BPMN structural soundness (warning) ─────────────────────────────────
const BPMN_HEADER_RE = /^\s*bpmn-beta\b/m;
const BPMN_NODE_RE = /\b(start|end|task|event|gateway)\b/i;
const BPMN_FLOW_RE = /--?>|~~>/;

function checkV9(bpmn) {
  const warnings = [];
  if (!bpmn || typeof bpmn !== 'string' || bpmn.trim().length === 0) {
    return { rule: 'V9', severity: 'warning', status: 'warn', errors: [], warnings: ['V9: bpmn is empty or not a string'] };
  }
  if (!BPMN_HEADER_RE.test(bpmn)) {
    warnings.push('V9: bpmn-beta diagram is missing the "bpmn-beta" header keyword');
  }
  if (!BPMN_NODE_RE.test(bpmn)) {
    warnings.push('V9: bpmn-beta diagram has no recognisable node types (start/end/task/event/gateway)');
  }
  if (!BPMN_FLOW_RE.test(bpmn)) {
    warnings.push('V9: bpmn-beta diagram has no flow arrows (-->, ->>, ~~>)');
  }
  if (!bpmn.includes('lane ') && !bpmn.includes('pool ')) {
    warnings.push('V9: bpmn-beta diagram has no pool or lane definitions — consider adding swimlanes');
  }
  return { rule: 'V9', severity: 'warning', status: warnings.length === 0 ? 'pass' : 'warn', errors: [], warnings };
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * @param {{ pir?: object, pns?: object, bpmn?: string }} opts
 * @returns {{ valid: boolean, errors: string[], warnings: string[], report: object }}
 */
export function runValidationSuite(opts = {}) {
  const { pir, pns, bpmn } = opts;
  const errors = [];
  const warnings = [];
  const rulesRun = [];

  // V8: PIR gate — always run
  const v8 = checkV8(pir || {});
  rulesRun.push(v8);

  rulesRun.push(...checkPns(pns));

  if (bpmn) {
    rulesRun.push(checkV9(bpmn));
  } else {
    warnings.push('bpmn not provided — V9 check skipped');
  }

  // Collect all rule-level errors/warnings into top-level arrays
  for (const r of rulesRun) {
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }

  // Scores
  const pirScore = v8.status === 'pass' ? 100 : 30;
  const pnsScore = pns ? scorePnsQuality(pns).score : 0;
  const bpmnScore = bpmn
    ? (checkV9(bpmn).status === 'pass' ? 100 : 60)
    : 0;

  const weights = pns
    ? (bpmn ? { pir: 0.2, pns: 0.6, bpmn: 0.2 } : { pir: 0.25, pns: 0.75, bpmn: 0 })
    : { pir: 1, pns: 0, bpmn: 0 };

  const composite = Math.round(
    pirScore * weights.pir + pnsScore * weights.pns + bpmnScore * weights.bpmn
  );

  const band = composite >= 90 ? 'A' : composite >= 75 ? 'B' : composite >= 50 ? 'C' : 'D';

  // Publication gate: band must be A or B AND no blocking-rule errors
  const hasBlockingErrors = rulesRun.some(r => BLOCKING_RULES.has(r.rule) && r.status === 'fail');
  const readyForPublication = pnsScore >= 75 && (band === 'A' || band === 'B') && !hasBlockingErrors;

  const report = {
    rules_run: rulesRun.map(r => ({
      rule_id: r.rule,
      severity: r.severity,
      status: r.status,
      findings: [...r.errors, ...r.warnings],
    })),
    artifact_scores: { pir: pirScore, pns: pns ? pnsScore : null, bpmn: bpmn ? bpmnScore : null },
    composite_score: composite,
    band,
    ready_for_publication: readyForPublication,
    blocking_errors: errors.filter((_, i) => {
      const src = rulesRun.find(r => BLOCKING_RULES.has(r.rule) && r.errors.includes(errors[i]));
      return src !== undefined;
    }),
    recommendations: warnings,
  };

  return { valid: errors.length === 0, errors, warnings, report };
}

// ─── CLI entrypoint ───────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const { loadFile } = await import('./parse-yaml-minimal.mjs');
  const args = process.argv.slice(2);
  const opts = {};
  for (let index = 0; index < args.length; index += 2) {
    const option = args[index];
    const file = args[index + 1];
    if (!['--pir', '--pns', '--bpmn'].includes(option) || !file) {
      console.error('Usage: node run-validation-suite.mjs --pir <pir.yaml> --pns <pns.yaml> [--bpmn <bpmn.mmd>]');
      process.exit(1);
    }
    opts[option.slice(2)] = option === '--bpmn'
      ? (await import('node:fs')).readFileSync(file, 'utf8')
      : await loadFile(file);
  }
  const result = runValidationSuite(opts);
  console.log('Composite score:', result.report.composite_score, '| Band:', result.report.band);
  console.log('Ready for publication:', result.report.ready_for_publication);
  for (const error of result.errors) console.error('ERROR:', error);
  for (const warning of result.warnings) console.warn('WARN:', warning);
  process.exit(result.valid ? 0 : 1);
}
