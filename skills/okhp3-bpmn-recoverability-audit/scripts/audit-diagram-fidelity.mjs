#!/usr/bin/env node
/**
 * audit-diagram-fidelity.mjs
 * Audits a diagram-derived pns.yaml (one lacking a companion pir.yaml
 * elicitation record) against the fixed recoverability boundary between
 * pns.yaml sections and bpmn-beta diagram grammar, and produces a
 * fidelity-report.yaml-shaped object.
 *
 * This does NOT run the V1-V9 publication-readiness suite and NEVER sets
 * ready_for_publication. Use okhp3-process-validation-scoring for that.
 *
 * Usage: node audit-diagram-fidelity.mjs
 * Named export: auditDiagramFidelity({ pns, pir }) -> { valid, errors, warnings, report }
 */

// ─── Per-section "is there real content here" checks ────────────────────────
// Keyed narrowly (section.subfield) so two rows in the same pns.yaml section
// can be checked independently when they have different recoverability.
const SECTION_POPULATED_CHECKS = {
  'process_box.trigger': (pns) => !!pns?.process_box?.trigger,
  'process_box.outputs': (pns) => Array.isArray(pns?.process_box?.outputs) && pns.process_box.outputs.length > 0,
  'process_box.other': (pns) => !!(pns?.process_box && (
    (Array.isArray(pns.process_box.inputs) && pns.process_box.inputs.length > 0) ||
    pns.process_box.criteria || pns.process_box.resources ||
    pns.process_box.responsibilities || pns.process_box.risks
  )),
  'activity_sequence.core': (pns) => (pns?.activity_sequence?.activities || []).some(a => !!a?.description),
  'activity_sequence.actor_role_id': (pns) => (pns?.activity_sequence?.activities || []).some(a => !!a?.actor_role_id),
  'activity_sequence.detail': (pns) => (pns?.activity_sequence?.activities || []).some(a =>
    (Array.isArray(a?.inputs) && a.inputs.length > 0) ||
    (Array.isArray(a?.outputs) && a.outputs.length > 0) ||
    (Array.isArray(a?.systems) && a.systems.length > 0) ||
    !!a?.preconditions || !!a?.postconditions
  ),
  'roles_and_raci.roles': (pns) => (pns?.roles_and_raci?.roles || []).length > 0,
  'roles_and_raci.raci': (pns) => (pns?.roles_and_raci?.raci_matrix || []).some(e =>
    !!e?.accountable ||
    (Array.isArray(e?.responsible) && e.responsible.length > 0) ||
    (Array.isArray(e?.consulted) && e.consulted.length > 0) ||
    (Array.isArray(e?.informed) && e.informed.length > 0)
  ),
  'business_rules.description': (pns) => (pns?.business_rules || []).some(r => !!r?.description),
  'business_rules.source': (pns) => (pns?.business_rules || []).some(r => !!r?.source || !!r?.rationale),
  'decision_points.core': (pns) => (pns?.decision_points || []).some(d => !!d?.description || (Array.isArray(d?.outcomes) && d.outcomes.length > 0)),
  'decision_points.detail': (pns) => (pns?.decision_points || []).some(d => !!d?.criteria || !!d?.authority),
  'exception_paths.existence': (pns) => (pns?.exception_paths || []).length > 0,
  'exception_paths.handling': (pns) => (pns?.exception_paths || []).some(e => !!e?.handling || !!e?.escalation_path),
  'systems_and_integrations.core': (pns) => (pns?.systems_and_integrations || []).length > 0,
  'kpis.core': (pns) => (pns?.kpis || []).length > 0,
  'controls_and_compliance.core': (pns) => (pns?.controls_and_compliance || []).length > 0,
  'open_questions.core': (pns) => (pns?.open_questions || []).length > 0,
  'babok_core_concepts.core': (pns) => !!(pns?.babok_core_concepts && Object.values(pns.babok_core_concepts).some(v => !!v)),
  'revision_history.core': (pns) => (pns?.revision_history || []).length > 0,
  'validation.core': (pns) => !!(pns?.validation && Object.keys(pns.validation).length > 0),
};

