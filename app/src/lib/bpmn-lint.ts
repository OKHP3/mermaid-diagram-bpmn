/**
 * bpmn-lint.ts
 *
 * Domain-rule lint pass for bpmn-beta diagrams.
 *
 * The lint pass runs AFTER a successful parse and returns advisory warnings
 * for things the parser accepts but that produce semantically questionable
 * diagrams. Warnings are distinct from ParseErrors:
 *   - They never block rendering — the diagram still appears.
 *   - They carry the label "Warning" (not "Error") in the UI.
 *   - They are shown in a visually separate, amber-tinted panel.
 *
 * Extension point
 * ────────────────
 * To add a new lint rule:
 *   1. Add a new code to `LintWarningCode` (keeps the union exhaustive).
 *   2. Write a rule function with the signature `(db: BpmnDb) => LintWarning[]`.
 *      Return `[]` when the rule finds no violation.  Never throw.  Never
 *      mutate `db`.
 *   3. Register the function in the `RULES` array near the bottom of this
 *      file.  Rules in the array are evaluated in order; that order controls
 *      how warnings appear in the Playground UI.
 *   4. Add at least one fixture test in `__tests__/bpmn-lint.test.ts`.
 */

import type { BpmnDb } from './bpmn-db';

// ── Warning codes ─────────────────────────────────────────────────────────────

/**
 * Structured codes emitted by the bpmn-beta lint pass.
 * Each code maps to exactly one lint rule.
 */
export type LintWarningCode =
  /** A pool block declares no lanes — swimlane structure is empty. */
  | 'POOL_NO_LANES'
  /** A gateway has fewer than 2 outgoing flows — branching has no effect. */
  | 'GATEWAY_SINGLE_OUTFLOW'
  /** The process has tasks or gateways but no start event. */
  | 'NO_START_EVENT'
  /** The process has tasks or gateways but no end event. */
  | 'NO_END_EVENT';

// ── Warning type ──────────────────────────────────────────────────────────────

/**
 * An advisory lint warning for a bpmn-beta diagram.
 *
 * Warnings never block rendering — they are shown alongside the rendered
 * diagram to guide the author towards a semantically correct model.
 *
 * @example
 * ```typescript
 * import { parse } from './bpmn-parser';
 * import { lint } from './bpmn-lint';
 *
 * const db = parse(source);
 * const warnings = lint(db);
 * for (const w of warnings) {
 *   console.warn(`[${w.code}] ${w.message}`);
 * }
 * ```
 */
export interface LintWarning {
  /** Structured code for programmatic handling. */
  readonly code: LintWarningCode;
  /** Human-readable advisory message for display in the Playground UI. */
  readonly message: string;
  /**
   * ID of the pool or node the warning relates to, if applicable.
   * Absent for process-level warnings (e.g. NO_START_EVENT).
   */
  readonly nodeId?: string;
}

// ── Internal rule type ────────────────────────────────────────────────────────

type LintRule = (db: BpmnDb) => LintWarning[];

// ── Rule implementations ──────────────────────────────────────────────────────

/**
 * POOL_NO_LANES
 *
 * A pool block with no lane declarations is legal syntax but produces a
 * featureless container that adds visual noise without conveying any
 * responsibility assignments. Pools exist to partition a process into
 * swimlanes; a laneless pool is almost always an authoring error.
 */
const rulePoolNoLanes: LintRule = (db) =>
  db.getPools()
    .filter((pool) => pool.laneIds.length === 0)
    .map((pool) => ({
      code: 'POOL_NO_LANES' as const,
      message: `Pool "${pool.label}" has no lane declarations. Add at least one lane block to structure tasks into swimlanes, or remove the pool block.`,
      nodeId: pool.id,
    }));

/**
 * GATEWAY_SINGLE_OUTFLOW
 *
 * XOR, OR, and AND gateways are routing constructs — they exist to branch a
 * flow between two or more alternative paths. A gateway with fewer than two
 * outgoing flows does not branch anything and is almost always an authoring
 * error (a missing second branch) or a node that should be a task instead.
 */
const ruleGatewaySingleOutflow: LintRule = (db) => {
  const flows = db.getFlows();
  return db.getNodes()
    .filter((n) => n.kind === 'gateway')
    .flatMap((gw) => {
      const outCount = flows.filter((f) => f.source === gw.id).length;
      if (outCount >= 2) return [];
      return [{
        code: 'GATEWAY_SINGLE_OUTFLOW' as const,
        message:
          `Gateway "${gw.label || gw.id}" has ${outCount === 0 ? 'no' : 'only one'} outgoing flow. ` +
          `Add a second branch to create a meaningful route, or replace the gateway with a task.`,
        nodeId: gw.id,
      }];
    });
};

/**
 * NO_START_EVENT
 *
 * BPMN requires every process to have a well-defined entry point. A diagram
 * that contains executable elements (tasks, gateways) without a start event
 * is missing its trigger and cannot be understood as a complete process.
 *
 * This rule only fires when the diagram has at least one task or gateway node;
 * a diagram with only events (e.g. a pure event chain) is exempt.
 */
const ruleNoStartEvent: LintRule = (db) => {
  const nodes = db.getNodes();
  const hasExecutable = nodes.some((n) => n.kind === 'task' || n.kind === 'gateway');
  if (!hasExecutable) return [];
  const hasStart = nodes.some((n) => n.kind === 'event' && n.position === 'start');
  if (hasStart) return [];
  return [{
    code: 'NO_START_EVENT',
    message: 'No start event found. Add a start node (e.g. start s1 "Begin") to mark the process entry point.',
  }];
};

/**
 * NO_END_EVENT
 *
 * A process without a defined termination point is structurally incomplete.
 * Without an end event the diagram cannot clearly communicate where each
 * process path concludes.
 *
 * This rule only fires when the diagram has at least one task or gateway node;
 * a diagram with only events is exempt.
 */
const ruleNoEndEvent: LintRule = (db) => {
  const nodes = db.getNodes();
  const hasExecutable = nodes.some((n) => n.kind === 'task' || n.kind === 'gateway');
  if (!hasExecutable) return [];
  const hasEnd = nodes.some((n) => n.kind === 'event' && n.position === 'end');
  if (hasEnd) return [];
  return [{
    code: 'NO_END_EVENT',
    message: 'No end event found. Add an end node (e.g. end e1 "Done") to mark the process termination.',
  }];
};

// ── Rule registry ─────────────────────────────────────────────────────────────

/**
 * Ordered list of all active lint rules.
 *
 * Higher-signal rules (missing events) come first so they appear at the top
 * of the warning panel.  Add new rules here after implementing them above.
 */
const RULES: LintRule[] = [
  ruleNoStartEvent,
  ruleNoEndEvent,
  ruleGatewaySingleOutflow,
  rulePoolNoLanes,
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run all registered lint rules against `db` and return combined advisory
 * warnings.
 *
 * Call this after a successful `parse()`.  If the parse threw a `ParseError`,
 * skip this call entirely — parse errors take precedence in the UI and no
 * lint warnings are shown alongside them.
 *
 * @param db - A `BpmnDb` returned by `parse()`.
 * @returns An array of `LintWarning` objects.  Empty when the diagram is
 *   clean.  This function never throws — a rule that raises an exception is
 *   caught and silently skipped so the diagram always renders.
 */
export function lint(db: BpmnDb): LintWarning[] {
  const warnings: LintWarning[] = [];
  for (const rule of RULES) {
    try {
      warnings.push(...rule(db));
    } catch {
      // A misbehaving rule must never crash the Playground.
      // Swallow the error and continue — warnings are advisory.
    }
  }
  return warnings;
}
