/**
 * agent-skills-start-here.test.tsx
 *
 * Tests for the "Start Here" onboarding panel added to the Agent Skills page
 * (Task #207 / PRD-06 FR-05).
 *
 * Scope:
 *   - Panel is present on the Agent Skills page
 *   - Panel includes a visible agent-environment notice
 *   - Panel names the recommended first skill
 *   - Panel lists the two minimum context template files
 *   - Panel names the expected first artifact (PNS.md)
 *   - Panel includes a downloadable starter pack
 *   - Panel has a "Browse all skills" next-step CTA
 *   - A "Start Here" tab appears in the section navigation
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import AgentSkills from "@/pages/AgentSkills";

// ── Module mocks (same pattern as agent-skills-page.test.tsx) ─────────────────
vi.mock("wouter", () => ({
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ["/", vi.fn()],
  useParams: () => ({}),
}));

vi.mock("@/components/skills/PipelineDiagram", () => ({ PipelineDiagram: () => <div /> }));
vi.mock("@/components/skills/DependencyFlowDiagram", () => ({ DependencyFlowDiagram: () => <div /> }));
vi.mock("@/components/skills/PnsLifecycleTracker", () => ({ PnsLifecycleTracker: () => <div /> }));
vi.mock("@/components/skills/VariableFileCard", () => ({ VariableFileCard: () => <div /> }));
vi.mock("@/components/skills/SkillFrontmatterPreview", () => ({ SkillFrontmatterPreview: () => <div /> }));
vi.mock("@/components/skills/DownloadButton", () => ({
  DownloadButton: ({ label }: { label: string }) => <button>{label}</button>,
}));
vi.mock("@/components/skills/ZipDownloadButton", () => ({
  ZipDownloadButton: ({ label, filename }: { label: string; filename: string }) => (
    <button data-testid="zip-download-btn" data-filename={filename}>{label}</button>
  ),
}));

beforeEach(() => {
  render(<AgentSkills />);
});

// ── Panel presence ────────────────────────────────────────────────────────────

describe("Agent Skills — Start Here panel presence", () => {
  it("renders the Start Here panel", () => {
    expect(screen.getByTestId("start-here-panel")).not.toBeNull();
  });

  it("a 'Start Here' tab appears in the section navigation", () => {
    // The tab button label is "Start Here"
    const tab = screen.getByRole("button", { name: /start here/i });
    expect(tab).not.toBeNull();
  });
});

// ── Agent environment notice ──────────────────────────────────────────────────

describe("Agent Skills — Start Here env notice", () => {
  it("renders the environment notice element", () => {
    expect(screen.getByTestId("start-here-env-notice")).not.toBeNull();
  });

  it("notice text mentions 'agent environment'", () => {
    const notice = screen.getByTestId("start-here-env-notice");
    expect(notice.textContent!.toLowerCase()).toContain("agent environment");
  });

  it("notice text mentions 'not in this browser'", () => {
    const notice = screen.getByTestId("start-here-env-notice");
    expect(notice.textContent!.toLowerCase()).toContain("not in this browser");
  });

  it("notice names at least two compatible platforms", () => {
    const text = screen.getByTestId("start-here-env-notice").textContent!;
    // Should mention at least Claude Code and one other
    expect(text).toMatch(/claude/i);
    expect(text).toMatch(/copilot|codex|cursor|gemini/i);
  });
});

// ── Recommended first skill ───────────────────────────────────────────────────

describe("Agent Skills — Start Here recommended skill", () => {
  it("renders the recommended-skill step", () => {
    expect(screen.getByTestId("start-here-recommended-skill")).not.toBeNull();
  });

  it("names 'Process Intake & Scope' as the recommended first skill", () => {
    const card = screen.getByTestId("start-here-recommended-skill");
    expect(card.textContent).toContain("Process Intake");
  });

  it("includes a link to the skill specification", () => {
    const link = screen.getByTestId("start-here-skill-link");
    expect(link.getAttribute("href")).toContain("process-intake-and-scope");
  });
});

// ── Minimum context files ─────────────────────────────────────────────────────

describe("Agent Skills — Start Here context files", () => {
  it("renders the context-files step", () => {
    expect(screen.getByTestId("start-here-context-files")).not.toBeNull();
  });

  it("lists organization-profile.md", () => {
    const card = screen.getByTestId("start-here-context-files");
    expect(card.textContent).toContain("organization-profile.md");
  });

  it("lists process-taxonomy.md", () => {
    const card = screen.getByTestId("start-here-context-files");
    expect(card.textContent).toContain("process-taxonomy.md");
  });

  it("lists exactly two context files (no more, no less)", () => {
    const card = screen.getByTestId("start-here-context-files");
    // Count .md filename occurrences
    const matches = card.textContent!.match(/[\w-]+\.md/g) ?? [];
    expect(matches.length).toBe(2);
  });
});

// ── Expected first artifact ───────────────────────────────────────────────────

describe("Agent Skills — Start Here expected artifact", () => {
  it("renders the first-artifact step", () => {
    expect(screen.getByTestId("start-here-first-artifact")).not.toBeNull();
  });

  it("names PNS.md as the central handoff artifact", () => {
    const card = screen.getByTestId("start-here-first-artifact");
    expect(card.textContent).toContain("PNS.md");
  });

  it("shows the first agent prompt with a visible process-name placeholder", () => {
    const prompt = screen.getByTestId("starter-agent-prompt");
    expect(prompt.querySelector("pre code")?.textContent).toBe(
      "Scope the [process name] process using the Process Intake & Scope skill",
    );
  });

  it("copies the first agent prompt and confirms success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
      writable: true,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("button-copy-first-agent-prompt"));
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith(
      "Scope the [process name] process using the Process Intake & Scope skill",
    );
    expect(screen.getByTestId("button-copy-first-agent-prompt").textContent).toContain("Copied");
  });

  it("has a keyboard-focusable copy button with an accessible label", () => {
    const button = screen.getByTestId("button-copy-first-agent-prompt");
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("aria-label")).toBe("Copy first agent prompt to clipboard");
  });
});

// ── Starter pack download ─────────────────────────────────────────────────────

describe("Agent Skills — Start Here starter pack download", () => {
  it("renders the download section", () => {
    expect(screen.getByTestId("start-here-download")).not.toBeNull();
  });

  it("the starter pack download button is present", () => {
    const downloadArea = screen.getByTestId("start-here-download");
    const btn = downloadArea.querySelector("[data-testid='zip-download-btn']");
    expect(btn).not.toBeNull();
  });

  it("the starter pack filename is bp-skill-starter-pack.zip", () => {
    const downloadArea = screen.getByTestId("start-here-download");
    const btn = downloadArea.querySelector("[data-testid='zip-download-btn']");
    expect(btn!.getAttribute("data-filename")).toBe("bp-skill-starter-pack.zip");
  });

  it("download button label mentions 'Starter Pack'", () => {
    const downloadArea = screen.getByTestId("start-here-download");
    const btn = downloadArea.querySelector("[data-testid='zip-download-btn']");
    expect(btn!.textContent).toContain("Starter Pack");
  });
});

// ── Browse all skills CTA ─────────────────────────────────────────────────────

describe("Agent Skills — Start Here browse CTA", () => {
  it("renders the 'Browse all skills' CTA button", () => {
    expect(screen.getByTestId("start-here-browse-cta")).not.toBeNull();
  });

  it("CTA button text mentions 'Browse'", () => {
    const cta = screen.getByTestId("start-here-browse-cta");
    expect(cta.textContent!.toLowerCase()).toContain("browse");
  });
});
