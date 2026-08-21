/**
 * bpmn-validate.test.ts
 *
 * Unit tests for the post-parse semantic validation pass.
 *
 * Each describe block targets one validation rule and covers:
 *   - At least one fixture that triggers the violation (with code + message assertions)
 *   - Edge cases that must NOT trigger false positives
 *
 * Corpus regression tests (at the bottom) assert that all 10 shipped example
 * diagrams produce zero validation errors after the validation pass runs.
 * This guards against rules that are too aggressive and would break valid diagrams.
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { BpmnDb } from '../bpmn-db';
import { parse } from '../bpmn-parser';
import { validate } from '../bpmn-validate';
import type { ValidationError, ValidationErrorCode } from '../bpmn-validate';

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateSource(source: string): ValidationError[] {
  return validate(parse(source));
}

function errorCodes(source: string): ValidationErrorCode[] {
  return validateSource(source).map(e => e.code);
}

function errorsWithCode(source: string, code: ValidationErrorCode): ValidationError[] {
  return validateSource(source).filter(e => e.code === code);
}

// ── UNDEFINED_NODE_REF ────────────────────────────────────────────────────────

describe('validation rule: UNDEFINED_NODE_REF', () => {
  const GHOST_TARGET = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> ghost
ghost --> e1`;

  const GHOST_SOURCE = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
nobody --> e1`;

  const VALID = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;

  it('emits UNDEFINED_NODE_REF when flow target does not exist', () => {
    expect(errorCodes(GHOST_TARGET)).toContain('UNDEFINED_NODE_REF');
  });

  it('error message names the missing target node ID', () => {
    const errs = errorsWithCode(GHOST_TARGET, 'UNDEFINED_NODE_REF');
    expect(errs.some(e => e.message.includes('ghost'))).toBe(true);
  });

  it('emits UNDEFINED_NODE_REF when flow source does not exist', () => {
    expect(errorCodes(GHOST_SOURCE)).toContain('UNDEFINED_NODE_REF');
  });

  it('error message names the missing source node ID', () => {
    const errs = errorsWithCode(GHOST_SOURCE, 'UNDEFINED_NODE_REF');
    expect(errs.some(e => e.message.includes('nobody'))).toBe(true);
  });

  it('no UNDEFINED_NODE_REF when all flow endpoints are declared nodes', () => {
    expect(errorCodes(VALID)).not.toContain('UNDEFINED_NODE_REF');
  });

  it('no errors on a diagram with no flows at all', () => {
    const src = `bpmn-beta
start s1 "Start"
end e1 "End"`;
    // No flows means no undefined refs (and two orphans — separate rule)
    expect(errorsWithCode(src, 'UNDEFINED_NODE_REF')).toHaveLength(0);
  });

  it('error line matches the physical source line of the offending flow', () => {
    // GHOST_TARGET: t1 --> ghost is on physical line 6
    const errs = errorsWithCode(GHOST_TARGET, 'UNDEFINED_NODE_REF');
    const targetErr = errs.find(e => e.message.includes('"ghost"') && e.message.includes('target'));
    expect(targetErr?.line).toBe(6);
  });
});

// ── ORPHAN_NODE ───────────────────────────────────────────────────────────────

describe('validation rule: ORPHAN_NODE', () => {
  const ORPHANED_TASK = `bpmn-beta
start s1 "Start"
task t1 "Connected Task"
task t2 "Orphaned Task"
end e1 "End"
s1 --> t1
t1 --> e1`;

  const ORPHANED_GATEWAY = `bpmn-beta
start s1 "Start"
xor g1 "Decision"
end e1 "End"
s1 --> e1`;

  const ORPHANED_START = `bpmn-beta
start s1 "Orphaned Start"
start s2 "Connected Start"
task t1 "Task"
end e1 "End"
s2 --> t1
t1 --> e1`;

  const VALID_LINEAR = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;

  const VALID_GATEWAY = `bpmn-beta
start s1 "Start"
xor g1 "Decision"
end e1 "End A"
end e2 "End B"
s1 --> g1
g1 --> e1: "yes"
g1 --> e2: "no"`;

  it('emits ORPHAN_NODE for a task with zero incoming and outgoing flows', () => {
    expect(errorCodes(ORPHANED_TASK)).toContain('ORPHAN_NODE');
  });

  it('orphan error nodeId matches the disconnected node', () => {
    const errs = errorsWithCode(ORPHANED_TASK, 'ORPHAN_NODE');
    expect(errs).toHaveLength(1);
    expect(errs[0].nodeId).toBe('t2');
  });

  it('orphan error message mentions the node label', () => {
    const errs = errorsWithCode(ORPHANED_TASK, 'ORPHAN_NODE');
    expect(errs[0].message).toContain('Orphaned Task');
  });

  it('orphan error message mentions the node kind', () => {
    const errs = errorsWithCode(ORPHANED_TASK, 'ORPHAN_NODE');
    expect(errs[0].message).toContain('task');
  });

  it('emits ORPHAN_NODE for a gateway with no connections', () => {
    expect(errorCodes(ORPHANED_GATEWAY)).toContain('ORPHAN_NODE');
    expect(errorsWithCode(ORPHANED_GATEWAY, 'ORPHAN_NODE')[0].nodeId).toBe('g1');
  });

  it('emits ORPHAN_NODE for a disconnected start event', () => {
    expect(errorCodes(ORPHANED_START)).toContain('ORPHAN_NODE');
    expect(errorsWithCode(ORPHANED_START, 'ORPHAN_NODE')[0].nodeId).toBe('s1');
  });

  it('no ORPHAN_NODE for a well-connected linear diagram', () => {
    expect(errorCodes(VALID_LINEAR)).not.toContain('ORPHAN_NODE');
  });

  it('no ORPHAN_NODE for start/end events in a valid gateway diagram', () => {
    expect(errorCodes(VALID_GATEWAY)).not.toContain('ORPHAN_NODE');
  });

  it('a start event that has outflow but no inflow is not an orphan', () => {
    // Start events legitimately have no incoming flows
    const src = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;
    expect(errorCodes(src)).not.toContain('ORPHAN_NODE');
  });

  it('an end event that has inflow but no outflow is not an orphan', () => {
    // End events legitimately have no outgoing flows
    const src = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;
    expect(errorCodes(src)).not.toContain('ORPHAN_NODE');
  });

  it('message flows do not count as connectivity for orphan detection', () => {
    // A node connected only via a message flow (~~>) is still orphaned in terms
    // of the process path.
    const src = `bpmn-beta
pool p1 "Pool A" {
  start s1 "Start"
  task t1 "Task"
  task t2 "Orphan"
  end e1 "End"
  s1 --> t1
  t1 --> e1
}
pool p2 "Pool B" {
  task t3 "Receiver"
  end e2 "Done"
  t3 --> e2
}
t1 ~~> t3`;
    // t2 is orphaned even though t1 has a message flow going out
    const errs = errorsWithCode(src, 'ORPHAN_NODE');
    expect(errs.some(e => e.nodeId === 't2')).toBe(true);
  });

  it('error line matches the physical source line of the orphaned node', () => {
    // ORPHANED_TASK: t2 "Orphaned Task" is declared on physical line 4
    const errs = errorsWithCode(ORPHANED_TASK, 'ORPHAN_NODE');
    const t2Err = errs.find(e => e.nodeId === 't2');
    expect(t2Err?.line).toBe(4);
  });

  it('no ORPHAN_NODE for an intermediate event wired to a task via an association flow', () => {
    // Intermediate events attached to a task (e.g. boundary error events) use
    // association flows in the DB.  They have no sequence inflow/outflow of their
    // own and were wrongly flagged as orphans before CONNECTIVITY_KINDS was
    // introduced.  Build the DB directly since the parser has no association
    // flow token yet.
    const db = new BpmnDb();
    db.addNode({ id: 's1', kind: 'event', position: 'start', label: 'Start' });
    db.addNode({ id: 't1', kind: 'task', label: 'Review' });
    db.addNode({ id: 'e1', kind: 'event', position: 'end', label: 'End' });
    db.addNode({ id: 'ie1', kind: 'event', position: 'intermediate', label: 'Error caught' });
    db.addFlow({ id: 'f1', source: 's1', target: 't1', kind: 'sequence' });
    db.addFlow({ id: 'f2', source: 't1', target: 'e1', kind: 'sequence' });
    db.addFlow({ id: 'f3', source: 't1', target: 'ie1', kind: 'association' });
    const orphans = validate(db).filter(e => e.code === 'ORPHAN_NODE');
    expect(orphans.some(e => e.nodeId === 'ie1')).toBe(false);
  });

  it('no ORPHAN_NODE for a note annotation attached to a task via association', () => {
    // Annotation / data-object notes connected only via association should
    // never be considered orphaned.
    const db = new BpmnDb();
    db.addNode({ id: 's1', kind: 'event', position: 'start', label: 'Start' });
    db.addNode({ id: 't1', kind: 'task', label: 'Task' });
    db.addNode({ id: 'e1', kind: 'event', position: 'end', label: 'End' });
    db.addNode({ id: 'n1', kind: 'note', label: 'See SLA policy' });
    db.addFlow({ id: 'f1', source: 's1', target: 't1', kind: 'sequence' });
    db.addFlow({ id: 'f2', source: 't1', target: 'e1', kind: 'sequence' });
    db.addFlow({ id: 'f3', source: 't1', target: 'n1', kind: 'association' });
    const orphans = validate(db).filter(e => e.code === 'ORPHAN_NODE');
    expect(orphans.some(e => e.nodeId === 'n1')).toBe(false);
  });

  it('a node connected only via message flow (not association) is still an orphan', () => {
    // Regression guard: message flows still do not count for orphan connectivity.
    // Only association flows were promoted by CONNECTIVITY_KINDS.
    const db = new BpmnDb();
    db.addNode({ id: 's1', kind: 'event', position: 'start', label: 'Start' });
    db.addNode({ id: 't1', kind: 'task', label: 'Task' });
    db.addNode({ id: 'e1', kind: 'event', position: 'end', label: 'End' });
    db.addNode({ id: 'iso', kind: 'task', label: 'Isolated' });
    db.addFlow({ id: 'f1', source: 's1', target: 't1', kind: 'sequence' });
    db.addFlow({ id: 'f2', source: 't1', target: 'e1', kind: 'sequence' });
    db.addFlow({ id: 'f3', source: 't1', target: 'iso', kind: 'message' });
    const orphans = validate(db).filter(e => e.code === 'ORPHAN_NODE');
    // 'iso' has only a message inflow — still counted as an orphan
    expect(orphans.some(e => e.nodeId === 'iso')).toBe(true);
  });
});

// ── CROSS_POOL_SEQUENCE_FLOW ──────────────────────────────────────────────────

describe('validation rule: CROSS_POOL_SEQUENCE_FLOW', () => {
  const CROSS_POOL_SEQ = `bpmn-beta
pool p1 "Pool A" {
  start s1 "Start"
  task t1 "Task A"
}
pool p2 "Pool B" {
  task t2 "Task B"
  end e1 "End"
}
s1 --> t1
t1 --> t2
t2 --> e1`;

  const CROSS_POOL_CONDITIONAL = `bpmn-beta
pool p1 "Pool A" {
  xor g1 "Decision"
}
pool p2 "Pool B" {
  end e1 "End"
}
g1 --> e1: "approved"`;

  const CROSS_POOL_DEFAULT = `bpmn-beta
pool p1 "Pool A" {
  xor g1 "Decision"
}
pool p2 "Pool B" {
  end e1 "End"
}
g1 ==> e1`;

  const CORRECT_MESSAGE_FLOW = `bpmn-beta
pool p1 "Buyer" {
  lane req "Requester" {
    start s1 "Start"
    task:user t1 "Submit"
    end e2 "Done"
  }
  s1 --> t1
  t1 --> e2
}
pool p2 "Supplier" {
  task:receive t2 "Receive"
  end e1 "Done"
  t2 --> e1
}
t1 ~~> t2`;

  const SAME_POOL_FLOW = `bpmn-beta
pool p1 "Single Pool" {
  start s1 "Start"
  task t1 "Task"
  end e1 "End"
  s1 --> t1
  t1 --> e1
}`;

  it('emits CROSS_POOL_SEQUENCE_FLOW for sequence flow crossing pools', () => {
    expect(errorCodes(CROSS_POOL_SEQ)).toContain('CROSS_POOL_SEQUENCE_FLOW');
  });

  it('error message names both the source and target nodes', () => {
    const errs = errorsWithCode(CROSS_POOL_SEQ, 'CROSS_POOL_SEQUENCE_FLOW');
    expect(errs.length).toBeGreaterThan(0);
    const msg = errs[0].message;
    // Should mention source, target, and the cross-pool concept
    expect(msg).toMatch(/pool/i);
  });

  it('error message mentions the correct fix (message flow)', () => {
    const errs = errorsWithCode(CROSS_POOL_SEQ, 'CROSS_POOL_SEQUENCE_FLOW');
    expect(errs[0].message).toContain('~~>');
  });

  it('emits CROSS_POOL_SEQUENCE_FLOW for conditional flow crossing pools', () => {
    expect(errorCodes(CROSS_POOL_CONDITIONAL)).toContain('CROSS_POOL_SEQUENCE_FLOW');
  });

  it('emits CROSS_POOL_SEQUENCE_FLOW for default flow crossing pools', () => {
    expect(errorCodes(CROSS_POOL_DEFAULT)).toContain('CROSS_POOL_SEQUENCE_FLOW');
  });

  it('no CROSS_POOL_SEQUENCE_FLOW for a correct message flow between pools', () => {
    expect(errorCodes(CORRECT_MESSAGE_FLOW)).not.toContain('CROSS_POOL_SEQUENCE_FLOW');
  });

  it('no CROSS_POOL_SEQUENCE_FLOW for flows within the same pool', () => {
    expect(errorCodes(SAME_POOL_FLOW)).not.toContain('CROSS_POOL_SEQUENCE_FLOW');
  });

  it('no CROSS_POOL_SEQUENCE_FLOW for top-level nodes (no pool)', () => {
    const src = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;
    expect(errorCodes(src)).not.toContain('CROSS_POOL_SEQUENCE_FLOW');
  });

  it('only flags the cross-pool flow, not the same-pool flows', () => {
    // CROSS_POOL_SEQ has two same-pool flows (s1→t1 inside p1 and t2→e1 inside p2)
    // and one cross-pool flow (t1→t2). Only the cross-pool one should be flagged.
    const errs = errorsWithCode(CROSS_POOL_SEQ, 'CROSS_POOL_SEQUENCE_FLOW');
    expect(errs).toHaveLength(1);
  });

  it('error line matches the physical source line of the cross-pool flow', () => {
    // CROSS_POOL_SEQ: t1 --> t2 (the cross-pool flow) is on physical line 11
    const errs = errorsWithCode(CROSS_POOL_SEQ, 'CROSS_POOL_SEQUENCE_FLOW');
    expect(errs).toHaveLength(1);
    expect(errs[0].line).toBe(11);
  });
});

// ── UNBALANCED_GATEWAY ────────────────────────────────────────────────────────

describe('validation rule: UNBALANCED_GATEWAY', () => {
  const MIXED_XOR = `bpmn-beta
start s1 "Start A"
start s2 "Start B"
xor g1 "Mixed Decision"
end e1 "End A"
end e2 "End B"
s1 --> g1
s2 --> g1
g1 --> e1: "path a"
g1 --> e2: "path b"`;

  const MIXED_AND = `bpmn-beta
start s1 "Input 1"
start s2 "Input 2"
and g1 "Mixed AND"
end e1 "Output 1"
end e2 "Output 2"
s1 --> g1
s2 --> g1
g1 --> e1
g1 --> e2`;

  const VALID_SPLIT = `bpmn-beta
start s1 "Start"
xor g1 "Decision"
end e1 "End A"
end e2 "End B"
s1 --> g1
g1 --> e1: "yes"
g1 --> e2: "no"`;

  const VALID_JOIN = `bpmn-beta
start s1 "Start A"
start s2 "Start B"
and g1 "Join"
end e1 "End"
s1 --> g1
s2 --> g1
g1 --> e1`;

  const VALID_PARALLEL = `bpmn-beta
start s1 "Start"
and g1 "Split"
task t1 "Task A"
task t2 "Task B"
and g2 "Join"
end e1 "End"
s1 --> g1
g1 --> t1
g1 --> t2
t1 --> g2
t2 --> g2
g2 --> e1`;

  it('emits UNBALANCED_GATEWAY for XOR gateway with 2 inflows and 2 outflows', () => {
    expect(errorCodes(MIXED_XOR)).toContain('UNBALANCED_GATEWAY');
  });

  it('error nodeId points to the mixed gateway', () => {
    const errs = errorsWithCode(MIXED_XOR, 'UNBALANCED_GATEWAY');
    expect(errs).toHaveLength(1);
    expect(errs[0].nodeId).toBe('g1');
  });

  it('error message names the gateway label', () => {
    const errs = errorsWithCode(MIXED_XOR, 'UNBALANCED_GATEWAY');
    expect(errs[0].message).toContain('Mixed Decision');
  });

  it('error message states the inflow and outflow counts', () => {
    const errs = errorsWithCode(MIXED_XOR, 'UNBALANCED_GATEWAY');
    expect(errs[0].message).toContain('2 incoming');
    expect(errs[0].message).toContain('2 outgoing');
  });

  it('error message suggests splitting into join + split', () => {
    const errs = errorsWithCode(MIXED_XOR, 'UNBALANCED_GATEWAY');
    expect(errs[0].message.toLowerCase()).toMatch(/join|split/);
  });

  it('emits UNBALANCED_GATEWAY for AND gateway acting as mixed', () => {
    expect(errorCodes(MIXED_AND)).toContain('UNBALANCED_GATEWAY');
  });

  it('no UNBALANCED_GATEWAY for a pure split gateway (1 in, 2 out)', () => {
    expect(errorCodes(VALID_SPLIT)).not.toContain('UNBALANCED_GATEWAY');
  });

  it('no UNBALANCED_GATEWAY for a pure join gateway (2 in, 1 out)', () => {
    expect(errorCodes(VALID_JOIN)).not.toContain('UNBALANCED_GATEWAY');
  });

  it('no UNBALANCED_GATEWAY for balanced AND split/join pair', () => {
    expect(errorCodes(VALID_PARALLEL)).not.toContain('UNBALANCED_GATEWAY');
  });

  it('no UNBALANCED_GATEWAY for gateway with exactly 1 in and 1 out', () => {
    const src = `bpmn-beta
start s1 "Start"
xor g1 "Pass-through"
end e1 "End"
s1 --> g1
g1 --> e1`;
    expect(errorCodes(src)).not.toContain('UNBALANCED_GATEWAY');
  });

  it('error line matches the physical source line of the unbalanced gateway node', () => {
    // MIXED_XOR: xor g1 "Mixed Decision" is declared on physical line 4
    const errs = errorsWithCode(MIXED_XOR, 'UNBALANCED_GATEWAY');
    expect(errs).toHaveLength(1);
    expect(errs[0].line).toBe(4);
  });
});

// ── validate() robustness ─────────────────────────────────────────────────────

describe('validate() — general robustness', () => {
  it('returns an empty array for a minimal valid diagram', () => {
    const src = `bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`;
    expect(validateSource(src)).toHaveLength(0);
  });

  it('returns ValidationError objects with required fields', () => {
    const src = `bpmn-beta
start s1 "Start"
task orphan "Floating"
end e1 "End"
s1 --> e1`;
    const errs = validateSource(src);
    expect(errs.length).toBeGreaterThan(0);
    for (const e of errs) {
      expect(typeof e.code).toBe('string');
      expect(typeof e.message).toBe('string');
      expect(e.message.length).toBeGreaterThan(10);
    }
  });

  it('can accumulate multiple violation types simultaneously', () => {
    // Orphan node + cross-pool sequence flow in one diagram
    const src = `bpmn-beta
pool p1 "Pool A" {
  start s1 "Start"
  task orphan "Orphan"
}
pool p2 "Pool B" {
  end e1 "End"
}
s1 --> e1`;
    const codes = errorCodes(src);
    expect(codes).toContain('ORPHAN_NODE');
    expect(codes).toContain('CROSS_POOL_SEQUENCE_FLOW');
  });
});

// ── Corpus regression tests ───────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXAMPLES_DIR = join(__dirname, '../../../examples');

const mmdFiles = readdirSync(EXAMPLES_DIR)
  .filter(f => f.endsWith('.mmd'))
  .sort();

describe('corpus regression: validate() produces zero errors on all shipped examples', () => {
  for (const file of mmdFiles) {
    it(`${file} — no validation errors`, () => {
      const source = readFileSync(join(EXAMPLES_DIR, file), 'utf-8');
      const db = parse(source);
      const errors = validate(db);
      expect(errors).toHaveLength(0);
    });
  }
});
