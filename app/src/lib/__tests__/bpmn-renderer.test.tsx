// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BpmnRenderer } from '../bpmn-renderer';

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
