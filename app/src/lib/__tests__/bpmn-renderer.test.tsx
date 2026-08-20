// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BpmnRenderer } from '../bpmn-renderer';
import { LIGHT_THEME, MERMAID_FALLBACK_THEME, buildMermaidTheme, getStyles } from '../bpmn-styles';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('wouter', () => ({
  useLocation: () => ['/', mockNavigate],
}));

const MINIMAL_SOURCE = `bpmn-beta
start s1 "Start"
task t1 "My Task"
end e1 "End"
s1 --> t1
t1 --> e1`;

const ACCESSIBLE_SOURCE = `bpmn-beta
accTitle: Purchase request review
accDescr: A reviewer checks a purchase request and records the outcome.
start s1 "Start"
task t1 "Review request"
task t2 "Record outcome"
end e1 "End"
s1 --> t1
t1 --> t2
t2 --> e1`;

describe('BpmnRenderer — interactive behaviour', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders without interactive props and shows no role=button', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    expect(container.querySelector('[role="button"]')).toBeNull();
  });

  it('adds role=button on a task node that has a link', () => {
    const { container } = render(
      <BpmnRenderer source={MINIMAL_SOURCE} nodeLinks={{ t1: '/skills/my-task' }} />,
    );
    const button = container.querySelector('[role="button"]');
    expect(button).not.toBeNull();
  });

  it('shows hover overlay rect when a linked node is moused over', () => {
    const { container } = render(
      <BpmnRenderer source={MINIMAL_SOURCE} nodeLinks={{ t1: '/skills/my-task' }} />,
    );

    expect(container.querySelector('.bpmn-task-hover')).toBeNull();

    const button = container.querySelector('[role="button"]')!;
    fireEvent.mouseEnter(button);

    expect(container.querySelector('.bpmn-task-hover')).not.toBeNull();
  });

  it('removes hover overlay rect after mouse leaves', () => {
    const { container } = render(
      <BpmnRenderer source={MINIMAL_SOURCE} nodeLinks={{ t1: '/skills/my-task' }} />,
    );

    const button = container.querySelector('[role="button"]')!;
    fireEvent.mouseEnter(button);
    expect(container.querySelector('.bpmn-task-hover')).not.toBeNull();

    fireEvent.mouseLeave(button);
    expect(container.querySelector('.bpmn-task-hover')).toBeNull();
  });

  it('shows tooltip text when a node with a tooltip is moused over', () => {
    const { container, queryByText } = render(
      <BpmnRenderer
        source={MINIMAL_SOURCE}
        nodeLinks={{ t1: '/skills/my-task' }}
        nodeTooltips={{ t1: 'when the task is ready to start' }}
      />,
    );

    expect(queryByText(/when the task is ready to start/)).toBeNull();

    const button = container.querySelector('[role="button"]')!;
    fireEvent.mouseEnter(button, { clientX: 120, clientY: 80 });

    expect(queryByText(/when the task is ready to start/)).not.toBeNull();
  });

  it('hides tooltip after mouse leaves', () => {
    const { container, queryByText } = render(
      <BpmnRenderer
        source={MINIMAL_SOURCE}
        nodeLinks={{ t1: '/skills/my-task' }}
        nodeTooltips={{ t1: 'when the task is ready to start' }}
      />,
    );

    const button = container.querySelector('[role="button"]')!;
    fireEvent.mouseEnter(button, { clientX: 120, clientY: 80 });
    expect(queryByText(/when the task is ready to start/)).not.toBeNull();

    fireEvent.mouseLeave(button);
    expect(queryByText(/when the task is ready to start/)).toBeNull();
  });

  it('calls navigate when Enter is pressed on a linked node', () => {
    const { container } = render(
      <BpmnRenderer source={MINIMAL_SOURCE} nodeLinks={{ t1: '/skills/my-task' }} />,
    );

    const button = container.querySelector('[role="button"]')!;
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/skills/my-task');
  });

  it('calls navigate when Space is pressed on a linked node', () => {
    const { container } = render(
      <BpmnRenderer source={MINIMAL_SOURCE} nodeLinks={{ t1: '/skills/my-task' }} />,
    );

    const button = container.querySelector('[role="button"]')!;
    fireEvent.keyDown(button, { key: ' ' });

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/skills/my-task');
  });

  it('does not call navigate when other keys are pressed', () => {
    const { container } = render(
      <BpmnRenderer source={MINIMAL_SOURCE} nodeLinks={{ t1: '/skills/my-task' }} />,
    );

    const button = container.querySelector('[role="button"]')!;
    fireEvent.keyDown(button, { key: 'Tab' });
    fireEvent.keyDown(button, { key: 'Escape' });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('calls navigate when the linked node is clicked', () => {
    const { container } = render(
      <BpmnRenderer source={MINIMAL_SOURCE} nodeLinks={{ t1: '/skills/my-task' }} />,
    );

    const button = container.querySelector('[role="button"]')!;
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/skills/my-task');
  });

  it('renders an error message for invalid source', () => {
    const { getByText } = render(<BpmnRenderer source="not-valid-bpmn" />);
    expect(getByText(/No nodes parsed/)).toBeTruthy();
  });
});

