// @vitest-environment happy-dom
// Guards the Roadmap page against raw <a target="_blank"> links that lack an
// ExternalLink icon. Every external anchor must go through ExternalLinkAnchor,
// which appends a lucide SVG icon. This test catches any future contributor
// adding a plain <a target="_blank"> without the icon.
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Roadmap from '@/pages/Roadmap';

describe('Roadmap page — external links', () => {
  it('renders at least one external link (smoke check)', () => {
    const { container } = render(<Roadmap />);
    const externalAnchors = container.querySelectorAll('a[target="_blank"]');
    expect(externalAnchors.length).toBeGreaterThan(0);
  });

  it('every <a target="_blank"> contains an SVG (ExternalLink icon)', () => {
    const { container } = render(<Roadmap />);
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
      'These <a target="_blank"> links are missing an ExternalLink icon'
    ).toHaveLength(0);
  });

  it('every external anchor has rel="noopener noreferrer"', () => {
    const { container } = render(<Roadmap />);
    const externalAnchors = Array.from(
      container.querySelectorAll('a[target="_blank"]')
    );

    const insecure = externalAnchors.filter(
      (a) => a.getAttribute('rel') !== 'noopener noreferrer'
    );

    expect(
      insecure.map((a) => a.getAttribute('href')),
      'These external links are missing rel="noopener noreferrer"'
    ).toHaveLength(0);
  });
});
