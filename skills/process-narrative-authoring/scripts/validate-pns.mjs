/**
 * validate-pns.mjs
 * Applies V1–V7 validation rules to a Process Narrative Specification (PNS).
 * No external dependencies — pure ESM, runs with Node.js built-ins.
 *
 * Usage: node scripts/validate-pns.mjs <pns.yaml>
 * Export: validatePns(pns: object) => { valid, errors[], warnings[], rules_fired[] }
 */

import { loadFile } from './parse-yaml-minimal.mjs';

const REQUIRED_TOP_LEVEL = ['pns_version', 'process_id', 'process_name', 'process_owner_role_id', 'version', 'status'];
const VALID_STATUSES = [
  'draft-intake',
  'scoped',
  'elicited',
  'documented-as-is',
  'modeled',
  'analyzed',
  'validated',
  'packaged',
  'published',
];
const REQUIRED_SECTIONS = [
  'process_box', 'activity_sequence', 'roles_and_raci',
  'business_rules', 'decision_points', 'exception_paths',
  'kpis', 'systems_and_integrations', 'controls_and_compliance',
  'open_questions', 'revision_history', 'validation',
];
const BABOK_FIELDS = ['change', 'need', 'solution', 'stakeholders', 'value', 'context'];
const SUBORDINATE_CONJUNCTIONS = ['When ', 'If ', 'After ', 'Before ', 'Once ', 'While '];

/**
 * Validate a parsed PNS object against V1–V7 rules.
 * @param {object} pns
 * @returns {{ valid: boolean, errors: string[], warnings: string[], rules_fired: string[] }}
 */
