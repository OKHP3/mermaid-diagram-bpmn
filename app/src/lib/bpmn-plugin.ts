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
import {
  escapeXml,
  truncateLabel,
  taskMarkerSvg,
  gatewayMarkerSvg,
  EVENT_RADIUS,
  EVENT_START_INNER_RADIUS,
  EVENT_END_INNER_RADIUS,
  EVENT_INTERMEDIATE_INNER_RADIUS,
  GATEWAY_HALF,
  TASK_RX,
  TASK_MARKER_OFFSET_X,
  TASK_MARKER_OFFSET_Y,
  LABEL_FONT_SIZE,
  POOL_LABEL_FONT_SIZE,
} from './bpmn-shapes.js';

// ---------------------------------------------------------------------------
// Mermaid version this plugin is validated against.
// Add `mermaid` as a devDependency pinned to this version when running
// the plugin integration tests.
// ---------------------------------------------------------------------------
export const MERMAID_VERSION_TARGET = '11.4.1';

// ---------------------------------------------------------------------------
// Shared DiagramDB instance
//
// Mermaid convention: the parser populates a module-level db (exposed as
// parser.yy). The renderer reads from diagramObject.db, which is the same
// instance. Calling db.clear() before each parse prevents state leakage.
// ---------------------------------------------------------------------------
const db = new BpmnDb();

// ---------------------------------------------------------------------------
// FR-018: Live theme-variable cache
//
// Mermaid calls the styles() provider with resolved themeVariables before
// each render. We cache those here so draw() can embed the same resolved
// colors in the SVG <defs> without polling window.mermaid.mermaidAPI.
// Falls back to MERMAID_FALLBACK_THEME for any missing key.
// ---------------------------------------------------------------------------
let _cachedThemeVars: Record<string, string> = {};

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
// SVG string helpers (from bpmn-shapes.ts + local node/flow/pool assembly)
//
// taskMarkerSvg(), gatewayMarkerSvg(), escapeXml(), truncateLabel() and all
// geometry constants are imported from bpmn-shapes.ts (shared with the React
// renderer). The full node/flow/pool assembly remains plugin-local since it
// produces SVG strings rather than React JSX.
// ---------------------------------------------------------------------------




