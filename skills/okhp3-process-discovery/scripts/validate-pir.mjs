/**
 * validate-pir.mjs
 * Schema completeness and type validation for Process Intake Records.
 * Pure ESM, no external dependencies.
 *
 * Usage: node scripts/validate-pir.mjs <pir.yaml>
 * Exports: validatePir(pir: object): { valid, errors[], warnings[] }
 */

// ─── Field enums ──────────────────────────────────────────────────────────────

const ELICITATION_METHODS = new Set(['interview', 'workshop', 'observation', 'document-analysis', 'survey']);
const STATUSES = new Set(['draft', 'review', 'complete']);
const TRIGGER_EVENT_TYPES = new Set(['manual', 'scheduled', 'message', 'system']);
const ACTOR_TYPES = new Set(['initiator', 'performer', 'approver', 'reviewer', 'notified', 'system']);
const INFLUENCE_LEVELS = new Set(['high', 'medium', 'low']);
const BUSINESS_RULE_SOURCES = new Set(['policy', 'regulation', 'contract', 'practice']);
const SYSTEM_ROLES = new Set(['source', 'destination', 'processor', 'notification']);
const SYSTEM_INTEGRATION_TYPES = new Set(['manual', 'api', 'batch', 'ui']);
const CONTROL_TYPES = new Set(['approval', 'audit', 'segregation', 'validation']);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isArray(v) {
  return Array.isArray(v);
}

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validate a parsed PIR object.
 * @param {object} pir
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validatePir(pir) {
  const errors = [];
  const warnings = [];

  if (!pir || typeof pir !== 'object') {
    return { valid: false, errors: ['PIR must be a non-null object'], warnings: [] };
  }

  // ── Top-level required fields ──────────────────────────────────────────────

  if (!isNonEmptyString(pir.pir_version)) {
    errors.push('Missing required field: pir_version');
  } else if (pir.pir_version !== '0.1') {
    warnings.push(`pir_version "${pir.pir_version}" is not the current schema version "0.1"`);
  }

  if (!isNonEmptyString(pir.process_id)) errors.push('Missing required field: process_id');
  if (!isNonEmptyString(pir.process_name)) errors.push('Missing required field: process_name');
  if (!isNonEmptyString(pir.process_owner)) errors.push('Missing required field: process_owner');
  if (!isNonEmptyString(pir.department)) errors.push('Missing required field: department');

  if (!isNonEmptyString(pir.elicitation_method)) {
    errors.push('Missing required field: elicitation_method');
  } else if (!ELICITATION_METHODS.has(pir.elicitation_method)) {
    errors.push(`Invalid elicitation_method "${pir.elicitation_method}". Must be one of: ${[...ELICITATION_METHODS].join(', ')}`);
  }

  if (!isNonEmptyString(pir.status)) {
    errors.push('Missing required field: status');
  } else if (!STATUSES.has(pir.status)) {
    errors.push(`Invalid status "${pir.status}". Must be one of: ${[...STATUSES].join(', ')}`);
  }

  // ── Trigger ────────────────────────────────────────────────────────────────

  if (!pir.trigger || typeof pir.trigger !== 'object') {
    errors.push('Missing required section: trigger');
  } else {
    if (!isNonEmptyString(pir.trigger.description)) {
      errors.push('Missing required field: trigger.description');
    }
    if (!isNonEmptyString(pir.trigger.event_type)) {
      errors.push('Missing required field: trigger.event_type');
    } else if (!TRIGGER_EVENT_TYPES.has(pir.trigger.event_type)) {
      errors.push(`Invalid trigger.event_type "${pir.trigger.event_type}". Must be one of: ${[...TRIGGER_EVENT_TYPES].join(', ')}`);
    }
  }

  // ── Actors ─────────────────────────────────────────────────────────────────

  if (!isArray(pir.actors) || pir.actors.length === 0) {
    errors.push('actors array is required and must have at least one entry');
  } else {
    if (pir.actors.length < 2) {
      errors.push('actors must have at least 2 entries (minimum: one initiator and one performer or approver)');
    }

    const hasInitiator = pir.actors.some(a => a.type === 'initiator');
    if (!hasInitiator) {
      errors.push('actors must include at least one actor with type: initiator');
    }

    const hasPerformerOrApprover = pir.actors.some(a => a.type === 'performer' || a.type === 'approver');
    if (!hasPerformerOrApprover) {
      errors.push('actors must include at least one actor with type: performer or approver');
    }

    const roleIds = new Set();
    pir.actors.forEach((actor, i) => {
      const prefix = `actors[${i}]`;
      if (!isNonEmptyString(actor.role_id)) {
        errors.push(`${prefix}: missing required field role_id`);
      } else {
        if (roleIds.has(actor.role_id)) {
          errors.push(`${prefix}: duplicate role_id "${actor.role_id}"`);
        }
        roleIds.add(actor.role_id);
      }
      if (!isNonEmptyString(actor.role_name)) errors.push(`${prefix}: missing required field role_name`);
      if (!isNonEmptyString(actor.type)) {
        errors.push(`${prefix}: missing required field type`);
      } else if (!ACTOR_TYPES.has(actor.type)) {
        errors.push(`${prefix}: invalid type "${actor.type}". Must be one of: ${[...ACTOR_TYPES].join(', ')}`);
      }
      if (actor.influence && !INFLUENCE_LEVELS.has(actor.influence)) {
        warnings.push(`${prefix}: influence "${actor.influence}" should be one of: high, medium, low`);
      }
    });
  }

  // ── Inputs ─────────────────────────────────────────────────────────────────

  if (!isArray(pir.inputs) || pir.inputs.length === 0) {
    errors.push('inputs array is required and must have at least one entry');
  } else {
    pir.inputs.forEach((inp, i) => {
      if (!isNonEmptyString(inp.id)) errors.push(`inputs[${i}]: missing required field id`);
      if (!isNonEmptyString(inp.name)) errors.push(`inputs[${i}]: missing required field name`);
    });
  }

  // ── Outputs ────────────────────────────────────────────────────────────────

  if (!isArray(pir.outputs) || pir.outputs.length === 0) {
    errors.push('outputs array is required and must have at least one entry');
  } else {
    pir.outputs.forEach((out, i) => {
      if (!isNonEmptyString(out.id)) errors.push(`outputs[${i}]: missing required field id`);
      if (!isNonEmptyString(out.name)) errors.push(`outputs[${i}]: missing required field name`);
    });
  }

  // ── Steps ──────────────────────────────────────────────────────────────────

  if (!isArray(pir.steps) || pir.steps.length === 0) {
    errors.push('steps array is required and must have at least one entry');
  } else {
    if (pir.steps.length < 3) {
      errors.push(`steps must have at least 3 entries for a minimally viable PIR (got ${pir.steps.length})`);
    }

    const actorIds = new Set(Array.isArray(pir.actors) ? pir.actors.map(a => a.role_id) : []);
    pir.steps.forEach((step, i) => {
      if (!isNonEmptyString(step.id)) errors.push(`steps[${i}]: missing required field id`);
      if (!isNonEmptyString(step.description)) errors.push(`steps[${i}]: missing required field description`);
      if (!isNonEmptyString(step.actor_role_id)) {
        errors.push(`steps[${i}]: missing required field actor_role_id`);
      } else if (actorIds.size > 0 && !actorIds.has(step.actor_role_id)) {
        warnings.push(`steps[${i}]: actor_role_id "${step.actor_role_id}" does not match any declared actor role_id`);
      }
    });
  }

  // ── Optional sections with field validation ────────────────────────────────

  if (isArray(pir.exceptions)) {
    pir.exceptions.forEach((exc, i) => {
      if (!isNonEmptyString(exc.id)) errors.push(`exceptions[${i}]: missing required field id`);
      if (!isNonEmptyString(exc.description)) errors.push(`exceptions[${i}]: missing required field description`);
    });
  } else {
    warnings.push('exceptions array is empty or missing — exception paths are recommended for a complete PIR');
  }

  if (isArray(pir.business_rules)) {
    pir.business_rules.forEach((br, i) => {
      if (!isNonEmptyString(br.id)) errors.push(`business_rules[${i}]: missing required field id`);
      if (!isNonEmptyString(br.description)) errors.push(`business_rules[${i}]: missing required field description`);
      if (br.source && !BUSINESS_RULE_SOURCES.has(br.source)) {
        warnings.push(`business_rules[${i}]: source "${br.source}" should be one of: ${[...BUSINESS_RULE_SOURCES].join(', ')}`);
      }
    });
  } else {
    warnings.push('business_rules array is empty or missing — capture any governing policies or rules');
  }

  if (isArray(pir.systems)) {
    pir.systems.forEach((sys, i) => {
      if (!isNonEmptyString(sys.name)) errors.push(`systems[${i}]: missing required field name`);
      if (sys.role && !SYSTEM_ROLES.has(sys.role)) {
        warnings.push(`systems[${i}]: role "${sys.role}" should be one of: ${[...SYSTEM_ROLES].join(', ')}`);
      }
      if (sys.integration_type && !SYSTEM_INTEGRATION_TYPES.has(sys.integration_type)) {
        warnings.push(`systems[${i}]: integration_type "${sys.integration_type}" should be one of: ${[...SYSTEM_INTEGRATION_TYPES].join(', ')}`);
      }
    });
  }

  if (isArray(pir.controls)) {
    pir.controls.forEach((ctrl, i) => {
      if (!isNonEmptyString(ctrl.id)) errors.push(`controls[${i}]: missing required field id`);
      if (!isNonEmptyString(ctrl.type)) {
        errors.push(`controls[${i}]: missing required field type`);
      } else if (!CONTROL_TYPES.has(ctrl.type)) {
        errors.push(`controls[${i}]: invalid type "${ctrl.type}". Must be one of: ${[...CONTROL_TYPES].join(', ')}`);
      }
      if (!isNonEmptyString(ctrl.description)) errors.push(`controls[${i}]: missing required field description`);
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('validate-pir.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/validate-pir.mjs <pir.yaml>');
    process.exit(0);
  }
  const { readFileSync } = await import('node:fs');
  const { resolve, dirname: pathDirname } = await import('node:path');
  const { fileURLToPath: ftu } = await import('node:url');
  const __cliDir = pathDirname(ftu(import.meta.url));
  const { parseYaml } = await import(resolve(__cliDir, 'parse-yaml-minimal.mjs'));
  try {
    const raw = readFileSync(resolve(file), 'utf8');
    let pir;
    try {
      pir = parseYaml(raw);
    } catch {
      pir = JSON.parse(raw);
    }
    const result = validatePir(pir);
    if (result.valid) {
      console.log('PIR Validation: PASS');
    } else {
      console.log(`PIR Validation: FAIL (${result.errors.length} error(s))`);
      result.errors.forEach((e, i) => console.log(`  [${i + 1}] ${e}`));
    }
    if (result.warnings.length > 0) {
      console.log(`Warnings: ${result.warnings.length}`);
      result.warnings.forEach(w => console.log(`  [WARN] ${w}`));
    }
    process.exit(result.valid ? 0 : 1);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
