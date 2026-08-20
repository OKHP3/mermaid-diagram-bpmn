/**
 * playground-error-panel.test.tsx
 *
 * Tests for Playground error-panel hardening (Task #206).
 *
 * Scope:
 *   - Any invalid source surfaces a visible error panel — never a blank canvas
 *   - Error messages include line numbers when the parser's ParseError carries them
 *   - The error detail bar has role="alert" and aria-live="polite" for accessibility
 *   - data-parse-error-line attribute is set when a line number is known
 *   - The error panel clears when valid source is entered
 *   - The parse-error badge ("Parse error") appears/disappears correctly
 *   - Empty source shows the renderer's fallback, not a blank canvas
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ── BpmnRenderer: use the REAL renderer to exercise its own error path; but we
// need to mock the heavy parser dependencies it pulls in. Instead we mock only
// StatusRibbon (no effect on error testing).
// We let bpmn-renderer remain real so its own catch-path can be exercised.
// We mock BpmnRenderer to a lightweight stub that still surface parse errors
// via getParseError in Playground (Playground calls parse() independently).
vi.mock("@/lib/bpmn-renderer", () => ({
  BpmnRenderer: ({ source }: { source: string }) => {
    if (!source.trim()) {
      return (
        <div data-testid="renderer-fallback">
          No nodes parsed. Check your bpmn-beta syntax.
        </div>
      );
    }
    return <svg data-testid="mock-renderer" />;
  },
}));

vi.mock("@/components/StatusRibbon", () => ({ StatusRibbon: () => null }));

import Playground from "@/pages/Playground";

afterEach(() => vi.restoreAllMocks());

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_SOURCE = `bpmn-beta
start s1 "Begin"
task t1 "Do work"
end e1 "Done"
s1 --> t1
t1 --> e1`;

/** A parse error that the bpmn-beta parser throws with a line number. */
const SOURCE_WITH_NESTED_POOL = `bpmn-beta
pool p1 "Outer" {
  pool p2 "Inner" {
  }
}`;

/** A ParseError after comments and blank lines; its physical error line is 7. */
const SOURCE_WITH_GAPS_BEFORE_ERROR = `bpmn-beta
%% Document the outer participant

pool p1 "Outer" {
  %% This nested pool is invalid

  pool p2 "Inner" {
  }
}`;

/** A source that is syntactically legal but has no nodes (>10 chars). */
const SOURCE_NO_NODES = `bpmn-beta
%% This is a long comment with no actual node definitions whatsoever`;

function setSource(value: string) {
  fireEvent.change(screen.getByTestId("textarea-bpmn-source"), {
    target: { value },
  });
}

// ── Error panel presence ──────────────────────────────────────────────────────

describe("Playground error panel — appearance on invalid input", () => {
  it("shows the parse-error badge when source is syntactically invalid", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    expect(screen.getByTestId("text-parse-error")).not.toBeNull();
  });

  it("shows the error detail bar when source is syntactically invalid", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    expect(screen.getByTestId("text-parse-error-detail")).not.toBeNull();
  });

  it("shows an error message for source with no nodes (>10 chars)", () => {
    render(<Playground />);
    setSource(SOURCE_NO_NODES);
    const detail = screen.getByTestId("text-parse-error-detail");
    expect(detail.textContent).toContain("No nodes found");
  });

  it("error detail bar is non-empty — never blank on error", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    const detail = screen.getByTestId("text-parse-error-detail");
    expect(detail.textContent!.trim().length).toBeGreaterThan(0);
  });
});

// ── Line number in error message ──────────────────────────────────────────────

