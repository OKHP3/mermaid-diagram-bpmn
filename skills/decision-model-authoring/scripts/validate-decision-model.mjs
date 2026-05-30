#!/usr/bin/env node
/**
 * validate-decision-model.mjs
 * Validates decision model structure, hit policy completeness, and PNS traceability.
 *
 * Usage: node validate-decision-model.mjs <decision-model.yaml>
 * Named exports: validateDecisionModel(dm, pns?) → { valid, errors, warnings, rules_fired }
 */

const VALID_HIT_POLICIES = ['U', 'F', 'A', 'C', 'R', 'O'];
const VALID_TYPES = ['string', 'number', 'boolean', 'date', 'enum'];

/**
 * @param {object} dm  - Parsed decision-model.yaml object
 * @param {object} [pns] - Optional parsed pns.yaml for traceability checks
 * @returns {{ valid: boolean, errors: string[], warnings: string[], rules_fired: string[] }}
 */
export function validateDecisionModel(dm, pns) {
  const errors = [];
  const warnings = [];
  const rules_fired = [];

  if (!dm || typeof dm !== 'object') {
    errors.push('DM-1: decision model must be a non-null object');
    return { valid: false, errors, warnings, rules_fired };
  }

  const decisions = Array.isArray(dm.decisions) ? dm.decisions : [];

  // DM-1: At least one decision
  if (decisions.length === 0) {
    errors.push('DM-1: decisions[] must contain at least one entry');
    return { valid: false, errors, warnings, rules_fired };
  }
  rules_fired.push('DM-1: decisions array non-empty');

  // DM-2: Required fields per decision
  for (const d of decisions) {
    const id = d.decision_id || '(no id)';

    if (!d.decision_id) errors.push(`DM-2: decision is missing decision_id`);
    if (!d.decision_name) errors.push(`DM-2: ${id} is missing decision_name`);
    if (!d.activity_id) errors.push(`DM-2: ${id} is missing activity_id`);

    // DM-3: Valid hit policy
    if (!d.hit_policy) {
      errors.push(`DM-3: ${id} is missing hit_policy`);
    } else if (!VALID_HIT_POLICIES.includes(d.hit_policy)) {
      errors.push(`DM-3: ${id} has invalid hit_policy "${d.hit_policy}" — must be one of ${VALID_HIT_POLICIES.join(', ')}`);
    } else {
      rules_fired.push(`DM-3: ${id} hit_policy=${d.hit_policy} is valid`);
    }

    // DM-4: Inputs and outputs defined
    const inputs = Array.isArray(d.inputs) ? d.inputs : [];
    const outputs = Array.isArray(d.outputs) ? d.outputs : [];
    if (inputs.length === 0) errors.push(`DM-4: ${id} has no inputs`);
    if (outputs.length === 0) errors.push(`DM-4: ${id} has no outputs`);

    for (const inp of inputs) {
      if (!inp.name) errors.push(`DM-4: ${id} has an input with no name`);
      if (inp.type && !VALID_TYPES.includes(inp.type)) {
        warnings.push(`DM-4: ${id} input "${inp.name}" has unrecognised type "${inp.type}"`);
      }
    }

    // DM-5: Rules must have annotations
    const rules = Array.isArray(d.rules) ? d.rules : [];
    if (rules.length === 0) {
      errors.push(`DM-5: ${id} has no rules`);
    } else {
      for (const r of rules) {
        if (!r.annotation) {
          warnings.push(`DM-5: ${id} rule ${r.rule_id || '(no id)'} has no annotation`);
        }
      }
      rules_fired.push(`DM-5: ${id} has ${rules.length} rule(s)`);
    }

    // DM-6: PNS traceability (if PNS provided)
    if (pns) {
      const pnsDecisions = Array.isArray(pns.decision_points) ? pns.decision_points : [];
      const pnsIds = new Set(pnsDecisions.map(p => p.id));
      if (d.decision_id && !pnsIds.has(d.decision_id)) {
        errors.push(`DM-6: decision_id "${d.decision_id}" not found in pns.decision_points[]`);
      } else if (d.decision_id) {
        rules_fired.push(`DM-6: ${d.decision_id} traced to PNS decision_points`);
      }

      const pnsActivities = Array.isArray(pns.activity_sequence?.activities)
        ? pns.activity_sequence.activities
        : [];
      const actIds = new Set(pnsActivities.map(a => a.id));
      if (d.activity_id && !actIds.has(d.activity_id)) {
        errors.push(`DM-6: activity_id "${d.activity_id}" not found in pns.activity_sequence.activities[]`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    rules_fired,
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const { readFileSync } = await import('node:fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node validate-decision-model.mjs <decision-model.yaml>');
    process.exit(1);
  }
  const raw = readFileSync(filePath, 'utf8');
  const dm = { decisions: [], process_id: raw.match(/process_id:\s*(\S+)/)?.[1] || '' };
  const result = validateDecisionModel(dm);
  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
  for (const w of result.warnings) console.warn('WARN:', w);
  console.log('PASS:', result.rules_fired.length, 'checks passed');
}
