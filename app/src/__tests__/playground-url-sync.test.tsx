/**
 * Playground address-bar synchronization.
 *
 * The URL is intentionally debounced so input changes do not mutate browser
 * history during React's synchronous render work. These tests advance fake
 * timers explicitly to verify both the delay and final URL state.
 *
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/lib/bpmn-renderer", () => ({
  BpmnRenderer: () => <svg data-testid="mock-renderer" />,
}));

vi.mock("@/components/StatusRibbon", () => ({
  StatusRibbon: () => null,
}));

import Playground from "@/pages/Playground";
import { parseShareParams, SHARE_SOURCE_LIMIT } from "@/lib/url-share";

const SOURCE_A = 'bpmn-beta\nstart s1 "First"';
const SOURCE_B = 'bpmn-beta\nstart s2 "Latest"';

function changeSource(value: string) {
  fireEvent.change(screen.getByTestId("textarea-bpmn-source"), {
    target: { value },
  });
}

async function advanceUrlSync(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("Playground — debounced address-bar sharing", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/playground?example=01-linear");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("does not replace the URL during the synchronous input update", () => {
    vi.useFakeTimers();
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(<Playground />);
    replaceState.mockClear();

    changeSource(SOURCE_A);

    expect(replaceState).not.toHaveBeenCalled();
  });

  it("writes an encoded source after 400 ms", async () => {
    vi.useFakeTimers();
    render(<Playground />);

    changeSource(SOURCE_A);
    await advanceUrlSync(399);
    expect(parseShareParams(window.location.search)).toEqual({
      kind: "example",
      id: "01-linear",
    });

    await advanceUrlSync(1);
    expect(parseShareParams(window.location.search)).toEqual({
      kind: "source",
      source: SOURCE_A,
    });
  });

  it("writes only the latest source when typing continues within the debounce", async () => {
    vi.useFakeTimers();
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(<Playground />);
    replaceState.mockClear();

    changeSource(SOURCE_A);
    await advanceUrlSync(250);
    changeSource(SOURCE_B);
    await advanceUrlSync(400);

    expect(replaceState).toHaveBeenCalledOnce();
    expect(parseShareParams(window.location.search)).toEqual({
      kind: "source",
      source: SOURCE_B,
    });
  });

  it("clears share parameters after oversized input while showing the limit banner", async () => {
    vi.useFakeTimers();
    render(<Playground />);
    const oversized = "x".repeat(SHARE_SOURCE_LIMIT + 1);

    changeSource(oversized);
    expect(screen.getByTestId("banner-url-too-long")).not.toBeNull();

    await advanceUrlSync(400);
    expect(window.location.search).toBe("");
  });

  it("Share copies the edited source even before the pending URL sync finishes", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<Playground />);

    changeSource(SOURCE_A);
    await act(async () => {
      fireEvent.click(screen.getByTestId("button-share-url"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledOnce();
    const copiedUrl = new URL(writeText.mock.calls[0][0]);
    expect(parseShareParams(copiedUrl.search)).toEqual({
      kind: "source",
      source: SOURCE_A,
    });
  });
});