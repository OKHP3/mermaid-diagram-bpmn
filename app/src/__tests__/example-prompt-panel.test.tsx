// @vitest-environment happy-dom
// Tests for the ExamplePromptPanel localStorage persistence behaviour.
// The panel is always rendered with a storageKey unless stated otherwise.
// The accordion starts collapsed — tests open it before checking the toolbar/phrases.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ExamplePromptPanel } from '@/components/skills/ExamplePromptPanel';

// Minimal steps — skill IDs that don't match SKILLS are handled gracefully
// (the skill label row is simply omitted in the render).
const STEPS = [
  { skillId: 'test-skill-a', triggerUsed: 'default phrase one' },
  { skillId: 'test-skill-b', triggerUsed: 'default phrase two' },
];

const STORAGE_KEY = 'bp-skill:prompts:test-panel';

// ── helpers ──────────────────────────────────────────────────────────────────

function renderOpen(props: Parameters<typeof ExamplePromptPanel>[0]) {
  const utils = render(<ExamplePromptPanel {...props} />);
  // Click the header to open the accordion
  fireEvent.click(utils.getByRole('button', { name: /Copy prompt sequence/i }));
  return utils;
}

// ── test suite ────────────────────────────────────────────────────────────────

describe('ExamplePromptPanel — localStorage persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ── 1. Clean storage → defaults ──────────────────────────────────────────

  it('renders default phrases when localStorage is empty', () => {
    const { getAllByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas).toHaveLength(STEPS.length);
    expect(textareas[0].value).toBe('default phrase one');
    expect(textareas[1].value).toBe('default phrase two');
  });

  it('does not show "Reset to example" when storage is empty (nothing is dirty)', () => {
    const { queryByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    expect(queryByRole('button', { name: /Reset to example/i })).toBeNull();
  });

  // ── 2. Saved value → restored phrases ────────────────────────────────────

  it('restores saved phrases from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['saved one', 'saved two']));
    const { getAllByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas[0].value).toBe('saved one');
    expect(textareas[1].value).toBe('saved two');
  });

  it('shows "Reset to example" when saved phrases differ from defaults', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['changed', 'default phrase two']));
    const { getByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    expect(getByRole('button', { name: /Reset to example/i })).not.toBeNull();
  });

  // ── 3. Corrupt / wrong-length storage → falls back to defaults ─────────────

  it('falls back to defaults when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{ not valid json !!');
    const { getAllByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas[0].value).toBe('default phrase one');
    expect(textareas[1].value).toBe('default phrase two');
  });

  it('falls back to defaults when the saved array is too short', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['only one']));
    const { getAllByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas[0].value).toBe('default phrase one');
  });

  it('falls back to defaults when the saved array is too long', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['a', 'b', 'c']));
    const { getAllByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas[0].value).toBe('default phrase one');
  });

  it('falls back to defaults when saved value is not an array (e.g. a plain string)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify('just a string'));
    const { getAllByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas[0].value).toBe('default phrase one');
  });

  it('does not show "Reset to example" after a corrupt-storage fallback (not dirty)', () => {
    localStorage.setItem(STORAGE_KEY, '!!!bad!!!');
    const { queryByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    expect(queryByRole('button', { name: /Reset to example/i })).toBeNull();
  });

  // ── 4. Edit → writes to localStorage ────────────────────────────────────

  it('writes updated phrases to localStorage when a phrase is edited', () => {
    const { getAllByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    fireEvent.change(textareas[0], { target: { value: 'edited phrase one' } });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored[0]).toBe('edited phrase one');
    expect(stored[1]).toBe('default phrase two');
  });

  it('shows "Reset to example" after an edit', () => {
    const { getAllByRole, getByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    fireEvent.change(textareas[0], { target: { value: 'something different' } });
    expect(getByRole('button', { name: /Reset to example/i })).not.toBeNull();
  });

  it('keeps other phrases unchanged in localStorage when only one is edited', () => {
    const { getAllByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    fireEvent.change(textareas[1], { target: { value: 'only second changed' } });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored[0]).toBe('default phrase one');
    expect(stored[1]).toBe('only second changed');
  });

  // ── 5. Reset → removes from localStorage, restores defaults ─────────────

  it('removes the storage key when "Reset to example" is clicked', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['x', 'y']));
    const { getByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    fireEvent.click(getByRole('button', { name: /Reset to example/i }));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('restores default phrase values after reset', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['x', 'y']));
    const { getAllByRole, getByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    fireEvent.click(getByRole('button', { name: /Reset to example/i }));
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas[0].value).toBe('default phrase one');
    expect(textareas[1].value).toBe('default phrase two');
  });

  it('hides "Reset to example" after reset (no longer dirty)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['x', 'y']));
    const { getByRole, queryByRole } = renderOpen({ steps: STEPS, storageKey: STORAGE_KEY });
    fireEvent.click(getByRole('button', { name: /Reset to example/i }));
    expect(queryByRole('button', { name: /Reset to example/i })).toBeNull();
  });

  // ── 6. No storageKey → no persistence, no reset button ──────────────────

  it('does not write to localStorage when no storageKey is provided', () => {
    const { getAllByRole } = renderOpen({ steps: STEPS });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    fireEvent.change(textareas[0], { target: { value: 'changed' } });
    expect(localStorage.length).toBe(0);
  });

  it('never shows "Reset to example" when no storageKey is provided', () => {
    const { getAllByRole, queryByRole } = renderOpen({ steps: STEPS });
    const textareas = getAllByRole('textbox') as HTMLTextAreaElement[];
    fireEvent.change(textareas[0], { target: { value: 'changed' } });
    expect(queryByRole('button', { name: /Reset to example/i })).toBeNull();
  });
});
