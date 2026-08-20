// @vitest-environment happy-dom
// Guards the About, Home, and SkillDetail pages against raw
// <a target="_blank"> links that lack an ExternalLink icon. Every external
// anchor must go through ExternalLinkAnchor, which appends a lucide SVG icon
// and enforces rel="noopener noreferrer".
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import About from "@/pages/About";
import Home from "@/pages/Home";
import SkillDetail from "@/pages/SkillDetail";

const mockUseParams = vi.hoisted(() => vi.fn(() => ({
  skillId: "okhp3-process-intake-and-scope",
})));

vi.mock("wouter", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ["/", vi.fn()],
  useParams: () => mockUseParams(),
}));

vi.mock("@/components/skills/PnsBadge", () => ({
  PnsBadge: () => <div data-testid="pns-badge" />,
}));
vi.mock("@/components/skills/PnsLifecycleTracker", () => ({
  PnsLifecycleTracker: () => <div data-testid="pns-lifecycle" />,
}));
vi.mock("@/components/skills/SkillMiniCard", () => ({
  SkillMiniCard: () => <div data-testid="skill-mini-card" />,
}));
vi.mock("@/components/skills/SkillFrontmatterPreview", () => ({
  SkillFrontmatterPreview: () => <div data-testid="frontmatter-preview" />,
}));
vi.mock("@/components/skills/InstallTabs", () => ({
  InstallTabs: () => <div data-testid="install-tabs" />,
}));
vi.mock("@/components/skills/DownloadButton", () => ({
  DownloadButton: ({ label }: { label: string }) => <button>{label}</button>,
}));

function getExternalAnchors(container: HTMLElement) {
  return Array.from(container.querySelectorAll('a[target="_blank"]'));
}

function anchorsMissingSvg(anchors: Element[]) {
  return anchors
    .filter((anchor) => anchor.querySelector("svg") === null)
    .map((anchor) => ({
      href: anchor.getAttribute("href"),
      text: anchor.textContent?.trim().slice(0, 60),
    }));
}

function anchorsWithoutRel(anchors: Element[]) {
  return anchors
    .filter((anchor) => anchor.getAttribute("rel") !== "noopener noreferrer")
    .map((anchor) => anchor.getAttribute("href"));
}

const pageCases = [
  ["About", () => <About />],
  ["Home", () => <Home />],
  ["SkillDetail", () => <SkillDetail />],
] as const;

describe.each(pageCases)("%s page — external links", (pageName, renderPage) => {
  it("renders at least one external link (smoke check)", () => {
    const { container } = render(renderPage());
    expect(getExternalAnchors(container).length).toBeGreaterThan(0);
  });

  it("every <a target=\"_blank\"> contains an SVG (ExternalLink icon)", () => {
    const { container } = render(renderPage());
    expect(
      anchorsMissingSvg(getExternalAnchors(container)),
      "These <a target=\"_blank\"> links are missing an ExternalLink icon",
    ).toHaveLength(0);
  });

  it('every external anchor has rel="noopener noreferrer"', () => {
    const { container } = render(renderPage());
    expect(
      anchorsWithoutRel(getExternalAnchors(container)),
      "These external links are missing rel=\"noopener noreferrer\"",
    ).toHaveLength(0);
  });
});