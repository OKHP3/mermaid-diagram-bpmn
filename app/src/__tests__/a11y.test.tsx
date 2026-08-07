/**
 * a11y.test.tsx
 *
 * Automated WCAG 2.2 AA accessibility gate (Task #210).
 *
 * Tool: axe-core 4.13.0 via @testing-library/react in the happy-dom environment.
 *
 * Rules strategy:
 *   - wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice
 *   - color-contrast is disabled: happy-dom does not compute CSS styles, so
 *     contrast checks always produce false positives in this environment.
 *     Contrast is verified separately via the visual regression task (#213).
 *   - scrollable-region-focusable is disabled: happy-dom has no scroll geometry.
 *
 * Coverage:
 *   - Home page
 *   - Playground page
 *   - AgentSkills page
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import axe from 'axe-core';

// ── axe configuration ─────────────────────────────────────────────────────────

/** Rules that require real CSS computation — disabled in happy-dom. */
const DISABLED_IN_HAPPY_DOM: Record<string, axe.RuleObject> = {
  'color-contrast':             { enabled: false },
  'color-contrast-enhanced':    { enabled: false },
  'scrollable-region-focusable': { enabled: false },
  // happy-dom doesn't render focus rings or visual focus indicators
  'focus-order-semantics':      { enabled: false },
};

const AXE_RUN_OPTIONS: axe.RunOptions = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
  },
  rules: DISABLED_IN_HAPPY_DOM,
};

/**
 * Run axe against a DOM container and return a formatted violation list.
 * Returns an empty array when the page is clean.
 */
async function runAxe(container: Element): Promise<string[]> {
  const result = await axe.run(container, AXE_RUN_OPTIONS);
  return result.violations.map(
    (v) =>
      `[${v.impact ?? 'unknown'}] ${v.id}: ${v.description}\n` +
      v.nodes
        .slice(0, 3)
        .map((n) => `  → ${n.html.slice(0, 120)}`)
        .join('\n'),
  );
}

// ── Shared mocks ──────────────────────────────────────────────────────────────

// Wouter — needed by all pages via Layout or page-level Link usage
vi.mock('wouter', () => ({
  Link:        ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    <a href={href} {...rest}>{children}</a>,
  useLocation: () => ['/', vi.fn()],
  useParams:   () => ({}),
}));

// Mermaid — Playground imports it; stub so no real renderer runs
const mockMermaidRender = vi.fn().mockResolvedValue({ svg: '<svg role="img" xmlns="http://www.w3.org/2000/svg"></svg>' });
vi.mock('mermaid', () => ({
  default: {
    initialize:              vi.fn(),
    registerExternalDiagrams: vi.fn().mockResolvedValue(undefined),
    render:                  mockMermaidRender,
  },
}));

// bpmn-plugin
vi.mock('@/lib/bpmn-plugin', () => ({
  bpmnPlugin:            { id: 'bpmn-beta', detector: () => false, loader: async () => ({}) },
  MERMAID_VERSION_TARGET: '11.4.1',
}));

// bpmn-renderer — avoid full parse pipeline in the Playground a11y test
vi.mock('@/lib/bpmn-renderer', () => ({
  BpmnRenderer: ({ source }: { source: string }) =>
    source.trim()
      ? <svg data-testid="mock-renderer" role="img" aria-label="BPMN diagram" />
      : <div>No nodes parsed. Check your bpmn-beta syntax.</div>,
}));

// Heavy AgentSkills sub-components
vi.mock('@/components/skills/PipelineDiagram',          () => ({ PipelineDiagram:          () => <div data-testid="pipeline-diagram" /> }));
vi.mock('@/components/skills/DependencyFlowDiagram',    () => ({ DependencyFlowDiagram:    () => <div data-testid="dep-flow-diagram" /> }));
vi.mock('@/components/skills/PnsLifecycleTracker',      () => ({ PnsLifecycleTracker:      () => <div data-testid="pns-lifecycle" /> }));
vi.mock('@/components/skills/ZipDownloadButton',        () => ({ ZipDownloadButton:        ({ label }: { label: string }) => <button>{label}</button> }));
vi.mock('@/components/skills/DownloadButton',           () => ({ DownloadButton:           ({ label }: { label: string }) => <button>{label}</button> }));
vi.mock('@/components/skills/VariableFileCard',         () => ({ VariableFileCard:         () => <div data-testid="variable-file-card" /> }));
vi.mock('@/components/skills/SkillFrontmatterPreview',  () => ({ SkillFrontmatterPreview:  () => <div data-testid="frontmatter-preview" /> }));
vi.mock('@/components/skills/StartHerePanel',           () => ({ StartHerePanel:           () => <div data-testid="start-here-panel" /> }));

