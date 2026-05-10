export interface BpmnThemeOptions {
  lineColor: string;
  mainBkg: string;
  nodeBorder: string;
  clusterBkg: string;
  textColor: string;
  primaryColor: string;
}

export function getStyles(options: BpmnThemeOptions): string {
  return `
    .bpmn-event { fill: ${options.mainBkg}; stroke: ${options.nodeBorder}; stroke-width: 2; }
    .bpmn-event-end { fill: ${options.primaryColor}; stroke: ${options.primaryColor}; stroke-width: 3; }
    .bpmn-event-start-inner { fill: ${options.primaryColor}; opacity: 0.25; }
    .bpmn-task { fill: ${options.mainBkg}; stroke: ${options.nodeBorder}; stroke-width: 1.5; }
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
    .bpmn-arrow { fill: ${options.lineColor}; }
    .bpmn-arrow-open { fill: none; stroke: ${options.lineColor}; stroke-width: 1; }
    .bpmn-slash { stroke: ${options.lineColor}; stroke-width: 1.5; }
    .bpmn-text { fill: ${options.textColor}; font-family: var(--app-font-sans, sans-serif); }
    .bpmn-text-muted { fill: ${options.lineColor}; opacity: 0.7; font-family: var(--app-font-mono, monospace); }
    .bpmn-text-label { fill: ${options.textColor}; font-family: var(--app-font-sans, sans-serif); font-weight: 600; }
  `;
}

export const LIGHT_THEME: BpmnThemeOptions = {
  lineColor: 'hsl(var(--foreground))',
  mainBkg: 'hsl(var(--card))',
  nodeBorder: 'hsl(var(--border))',
  clusterBkg: 'hsl(var(--muted))',
  textColor: 'hsl(var(--foreground))',
  primaryColor: 'hsl(var(--primary))',
};
