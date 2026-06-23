/**
 * generate-sipoc.mjs
 * Derives a SIPOC table from a Process Narrative Specification (PNS).
 * No external dependencies — pure ESM.
 *
 * Suppliers  = unique sources from process_box.inputs
 * Inputs     = process_box.inputs[].name
 * Process    = activity_sequence.activities[].description (ordered)
 * Outputs    = process_box.outputs[].name
 * Customers  = unique consumers from process_box.outputs
 *
 * Usage: node scripts/generate-sipoc.mjs <pns.yaml>
 * Export: generateSipoc(pns) => { valid, errors[], warnings[], sipoc }
 */

import { loadFile } from './parse-yaml-minimal.mjs';

/**
 * @param {object} pns  Parsed PNS object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], sipoc: object }}
 */
export function generateSipoc(pns) {
  const errors = [];
  const warnings = [];

  if (!pns || typeof pns !== 'object') {
    errors.push('PNS is not a valid object');
    return { valid: false, errors, warnings, sipoc: null };
  }

  const sections = pns.sections || {};
  const pb = sections.process_box || {};
  const acts = (sections.activity_sequence && sections.activity_sequence.activities) || [];

  const rawInputs = Array.isArray(pb.inputs) ? pb.inputs : [];
  const rawOutputs = Array.isArray(pb.outputs) ? pb.outputs : [];

  if (rawInputs.length === 0) warnings.push('process_box.inputs is empty — Suppliers and Inputs columns will be empty');
  if (rawOutputs.length === 0) warnings.push('process_box.outputs is empty — Outputs and Customers columns will be empty');
  if (acts.length === 0) warnings.push('activity_sequence.activities is empty — Process column will be empty');

  const dedup = (arr) => [...new Set(arr.filter((x) => x && String(x).trim() !== ''))];

  const suppliers = dedup(rawInputs.map((i) => (i && i.source ? String(i.source) : '')));
  const inputs = dedup(rawInputs.map((i) => (i && i.name ? String(i.name) : '')));
  const process = acts
    .filter((a) => a && a.description)
    .map((a, idx) => ({ step: idx + 1, id: a.id || `act-${String(idx + 1).padStart(2, '0')}`, description: String(a.description) }));
  const outputs = dedup(rawOutputs.map((o) => (o && o.name ? String(o.name) : '')));
  const customers = dedup(rawOutputs.map((o) => (o && o.consumer ? String(o.consumer) : '')));

  const sipoc = {
    process_id: pns.process_id || '',
    process_name: pns.process_name || '',
    generated_from: 'process-narrative-authoring:generate-sipoc',
    suppliers,
    inputs,
    process,
    outputs,
    customers,
  };

  return { valid: true, errors, warnings, sipoc };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('generate-sipoc.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/generate-sipoc.mjs <pns.yaml>');
    console.log('Generates a SIPOC table from a PNS file.');
    process.exit(0);
  }
  loadFile(file).then((pns) => {
    const result = generateSipoc(pns);
    if (!result.valid) {
      console.error('Error generating SIPOC:', result.errors.join('; '));
      process.exit(1);
    }
    const { sipoc } = result;
    console.log(`SIPOC Table — ${sipoc.process_name} (${sipoc.process_id})\n`);
    const col = (label, items) => {
      console.log(`${label}:`);
      if (items.length === 0) console.log('  (none)');
      else items.forEach((item, i) => console.log(`  ${i + 1}. ${typeof item === 'object' ? `[${item.id}] ${item.description}` : item}`));
      console.log('');
    };
    col('SUPPLIERS', sipoc.suppliers);
    col('INPUTS', sipoc.inputs);
    col('PROCESS', sipoc.process);
    col('OUTPUTS', sipoc.outputs);
    col('CUSTOMERS', sipoc.customers);
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
