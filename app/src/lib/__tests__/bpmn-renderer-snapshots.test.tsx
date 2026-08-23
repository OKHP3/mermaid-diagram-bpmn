/**
 * bpmn-renderer-snapshots.test.tsx
 *
 * SVG snapshot tests for BpmnRenderer (TD-005).
 *
 * These tests render corpus fixtures through BpmnRenderer and snapshot the full
 * SVG output. Any change to shape geometry, CSS classes, node rendering, or flow
 * rendering will fail the snapshot — making regressions visible before they ship.
 *
 * When an intentional change is made to the renderer:
 *   1. Run: pnpm --filter @workspace/mermaid-diagram-bpmn run test -- --update-snapshots
 *   2. Review the diff to confirm only expected elements changed.
 *   3. Commit the updated snapshot.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { BpmnRenderer } from '../bpmn-renderer';

const __dirname = dirname(fileURLToPath(import.meta.url));

vi.mock('wouter', () => ({
  useLocation: () => ['/', vi.fn()],
}));

function fixture(name: string): string {
  return readFileSync(resolve(__dirname, '../../../examples', name), 'utf-8');
}

// Helper: render BpmnRenderer and return the SVG element's outer HTML.
// We snapshot outerHTML rather than container.innerHTML so that the SVG
// element's own attributes (viewBox, role, aria-labelledby) are included.
function renderSvg(source: string): string {
  const { container } = render(<BpmnRenderer source={source} />);
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('BpmnRenderer produced no <svg> element');
  return svg.outerHTML;
}

// ---------------------------------------------------------------------------
// Snapshot: 01-linear-process.mmd — flat diagram, user task
// ---------------------------------------------------------------------------
describe('BpmnRenderer snapshots', () => {
  it('01-linear-process: SVG matches snapshot', () => {
    const svg = renderSvg(fixture('01-linear-process.mmd'));
    expect(svg).toMatchSnapshot();
  });

  it('08-purchase-order-approval: SVG matches snapshot (pool/lane)', () => {
    const svg = renderSvg(fixture('08-purchase-order-approval.mmd'));
    expect(svg).toMatchSnapshot();
  });

  it('02-gateway-decision: SVG matches snapshot (gateway shapes)', () => {
    const svg = renderSvg(fixture('02-gateway-decision.mmd'));
    expect(svg).toMatchSnapshot();
  });

  it('04-multi-event: SVG matches snapshot (multiple events)', () => {
    const svg = renderSvg(fixture('04-multi-event.mmd'));
    expect(svg).toMatchSnapshot();
  });

  it('05-parallel-split: SVG matches snapshot (parallel flows)', () => {
    const svg = renderSvg(fixture('05-parallel-split.mmd'));
    expect(svg).toMatchSnapshot();
  });

  it('intermediate event: SVG matches snapshot', () => {
    const svg = renderSvg(`bpmn-beta
start s1 "Start"
intermediate wait1 "Waiting"
end e1 "Done"
s1 --> wait1
wait1 --> e1`);
    expect(svg).toMatchSnapshot();
  });

  it('collapsed subprocess: SVG matches snapshot', () => {
    const svg = renderSvg(`bpmn-beta
start s1 "Start"
subprocess review "Review subprocess"
end e1 "Done"
s1 --> review
review --> e1`);
    expect(svg).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// Structural assertions: key CSS classes must always be present
// (These complement the snapshots — if a class is renamed the snapshot fails,
// but these give a clearer error message about what specifically broke.)
// ---------------------------------------------------------------------------
describe('BpmnRenderer structural class presence', () => {
  it('flat diagram has expected CSS classes', () => {
    const { container } = render(<BpmnRenderer source={fixture('01-linear-process.mmd')} />);
    expect(container.querySelector('.bpmn-event')).not.toBeNull();
    expect(container.querySelector('.bpmn-event-end')).not.toBeNull();
    expect(container.querySelector('.bpmn-task')).not.toBeNull();
    expect(container.querySelector('.bpmn-flow-sequence')).not.toBeNull();
    expect(container.querySelector('.bpmn-task-marker')).not.toBeNull();
  });

  it('pool/lane diagram has expected CSS classes', () => {
    const { container } = render(<BpmnRenderer source={fixture('08-purchase-order-approval.mmd')} />);
    expect(container.querySelector('.bpmn-pool')).not.toBeNull();
    expect(container.querySelector('.bpmn-pool-header')).not.toBeNull();
    expect(container.querySelector('.bpmn-lane')).not.toBeNull();
    expect(container.querySelector('.bpmn-lane-header')).not.toBeNull();
    expect(container.querySelector('.bpmn-gateway')).not.toBeNull();
    expect(container.querySelector('.bpmn-flow-conditional')).not.toBeNull();
  });
});
