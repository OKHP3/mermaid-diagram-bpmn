#!/usr/bin/env node
/**
 * generate-question-plan.mjs
 * Generates a structured elicitation question plan from a PIR.
 * Targets known gaps and open_questions with typed, section-mapped questions.
 *
 * Usage: node generate-question-plan.mjs <pir.yaml>
 * Named exports: generateQuestionPlan(pir) → { valid, errors, warnings, plan }
 */

/**
 * @param {object} pir - Parsed PIR object (from pir.yaml)
 * @returns {{ valid: boolean, errors: string[], warnings: string[], plan: object }}
 */
export function generateQuestionPlan(pir) {
  const errors = [];
  const warnings = [];

  if (!pir || typeof pir !== 'object') {
    errors.push('pir must be a non-null object');
    return { valid: false, errors, warnings, plan: null };
  }

  const processId = pir.process_id || '';
  if (!processId) warnings.push('pir.process_id is empty');

  const questions = [];
  let qIndex = 1;

  function addQ(section, type, question, probe, expectedOutput) {
    questions.push({
      id: `q-${String(qIndex++).padStart(3, '0')}`,
      section,
      type,
      question,
      probe,
      expected_output: expectedOutput,
    });
  }

  // Always add trigger question
  if (!pir.trigger?.description) {
    addQ(
      'trigger',
      'context',
      'What causes this process to start — a person doing something, a scheduled date, an incoming message, or a system event?',
      "What is the observable event that makes you say 'the process has started'?",
      'trigger.description and trigger.event_type'
    );
  }

  // Actors
  const actors = Array.isArray(pir.actors) ? pir.actors : [];
  const hasInitiator = actors.some(a => a.type === 'initiator');
  const hasPerformerOrApprover = actors.some(a => a.type === 'performer' || a.type === 'approver');

  if (!hasInitiator || !hasPerformerOrApprover) {
    addQ(
      'actors',
      'role',
      'Who is involved — who does work, makes decisions, or needs to know the outcome?',
      'For each person: what do they do, what decisions do they make, and do they need to approve anything?',
      'actors[] entries'
    );
  }

  // Inputs
  const inputs = Array.isArray(pir.inputs) ? pir.inputs : [];
  if (inputs.length === 0) {
    addQ(
      'inputs',
      'artefact',
      'What does this process need to begin — what document, data, or signal must be in hand before the first step?',
      'What happens if that input arrives late or incomplete?',
      'inputs[] entries'
    );
  }

  // Steps
  const steps = Array.isArray(pir.steps) ? pir.steps : [];
  if (steps.length < 3) {
    addQ(
      'steps',
      'sequence',
      'Walk me through what happens, step by step, from the moment the process starts to when it is complete.',
      'After each step: who does this, what system do they use, and what do they hand off?',
      'steps[] entries (minimum 3)'
    );
  }

  // Exceptions
  const exceptions = Array.isArray(pir.exceptions) ? pir.exceptions : [];
  if (exceptions.length === 0) {
    addQ(
      'exceptions',
      'edge-case',
      'What can go wrong? Tell me about the last time this process did not run smoothly.',
      'What triggered the problem, and what did you have to do to recover?',
      'exceptions[] entries'
    );
  }

  // Business rules
  const rules = Array.isArray(pir.business_rules) ? pir.business_rules : [];
  if (rules.length === 0) {
    addQ(
      'business_rules',
      'constraint',
      'Are there any rules, policies, or regulations that govern how this process must be done?',
      "Is there a written policy, a regulation, or a contract clause that forces you to do it this way?",
      'business_rules[] entries'
    );
  }

  // Open questions from PIR
  const openQs = Array.isArray(pir.open_questions) ? pir.open_questions : [];
  for (const oq of openQs) {
    if (oq.question) {
      addQ('open_question', 'follow-up', oq.question, '', `resolution of ${oq.id || 'open question'}`);
    }
  }

  if (questions.length === 0) {
    warnings.push('No gap-targeted questions generated — PIR appears complete');
  }

  const plan = {
    question_plan_version: '0.1',
    process_id: processId,
    generated_from: 'pir.yaml',
    question_count: questions.length,
    questions,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    plan,
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const { readFileSync } = await import('node:fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node generate-question-plan.mjs <pir.yaml>');
    process.exit(1);
  }
  const raw = readFileSync(filePath, 'utf8');
  const pir = { process_id: raw.match(/process_id:\s*(\S+)/)?.[1] || '' };
  const result = generateQuestionPlan(pir);
  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
  console.log(JSON.stringify(result.plan, null, 2));
}
