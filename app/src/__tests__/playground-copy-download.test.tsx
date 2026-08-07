/**
 * playground-copy-download.test.tsx
 *
 * Tests for the Playground page's copy-source and download-mmd actions.
 *
 * Scope:
 *   - "Copy source" button: success path, error path (clipboard denied), empty source
 *   - "Download .mmd" button: Blob content, filename derivation from active example,
 *     fallback filename when no example is active
 *   - Accessible live region announces copy outcome
 *   - Both buttons are present and keyboard-operable (focusable)
 *
 * Environment notes:
 *   - BpmnRenderer is mocked to avoid the full SVG pipeline in this test scope.
 *   - navigator.clipboard is not available in happy-dom; we stub it per-test.
 *   - URL.createObjectURL / revokeObjectURL are stubbed so Blob download can be
 *     inspected without a real browser context.
 *   - vi.useFakeTimers() is NOT set globally — it freezes waitFor's polling.
 *     The revert-after-2s test uses it locally and advances time explicitly with
 *     act() wrapping so React state flushes cleanly.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ── Stub BpmnRenderer so tests don't need the full parser/layout/SVG pipeline ─
vi.mock("@/lib/bpmn-renderer", () => ({
  BpmnRenderer: () => <svg data-testid="mock-renderer" />,
}));

// ── Stub StatusRibbon ─────────────────────────────────────────────────────────
vi.mock("@/components/StatusRibbon", () => ({
  StatusRibbon: () => null,
}));

import Playground from "@/pages/Playground";
import { BPMN_EXAMPLES, DEFAULT_EXAMPLE_ID } from "@/lib/bpmn-examples";

// ── Clipboard helpers ─────────────────────────────────────────────────────────

function stubClipboardSuccess() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  return writeText;
}

function stubClipboardFailure() {
  const writeText = vi.fn().mockRejectedValue(new DOMException("NotAllowedError"));
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  return writeText;
}

// ── Download helpers ──────────────────────────────────────────────────────────

let capturedBlob: Blob | null = null;
let capturedDownloadAttr: string | null = null;

function stubDownload() {
  capturedBlob = null;
  capturedDownloadAttr = null;

  vi.spyOn(URL, "createObjectURL").mockImplementation((obj: Blob | MediaSource) => {
    capturedBlob = obj as Blob;
    return "blob:mock-url";
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

  // Intercept <a>.click() so no real navigation fires.
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

// ── Shared helper: click and flush all async state ────────────────────────────

async function clickAndFlush(testId: string) {
  await act(async () => {
    fireEvent.click(screen.getByTestId(testId));
    // Flush the clipboard promise (microtask queue)
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Playground — copy source button", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a Copy button", () => {
    render(<Playground />);
    expect(screen.getByTestId("button-copy-source")).not.toBeNull();
  });

  it("Copy button is focusable (keyboard operable)", () => {
    render(<Playground />);
    const btn = screen.getByTestId("button-copy-source") as HTMLButtonElement;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.disabled).toBe(false);
  });

  it("calls clipboard.writeText with the current source on click", async () => {
    const writeText = stubClipboardSuccess();
    render(<Playground />);
    await clickAndFlush("button-copy-source");
    expect(writeText).toHaveBeenCalledOnce();
    const defaultExample =
      BPMN_EXAMPLES.find(e => e.id === DEFAULT_EXAMPLE_ID) ?? BPMN_EXAMPLES[0];
    expect(writeText).toHaveBeenCalledWith(defaultExample.source);
  });

  it("shows 'Copied!' label immediately after successful copy", async () => {
    stubClipboardSuccess();
    render(<Playground />);
    await clickAndFlush("button-copy-source");
    expect(screen.getByTestId("button-copy-source").textContent).toContain("Copied!");
  });

  it("reverts label back to 'Copy' after 2 seconds", async () => {
    vi.useFakeTimers();
    try {
      stubClipboardSuccess();
      render(<Playground />);

      // Click and flush clipboard promise inside fake-timer context.
      // act + advanceTimersByTimeAsync lets React flush state from the
      // resolved clipboard promise before we check for "Copied!".
      await act(async () => {
        fireEvent.click(screen.getByTestId("button-copy-source"));
        await vi.advanceTimersByTimeAsync(0); // flush microtasks
      });

      expect(screen.getByTestId("button-copy-source").textContent).toContain("Copied!");

      // Advance past the 2-second reset timeout.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2100);
      });

      expect(screen.getByTestId("button-copy-source").textContent).toContain("Copy");
    } finally {
      vi.useRealTimers();
    }
  });

  it("announces 'Source copied to clipboard' in the live region after success", async () => {
    stubClipboardSuccess();
    render(<Playground />);
    await clickAndFlush("button-copy-source");
    expect(screen.getByTestId("copy-live-region").textContent).toContain(
      "Source copied to clipboard",
    );
  });

  it("shows 'Failed' label when clipboard access is denied", async () => {
    stubClipboardFailure();
    render(<Playground />);
    await clickAndFlush("button-copy-source");
    expect(screen.getByTestId("button-copy-source").textContent).toContain("Failed");
  });

  it("announces failure in the live region when clipboard is denied", async () => {
    stubClipboardFailure();
    render(<Playground />);
    await clickAndFlush("button-copy-source");
    expect(screen.getByTestId("copy-live-region").textContent).toContain("Copy failed");
  });

  it("live region is empty in idle state", () => {
    render(<Playground />);
    expect(screen.getByTestId("copy-live-region").textContent?.trim()).toBe("");
  });
});

describe("Playground — download .mmd button", () => {
  beforeEach(() => {
    stubDownload();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a Download button", () => {
    render(<Playground />);
    expect(screen.getByTestId("button-download-mmd")).not.toBeNull();
  });

  it("Download button is focusable (keyboard operable)", () => {
    render(<Playground />);
    const btn = screen.getByTestId("button-download-mmd") as HTMLButtonElement;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.disabled).toBe(false);
  });

  it("produces a non-empty Blob when Download is clicked", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-download-mmd"));
    expect(capturedBlob).not.toBeNull();
    const text = await capturedBlob!.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it("Blob content matches the current source", async () => {
    render(<Playground />);
    const defaultExample =
      BPMN_EXAMPLES.find(e => e.id === DEFAULT_EXAMPLE_ID) ?? BPMN_EXAMPLES[0];
    fireEvent.click(screen.getByTestId("button-download-mmd"));
    expect(capturedBlob).not.toBeNull();
    const text = await capturedBlob!.text();
    expect(text).toBe(defaultExample.source);
  });

  it("Blob MIME type is text/plain", async () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-download-mmd"));
    expect(capturedBlob!.type).toBe("text/plain");
  });

  it("download filename ends with .mmd", () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-download-mmd"));
    expect(capturedDownloadAttr).not.toBeNull();
    expect(capturedDownloadAttr!.endsWith(".mmd")).toBe(true);
  });

  it("download filename is derived from the active example name", () => {
    render(<Playground />);
    const defaultExample =
      BPMN_EXAMPLES.find(e => e.id === DEFAULT_EXAMPLE_ID) ?? BPMN_EXAMPLES[0];
    fireEvent.click(screen.getByTestId("button-download-mmd"));
    const expectedSlug = defaultExample.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    expect(capturedDownloadAttr).toBe(`${expectedSlug}.mmd`);
  });

  it("revokes the object URL after download", () => {
    render(<Playground />);
    fireEvent.click(screen.getByTestId("button-download-mmd"));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("shows 'Empty' label and does not create a Blob when source is empty", async () => {
    render(<Playground />);
    // Clear the textarea so source is empty
    await act(async () => {
      fireEvent.change(screen.getByTestId("textarea-bpmn-source"), {
        target: { value: "" },
      });
    });
    fireEvent.click(screen.getByTestId("button-download-mmd"));
    expect(capturedBlob).toBeNull();
    expect(screen.getByTestId("button-download-mmd").textContent).toContain("Empty");
  });
});

describe("Playground — accessibility", () => {
  it("copy-live-region has role=status and aria-live=polite", () => {
    render(<Playground />);
    const region = screen.getByTestId("copy-live-region");
    expect(region.getAttribute("role")).toBe("status");
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.getAttribute("aria-atomic")).toBe("true");
  });

  it("Copy button has an aria-label in idle state", () => {
    render(<Playground />);
    const btn = screen.getByTestId("button-copy-source");
    const label = btn.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label!.length).toBeGreaterThan(0);
  });

  it("Download button has aria-label='Download source as .mmd file'", () => {
    render(<Playground />);
    const btn = screen.getByTestId("button-download-mmd");
    expect(btn.getAttribute("aria-label")).toBe("Download source as .mmd file");
  });
});
