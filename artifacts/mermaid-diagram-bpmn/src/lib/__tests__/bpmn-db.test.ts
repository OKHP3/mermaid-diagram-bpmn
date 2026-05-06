import { describe, it, expect } from 'vitest';
import { BpmnDb } from '../bpmn-db';

describe('BpmnDb', () => {
  it('starts empty', () => {
    const db = new BpmnDb();
    expect(db.getNodes()).toHaveLength(0);
    expect(db.getFlows()).toHaveLength(0);
    expect(db.getPools()).toHaveLength(0);
    expect(db.getLanes()).toHaveLength(0);
    expect(db.getAccTitle()).toBeUndefined();
    expect(db.getAccDescription()).toBeUndefined();
  });

  it('adds and retrieves nodes', () => {
    const db = new BpmnDb();
    db.addNode({ id: 's1', kind: 'event', position: 'start', label: 'Start' });
    db.addNode({ id: 'e1', kind: 'event', position: 'end', label: 'End' });
    expect(db.getNodes()).toHaveLength(2);
    expect(db.getNodes()[0].id).toBe('s1');
    expect(db.getNodes()[1].position).toBe('end');
  });

  it('adds and retrieves flows', () => {
    const db = new BpmnDb();
    db.addFlow({ id: 'f1', source: 's1', target: 't1', kind: 'sequence' });
    db.addFlow({ id: 'f2', source: 't1', target: 'e1', kind: 'conditional', label: 'yes' });
    expect(db.getFlows()).toHaveLength(2);
    expect(db.getFlows()[0].kind).toBe('sequence');
    expect(db.getFlows()[1].label).toBe('yes');
  });

  it('adds and retrieves pools', () => {
    const db = new BpmnDb();
    db.addPool({ id: 'p1', label: 'Buyer', laneIds: ['l1'] });
    expect(db.getPools()).toHaveLength(1);
    expect(db.getPools()[0].label).toBe('Buyer');
    expect(db.getPools()[0].laneIds).toContain('l1');
  });

  it('adds and retrieves lanes', () => {
    const db = new BpmnDb();
    db.addLane({ id: 'l1', label: 'Requester', poolId: 'p1' });
    expect(db.getLanes()).toHaveLength(1);
    expect(db.getLanes()[0].poolId).toBe('p1');
  });

  it('stores and retrieves accTitle and accDescription', () => {
    const db = new BpmnDb();
    db.setAccTitle('My Process');
    db.setAccDescription('A process description');
    expect(db.getAccTitle()).toBe('My Process');
    expect(db.getAccDescription()).toBe('A process description');
  });

  it('clears all state', () => {
    const db = new BpmnDb();
    db.addNode({ id: 's1', kind: 'event', position: 'start', label: 'Start' });
    db.setAccTitle('Test');
    db.clear();
    expect(db.getNodes()).toHaveLength(0);
    expect(db.getAccTitle()).toBeUndefined();
  });

  it('returns independent arrays (mutation does not affect internal state)', () => {
    const db = new BpmnDb();
    db.addNode({ id: 's1', kind: 'event', position: 'start', label: 'Start' });
    const nodes = db.getNodes();
    expect(nodes).toHaveLength(1);
  });
});
