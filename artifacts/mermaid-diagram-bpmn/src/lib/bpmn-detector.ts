export const DETECTOR_KEY = 'BPMNDiagram';

export function detect(text: string): boolean {
  const stripped = text
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/%%\{[\s\S]*?\}%%\n?/g, '')
    .replace(/%%[^\n]*\n?/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  return stripped[0] === 'bpmn-beta';
}
