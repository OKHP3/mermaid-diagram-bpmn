import { describe, it, expect } from 'vitest';
import { parse, ParseError } from '../bpmn-parser';

describe('parse — header and directives', () => {
  it('accepts bpmn-beta header', () => {
    const db = parse('bpmn-beta\nstart s1 "Hello"');
    expect(db.getNodes()).toHaveLength(1);
  });

  it('parses accTitle', () => {
    const db = parse('bpmn-beta\naccTitle: My Process');
    expect(db.getAccTitle()).toBe('My Process');
  });

  it('parses accDescr', () => {
    const db = parse('bpmn-beta\naccDescr: Description text');
    expect(db.getAccDescription()).toBe('Description text');
  });

  it('ignores %% comments', () => {
    const db = parse('bpmn-beta\n%% this is a comment\nstart s1 "Start"');
    expect(db.getNodes()).toHaveLength(1);
  });

  it('retains physical source lines for parsed pools and nodes', () => {
    const db = parse(`bpmn-beta
%% Document the participant

pool p1 "Buyer" {
  task t1 "Review"
}

xor g1 "Approved?"`);

    expect(db.getPools()[0].sourceLine).toBe(4);
    expect(db.getNodes().find((node) => node.id === 't1')?.sourceLine).toBe(5);
    expect(db.getNodes().find((node) => node.id === 'g1')?.sourceLine).toBe(8);
  });

  it('retains physical source lines for parsed flows', () => {
    const db = parse(`bpmn-beta
start s1 "Start"
task t1 "Task"
end e1 "End"
s1 --> t1
t1 --> e1`);
    // s1 --> t1 is on physical line 5; t1 --> e1 is on physical line 6
    const flows = db.getFlows();
    expect(flows.find(f => f.source === 's1' && f.target === 't1')?.sourceLine).toBe(5);
    expect(flows.find(f => f.source === 't1' && f.target === 'e1')?.sourceLine).toBe(6);
  });
});

describe('parse — node types', () => {
  it('parses start event', () => {
    const db = parse('bpmn-beta\nstart s1 "Start"');
    const node = db.getNodes()[0];
    expect(node.kind).toBe('event');
    expect(node.position).toBe('start');
    expect(node.label).toBe('Start');
  });

  it('parses end event', () => {
    const db = parse('bpmn-beta\nend e1 "End"');
    const node = db.getNodes()[0];
    expect(node.kind).toBe('event');
    expect(node.position).toBe('end');
  });

  it('parses intermediate event', () => {
    const db = parse('bpmn-beta\nintermediate wait1 "Waiting for approval"');
    const node = db.getNodes()[0];
    expect(node.kind).toBe('event');
    expect(node.position).toBe('intermediate');
    expect(node.label).toBe('Waiting for approval');
  });

  it('parses generic task (no subtype)', () => {
    const db = parse('bpmn-beta\ntask t1 "Do something"');
    const node = db.getNodes()[0];
    expect(node.kind).toBe('task');
    expect(node.subtype).toBeUndefined();
  });

  it('parses task:user', () => {
    const db = parse('bpmn-beta\ntask:user t1 "Review"');
    expect(db.getNodes()[0].subtype).toBe('user');
  });

  it('parses task:service', () => {
    const db = parse('bpmn-beta\ntask:service t1 "Call API"');
    expect(db.getNodes()[0].subtype).toBe('service');
  });

  it('parses task:script', () => {
    const db = parse('bpmn-beta\ntask:script t1 "Transform"');
    expect(db.getNodes()[0].subtype).toBe('script');
  });

  it('parses task:receive', () => {
    const db = parse('bpmn-beta\ntask:receive t1 "Receive PO"');
    expect(db.getNodes()[0].subtype).toBe('receive');
  });

  it('parses task:send', () => {
    const db = parse('bpmn-beta\ntask:send t1 "Send Notification"');
    expect(db.getNodes()[0].subtype).toBe('send');
  });

  it('parses xor gateway', () => {
    const db = parse('bpmn-beta\nxor g1 "Decision"');
    const node = db.getNodes()[0];
    expect(node.kind).toBe('gateway');
    expect(node.subtype).toBe('xor');
  });

  it('parses and gateway', () => {
    const db = parse('bpmn-beta\nand g1 "Split"');
    expect(db.getNodes()[0].subtype).toBe('and');
  });

  it('parses or gateway', () => {
    const db = parse('bpmn-beta\nor g1 "Inclusive"');
    expect(db.getNodes()[0].subtype).toBe('or');
  });
});