function renderNodeSvg(node: BpmnNode, lnode: BpmnLayoutNode): string {
  const { x, y, width, height } = lnode;

  if (node.kind === 'event' && node.position === 'start') return `<g>
    <circle cx="${x}" cy="${y}" r="${EVENT_RADIUS}" class="bpmn-event"/>
    <circle cx="${x}" cy="${y}" r="${EVENT_START_INNER_RADIUS}" class="bpmn-event-start-inner"/>
    <text x="${x}" y="${y+30}" text-anchor="middle" font-size="${LABEL_FONT_SIZE}" class="bpmn-text">${escapeXml(node.label)}</text>
  </g>`;

  if (node.kind === 'event' && node.position === 'end') return `<g>
    <circle cx="${x}" cy="${y}" r="${EVENT_RADIUS}" class="bpmn-event-end"/>
    <circle cx="${x}" cy="${y}" r="${EVENT_END_INNER_RADIUS}" class="bpmn-event-end"/>
    <text x="${x}" y="${y+30}" text-anchor="middle" font-size="${LABEL_FONT_SIZE}" class="bpmn-text">${escapeXml(node.label)}</text>
  </g>`;

  if (node.kind === 'event' && node.position === 'intermediate') return `<g>
    <circle cx="${x}" cy="${y}" r="${EVENT_RADIUS}" class="bpmn-event"/>
    <circle cx="${x}" cy="${y}" r="${EVENT_INTERMEDIATE_INNER_RADIUS}" class="bpmn-event"/>
    <text x="${x}" y="${y+30}" text-anchor="middle" font-size="${LABEL_FONT_SIZE}" class="bpmn-text">${escapeXml(node.label)}</text>
  </g>`;

  if (node.kind === 'task') {
    const hw = width / 2, hh = height / 2;
    return `<g>
      <rect x="${x-hw}" y="${y-hh}" width="${width}" height="${height}" rx="${TASK_RX}" class="bpmn-task"/>
      ${taskMarkerSvg(node.subtype, x - hw + TASK_MARKER_OFFSET_X, y - hh + TASK_MARKER_OFFSET_Y)}
      <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${LABEL_FONT_SIZE}" class="bpmn-text">${escapeXml(truncateLabel(node.label))}</text>
    </g>`;
  }

  if (node.kind === 'subprocess') {
    const hw = width / 2, hh = height / 2;
    const markerY = y + hh - 9;
    return `<g>
      <rect x="${x-hw}" y="${y-hh}" width="${width}" height="${height}" rx="${TASK_RX}" class="bpmn-task"/>
      <line x1="${x-5}" y1="${markerY}" x2="${x+5}" y2="${markerY}" class="bpmn-subprocess-marker"/>
      <line x1="${x}" y1="${markerY-5}" x2="${x}" y2="${markerY+5}" class="bpmn-subprocess-marker"/>
      <text x="${x}" y="${y-3}" text-anchor="middle" dominant-baseline="middle" font-size="${LABEL_FONT_SIZE}" class="bpmn-text">${escapeXml(truncateLabel(node.label))}</text>
    </g>`;
  }

  if (node.kind === 'gateway') {
    const h = 24;
    return `<g>
      <polygon points="${x},${y-h} ${x+h},${y} ${x},${y+h} ${x-h},${y}" class="bpmn-gateway"/>
      ${gatewayMarkerSvg(node.subtype, x, y)}
      <text x="${x}" y="${y+h+14}" text-anchor="middle" font-size="${LABEL_FONT_SIZE}" class="bpmn-text">${escapeXml(node.label)}</text>
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

  const isAssociation = flow.kind === 'association';
  const arrowEnd = isAssociation
    ? ''
    : flow.kind === 'message'
      ? `url(#${diagramId}-arrow-msg)`
      : `url(#${diagramId}-arrow)`;
  const slashStart = flow.kind === 'default'
    ? `marker-start="url(#${diagramId}-slash)"`
    : '';
  const dash = isAssociation ? 'stroke-dasharray="2 3"' : '';

  return `<g>
    <line x1="${p1x}" y1="${p1y}" x2="${p2x}" y2="${p2y}"
      class="${isAssociation ? 'bpmn-flow--association' : `bpmn-flow-${flow.kind}`}" stroke-width="1.8"
      ${dash} ${arrowEnd ? `marker-end="${arrowEnd}"` : ''} ${slashStart}/>
    ${flow.label ? `<text x="${mx}" y="${my-8}" text-anchor="middle" font-size="10" class="bpmn-text-muted">${escapeXml(flow.label)}</text>` : ''}
  </g>`;
}

function renderPoolsSvg(pools: PoolLayout[], lanes: LaneLayout[]): string {
  return [
    ...pools.map(p => `<g>
      <rect x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" class="bpmn-pool"/>
      <rect x="${p.x}" y="${p.y}" width="${p.headerWidth}" height="${p.height}" class="bpmn-pool-header"/>
      <text x="${p.x + p.headerWidth/2}" y="${p.y + p.height/2}"
        text-anchor="middle" dominant-baseline="middle"
        font-size="${POOL_LABEL_FONT_SIZE}" font-weight="600" class="bpmn-text-label"
        transform="rotate(-90,${p.x + p.headerWidth/2},${p.y + p.height/2})">${escapeXml(p.label)}</text>
    </g>`),
    ...lanes.map(l => `<g>
      <rect x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" class="bpmn-lane"/>
      <rect x="${l.x}" y="${l.y}" width="${l.headerWidth}" height="${l.height}" class="bpmn-lane-header"/>
      <text x="${l.x + l.headerWidth/2}" y="${l.y + l.height/2}"
        text-anchor="middle" dominant-baseline="middle"
        font-size="${LABEL_FONT_SIZE}" class="bpmn-text">${escapeXml(l.label)}</text>
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

  // FR-018: Use the theme variables last cached by the styles() provider.
  // This gives us the resolved Mermaid themeVariables at render time instead
  // of a static fallback, without requiring a window.mermaid global lookup.
  const styles = getStyles(buildMermaidTheme(_cachedThemeVars));

  const title = drawDb.getAccTitle() ?? 'BPMN Diagram';
  const desc = drawDb.getAccDescription() ?? '';

  el.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-labelledby', `${id}-title ${id}-desc`);
  el.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const innerContent = [
    `<title id="${id}-title">${escapeXml(title)}</title>`,
    `<desc id="${id}-desc">${escapeXml(desc)}</desc>`,
    defsSvg(styles, id),
    layout.hasPools ? renderPoolsSvg(layout.pools, layout.lanes) : '',
    ...drawDb.getFlows().map(f => renderFlowSvg(f, layout, id)),
    ...drawDb.getNodes().map(node => {
      const ln = layout.nodes.find(n => n.id === node.id);
      return ln ? renderNodeSvg(node, ln) : '';
    }),
  ].join('\n');

  // Inject SVG content via DOMParser('image/svg+xml') so every child element
  // is created with the correct SVG namespace. Setting innerHTML directly on
  // an existing SVG element is not reliable across DOM implementations:
  // in happy-dom and jsdom, HTML-mode parsing inside an SVG context drops
  // all sibling elements that follow a <defs> block (including <g> nodes
  // for flows and tasks). DOMPurify re-parses the SVG string through the
  // same HTML parser during sanitization, so any elements injected via
  // direct innerHTML would be stripped a second time.
  //
  // DOMParser('image/svg+xml') uses the XML parser, which:
  //  - Creates every element with the correct SVG namespace
  //  - Preserves all text content (including CSS inside <style>)
  //  - Does not have the post-<defs> sibling-drop bug
  //
  // document.importNode(child, true) then copies each parsed node into the
  // live HTML document, preserving namespace assignments.
  //
  // Falls back to direct innerHTML for environments where DOMParser is
  // unavailable (should not occur in any modern browser or Node.js).
  let injected = false;
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg">${innerContent}</svg>`,
        'image/svg+xml',
      );
      const parsedRoot = xmlDoc.documentElement;
      // On XML parse error, documentElement is <parsererror>
      if (parsedRoot.nodeName.toLowerCase() !== 'parsererror') {
        while (el.firstChild) el.removeChild(el.firstChild);
        const children = Array.from(parsedRoot.childNodes);
        for (const child of children) {
          el.appendChild(document.importNode(child, true));
        }
        injected = true;
      }
    } catch {
      /* fall through to innerHTML */
    }
  }
  if (!injected) {
    // Direct innerHTML — works in real browsers where the HTML parser correctly
    // assigns SVG namespace to children of an SVG element.
    el.innerHTML = innerContent;
  }
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
      // FR-018: Cache them here so draw() can use them at render time.
      styles: (options?: Record<string, string>) => {
        if (options) _cachedThemeVars = options;
        return getStyles(buildMermaidTheme(options));
      },
    },
  }),
};

export default bpmnPlugin;
