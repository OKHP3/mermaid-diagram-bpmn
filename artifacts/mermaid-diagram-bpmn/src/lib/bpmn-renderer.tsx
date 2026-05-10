import { parse } from './bpmn-parser';
import { layoutGraph, BpmnLayout, BpmnLayoutNode, PoolLayout, LaneLayout } from './bpmn-layout';
import { BpmnNode, BpmnFlow } from './bpmn-db';
import { getStyles, LIGHT_THEME } from './bpmn-styles';

function UserTaskIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="-4" r="4" className="bpmn-task-marker" />
      <path d="M-6 8 C-6 2 6 2 6 8" className="bpmn-task-marker" strokeLinecap="round" fill="none" />
    </g>
  );
}

function ServiceTaskIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="5" className="bpmn-task-marker" />
      <circle cx="0" cy="0" r="2" className="bpmn-task-marker" />
      <line x1="0" y1="-5" x2="0" y2="-7" className="bpmn-task-marker" />
      <line x1="0" y1="5" x2="0" y2="7" className="bpmn-task-marker" />
      <line x1="-5" y1="0" x2="-7" y2="0" className="bpmn-task-marker" />
      <line x1="5" y1="0" x2="7" y2="0" className="bpmn-task-marker" />
    </g>
  );
}

function ScriptTaskIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-5" y="-6" width="10" height="12" rx="1" className="bpmn-task-marker" />
      <line x1="-3" y1="-2" x2="3" y2="-2" className="bpmn-task-marker" />
      <line x1="-3" y1="1" x2="3" y2="1" className="bpmn-task-marker" />
      <line x1="-3" y1="4" x2="1" y2="4" className="bpmn-task-marker" />
    </g>
  );
}

function ReceiveTaskIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-6" y="-5" width="12" height="9" rx="1" className="bpmn-task-marker" />
      <polyline points="-5,-4 0,-1 5,-4" className="bpmn-task-marker" fill="none" />
    </g>
  );
}

function SendTaskIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-6" y="-5" width="12" height="9" rx="1" className="bpmn-task-marker" />
      <polyline points="-6,-5 0,0 6,-5" className="bpmn-task-marker" fill="none" />
    </g>
  );
}

function renderNode(node: BpmnNode, lnode: BpmnLayoutNode) {
  const { x, y, width, height } = lnode;

  if (node.kind === 'event' && node.position === 'start') {
    return (
      <g key={node.id}>
        <circle cx={x} cy={y} r={18} className="bpmn-event" />
        <circle cx={x} cy={y} r={10} className="bpmn-event-start-inner" />
        <text x={x} y={y + 30} textAnchor="middle" fontSize="11" className="bpmn-text">
          {node.label}
        </text>
      </g>
    );
  }

  if (node.kind === 'event' && node.position === 'end') {
    return (
      <g key={node.id}>
        <circle cx={x} cy={y} r={18} className="bpmn-event-end" />
        <circle cx={x} cy={y} r={11} className="bpmn-event-end" />
        <text x={x} y={y + 30} textAnchor="middle" fontSize="11" className="bpmn-text">
          {node.label}
        </text>
      </g>
    );
  }

  if (node.kind === 'task') {
    const hw = width / 2;
    const hh = height / 2;
    const iconX = x - hw + 14;
    const iconY = y - hh + 12;
    return (
      <g key={node.id}>
        <rect x={x - hw} y={y - hh} width={width} height={height} rx={6} className="bpmn-task" />
        {node.subtype === 'user' && <UserTaskIcon x={iconX} y={iconY} />}
        {node.subtype === 'service' && <ServiceTaskIcon x={iconX} y={iconY} />}
        {node.subtype === 'script' && <ScriptTaskIcon x={iconX} y={iconY} />}
        {node.subtype === 'receive' && <ReceiveTaskIcon x={iconX} y={iconY} />}
        {node.subtype === 'send' && <SendTaskIcon x={iconX} y={iconY} />}
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" className="bpmn-text">
          {(node.label ?? '').length > 18 ? (node.label ?? '').slice(0, 16) + '…' : (node.label ?? '')}
        </text>
      </g>
    );
  }

  if (node.kind === 'gateway') {
    const half = 24;
    return (
      <g key={node.id}>
        <polygon
          points={`${x},${y - half} ${x + half},${y} ${x},${y + half} ${x - half},${y}`}
          className="bpmn-gateway"
        />
        {node.subtype === 'xor' && (
          <>
            <line x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} className="bpmn-gateway-marker" strokeLinecap="round" />
            <line x1={x + 8} y1={y - 8} x2={x - 8} y2={y + 8} className="bpmn-gateway-marker" strokeLinecap="round" />
          </>
        )}
        {node.subtype === 'and' && (
          <>
            <line x1={x} y1={y - 10} x2={x} y2={y + 10} className="bpmn-gateway-marker" strokeLinecap="round" />
            <line x1={x - 10} y1={y} x2={x + 10} y2={y} className="bpmn-gateway-marker" strokeLinecap="round" />
          </>
        )}
        {node.subtype === 'or' && (
          <>
            <circle cx={x} cy={y} r={8} className="bpmn-gateway-or-marker" />
            <line x1={x} y1={y - 5} x2={x} y2={y + 5} className="bpmn-gateway-or-marker" strokeLinecap="round" />
            <line x1={x - 5} y1={y} x2={x + 5} y2={y} className="bpmn-gateway-or-marker" strokeLinecap="round" />
          </>
        )}
        <text x={x} y={y + half + 14} textAnchor="middle" fontSize="11" className="bpmn-text">
          {node.label}
        </text>
      </g>
    );
  }

  return null;
}

