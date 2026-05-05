import { parseBpmn } from './bpmn-parser';
import { layoutGraph } from './bpmn-layout';

function UserTaskIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="-4" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M-6 8 C-6 2 6 2 6 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function ServiceTaskIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="0" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="0" y1="-5" x2="0" y2="-7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="5" x2="0" y2="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="-5" y1="0" x2="-7" y2="0" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="0" x2="7" y2="0" stroke="currentColor" strokeWidth="1.5" />
    </g>
  );
}

function ScriptTaskIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-5" y="-6" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="-3" y1="-2" x2="3" y2="-2" stroke="currentColor" strokeWidth="1" />
      <line x1="-3" y1="1" x2="3" y2="1" stroke="currentColor" strokeWidth="1" />
      <line x1="-3" y1="4" x2="1" y2="4" stroke="currentColor" strokeWidth="1" />
    </g>
  );
}

export function BpmnRenderer({ source }: { source: string }) {
  try {
    const graph = parseBpmn(source);

    if (graph.nodes.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <p className="text-sm font-mono">No nodes parsed. Check your bpmn-beta syntax.</p>
        </div>
      );
    }

    const layout = layoutGraph(graph);
    const pad = 60;
    const vbX = 0;
    const vbY = -layout.height / 2 - pad;
    const vbW = layout.width + pad;
    const vbH = layout.height + pad * 2;

    const primaryColor = 'hsl(var(--primary))';
    const foregroundColor = 'hsl(var(--foreground))';
    const cardColor = 'hsl(var(--card))';
    const cardFgColor = 'hsl(var(--card-foreground))';
    const mutedFgColor = 'hsl(var(--muted-foreground))';
    const borderColor = 'hsl(var(--border))';

    return (
      <svg
        className="w-full h-full"
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="bpmn-title bpmn-desc"
      >
        <title id="bpmn-title">{graph.accTitle || 'BPMN Diagram'}</title>
        <desc id="bpmn-desc">{graph.accDescr || 'A bpmn-beta diagram'}</desc>

        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={foregroundColor} />
          </marker>
          <marker id="arrowhead-msg" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="none" stroke={foregroundColor} strokeWidth="1" />
          </marker>
          <marker id="slash-marker" markerWidth="8" markerHeight="10" refX="4" refY="5" orient="auto">
            <line x1="6" y1="1" x2="2" y2="9" stroke={foregroundColor} strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Edges rendered first (behind nodes) */}
        {graph.edges.map((edge, i) => {
          const layoutEdge = layout.edges.find(e => e.from === edge.from && e.to === edge.to);
          if (!layoutEdge) return null;

          const fromNode = layout.nodes.find(n => n.id === edge.from);
          const toNode = layout.nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const start = layoutEdge.points[0];
          const end = layoutEdge.points[1];

          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;

          const fromRadius = Math.max(fromNode.width, fromNode.height) / 2;
          const toRadius = Math.max(toNode.width, toNode.height) / 2;
          const r1 = fromRadius / dist;
          const r2 = toRadius / dist;

          const p1 = { x: start.x + dx * r1, y: start.y + dy * r1 };
          const p2 = { x: end.x - dx * r2, y: end.y - dy * r2 };

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          const isMessage = edge.type === 'message';
          const isDefault = edge.type === 'default';

          return (
            <g key={`edge-${i}`}>
              <line
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                stroke={foregroundColor}
                strokeWidth={1.8}
                markerEnd={isMessage ? 'url(#arrowhead-msg)' : 'url(#arrowhead)'}
                markerStart={isDefault ? 'url(#slash-marker)' : undefined}
                strokeDasharray={isMessage ? '6 4' : undefined}
                opacity={0.85}
              />
              {edge.label && (
                <text
                  x={midX}
                  y={midY - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="var(--app-font-mono)"
                  fill={mutedFgColor}
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map(node => {
          const lnode = layout.nodes.find(n => n.id === node.id);
          if (!lnode) return null;

          const { x, y, width, height } = lnode;

          if (node.type === 'start') {
            return (
              <g key={node.id}>
                <circle cx={x} cy={y} r={18} fill={cardColor} stroke={primaryColor} strokeWidth={2} />
                <circle cx={x} cy={y} r={10} fill={primaryColor} opacity={0.25} />
                <text x={x} y={y + 30} textAnchor="middle" fontSize="11" fontFamily="var(--app-font-sans)" fill={foregroundColor}>
                  {node.label}
                </text>
              </g>
            );
          }

          if (node.type === 'end') {
            return (
              <g key={node.id}>
                <circle cx={x} cy={y} r={18} fill={primaryColor} stroke={primaryColor} strokeWidth={3} />
                <circle cx={x} cy={y} r={11} fill={primaryColor} />
                <text x={x} y={y + 30} textAnchor="middle" fontSize="11" fontFamily="var(--app-font-sans)" fill={foregroundColor}>
                  {node.label}
                </text>
              </g>
            );
          }

          if (node.type.startsWith('task')) {
            const hw = width / 2;
            const hh = height / 2;
            const iconX = x - hw + 14;
            const iconY = y - hh + 12;
            return (
              <g key={node.id}>
                <rect
                  x={x - hw} y={y - hh}
                  width={width} height={height}
                  rx={6}
                  fill={cardColor}
                  stroke={borderColor}
                  strokeWidth={1.5}
                />
                {node.type === 'task:user' && <UserTaskIcon x={iconX} y={iconY} />}
                {node.type === 'task:service' && <ServiceTaskIcon x={iconX} y={iconY} />}
                {node.type === 'task:script' && <ScriptTaskIcon x={iconX} y={iconY} />}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontFamily="var(--app-font-sans)"
                  fill={cardFgColor}
                >
                  {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                </text>
              </g>
            );
          }

          if (node.type === 'xor' || node.type === 'or' || node.type === 'and') {
            const half = 24;
            return (
              <g key={node.id}>
                <polygon
                  points={`${x},${y - half} ${x + half},${y} ${x},${y + half} ${x - half},${y}`}
                  fill={cardColor}
                  stroke={foregroundColor}
                  strokeWidth={1.8}
                />
                {node.type === 'xor' && (
                  <>
                    <line x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} stroke={foregroundColor} strokeWidth={2} strokeLinecap="round" />
                    <line x1={x + 8} y1={y - 8} x2={x - 8} y2={y + 8} stroke={foregroundColor} strokeWidth={2} strokeLinecap="round" />
                  </>
                )}
                {node.type === 'and' && (
                  <>
                    <line x1={x} y1={y - 10} x2={x} y2={y + 10} stroke={foregroundColor} strokeWidth={2} strokeLinecap="round" />
                    <line x1={x - 10} y1={y} x2={x + 10} y2={y} stroke={foregroundColor} strokeWidth={2} strokeLinecap="round" />
                  </>
                )}
                {node.type === 'or' && (
                  <>
                    <circle cx={x} cy={y} r={8} stroke={foregroundColor} strokeWidth={1.5} fill="none" />
                    <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke={foregroundColor} strokeWidth={1.5} strokeLinecap="round" />
                    <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke={foregroundColor} strokeWidth={1.5} strokeLinecap="round" />
                  </>
                )}
                <text
                  x={x}
                  y={y + half + 14}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="var(--app-font-sans)"
                  fill={foregroundColor}
                >
                  {node.label}
                </text>
              </g>
            );
          }

          return null;
        })}
      </svg>
    );
  } catch (err) {
    return (
      <div className="w-full h-full flex items-center justify-center text-destructive p-4">
        <pre className="text-xs font-mono whitespace-pre-wrap">{(err as Error).message}</pre>
      </div>
    );
  }
}
