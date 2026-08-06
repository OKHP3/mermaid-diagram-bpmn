#!/usr/bin/env node
/**
 * analyze-gaps.mjs
 * Detects structural, execution, exception, and compliance gaps
 * from an as-is process YAML.
 *
 * Usage: node analyze-gaps.mjs <as-is-process.yaml>
 * Named exports: analyzeGaps(asIs) → { valid, errors, warnings, gaps, exceptionCatalog, summary }
 */

/**
 * @param {object} asIs - Parsed as-is-process.yaml object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], gaps: Array, exceptionCatalog: Array, summary: object }}
 */
export function analyzeGaps(asIs) {
  const errors = [];
  const warnings = [];
  const gaps = [];
  const exceptionCatalog = [];

  if (!asIs || typeof asIs !== 'object') {
    errors.push('asIs must be a non-null object');
    return { valid: false, errors, warnings, gaps, exceptionCatalog, summary: {} };
  }

  const steps = Array.isArray(asIs.steps) ? asIs.steps : [];
  let gapIndex = 1;

  function addGap(type, severity, stepId, description, rootCause, impact, recommendedAction) {
    gaps.push({
      gap_id: `gap-${String(gapIndex++).padStart(3, '0')}`,
      gap_type: type,
      severity,
      affected_steps: stepId ? [stepId] : [],
      description,
      root_cause: rootCause,
      impact,
      recommended_action: recommendedAction,
    });
  }

  // Type 1 — Structural gaps
  for (const step of steps) {
    if (!step.actor_role_id) {
      addGap(
        'structural', 'major', step.id,
        `Step "${step.id}" has no actor_role_id`,
        'Role not captured during elicitation',
        'Activity has no owner — cannot assign RACI',
        'Identify the role responsible for this step'
      );
    }
    if (!step.description) {
      addGap(
        'structural', 'critical', step.id,
        `Step "${step.id}" has no description`,
        'Step captured without description',
        'Activity semantics unknown — cannot author narrative or SOP',
        'Provide a single imperative statement describing this step'
      );
    }
  }

  if (steps.length === 0) {
    warnings.push('No steps found in as-is process — structural gap analysis skipped');
  }

  // Type 2 — Execution gaps
  const roleFrequency = {};
  for (const step of steps) {
    const role = step.actor_role_id || '';
    if (role) roleFrequency[role] = (roleFrequency[role] || 0) + 1;
  }
  const total = steps.length;
  for (const [role, count] of Object.entries(roleFrequency)) {
    if (total > 0 && count / total > 0.5) {
      warnings.push(`Role "${role}" performs more than 50% of steps — possible key-person dependency`);
    }
  }

  for (const step of steps) {
    if (step.capture_quality === 'low') {
      addGap(
        'execution', 'major', step.id,
        `Step "${step.id}" has capture_quality: low`,
        'Step was not well understood during elicitation',
        'Poorly understood steps cannot be reliably included in the process narrative',
        'Conduct a follow-up elicitation session targeting this step'
      );
    }
  }

  // Type 3 — Exception gaps (check PIR-style exceptions if present)
  const pirExceptions = Array.isArray(asIs.exceptions) ? asIs.exceptions : [];
  for (const exc of pirExceptions) {
    if (!exc.handling) {
      exceptionCatalog.push({
        exception_id: exc.id || `exc-${String(exceptionCatalog.length + 1).padStart(3, '0')}`,
        description: exc.description || '',
        trigger_condition: exc.trigger || '',
        affected_steps: [],
        current_handling: '',
        severity: 'critical',
        recommended_action: 'Define a handling procedure for this exception path',
      });
    }
  }

  // Type 4 — Compliance gaps
  const controls = Array.isArray(asIs.controls) ? asIs.controls : [];
  if (controls.length === 0 && steps.length > 0) {
    addGap(
      'compliance', 'major', null,
      'No controls defined for this process',
      'Controls were not captured during intake',
      'Process has no governance controls — cannot satisfy ISO 9001 §9.1',
      'Define at least one preventive or detective control for the process'
    );
  }

  const counts = { critical: 0, major: 0, minor: 0, observation: 0 };
  for (const g of gaps) counts[g.severity] = (counts[g.severity] || 0) + 1;

  const summary = {
    critical_count: counts.critical,
    major_count: counts.major,
    minor_count: counts.minor,
    observation_count: counts.observation,
    ready_for_future_state: counts.critical === 0,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    gaps,
    exceptionCatalog,
    summary,
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const { readFileSync } = await import('node:fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node analyze-gaps.mjs <as-is-process.yaml>');
    process.exit(1);
  }
  const raw = readFileSync(filePath, 'utf8');
  const asIs = { process_id: raw.match(/process_id:\s*(\S+)/)?.[1] || '', steps: [] };
  const result = analyzeGaps(asIs);
  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
  for (const w of result.warnings) console.warn('WARN:', w);
  console.log(JSON.stringify({ gaps: result.gaps, summary: result.summary }, null, 2));
}
