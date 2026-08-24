/**
 * playground-svg-export.test.tsx
 *
 * Tests for the Playground page's "Download SVG" export action.
 *
 * Scope:
 *   - Export button is present and focusable (keyboard operable)
 *   - Button is disabled when source is empty or has a parse error
 *   - Button is enabled when a valid diagram is rendered
 *   - Clicking produces a Blob with MIME type image/svg+xml
 *   - The Blob contains SVG markup (serialized output from the rendered element)
 *   - The download filename ends with .svg and is derived from the active example
 *   - The object URL is revoked after download
 *   - The button shows a "Saved!" success state after export
 *   - The button carries an accessible aria-label
 *
 * Test strategy:
 *   BpmnRenderer is mocked to return a real SVG element so that querySelector('svg')
 *   finds it and XMLSerializer can serialize it. The mock SVG carries a <title> and
 *   <desc> and an association connector so metadata and connector-preservation
 *   contracts can be asserted.
 *
 *   URL.createObjectURL / revokeObjectURL are stubbed. Anchor click is intercepted.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ── BpmnRenderer mock — returns a real SVG element with title/desc ─────────────
vi.mock("@/lib/bpmn-renderer", () => ({
  BpmnRenderer: ({ source }: { source: string }) => {
    // Minimal SVG that mirrors what the real renderer produces.
    // Includes <title> and <desc> to verify metadata is preserved in export.
    if (!source.trim()) return null;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        data-testid="mock-svg-renderer"
      >
        <title>Mock BPMN Diagram</title>
        <desc>A mock bpmn-beta diagram for test</desc>
        <circle cx="50" cy="50" r="18" className="bpmn-event" />
        <line
          x1="68"
          y1="50"
          x2="120"
          y2="50"
          className="bpmn-flow--association"
          strokeDasharray="2 3"
        />
        <style>{".bpmn-event { fill: hsl(var(--card)); }"}</style>
      </svg>
    );
  },
}));

// ── Stub StatusRibbon ─────────────────────────────────────────────────────────
vi.mock("@/components/StatusRibbon", () => ({
  StatusRibbon: () => null,
}));

import Playground from "@/pages/Playground";
import { BPMN_EXAMPLES, DEFAULT_EXAMPLE_ID } from "@/lib/bpmn-examples";
import { EXPORT_THEME } from "@/lib/bpmn-styles";

// ── Download stub helpers ─────────────────────────────────────────────────────

let capturedBlob: Blob | null = null;
let capturedDownloadAttr: string | null = null;

function stubDownload() {
  capturedBlob = null;
  capturedDownloadAttr = null;

  vi.spyOn(URL, "createObjectURL").mockImplementation((obj: Blob | MediaSource) => {
    capturedBlob = obj as Blob;
    return "blob:mock-svg-url";
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

  const origCreate = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    const el = origCreate(tag);
    if (tag === "a") {
      Object.defineProperty(el, "click", {
        value: () => {
          capturedDownloadAttr = (el as HTMLAnchorElement).download;
        },
        configurable: true,
      });
    }
    return el;
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Playground — SVG export button presence and accessibility", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders a Download SVG button", () => {
    render(<Playground />);
    expect(screen.getByTestId("button-export-svg")).not.toBeNull();
  });

  it("button is a <button> element (keyboard operable)", () => {
    render(<Playground />);
    const btn = screen.getByTestId("button-export-svg") as HTMLButtonElement;
    expect(btn.tagName).toBe("BUTTON");
  });

  it("button has an aria-label in idle state", () => {
    render(<Playground />);
    const label = screen.getByTestId("button-export-svg").getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label!.length).toBeGreaterThan(0);
  });

  it("button is enabled when a valid diagram is loaded", () => {
    render(<Playground />);
    const btn = screen.getByTestId("button-export-svg") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });
});

describe("Playground — SVG export button disabled states", () => {
  afterEach(() => vi.restoreAllMocks());

  it("button is disabled when source is cleared to empty", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.change(screen.getByTestId("textarea-bpmn-source"), {
        target: { value: "" },
      });
    });
    const btn = screen.getByTestId("button-export-svg") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("button is disabled when source produces a parse error", async () => {
    render(<Playground />);
    // A >10-char string that has no valid bpmn-beta nodes triggers the parse-error path.
    // Inject a line that is syntactically invalid so the parser throws.
    await act(async () => {
      fireEvent.change(screen.getByTestId("textarea-bpmn-source"), {
        target: { value: "bpmn-beta\n!!!invalid_token_that_cannot_parse!!!" },
      });
    });
    const btn = screen.getByTestId("button-export-svg") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("Playground — SVG export download", () => {
  beforeEach(() => stubDownload());
  afterEach(() => vi.restoreAllMocks());

  it("clicking export produces a non-empty Blob", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    expect(capturedBlob).not.toBeNull();
    const text = await capturedBlob!.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it("Blob MIME type is image/svg+xml", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    expect(capturedBlob!.type).toBe("image/svg+xml");
  });

  it("Blob content contains SVG markup", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    const text = await capturedBlob!.text();
    expect(text).toContain("<svg");
  });

  it("Blob content includes the mock SVG's <title> element", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    const text = await capturedBlob!.text();
    expect(text).toContain("Mock BPMN Diagram");
  });

  it("Blob content includes the mock SVG's <desc> element", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    const text = await capturedBlob!.text();
    expect(text).toContain("mock bpmn-beta diagram");
  });

  it("Blob content preserves association connector class and dash pattern", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    const text = await capturedBlob!.text();

    expect(text).toContain('class="bpmn-flow--association"');
    expect(text).toContain('stroke-dasharray="2 3"');
  });

  it("Blob content embeds resolved styles without CSS custom properties", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    const text = await capturedBlob!.text();

    expect(text).toContain(EXPORT_THEME.primaryColor);
    expect(text).not.toContain("var(--");
  });

  it("Blob content uses portable system font stacks instead of app fonts", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    const text = await capturedBlob!.text();

    expect(text).toContain(`font-family: ${EXPORT_THEME.fontFamily}`);
    expect(text).toContain(`font-family: ${EXPORT_THEME.monoFontFamily}`);
    expect(text).not.toContain("DM Sans");
    expect(text).not.toContain("JetBrains Mono");
  });

  it("download filename ends with .svg", () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    expect(capturedDownloadAttr).not.toBeNull();
    expect(capturedDownloadAttr!.endsWith(".svg")).toBe(true);
  });

  it("download filename is derived from the active example name", () => {
    render(<Playground />);
    const defaultExample =
      BPMN_EXAMPLES.find(e => e.id === DEFAULT_EXAMPLE_ID) ?? BPMN_EXAMPLES[0];
    fireEvent.click(screen.getByTestId("button-export-svg"));
    const expectedSlug = defaultExample.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    expect(capturedDownloadAttr).toBe(`${expectedSlug}.svg`);
  });

  it("revokes the object URL after download", () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-export-svg"));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-svg-url");
  });

  it("shows 'Saved!' label after successful export", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("button-export-svg"));
    });
    expect(screen.getByTestId("button-export-svg").textContent).toContain("Saved!");
  });

  it("aria-label reflects 'SVG downloaded' after export", async () => {
    render(<Playground />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("button-export-svg"));
    });
    const label = screen.getByTestId("button-export-svg").getAttribute("aria-label");
    expect(label).toContain("downloaded");
  });
});