// ─── The recoverability boundary table ───────────────────────────────────────
// Keep this in sync with references/recoverability-boundary.md.
export const RECOVERABILITY_TABLE = [
  { section: 'process_box', field: 'trigger', checkKey: 'process_box.trigger', recoverable: 'partial',
    diagram_signal: 'Start event node and its label',
    caveat: 'Confirms a trigger exists and names it; the business-context sentence behind it is not diagram-native.' },
  { section: 'process_box', field: 'outputs[].name / .consumer', checkKey: 'process_box.outputs', recoverable: 'partial',
    diagram_signal: 'End event node label; message-flow target when present',
    caveat: '.consumer is only recoverable when an explicit message flow names an external pool/lane.' },
  { section: 'process_box', field: 'inputs[], criteria, resources, responsibilities, risks', checkKey: 'process_box.other', recoverable: 'no',
    reason: 'No bpmn-beta element carries input-artifact provenance, success-criteria prose, named resources, accountability prose, or risk narrative.' },

  { section: 'activity_sequence', field: 'activities[].description', checkKey: 'activity_sequence.core', recoverable: 'yes',
    diagram_signal: 'Task node label' },
  { section: 'activity_sequence', field: 'activity order / sequence', checkKey: 'activity_sequence.core', recoverable: 'yes',
    diagram_signal: 'Sequence flow arrows (-->) between nodes' },
  { section: 'activity_sequence', field: 'activities[].actor_role_id', checkKey: 'activity_sequence.actor_role_id', recoverable: 'partial',
    diagram_signal: 'Lane assignment of the task node',
    caveat: 'Names an owning lane; mapping it to a validated actor_role_id from role-dictionary.md is an inference.' },
  { section: 'activity_sequence', field: 'activities[].inputs, outputs, systems, preconditions, postconditions', checkKey: 'activity_sequence.detail', recoverable: 'no',
    reason: 'Task node grammar carries only a label and a lane; per-activity artifact/system/pre-post detail has no dedicated element.' },

  { section: 'roles_and_raci', field: 'roles[] (role list)', checkKey: 'roles_and_raci.roles', recoverable: 'partial',
    diagram_signal: 'Pool and lane names',
    caveat: 'A candidate role list, not confirmation the names match role-dictionary.md or are still current.' },
  { section: 'roles_and_raci', field: 'raci_matrix[] (accountable/responsible/consulted/informed)', checkKey: 'roles_and_raci.raci', recoverable: 'no',
    reason: 'bpmn-beta has no grammar for the four RACI categories. Lane ownership implies at best "whoever performs tasks here," closer to Responsible than a validated A/C/I split; treating it as a full RACI entry is a fabrication risk.' },

  { section: 'business_rules', field: 'description', checkKey: 'business_rules.description', recoverable: 'partial',
    diagram_signal: 'Gateway condition label',
    caveat: 'Only recovered when the label states the rule rather than asking a bare question (e.g. "Approved?" gives no rule text).' },
  { section: 'business_rules', field: 'source, rationale', checkKey: 'business_rules.source', recoverable: 'no',
    reason: 'Policy citation and rationale prose have no bpmn-beta grammar element.' },

  { section: 'decision_points', field: 'description', checkKey: 'decision_points.core', recoverable: 'yes',
    diagram_signal: 'Gateway node label' },
  { section: 'decision_points', field: 'outcomes[]', checkKey: 'decision_points.core', recoverable: 'yes',
    diagram_signal: 'Labeled branch flows leaving the gateway' },
  { section: 'decision_points', field: 'criteria, authority', checkKey: 'decision_points.detail', recoverable: 'no',
    reason: 'Precise decision criteria and the deciding role/authority are narrative fields with no gateway-label equivalent.' },

  { section: 'exception_paths', field: 'existence of an exception path', checkKey: 'exception_paths.existence', recoverable: 'partial',
    diagram_signal: 'Error / intermediate-error event and its attachment point',
    caveat: 'Confirms an exception path exists and roughly where it attaches; weaker than a fully elicited exception register entry.' },
  { section: 'exception_paths', field: 'handling, escalation_path', checkKey: 'exception_paths.handling', recoverable: 'no',
    reason: 'The handling procedure and escalation chain are prose fields with no dedicated bpmn-beta grammar.' },

  { section: 'systems_and_integrations', field: 'system_name, integration_type, activities_supported', checkKey: 'systems_and_integrations.core', recoverable: 'no',
    reason: 'bpmn-beta has no system/tool node type; an occasional system name inside a task label is unreliable inference, not structural encoding.' },

  { section: 'kpis', field: 'name, formula, data_source, target, frequency', checkKey: 'kpis.core', recoverable: 'no',
    reason: 'There is no measurement or metric concept anywhere in bpmn-beta grammar.' },

  { section: 'controls_and_compliance', field: 'type, description, standard_ref, activities_covered, waiver', checkKey: 'controls_and_compliance.core', recoverable: 'no',
    reason: 'Controls and compliance mappings are governance narrative with no diagram-grammar channel.' },

  { section: 'open_questions', field: 'open_questions[]', checkKey: 'open_questions.core', recoverable: 'no',
    reason: "This is a meta-narrative field about elicitation gaps; a diagram cannot state what wasn't asked about it." },

  { section: 'babok_core_concepts', field: 'change, need, solution, stakeholders, value, context', checkKey: 'babok_core_concepts.core', recoverable: 'no',
    reason: "These are BABOK rationale fields describing why the process exists; a diagram encodes what happens, not why." },

  { section: 'revision_history', field: 'revision_history[]', checkKey: 'revision_history.core', recoverable: 'no',
    reason: 'Authorship and versioning metadata is document-management information, not process content a diagram can carry.' },

  { section: 'validation', field: 'pns_quality_score, ready_for_publication, ready_for_bpmn_modeling', checkKey: 'validation.core', recoverable: 'no',
    reason: 'These are computed by okhp3-process-validation-scoring / okhp3-process-narrative-authoring, not derived from the diagram. A diagram-derived PNS must never self-assign these values.' },
];

