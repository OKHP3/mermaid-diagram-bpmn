#!/usr/bin/env node
/**
 * run-validation-suite.mjs
 * Orchestrates V1–V9 validation checks across all BP-SKILL process artifacts
 * and returns a composite 0–100 quality score with band classification.
 *
 * Usage: node run-validation-suite.mjs --pir <pir.yaml> --pns <pns.yaml> [--bpmn <bpmn.mmd>]
 * Named exports: runValidationSuite(opts) → { valid, errors, warnings, report }
 */

/**
 * Lightweight structural checks — returns pass/fail per rule without importing heavy validators.
 * Full validation uses the actual validate-pir.mjs / validate-pns.mjs scripts from okhp3 skills.
 */
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

function checkV5(pns) {
  const errors = [];
  const kpis = Array.isArray(pns?.kpis) ? pns.kpis : [];
  for (const k of kpis) {
    if (!k.formula) errors.push(`V5: KPI "${k.id}" has no formula`);
    if (!k.data_source) errors.push(`V5: KPI "${k.id}" has no data_source`);
  }
  return { rule: 'V5', severity: 'error', status: errors.length === 0 ? 'pass' : 'fail', errors, warnings: [] };
}

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

function scorePns(pns) {
  const stored = pns?.validation?.pns_quality_score;
  if (typeof stored === 'number') return stored;
  // Rough heuristic if score not present
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

/**
 * @param {{ pir?: object, pns?: object, bpmn?: string }} opts
 * @returns {{ valid: boolean, errors: string[], warnings: string[], report: object }}
 */
export function runValidationSuite(opts = {}) {
  const { pir, pns, bpmn } = opts;
  const errors = [];
  const warnings = [];

  const rulesRun = [];

  const v8 = checkV8(pir || {});
  rulesRun.push(v8);

  if (pns) {
    rulesRun.push(checkV1(pns));
    rulesRun.push(checkV2(pns));
    rulesRun.push(checkV3(pns));
    rulesRun.push(checkV5(pns));
    rulesRun.push(checkV6(pns));

    const v7Warnings = [];
    if (!Array.isArray(pns.controls_and_compliance) || pns.controls_and_compliance.length === 0) {
      v7Warnings.push('V7: controls_and_compliance is empty');
    }
    rulesRun.push({ rule: 'V7', severity: 'warning', status: v7Warnings.length === 0 ? 'pass' : 'warn', errors: [], warnings: v7Warnings });
  } else {
    warnings.push('pns not provided — V1–V7 checks skipped');
  }

  if (bpmn) {
    const hasLane = bpmn.includes('lane ');
    rulesRun.push({
      rule: 'V9', severity: 'warning',
      status: hasLane ? 'pass' : 'warn',
      errors: [],
      warnings: hasLane ? [] : ['V9: bpmn-beta diagram has no lane definitions'],
    });
  } else {
    warnings.push('bpmn not provided — V9 check skipped');
  }

  // Collect all errors/warnings
  for (const r of rulesRun) {
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }

  // Compute scores
  const pirScore = v8.status === 'pass' ? 100 : 30;
  const pnsScore = pns ? scorePns(pns) : 0;
  const bpmnScore = bpmn ? (bpmn.includes('lane ') ? 100 : 50) : 0;

  const weights = pns ? (bpmn ? { pir: 0.2, pns: 0.6, bpmn: 0.2 } : { pir: 0.25, pns: 0.75, bpmn: 0 })
    : { pir: 1, pns: 0, bpmn: 0 };

  const composite = Math.round(
    pirScore * weights.pir + pnsScore * weights.pns + bpmnScore * weights.bpmn
  );

  const band = composite >= 90 ? 'A' : composite >= 75 ? 'B' : composite >= 50 ? 'C' : 'D';
  const readyForPublication = band === 'A' || band === 'B';

  const report = {
    rules_run: rulesRun.map(r => ({ rule_id: r.rule, severity: r.severity, status: r.status, findings: [...r.errors, ...r.warnings] })),
    artifact_scores: { pir: pirScore, pns: pns ? pnsScore : null, bpmn: bpmn ? bpmnScore : null },
    composite_score: composite,
    band,
    ready_for_publication: readyForPublication,
    blocking_errors: errors,
    recommendations: warnings,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    report,
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const result = runValidationSuite({});
  console.log('Composite score:', result.report.composite_score, '| Band:', result.report.band);
  console.log('Ready for publication:', result.report.ready_for_publication);
  if (result.errors.length > 0) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
}
