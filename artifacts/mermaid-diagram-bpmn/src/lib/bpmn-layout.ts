import { BpmnDb, BpmnNode, BpmnFlow } from './bpmn-db';

export interface Point {
  x: number;
  y: number;
}

export interface BpmnLayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BpmnLayoutEdge {
  from: string;
  to: string;
  points: Point[];
}

export interface PoolLayout {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  headerWidth: number;
}

export interface LaneLayout {
  id: string;
  label: string;
  poolId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  headerWidth: number;
}

export interface BpmnLayout {
  nodes: BpmnLayoutNode[];
  edges: BpmnLayoutEdge[];
  pools: PoolLayout[];
  lanes: LaneLayout[];
  width: number;
  height: number;
  hasPools: boolean;
}

const NODE_W = 120;
const NODE_H = 60;
const PAD_X = 80;
const PAD_Y = 50;
const POOL_HEADER_W = 30;
const LANE_HEADER_W = 80;
const LANE_PAD_X = 24;
const LANE_PAD_Y = 20;
const MIN_LANE_H = 100;
const POOL_GAP = 24;

function nodeDimensions(node: BpmnNode): { w: number; h: number } {
  if (node.kind === 'event') return { w: 40, h: 40 };
  if (node.kind === 'gateway') return { w: 50, h: 50 };
  return { w: NODE_W, h: NODE_H };
}

function assignLevels(nodeIds: string[], flows: BpmnFlow[]): Record<string, number> {
  const levels: Record<string, number> = {};
  nodeIds.forEach(id => { levels[id] = 0; });
  let changed = true;
  while (changed) {
    changed = false;
    for (const flow of flows) {
      if (nodeIds.includes(flow.source) && nodeIds.includes(flow.target)) {
        const next = (levels[flow.source] ?? 0) + 1;
        if (next > (levels[flow.target] ?? 0)) {
          levels[flow.target] = next;
          changed = true;
        }
      }
    }
  }
  return levels;
}

export function layoutGraph(db: BpmnDb): BpmnLayout {
  if (db.getPools().length > 0) return layoutWithPools(db);
  return layoutFlat(db);
}

function layoutFlat(db: BpmnDb): BpmnLayout {
  const nodes = db.getNodes();
  const flows = db.getFlows();
  const layoutNodes: BpmnLayoutNode[] = [];
  const layoutEdges: BpmnLayoutEdge[] = [];

  const levels = assignLevels(nodes.map(n => n.id), flows);
  const maxLevel = nodes.length > 0 ? Math.max(0, ...Object.values(levels)) : 0;

  const nodesByLevel: Record<number, string[]> = {};
  nodes.forEach(n => {
    const l = levels[n.id] ?? 0;
    if (!nodesByLevel[l]) nodesByLevel[l] = [];
    nodesByLevel[l].push(n.id);
  });

  const positions: Record<string, Point> = {};

  for (let l = 0; l <= maxLevel; l++) {
    const nodesInLevel = nodesByLevel[l] || [];
    const cx = l * (NODE_W + PAD_X) + NODE_W / 2 + 50;
    const totalH = nodesInLevel.length * NODE_H + (nodesInLevel.length - 1) * PAD_Y;
    let startY = -totalH / 2 + NODE_H / 2;

    nodesInLevel.forEach(nodeId => {
      const nodeDef = nodes.find(n => n.id === nodeId)!;
      const { w, h } = nodeDimensions(nodeDef);
      positions[nodeId] = { x: cx, y: startY };
      layoutNodes.push({ id: nodeId, x: cx, y: startY, width: w, height: h });
      startY += NODE_H + PAD_Y;
    });
  }

  flows.forEach(flow => {
    const fp = positions[flow.source];
    const tp = positions[flow.target];
    if (fp && tp) {
      layoutEdges.push({
        from: flow.source, to: flow.target,
        points: [{ x: fp.x, y: fp.y }, { x: tp.x, y: tp.y }],
      });
    }
  });

  return {
    nodes: layoutNodes, edges: layoutEdges,
    pools: [], lanes: [], hasPools: false,
    width: (maxLevel + 1) * (NODE_W + PAD_X) + 100,
    height: 600,
  };
}

