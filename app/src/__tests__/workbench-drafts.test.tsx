/** @vitest-environment happy-dom */
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DRAFT_PREFIX, MAX_DRAFT_LENGTH, useWorkbenchDrafts } from "@/hooks/useWorkbenchDrafts";
vi.mock("@/lib/bpmn-renderer", () => ({ BpmnRenderer: () => <svg /> }));
vi.mock("@/components/StatusRibbon", () => ({ StatusRibbon: () => null }));
import Playground from "@/pages/Playground";
const custom = 'bpmn-beta\naccTitle: My process\nstart s "Begin"\nend e "Finish"\ns --> e';
beforeEach(() => { localStorage.clear(); window.history.replaceState(null, "", "/playground"); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function denyWrites() {
  const storage = localStorage;
  vi.stubGlobal("localStorage", {
    get length() { return storage.length; },
    key: (index: number) => storage.key(index),
    getItem: (key: string) => storage.getItem(key),
    setItem: () => { throw new Error("Storage denied"); },
  });
}

describe("Workbench recovery", () => {
  it("recovers the latest edit after unmount, including empty source", () => {
    const first = renderHook(useWorkbenchDrafts);
    act(() => { first.result.current.save(custom); first.result.current.save(""); });
    first.unmount();
    const next = renderHook(useWorkbenchDrafts);
    expect(next.result.current.drafts.map(d => d.source)).toEqual([""]);
  });
  it("keeps separate writers in two simultaneous editors", () => {
    const a = renderHook(useWorkbenchDrafts), b = renderHook(useWorkbenchDrafts);
    act(() => { a.result.current.save("first"); b.result.current.save("second"); a.result.current.save("updated first"); });
    const reopened = renderHook(useWorkbenchDrafts);
    expect(reopened.result.current.drafts.map(d => d.source).sort()).toEqual(["second", "updated first"]);
  });
  it("ignores malformed, mismatched and invalid-date records without deleting them", () => {
    localStorage.setItem(DRAFT_PREFIX + "bad", "{");
    localStorage.setItem(DRAFT_PREFIX + "date", JSON.stringify({ version: 1, id: "date", source: custom, savedAt: 1e100 }));
    localStorage.setItem(DRAFT_PREFIX + "key", JSON.stringify({ version: 1, id: "other", source: custom, savedAt: 1 }));
    expect(renderHook(useWorkbenchDrafts).result.current.drafts).toEqual([]);
    expect(localStorage.length).toBe(3);
  });
  it("preserves the last saved record if storage fills up", () => {
    const hook = renderHook(useWorkbenchDrafts);
    act(() => { hook.result.current.save(custom); });
    denyWrites();
    act(() => { expect(hook.result.current.save("new work")).toBe(false); });
    expect(hook.result.current.saveState).toBe("unavailable");
    expect(JSON.parse(localStorage.getItem(localStorage.key(0)!)!).source).toBe(custom);
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
  it("blocks same-tab navigation after failed storage when the author cancels", () => {
    denyWrites();
    Object.defineProperty(window, "confirm", { configurable: true, writable: true, value: vi.fn(() => false) });
    const hook = renderHook(useWorkbenchDrafts);
    act(() => { hook.result.current.save(custom); });
    const anchor = document.createElement("a"); anchor.href = "/skills"; document.body.append(anchor);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true }); anchor.dispatchEvent(event); anchor.remove();
    expect(event.defaultPrevented).toBe(true);
  });
  it("reports oversized drafts and never overwrites a smaller recovery copy", () => {
    const hook = renderHook(useWorkbenchDrafts);
    act(() => { hook.result.current.save(custom); hook.result.current.save("x".repeat(MAX_DRAFT_LENGTH + 1)); });
    expect(hook.result.current.saveState).toBe("too-large");
    expect(JSON.parse(localStorage.getItem(localStorage.key(0)!)!).source).toBe(custom);
  });
  it("opens shared examples without replacing existing drafts", () => {
    localStorage.setItem(DRAFT_PREFIX + "kept", JSON.stringify({ version: 1, id: "kept", source: custom, savedAt: 1 }));
    window.history.replaceState(null, "", "/playground?example=01-linear");
    render(<Playground />);
    expect((screen.getByTestId("textarea-bpmn-source") as HTMLTextAreaElement).value).not.toBe(custom);
    expect(localStorage.length).toBe(1);
    expect(screen.getByTestId("draft-recovery").textContent).toContain("My process");
  });
  it("restores a copy and preserves the original recovery record", () => {
    localStorage.setItem(DRAFT_PREFIX + "kept", JSON.stringify({ version: 1, id: "kept", source: custom, savedAt: 1 }));
    render(<Playground />);
    fireEvent.click(screen.getByRole("button", { name: "Restore draft", hidden: true }));
    expect((screen.getByTestId("textarea-bpmn-source") as HTMLTextAreaElement).value).toBe(custom);
    expect(localStorage.length).toBe(2);
    expect(JSON.parse(localStorage.getItem(DRAFT_PREFIX + "kept")!).source).toBe(custom);
  });
  it("offers undo after switching away from edited source", () => {
    render(<Playground />);
    const editor = screen.getByTestId("textarea-bpmn-source") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: custom } });
    fireEvent.change(screen.getByTestId("select-example"), { target: { value: "01-linear" } });
    expect(editor.value).not.toBe(custom);
    fireEvent.click(screen.getByRole("button", { name: "Undo example change" }));
    expect(editor.value).toBe(custom);
  });
  it("updates the recovery list on another tab's save without replacing the active editor", () => {
    render(<Playground />);
    fireEvent.change(screen.getByTestId("textarea-bpmn-source"), { target: { value: custom } });
    localStorage.setItem(DRAFT_PREFIX + "other", JSON.stringify({ version: 1, id: "other", source: "other work", savedAt: 1 }));
    act(() => { window.dispatchEvent(new StorageEvent("storage", { key: DRAFT_PREFIX + "other" })); });
    expect(screen.getByTestId("draft-recovery").textContent).toContain("Recover saved work (1)");
    expect((screen.getByTestId("textarea-bpmn-source") as HTMLTextAreaElement).value).toBe(custom);
  });
  it("switches workspace views with arrow keys and exposes complete labels", () => {
    render(<Playground />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "Diagram" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Source" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.change(screen.getByTestId("textarea-bpmn-source"), { target: { value: custom } });
    expect(screen.getByText(/Read all diagram labels/).textContent).toContain("2");
  });
  it("detects recovery removal in another tab and writes the next edit to a new key", () => {
    const hook = renderHook(useWorkbenchDrafts);
    act(() => { hook.result.current.save(custom); });
    const oldKey = localStorage.key(0)!;
    localStorage.removeItem(oldKey);
    act(() => { window.dispatchEvent(new StorageEvent("storage", { key: oldKey, newValue: null })); });
    expect(hook.result.current.saveState).toBe("removed");
    act(() => { hook.result.current.save(custom + "\n"); });
    expect(localStorage.key(0)).not.toBe(oldKey);
    expect(hook.result.current.saveState).toBe("saved");
  });
});
