#!/usr/bin/env node
/**
 * check-pns-status-transition.mjs
 * Enforces the 9-state PNS lifecycle.
 * Rejects any transition that skips a state or goes backwards.
 *
 * Usage: node scripts/check-pns-status-transition.mjs <current_status> <proposed_status>
 * Export: checkPnsStatusTransition(current, proposed) → { valid, errors, warnings, current_status, proposed_status }
 */

/**
 * The canonical 9-state PNS lifecycle in order.
 * A valid transition moves exactly one step forward.
 * Re-entering the same state (noop) is allowed with a warning.
 * Backward transitions (rollback) produce an error.
 * Skipping states produces an error.
 */
const PNS_STATES = [
  'draft',
  'elicitation',
  'scoped',
  'structured',
  'narrative',
  'review',
  'approved',
  'published',
  'archived',
];

const STATE_SET = new Set(PNS_STATES);
const STATE_INDEX = new Map(PNS_STATES.map((s, i) => [s, i]));

/**
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

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const [, , current, proposed] = process.argv;
  if (!current || !proposed) {
    console.log('Usage: node check-pns-status-transition.mjs <current_status> <proposed_status>');
    console.log(`States: ${PNS_STATES.join(' → ')}`);
    process.exit(0);
  }
  const result = checkPnsStatusTransition(current, proposed);
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
