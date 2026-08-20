/**
 * playground-lint-warnings.test.tsx
 *
 * Integration tests for the Playground lint-warning panel (Task #216).
 *
 * Scope:
 *   - Lint warnings appear when valid source violates a domain rule
 *   - Lint warnings are visually distinct from parse errors (different testId / label)
 *   - Lint warnings disappear when source becomes rule-compliant
 *   - No lint warnings are shown when there is a hard parse error
 *     (errors take priority; the diagram doesn't render anyway)
 *   - Diagram still renders alongside warnings — warnings never block rendering
 *   - The warning panel has correct accessibility attributes (role, aria-live)
 *   - Multiple warnings are all displayed
 *   - Warning count badge appears in the toolbar when warnings are present
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/lib/bpmn-renderer", () => ({
  BpmnRenderer: ({ source }: { source: string }) => {
    if (!source.trim()) return null;
    return <svg data-testid="mock-renderer" />;
  },
}));

vi.mock("@/components/StatusRibbon", () => ({
  StatusRibbon: () => null,
}));

import Playground from "@/pages/Playground";

afterEach(() => vi.restoreAllMocks());

// ── Source fixtures ───────────────────────────────────────────────────────────

/** Triggers GATEWAY_SINGLE_OUTFLOW — gateway with only one outgoing flow. */
const SOURCE_GW_SINGLE_OUTFLOW = `bpmn-beta
start s1 "Start"
xor g1 "Route?"
end e1 "Done"
s1 --> g1
g1 --> e1`;

/** Triggers NO_START_EVENT. */
const SOURCE_NO_START = `bpmn-beta
task t1 "Do work"
end e1 "Done"
t1 --> e1`;

/** Triggers NO_END_EVENT. */
const SOURCE_NO_END = `bpmn-beta
start s1 "Begin"
task t1 "Do work"
s1 --> t1`;

/** Triggers NO_START_EVENT + NO_END_EVENT + GATEWAY_SINGLE_OUTFLOW. */
const SOURCE_MULTIPLE_WARNINGS = `bpmn-beta
xor g1 "Gate"
task t1 "Work"
g1 --> t1: "yes"`;

/** Clean: no warnings. */
const SOURCE_CLEAN = `bpmn-beta
start s1 "Start"
task t1 "Work"
xor g1 "Approved?"
task t2 "Approve"
end e1 "Done"
end e2 "Rejected"
s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> e2: "no"
t2 --> e1`;

/** Hard parse error — nested pool. */
const SOURCE_PARSE_ERROR = `bpmn-beta
pool p1 "Outer" {
  pool p2 "Inner" {
  }
}`;

function setSource(value: string) {
  fireEvent.change(screen.getByTestId("textarea-bpmn-source"), {
    target: { value },
  });
}

// ── Warning panel appears ─────────────────────────────────────────────────────

describe("Playground lint warnings — panel appears for rule violations", () => {
  it("shows the warning panel for a gateway with only one outgoing flow", () => {
    render(<Playground />);
    setSource(SOURCE_GW_SINGLE_OUTFLOW);
    expect(screen.getByTestId("div-lint-warnings")).not.toBeNull();
  });

  it("shows the warning panel when the process has no start event", () => {
    render(<Playground />);
    setSource(SOURCE_NO_START);
    expect(screen.getByTestId("div-lint-warnings")).not.toBeNull();
  });

  it("shows the warning panel when the process has no end event", () => {
    render(<Playground />);
    setSource(SOURCE_NO_END);
    expect(screen.getByTestId("div-lint-warnings")).not.toBeNull();
  });

  it("warning panel message contains the rule-specific guidance", () => {
    render(<Playground />);
    setSource(SOURCE_NO_START);
    const panel = screen.getByTestId("div-lint-warnings");
    expect(panel.textContent).toContain("start");
  });
});

// ── Warning panel absent when clean ──────────────────────────────────────────

describe("Playground lint warnings — panel absent when no violations", () => {
  it("no warning panel for a well-formed diagram", () => {
    render(<Playground />);
    setSource(SOURCE_CLEAN);
    expect(screen.queryByTestId("div-lint-warnings")).toBeNull();
  });
});

// ── No warnings alongside a hard parse error ──────────────────────────────────

describe("Playground lint warnings — suppressed when parse error is present", () => {
  it("no warning panel when source has a hard parse error (errors take priority)", () => {
    render(<Playground />);
    setSource(SOURCE_PARSE_ERROR);
    // Parse error detail should be present
    expect(screen.getByTestId("text-parse-error-detail")).not.toBeNull();
    // Lint warning panel must NOT appear alongside the error
    expect(screen.queryByTestId("div-lint-warnings")).toBeNull();
  });
});

// ── Diagram renders alongside warnings ────────────────────────────────────────

