// @vitest-environment happy-dom
// Guards SkillsWalkthrough, PurchaseApprovalExample, and EmployeeOffboardingExample
// against raw <a target="_blank"> links that lack an ExternalLink icon.
//
// Currently all three pages have zero external links, so the SVG and rel guards
// pass trivially. They are still worth having: the moment a contributor adds a
// bare <a target="_blank"> without ExternalLinkAnchor the guard will fail,
// matching the protection already in place for the Roadmap and AgentSkills pages.
//
// No smoke test ("at least one external link") is included here because each
// page legitimately has none right now.

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Router } from "wouter";
import SkillsWalkthrough from "@/pages/SkillsWalkthrough";
import PurchaseApprovalExample from "@/pages/PurchaseApprovalExample";
import EmployeeOffboardingExample from "@/pages/EmployeeOffboardingExample";

// SkillsWalkthrough uses wouter's Link; wrap in Router to avoid warnings.
function WithRouter({ children }: { children: React.ReactNode }) {
  return <Router base="">{children}</Router>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getExternalAnchors(container: HTMLElement) {
  return Array.from(container.querySelectorAll('a[target="_blank"]'));
}

function anchorsMissingSvg(anchors: Element[]) {
  return anchors.filter((a) => a.querySelector("svg") === null).map((a) => ({
    href: a.getAttribute("href"),
    text: a.textContent?.trim().slice(0, 60),
  }));
}

function anchorsWithoutRel(anchors: Element[]) {
  return anchors
    .filter((a) => a.getAttribute("rel") !== "noopener noreferrer")
    .map((a) => a.getAttribute("href"));
}

// ---------------------------------------------------------------------------
// SkillsWalkthrough
// ---------------------------------------------------------------------------

describe("SkillsWalkthrough page — external links", () => {
  it("every <a target=\"_blank\"> contains an SVG (ExternalLink icon)", () => {
    const { container } = render(
      <WithRouter>
        <SkillsWalkthrough />
      </WithRouter>,
    );
    expect(
      anchorsMissingSvg(getExternalAnchors(container)),
      "These <a target=\"_blank\"> links are missing an ExternalLink icon",
    ).toHaveLength(0);
  });

  it('every external anchor has rel="noopener noreferrer"', () => {
    const { container } = render(
      <WithRouter>
        <SkillsWalkthrough />
      </WithRouter>,
    );
    expect(
      anchorsWithoutRel(getExternalAnchors(container)),
      'These external links are missing rel="noopener noreferrer"',
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// PurchaseApprovalExample
// ---------------------------------------------------------------------------

describe("PurchaseApprovalExample page — external links", () => {
  it("every <a target=\"_blank\"> contains an SVG (ExternalLink icon)", () => {
    const { container } = render(
      <WithRouter>
        <PurchaseApprovalExample />
      </WithRouter>,
    );
    expect(
      anchorsMissingSvg(getExternalAnchors(container)),
      "These <a target=\"_blank\"> links are missing an ExternalLink icon",
    ).toHaveLength(0);
  });

  it('every external anchor has rel="noopener noreferrer"', () => {
    const { container } = render(
      <WithRouter>
        <PurchaseApprovalExample />
      </WithRouter>,
    );
    expect(
      anchorsWithoutRel(getExternalAnchors(container)),
      'These external links are missing rel="noopener noreferrer"',
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// EmployeeOffboardingExample
// ---------------------------------------------------------------------------

describe("EmployeeOffboardingExample page — external links", () => {
  it("every <a target=\"_blank\"> contains an SVG (ExternalLink icon)", () => {
    const { container } = render(
      <WithRouter>
        <EmployeeOffboardingExample />
      </WithRouter>,
    );
    expect(
      anchorsMissingSvg(getExternalAnchors(container)),
      "These <a target=\"_blank\"> links are missing an ExternalLink icon",
    ).toHaveLength(0);
  });

  it('every external anchor has rel="noopener noreferrer"', () => {
    const { container } = render(
      <WithRouter>
        <EmployeeOffboardingExample />
      </WithRouter>,
    );
    expect(
      anchorsWithoutRel(getExternalAnchors(container)),
      'These external links are missing rel="noopener noreferrer"',
    ).toHaveLength(0);
  });
});
