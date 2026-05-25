#!/usr/bin/env node
/**
 * validate-dmn-traceability.mjs
 * Checks that every DMN decision ID in a decision-model stub traces back
 * to a decision point ID in a PNS (sections.decision_points[]).
 *
 * Usage: node scripts/validate-dmn-traceability.mjs <decision-model.yaml> <pns.yaml>
 * Export: validateDmnTraceability(dmn, pns) → { valid, errors, warnings }
 *
 * DMN stub schema (YAML/JSON):
 *   decisions:
 *     - id: dmn-001
 *       label: "Approval Required?"
 *       pns_decision_ref: dp-001    # optional — if present, must match a PNS dp id
 *     - id: dmn-002
 *       label: "Budget Available?"
 *                                   # no pns_decision_ref → traced by ID match only
 */

/**
 * @param {object} dmn  Parsed DMN stub object (decisions[])
 * @param {object} pns  Parsed PNS object (sections.decision_points[])
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

  const sections = pns.sections || pns;
  const pnsDecisions = Array.isArray(sections.decision_points) ? sections.decision_points : [];
  const pnsDpIds = new Set(pnsDecisions.map(dp => String(dp.id || '').trim()));
  const pnsDpLabels = new Map(
    pnsDecisions.map(dp => [String(dp.id || '').trim(), String(dp.description || '').trim()])
  );

  if (pnsDpIds.size === 0) {
    if (decisions.length > 0) {
      errors.push(`PNS has no decision_points but DMN stub declares ${decisions.length} decision(s) — no traceability possible`);
      return { valid: false, errors, warnings };
    }
    return { valid: true, errors, warnings };
  }

  for (const decision of decisions) {
    const dmnId = String(decision.id || '').trim();
    if (!dmnId) {
      errors.push('DMN decision is missing required field: id');
      continue;
    }

    const explicitRef = String(decision.pns_decision_ref || '').trim();

    if (explicitRef) {
      if (!pnsDpIds.has(explicitRef)) {
        errors.push(
          `DMN decision "${dmnId}" has pns_decision_ref "${explicitRef}" ` +
          `which does not match any PNS decision_point id. ` +
          `Available dp ids: ${[...pnsDpIds].join(', ')}`
        );
      }
    } else {
      if (!pnsDpIds.has(dmnId)) {
        errors.push(
          `DMN decision "${dmnId}" has no pns_decision_ref and its id does not match ` +
          `any PNS decision_point id. Add pns_decision_ref or rename to match a dp id. ` +
          `Available dp ids: ${[...pnsDpIds].join(', ')}`
        );
      } else {
        const pnsLabel = pnsDpLabels.get(dmnId);
        if (pnsLabel && decision.label) {
          const dmnLabel = String(decision.label).trim().toLowerCase();
          const pnsLabelLower = pnsLabel.toLowerCase();
          if (!pnsLabelLower.includes(dmnLabel.slice(0, 10))) {
            warnings.push(
              `DMN decision "${dmnId}" label "${decision.label}" may not match ` +
              `PNS decision_point description "${pnsLabel}" — verify traceability`
            );
          }
        }
      }
    }
  }

  const tracedDpIds = new Set();
  for (const decision of decisions) {
    const ref = String(decision.pns_decision_ref || decision.id || '').trim();
    if (pnsDpIds.has(ref)) tracedDpIds.add(ref);
  }
  for (const dpId of pnsDpIds) {
    if (!tracedDpIds.has(dpId)) {
      warnings.push(
        `PNS decision_point "${dpId}" has no corresponding DMN decision — ` +
        `consider adding a DMN rule table for this decision point`
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const [, , dmnFile, pnsFile] = process.argv;
  if (!dmnFile || !pnsFile) {
    console.log('Usage: node validate-dmn-traceability.mjs <decision-model.yaml> <pns.yaml>');
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
}
