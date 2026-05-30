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

// ─── V1: PNS schema completeness ─────────────────────────────────────────────
function checkV1(pns) {
  const errors = [];
  if (!pns) { errors.push('V1: pns is null or undefined'); return { rule: 'V1', severity: 'error', status: 'fail', errors, warnings: [] }; }
  const required = ['pns_version', 'process_id', 'process_name', 'process_owner', 'department', 'status'];
  for (const f of required) {
    if (!pns[f]) errors.push(`V1: required field "${f}" is missing or empty`);
  }
  const sections = ['process_box', 'activity_sequence', 'roles_and_raci', 'business_rules',
    'decision_points', 'exception_paths', 'kpis', 'systems_and_integrations',
    'controls_and_compliance', 'open_questions', 'babok_core_concepts', 'revision_history', 'validation'];
  for (const s of sections) {
    if (!(s in pns)) errors.push(`V1: required section "${s}" is missing`);
  }
  return { rule: 'V1', severity: 'error', status: errors.length === 0 ? 'pass' : 'fail', errors, warnings: [] };
}

// ─── V2: Activity/rule completeness ──────────────────────────────────────────
function checkV2(pns) {
  const errors = [];
  const activities = pns?.activity_sequence?.activities || [];
  for (const a of activities) {
    if (!a.description) errors.push(`V2: activity "${a.id}" has no description`);
    if (!a.actor_role_id) errors.push(`V2: activity "${a.id}" has no actor_role_id`);
  }
  const rules = Array.isArray(pns?.business_rules) ? pns.business_rules : [];
  for (const r of rules) {
    if (!r.source) errors.push(`V2: business rule "${r.id}" has no source`);
  }
  return { rule: 'V2', severity: 'error', status: errors.length === 0 ? 'pass' : 'fail', errors, warnings: [] };
}

// ─── V3: RACI coverage ───────────────────────────────────────────────────────
function checkV3(pns) {
  const errors = [];
  const matrix = pns?.roles_and_raci?.raci_matrix || [];
  const activityIds = new Set((pns?.activity_sequence?.activities || []).map(a => a.id));
  for (const entry of matrix) {
    if (!entry.accountable) errors.push(`V3: RACI entry "${entry.activity_id}" has no accountable`);
    if (!Array.isArray(entry.responsible) || entry.responsible.length === 0) {
      errors.push(`V3: RACI entry "${entry.activity_id}" has no responsible`);
    }
  }
  for (const id of activityIds) {
    if (!matrix.some(e => e.activity_id === id)) {
      errors.push(`V3: activity "${id}" has no RACI entry`);
    }
  }
  return { rule: 'V3', severity: 'error', status: errors.length === 0 ? 'pass' : 'fail', errors, warnings: [] };
}

// ─── V4: Activity description style (warning) ────────────────────────────────
const SUBORDINATE_CONJUNCTIONS = ['when ', 'if ', 'after ', 'before ', 'while '];

function checkV4(pns) {
  const warnings = [];
  const activities = pns?.activity_sequence?.activities || [];
  for (const a of activities) {
    const desc = typeof a.description === 'string' ? a.description : '';
    if (!desc) continue;
    if (desc.includes(';')) {
      warnings.push(`V4: activity "${a.id}" description contains a semicolon — split into separate activities`);
    }
    if (desc.length > 200) {
      warnings.push(`V4: activity "${a.id}" description exceeds 200 characters (${desc.length})`);
    }
    const lower = desc.trimStart().toLowerCase();
    for (const conj of SUBORDINATE_CONJUNCTIONS) {
      if (lower.startsWith(conj)) {
        warnings.push(`V4: activity "${a.id}" description begins with subordinate conjunction "${conj.trim()}" — rewrite as imperative`);
        break;
      }
    }
  }
  return { rule: 'V4', severity: 'warning', status: warnings.length === 0 ? 'pass' : 'warn', errors: [], warnings };
}

// ─── V5: KPI measurability ───────────────────────────────────────────────────
function checkV5(pns) {
  const errors = [];
  const kpis = Array.isArray(pns?.kpis) ? pns.kpis : [];
  for (const k of kpis) {
    if (!k.formula) errors.push(`V5: KPI "${k.id}" has no formula`);
    if (!k.data_source) errors.push(`V5: KPI "${k.id}" has no data_source`);
  }
  return { rule: 'V5', severity: 'error', status: errors.length === 0 ? 'pass' : 'fail', errors, warnings: [] };
}

// ─── V6: Decision/exception completeness ─────────────────────────────────────
function checkV6(pns) {
  const errors = [];
  const dps = Array.isArray(pns?.decision_points) ? pns.decision_points : [];
  for (const d of dps) {
    if (!Array.isArray(d.outcomes) || d.outcomes.length < 2) {
      errors.push(`V6: decision_point "${d.id}" has fewer than 2 outcomes`);
    }
  }
  const excs = Array.isArray(pns?.exception_paths) ? pns.exception_paths : [];
  for (const e of excs) {
    if (!e.handling) errors.push(`V6: exception_path "${e.id}" has empty handling`);
  }
  return { rule: 'V6', severity: 'error', status: errors.length === 0 ? 'pass' : 'fail', errors, warnings: [] };
}

// ─── V7: Controls coverage (warning) ─────────────────────────────────────────
function checkV7(pns) {
  const warnings = [];
  if (!Array.isArray(pns?.controls_and_compliance) || pns.controls_and_compliance.length === 0) {
    warnings.push('V7: controls_and_compliance is empty — add at least one control');
  }
  return { rule: 'V7', severity: 'warning', status: warnings.length === 0 ? 'pass' : 'warn', errors: [], warnings };
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

  if (ready !== true) {
    if (score >= 70) warnings.push('V8: ready_for_narrative is not explicitly true despite score ≥70');
    else errors.push('V8: ready_for_narrative is not true');
  }

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

// ─── Scoring helpers ──────────────────────────────────────────────────────────
function scorePns(pns) {
  const stored = pns?.validation?.pns_quality_score;
  if (typeof stored === 'number') return stored;
  let score = 0;
  if (pns?.process_box?.trigger) score += 15;
  const acts = pns?.activity_sequence?.activities || [];
  if (acts.length >= 3) score += 15;
  if ((pns?.roles_and_raci?.roles || []).length >= 2) score += 10;
  if ((Array.isArray(pns?.business_rules) ? pns.business_rules : []).length > 0) score += 10;
  if ((Array.isArray(pns?.decision_points) ? pns.decision_points : []).length > 0) score += 10;
  if ((Array.isArray(pns?.exception_paths) ? pns.exception_paths : []).length > 0) score += 10;
  if ((Array.isArray(pns?.kpis) ? pns.kpis : []).length > 0) score += 10;
  return score;
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

  if (pns) {
    rulesRun.push(checkV1(pns));
    rulesRun.push(checkV2(pns));
    rulesRun.push(checkV3(pns));
    rulesRun.push(checkV4(pns));   // V4: style warnings (was missing)
    rulesRun.push(checkV5(pns));
    rulesRun.push(checkV6(pns));
    rulesRun.push(checkV7(pns));
  } else {
    warnings.push('pns not provided — V1–V7 checks skipped');
  }

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
  const pnsScore = pns ? scorePns(pns) : 0;
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
  const readyForPublication = (band === 'A' || band === 'B') && !hasBlockingErrors;

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
  const result = runValidationSuite({});
  console.log('Composite score:', result.report.composite_score, '| Band:', result.report.band);
  console.log('Ready for publication:', result.report.ready_for_publication);
  if (result.errors.length > 0) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
}
