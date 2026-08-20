/**
 * bpmn-lint.test.ts
 *
 * Unit tests for the bpmn-beta domain-rule lint pass.
 *
 * Each describe block targets one lint rule and covers:
 *   - A fixture that produces the warning (with message and code assertions)
 *   - Fixtures that must NOT produce the warning (no false positives)
 *
 * Tests deliberately parse real bpmn-beta source via `parse()` so the
 * db passed to `lint()` reflects the same state the Playground sees.
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { parse } from '../bpmn-parser';
import { lint } from '../bpmn-lint';
import type { LintWarning } from '../bpmn-lint';

// ── Helpers ───────────────────────────────────────────────────────────────────

function lintSource(source: string): LintWarning[] {
  return lint(parse(source));
}

function warningCodes(source: string) {
  return lintSource(source).map((w) => w.code);
}

// ── POOL_NO_LANES ─────────────────────────────────────────────────────────────

describe('lint rule: POOL_NO_LANES', () => {
  const POOL_WITH_NO_LANES = `bpmn-beta
pool p1 "Procurement" {
  start s1 "Start"
  task t1 "Order"
  end e1 "Done"
  s1 --> t1
  t1 --> e1
}`;

  const POOL_WITH_ONE_LANE = `bpmn-beta
pool p1 "Procurement" {
  lane l1 "Buyer" {
    start s1 "Start"
    task t1 "Order"
    end e1 "Done"
  }
  s1 --> t1
  t1 --> e1
}`;

  const TWO_POOLS_ONE_EMPTY = `bpmn-beta
pool p1 "Pool A" {
  lane l1 "Lane" {
    start s1 "Start"
    end e1 "Done"
  }
  s1 --> e1
}
pool p2 "Pool B" {
  task t1 "Task"
}`;

  it('emits POOL_NO_LANES when a pool has no lane declarations', () => {
    const warnings = lintSource(POOL_WITH_NO_LANES);
    expect(warnings.some((w) => w.code === 'POOL_NO_LANES')).toBe(true);
  });

  it('warning message mentions the pool label', () => {
    const warnings = lintSource(POOL_WITH_NO_LANES);
    const w = warnings.find((w) => w.code === 'POOL_NO_LANES');
    expect(w?.message).toContain('Procurement');
  });

  it('warning carries the pool id in nodeId', () => {
    const warnings = lintSource(POOL_WITH_NO_LANES);
    const w = warnings.find((w) => w.code === 'POOL_NO_LANES');
    expect(w?.nodeId).toBe('p1');
  });

  it('warning carries the source line of the laneless pool', () => {
    const warnings = lintSource(POOL_WITH_NO_LANES);
    const w = warnings.find((w) => w.code === 'POOL_NO_LANES');
    expect(w?.sourceLine).toBe(2);
  });

  it('no POOL_NO_LANES warning when pool has at least one lane', () => {
    expect(warningCodes(POOL_WITH_ONE_LANE)).not.toContain('POOL_NO_LANES');
  });

  it('only the empty pool generates a warning when one pool has lanes and one does not', () => {
    const warnings = lintSource(TWO_POOLS_ONE_EMPTY);
    const poolWarnings = warnings.filter((w) => w.code === 'POOL_NO_LANES');
    expect(poolWarnings).toHaveLength(1);
    expect(poolWarnings[0].nodeId).toBe('p2');
  });

  it('no POOL_NO_LANES warning when there are no pools at all', () => {
    const src = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;
    expect(warningCodes(src)).not.toContain('POOL_NO_LANES');
  });
});

// ── GATEWAY_SINGLE_OUTFLOW ────────────────────────────────────────────────────

describe('lint rule: GATEWAY_SINGLE_OUTFLOW', () => {
  const GW_ZERO_OUTFLOWS = `bpmn-beta
start s1 "Start"
xor g1 "Decision?"
end e1 "End"
s1 --> g1`;

  const GW_ONE_OUTFLOW = `bpmn-beta
start s1 "Start"
xor g1 "Decision?"
end e1 "End"
s1 --> g1
g1 --> e1`;

  const GW_TWO_OUTFLOWS = `bpmn-beta
start s1 "Start"
xor g1 "Approved?"
task t1 "Process"
end e1 "End"
end e2 "Rejected"
s1 --> g1
g1 --> t1: "yes"
g1 --> e2: "no"
t1 --> e1`;

  const MULTIPLE_GW_MIXED = `bpmn-beta
start s1 "Start"
xor g1 "Gate A"
or g2 "Gate B"
end e1 "End"
s1 --> g1
g1 --> g2: "yes"
g1 --> e1: "no"
g2 --> e1`;

  it('emits GATEWAY_SINGLE_OUTFLOW when gateway has zero outgoing flows', () => {
    expect(warningCodes(GW_ZERO_OUTFLOWS)).toContain('GATEWAY_SINGLE_OUTFLOW');
  });

  it('emits GATEWAY_SINGLE_OUTFLOW when gateway has exactly one outgoing flow', () => {
    expect(warningCodes(GW_ONE_OUTFLOW)).toContain('GATEWAY_SINGLE_OUTFLOW');
  });

  it('warning message mentions the gateway label', () => {
    const warnings = lintSource(GW_ONE_OUTFLOW);
    const w = warnings.find((w) => w.code === 'GATEWAY_SINGLE_OUTFLOW');
    expect(w?.message).toContain('Decision?');
  });

  it('warning nodeId matches the gateway id', () => {
    const warnings = lintSource(GW_ONE_OUTFLOW);
    const w = warnings.find((w) => w.code === 'GATEWAY_SINGLE_OUTFLOW');
    expect(w?.nodeId).toBe('g1');
  });

  it('warning carries the source line of the single-outflow gateway', () => {
    const warnings = lintSource(GW_ONE_OUTFLOW);
    const w = warnings.find((w) => w.code === 'GATEWAY_SINGLE_OUTFLOW');
    expect(w?.sourceLine).toBe(3);
  });

  it('no GATEWAY_SINGLE_OUTFLOW when gateway has 2 outgoing flows', () => {
    expect(warningCodes(GW_TWO_OUTFLOWS)).not.toContain('GATEWAY_SINGLE_OUTFLOW');
  });

  it('only the single-outflow gateway triggers the warning when there are two gateways and one branches correctly', () => {
    const warnings = lintSource(MULTIPLE_GW_MIXED);
    const gwWarnings = warnings.filter((w) => w.code === 'GATEWAY_SINGLE_OUTFLOW');
    // g1 has 2 outflows (correct), g2 has 1 outflow (warning)
    expect(gwWarnings).toHaveLength(1);
    expect(gwWarnings[0].nodeId).toBe('g2');
  });

  it('no GATEWAY_SINGLE_OUTFLOW when the diagram has no gateways', () => {
    const src = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;
    expect(warningCodes(src)).not.toContain('GATEWAY_SINGLE_OUTFLOW');
  });
});

// ── NO_START_EVENT ────────────────────────────────────────────────────────────

describe('lint rule: NO_START_EVENT', () => {
  const TASKS_NO_START = `bpmn-beta
task t1 "Review"
task t2 "Approve"
end e1 "Done"
t1 --> t2
t2 --> e1`;

  const GATEWAY_NO_START = `bpmn-beta
xor g1 "Gate"
task t1 "Path A"
end e1 "Done"
g1 --> t1
t1 --> e1`;

  const TASKS_WITH_START = `bpmn-beta
start s1 "Begin"
task t1 "Review"
end e1 "Done"
s1 --> t1
t1 --> e1`;

  const ONLY_EVENTS = `bpmn-beta
start s1 "Start"
end e1 "End"
s1 --> e1`;

  it('emits NO_START_EVENT when diagram has tasks but no start node', () => {
    expect(warningCodes(TASKS_NO_START)).toContain('NO_START_EVENT');
  });

  it('emits NO_START_EVENT when diagram has gateways but no start node', () => {
    expect(warningCodes(GATEWAY_NO_START)).toContain('NO_START_EVENT');
  });

  it('no NO_START_EVENT when a start node is present', () => {
    expect(warningCodes(TASKS_WITH_START)).not.toContain('NO_START_EVENT');
  });

  it('no NO_START_EVENT for a diagram with only event nodes (no tasks or gateways)', () => {
    expect(warningCodes(ONLY_EVENTS)).not.toContain('NO_START_EVENT');
  });

  it('NO_START_EVENT has a descriptive message with syntax example', () => {
    const warnings = lintSource(TASKS_NO_START);
    const w = warnings.find((w) => w.code === 'NO_START_EVENT');
    expect(w?.message).toContain('start');
    expect(w?.message.length).toBeGreaterThan(20);
  });
});

// ── NO_END_EVENT ──────────────────────────────────────────────────────────────

describe('lint rule: NO_END_EVENT', () => {
  const TASKS_NO_END = `bpmn-beta
start s1 "Begin"
task t1 "Review"
task t2 "Approve"
s1 --> t1
t1 --> t2`;

  const TASKS_WITH_END = `bpmn-beta
start s1 "Begin"
task t1 "Review"
end e1 "Done"
s1 --> t1
t1 --> e1`;

  const ONLY_EVENTS = `bpmn-beta
start s1 "Start"
end e1 "End"
s1 --> e1`;

  it('emits NO_END_EVENT when diagram has tasks but no end node', () => {
    expect(warningCodes(TASKS_NO_END)).toContain('NO_END_EVENT');
  });

  it('no NO_END_EVENT when an end node is present', () => {
    expect(warningCodes(TASKS_WITH_END)).not.toContain('NO_END_EVENT');
  });

  it('no NO_END_EVENT for a diagram with only event nodes', () => {
    expect(warningCodes(ONLY_EVENTS)).not.toContain('NO_END_EVENT');
  });

  it('NO_END_EVENT message contains a syntax example', () => {
    const warnings = lintSource(TASKS_NO_END);
    const w = warnings.find((w) => w.code === 'NO_END_EVENT');
    expect(w?.message).toContain('end');
    expect(w?.message.length).toBeGreaterThan(20);
  });
});

// ── Multiple warnings ─────────────────────────────────────────────────────────

describe('lint — multiple simultaneous warnings', () => {
  it('returns warnings from multiple rules for a diagram that violates several rules', () => {
    // Violates: NO_START_EVENT, NO_END_EVENT, GATEWAY_SINGLE_OUTFLOW
    const source = `bpmn-beta
xor g1 "Approve?"
task t1 "Process"
g1 --> t1: "yes"`;
    const codes = warningCodes(source);
    expect(codes).toContain('NO_START_EVENT');
    expect(codes).toContain('NO_END_EVENT');
    expect(codes).toContain('GATEWAY_SINGLE_OUTFLOW');
  });

  it('returns an empty array for a clean well-formed diagram', () => {
    const source = `bpmn-beta
start s1 "Request Raised"
task t1 "Review"
xor g1 "Approved?"
task t2 "Process Order"
end e1 "Done"
end e2 "Rejected"
s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> e2: "no"
t2 --> e1`;
    expect(lintSource(source)).toHaveLength(0);
  });
});

// ── Robustness ────────────────────────────────────────────────────────────────

describe('lint — robustness', () => {
  it('returns an empty array for an empty source (no nodes)', () => {
    // parse('') returns an empty db — lint should return []
    const db = parse('bpmn-beta');
    expect(lint(db)).toHaveLength(0);
  });

  it('lint() never throws — even with an empty db', () => {
    const db = parse('bpmn-beta');
    expect(() => lint(db)).not.toThrow();
  });
});
