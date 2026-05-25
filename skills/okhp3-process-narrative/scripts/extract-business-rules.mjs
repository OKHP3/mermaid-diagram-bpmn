/**
 * extract-business-rules.mjs
 * Collects and deduplicates business rules from a PNS.
 * Sources: sections.business_rules (primary) + sections.decision_points[].criteria (derived).
 * No external dependencies — pure ESM.
 *
 * Usage: node scripts/extract-business-rules.mjs <pns.yaml>
 * Export: extractBusinessRules(pns) => { valid, errors[], warnings[], rules[] }
 */

import { loadFile } from './parse-yaml-minimal.mjs';

/**
 * @param {object} pns  Parsed PNS object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], rules: Array }}
 */
export function extractBusinessRules(pns) {
  const errors = [];
  const warnings = [];

  if (!pns || typeof pns !== 'object') {
    errors.push('PNS is not a valid object');
    return { valid: false, errors, warnings, rules: [] };
  }

  const sections = pns.sections || {};
  const rules = [];
  const seen = new Set();

  // Primary: sections.business_rules
  const primaryRules = Array.isArray(sections.business_rules) ? sections.business_rules : [];
  for (const rule of primaryRules) {
    const id = String(rule.id || '').trim();
    const description = String(rule.description || '').trim();
    if (!description) {
      warnings.push(`Business rule "${id || '(no id)'}" has an empty description — skipped`);
      continue;
    }
    if (seen.has(description)) {
      warnings.push(`Duplicate rule description skipped: "${description.slice(0, 60)}..."`);
      continue;
    }
    seen.add(description);
    rules.push({
      id: id || `br-auto-${rules.length + 1}`,
      description,
      source: String(rule.source || '').trim() || '(unspecified)',
      type: 'business_rule',
      applies_to: String(rule.applies_to || 'all').trim(),
      rationale: String(rule.rationale || '').trim(),
    });
  }

  // Derived: decision_points[].criteria → treated as constraint rules
  const decisionPoints = Array.isArray(sections.decision_points) ? sections.decision_points : [];
  for (const dp of decisionPoints) {
    const criteria = String(dp.criteria || '').trim();
    if (!criteria) continue;

    const derivedDescription = `Decision criterion for "${String(dp.description || dp.id || '').trim()}": ${criteria}`;

    if (seen.has(derivedDescription)) continue;
    seen.add(derivedDescription);

    rules.push({
      id: `br-dp-${String(dp.id || rules.length + 1)}`,
      description: derivedDescription,
      source: `Decision point ${dp.id || '(no id)'}`,
      type: 'decision_criterion',
      applies_to: String(dp.activity_id || 'unspecified').trim(),
      rationale: '',
    });
  }

  if (rules.length === 0) {
    warnings.push('No business rules or decision criteria found in this PNS');
  }

  return { valid: true, errors, warnings, rules };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('extract-business-rules.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/extract-business-rules.mjs <pns.yaml>');
    console.log('Extracts and deduplicates business rules from a PNS file.');
    process.exit(0);
  }
  loadFile(file).then((pns) => {
    const result = extractBusinessRules(pns);
    if (!result.valid) {
      console.error('Error:', result.errors.join('; '));
      process.exit(1);
    }
    console.log(`Business Rules — ${pns.process_name || ''} (${pns.process_id || ''})`);
    console.log(`Total: ${result.rules.length} rule(s)\n`);
    for (const rule of result.rules) {
      console.log(`[${rule.id}] (${rule.type})`);
      console.log(`  Description: ${rule.description}`);
      console.log(`  Source: ${rule.source}`);
      console.log(`  Applies to: ${rule.applies_to}`);
      if (rule.rationale) console.log(`  Rationale: ${rule.rationale}`);
      console.log('');
    }
    if (result.warnings.length > 0) {
      console.log('Warnings:');
      result.warnings.forEach((w) => console.log(`  ${w}`));
    }
    process.exit(0);
  }).catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
