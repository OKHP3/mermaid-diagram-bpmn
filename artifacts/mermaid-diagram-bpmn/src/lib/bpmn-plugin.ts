/**
 * bpmn-plugin.ts
 *
 * Mermaid ExternalDiagramDefinition entry point for mermaid-diagram-bpmn.
 *
 * Usage:
 *   import mermaid from 'mermaid';
 *   import { bpmnPlugin } from 'mermaid-diagram-bpmn';
 *
 *   await mermaid.registerExternalDiagrams([bpmnPlugin]);
 *
 * Compatible with:
 *   - mermaid >= 10 (registerExternalDiagrams API)
 *   - mermaid-live-editor (uses registerExternalDiagrams internally)
 *
 * Contracts satisfied:
 *   - ExternalDiagramDefinition  { id, detector, loader }
 *   - DiagramDefinition          { db, renderer, parser, styles }
 *   - DiagramDB                  BpmnDb (see bpmn-db.ts)
 *   - DiagramDetector            (text, config?) => boolean
 *   - DrawDefinition             (text, id, version, diagramObject) => void | Promise<void>
 *   - ParserDefinition           { parse(text): void; yy: DiagramDB }
 *   - DiagramStylesProvider      (options?) => string
 */

import { DETECTOR_KEY, detect } from './bpmn-detector.js';
import { BpmnDb } from './bpmn-db.js';
import type { BpmnNode, BpmnFlow } from './bpmn-db.js';
import { parse } from './bpmn-parser.js';
import { layoutGraph } from './bpmn-layout.js';
import type { BpmnLayout, BpmnLayoutNode, PoolLayout, LaneLayout } from './bpmn-layout.js';
import { getStyles, buildMermaidTheme } from './bpmn-styles.js';

// ---------------------------------------------------------------------------
// Shared DiagramDB instance
//
// Mermaid convention: the parser populates a module-level db (exposed as
// parser.yy). The renderer reads from diagramObject.db, which is the same
// instance. Calling db.clear() before each parse prevents state leakage.
// ---------------------------------------------------------------------------
const db = new BpmnDb();

// ---------------------------------------------------------------------------
// ParserDefinition
//
// Mermaid interface:
//   { parse(text: string): void | Promise<void>;  yy: DiagramDB }
//
// Our parse() returns a new BpmnDb; here we copy its output into the shared
// instance so the renderer can read from diagramObject.db.
// ---------------------------------------------------------------------------
const parserDef = {
  parse(text: string): void {
    db.clear();
    const parsed = parse(text);
    for (const n of parsed.getNodes()) db.addNode(n);
    for (const f of parsed.getFlows()) db.addFlow(f);
    for (const p of parsed.getPools()) db.addPool(p);
    for (const l of parsed.getLanes()) db.addLane(l);
    const title = parsed.getAccTitle();
    const desc = parsed.getAccDescription();
    if (title) db.setAccTitle(title);
    if (desc) db.setAccDescription(desc);
  },
  yy: db,
};

// ---------------------------------------------------------------------------
// SVG string helpers (mirrors bpmn-renderer.tsx without React)
//
// Mermaid's draw() receives a DOM SVG element id and must inject content into
// it imperatively. React's renderToStaticMarkup would also work but adds a
// server-side React dep to the plugin bundle; plain string generation keeps
// the plugin self-contained.
// ---------------------------------------------------------------------------

