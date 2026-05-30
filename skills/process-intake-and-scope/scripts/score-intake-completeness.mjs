/**
 * score-intake-completeness.mjs
 * Scores a PIR on a 0-100 scale and determines readiness for narrative authoring.
 * Pure ESM, no external dependencies.
 *
 * Usage: node scripts/score-intake-completeness.mjs <pir.yaml>
 * Exports: scoreIntakeCompleteness(pir: object): { valid, errors[], warnings[], score, ready_for_narrative, breakdown }
 */

// ─── Scoring weights ──────────────────────────────────────────────────────────

const WEIGHTS = {
  process_name:       5,   // Basic identification
  trigger:           10,   // Process start condition
  actors:            15,   // Role coverage (at least 2 with initiator + performer/approver)
  inputs:            10,   // Input artifacts
  outputs:           10,   // Output artifacts
  steps:             15,   // Activity sequence (at least 3 steps)
  exceptions:        10,   // Exception paths
  business_rules:    10,   // Governing rules
  systems:            5,   // System touchpoints
  controls:           5,   // Control points
  elicitation_method: 5,   // Elicitation traceability
};

// Total: 100

const HANDOFF_THRESHOLD = 70;

// ─── Scorer ───────────────────────────────────────────────────────────────────

function isNonEmpty(v) {
  return v !== null && v !== undefined && v !== '';
}

function isPopulatedArray(v, minLength = 1) {
  if (!Array.isArray(v) || v.length < minLength) return false;
  return v.every(item => item !== null && item !== undefined);
}

/**
 * Score a parsed PIR object.
 * @param {object} pir
 * @returns {{ score: number, ready_for_narrative: boolean, breakdown: object, warnings: string[] }}
 */
