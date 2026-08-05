/**
 * bpmn-shapes.ts
 *
 * Shared shape geometry for bpmn-beta diagrams.
 *
 * Consumed by:
 *   - bpmn-plugin.ts  (SVG string output for Mermaid draw())
 *   - bpmn-renderer.tsx (React JSX output for the playground)
 *
 * Authoring rule: this module must remain framework-agnostic and have no
 * runtime dependencies beyond plain TypeScript. Do not import React here.
 */

// ---------------------------------------------------------------------------
// Geometry constants — single source of truth for all shape dimensions
// ---------------------------------------------------------------------------

/** Radius of start and end event circles. */
export const EVENT_RADIUS = 18;

/** Inner ring radius on start events. */
export const EVENT_START_INNER_RADIUS = 10;

/** Inner ring radius on end events (bold-stroke double ring). */
export const EVENT_END_INNER_RADIUS = 11;

/** Half-size of the gateway diamond (from centre to each cardinal point). */
export const GATEWAY_HALF = 24;

/** Border-radius on task rectangles. */
export const TASK_RX = 6;

/** Horizontal offset of task marker icon from the left edge of the task box. */
export const TASK_MARKER_OFFSET_X = 14;

/** Vertical offset of task marker icon from the top edge of the task box. */
export const TASK_MARKER_OFFSET_Y = 12;

/** Primary font size for node and flow labels. */
export const LABEL_FONT_SIZE = 11;

/** Font size for pool and lane header labels. */
export const POOL_LABEL_FONT_SIZE = 12;

/** Maximum label character count before truncation kicks in. */
export const LABEL_MAX_LEN = 18;

/** Number of characters kept when a label is truncated (rest is replaced with …). */
export const LABEL_TRUNCATE_LEN = 16;

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------

/**
 * HTML/XML-escape a string for safe inclusion in SVG attributes or text nodes.
 *
 * Used by the plugin's SVG-string renderer. React JSX handles escaping itself,
 * so the React renderer does not call this function directly.
 */
export function escapeXml(s: string | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Truncate a node label so it fits within a task box.
 * Used by both the plugin renderer and the React renderer.
 */
export function truncateLabel(label: string | undefined): string {
  const raw = label ?? '';
  return raw.length > LABEL_MAX_LEN ? raw.slice(0, LABEL_TRUNCATE_LEN) + '\u2026' : raw;
}

// ---------------------------------------------------------------------------
// SVG string helpers — used by bpmn-plugin.ts
//
// These functions return SVG string fragments. The React renderer (bpmn-renderer.tsx)
// uses equivalent JSX components but shares the geometry constants above.
// ---------------------------------------------------------------------------

/**
 * Returns an SVG string fragment for a task subtype marker icon.
 * @param subtype - task subtype: 'user' | 'service' | 'script' | 'receive' | 'send'
 * @param ix - icon anchor x = taskBox.left + TASK_MARKER_OFFSET_X
 * @param iy - icon anchor y = taskBox.top  + TASK_MARKER_OFFSET_Y
 */
export function taskMarkerSvg(subtype: string | undefined, ix: number, iy: number): string {
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

/**
 * Returns an SVG string fragment for a gateway subtype marker.
 * @param subtype - gateway subtype: 'xor' | 'and' | 'or'
 * @param x - diamond centre x
 * @param y - diamond centre y
 */
export function gatewayMarkerSvg(subtype: string | undefined, x: number, y: number): string {
  if (subtype === 'xor') return `
    <line x1="${x - 8}" y1="${y - 8}" x2="${x + 8}" y2="${y + 8}" class="bpmn-gateway-marker" stroke-linecap="round"/>
    <line x1="${x + 8}" y1="${y - 8}" x2="${x - 8}" y2="${y + 8}" class="bpmn-gateway-marker" stroke-linecap="round"/>`;
  if (subtype === 'and') return `
    <line x1="${x}" y1="${y - 10}" x2="${x}" y2="${y + 10}" class="bpmn-gateway-marker" stroke-linecap="round"/>
    <line x1="${x - 10}" y1="${y}" x2="${x + 10}" y2="${y}" class="bpmn-gateway-marker" stroke-linecap="round"/>`;
  if (subtype === 'or') return `
    <circle cx="${x}" cy="${y}" r="8" class="bpmn-gateway-or-marker"/>
    <line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" class="bpmn-gateway-or-marker" stroke-linecap="round"/>
    <line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}" class="bpmn-gateway-or-marker" stroke-linecap="round"/>`;
  return '';
}
