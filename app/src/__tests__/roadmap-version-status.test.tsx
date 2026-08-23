// @vitest-environment happy-dom
/**
 * roadmap-version-status.test.tsx
 *
 * Regression guard: the public Roadmap page must reflect the version statuses
 * recorded in docs/version-checklist.md, which is the authoritative source
 * (it explicitly supersedes strategy documents and this page).
 *
 * HOW THIS CATCHES DRIFT
 * ──────────────────────
 * Expected statuses are NOT hard-coded here. Instead, parseChecklistStatuses()
 * reads docs/version-checklist.md at test-run time and extracts the [DONE] /
 * [CURRENT] / [PLANNED] label for each V0.x / V1.0 heading. The Roadmap is
 * then rendered and its data-testid status pills are compared against those
 * parsed values.
 *
 * If a future commit updates docs/version-checklist.md (e.g. V0.5 moves from
 * [PLANNED] → [CURRENT]) but forgets to update Roadmap.tsx, this suite will
 * fail immediately — without anyone needing to touch this file.
 *
 * HOW TO FIX A FAILURE
 * ────────────────────
 * 1. Open docs/version-checklist.md and note the [DONE]/[CURRENT]/[PLANNED]
 *    label on the failing version's heading.
 * 2. Update the corresponding `status` field in VERSION_LADDER in Roadmap.tsx.
 * 3. Re-run this suite to confirm it goes green.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import Roadmap from "@/pages/Roadmap";

// ── Checklist parser ──────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

/** Path to docs/version-checklist.md from workspace root. */
const CHECKLIST_PATH = resolve(
  __dirname,
  // app/src/__tests__/ → ../../.. → workspace root → docs/
  "../../../docs/version-checklist.md",
);

/**
 * Parse the authoritative version checklist and return a Map of
 *   version string (e.g. "V0.3") → UI status label (e.g. "Done").
 *
 * Matches headings of the form:
 *   ### V0.3 — … `[DONE]`
 *   ### V0.4 — … `[CURRENT]`
 *   ### V0.5 — … `[PLANNED]`
 */
function parseChecklistStatuses(): Map<string, string> {
  const text = readFileSync(CHECKLIST_PATH, "utf-8");
  const map  = new Map<string, string>();
  const re   = /^### (V\d+\.\d+) .+`\[(DONE|CURRENT|PLANNED)\]`/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const [, version, rawStatus] = m;
    const uiLabel =
      rawStatus === "DONE"    ? "Done"    :
      rawStatus === "CURRENT" ? "Current" : "Planned";
    map.set(version, uiLabel);
  }
  return map;
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

/**
 * Return the text content of the status pill for the given version.
 * Relies on data-testid="roadmap-status-vX-Y" added to each pill in
 * Roadmap.tsx's VERSION_LADDER render loop.
 */
function getPillText(container: HTMLElement, version: string): string {
  // "V0.3" → "roadmap-status-v0-3"
  const testId = `roadmap-status-${version.toLowerCase().replace(/\./g, "-")}`;
  const pill = container.querySelector(`[data-testid="${testId}"]`);
  if (!pill) throw new Error(`No status pill for ${version} (data-testid="${testId}")`);
  return pill.textContent?.trim() ?? "";
}

/**
 * Return a Map of all rendered version status pills:
 *   version (e.g. "V0.3") → UI label text (e.g. "Done")
 */
