/**
 * pipeline.integration.test.mjs
 * Corpus-level integration test: runs all 21 pipeline scripts across the
 * 15 core BP-SKILL skills against the shared purchase-approval PNS fixture.
 *
 * Each stage feeds its output into the next. The final stage asserts that
 * buildPublicationBundle produces a manifest with missing_required: [].
 *
 * Run: node --test skills/tests/pipeline.integration.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SKILLS = join(__dir, '..');

// ─── Script imports (all 15 core skills) ─────────────────────────────────────

import { generatePir }             from '../process-intake-and-scope/scripts/generate-pir.mjs';
import { scoreIntakeCompleteness } from '../process-intake-and-scope/scripts/score-intake-completeness.mjs';
import { validatePir }             from '../process-intake-and-scope/scripts/validate-pir.mjs';

import { generateQuestionPlan }    from '../elicitation-and-interview-facilitation/scripts/generate-question-plan.mjs';
import { assignStepIds }           from '../as-is-process-capture/scripts/assign-step-ids.mjs';
import { analyzeGaps }             from '../process-gap-and-exception-analysis/scripts/analyze-gaps.mjs';
import { generateFutureState }     from '../future-state-and-change-strategy/scripts/generate-future-state.mjs';

import { generateStakeholderRegister } from '../stakeholder-and-role-mapping/scripts/generate-stakeholder-register.mjs';
import { generateRaci }            from '../raci-and-governance-matrix-generation/scripts/generate-raci.mjs';
import { generateSipoc }           from '../sipoc-generation/scripts/generate-sipoc.mjs';
import { generateMeasuresRegister } from '../process-measures-and-controls-definition/scripts/generate-measures-register.mjs';

import { scorePnsQuality }         from '../process-narrative-authoring/scripts/score-pns-quality.mjs';
import { validatePns }             from '../process-narrative-authoring/scripts/validate-pns.mjs';

import { validateDecisionModel }   from '../decision-model-authoring/scripts/validate-decision-model.mjs';

import { validateBpmnBeta }        from '../visual-process-modeling/scripts/validate-bpmn-beta.mjs';
import { lintProcessModel }        from '../visual-process-modeling/scripts/lint-process-model.mjs';
import { normalizeBpmnBeta }       from '../visual-process-modeling/scripts/normalize-bpmn-beta.mjs';
import { repairBpmnBeta }          from '../visual-process-modeling/scripts/repair-bpmn-beta.mjs';

import { runValidationSuite }      from '../process-validation-and-quality-scoring/scripts/run-validation-suite.mjs';
import { generateSop }             from '../sop-and-work-instruction-generation/scripts/generate-sop.mjs';
import { buildPublicationBundle }  from '../publication-and-handoff-packaging/scripts/build-publication-bundle.mjs';

// ─── Shared fixture data (matches pns-example.yaml) ──────────────────────────
// Hard-coded from skills/process-narrative-authoring/assets/fixtures/pns-example.yaml
// to avoid a runtime YAML-parse dependency in the test runner.

const FIXTURE_PATH = join(
  SKILLS,
  'process-narrative-authoring/assets/fixtures/pns-example.yaml'
);

const PNS = {
  pns_version: '0.1',
  process_id: 'proc-purchase-approval',
  process_name: 'Purchase Order Approval',
  process_owner: 'Finance Manager',
  department: 'Finance',
  status: 'approved',
  process_box: {
    trigger: 'Staff member submits a purchase request requiring approval before payment',
    inputs: [
      { name: 'Purchase Request Form', source: 'Requester' },
      { name: 'Vendor Quote', source: 'Vendor' },
    ],
    outputs: [
      { name: 'Approved Purchase Order', consumer: 'Vendor' },
      { name: 'Rejection Notice', consumer: 'Requester' },
    ],
    criteria: 'Purchase Order issued to vendor or rejection notice sent to requester',
    resources: 'ERP Portal, Finance Policy FP-003',
    responsibilities: 'Finance Manager accountable for all approval decisions',
    risks: 'Budget overrun if approval controls are bypassed; vendor delay if SLA is breached',
  },
  activity_sequence: {
    activities: [
      { id: 'act-001', description: 'Submit purchase request form with vendor quote attached',       actor_role_id: 'role-requester',       inputs: ['Purchase Request Form', 'Vendor Quote'],  outputs: ['Submitted Request'],   systems: ['ERP Portal'] },
      { id: 'act-002', description: 'Review purchase request for completeness and policy compliance', actor_role_id: 'role-finance-manager', inputs: ['Submitted Request'],                      outputs: ['Reviewed Request'],    systems: ['ERP Portal'] },
      { id: 'act-003', description: 'Approve or reject the purchase request',                        actor_role_id: 'role-finance-manager', inputs: ['Reviewed Request'],                       outputs: ['Approval Decision'],  systems: ['ERP Portal'] },
      { id: 'act-004', description: 'Issue approved purchase order to vendor',                        actor_role_id: 'role-procurement',     inputs: ['Approved Purchase Order'],                outputs: ['Issued PO'],          systems: ['ERP Portal', 'Email'] },
      { id: 'act-005', description: 'Notify requester of approval or rejection outcome',              actor_role_id: 'role-finance-manager', inputs: ['Approval Decision'],                      outputs: ['Requester Notification'], systems: ['Email'] },
    ],
  },
  roles_and_raci: {
    roles: [
      { role_id: 'role-requester',       role_name: 'Requester' },
      { role_id: 'role-finance-manager', role_name: 'Finance Manager' },
      { role_id: 'role-procurement',     role_name: 'Procurement Officer' },
      { role_id: 'role-director',        role_name: 'Director' },
    ],
    raci_matrix: [
      { activity_id: 'act-001', responsible: ['role-requester'],       accountable: 'role-requester',       consulted: [],                   informed: ['role-finance-manager'] },
      { activity_id: 'act-002', responsible: ['role-finance-manager'], accountable: 'role-finance-manager', consulted: ['role-procurement'], informed: [] },
      { activity_id: 'act-003', responsible: ['role-finance-manager'], accountable: 'role-finance-manager', consulted: ['role-director'],    informed: ['role-requester'] },
      { activity_id: 'act-004', responsible: ['role-procurement'],     accountable: 'role-finance-manager', consulted: [],                   informed: ['role-requester'] },
      { activity_id: 'act-005', responsible: ['role-finance-manager'], accountable: 'role-finance-manager', consulted: [],                   informed: ['role-requester'] },
    ],
  },
  business_rules: [
    { id: 'rule-001', description: 'Purchases under $1,000 may be approved by Finance Manager without Director sign-off', source: 'policy', applies_to: 'act-003' },
    { id: 'rule-002', description: 'Purchases over $10,000 require Director approval',                                     source: 'policy', applies_to: 'act-003' },
  ],
  decision_points: [
    { id: 'gw-001', description: 'Is the purchase amount within Finance Manager approval limit?', activity_id: 'act-003', criteria: 'Purchase amount compared against $10,000 threshold', outcomes: [{ label: 'Within limit', next_activity: 'act-004' }, { label: 'Exceeds limit', next_activity: 'act-003-escalate' }] },
  ],
  exception_paths: [
    { id: 'exc-001', description: 'Vendor quote is missing or expired',                trigger: 'Purchase request submitted without a current vendor quote', handling: 'Return request to requester with instruction to obtain a vendor quote dated within 30 days',                                owner_role_id: 'role-finance-manager' },
    { id: 'exc-002', description: 'Purchase exceeds Finance Manager approval limit',   trigger: 'Purchase amount exceeds $10,000',                          handling: 'Escalate request to Director queue in ERP Portal; Director approves or rejects within 2 business days', owner_role_id: 'role-director' },
  ],
  kpis: [
    { id: 'kpi-001', name: 'PO Approval Cycle Time', formula: 'Average elapsed time from PO submission timestamp to approval timestamp across all POs in the period', data_source: 'ERP Portal — submission and approval timestamp fields on PO records', target: '2 business days', frequency: 'monthly' },
    { id: 'kpi-002', name: 'PO Rejection Rate',      formula: 'Count of POs rejected / total POs submitted × 100', data_source: 'ERP Portal — status field on PO records', target: '< 5%', frequency: 'monthly' },
  ],
  systems_and_integrations: [
    { system_name: 'ERP Portal', role: 'processor',    integration_type: 'ui',     activities_supported: ['act-001', 'act-002', 'act-003', 'act-004'] },
    { system_name: 'Email',      role: 'notification', integration_type: 'manual', activities_supported: ['act-004', 'act-005'] },
  ],
  controls_and_compliance: [
    { id: 'ctrl-001', type: 'approval',    description: 'Finance Manager approval required for all purchase requests before PO is issued', standard_ref: 'Finance Policy FP-003 §3.1', activities_covered: ['act-003'],          waiver: 'none' },
    { id: 'ctrl-002', type: 'segregation', description: 'Requester cannot approve their own purchase request',                             standard_ref: 'Finance Policy FP-003 §3.4', activities_covered: ['act-002', 'act-003'], waiver: 'none' },
  ],
  open_questions: [],
  babok_core_concepts: {
    change:       'Uncontrolled purchases become tracked, approved expenditures with audit trails',
    need:         'The organisation needs to prevent unauthorised spending while enabling timely procurement',
    solution:     'A structured approval workflow with tiered authority levels and system-enforced controls',
    stakeholders: 'Requesters, Finance Manager, Procurement Officer, Director, and Vendors',
    value:        'Reduced unauthorised spend, faster vendor payment cycles, and improved audit readiness',
    context:      'Finance department operating under Finance Policy FP-003 with ERP Portal as the system of record',
  },
  revision_history: [
    { version: '1.0', date: '2026-05-10', author_role: 'Business Analyst', summary: 'Initial approved version following elicitation and SME review' },
  ],
  validation: {
    pns_quality_score: 95,
    ready_for_publication: true,
    ready_for_bpmn_modeling: true,
  },
};

// Wrapped PNS for scripts that navigate via pns.sections (process-narrative-authoring,
// raci-and-governance-matrix-generation, sipoc-generation).
const PNS_WRAPPED = { sections: PNS };

// PNS with fields expected by validatePns (process_owner_role_id, version, valid status)
const PNS_FOR_VALIDATE = {
  ...PNS,
  process_owner_role_id: 'role-finance-manager',
  version: '1.0',
  status: 'validated',
};

// Minimal bpmn-beta diagram string used for visual-process-modeling stages
const BPMN_BETA = `bpmn-beta

accTitle: Purchase Order Approval

pool Finance "Finance Department" {
  lane Requester "Requester" {
    start S "Request Submitted"
    task T1 "Submit purchase request form with vendor quote attached"
  }
  lane Manager "Finance Manager" {
    task T2 "Review purchase request for completeness and policy compliance"
    xor G1 "Is purchase within approval limit?"
    task T3 "Approve or reject the purchase request"
    task T5 "Notify requester of approval or rejection outcome"
    end E "Process Complete"
  }
  lane Procurement "Procurement Officer" {
    task T4 "Issue approved purchase order to vendor"
  }
}

S --> T1
T1 --> T2
T2 --> G1
G1 --> T3: "Within limit"
G1 --> T4: "Exceeds limit"
T3 --> T5
T4 --> T5
T5 --> E
`;

// ─── Mutable pipeline state ───────────────────────────────────────────────────
// Each test stage writes its outputs here; the next stage reads them.

let enrichedPir = null;
let normalisedSteps = null;
let gapAnalysis = null;
let sopText = null;

// ─── Stage 1: process-intake-and-scope / generate-pir ─────────────────────────
test('Stage 1 — generatePir scaffolds a PIR from process name', () => {
  const result = generatePir({
    processName: 'Purchase Order Approval',
    owner: 'Finance Manager',
    department: 'Finance',
  });

  assert.equal(typeof result.valid, 'boolean', 'result.valid must be boolean');
  assert.ok(Array.isArray(result.errors), 'result.errors must be an array');
  assert.ok(Array.isArray(result.warnings), 'result.warnings must be an array');
  assert.ok(result.pir && typeof result.pir === 'object', 'result.pir must be an object');
  assert.equal(result.valid, true, 'generatePir must be valid for a named process');
  assert.ok(result.pir.process_id.startsWith('proc-'), 'process_id must have proc- prefix');

  // Enrich the blank PIR scaffold with fixture data for downstream stages
  enrichedPir = {
    ...result.pir,
    elicitation_method: 'interview',
    elicitation_date: '2026-05-02',
    elicited_by: 'BA Team',
    status: 'complete',
    trigger: {
      description: PNS.process_box.trigger,
      event_type: 'manual',
    },
    actors: [
      { role_id: 'role-requester',       role_name: 'Requester',           type: 'initiator', influence: 'medium' },
      { role_id: 'role-finance-manager', role_name: 'Finance Manager',     type: 'approver',  influence: 'high' },
      { role_id: 'role-procurement',     role_name: 'Procurement Officer', type: 'performer', influence: 'medium' },
      { role_id: 'role-director',        role_name: 'Director',            type: 'approver',  influence: 'high' },
    ],
    inputs:  PNS.process_box.inputs.map(i => ({ name: i.name, source: i.source })),
    outputs: PNS.process_box.outputs.map(o => ({ name: o.name, consumer: o.consumer })),
    steps:   PNS.activity_sequence.activities.map(a => ({
      id:           a.id,
      description:  a.description,
      actor_role_id: a.actor_role_id,
    })),
    exceptions:     PNS.exception_paths.map(e => ({
      id: e.id, description: e.description, handling: e.handling,
    })),
    business_rules: PNS.business_rules.map(r => ({
      id: r.id, description: r.description, source: r.source,
    })),
    systems: PNS.systems_and_integrations.map(s => ({
      name: s.system_name, role: s.role, integration_type: s.integration_type,
    })),
    controls: PNS.controls_and_compliance.map(c => ({
      id: c.id, type: c.type, description: c.description, standard_ref: c.standard_ref,
    })),
  };
});

// ─── Stage 2: process-intake-and-scope / score-intake-completeness ─────────────
test('Stage 2 — scoreIntakeCompleteness returns score ≥ 70 for the enriched PIR', () => {
  assert.ok(enrichedPir, 'enrichedPir must be set by Stage 1');
  const result = scoreIntakeCompleteness(enrichedPir);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(typeof result.score === 'number', 'score must be a number');
  assert.ok(typeof result.ready_for_narrative === 'boolean', 'ready_for_narrative must be boolean');
  assert.ok(result.score >= 70, `score must be ≥ 70 for the enriched fixture PIR (got ${result.score})`);
  assert.equal(result.ready_for_narrative, true, 'fixture PIR must be ready_for_narrative');
  assert.ok(result.breakdown && typeof result.breakdown === 'object', 'breakdown must be an object');

  // Feed score back into PIR for downstream V8 check
  enrichedPir = {
    ...enrichedPir,
    validation: {
      completeness_score: result.score,
      ready_for_narrative: result.ready_for_narrative,
    },
  };
});

// ─── Stage 3: process-intake-and-scope / validate-pir ─────────────────────────
test('Stage 3 — validatePir returns the standard result shape', () => {
  assert.ok(enrichedPir, 'enrichedPir must be set by Stage 1');
  const result = validatePir(enrichedPir);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
});

// ─── Stage 4: elicitation-and-interview-facilitation / generate-question-plan ──
test('Stage 4 — generateQuestionPlan returns a plan from the PIR', () => {
  assert.ok(enrichedPir, 'enrichedPir must be set by Stage 1');
  const result = generateQuestionPlan(enrichedPir);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(result.plan && typeof result.plan === 'object', 'plan must be an object');
  assert.ok(typeof result.plan.question_count === 'number', 'plan.question_count must be a number');
  assert.ok(Array.isArray(result.plan.questions), 'plan.questions must be an array');
  assert.equal(result.valid, true, 'generateQuestionPlan must be valid');
});

// ─── Stage 5: as-is-process-capture / assign-step-ids ─────────────────────────
test('Stage 5 — assignStepIds normalises activity IDs from enriched PIR steps', () => {
  assert.ok(enrichedPir, 'enrichedPir must be set by Stage 1');
  const result = assignStepIds(enrichedPir.steps);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(Array.isArray(result.steps), 'result.steps must be an array');
  assert.equal(result.valid, true, 'assignStepIds must be valid');
  assert.equal(result.steps.length, enrichedPir.steps.length, 'output steps count must match input');
  for (const step of result.steps) {
    assert.ok(/^(act|gw|evt)-\d{3,}$/.test(step.id), `step.id "${step.id}" must match act/gw/evt-NNN`);
  }

  normalisedSteps = result.steps;
});

// ─── Stage 6: process-gap-and-exception-analysis / analyze-gaps ───────────────
test('Stage 6 — analyzeGaps reports zero critical gaps on the complete fixture', () => {
  assert.ok(normalisedSteps, 'normalisedSteps must be set by Stage 5');
  const asIs = {
    process_id:  enrichedPir.process_id,
    steps:       normalisedSteps,
    exceptions:  enrichedPir.exceptions,
    controls:    enrichedPir.controls,
  };

  const result = analyzeGaps(asIs);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(Array.isArray(result.gaps), 'result.gaps must be an array');
  assert.ok(Array.isArray(result.exceptionCatalog), 'result.exceptionCatalog must be an array');
  assert.ok(result.summary && typeof result.summary === 'object', 'result.summary must be an object');
  assert.equal(result.valid, true, 'analyzeGaps must be valid');
  assert.equal(result.summary.critical_count, 0, 'fixture has no critical structural gaps');

  gapAnalysis = { process_id: enrichedPir.process_id, gaps: result.gaps };
});

// ─── Stage 7: future-state-and-change-strategy / generate-future-state ─────────
test('Stage 7 — generateFutureState scaffolds change items from gap output', () => {
  assert.ok(gapAnalysis, 'gapAnalysis must be set by Stage 6');
  const result = generateFutureState(gapAnalysis);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(result.futureState && typeof result.futureState === 'object', 'futureState must be an object');
  assert.equal(result.valid, true, 'generateFutureState must be valid');
  assert.ok(Array.isArray(result.futureState.change_items), 'change_items must be an array');
});

// ─── Stage 8: stakeholder-and-role-mapping / generate-stakeholder-register ─────
test('Stage 8 — generateStakeholderRegister derives register from PIR actors', () => {
  assert.ok(enrichedPir, 'enrichedPir must be set by Stage 1');
  const result = generateStakeholderRegister(enrichedPir);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.equal(result.valid, true, 'generateStakeholderRegister must be valid for enriched PIR');
  assert.ok(result.register && typeof result.register === 'object', 'register must be an object');
});

// ─── Stage 9: raci-and-governance-matrix-generation / generate-raci ────────────
test('Stage 9 — generateRaci builds RACI matrix from PNS roles_and_raci', () => {
  const result = generateRaci(PNS_WRAPPED);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.equal(result.valid, true, 'generateRaci must be valid for the fixture PNS');
  assert.ok(result.raci && typeof result.raci === 'object', 'raci must be an object');
});

// ─── Stage 10: sipoc-generation / generate-sipoc ──────────────────────────────
test('Stage 10 — generateSipoc derives SIPOC from PNS process_box', () => {
  const result = generateSipoc(PNS_WRAPPED);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.equal(result.valid, true, 'generateSipoc must be valid for the fixture PNS');
  assert.ok(result.sipoc && typeof result.sipoc === 'object', 'sipoc must be an object');
});

// ─── Stage 11: process-measures-and-controls-definition / generate-measures-register
test('Stage 11 — generateMeasuresRegister extracts KPIs and controls from PNS', () => {
  const result = generateMeasuresRegister(PNS);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.equal(result.valid, true, 'generateMeasuresRegister must be valid');
  assert.ok(result.measuresRegister && typeof result.measuresRegister === 'object', 'measuresRegister must be an object');
  assert.ok(result.controlsRegister && typeof result.controlsRegister === 'object', 'controlsRegister must be an object');
  assert.ok(result.measuresRegister.kpis.length >= 2, 'at least 2 KPIs must be derived from fixture');
  assert.ok(result.controlsRegister.controls.length >= 2, 'at least 2 controls must be derived from fixture');
});

// ─── Stage 12: process-narrative-authoring / score-pns-quality ─────────────────
test('Stage 12 — scorePnsQuality scores the fixture PNS ≥ 75 (publication threshold)', () => {
  const result = scorePnsQuality(PNS_WRAPPED);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.equal(result.valid, true, 'scorePnsQuality must be valid');
  assert.ok(typeof result.score === 'number', 'score must be a number');
  assert.ok(result.score >= 75, `PNS quality score must be ≥ 75 for fixture (got ${result.score})`);
  assert.equal(result.ready_for_publication, true, 'fixture PNS must be ready_for_publication');
});

// ─── Stage 13: process-narrative-authoring / validate-pns ─────────────────────
test('Stage 13 — validatePns runs V1–V7 rules and returns standard shape', () => {
  const result = validatePns(PNS_FOR_VALIDATE);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(Array.isArray(result.rules_fired), 'rules_fired must be an array');
  assert.ok(result.rules_fired.length > 0, 'at least one validation rule must be fired');
});

// ─── Stage 14: decision-model-authoring / validate-decision-model ──────────────
test('Stage 14 — validateDecisionModel validates a purchase-threshold decision model', () => {
  const dm = {
    decision_model_version: '0.1',
    process_id: PNS.process_id,
    decisions: [
      {
        id: 'dm-001',
        name: 'Approval Threshold Check',
        description: 'Determine approval authority based on purchase amount',
        hit_policy: 'U',
        inputs: [
          { id: 'in-001', name: 'Purchase Amount', type: 'number' },
        ],
        outputs: [
          { id: 'out-001', name: 'Approval Authority', type: 'string' },
        ],
        rules: [
          { id: 'r-001', conditions: ['< 1000'], outputs: ['Finance Manager'] },
          { id: 'r-002', conditions: ['[1000..10000]'], outputs: ['Finance Manager'] },
          { id: 'r-003', conditions: ['> 10000'], outputs: ['Director'] },
        ],
      },
    ],
  };

  const result = validateDecisionModel(dm, PNS);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(Array.isArray(result.rules_fired), 'rules_fired must be an array');
});

// ─── Stage 15: visual-process-modeling / validate-bpmn-beta ───────────────────
test('Stage 15 — validateBpmnBeta validates the fixture BPMN diagram', () => {
  const result = validateBpmnBeta(BPMN_BETA);

  assert.ok(result && typeof result === 'object', 'validateBpmnBeta must return an object');
  assert.equal(typeof result.valid,   'boolean', 'result.valid must be boolean');
  assert.ok(Array.isArray(result.errors),   'result.errors must be an array');
  assert.ok(Array.isArray(result.warnings), 'result.warnings must be an array');
  assert.equal(result.valid, true, `fixture BPMN must be valid (errors: ${result.errors.join(', ')})`);
});

// ─── Stage 16: visual-process-modeling / lint-process-model ───────────────────
test('Stage 16 — lintProcessModel returns linting results for the fixture diagram', () => {
  const result = lintProcessModel(BPMN_BETA);

  assert.ok(result && typeof result === 'object', 'lintProcessModel must return an object');
  assert.ok(Array.isArray(result.errors) || Array.isArray(result.issues) || Array.isArray(result.warnings),
    'result must contain an issues/errors/warnings array');
});

// ─── Stage 17: visual-process-modeling / normalize-bpmn-beta ─────────────────
test('Stage 17 — normalizeBpmnBeta returns the normalised diagram string', () => {
  const result = normalizeBpmnBeta(BPMN_BETA);

  assert.ok(result && typeof result === 'object', 'normalizeBpmnBeta must return an object');
  assert.ok(typeof result.normalized === 'string', 'result.normalized must be a string');
  assert.ok(result.normalized.length > 0, 'normalised output must be non-empty');
  assert.ok(Array.isArray(result.changes), 'result.changes must be an array');
});

// ─── Stage 18: visual-process-modeling / repair-bpmn-beta ─────────────────────
test('Stage 18 — repairBpmnBeta returns the repaired diagram and validation status', () => {
  const result = repairBpmnBeta(BPMN_BETA);

  assert.ok(result && typeof result === 'object', 'repairBpmnBeta must return an object');
  assert.ok(typeof result.repaired === 'string', 'result.repaired must be a string');
  assert.equal(typeof result.valid, 'boolean', 'result.valid must be boolean');
  assert.ok(Array.isArray(result.errors), 'result.errors must be an array');
});

// ─── Stage 19: process-validation-and-quality-scoring / run-validation-suite ───
test('Stage 19 — runValidationSuite runs V1–V9 checks on PIR + PNS; fixture is publication-ready', () => {
  assert.ok(enrichedPir, 'enrichedPir must be set by Stage 2');
  const result = runValidationSuite({ pir: enrichedPir, pns: PNS });

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.ok(result.report && typeof result.report === 'object', 'report must be an object');
  assert.ok(typeof result.report.composite_score === 'number', 'composite_score must be a number');
  assert.ok(['A', 'B', 'C', 'D'].includes(result.report.band), 'band must be A/B/C/D');
  assert.ok(result.report.composite_score >= 50, `composite_score must be ≥ 50 for fixture (got ${result.report.composite_score})`);
  assert.equal(result.report.ready_for_publication, true, 'fixture must pass the publication gate');
});

// ─── Stage 20: sop-and-work-instruction-generation / generate-sop ──────────────
test('Stage 20 — generateSop produces a non-empty ISO 9001 SOP from the fixture PNS', () => {
  const result = generateSop(PNS);

  assert.equal(typeof result.valid, 'boolean');
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.equal(result.valid, true, 'generateSop must be valid for the fixture PNS');
  assert.ok(typeof result.sop === 'string', 'result.sop must be a string');
  assert.ok(result.sop.length > 200, 'SOP must be a substantial document');
  assert.ok(result.sop.includes('Purchase Order Approval'), 'SOP must include the process name');
  assert.ok(result.sop.includes('## 4. Procedure'), 'SOP must include a Procedure section');

  sopText = result.sop;
});

// ─── Stage 21: publication-and-handoff-packaging / build-publication-bundle ────
test('Stage 21 — buildPublicationBundle assembles all artifacts — missing_required: []', async () => {
  assert.ok(sopText, 'sopText must be set by Stage 20');
  assert.ok(existsSync(FIXTURE_PATH), `fixture file must exist at ${FIXTURE_PATH}`);

  const bundleDir = join(tmpdir(), `bp-skill-test-bundle-${Date.now()}`);
  mkdirSync(bundleDir, { recursive: true });

  try {
    // pir.yaml — minimal PIR YAML
    writeFileSync(join(bundleDir, 'pir.yaml'), [
      'pir_version: "0.1"',
      `process_id: ${enrichedPir.process_id}`,
      `process_name: "${enrichedPir.process_name}"`,
      `process_owner: "${enrichedPir.process_owner}"`,
      `department: "${enrichedPir.department}"`,
      'elicitation_method: interview',
      'status: complete',
      '',
      'validation:',
      `  completeness_score: ${enrichedPir.validation.completeness_score}`,
      `  ready_for_narrative: ${enrichedPir.validation.ready_for_narrative}`,
    ].join('\n'));

    // pns.yaml — copy of the shared fixture
    const { readFileSync } = await import('node:fs');
    writeFileSync(join(bundleDir, 'pns.yaml'), readFileSync(FIXTURE_PATH));

    // bpmn-beta.mmd — fixture BPMN diagram
    writeFileSync(join(bundleDir, 'bpmn-beta.mmd'), BPMN_BETA);

    // sop.md — from generateSop stage
    writeFileSync(join(bundleDir, 'sop.md'), sopText);

    // validation-report.yaml — must have ready_for_publication: true
    writeFileSync(join(bundleDir, 'validation-report.yaml'), [
      'validation_version: "0.1"',
      `process_id: ${enrichedPir.process_id}`,
      `composite_score: ${PNS.validation.pns_quality_score}`,
      'band: A',
      'ready_for_publication: true',
    ].join('\n'));

    // Run buildPublicationBundle
    const result = buildPublicationBundle(bundleDir, {
      processId:      enrichedPir.process_id,
      processName:    enrichedPir.process_name,
      qualityBand:    'A',
      compositeScore: PNS.validation.pns_quality_score,
    });

    assert.equal(typeof result.valid, 'boolean');
    assert.ok(Array.isArray(result.errors));
    assert.ok(Array.isArray(result.warnings));
    assert.ok(result.manifest && typeof result.manifest === 'object', 'manifest must be an object');
    assert.ok(result.approvals && typeof result.approvals === 'object', 'approvals must be an object');

    // Primary acceptance criterion
    assert.deepEqual(
      result.manifest.missing_required,
      [],
      `missing_required must be [] — got: [${result.manifest.missing_required.join(', ')}]`
    );

    assert.equal(result.manifest.process_id, enrichedPir.process_id, 'manifest.process_id must match fixture');
    assert.ok(result.manifest.artifacts.length >= 5, 'manifest.artifacts must list at least 5 entries');

    const requiredEntries = result.manifest.artifacts.filter(a => a.status === 'present');
    assert.ok(requiredEntries.length >= 5, 'all required artifacts must be present');

  } finally {
    rmSync(bundleDir, { recursive: true, force: true });
  }
});
