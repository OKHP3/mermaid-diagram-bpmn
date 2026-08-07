/**
 * bpmn-validate.ts
 *
 * Post-parse semantic validation pass for bpmn-beta diagrams.
 *
 * Runs AFTER a successful parse() and detects structural violations that
 * the parser accepts but that produce diagrams that are semantically incorrect
 * in BPMN 2.0 terms. Unlike advisory lint warnings (bpmn-lint.ts), validation
 * errors flag definite structural problems — references to undeclared nodes,
 * sequence flows crossing pool boundaries, disconnected nodes, and gateways
 * acting simultaneously as split and join.
 *
 * Violations are surfaced in the Playground warning panel alongside the
 * rendered diagram. They do not block rendering.
 *
 * Extension point
 * ────────────────
 * To add a new validation rule:
 *   1. Add a code to ValidationErrorCode.
 *   2. Write a rule function: (db: BpmnDb) => ValidationError[].
 *   3. Register it in RULES at the bottom of this file.
 *   4. Add a fixture test in __tests__/bpmn-validate.test.ts.
 */

import type { BpmnDb, BpmnFlow } from './bpmn-db';

// ── Error codes ───────────────────────────────────────────────────────────────

/**
 * Structured codes for each class of semantic validation violation.
 * These are distinct from ParseErrorCode (structural parse failures) and
 * LintWarningCode (advisory domain-rule warnings).
 */
export type ValidationErrorCode =
  /** A flow references a source or target node ID that was never declared. */
  | 'UNDEFINED_NODE_REF'
  /** A node has no incoming AND no outgoing flows — it is unreachable and leads nowhere. */
  | 'ORPHAN_NODE'
  /** A sequence/conditional/default flow connects nodes that belong to different pools. */
  | 'CROSS_POOL_SEQUENCE_FLOW'
  /** A gateway simultaneously acts as a split (>1 out) and a join (>1 in). */
  | 'UNBALANCED_GATEWAY';

// ── Error type ────────────────────────────────────────────────────────────────