function getAllRenderedStatuses(container: HTMLElement): Map<string, string> {
  const map   = new Map<string, string>();
  const pills = container.querySelectorAll("[data-testid^='roadmap-status-']");
  for (const pill of Array.from(pills)) {
    const testId      = pill.getAttribute("data-testid")!;
    const versionPart = testId.replace("roadmap-status-", ""); // "v0-3"
    // "v0-3" → "V0.3"
    const version = "V" + versionPart.slice(1).replace("-", ".");
    map.set(version, pill.textContent?.trim() ?? "");
  }
  return map;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

let CHECKLIST_STATUSES: Map<string, string>;

beforeAll(() => {
  CHECKLIST_STATUSES = parseChecklistStatuses();
  expect(CHECKLIST_STATUSES.size).toBeGreaterThan(0); // guard: parse must succeed
});

describe("Roadmap — version status labels derived from docs/version-checklist.md", () => {
  // ── Full checklist comparison ───────────────────────────────────────────────

  it("the Roadmap and checklist cover exactly the same set of versions", () => {
    const { container } = render(<Roadmap />);
    const rendered = getAllRenderedStatuses(container);

    const checklistVersions = [...CHECKLIST_STATUSES.keys()].sort();
    const renderedVersions  = [...rendered.keys()].sort();

    expect(
      renderedVersions,
      "Roadmap and docs/version-checklist.md must list exactly the same versions. " +
      "Add missing versions to VERSION_LADDER in Roadmap.tsx, or remove versions " +
      "that no longer appear in the checklist.",
    ).toEqual(checklistVersions);
  });

  it("every rendered status pill matches docs/version-checklist.md", () => {
    const { container } = render(<Roadmap />);
    const rendered = getAllRenderedStatuses(container);

    expect(rendered.size).toBeGreaterThan(0); // guard: pills must exist

    for (const [version, expectedLabel] of CHECKLIST_STATUSES) {
      expect(
        rendered.get(version),
        `${version}: Roadmap shows "${rendered.get(version)}" but checklist says "${expectedLabel}" — update VERSION_LADDER status in Roadmap.tsx`,
      ).toBe(expectedLabel);
    }
  });

  // ── Named spot-checks (human-readable failure messages for the key milestones) ──

  it("V0.3 — checklist [DONE] must appear as Done on the Roadmap", () => {
    const { container } = render(<Roadmap />);
    const expected = CHECKLIST_STATUSES.get("V0.3");
    expect(expected, "V0.3 not found in docs/version-checklist.md").toBeDefined();
    expect(getPillText(container, "V0.3")).toBe(expected);
  });

  it("V0.4 — checklist [CURRENT] must appear as Current on the Roadmap", () => {
    const { container } = render(<Roadmap />);
    const expected = CHECKLIST_STATUSES.get("V0.4");
    expect(expected, "V0.4 not found in docs/version-checklist.md").toBeDefined();
    expect(getPillText(container, "V0.4")).toBe(expected);
  });

  it("V0.6 — checklist [DONE] must appear as Done on the Roadmap", () => {
    const { container } = render(<Roadmap />);
    const expected = CHECKLIST_STATUSES.get("V0.6");
    expect(expected, "V0.6 not found in docs/version-checklist.md").toBeDefined();
    expect(getPillText(container, "V0.6")).toBe(expected);
  });

  it("V0.3 exposes its verified shipped date", () => {
    const { container } = render(<Roadmap />);
    expect(container.querySelector("[data-testid='roadmap-shipped-v0-3']")?.textContent?.trim())
      .toBe("· 2026-08-04");
  });

  it("V0.6 exposes its verified shipped date", () => {
    const { container } = render(<Roadmap />);
    expect(container.querySelector("[data-testid='roadmap-shipped-v0-6']")?.textContent?.trim())
      .toBe("· 2026-08-04");
  });

  // ── Structural invariants ───────────────────────────────────────────────────

  it("exactly one version shows Current — only one active milestone at a time", () => {
    const { container } = render(<Roadmap />);
    const rendered = getAllRenderedStatuses(container);
    const currentVersions = [...rendered.entries()]
      .filter(([, label]) => label === "Current")
      .map(([v]) => v);
    expect(
      currentVersions,
      `Expected exactly 1 Current milestone, got: ${currentVersions.join(", ")}`,
    ).toHaveLength(1);
  });

  it("V0.6 deliverables note the CDN deferral, not claim it as shipped", () => {
    const { container } = render(<Roadmap />);
    const v06Step = container.querySelector("[data-testid='roadmap-step-v0-6']");
    expect(v06Step, "V0.6 step not found in rendered Roadmap").not.toBeNull();
    expect(v06Step!.textContent).toMatch(/deferred/i);
  });

  it("V0.4 (Current) has at least one listed deliverable", () => {
    const { container } = render(<Roadmap />);
    const v04Step = container.querySelector("[data-testid='roadmap-step-v0-4']");
    expect(v04Step, "V0.4 step not found in rendered Roadmap").not.toBeNull();
    expect(v04Step!.querySelectorAll("li").length).toBeGreaterThan(0);
  });

  it("Roadmap wrench-note cites docs/version-checklist.md as the authority for version status", () => {
    const { container } = render(<Roadmap />);
    expect(container.textContent).toMatch(/version-checklist\.md/);
  });
});
