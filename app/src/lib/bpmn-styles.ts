export interface BpmnThemeOptions {
  lineColor: string;
  mainBkg: string;
  nodeBorder: string;
  clusterBkg: string;
  textColor: string;
  primaryColor: string;
  fontFamily?: string;
  monoFontFamily?: string;
}

export function getStyles(options: BpmnThemeOptions): string {
  const fontFamily = options.fontFamily ?? "var(--app-font-sans, 'DM Sans', system-ui, sans-serif)";
  const monoFontFamily = options.monoFontFamily ?? "var(--app-font-mono, 'JetBrains Mono', monospace)";

  return `
    .bpmn-event { fill: ${options.mainBkg}; stroke: ${options.nodeBorder}; stroke-width: 2; }
    .bpmn-event-end { fill: ${options.primaryColor}; stroke: ${options.primaryColor}; stroke-width: 3; }
    .bpmn-event-start-inner { fill: ${options.primaryColor}; opacity: 0.25; }
    .bpmn-task { fill: ${options.mainBkg}; stroke: ${options.nodeBorder}; stroke-width: 1.5; }
    .bpmn-task-hover { fill: ${options.primaryColor}; fill-opacity: 0.12; stroke: ${options.primaryColor}; stroke-width: 2; pointer-events: none; }
    .bpmn-task-ext { fill: none; stroke: ${options.nodeBorder}; stroke-width: 2; stroke-dasharray: 5 3; pointer-events: none; }
    .bpmn-task-marker { stroke: ${options.lineColor}; fill: none; stroke-width: 1.5; }
    .bpmn-task-text { fill: ${options.textColor}; }
    .bpmn-gateway { fill: ${options.mainBkg}; stroke: ${options.lineColor}; stroke-width: 1.8; }
    .bpmn-gateway-marker { stroke: ${options.lineColor}; fill: none; stroke-width: 2; stroke-linecap: round; }
    .bpmn-gateway-or-marker { stroke: ${options.lineColor}; fill: none; stroke-width: 1.5; }
    .bpmn-pool { fill: none; stroke: ${options.nodeBorder}; stroke-width: 1.5; }
    .bpmn-pool-header { fill: ${options.clusterBkg}; stroke: ${options.nodeBorder}; stroke-width: 1.5; opacity: 0.7; }
    .bpmn-lane { fill: none; stroke: ${options.nodeBorder}; stroke-width: 1; }
    .bpmn-lane-header { fill: ${options.clusterBkg}; stroke: ${options.nodeBorder}; stroke-width: 1; opacity: 0.4; }
    .bpmn-flow-sequence { stroke: ${options.lineColor}; opacity: 0.85; }
    .bpmn-flow-conditional { stroke: ${options.lineColor}; opacity: 0.85; }
    .bpmn-flow-default { stroke: ${options.lineColor}; opacity: 0.85; }
    .bpmn-flow-message { stroke: ${options.lineColor}; opacity: 0.85; stroke-dasharray: 6 4; }
    .bpmn-flow-association { stroke: ${options.nodeBorder}; opacity: 0.7; stroke-dasharray: 2 3; }
    .bpmn-flow--association { stroke: ${options.nodeBorder}; opacity: 0.7; stroke-dasharray: 2 3; }
    .bpmn-arrow { fill: ${options.lineColor}; }
    .bpmn-arrow-open { fill: none; stroke: ${options.lineColor}; stroke-width: 1; }
    .bpmn-slash { stroke: ${options.lineColor}; stroke-width: 1.5; }
    .bpmn-text { fill: ${options.textColor}; font-family: ${fontFamily}; }
    .bpmn-text-muted { fill: ${options.lineColor}; opacity: 0.7; font-family: ${monoFontFamily}; }
    .bpmn-text-label { fill: ${options.textColor}; font-family: ${fontFamily}; font-weight: 600; }
  `;
}

// Used by the playground (CSS custom properties are resolved by Tailwind in the browser DOM).
export const LIGHT_THEME: BpmnThemeOptions = {
  lineColor: 'hsl(var(--foreground))',
  mainBkg: 'hsl(var(--card))',
  nodeBorder: 'hsl(var(--border))',
  clusterBkg: 'hsl(var(--muted))',
  textColor: 'hsl(var(--foreground))',
  primaryColor: 'hsl(var(--primary))',
};

// Used only for downloaded SVGs. Vector editors do not resolve the app's CSS
// custom properties, so exports must carry the resolved light-palette values.
export const EXPORT_THEME: BpmnThemeOptions = {
  lineColor: '#0f172a',
  mainBkg: '#f6f2ee',
  nodeBorder: '#e9d4af',
  clusterBkg: '#e9e4dd',
  textColor: '#0f172a',
  primaryColor: '#c46a2c',
  // Exports must not depend on the app's bundled DM Sans / JetBrains Mono
  // fonts. Broad system stacks are available to browser previews and common
  // vector editors without adding font files, licensing obligations, or large
  // base64 payloads to every downloaded SVG.
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  monoFontFamily: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace",
};

// Fallback theme with concrete values for Mermaid's SVG context where CSS
// custom properties defined by Tailwind are not available.
export const MERMAID_FALLBACK_THEME: BpmnThemeOptions = {
  primaryColor: '#111827',   /* near-black node fill  */
  lineColor:    '#c46a2c',   /* rust-orange           */
  mainBkg:      '#111827',   /* near-black — matches primaryColor, canonical sibling value */
  nodeBorder:   '#c46a2c',   /* rust-orange border    */
  clusterBkg:   '#0d1117',   /* deep workbench        */
  textColor:    '#e5e7eb',   /* near-white text       */
};

/**
 * Build a BpmnThemeOptions object from Mermaid's themeVariables config block.
 *
 * Mermaid passes its resolved themeVariables to the diagram's `styles` provider.
 * The keys below match Mermaid's own theme variable names:
 *   https://mermaid.js.org/config/theming.html
 *
 * Falls back to MERMAID_FALLBACK_THEME values for any missing key.
 */
export function buildMermaidTheme(themeVariables?: Record<string, string>): BpmnThemeOptions {
  const v = themeVariables ?? {};
  return {
    primaryColor:  v['primaryColor']      ?? MERMAID_FALLBACK_THEME.primaryColor,
    lineColor:     v['lineColor']         ?? v['edgeLabelBackground'] ?? MERMAID_FALLBACK_THEME.lineColor,
    mainBkg:       v['mainBkg']           ?? v['primaryColor']        ?? MERMAID_FALLBACK_THEME.mainBkg,
    nodeBorder:    v['nodeBorder']        ?? v['lineColor']           ?? MERMAID_FALLBACK_THEME.nodeBorder,
    clusterBkg:    v['clusterBkg']        ?? MERMAID_FALLBACK_THEME.clusterBkg,
    textColor:     v['textColor']         ?? v['primaryTextColor']    ?? MERMAID_FALLBACK_THEME.textColor,
  };
}
