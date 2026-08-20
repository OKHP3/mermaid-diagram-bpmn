/**
 * playground-keyboard-touch.test.tsx
 *
 * Tests for keyboard zoom, touch pan, and affordance hint discoverability
 * added in Task #205 (Playground: keyboard zoom and touch pan).
 *
 * Scope:
 *   - Canvas is keyboard-focusable (tabIndex=0) and has an accessible aria-label
 *   - Keyboard shortcuts: + / = zoom in, - zoom out, 0 resets, arrow keys pan
 *   - Touch single-finger drag updates the translate (tx/ty)
 *   - Two-finger pinch zooms around the touch midpoint
 *   - Affordance hint is always visible and mentions keyboard shortcuts
 *
 * Test strategy:
 *   BpmnRenderer is mocked (same pattern as other playground tests).
 *   Keyboard events are fired via React synthetic fireEvent.keyDown on the
 *   canvas element. Touch events are dispatched as native events via
 *   fireEvent.touchStart/Move/End — our handlers are registered through
 *   native addEventListener, which happy-dom dispatches correctly.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ── Mock BpmnRenderer and StatusRibbon (same pattern as other playground tests)
vi.mock("@/lib/bpmn-renderer", () => ({
  BpmnRenderer: () => (
    <svg data-testid="mock-renderer">
      <title>Mock Diagram</title>
    </svg>
  ),
}));
vi.mock("@/components/StatusRibbon", () => ({ StatusRibbon: () => null }));

import Playground from "@/pages/Playground";

afterEach(() => vi.restoreAllMocks());

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the canvas div (the pan/zoom interaction target). */
function getCanvas() {
  return screen.getByTestId("div-diagram-preview");
}

/** Returns the current zoom percentage as a number (e.g. 100 for 100%). */
function getZoomPct(): number {
  const label = screen.getByTestId("zoom-level");
  return parseInt(label.textContent ?? "0", 10);
}

// ── Keyboard focusability ─────────────────────────────────────────────────────

describe("Playground canvas — keyboard focusability", () => {
  it("canvas element has tabIndex 0 (keyboard reachable)", () => {
    render(<Playground />);
    expect(getCanvas().tabIndex).toBe(0);
  });

  it("canvas element has a non-empty aria-label", () => {
    render(<Playground />);
    const label = getCanvas().getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label!.length).toBeGreaterThan(0);
  });

  it("aria-label mentions zoom and pan", () => {
    render(<Playground />);
    const label = getCanvas().getAttribute("aria-label")!.toLowerCase();
    expect(label).toContain("zoom");
    expect(label).toContain("pan");
  });
});

// ── Keyboard zoom: + / = zoom in ─────────────────────────────────────────────

describe("Playground canvas — keyboard zoom in (+ / =)", () => {
  it("pressing + increases zoom above 100%", async () => {
    render(<Playground />);
    expect(getZoomPct()).toBe(100);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "+" });
    });
    expect(getZoomPct()).toBeGreaterThan(100);
  });

  it("pressing = also increases zoom", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "=" });
    });
    expect(getZoomPct()).toBeGreaterThan(100);
  });

  it("pressing + multiple times compounds the zoom", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "+" });
      fireEvent.keyDown(getCanvas(), { key: "+" });
    });
    // Two 1.2× steps ≈ 144%
    expect(getZoomPct()).toBeGreaterThanOrEqual(140);
  });
});

// ── Keyboard zoom: - zoom out ─────────────────────────────────────────────────

describe("Playground canvas — keyboard zoom out (-)", () => {
  it("pressing - decreases zoom below 100%", async () => {
    render(<Playground />);
    expect(getZoomPct()).toBe(100);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "-" });
    });
    expect(getZoomPct()).toBeLessThan(100);
  });
});

// ── Keyboard zoom: 0 resets view ─────────────────────────────────────────────

describe("Playground canvas — keyboard reset (0)", () => {
  it("pressing 0 after zooming in returns to 100%", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "+" });
    });
    expect(getZoomPct()).toBeGreaterThan(100);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "0" });
    });
    expect(getZoomPct()).toBe(100);
  });

  it("pressing 0 after zooming out returns to 100%", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "-" });
    });
    expect(getZoomPct()).toBeLessThan(100);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "0" });
    });
    expect(getZoomPct()).toBe(100);
  });
});

// ── Keyboard pan: arrow keys ──────────────────────────────────────────────────

