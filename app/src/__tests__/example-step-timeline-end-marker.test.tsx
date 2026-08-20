// @vitest-environment happy-dom
// Tests the shared timeline end marker directly so both worked-example pages
// are protected from regressions in the component's end-marker props.

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ExampleStepTimeline } from '@/components/skills/ExampleStepTimeline';
import type { ExampleStep } from '@/data/purchase-approval-steps';

// ── Lightweight component mocks ───────────────────────────────────────────────
vi.mock('wouter', () => ({
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('@/lib/bpmn-renderer', () => ({
  BpmnRenderer: () => <div data-testid="bpmn-renderer" />,
}));

vi.mock('@/components/skills/ExamplePnsBadgePair', () => ({
  ExamplePnsBadgePair: () => <span data-testid="pns-badge-pair" />,
}));

const MINIMAL_STEPS: ExampleStep[] = [
  {
    skillId: 'okhp3-process-intake-and-scope',
    pnsConsumed: null,
    pnsSet: 'draft-intake',
    triggerUsed: 'Map this process.',
    inputLabel: 'Process brief',
    inputSnippet: 'A short process brief.',
    outputLabel: 'PIR',
    outputSnippet: 'status: draft-intake',
  },
];

describe('ExampleStepTimeline — end marker', () => {
  it('renders the label, status code, and completion text from its props', () => {
    const { container, getByText } = render(
      <ExampleStepTimeline
        steps={MINIMAL_STEPS}
        bpmnSource="bpmn-beta"
        endLabel="PROC-TEST-001 published"
        endStatusCode="published"
      />
    );

    expect(getByText('PROC-TEST-001 published')).not.toBeNull();

    const codeEl = [...container.querySelectorAll('code')].find(
      (el) => el.textContent?.trim() === 'published'
    );
    expect(codeEl, '"published" status code should appear in a <code> element').not.toBeUndefined();

    expect(getByText(/All 15 skills complete/)).not.toBeNull();
  });
});