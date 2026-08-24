// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import SyntaxComparison from "@/pages/SyntaxComparison";

describe("SyntaxComparison — reviewed competitive surface", () => {
  it("publishes all reviewed syntax options and the four @derari categories", () => {
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

    expect(pageText).toContain("checked 2026-08-21");
  });
});