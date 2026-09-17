// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import SyntaxComparison from "@/pages/SyntaxComparison";
import sourceBaseline from "../../../docs/dfki-7699-source-baseline.json";

describe("SyntaxComparison — reviewed competitive surface", () => {
  it("publishes all reviewed syntax options, @derari categories, and source dates", () => {
    const { container } = render(<SyntaxComparison />);
    const pageText = container.textContent ?? "";

    for (const label of [
      "bpmn-beta",
      "DFKI #7699",
      "@derari",
      "PlantUML",
      "Mermaid flowchart",
    ]) {
      expect(pageText).toContain(label);
    }

    const derariCode = Array.from(container.querySelectorAll("pre")).find((pre) =>
      pre.textContent?.includes("pool / lane structure"),
    );
    expect(derariCode).toBeDefined();
    for (const heading of [
      "# linear flow",
      "# gateway split",
      "# pool / lane structure",
      "# message flow",
    ]) {
      expect(derariCode?.textContent).toContain(heading);
    }

    expect(pageText).toContain(`reviewed ${sourceBaseline.reviewedAt}`);
    expect(container.querySelector('a[href="https://github.com/mermaid-js/mermaid/issues/8160"]')).not.toBeNull();
    expect(pageText).toContain("does not establish maintainer endorsement");
    expect(pageText).toContain("checked 2026-08-21");
  });
});
