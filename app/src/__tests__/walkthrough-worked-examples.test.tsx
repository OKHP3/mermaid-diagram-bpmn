// @vitest-environment happy-dom
// Guards the Walkthrough page against the worked-example links drifting from
// the WORKED_EXAMPLES registry. Each entry in the registry must produce exactly
// one link whose href matches the entry's `path` field and whose visible text
// includes the entry's `title`. Adding a new entry without updating the page
// (or vice-versa) will break these tests.

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SkillsWalkthrough from '@/pages/SkillsWalkthrough';
import { WORKED_EXAMPLES } from '@/data/worked-examples';

// ── Wouter ────────────────────────────────────────────────────────────────────
vi.mock('wouter', () => ({
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ['/', vi.fn()],
  useParams:   () => ({}),
}));

// ── Heavy sub-components ──────────────────────────────────────────────────────
vi.mock('@/lib/bpmn-renderer',                   () => ({ BpmnRenderer:         () => <div data-testid="bpmn-renderer" /> }));
vi.mock('@/components/skills/PnsLifecycleTracker', () => ({ PnsLifecycleTracker: () => <div data-testid="pns-lifecycle" /> }));
vi.mock('@/components/skills/PnsBadge',          () => ({ PnsBadge:             () => <span data-testid="pns-badge" /> }));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** All <a> elements whose href exactly matches the given path. */
function anchorsByPath(container: Element, path: string): HTMLAnchorElement[] {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>('a')).filter(
    (a) => a.getAttribute('href') === path
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Walkthrough page — worked-example links', () => {

  it('renders at least one worked-example link (smoke check)', () => {
    const { container } = render(<SkillsWalkthrough />);
    const exampleLinks = WORKED_EXAMPLES.map((ex) => anchorsByPath(container, ex.path));
    const total = exampleLinks.flat().length;
    expect(total).toBeGreaterThan(0);
  });

  it('renders exactly one link per WORKED_EXAMPLES entry', () => {
    const { container } = render(<SkillsWalkthrough />);
    for (const example of WORKED_EXAMPLES) {
      const links = anchorsByPath(container, example.path);
      expect(
        links.length,
        `Expected exactly 1 link to "${example.path}" (${example.title}), found ${links.length}`,
      ).toBe(1);
    }
  });

  it('each worked-example link href matches the registry path field', () => {
    const { container } = render(<SkillsWalkthrough />);
    for (const example of WORKED_EXAMPLES) {
      const [link] = anchorsByPath(container, example.path);
      expect(
        link?.getAttribute('href'),
        `Link for "${example.title}" should have href "${example.path}"`,
      ).toBe(example.path);
    }
  });

  it('each worked-example link text includes the registry title', () => {
    const { container } = render(<SkillsWalkthrough />);
    for (const example of WORKED_EXAMPLES) {
      const [link] = anchorsByPath(container, example.path);
      expect(
        link?.textContent,
        `Link to "${example.path}" should contain title "${example.title}"`,
      ).toContain(example.title);
    }
  });

  it('total worked-example links matches WORKED_EXAMPLES.length', () => {
    const { container } = render(<SkillsWalkthrough />);
    const count = WORKED_EXAMPLES.filter(
      (ex) => anchorsByPath(container, ex.path).length === 1
    ).length;
    expect(count).toBe(WORKED_EXAMPLES.length);
  });

});
