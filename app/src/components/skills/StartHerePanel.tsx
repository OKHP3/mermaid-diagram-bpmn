/**
 * StartHerePanel.tsx
 *
 * "Start Here" onboarding panel for the Agent Skills page (Task #207 / FR-05).
 *
 * Gives a first-time BP-SKILL adopter the minimum viable setup in one place:
 *   1. Recommended first skill — Process Intake & Scope (pipeline step 1)
 *   2. Two minimum context template files to pre-fill
 *   3. Expected first artifact — PNS.md (the central handoff document)
 *   4. Downloadable starter pack ZIP
 *
 * Includes an honest, visible statement that skills run in a compatible agent
 * environment — not in the browser.
 */

import { BookOpen, FileText, Package, ArrowRight } from "lucide-react";
import { ZipDownloadButton } from "./ZipDownloadButton";
import { trackEvent } from "@/lib/analytics";

interface StartHerePanelProps {
  /** Called when the user clicks "Browse all 15 skills". */
  onBrowseAll: () => void;
}

// ── Starter pack constants ────────────────────────────────────────────────────

const STARTER_SKILL_ID = "okhp3-process-intake-and-scope";
const STARTER_SKILL_NAME = "Process Intake & Scope";
const STARTER_CONTEXT_FILES = [
  {
    filename: "organization-profile.md",
    purpose: "Describe your organisation — name, sector, key roles, terminology",
  },
  {
    filename: "process-taxonomy.md",
    purpose: "Define your process hierarchy so skills name processes consistently",
  },
] as const;
const STARTER_PACK_FILENAME = "bp-skill-starter-pack.zip";

const STARTER_README = `# BP-SKILL Starter Pack — Process Intake & Scope

Built by OverKill Hill P³™ — overkillhill.com
Source: github.com/OKHP3/mermaid-diagram-bpmn
Licensed MIT (code) / CC-BY-4.0 (documentation)

## What is in this pack

  skills/okhp3-process-intake-and-scope/SKILL.md
    Skill 01 of 15 — the recommended entry point to the BP-SKILL pipeline.

  context/organization-profile.md
    Fill in your organisation's name, sector, roles, and terminology.

  context/process-taxonomy.md
    Define your process hierarchy so skills name processes consistently.

## Quick start

1. Copy SKILL.md to your agent platform's skills directory
   (e.g. ~/.claude/skills/ for Claude Code, .github/copilot/ for Copilot)

2. Fill in the two context files with your organisation's details.

3. Ask your agent:
   "Scope the [process name] process using the Process Intake & Scope skill"

4. The skill produces: pir.yaml + scope-statement.md

## Expected outcome

These outputs feed into the central handoff artifact — PNS.md — which
grows as you run more skills in the 15-step BP-SKILL pipeline.

## Next steps

Run all 15 skills in pipeline order. Visit the full catalog for details:
https://github.com/OKHP3/mermaid-diagram-bpmn

## Important

Skills run in a compatible agent environment (Claude Code, OpenAI Codex,
GitHub Copilot, Gemini CLI, Cursor, VS Code, etc.).
They are not executed by the website you downloaded this from.
`;

// ── Component ─────────────────────────────────────────────────────────────────