describe('parse — flow types', () => {
  const base = 'bpmn-beta\nstart s1 "Start"\nend e1 "End"\n';

  it('parses sequence flow', () => {
    const db = parse(base + 's1 --> e1');
    expect(db.getFlows()[0].kind).toBe('sequence');
    expect(db.getFlows()[0].source).toBe('s1');
    expect(db.getFlows()[0].target).toBe('e1');
  });

  it('parses conditional flow with label', () => {
    const db = parse(base + 's1 --> e1: "yes"');
    const flow = db.getFlows()[0];
    expect(flow.kind).toBe('conditional');
    expect(flow.label).toBe('yes');
  });

  it('parses default flow', () => {
    const db = parse(base + 's1 ==> e1');
    expect(db.getFlows()[0].kind).toBe('default');
  });

  it('parses note declarations', () => {
    const db = parse('bpmn-beta\nnote n1 "See SLA policy"');
    expect(db.getNodes()[0]).toMatchObject({ id: 'n1', kind: 'note', label: 'See SLA policy' });
  });

  it('parses association flow', () => {
    const db = parse(base + 's1 --- e1');
    expect(db.getFlows()[0]).toMatchObject({
      source: 's1',
      target: 'e1',
      kind: 'association',
      sourceLine: 4,
    });
  });

  it('parses message flow at top level', () => {
    const src = `bpmn-beta
pool p1 "Pool 1" {
  start s1 "Start"
}
pool p2 "Pool 2" {
  end e1 "End"
}
s1 ~~> e1`;
    const db = parse(src);
    const msgFlows = db.getFlows().filter(f => f.kind === 'message');
    expect(msgFlows).toHaveLength(1);
  });

  it('throws on message flow inside pool block', () => {
    const src = `bpmn-beta
pool p1 "Pool 1" {
  start s1 "Start"
  end e1 "End"
  s1 ~~> e1
}`;
    expect(() => parse(src)).toThrow('top level');
  });

  it('assigns unique ids to flows', () => {
    const db = parse(base + 's1 --> e1\ns1 --> e1');
    const ids = db.getFlows().map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('parse — pools and lanes', () => {
  it('parses a pool block', () => {
    const src = `bpmn-beta
pool p1 "Buyer" {
  start s1 "Start"
}`;
    const db = parse(src);
    expect(db.getPools()).toHaveLength(1);
    expect(db.getPools()[0].label).toBe('Buyer');
    expect(db.getNodes()[0].poolId).toBe('p1');
  });

  it('parses lanes inside a pool', () => {
    const src = `bpmn-beta
pool p1 "Buyer" {
  lane l1 "Requester" {
    start s1 "Start"
    task:user t1 "Submit"
  }
  lane l2 "Manager" {
    task:user t2 "Approve"
  }
  s1 --> t1
  t1 --> t2
}`;
    const db = parse(src);
    expect(db.getLanes()).toHaveLength(2);
    expect(db.getPools()[0].laneIds).toEqual(['l1', 'l2']);
    const s1 = db.getNodes().find(n => n.id === 's1');
    expect(s1?.laneId).toBe('l1');
    expect(s1?.poolId).toBe('p1');
  });

  it('clears lane context after a lane closes while retaining its pool context', () => {
    const src = `bpmn-beta
pool p1 "Buyer" {
  lane l1 "Requester" {
    task t1 "Submit"
  }
  task t2 "Archive request"
}`;
    const db = parse(src);
    const laneTask = db.getNodes().find(n => n.id === 't1');
    const poolTask = db.getNodes().find(n => n.id === 't2');

    expect(laneTask).toMatchObject({ poolId: 'p1', laneId: 'l1' });
    expect(poolTask).toMatchObject({ poolId: 'p1', laneId: undefined });
  });

  it('throws on nested pools', () => {
    const src = `bpmn-beta
pool p1 "Outer" {
  pool p2 "Inner" {
    start s1 "Start"
  }
}`;
    expect(() => parse(src)).toThrow();
  });

  it('reports the physical source line through blank lines and comments', () => {
    const src = `bpmn-beta
%% Document the outer participant

pool p1 "Outer" {
  %% This nested pool is invalid

  pool p2 "Inner" {
  }
}`;
    let error: unknown;

    try {
      parse(src);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ParseError);
    expect((error as ParseError).line).toBe(7);
    expect((error as ParseError).message).toContain('Line 7');
  });

  it('throws on lane outside pool', () => {
    const src = `bpmn-beta
lane l1 "Orphan Lane" {
  start s1 "Start"
}`;
    expect(() => parse(src)).toThrow('pool block');
  });

  it('throws on unexpected closing brace', () => {
    const src = `bpmn-beta
start s1 "Start"
}`;
    expect(() => parse(src)).toThrow('unexpected }');
  });
});
