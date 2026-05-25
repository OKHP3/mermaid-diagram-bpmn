#!/usr/bin/env node
/**
 * validate-dmn-traceability.mjs
 * Checks that every DMN decision in a decision-model stub traces back to either
 * a decision point (sections.decision_points[].id) or a business rule
 * (sections.business_rules[].id) in the target PNS document.
 *
 * Usage: node scripts/validate-dmn-traceability.mjs <decision-model.yaml> <pns.yaml>
 * Export: validateDmnTraceability(dmn, pns) → { valid, errors, warnings }
 *
 * DMN stub schema (YAML/JSON):
 *   decisions:
 *     - id: dmn-001
 *       label: "Approval Required?"
 *       pns_decision_ref: dp-001    # traces to PNS sections.decision_points[].id
 *     - id: dmn-002
 *       label: "Budget Threshold Rule"
 *       pns_rule_ref: br-001        # traces to PNS sections.business_rules[].id
 *     - id: dmn-003
 *       label: "Priority Assessment"
 *                                   # no explicit ref → id matched against both dp and br ids
 */

/**
 * Build the set of valid PNS trace targets from a parsed PNS object.
 * Includes both decision_points[].id and business_rules[].id.
 * @param {object} pns
 * @returns {{ dpIds: Set<string>, brIds: Set<string>, allIds: Set<string> }}
 */
function buildPnsTargetSets(pns) {
  const sections = pns.sections || pns;
  const pnsDecisions = Array.isArray(sections.decision_points) ? sections.decision_points : [];
  const pnsRules     = Array.isArray(sections.business_rules)  ? sections.business_rules  : [];

  const dpIds = new Set(pnsDecisions.map(dp => String(dp.id || '').trim()).filter(Boolean));
  const brIds = new Set(pnsRules.map(br     => String(br.id || '').trim()).filter(Boolean));
  const allIds = new Set([...dpIds, ...brIds]);

  return { dpIds, brIds, allIds };
}

/**
 * @param {object} dmn  Parsed DMN stub object (decisions[])
 * @param {object} pns  Parsed PNS object (sections.decision_points[], sections.business_rules[])
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateDmnTraceability(dmn, pns) {
  const errors = [];
  const warnings = [];

  if (!dmn || typeof dmn !== 'object') {
    errors.push('DMN stub must be a non-null object');
    return { valid: false, errors, warnings };
  }

  if (!pns || typeof pns !== 'object') {
    errors.push('PNS must be a non-null object');
    return { valid: false, errors, warnings };
  }

  const decisions = Array.isArray(dmn.decisions) ? dmn.decisions : [];
  if (decisions.length === 0) {
    warnings.push('DMN stub has no decisions — nothing to trace');
    return { valid: true, errors, warnings };
  }

  const { dpIds, brIds, allIds } = buildPnsTargetSets(pns);

  if (allIds.size === 0) {
    errors.push(
      `PNS has no decision_points or business_rules but DMN stub declares ` +
      `${decisions.length} decision(s) — no PNS trace targets available`
    );
    return { valid: false, errors, warnings };
  }

  const tracedIds = new Set();

  for (const decision of decisions) {
    const dmnId = String(decision.id || '').trim();
    if (!dmnId) {
      errors.push('DMN decision is missing required field: id');
      continue;
    }

    const dpRef  = String(decision.pns_decision_ref || '').trim();
    const brRef  = String(decision.pns_rule_ref     || '').trim();

    if (dpRef) {
      if (!dpIds.has(dpRef)) {
        errors.push(
          `DMN decision "${dmnId}" has pns_decision_ref "${dpRef}" ` +
          `which does not match any PNS decision_point id. ` +
          `Available dp ids: ${[...dpIds].join(', ') || '(none)'}`
        );
      } else {
        tracedIds.add(dpRef);
      }
      continue;
    }

    if (brRef) {
      if (!brIds.has(brRef)) {
        errors.push(
          `DMN decision "${dmnId}" has pns_rule_ref "${brRef}" ` +
          `which does not match any PNS business_rule id. ` +
          `Available br ids: ${[...brIds].join(', ') || '(none)'}`
        );
      } else {
        tracedIds.add(brRef);
      }
      continue;
    }

    if (allIds.has(dmnId)) {
      tracedIds.add(dmnId);
    } else {
      errors.push(
        `DMN decision "${dmnId}" has no pns_decision_ref or pns_rule_ref, ` +
        `and its id does not match any PNS decision_point or business_rule id. ` +
        `Add pns_decision_ref (dp ids: ${[...dpIds].join(', ') || 'none'}) ` +
        `or pns_rule_ref (br ids: ${[...brIds].join(', ') || 'none'}).`
      );
    }
  }

  for (const dpId of dpIds) {
    if (!tracedIds.has(dpId)) {
      warnings.push(
        `PNS decision_point "${dpId}" has no corresponding DMN decision — ` +
        `consider adding a DMN rule table for this decision point`
      );
    }
  }

  for (const brId of brIds) {
    if (!tracedIds.has(brId)) {
      warnings.push(
        `PNS business_rule "${brId}" has no corresponding DMN decision — ` +
        `consider formalising this rule as a DMN decision table`
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const [, , dmnFile, pnsFile] = process.argv;
  if (!dmnFile || !pnsFile) {
    console.log('Usage: node validate-dmn-traceability.mjs <decision-model.yaml> <pns.yaml>');
    console.log('Traces each DMN decision to a PNS decision_point or business_rule by id.');
    process.exit(0);
  }
  const { readFileSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const here = dirname(fileURLToPath(import.meta.url));
  const { parseYaml } = await import(
    resolve(here, '../skills/okhp3-process-narrative/scripts/parse-yaml-minimal.mjs')
  );
  const dmn = parseYaml(readFileSync(resolve(dmnFile), 'utf8'));
  const pns = parseYaml(readFileSync(resolve(pnsFile), 'utf8'));
  const result = validateDmnTraceability(dmn, pns);
  console.log(`DMN Traceability: ${result.valid ? 'PASS' : 'FAIL'}`);
  if (result.errors.length > 0) {
    for (const e of result.errors) console.error(`  ERROR: ${e}`);
    process.exit(1);
  }
  if (result.warnings.length > 0) {
    for (const w of result.warnings) console.warn(`  WARN: ${w}`);
  }
  console.log('Traceability check passed.');
}
