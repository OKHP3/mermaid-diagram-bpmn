#!/usr/bin/env node
/**
 * generate-future-state.mjs
 * Scaffolds a future-state YAML from a gap-analysis input.
 * Converts each gap into a stub change_item and generates to_be_steps
 * from any resolved_gaps provided.
 *
 * Usage: node generate-future-state.mjs <gap-analysis.yaml>
 * Named exports: generateFutureState(gapAnalysis) → { valid, errors, warnings, futureState }
 */

/**
 * @param {object} gapAnalysis - Parsed gap-analysis.yaml object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], futureState: object }}
 */
export function generateFutureState(gapAnalysis) {
  const errors = [];
  const warnings = [];

  if (!gapAnalysis || typeof gapAnalysis !== 'object') {
    errors.push('gapAnalysis must be a non-null object');
    return { valid: false, errors, warnings, futureState: null };
  }

  const processId = gapAnalysis.process_id || '';
  if (!processId) warnings.push('gapAnalysis.process_id is empty');

  const gaps = Array.isArray(gapAnalysis.gaps) ? gapAnalysis.gaps : [];
  if (gaps.length === 0) {
    warnings.push('No gaps found in gap analysis — change_items will be empty');
  }

  const CHANGE_TYPE_MAP = {
    structural: 'add',
    execution: 'modify',
    exception: 'add',
    compliance: 'add',
  };

  const changeItems = gaps
    .filter(g => g.severity === 'critical' || g.severity === 'major')
    .map((g, i) => ({
      change_item_id: `ci-${String(i + 1).padStart(3, '0')}`,
      change_type: CHANGE_TYPE_MAP[g.gap_type] || 'modify',
      description: g.recommended_action || `Resolve gap: ${g.description}`,
      effort: g.severity === 'critical' ? 'high' : 'medium',
      risk: g.severity === 'critical' ? 'medium' : 'low',
      dependencies: [],
      owner_role: '',
      source_gap_id: g.gap_id,
    }));

  const futureState = {
    future_state_version: '0.1',
    process_id: processId,
    design_date: '',
    designed_by_role: '',
    source_artifact: 'gap-analysis.yaml',
    resolved_gaps: [],
    to_be_steps: [],
    open_assumptions: [],
    change_items: changeItems,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    futureState,
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const { readFileSync } = await import('node:fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node generate-future-state.mjs <gap-analysis.yaml>');
    process.exit(1);
  }
  const raw = readFileSync(filePath, 'utf8');
  const gapAnalysis = { process_id: raw.match(/process_id:\s*(\S+)/)?.[1] || '', gaps: [] };
  const result = generateFutureState(gapAnalysis);
  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
  for (const w of result.warnings) console.warn('WARN:', w);
  console.log(JSON.stringify(result.futureState, null, 2));
}
