/**
 * generate-raci.mjs
 * Builds a RACI matrix from a Process Narrative Specification (PNS).
 * No external dependencies — pure ESM.
 *
 * Usage: node scripts/generate-raci.mjs <pns.yaml>
 * Export: generateRaci(pns) => { valid, errors[], warnings[], raci }
 */

import { loadFile } from './parse-yaml-minimal.mjs';

/**
 * @param {object} pns  Parsed PNS object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], raci: object }}
 */
export function generateRaci(pns) {
  const errors = [];
  const warnings = [];

  if (!pns || typeof pns !== 'object') {
    errors.push('PNS is not a valid object');
    return { valid: false, errors, warnings, raci: null };
  }

  const sections = pns.sections || {};
  const raciData = sections.roles_and_raci || {};
  const acts = (sections.activity_sequence && sections.activity_sequence.activities) || [];
  const roles = Array.isArray(raciData.roles) ? raciData.roles : [];
  const matrix = Array.isArray(raciData.raci_matrix) ? raciData.raci_matrix : [];

  if (roles.length === 0) warnings.push('roles_and_raci.roles is empty');
  if (matrix.length === 0) warnings.push('roles_and_raci.raci_matrix is empty');

  const raciMap = new Map(matrix.map((r) => [r.activity_id, r]));

  const matrixRows = [];
  for (const act of acts) {
    const entry = raciMap.get(act.id) || {};
    const responsible = Array.isArray(entry.responsible) ? entry.responsible.filter((r) => r && String(r).trim() !== '') : [];
    const accountable = entry.accountable ? String(entry.accountable).trim() : '';
    const consulted = Array.isArray(entry.consulted) ? entry.consulted.filter((r) => r && String(r).trim() !== '') : [];
    const informed = Array.isArray(entry.informed) ? entry.informed.filter((r) => r && String(r).trim() !== '') : [];

    if (!raciMap.has(act.id)) {
      warnings.push(`Activity "${act.id}" has no RACI entry — included with empty assignments`);
    }

    matrixRows.push({
      activity_id: act.id,
      description: act.description || '',
      R: responsible,
      A: accountable,
      C: consulted,
      I: informed,
    });
  }

  const raci = {
    process_id: pns.process_id || '',
    process_name: pns.process_name || '',
    generated_from: 'process-narrative-authoring:generate-raci',
    roles: roles.map((r) => ({ id: r.role_id || '', name: r.role_name || '' })),
    matrix: matrixRows,
  };

  return { valid: true, errors, warnings, raci };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('generate-raci.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/generate-raci.mjs <pns.yaml>');
    console.log('Generates a RACI matrix from a PNS file.');
    process.exit(0);
  }
  loadFile(file).then((pns) => {
    const result = generateRaci(pns);
    if (!result.valid) {
      console.error('Error generating RACI:', result.errors.join('; '));
      process.exit(1);
    }
    const { raci } = result;
    console.log(`RACI Matrix — ${raci.process_name} (${raci.process_id})\n`);
    console.log('Roles:', raci.roles.map((r) => `${r.id} (${r.name})`).join(', '));
    console.log('');
    for (const row of raci.matrix) {
      console.log(`[${row.activity_id}] ${row.description}`);
      console.log(`  R: ${row.R.join(', ') || '(none)'}`);
      console.log(`  A: ${row.A || '(none)'}`);
      console.log(`  C: ${row.C.join(', ') || '(none)'}`);
      console.log(`  I: ${row.I.join(', ') || '(none)'}`);
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