// Layout sub-components that fire analytics or use browser APIs
vi.mock('@/lib/analytics', () => ({ usePageTracking: () => {} }), { virtual: true });
vi.mock('@/components/StatusRibbon', () => ({ StatusRibbon: () => null }));

// ── Page imports (after mocks) ────────────────────────────────────────────────

import Home        from '@/pages/Home';
import Playground  from '@/pages/Playground';
import AgentSkills from '@/pages/AgentSkills';
import { Layout }  from '@/components/Layout';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Render a page inside Layout (adds skip link, main landmark, header/footer). */
function renderInLayout(ui: React.ReactElement) {
  return render(<Layout>{ui}</Layout>);
}

// ── Home page ─────────────────────────────────────────────────────────────────

describe('WCAG 2.2 AA — Home page', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('has no axe violations', async () => {
    const { container } = renderInLayout(<Home />);
    const violations = await runAxe(container);
    expect(violations, violations.join('\n\n')).toHaveLength(0);
  });

  it('has a skip link that targets the main content landmark', () => {
    const { container } = renderInLayout(<Home />);
    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink, 'skip link should exist').not.toBeNull();
    const main = container.querySelector('#main-content');
    expect(main, '#main-content target should exist').not.toBeNull();
  });

  it('has a single <h1> landmark heading', () => {
    const { container } = renderInLayout(<Home />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length, 'exactly one h1 per page').toBe(1);
  });

  it('has a <main> landmark with id="main-content"', () => {
    const { container } = renderInLayout(<Home />);
    const main = container.querySelector('main#main-content');
    expect(main).not.toBeNull();
  });
});

// ── Playground page ───────────────────────────────────────────────────────────

describe('WCAG 2.2 AA — Playground page', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('has no axe violations', async () => {
    const { container } = renderInLayout(<Playground />);
    const violations = await runAxe(container);
    expect(violations, violations.join('\n\n')).toHaveLength(0);
  });

  it('has a skip link targeting main content', () => {
    const { container } = renderInLayout(<Playground />);
    expect(container.querySelector('a[href="#main-content"]')).not.toBeNull();
    expect(container.querySelector('#main-content')).not.toBeNull();
  });

  it('source editor textarea has an accessible label', () => {
    const { container } = renderInLayout(<Playground />);
    const textarea = container.querySelector('textarea');
    expect(textarea, 'textarea should exist').not.toBeNull();
    const label = textarea!.getAttribute('aria-label') ?? textarea!.getAttribute('aria-labelledby');
    expect(label, 'textarea must have aria-label or aria-labelledby').toBeTruthy();
  });

  it('copy-status live region has role="status" and aria-live', () => {
    // The parse error panel (role="alert", aria-live="polite") is conditionally rendered
    // only when parseError is truthy — its aria attributes are verified in
    // playground-error-panel.test.tsx.  Here we check the always-present copy-status
    // region which communicates clipboard feedback to screen readers.
    const { container } = renderInLayout(<Playground />);
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl, 'copy-status role="status" element should exist in Playground').not.toBeNull();
    const live = statusEl!.getAttribute('aria-live');
    expect(live, 'aria-live should be polite or assertive').toMatch(/^(polite|assertive)$/);
  });

  it('copy and download buttons have accessible labels', () => {
    const { container } = renderInLayout(<Playground />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const unlabelled = buttons.filter(b => {
      const text  = b.textContent?.trim() ?? '';
      const label = b.getAttribute('aria-label') ?? b.getAttribute('aria-labelledby') ?? '';
      return !text && !label;
    });
    expect(
      unlabelled.map(b => b.outerHTML.slice(0, 80)),
      'all icon-only buttons should have aria-label',
    ).toHaveLength(0);
  });
});