// ── SVG accessibility semantics ───────────────────────────────────────────────

describe('BpmnRenderer — SVG accessibility semantics', () => {
  it('identifies the root SVG as an image', () => {
    const { container } = render(<BpmnRenderer source={ACCESSIBLE_SOURCE} />);
    expect(container.querySelector('svg')?.getAttribute('role')).toBe('img');
  });

  it('labels the SVG with its accessibility title', () => {
    const { container } = render(<BpmnRenderer source={ACCESSIBLE_SOURCE} />);
    const svg = container.querySelector('svg')!;
    const title = svg.querySelector('title')!;

    expect(title.textContent).toBe('Purchase request review');
    expect(svg.getAttribute('aria-labelledby')?.split(/\s+/)).toContain(title.id);
  });

  it('includes the diagram accessibility description', () => {
    const { container } = render(<BpmnRenderer source={ACCESSIBLE_SOURCE} />);
    const description = container.querySelector('svg desc');

    expect(description?.textContent).toBe(
      'A reviewer checks a purchase request and records the outcome.',
    );
  });

  it('gives every linked task button a non-empty accessible name', () => {
    const { container } = render(
      <BpmnRenderer
        source={ACCESSIBLE_SOURCE}
        nodeLinks={{ t1: '/skills/review', t2: '/skills/record' }}
      />,
    );
    const linkedTasks = container.querySelectorAll('svg g[role="button"]');

    expect(linkedTasks).toHaveLength(2);
    linkedTasks.forEach(task => {
      expect(task.getAttribute('aria-label')?.trim()).toBeTruthy();
    });
  });
});

// ── CSS injection ─────────────────────────────────────────────────────────────
// Confirms that the renderer embeds a <style> block inside the SVG and that
// the block contains the class names produced by getStyles().  If the
// getStyles() call is ever accidentally removed the SVG will silently render
// unstyled; these tests catch that regression.

describe('BpmnRenderer — bpmn-styles CSS injection', () => {
  it('renders a <style> element inside the SVG', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const svg = container.querySelector('svg');
    expect(svg, 'expected an <svg> element to be rendered').not.toBeNull();
    const style = svg!.querySelector('style');
    expect(style, 'expected a <style> element inside the SVG').not.toBeNull();
  });

  it('<style> block contains .bpmn-task class', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain('.bpmn-task');
  });

  it('<style> block contains .bpmn-event class', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain('.bpmn-event');
  });

  it('<style> block contains .bpmn-flow-sequence class', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain('.bpmn-flow-sequence');
  });

  it('<style> block is non-empty', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent!.trim().length).toBeGreaterThan(0);
  });

  it('exactly one <style> element is injected per SVG', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const styles = container.querySelectorAll('svg style');
    expect(styles.length).toBe(1);
  });
});

// ── DM Sans font injection ────────────────────────────────────────────────────
// The .bpmn-text and .bpmn-text-label classes declare
//   font-family: var(--app-font-sans, 'DM Sans', system-ui, sans-serif)
// These tests confirm the rendered SVG <style> block contains the DM Sans
// fallback, and that the two node-label classes are present in the same block.
// A future edit that drops the font-family or swaps the font will fail here.

describe('BpmnRenderer — DM Sans font in SVG style block', () => {
  it("<style> block contains 'DM Sans' as a font-family value", () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain('DM Sans');
  });

  it('<style> block declares font-family on .bpmn-text', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain('.bpmn-text');
    expect(style.textContent).toContain('font-family');
  });

  it('<style> block declares font-family on .bpmn-text-label', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain('.bpmn-text-label');
    expect(style.textContent).toContain('font-family');
  });

  it("<style> block contains 'JetBrains Mono' as a font-family value for muted labels", () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain('JetBrains Mono');
  });

  it('<style> block declares font-family on .bpmn-text-muted', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain('.bpmn-text-muted');
    expect(style.textContent).toContain('font-family');
  });
});

