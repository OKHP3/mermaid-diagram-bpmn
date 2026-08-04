// @vitest-environment happy-dom
// Guards the Agent Skills page against raw <a target="_blank"> links that lack
// an ExternalLink icon.  Every external anchor must go through ExternalLinkAnchor
// (or include an SVG child manually), which appends a lucide SVG icon and enforces
// rel="noopener noreferrer".  This test catches any future contributor adding a
// plain <a target="_blank"> without the icon.
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AgentSkills from '@/pages/AgentSkills';

// ── Wouter ────────────────────────────────────────────────────────────────────
vi.mock('wouter', () => ({
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ['/', vi.fn()],
  useParams:   () => ({}),
}));

// ── Heavy sub-components ──────────────────────────────────────────────────────
vi.mock('@/components/skills/PipelineDiagram',       () => ({ PipelineDiagram:       () => <div data-testid="pipeline-diagram" /> }));
vi.mock('@/components/skills/DependencyFlowDiagram', () => ({ DependencyFlowDiagram: () => <div data-testid="dep-flow-diagram" /> }));
vi.mock('@/components/skills/PnsLifecycleTracker',   () => ({ PnsLifecycleTracker:   () => <div data-testid="pns-lifecycle" /> }));
vi.mock('@/components/skills/ZipDownloadButton',     () => ({ ZipDownloadButton:     ({ label }: { label: string }) => <button>{label}</button> }));
vi.mock('@/components/skills/DownloadButton',        () => ({ DownloadButton:        ({ label }: { label: string }) => <button>{label}</button> }));
vi.mock('@/components/skills/VariableFileCard',      () => ({ VariableFileCard:      () => <div data-testid="variable-file-card" /> }));
vi.mock('@/components/skills/SkillFrontmatterPreview', () => ({ SkillFrontmatterPreview: () => <div data-testid="frontmatter-preview" /> }));

describe('AgentSkills page — external links', () => {
  it('renders at least one external link (smoke check)', () => {
    const { container } = render(<AgentSkills />);
    const externalAnchors = container.querySelectorAll('a[target="_blank"]');
    expect(externalAnchors.length).toBeGreaterThan(0);
  });

  it('every <a target="_blank"> contains an SVG (ExternalLink icon)', () => {
    const { container } = render(<AgentSkills />);
    const externalAnchors = Array.from(
      container.querySelectorAll('a[target="_blank"]')
    );

    const missing = externalAnchors.filter(
      (a) => a.querySelector('svg') === null
    );

    expect(
      missing.map((a) => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim().slice(0, 60),
      })),
      'These <a target="_blank"> links are missing an ExternalLink icon',
    ).toHaveLength(0);
  });

  it('every external anchor has rel="noopener noreferrer"', () => {
    const { container } = render(<AgentSkills />);
    const externalAnchors = Array.from(
      container.querySelectorAll('a[target="_blank"]')
    );

    const insecure = externalAnchors.filter(
      (a) => a.getAttribute('rel') !== 'noopener noreferrer'
    );

    expect(
      insecure.map((a) => a.getAttribute('href')),
      'These external links are missing rel="noopener noreferrer"',
    ).toHaveLength(0);
  });
});