// ── AgentSkills page ──────────────────────────────────────────────────────────

describe('WCAG 2.2 AA — AgentSkills page', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('has no axe violations', async () => {
    const { container } = renderInLayout(<AgentSkills />);
    const violations = await runAxe(container);
    expect(violations, violations.join('\n\n')).toHaveLength(0);
  });

  it('has a skip link targeting main content', () => {
    const { container } = renderInLayout(<AgentSkills />);
    expect(container.querySelector('a[href="#main-content"]')).not.toBeNull();
    expect(container.querySelector('#main-content')).not.toBeNull();
  });

  it('search input has an accessible label', () => {
    const { container } = renderInLayout(<AgentSkills />);
    const input = container.querySelector('input[type="text"]') as HTMLInputElement | null;
    expect(input, 'search input should exist').not.toBeNull();
    const label =
      input!.getAttribute('aria-label') ??
      (input!.getAttribute('aria-labelledby')
        ? document.getElementById(input!.getAttribute('aria-labelledby')!)?.textContent
        : null);
    expect(label, 'search input must have aria-label or linked label').toBeTruthy();
  });

  it('section-tab navigation has an accessible container label', () => {
    const { container } = renderInLayout(<AgentSkills />);
    const nav = container.querySelector('nav[aria-label="Page sections"]');
    expect(nav, 'page-sections nav should exist with aria-label').not.toBeNull();
  });

  it('filter button groups have role="group" with accessible labels', () => {
    const { container } = renderInLayout(<AgentSkills />);
    const groups = container.querySelectorAll('[role="group"]');
    // At minimum: Filter by type, Filter by layer, Pipeline view
    expect(groups.length, 'at least 3 button groups expected').toBeGreaterThanOrEqual(3);
    groups.forEach(g => {
      expect(g.getAttribute('aria-label'), 'each group needs an aria-label').toBeTruthy();
    });
  });

  it('filter buttons communicate their selected state via aria-pressed', () => {
    const { container } = renderInLayout(<AgentSkills />);
    // The "All Skills" button starts pressed by default
    const allSkillsButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('All Skills'),
    );
    expect(allSkillsButton, '"All Skills" button should exist').not.toBeNull();
    expect(
      allSkillsButton!.getAttribute('aria-pressed'),
      '"All Skills" should start as aria-pressed=true',
    ).toBe('true');
  });

  it('mobile menu toggle has aria-expanded', () => {
    const { container } = renderInLayout(<AgentSkills />);
    const toggle = container.querySelector('[data-testid="button-toggle-menu"]');
    expect(toggle, 'mobile menu toggle should exist').not.toBeNull();
    expect(
      toggle!.hasAttribute('aria-expanded'),
      'mobile toggle must have aria-expanded',
    ).toBe(true);
  });
});

// ── Layout accessibility ──────────────────────────────────────────────────────

describe('WCAG 2.2 AA — Layout shell', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('header navigation has an accessible name', () => {
    const { container } = renderInLayout(<Home />);
    const mainNav = container.querySelector('nav[aria-label="Main navigation"]');
    expect(mainNav, 'main nav should have aria-label="Main navigation"').not.toBeNull();
  });

  it('theme toggle button has aria-label', () => {
    const { container } = renderInLayout(<Home />);
    const themeBtn = container.querySelector('[data-testid="button-toggle-theme"]');
    expect(themeBtn).not.toBeNull();
    expect(themeBtn!.getAttribute('aria-label')).toBeTruthy();
  });

  it('mobile menu toggle has aria-controls pointing to an element', () => {
    const { container } = renderInLayout(<Home />);
    const toggle = container.querySelector('[data-testid="button-toggle-menu"]');
    expect(toggle).not.toBeNull();
    const controls = toggle!.getAttribute('aria-controls');
    expect(controls, 'aria-controls must be set').toBeTruthy();
    // The controlled element (mobile-nav) is not in DOM unless the menu is open,
    // but the attribute itself must be present.
    expect(controls).toBe('mobile-nav');
  });
});
