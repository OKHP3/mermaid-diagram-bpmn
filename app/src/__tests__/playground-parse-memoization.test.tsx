/**
 * Playground source-analysis memoization.
 *
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const parseSpy = vi.hoisted(() => vi.fn(() => ({
  getNodes: () => [{ id: "task-1" }],
})));

vi.mock("@/lib/bpmn-parser", () => ({
  parse: parseSpy,
  ParseError: class ParseError extends Error {},
}));

vi.mock("@/lib/bpmn-lint", () => ({ lint: () => [] }));
vi.mock("@/lib/bpmn-validate", () => ({ validate: () => [] }));
vi.mock("@/lib/bpmn-renderer", () => ({
  BpmnRenderer: () => <svg data-testid="mock-renderer" />,
}));
vi.mock("@/components/StatusRibbon", () => ({ StatusRibbon: () => null }));

import Playground from "@/pages/Playground";

describe("Playground source analysis", () => {
  it("parses an edited source once before deriving diagnostics", () => {
    render(<Playground />);
    parseSpy.mockClear();

    const updatedSource = `bpmn-beta
start s2 "Updated"
end e2 "Done"
s2 --> e2`;
    fireEvent.change(screen.getByTestId("textarea-bpmn-source"), {
      target: { value: updatedSource },
    });

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith(updatedSource);
  });
});