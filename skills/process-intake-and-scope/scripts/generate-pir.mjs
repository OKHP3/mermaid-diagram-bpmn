#!/usr/bin/env node
/**
 * generate-pir.mjs
 * Scaffolds a blank PIR YAML structure from a brief process description.
 *
 * Usage: node generate-pir.mjs [process-name] [--out pir.yaml]
 * Named exports: generatePir(options) → { valid, errors, warnings, pir }
 */

/**
 * @param {object} options
 * @param {string} [options.processName] - Human-readable process name
 * @param {string} [options.department]  - Owning department
 * @param {string} [options.owner]       - Process owner role
 * @returns {{ valid: boolean, errors: string[], warnings: string[], pir: object }}
 */
export function generatePir(options = {}) {
  const errors = [];
  const warnings = [];

  const processName = (options.processName || '').trim();
  if (!processName) {
    warnings.push('processName not supplied — process_name will be empty in the generated PIR');
  }

  const processId = processName
    ? 'proc-' + processName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : 'proc-new-process';

  const pir = {
    pir_version: '0.1',
    process_id: processId,
    process_name: processName || '',
    process_owner: options.owner || '',
    department: options.department || '',
    elicitation_method: '',
    elicitation_date: '',
    elicited_by: '',
    status: 'draft',
    trigger: {
      description: '',
      event_type: '',
    },
    actors: [],
    inputs: [],
    outputs: [],
    steps: [],
    exceptions: [],
    business_rules: [],
    systems: [],
    controls: [],
    open_questions: [],
    validation: {
      completeness_score: null,
      ready_for_narrative: null,
    },
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    pir,
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const args = process.argv.slice(2);
  const processName = args.find(a => !a.startsWith('--')) || '';
  const result = generatePir({ processName });

  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    for (const w of result.warnings) console.warn('WARN:', w);
  }

  const lines = [
    `pir_version: "${result.pir.pir_version}"`,
    `process_id: ${result.pir.process_id}`,
    `process_name: "${result.pir.process_name}"`,
    `process_owner: ""`,
    `department: ""`,
    `elicitation_method: ""`,
    `elicitation_date: ""`,
    `elicited_by: ""`,
    `status: draft`,
    ``,
    `trigger:`,
    `  description: ""`,
    `  event_type: ""`,
    ``,
    `actors: []`,
    `inputs: []`,
    `outputs: []`,
    `steps: []`,
    `exceptions: []`,
    `business_rules: []`,
    `systems: []`,
    `controls: []`,
    `open_questions: []`,
    ``,
    `validation:`,
    `  completeness_score: null`,
    `  ready_for_narrative: null`,
  ];

  console.log(lines.join('\n'));
}
