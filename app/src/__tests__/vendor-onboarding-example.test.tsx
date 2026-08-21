// @vitest-environment happy-dom
// Confirms VendorOnboardingExample renders the correct end-marker label and
// status code. Regressions here would silently show wrong values to
// practitioners tracking this process-documentation case.

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import VendorOnboardingExample from '@/pages/VendorOnboardingExample';

// ── Wouter ────────────────────────────────────────────────────────────────────
vi.mock('wouter', () => ({
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ['/', vi.fn()],
}));

// ── Heavy sub-components ──────────────────────────────────────────────────────
vi.mock('@/lib/bpmn-renderer',                     () => ({ BpmnRenderer:        () => <div data-testid="bpmn-renderer" /> }));
vi.mock('@/components/skills/ExamplePromptPanel',  () => ({ ExamplePromptPanel:  () => <div data-testid="prompt-panel" /> }));
vi.mock('@/components/skills/ExamplePnsBadgePair', () => ({ ExamplePnsBadgePair: () => <div data-testid="pns-badge-pair" /> }));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VendorOnboardingExample — timeline end marker', () => {
  it('renders the end-marker label "PROC-2025-211 packaged"', () => {
    const { getByText } = render(<VendorOnboardingExample />);

    expect(getByText('PROC-2025-211 packaged')).not.toBeNull();
  });

  it('renders the "packaged" PNS status code in a <code> element', () => {
    const { container } = render(<VendorOnboardingExample />);
    const codeEl = [...container.querySelectorAll('code')].find(
      (el) => el.textContent?.trim() === 'packaged',
    );

    expect(codeEl, '"packaged" status code should appear in a <code> element').not.toBeUndefined();
  });

  it('shows "All 15 skills complete" in the end marker', () => {
    const { getByText } = render(<VendorOnboardingExample />);

    expect(getByText(/All 15 skills complete/)).not.toBeNull();
  });
});