// @vitest-environment happy-dom
// Confirms EmployeeOffboardingExample renders the correct end-marker label and
// status code after the ExampleStepTimeline extraction refactor.
// Regressions here would silently show wrong values to practitioners who rely
// on the process ID and PNS lifecycle status to track their offboarding case.

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import EmployeeOffboardingExample from '@/pages/EmployeeOffboardingExample';

// ── Wouter ────────────────────────────────────────────────────────────────────
vi.mock('wouter', () => ({
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ['/', vi.fn()],
}));

// ── Heavy sub-components ──────────────────────────────────────────────────────
vi.mock('@/lib/bpmn-renderer',                      () => ({ BpmnRenderer:         () => <div data-testid="bpmn-renderer" /> }));
vi.mock('@/components/skills/ExamplePromptPanel',   () => ({ ExamplePromptPanel:   () => <div data-testid="prompt-panel" /> }));
vi.mock('@/components/skills/ExamplePnsBadgePair',  () => ({ ExamplePnsBadgePair:  () => <div data-testid="pns-badge-pair" /> }));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EmployeeOffboardingExample — timeline end marker', () => {

  it('renders the end-marker label "PROC-2025-108 packaged"', () => {
    const { getByText } = render(<EmployeeOffboardingExample />);
    expect(getByText('PROC-2025-108 packaged')).not.toBeNull();
  });

  it('renders the "packaged" PNS status code in a <code> element', () => {
    const { container } = render(<EmployeeOffboardingExample />);
    // The status code is wrapped in <code> inside the end-marker span
    const codeEl = [...container.querySelectorAll('code')].find(
      (el) => el.textContent?.trim() === 'packaged'
    );
    expect(codeEl, '"packaged" status code should appear in a <code> element').not.toBeUndefined();
  });

  it('shows "All 15 skills complete" in the end marker', () => {
    const { getByText } = render(<EmployeeOffboardingExample />);
    expect(getByText(/All 15 skills complete/)).not.toBeNull();
  });

});

describe('EmployeeOffboardingExample — page structure', () => {

  it('renders the page heading "Employee Offboarding"', () => {
    const { getByRole } = render(<EmployeeOffboardingExample />);
    expect(getByRole('heading', { level: 1, name: /Employee Offboarding/i })).not.toBeNull();
  });

  it('renders the "Step-by-Step Trace" section heading', () => {
    const { getByRole } = render(<EmployeeOffboardingExample />);
    expect(getByRole('heading', { level: 2, name: /All 15 Skills, One Process/i })).not.toBeNull();
  });

  it('renders the scenario process ID "PROC-2025-108"', () => {
    const { getAllByText } = render(<EmployeeOffboardingExample />);
    // Appears in both the scenario strip and the end marker label
    expect(getAllByText(/PROC-2025-108/).length).toBeGreaterThan(0);
  });

});