export function validatePns(pns) {
  const errors = [];
  const warnings = [];
  const rules_fired = [];

  if (!pns || typeof pns !== 'object') {
    errors.push('[V1] PNS is not a valid object');
    return { valid: false, errors, warnings, rules_fired: ['V1'] };
  }

  // ─── V1: Schema Completeness ──────────────────────────────────────────────
  rules_fired.push('V1');

  for (const field of REQUIRED_TOP_LEVEL) {
    const val = pns[field];
    if (val === undefined || val === null || val === '') {
      errors.push(`[V1] Missing required field: ${field}`);
    }
  }

  if (pns.status && !VALID_STATUSES.includes(String(pns.status))) {
    errors.push(`[V1] status must be one of: ${VALID_STATUSES.join(', ')} — got "${pns.status}"`);
  }

  const babok = pns.babok_core_concepts || {};
  const populatedBabok = BABOK_FIELDS.filter((f) => babok[f] && String(babok[f]).trim().length >= 20);
  if (populatedBabok.length < 4) {
    errors.push(`[V1] babok_core_concepts requires at least 4 of 6 fields populated (≥20 chars each) — found ${populatedBabok.length}`);
  }

  const sections = pns.sections || {};
  for (const sectionKey of REQUIRED_SECTIONS) {
    if (!Object.prototype.hasOwnProperty.call(sections, sectionKey)) {
      errors.push(`[V1] Missing required section: sections.${sectionKey}`);
    }
  }

  // ─── V2: Traceability ─────────────────────────────────────────────────────
  rules_fired.push('V2');

  const activities = (sections.activity_sequence && sections.activity_sequence.activities) || [];
  const definedRoleIds = new Set(
    ((sections.roles_and_raci && sections.roles_and_raci.roles) || [])
      .map((r) => r && r.role_id ? String(r.role_id).trim() : '')
      .filter(Boolean)
  );

  for (const act of activities) {
    const desc = String(act.description || '').trim();
    if (!desc) {
      errors.push(`[V2] Activity "${act.id || '(no id)'}" is missing a description`);
    } else if (desc.length < 10) {
      errors.push(`[V2] Activity "${act.id || '(no id)'}" description is too short to be substantive (< 10 chars)`);
    }
    const roleId = String(act.actor_role_id || '').trim();
    if (!roleId) {
      errors.push(`[V2] Activity "${act.id || '(no id)'}" is missing actor_role_id`);
    } else if (definedRoleIds.size > 0 && !definedRoleIds.has(roleId)) {
      errors.push(`[V2] Activity "${act.id || '(no id)'}" actor_role_id "${roleId}" is not defined in roles_and_raci.roles`);
    }
  }

  const businessRules = Array.isArray(sections.business_rules) ? sections.business_rules : [];
  for (const rule of businessRules) {
    if (!rule.source || String(rule.source).trim() === '') {
      errors.push(`[V2] Business rule "${rule.id || '(no id)'}" is missing a source citation`);
    }
  }

  // ─── V3: RACI Integrity ───────────────────────────────────────────────────
  rules_fired.push('V3');

  const raciData = sections.roles_and_raci || {};
  const raciMatrix = Array.isArray(raciData.raci_matrix) ? raciData.raci_matrix : [];
  const raciActivityIds = new Set(raciMatrix.map((r) => r.activity_id));
  const activityIds = activities.map((a) => a.id).filter(Boolean);

  for (const entry of raciMatrix) {
    if (!entry.accountable || String(entry.accountable).trim() === '') {
      errors.push(`[V3] RACI entry for activity "${entry.activity_id || '(no id)'}" is missing an Accountable role`);
    }
    const responsible = Array.isArray(entry.responsible) ? entry.responsible : [];
    const validResponsible = responsible.filter((r) => r && String(r).trim() !== '');
    if (validResponsible.length === 0) {
      errors.push(`[V3] RACI entry for activity "${entry.activity_id || '(no id)'}" has no Responsible role`);
    }
  }

  for (const id of activityIds) {
    if (!raciActivityIds.has(id)) {
      errors.push(`[V3] Activity "${id}" has no RACI entry`);
    }
  }

  // All defined roles must appear somewhere in the RACI matrix (R, A, C, or I)
  if (raciMatrix.length > 0 && definedRoleIds.size > 0) {
    const rolesInMatrix = new Set();
    for (const entry of raciMatrix) {
      if (entry.accountable) rolesInMatrix.add(String(entry.accountable).trim());
      for (const r of (Array.isArray(entry.responsible) ? entry.responsible : [])) {
        if (r) rolesInMatrix.add(String(r).trim());
      }
      for (const r of (Array.isArray(entry.consulted) ? entry.consulted : [])) {
        if (r) rolesInMatrix.add(String(r).trim());
      }
      for (const r of (Array.isArray(entry.informed) ? entry.informed : [])) {
        if (r) rolesInMatrix.add(String(r).trim());
      }
    }
    for (const roleId of definedRoleIds) {
      if (!rolesInMatrix.has(roleId)) {
        errors.push(`[V3] Role "${roleId}" is defined in roles_and_raci.roles but does not appear in any RACI entry`);
      }
    }
  }

  // ─── V4: Singular Activity Statements (warning) ───────────────────────────
  rules_fired.push('V4');

  for (const act of activities) {
    const desc = String(act.description || '');
    if (desc.includes(';')) {
      warnings.push(`[V4] Activity "${act.id}" description contains a semicolon — consider splitting into separate activities`);
    }
    if (desc.length > 200) {
      warnings.push(`[V4] Activity "${act.id}" description exceeds 200 characters — may be a compound statement`);
    }
    for (const conj of SUBORDINATE_CONJUNCTIONS) {
      if (desc.startsWith(conj)) {
        warnings.push(`[V4] Activity "${act.id}" description starts with subordinate conjunction "${conj.trim()}" — use an imperative verb`);
        break;
      }
    }
  }

  // ─── V5: Verifiable KPIs ─────────────────────────────────────────────────
  rules_fired.push('V5');

  const kpis = Array.isArray(sections.kpis) ? sections.kpis : [];
  for (const kpi of kpis) {
    if (!kpi.formula || String(kpi.formula).trim() === '') {
      errors.push(`[V5] KPI "${kpi.id || kpi.name || '(no id)'}" is missing a formula`);
    }
    if (!kpi.data_source || String(kpi.data_source).trim() === '') {
      errors.push(`[V5] KPI "${kpi.id || kpi.name || '(no id)'}" is missing a data_source`);
    }
  }

  // ─── V6: Exception and Decision Coverage ─────────────────────────────────
  rules_fired.push('V6');

  const decisionPoints = Array.isArray(sections.decision_points) ? sections.decision_points : [];
  const exceptionPaths = Array.isArray(sections.exception_paths) ? sections.exception_paths : [];
  const activityIdSet = new Set(activityIds);

  // If decision points exist, at least one exception path must be documented
  if (decisionPoints.length > 0 && exceptionPaths.length === 0) {
    errors.push('[V6] Process has decision points but no exception paths — document at least one exception path');
  }

  for (const dp of decisionPoints) {
    const outcomes = Array.isArray(dp.outcomes) ? dp.outcomes : [];
    if (outcomes.length < 2) {
      errors.push(`[V6] Decision point "${dp.id || '(no id)'}" must have at least 2 outcomes — found ${outcomes.length}`);
    }
    // Each outcome with a next_activity must reference an existing activity
    for (const outcome of outcomes) {
      const nextAct = outcome && outcome.next_activity ? String(outcome.next_activity).trim() : '';
      if (nextAct && !activityIdSet.has(nextAct)) {
        errors.push(`[V6] Decision "${dp.id || '(no id)'}" outcome "${outcome.label || ''}" references unknown activity "${nextAct}"`);
      }
    }
  }

  for (const ep of exceptionPaths) {
    if (!ep.handling || String(ep.handling).trim() === '') {
      errors.push(`[V6] Exception path "${ep.id || '(no id)'}" is missing a handling procedure`);
    }
  }

  // ─── V7: Controls Coverage (warning) ─────────────────────────────────────
  rules_fired.push('V7');

  const controls = Array.isArray(sections.controls_and_compliance) ? sections.controls_and_compliance : [];
  if (controls.length === 0) {
    warnings.push('[V7] controls_and_compliance is empty — add at least one control or document a waiver');
  } else {
    const coveredActivities = new Set();
    let hasGlobalWaiver = false;
    for (const ctrl of controls) {
      const covered = Array.isArray(ctrl.activities_covered) ? ctrl.activities_covered : [];
      for (const id of covered) coveredActivities.add(id);
      if (ctrl.waiver && String(ctrl.waiver).trim() !== '') hasGlobalWaiver = true;
    }
    if (!hasGlobalWaiver) {
      for (const id of activityIds) {
        if (!coveredActivities.has(id)) {
          warnings.push(`[V7] Activity "${id}" is not covered by any control entry`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    rules_fired,
  };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('validate-pns.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/validate-pns.mjs <pns.yaml>');
    console.log('Validates a PNS file against V1–V7 rules.');
    process.exit(0);
  }
  loadFile(file).then((pns) => {
    const result = validatePns(pns);
    if (result.valid) {
      console.log('PNS Validation: PASS');
    } else {
      console.log(`PNS Validation: FAIL (${result.errors.length} error(s), ${result.warnings.length} warning(s))`);
    }
    console.log(`Rules fired: [${result.rules_fired.join(', ')}]`);
    if (result.errors.length > 0) {
      console.log('Errors:');
      result.errors.forEach((e) => console.log(`  ${e}`));
    }
    if (result.warnings.length > 0) {
      console.log('Warnings:');
      result.warnings.forEach((w) => console.log(`  ${w}`));
    }
    process.exit(result.valid ? 0 : 1);
  }).catch((err) => {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  });
}
