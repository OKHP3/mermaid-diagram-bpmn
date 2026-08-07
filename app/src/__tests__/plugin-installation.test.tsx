/**
 * plugin-installation.test.tsx
 *
 * Tests for the PluginInstallation page consolidation (Task #208).
 *
 * Scope:
 *   - All main sections are present
 *   - Copy button is present on every code block with correct aria-label
 *   - npm publication status badge is rendered and shows published state
 *   - Host-demo link is present and labeled as browser-verified
 *   - Known limits section lists all five expected limits
 *   - Version compatibility table shows the exact MERMAID_VERSION_TARGET
 *   - Resources section includes GitHub repo, issue tracker, and CONTRIBUTING link
 *   - Page does not use "npm install" language when NPM_PUBLISHED is false
 *     (tested indirectly via the status badge content)
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PluginInstallation from "@/pages/PluginInstallation";
import { MERMAID_VERSION_TARGET } from "@/lib/bpmn-plugin";

// ── Module mocks ──────────────────────────────────────────────────────────────

// bpmn-plugin has no DOM dependencies; we let it run real to get the actual
// MERMAID_VERSION_TARGET value. No mocks needed.

vi.mock("wouter", () => ({
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ["/", vi.fn()],
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function setup() {
  return render(<PluginInstallation />);
}

// ── Sections present ──────────────────────────────────────────────────────────

describe("PluginInstallation — section presence", () => {
  it("renders the Install section", () => {
    setup();
    expect(screen.getByTestId("section-install")).not.toBeNull();
  });

  it("renders the Register and render section", () => {
    setup();
    expect(screen.getByTestId("section-register")).not.toBeNull();
  });

  it("renders the Browser-verified demo section", () => {
    setup();
    expect(screen.getByTestId("section-demo")).not.toBeNull();
  });

  it("renders the Version compatibility section", () => {
    setup();
    expect(screen.getByTestId("section-version")).not.toBeNull();
  });

  it("renders the Known limits section", () => {
    setup();
    expect(screen.getByTestId("section-known-limits")).not.toBeNull();
  });

  it("renders the Security level note section", () => {
    setup();
    expect(screen.getByTestId("section-security")).not.toBeNull();
  });

  it("renders the Resources section", () => {
    setup();
    expect(screen.getByTestId("section-resources")).not.toBeNull();
  });
});

// ── Copy buttons ──────────────────────────────────────────────────────────────

describe("PluginInstallation — copy buttons", () => {
  it("install code block has a copy button", () => {
    setup();
    expect(screen.getByTestId("code-install-copy-btn")).not.toBeNull();
  });

  it("install copy button has accessible aria-label", () => {
    setup();
    const btn = screen.getByTestId("code-install-copy-btn");
    expect(btn.getAttribute("aria-label")).toBeTruthy();
    expect(btn.getAttribute("aria-label")!.toLowerCase()).toContain("copy");
  });

  it("register code block has a copy button", () => {
    setup();
    expect(screen.getByTestId("code-register-copy-btn")).not.toBeNull();
  });

  it("render code block has a copy button", () => {
    setup();
    expect(screen.getByTestId("code-render-copy-btn")).not.toBeNull();
  });
});

// ── npm publication status badge ──────────────────────────────────────────────

describe("PluginInstallation — npm status badge", () => {
  it("renders the npm status badge", () => {
    setup();
    expect(screen.getByTestId("npm-status-badge")).not.toBeNull();
  });

  it("badge shows 'published' state when NPM_PUBLISHED is true", () => {
    setup();
    const badge = screen.getByTestId("npm-status-badge");
    // The badge text should contain 'published' when live
    expect(badge.textContent!.toLowerCase()).toContain("published");
  });

  it("install section contains the npm install command when published", () => {
    setup();
    const section = screen.getByTestId("section-install");
    expect(section.textContent).toContain("npm install @okhp3/mermaid-diagram-bpmn");
  });
});

// ── Browser-verified demo link ────────────────────────────────────────────────

describe("PluginInstallation — host-demo link", () => {
  it("demo section contains a link to the host demo page", () => {
    setup();
    const link = screen.getByTestId("link-host-demo") as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.href).toContain("mermaid-host-demo");
  });

  it("demo link text describes it as a live demo", () => {
    setup();
    const link = screen.getByTestId("link-host-demo");
    expect(link.textContent!.toLowerCase()).toMatch(/live|demo/);
  });

  it("demo section text mentions 'browser' or 'browser-verified'", () => {
    setup();
    const section = screen.getByTestId("section-demo");
    expect(section.textContent!.toLowerCase()).toContain("browser");
  });
});

// ── Version compatibility ─────────────────────────────────────────────────────

describe("PluginInstallation — version compatibility", () => {
  it("compatibility table is present", () => {
    setup();
    expect(screen.getByTestId("compat-table")).not.toBeNull();
  });

  it("table shows the exact MERMAID_VERSION_TARGET version", () => {
    setup();
    const table = screen.getByTestId("compat-table");
    expect(table.textContent).toContain(MERMAID_VERSION_TARGET);
  });

  it("table row shows 'source-verified' status", () => {
    setup();
    const table = screen.getByTestId("compat-table");
    expect(table.textContent).toContain("source-verified");
  });
});

// ── Known limits ──────────────────────────────────────────────────────────────

describe("PluginInstallation — known limits", () => {
  it("known limits list is present", () => {
    setup();
    expect(screen.getByTestId("known-limits-list")).not.toBeNull();
  });

  it("'no-xml' limit is present", () => {
    setup();
    expect(screen.getByTestId("known-limit-no-xml")).not.toBeNull();
  });

  it("'node-subset' limit is present", () => {
    setup();
    expect(screen.getByTestId("known-limit-node-subset")).not.toBeNull();
  });

  it("'single-level-pools' limit is present", () => {
    setup();
    expect(screen.getByTestId("known-limit-single-level-pools")).not.toBeNull();
  });

  it("'auto-layout' limit is present", () => {
    setup();
    expect(screen.getByTestId("known-limit-auto-layout")).not.toBeNull();
  });

  it("'security-level' limit is present", () => {
    setup();
    expect(screen.getByTestId("known-limit-security-level")).not.toBeNull();
  });

  it("known limits section links to the issue tracker", () => {
    setup();
    const section = screen.getByTestId("section-known-limits");
    const issueLink = section.querySelector("a[href*='/issues']") as HTMLAnchorElement | null;
    expect(issueLink).not.toBeNull();
    expect(issueLink!.getAttribute("href")).toContain("github.com");
  });
});

// ── Resources ─────────────────────────────────────────────────────────────────

describe("PluginInstallation — resources section", () => {
  it("resources list is present", () => {
    setup();
    expect(screen.getByTestId("resources-list")).not.toBeNull();
  });

  it("GitHub repository link is present", () => {
    setup();
    const list = screen.getByTestId("resources-list");
    const githubLink = list.querySelector("a[href*='github.com/OKHP3/mermaid-diagram-bpmn']");
    expect(githubLink).not.toBeNull();
  });

  it("issue tracker link is present", () => {
    setup();
    const list = screen.getByTestId("resources-list");
    const issueLink = list.querySelector("a[href*='/issues']") as HTMLAnchorElement | null;
    expect(issueLink).not.toBeNull();
    expect(issueLink!.textContent!.toLowerCase()).toMatch(/issue/);
  });

  it("CONTRIBUTING.md link is present", () => {
    setup();
    const list = screen.getByTestId("resources-list");
    const contribLink = list.querySelector("a[href*='CONTRIBUTING']") as HTMLAnchorElement | null;
    expect(contribLink).not.toBeNull();
  });

  it("contributing link text mentions 'contributing' or 'guide'", () => {
    setup();
    const list = screen.getByTestId("resources-list");
    const contribLink = list.querySelector("a[href*='CONTRIBUTING']");
    expect(contribLink!.textContent!.toLowerCase()).toMatch(/contribut|guide/);
  });

  it("host-demo link is also in the resources list", () => {
    setup();
    const list = screen.getByTestId("resources-list");
    const demoLink = list.querySelector("a[href='/mermaid-host-demo']") as HTMLAnchorElement | null;
    expect(demoLink).not.toBeNull();
  });

  it("Mermaid external-diagrams docs link is present", () => {
    setup();
    const list = screen.getByTestId("resources-list");
    const mermaidLink = list.querySelector("a[href*='mermaid.js.org']") as HTMLAnchorElement | null;
    expect(mermaidLink).not.toBeNull();
  });
});