function esc(s: string | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function taskMarkerSvg(subtype: string | undefined, ix: number, iy: number): string {
  const t = `translate(${ix}, ${iy})`;
  if (subtype === 'user') return `<g transform="${t}">
    <circle cx="0" cy="-4" r="4" class="bpmn-task-marker"/>
    <path d="M-6 8 C-6 2 6 2 6 8" class="bpmn-task-marker" stroke-linecap="round" fill="none"/>
  </g>`;
  if (subtype === 'service') return `<g transform="${t}">
    <circle cx="0" cy="0" r="5" class="bpmn-task-marker"/>
    <circle cx="0" cy="0" r="2" class="bpmn-task-marker"/>
    <line x1="0" y1="-5" x2="0" y2="-7" class="bpmn-task-marker"/>
    <line x1="0" y1="5" x2="0" y2="7" class="bpmn-task-marker"/>
    <line x1="-5" y1="0" x2="-7" y2="0" class="bpmn-task-marker"/>
    <line x1="5" y1="0" x2="7" y2="0" class="bpmn-task-marker"/>
  </g>`;
  if (subtype === 'script') return `<g transform="${t}">
    <rect x="-5" y="-6" width="10" height="12" rx="1" class="bpmn-task-marker"/>
    <line x1="-3" y1="-2" x2="3" y2="-2" class="bpmn-task-marker"/>
    <line x1="-3" y1="1" x2="3" y2="1" class="bpmn-task-marker"/>
    <line x1="-3" y1="4" x2="1" y2="4" class="bpmn-task-marker"/>
  </g>`;
  if (subtype === 'receive') return `<g transform="${t}">
    <rect x="-6" y="-5" width="12" height="9" rx="1" class="bpmn-task-marker"/>
    <polyline points="-5,-4 0,-1 5,-4" class="bpmn-task-marker" fill="none"/>
  </g>`;
  if (subtype === 'send') return `<g transform="${t}">
    <rect x="-6" y="-5" width="12" height="9" rx="1" class="bpmn-task-marker"/>
    <polyline points="-6,-5 0,0 6,-5" class="bpmn-task-marker" fill="none"/>
  </g>`;
  return '';
}

function gatewayMarkerSvg(subtype: string | undefined, x: number, y: number): string {
  if (subtype === 'xor') return `
    <line x1="${x-8}" y1="${y-8}" x2="${x+8}" y2="${y+8}" class="bpmn-gateway-marker" stroke-linecap="round"/>
    <line x1="${x+8}" y1="${y-8}" x2="${x-8}" y2="${y+8}" class="bpmn-gateway-marker" stroke-linecap="round"/>`;
  if (subtype === 'and') return `
    <line x1="${x}" y1="${y-10}" x2="${x}" y2="${y+10}" class="bpmn-gateway-marker" stroke-linecap="round"/>
    <line x1="${x-10}" y1="${y}" x2="${x+10}" y2="${y}" class="bpmn-gateway-marker" stroke-linecap="round"/>`;
  if (subtype === 'or') return `
    <circle cx="${x}" cy="${y}" r="8" class="bpmn-gateway-or-marker"/>
    <line x1="${x}" y1="${y-5}" x2="${x}" y2="${y+5}" class="bpmn-gateway-or-marker" stroke-linecap="round"/>
    <line x1="${x-5}" y1="${y}" x2="${x+5}" y2="${y}" class="bpmn-gateway-or-marker" stroke-linecap="round"/>`;
  return '';
}

function renderNodeSvg(node: BpmnNode, lnode: BpmnLayoutNode): string {
  const { x, y, width, height } = lnode;

  if (node.kind === 'event' && node.position === 'start') return `<g>
    <circle cx="${x}" cy="${y}" r="18" class="bpmn-event"/>
    <circle cx="${x}" cy="${y}" r="10" class="bpmn-event-start-inner"/>
    <text x="${x}" y="${y+30}" text-anchor="middle" font-size="11" class="bpmn-text">${esc(node.label)}</text>
  </g>`;

  if (node.kind === 'event' && node.position === 'end') return `<g>
    <circle cx="${x}" cy="${y}" r="18" class="bpmn-event-end"/>
    <circle cx="${x}" cy="${y}" r="11" class="bpmn-event-end"/>
    <text x="${x}" y="${y+30}" text-anchor="middle" font-size="11" class="bpmn-text">${esc(node.label)}</text>
  </g>`;

  if (node.kind === 'task') {
    const hw = width / 2, hh = height / 2;
    const rawLabel = node.label ?? '';
    const label = rawLabel.length > 18 ? rawLabel.slice(0, 16) + '…' : rawLabel;
    return `<g>
      <rect x="${x-hw}" y="${y-hh}" width="${width}" height="${height}" rx="6" class="bpmn-task"/>
      ${taskMarkerSvg(node.subtype, x - hw + 14, y - hh + 12)}
      <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="11" class="bpmn-text">${esc(label)}</text>
    </g>`;
  }

  if (node.kind === 'gateway') {
    const h = 24;
    return `<g>
      <polygon points="${x},${y-h} ${x+h},${y} ${x},${y+h} ${x-h},${y}" class="bpmn-gateway"/>
      ${gatewayMarkerSvg(node.subtype, x, y)}
      <text x="${x}" y="${y+h+14}" text-anchor="middle" font-size="11" class="bpmn-text">${esc(node.label)}</text>
    </g>`;
  }
  return '';
}

function renderFlowSvg(flow: BpmnFlow, layout: BpmnLayout, diagramId: string): string {
  const edge = layout.edges.find(e => e.from === flow.source && e.to === flow.target);
  const fromN = layout.nodes.find(n => n.id === flow.source);
  const toN = layout.nodes.find(n => n.id === flow.target);
  if (!edge || !fromN || !toN) return '';

  const s = edge.points[0], e2 = edge.points[1];
  const dx = e2.x - s.x, dy = e2.y - s.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return '';

  const fr = Math.max(fromN.width, fromN.height) / 2;
  const tr = Math.max(toN.width, toN.height) / 2;
  const p1x = s.x + dx * (fr / dist), p1y = s.y + dy * (fr / dist);
  const p2x = e2.x - dx * (tr / dist), p2y = e2.y - dy * (tr / dist);
  const mx = (p1x + p2x) / 2, my = (p1y + p2y) / 2;

  const arrowEnd = flow.kind === 'message'
    ? `url(#${diagramId}-arrow-msg)`
    : `url(#${diagramId}-arrow)`;
  const slashStart = flow.kind === 'default'
    ? `marker-start="url(#${diagramId}-slash)"`
    : '';

  return `<g>
    <line x1="${p1x}" y1="${p1y}" x2="${p2x}" y2="${p2y}"
      class="bpmn-flow-${flow.kind}" stroke-width="1.8"
      marker-end="${arrowEnd}" ${slashStart}/>
    ${flow.label ? `<text x="${mx}" y="${my-8}" text-anchor="middle" font-size="10" class="bpmn-text-muted">${esc(flow.label)}</text>` : ''}
  </g>`;
}

function renderPoolsSvg(pools: PoolLayout[], lanes: LaneLayout[]): string {
  return [
    ...pools.map(p => `<g>
      <rect x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" class="bpmn-pool"/>
      <rect x="${p.x}" y="${p.y}" width="${p.headerWidth}" height="${p.height}" class="bpmn-pool-header"/>
      <text x="${p.x + p.headerWidth/2}" y="${p.y + p.height/2}"
        text-anchor="middle" dominant-baseline="middle"
        font-size="12" font-weight="600" class="bpmn-text-label"
        transform="rotate(-90,${p.x + p.headerWidth/2},${p.y + p.height/2})">${esc(p.label)}</text>
    </g>`),
    ...lanes.map(l => `<g>
      <rect x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" class="bpmn-lane"/>
      <rect x="${l.x}" y="${l.y}" width="${l.headerWidth}" height="${l.height}" class="bpmn-lane-header"/>
      <text x="${l.x + l.headerWidth/2}" y="${l.y + l.height/2}"
        text-anchor="middle" dominant-baseline="middle"
        font-size="11" class="bpmn-text">${esc(l.label)}</text>
    </g>`),
  ].join('\n');
}

// Scoped marker IDs prevent conflicts when multiple bpmn-beta diagrams
// appear on the same page (each diagram id is unique).
function defsSvg(styles: string, did: string): string {
  return `<defs>
    <style>${styles}</style>
    <marker id="${did}-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" class="bpmn-arrow"/>
    </marker>
    <marker id="${did}-arrow-msg" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" class="bpmn-arrow-open" stroke-width="1"/>
    </marker>
    <marker id="${did}-slash" markerWidth="8" markerHeight="10" refX="4" refY="5" orient="auto">
      <line x1="6" y1="1" x2="2" y2="9" class="bpmn-slash"/>
    </marker>
  </defs>`;
}

// ---------------------------------------------------------------------------
// DrawDefinition
//
// Mermaid interface:
//   (text: string, id: string, version: string, diagramObject: Diagram)
//     => void | Promise<void>
//
// Mermaid creates an <svg id={id}> element before calling draw(). This
// function sets viewBox / aria attributes on that element and injects the
// inner SVG markup.
// ---------------------------------------------------------------------------
async function draw(
  text: string,
  id: string,
  _version: string,
  diagramObject?: { db?: BpmnDb },
): Promise<void> {
  const el = document.getElementById(id);
  if (!el) return;

  // Prefer the pre-populated shared db from diagramObject. Re-parse only if
  // the db is empty (e.g. lazy-loaded diagram where parser hasn't run yet).
  let drawDb: BpmnDb;
  const injectedDb = diagramObject?.db;
  if (injectedDb instanceof BpmnDb && injectedDb.getNodes().length > 0) {
    drawDb = injectedDb;
  } else {
    drawDb = new BpmnDb();
    const parsed = parse(text);
    for (const n of parsed.getNodes()) drawDb.addNode(n);
    for (const f of parsed.getFlows()) drawDb.addFlow(f);
    for (const p of parsed.getPools()) drawDb.addPool(p);
    for (const l of parsed.getLanes()) drawDb.addLane(l);
    const t = parsed.getAccTitle(); if (t) drawDb.setAccTitle(t);
    const d = parsed.getAccDescription(); if (d) drawDb.setAccDescription(d);
  }

  const layout = layoutGraph(drawDb);
  const pad = 60;
  const vbX = 0;
  const vbY = layout.hasPools ? -pad / 2 : -layout.height / 2 - pad;
  const vbW = layout.width + pad;
  const vbH = layout.hasPools ? layout.height + pad : layout.height + pad * 2;

  // Read Mermaid's resolved theme variables if available (avoids hard-coded colors).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mermaidGlobal = typeof window !== 'undefined' ? (window as any).mermaid : undefined;
  const themeVars = mermaidGlobal?.mermaidAPI?.getConfig?.()?.themeVariables ?? {};
  const styles = getStyles(buildMermaidTheme(themeVars));

  const title = drawDb.getAccTitle() ?? 'BPMN Diagram';
  const desc = drawDb.getAccDescription() ?? '';

  el.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-labelledby', `${id}-title ${id}-desc`);
  el.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  el.innerHTML = [
    `<title id="${id}-title">${esc(title)}</title>`,
    `<desc id="${id}-desc">${esc(desc)}</desc>`,
    defsSvg(styles, id),
    layout.hasPools ? renderPoolsSvg(layout.pools, layout.lanes) : '',
    ...drawDb.getFlows().map(f => renderFlowSvg(f, layout, id)),
    ...drawDb.getNodes().map(node => {
      const ln = layout.nodes.find(n => n.id === node.id);
      return ln ? renderNodeSvg(node, ln) : '';
    }),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// ExternalDiagramDefinition
//
// Pass this to mermaid.registerExternalDiagrams([bpmnPlugin]).
// The loader is async to support Mermaid's lazy-load pattern — the diagram
// modules are only imported when a bpmn-beta diagram is actually encountered.
// ---------------------------------------------------------------------------
export const bpmnPlugin = {
  id: DETECTOR_KEY,

  // DiagramDetector: (text, config?) => boolean
  detector: detect,

  // DiagramLoader: () => Promise<{ id, diagram: DiagramDefinition }>
  loader: async () => ({
    id: DETECTOR_KEY,
    diagram: {
      db,
      renderer: { draw },
      parser: parserDef,
      // DiagramStylesProvider: (options?) => string
      // Mermaid passes resolved themeVariables as `options`.
      styles: (options?: Record<string, string>) =>
        getStyles(buildMermaidTheme(options)),
    },
  }),
};

export default bpmnPlugin;