function fieldKey(row) {
  return `${row.section}.${row.field}`;
}

function isPopulated(pns, row) {
  const check = SECTION_POPULATED_CHECKS[row.checkKey];
  return check ? !!check(pns) : false;
}

/**
 * auditDiagramFidelity({ pns, pir }) -> { valid, errors, warnings, report }
 *
 * pns: parsed pns.yaml object under audit (required). May optionally carry
 *      `narrative_provenance: "diagram-derived"` and an `unrecoverable_fields`
 *      array of "<section>.<field>" strings, as emitted by
 *      okhp3-bpmn-to-process-narrative.
 * pir: parsed pir.yaml object, if one actually exists (optional). Its
 *      presence and quality decide whether this PNS is diagram-only at all.
 */
export function auditDiagramFidelity({ pns, pir } = {}) {
  const errors = [];
  const warnings = [];

  if (!pns) {
    errors.push('audit: pns is required');
    return {
      valid: false,
      errors,
      warnings,
      report: {
        fidelity_report_version: '0.1',
        source_pns: null,
        recoverable_from_diagram: [],
        unrecoverable_from_diagram: [],
        completeness_verdict: 'insufficient',
        recommended_next_action: 'Provide a pns.yaml to audit; none was supplied.',
        validation_boundary_notice: "This report is not a substitute for okhp3-process-validation-scoring's V1-V9 suite. A diagram-derived PNS must never be marked ready_for_publication: true by this skill alone.",
      },
    };
  }

  const narrativeProvenance = pns.narrative_provenance || 'elicited';
  const declaredUnrecoverable = new Set(
    Array.isArray(pns.unrecoverable_fields) ? pns.unrecoverable_fields : []
  );

  const recoverable = [];
  const unrecoverable = [];

  for (const row of RECOVERABILITY_TABLE) {
    const key = fieldKey(row);
    const populated = isPopulated(pns, row);
    const declaredHere = declaredUnrecoverable.has(row.checkKey) || declaredUnrecoverable.has(key);

    if (row.recoverable === 'no' || declaredHere) {
      const entry = {
        section: row.section,
        field: row.field,
        reason: row.reason || 'Marked unrecoverable-from-diagram by the upstream diagram-derivation skill for this PNS.',
        populated_in_this_pns: populated,
      };
      if (populated) {
        warnings.push(
          `"${key}" is populated despite being diagram-grammar-unrecoverable; confirm it came from real elicitation evidence, not inference or fabrication.`
        );
      }
      unrecoverable.push(entry);
    } else {
      recoverable.push({
        section: row.section,
        field: row.field,
        diagram_signal: row.diagram_signal,
        caveat: row.caveat || null,
        populated_in_this_pns: populated,
      });
    }
  }

  for (const key of declaredUnrecoverable) {
    const inTable = RECOVERABILITY_TABLE.some(r => r.checkKey === key || fieldKey(r) === key);
    if (!inTable) {
      warnings.push(
        `pns.unrecoverable_fields references "${key}", which is not in this skill's known recoverability boundary table; add it to references/recoverability-boundary.md if confirmed.`
      );
    }
  }

  // ─── Completeness verdict ───────────────────────────────────────────────
  const activities = pns?.activity_sequence?.activities || [];
  const roles = pns?.roles_and_raci?.roles || [];
  const pirQualifies = !!(
    pir && pir.validation &&
    typeof pir.validation.completeness_score === 'number' &&
    pir.validation.completeness_score >= 70 &&
    pir.validation.ready_for_narrative === true
  );

  let completenessVerdict;
  if (pirQualifies) {
    completenessVerdict = 'full';
    if (narrativeProvenance === 'diagram-derived') {
      warnings.push(
        'pns.narrative_provenance is "diagram-derived" but a qualifying pir.yaml is also present; this PNS is not actually diagram-only. Resolve the contradiction before treating it as a real elicitation record.'
      );
    }
  } else if (activities.length === 0) {
    completenessVerdict = 'insufficient';
  } else if (activities.length < 2 && roles.length === 0) {
    completenessVerdict = 'insufficient';
  } else {
    completenessVerdict = 'partial-diagram-derived';
    if (narrativeProvenance !== 'diagram-derived') {
      warnings.push(
        'pns.narrative_provenance is not tagged "diagram-derived" and no qualifying pir.yaml was supplied; confirm whether this PNS actually lacks an elicitation record before relying on this audit.'
      );
    }
  }

  const unrecoverableKeys = unrecoverable.map(fieldKey);

  let recommendedNextAction;
  if (completenessVerdict === 'full') {
    recommendedNextAction =
      'This PNS has a qualifying pir.yaml and is not diagram-only; route to okhp3-process-validation-scoring for the full V1-V9 publication-readiness suite instead of relying on this report.';
  } else if (completenessVerdict === 'insufficient') {
    recommendedNextAction =
      'The source diagram is too sparse to support a meaningful recoverability audit (no activities and/or no lanes recovered). Return to okhp3-bpmn-to-process-narrative with a richer bpmn-beta source, or start from okhp3-elicitation-interviews instead of relying on this reconstruction.';
  } else {
    recommendedNextAction =
      `Route to okhp3-elicitation-interviews for a targeted follow-up pass covering: ${unrecoverableKeys.join(', ')}. ` +
      "Do not run okhp3-process-validation-scoring's full V1-V9 suite against this PNS as-is: its V8 rule hard-gates on pir.yaml completeness_score >= 70, which a diagram-only reconstruction was never meant to satisfy. " +
      'Only after the listed gaps are filled by elicitation should validation-scoring be run for real publication-readiness scoring.';
  }

  const report = {
    fidelity_report_version: '0.1',
    source_pns: {
      process_id: pns.process_id || null,
      title: pns.process_name || pns.title || null,
      narrative_provenance: narrativeProvenance,
    },
    recoverable_from_diagram: recoverable,
    unrecoverable_from_diagram: unrecoverable,
    completeness_verdict: completenessVerdict,
    recommended_next_action: recommendedNextAction,
    validation_boundary_notice:
      "This report is not a substitute for okhp3-process-validation-scoring's V1-V9 suite. A diagram-derived PNS must never be marked ready_for_publication: true by this skill alone.",
  };

  return { valid: errors.length === 0, errors, warnings, report };
}

// ─── CLI entrypoint ───────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const result = auditDiagramFidelity({});
  console.log('Completeness verdict:', result.report.completeness_verdict);
  console.log('Recommended next action:', result.report.recommended_next_action);
  if (result.errors.length > 0) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
}