export interface ValidationError {
  /** Structured code for programmatic handling and test assertions. */
  readonly code: ValidationErrorCode;
  /** Human-readable message suitable for display in the Playground. */
  readonly message: string;
  /** ID of the offending node, when the error is node-scoped. */
  readonly nodeId?: string;
  /** ID of the offending flow, when the error is flow-scoped. */
  readonly flowId?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** The flow kinds that form the primary process sequence. Message flows cross
 *  pool boundaries by design and are excluded from connectivity and pool checks. */
const SEQUENCE_KINDS: ReadonlySet<BpmnFlow['kind']> = new Set([
  'sequence', 'conditional', 'default',
]);

// ── Validation rules ──────────────────────────────────────────────────────────

type ValidationRule = (db: BpmnDb) => ValidationError[];

/**
 * UNDEFINED_NODE_REF
 *
 * A flow whose source or target ID does not correspond to any declared node.
 * The renderer cannot draw an arrow to a ghost element, producing a broken
 * diagram silently. The parser accepts these because flow lines are parsed
 * independently of node declarations.
 */
const ruleUndefinedNodeRef: ValidationRule = (db) => {
  const nodeIds = new Set(db.getNodes().map(n => n.id));
  const errors: ValidationError[] = [];

  for (const flow of db.getFlows()) {
    if (!nodeIds.has(flow.source)) {
      errors.push({
        code: 'UNDEFINED_NODE_REF',
        message: `Flow references undefined source node "${flow.source}". Check that every node ID in a flow line is declared before use.`,
        flowId: flow.id,
      });
    }
    if (!nodeIds.has(flow.target)) {
      errors.push({
        code: 'UNDEFINED_NODE_REF',
        message: `Flow references undefined target node "${flow.target}". Check that every node ID in a flow line is declared before use.`,
        flowId: flow.id,
      });
    }
  }

  return errors;
};

/**
 * ORPHAN_NODE
 *
 * A node with zero incoming AND zero outgoing process flows is disconnected
 * from the diagram — unreachable and leading nowhere. It renders as a
 * floating element that misleads readers into thinking it is part of the flow.
 *
 * Only sequence/conditional/default flows count for connectivity. Message flows
 * cross pool boundaries and are not part of a pool's internal process path.
 *
 * Note: a start event with no incoming flows is normal (start events have no
 * predecessors). Likewise, an end event with no outgoing flows is normal. A
 * node is flagged only when BOTH incoming and outgoing counts are zero.
 */
const ruleOrphanNode: ValidationRule = (db) => {
  const processFlows = db.getFlows().filter(f => SEQUENCE_KINDS.has(f.kind));
  const hasInflow = new Set(processFlows.map(f => f.target));
  const hasOutflow = new Set(processFlows.map(f => f.source));

  return db.getNodes()
    .filter(n => !hasInflow.has(n.id) && !hasOutflow.has(n.id))
    .map(n => ({
      code: 'ORPHAN_NODE' as const,
      message: `Node "${n.label || n.id}" (${n.kind}) has no incoming or outgoing flows and is disconnected from the process. Connect it to the flow or remove it.`,
      nodeId: n.id,
    }));
};

/**
 * CROSS_POOL_SEQUENCE_FLOW
 *
 * A sequence, conditional, or default flow that connects nodes in different
 * pools violates BPMN 2.0 semantics. Cross-pool communication must use message
 * flows (~~>). Using a sequence flow across pool boundaries is a common
 * authoring error that produces a structurally incorrect model.
 *
 * The rule only fires when both nodes are explicitly assigned to pools. Nodes
 * without a poolId (top-level nodes in a single-process diagram) are skipped.
 */
const ruleCrossPoolSequenceFlow: ValidationRule = (db) => {
  const nodeById = new Map(db.getNodes().map(n => [n.id, n]));
  const errors: ValidationError[] = [];

  for (const flow of db.getFlows()) {
    if (!SEQUENCE_KINDS.has(flow.kind)) continue;

    const src = nodeById.get(flow.source);
    const tgt = nodeById.get(flow.target);

    if (!src?.poolId || !tgt?.poolId) continue;     // top-level or undefined nodes
    if (src.poolId === tgt.poolId) continue;         // same pool — ok

    errors.push({
      code: 'CROSS_POOL_SEQUENCE_FLOW',
      message: `Sequence flow from "${src.label || src.id}" (pool "${src.poolId}") to "${tgt.label || tgt.id}" (pool "${tgt.poolId}") crosses pool boundaries. Use a message flow (~~>) for cross-pool communication.`,
      flowId: flow.id,
    });
  }

  return errors;
};

/**
 * UNBALANCED_GATEWAY
 *
 * A gateway with more than one incoming flow AND more than one outgoing flow is
 * acting simultaneously as a join and a split — a "complex" or "mixed" gateway.
 * This pattern is almost always an authoring error: the author intended a join
 * gateway (N → 1) followed by a separate split gateway (1 → M), not a single
 * node doing both.
 *
 * Only sequence/conditional/default flows are counted. Message flows entering
 * a gateway (unusual but valid for event-based gateways) are excluded to avoid
 * false positives on cross-pool patterns.
 */
const ruleUnbalancedGateway: ValidationRule = (db) => {
  const processFlows = db.getFlows().filter(f => SEQUENCE_KINDS.has(f.kind));
  const errors: ValidationError[] = [];

  for (const node of db.getNodes()) {
    if (node.kind !== 'gateway') continue;

    const inCount = processFlows.filter(f => f.target === node.id).length;
    const outCount = processFlows.filter(f => f.source === node.id).length;

    if (inCount > 1 && outCount > 1) {
      errors.push({
        code: 'UNBALANCED_GATEWAY',
        message: `Gateway "${node.label || node.id}" has ${inCount} incoming and ${outCount} outgoing flows, acting as both a join and a split. Separate this into a join gateway followed by a distinct split gateway.`,
        nodeId: node.id,
      });
    }
  }

  return errors;
};

// ── Rule registry ─────────────────────────────────────────────────────────────

const RULES: ValidationRule[] = [
  ruleUndefinedNodeRef,
  ruleOrphanNode,
  ruleCrossPoolSequenceFlow,
  ruleUnbalancedGateway,
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run all semantic validation rules against `db` and return combined errors.
 *
 * Call after a successful `parse()`. If the parse threw, skip this — parse
 * errors already surface in the Playground error panel and the db is incomplete.
 *
 * @returns An array of `ValidationError` objects. Empty array when the diagram
 *   is structurally valid. Never throws — a misbehaving rule is caught and
 *   skipped so one bad rule cannot crash the Playground.
 */
export function validate(db: BpmnDb): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const rule of RULES) {
    try {
      errors.push(...rule(db));
    } catch {
      // A rule that throws must never crash the Playground rendering cycle.
    }
  }
  return errors;
}