// ── LIGHT_THEME color values in style block ───────────────────────────────────
// The renderer calls getStyles(LIGHT_THEME) — so the <style> block must contain
// LIGHT_THEME's CSS custom-property values, not MERMAID_FALLBACK_THEME's hex
// literals.  A future swap of themes would change these values and fail here.

describe('BpmnRenderer — LIGHT_THEME color values in SVG style block', () => {
  it('<style> block contains LIGHT_THEME.mainBkg (hsl(var(--card)))', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain(LIGHT_THEME.mainBkg);
  });

  it('<style> block contains LIGHT_THEME.nodeBorder (hsl(var(--border)))', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain(LIGHT_THEME.nodeBorder);
  });

  it('<style> block contains LIGHT_THEME.primaryColor (hsl(var(--primary)))', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain(LIGHT_THEME.primaryColor);
  });

  it('<style> block contains LIGHT_THEME.textColor (hsl(var(--foreground)))', () => {
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).toContain(LIGHT_THEME.textColor);
  });

  it('<style> block does NOT contain MERMAID_FALLBACK_THEME hex values', () => {
    // If the renderer were accidentally switched to MERMAID_FALLBACK_THEME,
    // these concrete hex values would appear.  Their absence confirms LIGHT_THEME is used.
    const { container } = render(<BpmnRenderer source={MINIMAL_SOURCE} />);
    const style = container.querySelector('svg style')!;
    expect(style.textContent).not.toContain('#111827'); // fallback primaryColor / mainBkg
    expect(style.textContent).not.toContain('#c46a2c'); // fallback lineColor / nodeBorder
  });
});
// ---------------------------------------------------------------------------
// getStyles / buildMermaidTheme — Mermaid export path stays on resolved values
// ---------------------------------------------------------------------------

describe('getStyles — Mermaid export path uses resolved hex values', () => {

  it('getStyles(buildMermaidTheme()) with representative themeVariables contains no hsl(var(...)) patterns', () => {
    // Mermaid passes resolved themeVariables (concrete hex values, not CSS custom properties).
    // The Mermaid export path must produce concrete colours so that exported SVGs do not
    // contain unresolved var() tokens.
    const representativeVars: Record<string, string> = {
      primaryColor:  '#1f2937',
      lineColor:     '#6b7280',
      mainBkg:       '#1f2937',
      nodeBorder:    '#6b7280',
      clusterBkg:    '#111827',
      textColor:     '#f9fafb',
    };
    const styles = getStyles(buildMermaidTheme(representativeVars));
    expect(styles).not.toMatch(/hsl\(var\(/);
  });

  it('getStyles(buildMermaidTheme()) with representative themeVariables contains at least one hex value', () => {
    const representativeVars: Record<string, string> = {
      primaryColor:  '#1f2937',
      lineColor:     '#6b7280',
      mainBkg:       '#1f2937',
      nodeBorder:    '#6b7280',
      clusterBkg:    '#111827',
      textColor:     '#f9fafb',
    };
    const styles = getStyles(buildMermaidTheme(representativeVars));
    expect(styles).toMatch(/#[0-9a-fA-F]{3,6}/);
  });

  it('getStyles(buildMermaidTheme()) with no args falls back to MERMAID_FALLBACK_THEME hex values', () => {
    // Called with no themeVariables — every slot falls back to MERMAID_FALLBACK_THEME.
    const styles = getStyles(buildMermaidTheme());
    expect(styles).toContain(MERMAID_FALLBACK_THEME.lineColor);   // '#c46a2c'
    expect(styles).toContain(MERMAID_FALLBACK_THEME.textColor);   // '#e5e7eb'
    expect(styles).not.toMatch(/hsl\(var\(/);
  });

  it('getStyles(LIGHT_THEME) contains hsl(var(...)) patterns — confirms LIGHT_THEME is CSS-variable-based', () => {
    // This is the inverse guard: LIGHT_THEME must stay on CSS custom properties so it
    // resolves correctly inside the browser.  If this test fails, LIGHT_THEME was changed
    // to use concrete values, which would break the React renderer's theming.
    const styles = getStyles(LIGHT_THEME);
    expect(styles).toMatch(/hsl\(var\(/);
  });

});
