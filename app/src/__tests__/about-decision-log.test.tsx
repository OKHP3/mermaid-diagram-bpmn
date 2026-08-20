// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import About from "@/pages/About";

vi.mock("wouter", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

describe("About — canonical decision log", () => {
  it("links contributors to the canonical decision log instead of rendering decision summaries", () => {
    const { container } = render(<About />);
    const decisionLogLink = container.querySelector('[data-testid="link-decision-log"]');

    expect(decisionLogLink?.getAttribute("href")).toBe(
      "https://github.com/OKHP3/mermaid-diagram-bpmn/blob/main/app/docs/decisions.md",
    );
    expect(container.querySelectorAll('[data-testid^="card-decision-"]')).toHaveLength(0);
    expect(container.textContent).toContain("this page intentionally does not duplicate those records");
  });
});