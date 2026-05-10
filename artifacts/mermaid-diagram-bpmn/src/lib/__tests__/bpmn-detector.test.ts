import { describe, it, expect } from 'vitest';
import { detect, DETECTOR_KEY } from '../bpmn-detector';

describe('detect', () => {
  it('returns true for a bpmn-beta header', () => {
    expect(detect('bpmn-beta\nstart s1 "Hello"')).toBe(true);
  });

  it('returns false for flowchart syntax', () => {
    expect(detect('graph TD\nA --> B')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(detect('')).toBe(false);
  });

  it('ignores %% comments before header', () => {
    expect(detect('%% comment\nbpmn-beta\nstart s1 "Hello"')).toBe(true);
  });

  it('returns false when bpmn-beta is not on first non-comment line', () => {
    expect(detect('start s1 "Hello"\nbpmn-beta')).toBe(false);
  });

  it('exports the correct DETECTOR_KEY constant', () => {
    expect(DETECTOR_KEY).toBe('BPMNDiagram');
  });
});
