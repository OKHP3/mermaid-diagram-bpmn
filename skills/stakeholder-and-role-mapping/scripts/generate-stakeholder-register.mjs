/**
 * generate-stakeholder-register.mjs
 * Derives a Stakeholder Register from a PIR actors array.
 * Pure ESM, no external dependencies.
 *
 * Usage: node scripts/generate-stakeholder-register.mjs <pir.yaml>
 * Exports: generateStakeholderRegister(pir: object): { valid, errors[], warnings[], register: object|null }
 */

// ─── Engagement strategy derivation ──────────────────────────────────────────

const ENGAGEMENT_STRATEGIES = {
  initiator:  'Collaborate — include in process design sessions',
  performer:  'Collaborate — include in process design sessions',
  approver:   'Consult — involve in decision gates',
  reviewer:   'Consult — include in review cycles',
  notified:   'Inform — keep updated on outcomes',
  system:     'Monitor — track integration points and error conditions',
};

function deriveEngagement(type) {
  return ENGAGEMENT_STRATEGIES[type] || 'Inform — keep updated on outcomes';
}

// ─── Generator ────────────────────────────────────────────────────────────────

/**
 * Generate a Stakeholder Register from a parsed PIR.
 * @param {object} pir
 * @returns {{ valid: boolean, errors: string[], warnings: string[], register: object|null }}
 */
export function generateStakeholderRegister(pir) {
  const errors = [];
  const warnings = [];

  if (!pir || typeof pir !== 'object') {
    return { valid: false, errors: ['PIR must be a non-null object'], warnings: [], register: null };
  }

  if (!Array.isArray(pir.actors) || pir.actors.length === 0) {
    return {
      valid: false,
      errors: ['PIR actors array is required and must have at least one entry'],
      warnings: [],
      register: null,
    };
  }

  if (!pir.process_id) {
    errors.push('PIR process_id is required for the stakeholder register');
  }

  const stakeholders = [];

  for (let i = 0; i < pir.actors.length; i++) {
    const actor = pir.actors[i];

    if (!actor.role_id || !actor.role_name) {
      errors.push(`actors[${i}]: role_id and role_name are required to generate a stakeholder entry`);
      continue;
    }

    stakeholders.push({
      stakeholder_id: actor.role_id,
      name: actor.role_name,
      department: actor.department || 'Unspecified',
      primary_role: actor.type || 'performer',
      interest: actor.interest || 'outcome quality',
      influence: actor.influence || 'medium',
      engagement_strategy: deriveEngagement(actor.type),
      notes: '',
    });
  }

  // Warn if minimum composition is not met
  const hasInitiator = stakeholders.some(s => s.primary_role === 'initiator');
  const hasDecider = stakeholders.some(s => s.primary_role === 'approver' || s.primary_role === 'performer');

  if (!hasInitiator) {
    warnings.push('No initiator role in actors — stakeholder register may be incomplete');
  }
  if (!hasDecider) {
    warnings.push('No approver or performer in actors — stakeholder register may be incomplete');
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings, register: null };
  }

  const now = new Date().toISOString().split('T')[0];
  const register = {
    stakeholder_register_version: '0.1',
    process_id: pir.process_id || '',
    generated_from_pir: pir.process_id || '',
    generated_date: now,
    stakeholders,
  };

  return { valid: true, errors: [], warnings, register };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('generate-stakeholder-register.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/generate-stakeholder-register.mjs <pir.yaml>');
    console.log('Outputs the stakeholder register as JSON to stdout.');
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
    const result = generateStakeholderRegister(pir);
    if (!result.valid) {
      console.error('Error generating register:');
      result.errors.forEach(e => console.error(`  ${e}`));
      process.exit(1);
    }
    if (result.warnings.length > 0) {
      result.warnings.forEach(w => console.warn(`[WARN] ${w}`));
    }
    console.log(JSON.stringify(result.register, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
