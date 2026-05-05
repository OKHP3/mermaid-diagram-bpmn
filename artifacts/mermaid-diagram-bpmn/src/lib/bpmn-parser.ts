export type NodeType = 'start' | 'end' | 'task:user' | 'task:service' | 'task:script' | 'xor' | 'or' | 'and';

export interface BpmnNode {
  id: string;
  type: NodeType;
  label: string;
}

export type EdgeType = 'sequence' | 'conditional' | 'default' | 'message';

export interface BpmnEdge {
  from: string;
  to: string;
  type: EdgeType;
  label?: string;
}

export interface BpmnGraph {
  accTitle?: string;
  accDescr?: string;
  nodes: BpmnNode[];
  edges: BpmnEdge[];
}

export function parseBpmn(source: string): BpmnGraph {
  const graph: BpmnGraph = {
    nodes: [],
    edges: []
  };

  const lines = source.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines[0] !== 'bpmn-beta') {
    // Optionally return empty or handle missing header, but let's just parse what we can
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === 'bpmn-beta') continue;

    if (line.startsWith('accTitle:')) {
      graph.accTitle = line.substring('accTitle:'.length).trim();
      continue;
    }

    if (line.startsWith('accDescr:')) {
      graph.accDescr = line.substring('accDescr:'.length).trim();
      continue;
    }

    // Nodes: type id "label"
    const nodeMatch = line.match(/^(start|end|task:user|task:service|task:script|xor|or|and)\s+([a-zA-Z0-9_]+)\s+"([^"]*)"$/);
    if (nodeMatch) {
      graph.nodes.push({
        type: nodeMatch[1] as NodeType,
        id: nodeMatch[2],
        label: nodeMatch[3]
      });
      continue;
    }

    // Edges
    // <fromId> --> <toId>: "label"
    const condEdgeMatch = line.match(/^([a-zA-Z0-9_]+)\s+-->\s+([a-zA-Z0-9_]+):\s+"([^"]*)"$/);
    if (condEdgeMatch) {
      graph.edges.push({
        from: condEdgeMatch[1],
        to: condEdgeMatch[2],
        type: 'conditional',
        label: condEdgeMatch[3]
      });
      continue;
    }

    // <fromId> --> <toId>
    const seqEdgeMatch = line.match(/^([a-zA-Z0-9_]+)\s+-->\s+([a-zA-Z0-9_]+)$/);
    if (seqEdgeMatch) {
      graph.edges.push({
        from: seqEdgeMatch[1],
        to: seqEdgeMatch[2],
        type: 'sequence'
      });
      continue;
    }

    // <fromId> ==> <toId>
    const defEdgeMatch = line.match(/^([a-zA-Z0-9_]+)\s+==>\s+([a-zA-Z0-9_]+)$/);
    if (defEdgeMatch) {
      graph.edges.push({
        from: defEdgeMatch[1],
        to: defEdgeMatch[2],
        type: 'default'
      });
      continue;
    }

    // <fromId> ~~> <toId>
    const msgEdgeMatch = line.match(/^([a-zA-Z0-9_]+)\s+~~>\s+([a-zA-Z0-9_]+)$/);
    if (msgEdgeMatch) {
      graph.edges.push({
        from: msgEdgeMatch[1],
        to: msgEdgeMatch[2],
        type: 'message'
      });
      continue;
    }
  }

  return graph;
}