function layoutWithPools(db: BpmnDb): BpmnLayout {
  const layoutNodes: BpmnLayoutNode[] = [];
  const layoutEdges: BpmnLayoutEdge[] = [];
  const poolLayouts: PoolLayout[] = [];
  const laneLayouts: LaneLayout[] = [];
  const allFlows = db.getFlows();

  let poolY = 0;
  let maxWidth = 0;

  for (const pool of db.getPools()) {
    const poolLanes = db.getLanes().filter(l => l.poolId === pool.id);
    const poolNodes = db.getNodes().filter(n => n.poolId === pool.id);

    const groups = poolLanes.length > 0
      ? poolLanes.map(lane => ({
          id: lane.id,
          label: lane.label,
          nodes: db.getNodes().filter(n => n.laneId === lane.id),
          isLane: true,
        }))
      : [{ id: '__flat__', label: '', nodes: poolNodes, isLane: false }];

    let laneY = poolY;
    let poolContentW = 0;

    for (const group of groups) {
      const groupNodeIds = group.nodes.map(n => n.id);
      const intraFlows = allFlows.filter(f =>
        groupNodeIds.includes(f.source) && groupNodeIds.includes(f.target)
      );
      const levels = assignLevels(groupNodeIds, intraFlows);
      const maxLevel = groupNodeIds.length > 0 ? Math.max(0, ...Object.values(levels)) : 0;

      const nodesByLevel: Record<number, string[]> = {};
      group.nodes.forEach(n => {
        const l = levels[n.id] ?? 0;
        if (!nodesByLevel[l]) nodesByLevel[l] = [];
        nodesByLevel[l].push(n.id);
      });

      const contentX = POOL_HEADER_W + (poolLanes.length > 0 ? LANE_HEADER_W : 0) + LANE_PAD_X;
      let maxContentX = contentX;
      let maxContentY = laneY + LANE_PAD_Y;

      for (let l = 0; l <= maxLevel; l++) {
        const nodesInLevel = nodesByLevel[l] || [];
        const cx = contentX + l * (NODE_W + PAD_X) + NODE_W / 2;
        let ny = laneY + LANE_PAD_Y;

        nodesInLevel.forEach(nodeId => {
          const nodeDef = group.nodes.find(n => n.id === nodeId)!;
          const { w, h } = nodeDimensions(nodeDef);
          layoutNodes.push({ id: nodeId, x: cx, y: ny + h / 2, width: w, height: h });
          maxContentX = Math.max(maxContentX, cx + w / 2);
          maxContentY = Math.max(maxContentY, ny + h + LANE_PAD_Y);
          ny += NODE_H + PAD_Y;
        });
      }

      const laneHeight = Math.max(maxContentY - laneY, MIN_LANE_H);
      const laneWidth = Math.max(maxContentX - POOL_HEADER_W + LANE_PAD_X, 300);

      if (group.isLane) {
        laneLayouts.push({
          id: group.id, label: group.label, poolId: pool.id,
          x: POOL_HEADER_W, y: laneY,
          width: laneWidth, height: laneHeight,
          headerWidth: LANE_HEADER_W,
        });
      }

      poolContentW = Math.max(poolContentW, POOL_HEADER_W + laneWidth);
      laneY += laneHeight;
    }

    const poolHeight = laneY - poolY;
    const poolWidth = Math.max(poolContentW, POOL_HEADER_W + 320);

    poolLayouts.push({
      id: pool.id, label: pool.label,
      x: 0, y: poolY, width: poolWidth, height: poolHeight,
      headerWidth: POOL_HEADER_W,
    });

    maxWidth = Math.max(maxWidth, poolWidth);
    poolY += poolHeight + POOL_GAP;
  }

  allFlows.forEach(flow => {
    const fn = layoutNodes.find(n => n.id === flow.source);
    const tn = layoutNodes.find(n => n.id === flow.target);
    if (fn && tn) {
      layoutEdges.push({
        from: flow.source, to: flow.target,
        points: [{ x: fn.x, y: fn.y }, { x: tn.x, y: tn.y }],
      });
    }
  });

  return {
    nodes: layoutNodes, edges: layoutEdges,
    pools: poolLayouts, lanes: laneLayouts,
    width: maxWidth + 60, height: poolY > 0 ? poolY - POOL_GAP : 0,
    hasPools: true,
  };
}
