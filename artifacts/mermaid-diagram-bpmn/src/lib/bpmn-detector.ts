// DiagramDetector contract: (text: string, config?: MermaidConfig) => boolean
// The config parameter is accepted but unused — detection is purely text-based.
export const DETECTOR_KEY = 'BPMNDiagram';

export function detect(text: string, _config?: Record<string, unknown>): boolean {
  const stripped = text
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/%%\{[\s\S]*?\}%%\n?/g, '')
    .replace(/%%[^\n]*\n?/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  return stripped[0] === 'bpmn-beta';
}
