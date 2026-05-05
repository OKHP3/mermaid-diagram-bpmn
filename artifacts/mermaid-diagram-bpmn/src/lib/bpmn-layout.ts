import { BpmnGraph } from './bpmn-parser';

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

export interface BpmnLayout {
  nodes: BpmnLayoutNode[];
  edges: BpmnLayoutEdge[];
  width: number;
  height: number;
}

export function layoutGraph(graph: BpmnGraph): BpmnLayout {
  // A simple heuristic layout for prototype
  const layoutNodes: BpmnLayoutNode[] = [];
  const layoutEdges: BpmnLayoutEdge[] = [];

  const levels: Record<string, number> = {};
  const incoming: Record<string, number> = {};

  graph.nodes.forEach(n => {
    levels[n.id] = 0;
    incoming[n.id] = 0;
  });

  graph.edges.forEach(e => {
    incoming[e.to] = (incoming[e.to] || 0) + 1;
  });

  // Topological sort approximation for leveling
  let changed = true;
  let maxLevel = 0;
  while(changed) {
    changed = false;
    for (const edge of graph.edges) {
      if (levels[edge.to] < levels[edge.from] + 1) {
        levels[edge.to] = levels[edge.from] + 1;
        changed = true;
        maxLevel = Math.max(maxLevel, levels[edge.to]);
      }
    }
  }

  // Assign coordinates based on level and index within level
  const nodesByLevel: Record<number, string[]> = {};
  graph.nodes.forEach(n => {
    const l = levels[n.id] || 0;
    if (!nodesByLevel[l]) nodesByLevel[l] = [];
    nodesByLevel[l].push(n.id);
  });

  const nodeWidth = 120;
  const nodeHeight = 60;
  const padX = 80;
  const padY = 60;

  const positions: Record<string, Point> = {};

  for (let l = 0; l <= maxLevel; l++) {
    const nodesInLevel = nodesByLevel[l] || [];
    const x = l * (nodeWidth + padX) + nodeWidth / 2 + 50;
    
    // center vertically
    const totalHeight = nodesInLevel.length * nodeHeight + (nodesInLevel.length - 1) * padY;
    let startY = -totalHeight / 2 + nodeHeight / 2;

    nodesInLevel.forEach(nodeId => {
      positions[nodeId] = { x, y: startY };
      
      const nodeDef = graph.nodes.find(n => n.id === nodeId);
      // adjust size based on type
      let w = nodeWidth;
      let h = nodeHeight;
      if (nodeDef?.type === 'start' || nodeDef?.type === 'end') {
        w = 40;
        h = 40;
      } else if (nodeDef?.type === 'xor' || nodeDef?.type === 'or' || nodeDef?.type === 'and') {
        w = 50;
        h = 50;
      }

      layoutNodes.push({
        id: nodeId,
        x,
        y: startY,
        width: w,
        height: h
      });

      startY += nodeHeight + padY;
    });
  }

  // Edges straight lines for now
  graph.edges.forEach(edge => {
    const fromPos = positions[edge.from];
    const toPos = positions[edge.to];
    
    if (fromPos && toPos) {
      layoutEdges.push({
        from: edge.from,
        to: edge.to,
        points: [
          { x: fromPos.x, y: fromPos.y },
          { x: toPos.x, y: toPos.y }
        ]
      });
    }
  });

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    width: (maxLevel + 1) * (nodeWidth + padX) + 100,
    height: 600 // rough estimate
  };
}