describe("Playground error panel — line number surfacing", () => {
  it("error message contains a line reference for structured ParseErrors", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    const detail = screen.getByTestId("text-parse-error-detail");
    // ParseError message format: "Line N: <description>"
    expect(detail.textContent).toMatch(/[Ll]ine\s+\d+/);
  });

  it("data-parse-error-line attribute is set for ParseErrors with a line", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    const detail = screen.getByTestId("text-parse-error-detail");
    const attr = detail.getAttribute("data-parse-error-line");
    expect(attr).not.toBeNull();
    expect(Number(attr)).toBeGreaterThan(0);
  });

  it("data-parse-error-line is absent for non-positional errors", () => {
    render(<Playground />);
    setSource(SOURCE_NO_NODES);
    const detail = screen.getByTestId("text-parse-error-detail");
    // "No nodes found" is not a ParseError — no line attribute
    expect(detail.getAttribute("data-parse-error-line")).toBeNull();
  });

  it("highlights the parser-reported source line in the editor", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_GAPS_BEFORE_ERROR);

    const detail = screen.getByTestId("text-parse-error-detail");
    const highlight = screen.getByTestId("editor-error-line-highlight");

    expect(detail.getAttribute("data-parse-error-line")).toBe("7");
    expect(highlight.getAttribute("data-error-line")).toBe(
      detail.getAttribute("data-parse-error-line"),
    );
    expect(highlight.getAttribute("aria-hidden")).toBe("true");
  });

  it("clears the editor highlight when the parse error resolves", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    expect(screen.getByTestId("editor-error-line-highlight")).not.toBeNull();

    setSource(VALID_SOURCE);

    expect(screen.queryByTestId("editor-error-line-highlight")).toBeNull();
  });

  it("clears the editor highlight when a new example is loaded", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    expect(screen.getByTestId("editor-error-line-highlight")).not.toBeNull();

    fireEvent.click(screen.getByTestId("button-example-01-linear"));

    expect(screen.queryByTestId("editor-error-line-highlight")).toBeNull();
  });
});

// ── Accessibility ─────────────────────────────────────────────────────────────

describe("Playground error panel — accessibility attributes", () => {
  it("error detail bar has role='alert'", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    const detail = screen.getByTestId("text-parse-error-detail");
    expect(detail.getAttribute("role")).toBe("alert");
  });

  it("error detail bar has aria-live='polite'", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    const detail = screen.getByTestId("text-parse-error-detail");
    expect(detail.getAttribute("aria-live")).toBe("polite");
  });

  it("error detail bar has aria-atomic='true'", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    const detail = screen.getByTestId("text-parse-error-detail");
    expect(detail.getAttribute("aria-atomic")).toBe("true");
  });
});

// ── Error panel clears on valid input ─────────────────────────────────────────

describe("Playground error panel — clears when source becomes valid", () => {
  it("parse-error badge disappears after valid source is entered", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    expect(screen.getByTestId("text-parse-error")).not.toBeNull();
    setSource(VALID_SOURCE);
    expect(screen.queryByTestId("text-parse-error")).toBeNull();
  });

  it("error detail bar disappears after valid source is entered", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    expect(screen.getByTestId("text-parse-error-detail")).not.toBeNull();
    setSource(VALID_SOURCE);
    expect(screen.queryByTestId("text-parse-error-detail")).toBeNull();
  });
});

// ── No blank canvas on any input ──────────────────────────────────────────────

describe("Playground — no blank canvas on any input", () => {
  it("invalid syntax: canvas shows error panel, not blank", () => {
    render(<Playground />);
    setSource(SOURCE_WITH_NESTED_POOL);
    // Error panel is visible
    expect(screen.getByTestId("text-parse-error-detail")).not.toBeNull();
    // Canvas is still present (not unmounted)
    expect(screen.getByTestId("div-diagram-preview")).not.toBeNull();
  });

  it("empty source: renderer fallback is shown, not blank", () => {
    render(<Playground />);
    setSource("");
    // BpmnRenderer stub shows its fallback message for empty source
    expect(screen.getByTestId("renderer-fallback")).not.toBeNull();
  });

  it("no-nodes source: parse-error detail is visible with guidance", () => {
    render(<Playground />);
    setSource(SOURCE_NO_NODES);
    const detail = screen.getByTestId("text-parse-error-detail");
    expect(detail.textContent!.length).toBeGreaterThan(0);
  });

  it("valid source: no error panel, diagram canvas is present", () => {
    render(<Playground />);
    setSource(VALID_SOURCE);
    expect(screen.queryByTestId("text-parse-error")).toBeNull();
    expect(screen.queryByTestId("text-parse-error-detail")).toBeNull();
    expect(screen.getByTestId("div-diagram-preview")).not.toBeNull();
  });
});
