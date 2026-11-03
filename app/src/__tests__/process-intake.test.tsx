/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ProcessIntake from "@/pages/ProcessIntake";
vi.mock("@/components/StatusRibbon", () => ({ StatusRibbon: () => null }));
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/intake");
});
afterEach(cleanup);

it("keeps the previous brief and recovery copy when a change cannot round-trip", () => {
  render(<ProcessIntake />);
  const name = screen.getByLabelText("Process name", { exact: true });
  fireEvent.change(name, { target: { value: "Retained process" } });
  fireEvent.change(name, { target: { value: "x".repeat(10_001) } });
  expect((name as HTMLInputElement).value).toBe("Retained process");
  expect(screen.getByRole("alert").textContent).toContain(
    "Your previous version is unchanged",
  );
  const saved = JSON.parse(localStorage.getItem(localStorage.key(0)!)!);
  expect(JSON.parse(saved.source).pir.process_name).toBe("Retained process");
});