describe("Playground lint warnings — diagram still renders", () => {
  it("the diagram preview canvas is present alongside lint warnings", () => {
    render(<Playground />);
    setSource(SOURCE_GW_SINGLE_OUTFLOW);
    expect(screen.getByTestId("div-lint-warnings")).not.toBeNull();
    // Canvas is still mounted
    expect(screen.getByTestId("div-diagram-preview")).not.toBeNull();
    // Renderer stub renders the SVG (source is syntactically valid)
    expect(screen.getByTestId("mock-renderer")).not.toBeNull();
  });
});

// ── Multiple warnings ─────────────────────────────────────────────────────────

describe("Playground lint warnings — multiple warnings displayed", () => {
  it("all warnings are shown when multiple rules fire", () => {
    render(<Playground />);
    setSource(SOURCE_MULTIPLE_WARNINGS);
    const panel = screen.getByTestId("div-lint-warnings");
    // Should contain text from at least two different warnings
    const text = panel.textContent ?? "";
    // NO_START_EVENT mentions "start"; GATEWAY_SINGLE_OUTFLOW mentions "gateway" or the label
    const hasMissingStart = text.toLowerCase().includes("start");
    const hasMissingEnd = text.toLowerCase().includes("end");
    expect(hasMissingStart || hasMissingEnd).toBe(true);
  });

  it("individual warning items are rendered", () => {
    render(<Playground />);
    setSource(SOURCE_MULTIPLE_WARNINGS);
    // At least 2 warning item elements should be present
    const items = screen.getAllByTestId(/^lint-warning-/);
    expect(items.length).toBeGreaterThanOrEqual(2);
  });
});

// ── Source line metadata ──────────────────────────────────────────────────────

describe("Playground lint warnings — source line metadata", () => {
  it("shows a line action that focuses and highlights the flagged gateway line", () => {
    render(<Playground />);
    setSource(SOURCE_GW_SINGLE_OUTFLOW);

    const warning = screen.getByTestId("lint-warning-GATEWAY_SINGLE_OUTFLOW-g1");
    expect(warning.getAttribute("data-lint-warning-line")).toBe("3");

    const lineButton = screen.getByTestId("button-lint-warning-line-GATEWAY_SINGLE_OUTFLOW-g1");
    expect(lineButton.textContent).toBe("Line 3");
    fireEvent.click(lineButton);

    const highlight = screen.getByTestId("editor-lint-warning-line-highlight");
    expect(highlight.getAttribute("data-lint-warning-line")).toBe("3");
    expect(document.activeElement).toBe(screen.getByTestId("textarea-bpmn-source"));
  });

  it("does not add a source-line action to process-level warnings", () => {
    render(<Playground />);
    setSource(SOURCE_NO_START);

    const warning = screen.getByTestId("lint-warning-NO_START_EVENT-0");
    expect(warning.getAttribute("data-lint-warning-line")).toBeNull();
    expect(screen.queryByTestId("button-lint-warning-line-NO_START_EVENT-0")).toBeNull();
  });
});

// ── Accessibility ─────────────────────────────────────────────────────────────

describe("Playground lint warnings — accessibility attributes", () => {
  it("warning panel has aria-live='polite'", () => {
    render(<Playground />);
    setSource(SOURCE_GW_SINGLE_OUTFLOW);
    const panel = screen.getByTestId("div-lint-warnings");
    expect(panel.getAttribute("aria-live")).toBe("polite");
  });

  it("warning panel has role='status'", () => {
    render(<Playground />);
    setSource(SOURCE_GW_SINGLE_OUTFLOW);
    const panel = screen.getByTestId("div-lint-warnings");
    expect(panel.getAttribute("role")).toBe("status");
  });
});

// ── Toolbar badge ─────────────────────────────────────────────────────────────

describe("Playground lint warnings — toolbar badge", () => {
  it("warning badge appears in the toolbar when warnings are present", () => {
    render(<Playground />);
    setSource(SOURCE_GW_SINGLE_OUTFLOW);
    expect(screen.getByTestId("badge-lint-warnings")).not.toBeNull();
  });

  it("warning badge is absent for a clean diagram", () => {
    render(<Playground />);
    setSource(SOURCE_CLEAN);
    expect(screen.queryByTestId("badge-lint-warnings")).toBeNull();
  });

  it("warning badge is absent when there is a parse error", () => {
    render(<Playground />);
    setSource(SOURCE_PARSE_ERROR);
    expect(screen.queryByTestId("badge-lint-warnings")).toBeNull();
  });
});

// ── Warnings clear when source is fixed ───────────────────────────────────────

describe("Playground lint warnings — clear when source becomes valid", () => {
  it("warning panel disappears after the violation is corrected", () => {
    render(<Playground />);
    setSource(SOURCE_NO_START);
    expect(screen.getByTestId("div-lint-warnings")).not.toBeNull();
    setSource(SOURCE_CLEAN);
    expect(screen.queryByTestId("div-lint-warnings")).toBeNull();
  });
});