function renderFlow(flow: BpmnFlow, layout: BpmnLayout) {
  const layoutEdge = layout.edges.find(e => e.from === flow.source && e.to === flow.target);
  const fromNode = layout.nodes.find(n => n.id === flow.source);
  const toNode = layout.nodes.find(n => n.id === flow.target);
  if (!layoutEdge || !fromNode || !toNode) return null;

  const start = layoutEdge.points[0];
  const end = layoutEdge.points[1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return null;

  const fromRadius = Math.max(fromNode.width, fromNode.height) / 2;
  const toRadius = Math.max(toNode.width, toNode.height) / 2;
  const p1 = { x: start.x + dx * (fromRadius / dist), y: start.y + dy * (fromRadius / dist) };
  const p2 = { x: end.x - dx * (toRadius / dist), y: end.y - dy * (toRadius / dist) };
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  const isMessage = flow.kind === 'message';
  const isDefault = flow.kind === 'default';

  return (
    <g key={`flow-${flow.id}`}>
      <line
        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        className={`bpmn-flow-${flow.kind}`}
        strokeWidth={1.8}
        markerEnd={isMessage ? 'url(#arrowhead-msg)' : 'url(#arrowhead)'}
        markerStart={isDefault ? 'url(#slash-marker)' : undefined}
      />
      {flow.label && (
        <text x={midX} y={midY - 8} textAnchor="middle" fontSize="10" className="bpmn-text-muted">
          {flow.label}
        </text>
      )}
    </g>
  );
}

function renderPools(pools: PoolLayout[], lanes: LaneLayout[]) {
  return (
    <>
      {pools.map(pool => (
        <g key={`pool-${pool.id}`}>
          <rect x={pool.x} y={pool.y} width={pool.width} height={pool.height} className="bpmn-pool" />
          <rect x={pool.x} y={pool.y} width={pool.headerWidth} height={pool.height} className="bpmn-pool-header" />
          <text
            x={pool.x + pool.headerWidth / 2}
            y={pool.y + pool.height / 2}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="12" fontWeight="600"
            className="bpmn-text-label"
            transform={`rotate(-90, ${pool.x + pool.headerWidth / 2}, ${pool.y + pool.height / 2})`}
          >
            {pool.label}
          </text>
        </g>
      ))}
      {lanes.map(lane => (
        <g key={`lane-${lane.id}`}>
          <rect x={lane.x} y={lane.y} width={lane.width} height={lane.height} className="bpmn-lane" />
          <rect x={lane.x} y={lane.y} width={lane.headerWidth} height={lane.height} className="bpmn-lane-header" />
          <text
            x={lane.x + lane.headerWidth / 2}
            y={lane.y + lane.height / 2}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="11" className="bpmn-text"
          >
            {lane.label}
          </text>
        </g>
      ))}
    </>
  );
}

export function BpmnRenderer({ source }: { source: string }) {
  try {
    const db = parse(source);
    const nodes = db.getNodes();

    if (nodes.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <p className="text-sm font-mono">No nodes parsed. Check your bpmn-beta syntax.</p>
        </div>
      );
    }

    const layout = layoutGraph(db);
    const pad = 60;
    const vbX = 0;
    const vbY = layout.hasPools ? -pad / 2 : -layout.height / 2 - pad;
    const vbW = layout.width + pad;
    const vbH = layout.hasPools ? layout.height + pad : layout.height + pad * 2;

    return (
      <svg
        className="w-full h-full"
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="bpmn-title bpmn-desc"
      >
        <title id="bpmn-title">{db.getAccTitle() ?? 'BPMN Diagram'}</title>
        <desc id="bpmn-desc">{db.getAccDescription() ?? 'A bpmn-beta diagram'}</desc>

        <defs>
          <style>{getStyles(LIGHT_THEME)}</style>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="bpmn-arrow" />
          </marker>
          <marker id="arrowhead-msg" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="bpmn-arrow-open" strokeWidth="1" />
          </marker>
          <marker id="slash-marker" markerWidth="8" markerHeight="10" refX="4" refY="5" orient="auto">
            <line x1="6" y1="1" x2="2" y2="9" className="bpmn-slash" />
          </marker>
        </defs>

        {layout.hasPools && renderPools(layout.pools, layout.lanes)}

        {db.getFlows().map(flow => renderFlow(flow, layout))}

        {nodes.map(node => {
          const lnode = layout.nodes.find(n => n.id === node.id);
          if (!lnode) return null;
          return renderNode(node, lnode);
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