describe("Playground canvas — keyboard pan (arrow keys)", () => {
  /** Returns the style.transform string of the inner translate/scale div. */
  function getTransform(): string {
    const canvas = getCanvas();
    const inner = canvas.querySelector("div") as HTMLDivElement;
    return inner?.style.transform ?? "";
  }

  it("ArrowLeft pans the view (tx increases)", async () => {
    render(<Playground />);
    const before = getTransform();
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "ArrowLeft" });
    });
    const after = getTransform();
    // tx should have changed from 0 to 40
    expect(after).not.toBe(before);
    expect(after).toContain("40px");
  });

  it("ArrowRight pans the view (tx decreases)", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "ArrowRight" });
    });
    // tx = -40
    expect(getTransform()).toContain("-40px");
  });

  it("ArrowUp pans the view (ty increases)", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "ArrowUp" });
    });
    // ty = 40
    expect(getTransform()).toContain("40px");
  });

  it("ArrowDown pans the view (ty decreases)", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "ArrowDown" });
    });
    // ty = -40
    expect(getTransform()).toContain("-40px");
  });
});

// ── Touch pan ─────────────────────────────────────────────────────────────────

describe("Playground canvas — touch pan", () => {
  /** Returns the style.transform string of the inner translate/scale div. */
  function getTransform(): string {
    const canvas = getCanvas();
    const inner = canvas.querySelector("div") as HTMLDivElement;
    return inner?.style.transform ?? "";
  }

  it("single-finger touch pan updates the view translate", async () => {
    render(<Playground />);
    const canvas = getCanvas();
    const before = getTransform();

    await act(async () => {
      // Touch start at (100, 80)
      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 100, clientY: 80, identifier: 0 }],
      });
      // Touch move to (150, 100) — delta: dx=50, dy=20
      fireEvent.touchMove(canvas, {
        touches: [{ clientX: 150, clientY: 100, identifier: 0 }],
      });
    });

    const after = getTransform();
    expect(after).not.toBe(before);
    // tx = 0 + 50 = 50, ty = 0 + 20 = 20
    expect(after).toContain("50px");
    expect(after).toContain("20px");
  });

  it("touch pan clears state on touchend", async () => {
    render(<Playground />);
    const canvas = getCanvas();

    await act(async () => {
      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 100, clientY: 80, identifier: 0 }],
      });
      fireEvent.touchMove(canvas, {
        touches: [{ clientX: 150, clientY: 100, identifier: 0 }],
      });
      fireEvent.touchEnd(canvas, { touches: [] });
      // A second move after touchend should not change tx/ty further
      fireEvent.touchMove(canvas, {
        touches: [{ clientX: 200, clientY: 150, identifier: 0 }],
      });
    });

    // Should still be at the first move's position (50, 20), not (150, 70)
    const transform = getTransform();
    expect(transform).toContain("50px");
  });

  it("pinch spread increases scale around the two-touch midpoint", async () => {
    render(<Playground />);
    const canvas = getCanvas();

    await act(async () => {
      fireEvent.touchStart(canvas, {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 },
          { clientX: 200, clientY: 100, identifier: 1 },
        ],
      });
      const moveResult = fireEvent.touchMove(canvas, {
        touches: [
          { clientX: 50, clientY: 100, identifier: 0 },
          { clientX: 250, clientY: 100, identifier: 1 },
        ],
      });
      expect(moveResult).toBe(false);
    });

    expect(getZoomPct()).toBe(200);
    // The midpoint stays at x=150, so scale 2 moves the origin to -150px.
    expect(getTransform()).toContain("-150px");
  });

  it("pinch close decreases scale", async () => {
    render(<Playground />);
    const canvas = getCanvas();

    await act(async () => {
      fireEvent.touchStart(canvas, {
        touches: [
          { clientX: 50, clientY: 100, identifier: 0 },
          { clientX: 250, clientY: 100, identifier: 1 },
        ],
      });
      fireEvent.touchMove(canvas, {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 },
          { clientX: 200, clientY: 100, identifier: 1 },
        ],
      });
    });

    expect(getZoomPct()).toBe(50);
  });
});

// ── Affordance hint ───────────────────────────────────────────────────────────

describe("Playground canvas — affordance hint (TD-016)", () => {
  it("canvas hint is always visible on mount", () => {
    render(<Playground />);
    expect(screen.getByTestId("canvas-hint")).not.toBeNull();
  });

  it("hint mentions keyboard shortcut for zoom", () => {
    render(<Playground />);
    const hint = screen.getByTestId("canvas-hint").textContent ?? "";
    // Should include +/− or similar keyboard affordance
    expect(hint).toMatch(/\+|−|keys/i);
  });

  it("hint mentions pan", () => {
    render(<Playground />);
    const hint = screen.getByTestId("canvas-hint").textContent ?? "";
    expect(hint.toLowerCase()).toContain("pan");
  });

  it("hint remains visible after zooming in (not conditional on default state)", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.keyDown(getCanvas(), { key: "+" });
    });
    // Hint should still be in the DOM even after the view changes
    expect(screen.getByTestId("canvas-hint")).not.toBeNull();
  });
});