export function scoreIntakeCompleteness(pir) {
  const warnings = [];
  const breakdown = {};
  let totalScore = 0;

  if (!pir || typeof pir !== 'object') {
    const err = 'Input is not a valid object';
    return { valid: false, errors: [err], warnings: [], score: 0, ready_for_narrative: false, breakdown: {} };
  }

  // process_name (5 pts)
  const nameScore = isNonEmpty(pir.process_name) ? WEIGHTS.process_name : 0;
  breakdown.process_name = { earned: nameScore, possible: WEIGHTS.process_name };
  totalScore += nameScore;

  // elicitation_method (5 pts)
  const elicitScore = isNonEmpty(pir.elicitation_method) ? WEIGHTS.elicitation_method : 0;
  breakdown.elicitation_method = { earned: elicitScore, possible: WEIGHTS.elicitation_method };
  totalScore += elicitScore;

  // trigger (10 pts) — full points only if both description and event_type are present
  let triggerScore = 0;
  if (pir.trigger && typeof pir.trigger === 'object') {
    const hasDesc = isNonEmpty(pir.trigger.description);
    const hasType = isNonEmpty(pir.trigger.event_type);
    if (hasDesc && hasType) {
      triggerScore = WEIGHTS.trigger;
    } else if (hasDesc || hasType) {
      triggerScore = Math.floor(WEIGHTS.trigger / 2);
      warnings.push('trigger is partially populated — both description and event_type are needed for full points');
    }
  }
  breakdown.trigger = { earned: triggerScore, possible: WEIGHTS.trigger };
  totalScore += triggerScore;

  // actors (15 pts) — full points require ≥2 actors with initiator + performer/approver
  let actorScore = 0;
  if (isPopulatedArray(pir.actors, 1)) {
    const hasInitiator = pir.actors.some(a => a.type === 'initiator');
    const hasPerformerOrApprover = pir.actors.some(a => a.type === 'performer' || a.type === 'approver');
    const hasMinCount = pir.actors.length >= 2;
    if (hasInitiator && hasPerformerOrApprover && hasMinCount) {
      actorScore = WEIGHTS.actors;
    } else if (pir.actors.length >= 1) {
      actorScore = Math.floor(WEIGHTS.actors / 2);
      if (!hasInitiator) warnings.push('No initiator role identified in actors');
      if (!hasPerformerOrApprover) warnings.push('No performer or approver role identified in actors');
      if (!hasMinCount) warnings.push('At least 2 actors are required for a complete PIR');
    }
  } else {
    warnings.push('actors array is missing or empty');
  }
  breakdown.actors = { earned: actorScore, possible: WEIGHTS.actors };
  totalScore += actorScore;

  // inputs (10 pts) — full points require ≥1 input with id and name
  let inputScore = 0;
  if (isPopulatedArray(pir.inputs, 1)) {
    const validInputs = pir.inputs.filter(i => isNonEmpty(i.id) && isNonEmpty(i.name));
    if (validInputs.length >= 1) {
      inputScore = WEIGHTS.inputs;
    }
  } else {
    warnings.push('inputs array is missing or empty');
  }
  breakdown.inputs = { earned: inputScore, possible: WEIGHTS.inputs };
  totalScore += inputScore;

  // outputs (10 pts) — full points require ≥1 output with id and name
  let outputScore = 0;
  if (isPopulatedArray(pir.outputs, 1)) {
    const validOutputs = pir.outputs.filter(o => isNonEmpty(o.id) && isNonEmpty(o.name));
    if (validOutputs.length >= 1) {
      outputScore = WEIGHTS.outputs;
    }
  } else {
    warnings.push('outputs array is missing or empty');
  }
  breakdown.outputs = { earned: outputScore, possible: WEIGHTS.outputs };
  totalScore += outputScore;

  // steps (15 pts) — full points require ≥3 steps; partial for 1-2
  let stepScore = 0;
  if (isPopulatedArray(pir.steps, 1)) {
    const validSteps = pir.steps.filter(s => isNonEmpty(s.id) && isNonEmpty(s.description) && isNonEmpty(s.actor_role_id));
    if (validSteps.length >= 3) {
      stepScore = WEIGHTS.steps;
    } else if (validSteps.length >= 1) {
      stepScore = Math.floor(WEIGHTS.steps * validSteps.length / 3);
      warnings.push(`Only ${validSteps.length} valid step(s) found — at least 3 required for full points`);
    }
  } else {
    warnings.push('steps array is missing or empty');
  }
  breakdown.steps = { earned: stepScore, possible: WEIGHTS.steps };
  totalScore += stepScore;

  // exceptions (10 pts) — full points require ≥1 exception
  let exceptionScore = 0;
  if (isPopulatedArray(pir.exceptions, 1)) {
    const validExceptions = pir.exceptions.filter(e => isNonEmpty(e.id) && isNonEmpty(e.description));
    if (validExceptions.length >= 1) {
      exceptionScore = WEIGHTS.exceptions;
    }
  } else {
    warnings.push('exceptions array is missing or empty — exception paths should be captured');
  }
  breakdown.exceptions = { earned: exceptionScore, possible: WEIGHTS.exceptions };
  totalScore += exceptionScore;

  // business_rules (10 pts) — full points require ≥1 rule
  let ruleScore = 0;
  if (isPopulatedArray(pir.business_rules, 1)) {
    const validRules = pir.business_rules.filter(r => isNonEmpty(r.id) && isNonEmpty(r.description));
    if (validRules.length >= 1) {
      ruleScore = WEIGHTS.business_rules;
    }
  } else {
    warnings.push('business_rules array is missing or empty — governing rules should be captured');
  }
  breakdown.business_rules = { earned: ruleScore, possible: WEIGHTS.business_rules };
  totalScore += ruleScore;

  // systems (5 pts) — full points require ≥1 system with name
  let systemScore = 0;
  if (isPopulatedArray(pir.systems, 1)) {
    const validSystems = pir.systems.filter(s => isNonEmpty(s.name));
    if (validSystems.length >= 1) {
      systemScore = WEIGHTS.systems;
    }
  } else {
    warnings.push('systems array is missing or empty');
  }
  breakdown.systems = { earned: systemScore, possible: WEIGHTS.systems };
  totalScore += systemScore;

  // controls (5 pts) — full points require ≥1 control
  let controlScore = 0;
  if (isPopulatedArray(pir.controls, 1)) {
    const validControls = pir.controls.filter(c => isNonEmpty(c.id) && isNonEmpty(c.description));
    if (validControls.length >= 1) {
      controlScore = WEIGHTS.controls;
    }
  } else {
    warnings.push('controls array is missing or empty');
  }
  breakdown.controls = { earned: controlScore, possible: WEIGHTS.controls };
  totalScore += controlScore;

  const ready = totalScore >= HANDOFF_THRESHOLD;
  if (!ready) {
    warnings.push(`Score ${totalScore} is below the handoff threshold of ${HANDOFF_THRESHOLD}. Address gaps before passing to okhp3-process-narrative.`);
  }

  return {
    valid: true,
    errors: [],
    warnings,
    score: totalScore,
    ready_for_narrative: ready,
    breakdown,
  };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('score-intake-completeness.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/score-intake-completeness.mjs <pir.yaml>');
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
    const result = scoreIntakeCompleteness(pir);
    console.log(`Completeness Score: ${result.score}/100`);
    console.log(`Ready for Narrative: ${result.ready_for_narrative ? 'YES' : 'NO'}`);
    console.log('\nBreakdown:');
    for (const [section, { earned, possible }] of Object.entries(result.breakdown)) {
      const bar = '█'.repeat(earned) + '░'.repeat(possible - earned);
      console.log(`  ${section.padEnd(20)} ${String(earned).padStart(3)}/${possible} ${bar}`);
    }
    if (result.warnings.length > 0) {
      console.log(`\nWarnings (${result.warnings.length}):`);
      result.warnings.forEach(w => console.log(`  • ${w}`));
    }
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
