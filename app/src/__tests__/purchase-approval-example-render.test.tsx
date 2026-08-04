// @vitest-environment happy-dom
// Confirms PurchaseApprovalExample renders the correct end-marker label and
// status code. Mirrors the pattern in employee-offboarding-example.test.tsx.
// Regressions here would silently show wrong values to practitioners who rely
// on the process ID and PNS lifecycle status to track their approval case.

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import PurchaseApprovalExample from '@/pages/PurchaseApprovalExample';

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

describe('PurchaseApprovalExample — timeline end marker', () => {

  it('renders the end-marker label "PROC-2024-042 published"', () => {
    const { getByText } = render(<PurchaseApprovalExample />);
    expect(getByText('PROC-2024-042 published')).not.toBeNull();
  });

  it('renders the "published" PNS status code in a <code> element', () => {
    const { container } = render(<PurchaseApprovalExample />);
    // The status code is wrapped in <code> inside the end-marker span
    const codeEl = [...container.querySelectorAll('code')].find(
      (el) => el.textContent?.trim() === 'published'
    );
    expect(codeEl, '"published" status code should appear in a <code> element').not.toBeUndefined();
  });

  it('shows "All 15 skills complete" in the end marker', () => {
    const { getByText } = render(<PurchaseApprovalExample />);
    expect(getByText(/All 15 skills complete/)).not.toBeNull();
  });

});

describe('PurchaseApprovalExample — page structure', () => {

  it('renders the page heading "Purchase Approval"', () => {
    const { getByRole } = render(<PurchaseApprovalExample />);
    expect(getByRole('heading', { level: 1, name: /Purchase Approval/i })).not.toBeNull();
  });

  it('renders the "All 15 Skills, One Process" section heading', () => {
    const { getByRole } = render(<PurchaseApprovalExample />);
    expect(getByRole('heading', { level: 2, name: /All 15 Skills, One Process/i })).not.toBeNull();
  });

  it('renders the scenario process ID "PROC-2024-042"', () => {
    const { getAllByText } = render(<PurchaseApprovalExample />);
    // Appears in both the scenario strip and the end marker label
    expect(getAllByText(/PROC-2024-042/).length).toBeGreaterThan(0);
  });

});
