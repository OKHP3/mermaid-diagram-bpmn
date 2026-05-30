/**
 * score-pns-quality.mjs
 * Weighted 0–100 quality score for a Process Narrative Specification (PNS).
 * Publication threshold: score ≥ 75.
 * No external dependencies — pure ESM.
 *
 * Usage: node scripts/score-pns-quality.mjs <pns.yaml>
 * Export: scorePnsQuality(pns) => { valid, errors[], warnings[], score, ready_for_publication, breakdown }
 */

import { loadFile } from './parse-yaml-minimal.mjs';

const BABOK_FIELDS = ['change', 'need', 'solution', 'stakeholders', 'value', 'context'];
const PUBLICATION_THRESHOLD = 75;

/**
 * @param {object} pns  Parsed PNS object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], score: number, ready_for_publication: boolean, breakdown: object }}
 */
export function scorePnsQuality(pns) {
  const errors = [];
  const warnings = [];

  if (!pns || typeof pns !== 'object') {
    errors.push('PNS is not a valid object');
    return { valid: false, errors, warnings, score: 0, ready_for_publication: false, breakdown: {} };
  }

  const sections = pns.sections || {};
  const breakdown = {};
  let total = 0;

  // ─── process_box (15 pts) ─────────────────────────────────────────────────
  {
    const pb = sections.process_box || {};
    let pts = 0;
    if (pb.trigger && String(pb.trigger).trim().length > 10) pts += 3;
    const inputs = Array.isArray(pb.inputs) ? pb.inputs : [];
    if (inputs.length > 0 && inputs.some((i) => i && i.source && String(i.source).trim() !== '')) pts += 3;
    const outputs = Array.isArray(pb.outputs) ? pb.outputs : [];
    if (outputs.length > 0 && outputs.some((o) => o && o.consumer && String(o.consumer).trim() !== '')) pts += 3;
    if (pb.criteria && String(pb.criteria).trim().length > 20) pts += 2;
    if (pb.responsibilities && String(pb.responsibilities).trim().length > 10) pts += 2;
    if (pb.risks && String(pb.risks).trim().length > 10) pts += 2;
    breakdown.process_box = `${pts}/15`;
    total += pts;
  }

  // ─── activity_sequence (15 pts) ───────────────────────────────────────────
  {
    const acts = (sections.activity_sequence && sections.activity_sequence.activities) || [];
    let pts = 0;
    if (acts.length >= 3) pts += 10;
    else if (acts.length === 2) pts += 5;
    else if (acts.length === 1) pts += 2;
    const allValid = acts.every(
      (a) => a && a.description && String(a.description).trim() !== '' && a.actor_role_id && String(a.actor_role_id).trim() !== ''
    );
    if (acts.length > 0 && allValid) pts += 5;
    breakdown.activity_sequence = `${pts}/15`;
    total += pts;
  }

  // ─── roles_and_raci (10 pts) ──────────────────────────────────────────────
  {
    const raciData = sections.roles_and_raci || {};
    let pts = 0;
    const roles = Array.isArray(raciData.roles) ? raciData.roles : [];
    if (roles.length >= 2) pts += 3;
    const matrix = Array.isArray(raciData.raci_matrix) ? raciData.raci_matrix : [];
    if (matrix.length >= 1) pts += 4;
    const allHaveAccountable = matrix.every((r) => r && r.accountable && String(r.accountable).trim() !== '');
    if (matrix.length > 0 && allHaveAccountable) pts += 3;
    breakdown.roles_and_raci = `${pts}/10`;
    total += pts;
  }

  // ─── business_rules (10 pts) ──────────────────────────────────────────────
  {
    const rules = Array.isArray(sections.business_rules) ? sections.business_rules : [];
    let pts = 0;
    if (rules.length >= 1) pts += 5;
    const allHaveSource = rules.every((r) => r && r.source && String(r.source).trim() !== '');
    if (rules.length > 0 && allHaveSource) pts += 5;
    breakdown.business_rules = `${pts}/10`;
    total += pts;
  }

  // ─── decision_points (10 pts) ─────────────────────────────────────────────
  {
    const dps = Array.isArray(sections.decision_points) ? sections.decision_points : [];
    let pts = 0;
    if (dps.length >= 1) pts += 5;
    const allHaveOutcomes = dps.every((dp) => Array.isArray(dp.outcomes) && dp.outcomes.length >= 2);
    if (dps.length > 0 && allHaveOutcomes) pts += 5;
    breakdown.decision_points = `${pts}/10`;
    total += pts;
  }

  // ─── exception_paths (10 pts) ─────────────────────────────────────────────
  {
    const eps = Array.isArray(sections.exception_paths) ? sections.exception_paths : [];
    let pts = 0;
    if (eps.length >= 1) pts += 5;
    const allHaveHandling = eps.every((ep) => ep && ep.handling && String(ep.handling).trim() !== '');
    if (eps.length > 0 && allHaveHandling) pts += 5;
    breakdown.exception_paths = `${pts}/10`;
    total += pts;
  }

  // ─── kpis (10 pts) ────────────────────────────────────────────────────────
  {
    const kpis = Array.isArray(sections.kpis) ? sections.kpis : [];
    let pts = 0;
    if (kpis.length >= 1) pts += 5;
    const allVerifiable = kpis.every(
      (k) => k && k.formula && String(k.formula).trim() !== '' && k.data_source && String(k.data_source).trim() !== ''
    );
    if (kpis.length > 0 && allVerifiable) pts += 5;
    breakdown.kpis = `${pts}/10`;
    total += pts;
  }

  // ─── systems_and_integrations (5 pts) ─────────────────────────────────────
  {
    const sys = Array.isArray(sections.systems_and_integrations) ? sections.systems_and_integrations : [];
    const pts = sys.length >= 1 ? 5 : 0;
    breakdown.systems_and_integrations = `${pts}/5`;
    total += pts;
  }

  // ─── controls_and_compliance (5 pts) ──────────────────────────────────────
  {
    const ctrl = Array.isArray(sections.controls_and_compliance) ? sections.controls_and_compliance : [];
    const pts = ctrl.length >= 1 ? 5 : 0;
    breakdown.controls_and_compliance = `${pts}/5`;
    total += pts;
  }

  // ─── babok_core_concepts (5 pts) ──────────────────────────────────────────
  {
    const babok = pns.babok_core_concepts || {};
    const populated = BABOK_FIELDS.filter((f) => babok[f] && String(babok[f]).trim().length >= 20).length;
    let pts = 0;
    if (populated >= 6) pts = 5;
    else if (populated === 5) pts = 4;
    else if (populated === 4) pts = 3;
    breakdown.babok_core_concepts = `${pts}/5`;
    total += pts;
  }

  // ─── apqc_pcf_mapping (5 pts) ─────────────────────────────────────────────
  {
    const pts = pns.apqc_pcf_mapping && String(pns.apqc_pcf_mapping).trim() !== '' ? 5 : 0;
    breakdown.apqc_pcf_mapping = `${pts}/5`;
    total += pts;
  }

  const ready_for_publication = total >= PUBLICATION_THRESHOLD;
  if (!ready_for_publication) {
    warnings.push(`Score ${total} is below the publication threshold of ${PUBLICATION_THRESHOLD}`);
  }

  return {
    valid: true,
    errors,
    warnings,
    score: total,
    ready_for_publication,
    breakdown,
  };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('score-pns-quality.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/score-pns-quality.mjs <pns.yaml>');
    console.log('Scores a PNS file on a 0–100 quality scale (publication threshold: 75).');
    process.exit(0);
  }
  loadFile(file).then((pns) => {
    const result = scorePnsQuality(pns);
    console.log(`PNS Quality Score: ${result.score}/100`);
    console.log(`Ready for Publication: ${result.ready_for_publication ? 'YES' : 'NO'}`);
    console.log('\nBreakdown:');
    const pad = (s, n) => s.padEnd(n, ' ');
    const bar = (label) => {
      const [n, d] = label.split('/').map(Number);
      return '█'.repeat(n) + '░'.repeat(d - n);
    };
    for (const [key, val] of Object.entries(result.breakdown)) {
      console.log(`  ${pad(key, 28)} ${val.padStart(6)}  ${bar(val)}`);
    }
    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach((w) => console.log(`  ${w}`));
    }
    process.exit(0);
  }).catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
