#!/usr/bin/env node
/**
 * generate-measures-register.mjs
 * Scaffolds measures (KPIs) and controls registers from PNS kpis and
 * controls_and_compliance sections.
 *
 * Usage: node generate-measures-register.mjs <pns.yaml>
 * Named exports: generateMeasuresRegister(pns) → { valid, errors, warnings, measuresRegister, controlsRegister }
 */

const KPI_COUNTER_START = 1;
const CTRL_COUNTER_START = 1;

function pad(prefix, n) {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

/**
 * @param {object} pns - Parsed pns.yaml object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], measuresRegister: object, controlsRegister: object }}
 */
export function generateMeasuresRegister(pns) {
  const errors = [];
  const warnings = [];

  if (!pns || typeof pns !== 'object') {
    errors.push('pns must be a non-null object');
    return { valid: false, errors, warnings, measuresRegister: null, controlsRegister: null };
  }

  const processId = pns.process_id || '';
  if (!processId) warnings.push('pns.process_id is empty');

  // Derive KPIs from pns.kpis[]
  const pnsKpis = Array.isArray(pns.kpis) ? pns.kpis : [];
  const kpis = pnsKpis.map((k, i) => {
    const entry = {
      kpi_id: k.kpi_id || k.id || pad('kpi', KPI_COUNTER_START + i),
      name: k.name || '',
      category: k.category || 'cycle_time',
      formula: k.formula || '',
      data_source: k.data_source || '',
      target: k.target || 'TBD',
      frequency: k.frequency || 'monthly',
      owner_role_id: k.owner_role_id || '',
      activities_measured: Array.isArray(k.activities_measured) ? k.activities_measured : [],
    };
    if (!entry.formula) warnings.push(`KPI "${entry.kpi_id}" has no formula — set to empty`);
    if (!entry.data_source) warnings.push(`KPI "${entry.kpi_id}" has no data_source — set to empty`);
    return entry;
  });

  if (kpis.length === 0) {
    warnings.push('No KPIs found in pns.kpis[] — measures register will be empty');
  }

  // Derive controls from pns.controls_and_compliance[]
  const pnsControls = Array.isArray(pns.controls_and_compliance) ? pns.controls_and_compliance : [];
  const controls = pnsControls.map((c, i) => ({
    control_id: c.control_id || c.id || pad('ctrl', CTRL_COUNTER_START + i),
    type: c.type || 'detective',
    description: c.description || '',
    standard_ref: c.standard_ref || '',
    activities_covered: Array.isArray(c.activities_covered) ? c.activities_covered : [],
    frequency: c.frequency || 'per-transaction',
    evidence_required: c.evidence_required || '',
    owner_role_id: c.owner_role_id || '',
  }));

  if (controls.length === 0) {
    warnings.push('No controls found in pns.controls_and_compliance[] — controls register will be empty');
  }

  const measuresRegister = {
    measures_register_version: '0.1',
    process_id: processId,
    generated_from: 'pns.yaml',
    kpis,
  };

  const controlsRegister = {
    controls_register_version: '0.1',
    process_id: processId,
    generated_from: 'pns.yaml',
    controls,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    measuresRegister,
    controlsRegister,
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const { readFileSync } = await import('node:fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node generate-measures-register.mjs <pns.yaml>');
    process.exit(1);
  }
  const raw = readFileSync(filePath, 'utf8');
  const pns = { process_id: raw.match(/process_id:\s*(\S+)/)?.[1] || '', kpis: [], controls_and_compliance: [] };
  const result = generateMeasuresRegister(pns);
  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
  for (const w of result.warnings) console.warn('WARN:', w);
  console.log('Measures register KPIs:', result.measuresRegister.kpis.length);
  console.log('Controls register controls:', result.controlsRegister.controls.length);
}