export function StartHerePanel({ onBrowseAll }: StartHerePanelProps) {
  const base = import.meta.env.BASE_URL;

  const starterEntries = [
    {
      path: `skills/${STARTER_SKILL_ID}/SKILL.md`,
      url: `${base}skills/${STARTER_SKILL_ID}/SKILL.md`,
    },
    ...STARTER_CONTEXT_FILES.map((f) => ({
      path: `context/${f.filename}`,
      url: `${base}context/${f.filename}`,
    })),
  ];

  return (
    <div data-testid="start-here-panel" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">

      {/* Agent environment notice — must be the first visible element */}
      <div
        data-testid="start-here-env-notice"
        className="flex items-start gap-3 px-4 py-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 mb-8 max-w-2xl"
        role="note"
        aria-label="Environment notice"
      >
        <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0 text-base">⚠</span>
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-semibold">Skills run in a compatible agent environment</span>{" "}
          (Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, Cursor, VS Code, etc.) —
          not in this browser. Download the files below and place them in your agent platform's
          skills directory.
        </p>
      </div>

      {/* Heading */}
      <p className="forge-eyebrow mb-3">Getting Started · Minimum Viable Setup</p>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
        Four things. Five minutes. First process documented.
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-10">
        You do not need all 15 skills to get value. Start with one skill, two context files,
        and a single conversation with your agent.
      </p>

      {/* 4-step card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

        {/* Step 1 — Recommended first skill */}
        <div
          className="forge-card flex flex-col gap-3"
          data-testid="start-here-recommended-skill"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">1</span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Recommended first skill</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{STARTER_SKILL_NAME}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Skill 01 of 15. Conducts structured process intake and scope definition using BABOK v3
              elicitation techniques. Produces <code className="font-mono text-[10px] bg-muted px-1 rounded">pir.yaml</code> and{" "}
              <code className="font-mono text-[10px] bg-muted px-1 rounded">scope-statement.md</code>.
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-auto pt-1">
            <BookOpen size={11} className="text-muted-foreground" />
            <a
              href={`/skills/${STARTER_SKILL_ID}`}
              className="text-xs text-primary hover:underline underline-offset-2"
              data-testid="start-here-skill-link"
            >
              View skill specification →
            </a>
          </div>
        </div>

        {/* Step 2 — Two context template files */}
        <div
          className="forge-card flex flex-col gap-3"
          data-testid="start-here-context-files"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">2</span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Minimum context files</p>
          </div>
          <div className="flex flex-col gap-2">
            {STARTER_CONTEXT_FILES.map((f) => (
              <div key={f.filename} className="flex items-start gap-2">
                <FileText size={11} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <code className="text-[11px] font-mono text-foreground">{f.filename}</code>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{f.purpose}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/70 italic mt-auto pt-1">
            Fill these in once. All 15 skills read them.
          </p>
        </div>

        {/* Step 3 — Expected first artifact */}
        <div
          className="forge-card flex flex-col gap-3"
          data-testid="start-here-first-artifact"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">3</span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Central handoff artifact</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              <code className="font-mono">PNS.md</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              The Process Narrative Specification. Every skill either reads or advances it — from{" "}
              <code className="font-mono text-[10px] bg-muted px-1 rounded">draft-intake</code> through to{" "}
              <code className="font-mono text-[10px] bg-muted px-1 rounded">published</code>.
              Your first run produces the intake and scope sections.
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/70 italic mt-auto pt-1">
            One document. 13 required sections. ISO 9001 / BABOK / IEEE 29148 aligned.
          </p>
        </div>

        {/* Step 4 — Starter pack download */}
        <div
          className="forge-card flex flex-col gap-3 border-primary/30 bg-primary/[0.03]"
          data-testid="start-here-download-card"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">4</span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Download starter pack</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Everything in one ZIP</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              <code className="font-mono text-[10px] bg-muted px-1 rounded">SKILL.md</code>{" "}
              +{" "}
              <code className="font-mono text-[10px] bg-muted px-1 rounded">organization-profile.md</code>{" "}
              +{" "}
              <code className="font-mono text-[10px] bg-muted px-1 rounded">process-taxonomy.md</code>{" "}
              + setup README.
            </p>
          </div>
          <div className="mt-auto pt-1" data-testid="start-here-download">
            <ZipDownloadButton
              entries={starterEntries}
              filename={STARTER_PACK_FILENAME}
              label="Download Starter Pack"
              variant="primary"
              readme={STARTER_README}
              onDownloaded={() => trackEvent('starter-pack-download')}
            />
          </div>
        </div>

      </div>

      {/* Divider + Next step CTA */}
      <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-foreground">Ready for more?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explore all 15 skills, the pipeline, variable layer, and PNS schema.
          </p>
        </div>
        <button
          onClick={onBrowseAll}
          className="forge-btn-outline inline-flex items-center gap-2 shrink-0"
          data-testid="start-here-browse-cta"
        >
          Browse all 15 skills <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
