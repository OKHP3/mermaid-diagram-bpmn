#!/usr/bin/env node
/**
 * assign-step-ids.mjs
 * Normalises a step list into stable act-NNN / gw-NNN / evt-NNN identifiers.
 *
 * Usage: node assign-step-ids.mjs <steps.json>
 * Named exports: assignStepIds(steps) → { valid, errors, warnings, steps }
 *
 * Input steps[] may have any or no id. Existing IDs are preserved if they
 * match the prefix conventions. New IDs are assigned sequentially.
 */

const PREFIXES = { activity: 'act', gateway: 'gw', event: 'evt' };

function detectElementType(step) {
  const desc = (step.description || step.name || '').toLowerCase();
  if (
    desc.includes('?') ||
    desc.startsWith('is ') ||
    desc.startsWith('check ') ||
    desc.startsWith('decide ') ||
    step.element_type === 'gateway'
  ) {
    return 'gateway';
  }
  if (
    desc.includes('start') ||
    desc.includes('end') ||
    desc.includes('trigger') ||
    step.element_type === 'event'
  ) {
    return 'event';
  }
  return 'activity';
}

function padId(prefix, n) {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

/**
 * @param {Array<object>} steps - Array of step objects from PIR or as-is capture
 * @returns {{ valid: boolean, errors: string[], warnings: string[], steps: Array<object> }}
 */
export function assignStepIds(steps) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(steps)) {
    errors.push('steps must be an array');
    return { valid: false, errors, warnings, steps: [] };
  }

  const counters = { act: 0, gw: 0, evt: 0 };
  const usedIds = new Set();

  const normalised = steps.map((step, i) => {
    const type = detectElementType(step);
    const prefix = PREFIXES[type];
    counters[prefix]++;
    const newId = padId(prefix, counters[prefix]);

    const existingId = step.id || '';
    const idIsValid = existingId && /^(act|gw|evt)-\d{3,}$/.test(existingId);

    let assignedId;
    if (idIsValid && !usedIds.has(existingId)) {
      assignedId = existingId;
      warnings.push(`Step ${i + 1}: preserved existing ID "${existingId}"`);
    } else {
      if (existingId && !idIsValid) {
        warnings.push(`Step ${i + 1}: replaced non-conforming ID "${existingId}" with "${newId}"`);
      }
      assignedId = newId;
    }

    usedIds.add(assignedId);
    return { ...step, id: assignedId };
  });

  if (normalised.length === 0) {
    warnings.push('No steps provided — returned empty array');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    steps: normalised,
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const { readFileSync } = await import('node:fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node assign-step-ids.mjs <steps.json>');
    process.exit(1);
  }
  const steps = JSON.parse(readFileSync(filePath, 'utf8'));
  const result = assignStepIds(steps);
  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
  for (const w of result.warnings) console.warn('WARN:', w);
  console.log(JSON.stringify(result.steps, null, 2));
}
