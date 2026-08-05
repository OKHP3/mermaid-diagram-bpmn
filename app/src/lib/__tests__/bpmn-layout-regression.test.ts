/**
 * bpmn-layout-regression.test.ts
 *
 * Layout regression tests for bpmn-layout.ts (TD-006).
 *
 * These tests call layoutGraph() on real corpus fixtures and assert specific
 * node positions and pool/lane dimensions. The goal is to detect layout engine
 * regressions without pinning so tightly that intentional improvements always
 * fail.
 *
 * Design choices:
 *   - Assert positions and sizes derived from the layout algorithm constants
 *     (NODE_W=120, PAD_X=80, NODE_H=60, PAD_Y=50) so failures point clearly
 *     to a constant change.
 *   - Assert structural properties (node count, pool count, lane count) so
 *     any corpus file edit that adds/removes elements fails visibly.
 *   - For pool/lane layouts, assert dimensional constraints (min lane height,
 *     pool width ≥ content) rather than exact positions, since exact values
 *     depend on which nodes fall in which lane.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from '../bpmn-parser';
import { layoutGraph } from '../bpmn-layout';

const __dirname = dirname(fileURLToPath(import.meta.url));

function fixture(name: string): string {
  return readFileSync(resolve(__dirname, '../../../examples', name), 'utf-8');
}

// ---------------------------------------------------------------------------
// Flat layout: 01-linear-process.mmd
// Nodes: start s1, task:user t1, end e1
// Flows: s1 → t1 → e1  (linear chain, each node at a unique level)
// ---------------------------------------------------------------------------
describe('layoutGraph — flat: 01-linear-process', () => {
  const db = parse(fixture('01-linear-process.mmd'));
  const layout = layoutGraph(db);

  it('is a flat layout (no pools)', () => {
    expect(layout.hasPools).toBe(false);
    expect(layout.pools).toHaveLength(0);
    expect(layout.lanes).toHaveLength(0);
  });

  it('produces one layout node per db node', () => {
    expect(layout.nodes).toHaveLength(db.getNodes().length);
    expect(layout.nodes).toHaveLength(3);
  });

  it('produces one layout edge per db flow', () => {
    expect(layout.edges).toHaveLength(db.getFlows().length);
    expect(layout.edges).toHaveLength(2);
  });

  it('assigns each node to a unique x column (left-to-right order)', () => {
    const s1 = layout.nodes.find(n => n.id === 's1')!;
    const t1 = layout.nodes.find(n => n.id === 't1')!;
    const e1 = layout.nodes.find(n => n.id === 'e1')!;

    expect(s1).toBeDefined();
    expect(t1).toBeDefined();
    expect(e1).toBeDefined();

    // Each node should be in a strictly increasing x column
    expect(s1.x).toBeLessThan(t1.x);
    expect(t1.x).toBeLessThan(e1.x);
  });

  it('x positions match the layout formula (level * 200 + 110)', () => {
    // Formula: cx = level * (NODE_W + PAD_X) + NODE_W/2 + 50
    //                     = level * 200 + 60 + 50 = level * 200 + 110
    const s1 = layout.nodes.find(n => n.id === 's1')!;
    const t1 = layout.nodes.find(n => n.id === 't1')!;
    const e1 = layout.nodes.find(n => n.id === 'e1')!;

    expect(s1.x).toBe(110); // level 0: 0*200+110 = 110
    expect(t1.x).toBe(310); // level 1: 1*200+110 = 310
    expect(e1.x).toBe(510); // level 2: 2*200+110 = 510
  });

  it('assigns correct dimensions by node kind', () => {
    const s1 = layout.nodes.find(n => n.id === 's1')!; // event
    const t1 = layout.nodes.find(n => n.id === 't1')!; // task
    const e1 = layout.nodes.find(n => n.id === 'e1')!; // event

    // Events: 40×40; Tasks: 120×60; Gateways: 50×50
    expect(s1.width).toBe(40);
    expect(s1.height).toBe(40);
    expect(t1.width).toBe(120);
    expect(t1.height).toBe(60);
    expect(e1.width).toBe(40);
    expect(e1.height).toBe(40);
  });

  it('layout width is at least the rightmost node x + margin', () => {
    const maxX = Math.max(...layout.nodes.map(n => n.x));
    expect(layout.width).toBeGreaterThan(maxX);
  });
});

// ---------------------------------------------------------------------------
// Flat layout: 02-gateway-decision.mmd
// ---------------------------------------------------------------------------
describe('layoutGraph — flat with gateway: 02-gateway-decision', () => {
  const db = parse(fixture('02-gateway-decision.mmd'));
  const layout = layoutGraph(db);

  it('is a flat layout', () => {
    expect(layout.hasPools).toBe(false);
  });

  it('assigns gateway nodes 50×50 dimensions', () => {
    const gateways = layout.nodes.filter(n => {
      const dbNode = db.getNodes().find(d => d.id === n.id);
      return dbNode?.kind === 'gateway';
    });
    expect(gateways.length).toBeGreaterThanOrEqual(1);
    for (const g of gateways) {
      expect(g.width).toBe(50);
      expect(g.height).toBe(50);
    }
  });
});

// ---------------------------------------------------------------------------
// Pool/lane layout: 08-purchase-order-approval.mmd
// Pools: 1 (po_process), Lanes: 3 (requester, manager, procurement)
// ---------------------------------------------------------------------------
describe('layoutGraph — pool/lane: 08-purchase-order-approval', () => {
  const db = parse(fixture('08-purchase-order-approval.mmd'));
  const layout = layoutGraph(db);

  it('is a pool layout', () => {
    expect(layout.hasPools).toBe(true);
  });

  it('produces exactly 1 pool and 3 lanes', () => {
    expect(layout.pools).toHaveLength(1);
    expect(layout.lanes).toHaveLength(3);
  });

  it('produces a layout node for every db node', () => {
    expect(layout.nodes).toHaveLength(db.getNodes().length);
  });

  it('pool x starts at 0', () => {
    expect(layout.pools[0].x).toBe(0);
    expect(layout.pools[0].y).toBe(0);
  });

  it('pool header width is a positive value (POOL_HEADER_W = 30)', () => {
    expect(layout.pools[0].headerWidth).toBe(30);
  });

  it('pool height equals the sum of its lane heights', () => {
    const pool = layout.pools[0];
    const totalLaneH = layout.lanes.reduce((sum, l) => sum + l.height, 0);
    expect(pool.height).toBe(totalLaneH);
  });

  it('each lane has a minimum height (MIN_LANE_H = 100)', () => {
    for (const lane of layout.lanes) {
      expect(lane.height).toBeGreaterThanOrEqual(100);
    }
  });

  it('each lane header width is 80 (LANE_HEADER_W)', () => {
    for (const lane of layout.lanes) {
      expect(lane.headerWidth).toBe(80);
    }
  });

  it('lanes are vertically stacked within the pool (no overlap)', () => {
    const sorted = [...layout.lanes].sort((a, b) => a.y - b.y);
    for (let i = 0; i < sorted.length - 1; i++) {
      const bottom = sorted[i].y + sorted[i].height;
      expect(bottom).toBe(sorted[i + 1].y);
    }
  });

  it('all nodes are within their pool x/width bounds', () => {
    const pool = layout.pools[0];
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(pool.x);
      expect(node.x).toBeLessThanOrEqual(pool.x + pool.width);
    }
  });

  it('all edges connect nodes that exist in the layout', () => {
    const nodeIds = new Set(layout.nodes.map(n => n.id));
    for (const edge of layout.edges) {
      expect(nodeIds.has(edge.from)).toBe(true);
      expect(nodeIds.has(edge.to)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('layoutGraph — edge cases', () => {
  it('returns a valid layout for an empty diagram', () => {
    const db = parse('bpmn-beta\n');
    const layout = layoutGraph(db);
    expect(layout.nodes).toHaveLength(0);
    expect(layout.edges).toHaveLength(0);
    expect(layout.hasPools).toBe(false);
  });

  it('returns a valid layout for a single-node diagram', () => {
    const db = parse('bpmn-beta\nstart s1 "Start"\n');
    const layout = layoutGraph(db);
    expect(layout.nodes).toHaveLength(1);
    expect(layout.nodes[0].id).toBe('s1');
    expect(layout.nodes[0].x).toBe(110); // single node at level 0
  });
});
