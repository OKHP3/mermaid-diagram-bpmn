#!/usr/bin/env node
/**
 * check-pns-status-transition.mjs
 * Enforces the 9-state PNS lifecycle.
 * Rejects any transition that skips a state or goes backwards.
 *
 * Usage (two-string form):
 *   node scripts/check-pns-status-transition.mjs <current_status> <proposed_status>
 *
 * Usage (PNS-file form — reads current status from the PNS YAML document):
 *   node scripts/check-pns-status-transition.mjs <pns.yaml> <proposed_status>
 *
 * Exports:
 *   checkPnsStatusTransition(current, proposed) → { valid, errors, warnings, current_status, proposed_status }
 *   checkPnsStatusTransitionFromFile(pnsFilePath, proposedStatus) → Promise<same>
 */

/**
 * The canonical 9-state PNS lifecycle in order (BP-SKILL v0.2 spec — normative).
 * State names match the skill that sets each state:
 *   draft-intake      ← process-intake-and-scope
 *   scoped            ← stakeholder-and-role-mapping
 *   elicited          ← elicitation-and-interview-facilitation
 *   documented-as-is  ← as-is-process-capture
 *   modeled           ← process-narrative-authoring
 *   analyzed          ← process-gap-and-exception-analysis
 *   validated         ← process-validation-and-quality-scoring
 *   packaged          ← publication-and-handoff-packaging
 *   published         ← publication-and-handoff-packaging (after approval gate)
 *
 * A valid transition moves exactly one step forward.
 * Re-entering the same state (noop) is allowed with a warning.
 * Backward transitions (rollback) produce an error.
 * Skipping states produces an error.
 */
const PNS_STATES = [
  'draft-intake',
  'scoped',
  'elicited',
  'documented-as-is',
  'modeled',
  'analyzed',
  'validated',
  'packaged',
  'published',
];

const STATE_SET   = new Set(PNS_STATES);
const STATE_INDEX = new Map(PNS_STATES.map((s, i) => [s, i]));

/**
 * Validate a status transition given two explicit status strings.
 *
 * @param {string} current   Current PNS status
 * @param {string} proposed  Proposed PNS status
 * @returns {{ valid: boolean, errors: string[], warnings: string[], current_status: string, proposed_status: string }}
 */
export function checkPnsStatusTransition(current, proposed) {
  const errors = [];
  const warnings = [];

  const currNorm = String(current || '').trim().toLowerCase();
  const propNorm = String(proposed || '').trim().toLowerCase();

  if (!STATE_SET.has(currNorm)) {
    errors.push(
      `current_status "${currNorm}" is not a recognised PNS lifecycle state. ` +
      `Valid states: ${PNS_STATES.join(' → ')}`
    );
  }

  if (!STATE_SET.has(propNorm)) {
    errors.push(
      `proposed_status "${propNorm}" is not a recognised PNS lifecycle state. ` +
      `Valid states: ${PNS_STATES.join(' → ')}`
    );
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings, current_status: currNorm, proposed_status: propNorm };
  }

  const currIdx = STATE_INDEX.get(currNorm);
  const propIdx = STATE_INDEX.get(propNorm);
  const delta = propIdx - currIdx;

  if (delta === 0) {
    warnings.push(
      `Transition from "${currNorm}" to "${propNorm}" is a no-op — the PNS is already in this state.`
    );
  } else if (delta < 0) {
    errors.push(
      `Backward transition from "${currNorm}" (index ${currIdx}) to "${propNorm}" (index ${propIdx}) is not permitted. ` +
      `PNS lifecycle states may only advance forward. To revert, create a new draft.`
    );
  } else if (delta > 1) {
    const skipped = PNS_STATES.slice(currIdx + 1, propIdx);
    errors.push(
      `Transition from "${currNorm}" to "${propNorm}" skips ${skipped.length} state(s): ` +
      `${skipped.join(', ')}. Advance through each state in sequence.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    current_status: currNorm,
    proposed_status: propNorm,
  };
}

/**
 * Read the current PNS status from a YAML document and validate the proposed transition.
 * Reads the top-level `status` field from the PNS file.
 *
 * @param {string} pnsFilePath   Path to the PNS YAML (or JSON) document
 * @param {string} proposedStatus  Proposed new status string
 * @returns {Promise<{ valid: boolean, errors: string[], warnings: string[], current_status: string, proposed_status: string, source_file: string }>}
 */
export async function checkPnsStatusTransitionFromFile(pnsFilePath, proposedStatus) {
  const { readFileSync, existsSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const here = dirname(fileURLToPath(import.meta.url));
  const absPath = resolve(pnsFilePath);

  if (!existsSync(absPath)) {
    return {
      valid: false,
      errors: [`PNS file not found: ${pnsFilePath}`],
      warnings: [],
      current_status: '',
      proposed_status: String(proposedStatus || '').trim().toLowerCase(),
      source_file: pnsFilePath,
    };
  }

  let pns;
  const raw = readFileSync(absPath, 'utf8');
  if (absPath.endsWith('.json')) {
    pns = JSON.parse(raw);
  } else {
    const { parseYaml } = await import(
      resolve(here, 'src/parse-yaml-minimal.mjs')
    );
    pns = parseYaml(raw);
  }

  const currentStatus = String(pns && pns.status ? pns.status : '').trim();
  if (!currentStatus) {
    return {
      valid: false,
      errors: [`PNS file "${pnsFilePath}" has no top-level "status" field`],
      warnings: [],
      current_status: '',
      proposed_status: String(proposedStatus || '').trim().toLowerCase(),
      source_file: pnsFilePath,
    };
  }

  const result = checkPnsStatusTransition(currentStatus, proposedStatus);
  return { ...result, source_file: pnsFilePath };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const arg1 = process.argv[2];
  const arg2 = process.argv[3];

  if (!arg1 || !arg2) {
    console.log('Usage (two-string form):');
    console.log('  node check-pns-status-transition.mjs <current_status> <proposed_status>');
    console.log('');
    console.log('Usage (PNS-file form — reads current status from document):');
    console.log('  node check-pns-status-transition.mjs <pns.yaml> <proposed_status>');
    console.log('');
    console.log(`States: ${PNS_STATES.join(' → ')}`);
    process.exit(0);
  }

  const isPnsFile = arg1.endsWith('.yaml') || arg1.endsWith('.yml') || arg1.endsWith('.json');

  let result;
  if (isPnsFile) {
    result = await checkPnsStatusTransitionFromFile(arg1, arg2);
    if (result.source_file) {
      console.log(`PNS file: ${result.source_file}`);
    }
  } else {
    result = checkPnsStatusTransition(arg1, arg2);
  }

  console.log(`Transition: ${result.current_status} → ${result.proposed_status}`);
  console.log(`Valid: ${result.valid}`);

  if (result.errors.length > 0) {
    for (const e of result.errors) console.error(`  ERROR: ${e}`);
    process.exit(1);
  }
  if (result.warnings.length > 0) {
    for (const w of result.warnings) console.warn(`  WARN: ${w}`);
  }
  console.log('Transition check passed.');
}
