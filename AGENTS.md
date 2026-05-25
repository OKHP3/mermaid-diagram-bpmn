# Agent Context — BPMN for Mermaid / BP-SKILL

## What this repository is

This repository contains three things:

1. bpmn-beta — a text-first DSL for BPMN process diagrams, targeting upstream Mermaid contribution.
2. A seven-page React/Vite playground app deployed to GitHub Pages.
3. BP-SKILL v0.3 — a 15-skill Business Process Agent Skill Suite in the agentskills.io format.

For artifact-specific deep-dive rules (module pipeline, DSL grammar, parser safety), see [`artifacts/mermaid-diagram-bpmn/AGENTS.md`](./artifacts/mermaid-diagram-bpmn/AGENTS.md).

---

## Repository structure

```
artifacts/mermaid-diagram-bpmn/src/   React application source (Vite, wouter, Tailwind CSS v4)
artifacts/mermaid-diagram-bpmn/src/lib/  bpmn-beta parser, layout, renderer, styles, detector
public/skills/                        Generated SKILL.md files — DO NOT edit by hand
public/context/                       Variable layer templates — DO NOT edit by hand
skills/                               BP-SKILL agent skill packages (source of truth)
context/                              Variable layer templates (source of truth)
evals/                                Eval fixtures and rubrics
docs/                                 Human-readable documentation
```

---

## Build commands

```
pnpm install                                                  Install dependencies
pnpm --filter @workspace/mermaid-diagram-bpmn run dev         Start development server
pnpm build                                                    Build all packages
pnpm run typecheck                                            Typecheck all packages
pnpm --filter @workspace/mermaid-diagram-bpmn run test        Run test suite
pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate   Generate public/skills/ from skills/ source
```

---

## Critical conventions

- bpmn-beta DSL syntax source of truth: the parser in `artifacts/mermaid-diagram-bpmn/src/lib/bpmn-parser.ts`
- Correct syntax: `task:user t1 "Review Request"`
- Never use: `task("Label")@{ type: "userTask" }` — that is not bpmn-beta syntax
- bpmn-beta is a prototype DSL, not native Mermaid core syntax
- Do not embed BABOK, BPM CBOK, or APQC copyrighted content anywhere
- Do not include BFS, Builders FirstSource, or employer content anywhere
- All new React components must match existing styling tokens exactly (forge-card, forge-btn-primary, etc.)
- All new skills must pass `pnpm --filter @workspace/mermaid-diagram-bpmn run skill:validate` before commit
- `public/skills/` and `public/context/` are generated — always run `pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate` after editing `skills/` or `context/`

---

## Key files

```
artifacts/mermaid-diagram-bpmn/src/data/skills-registry.ts   Canonical data source for all 15 skills
artifacts/mermaid-diagram-bpmn/src/pages/AgentSkills.tsx     Skills browser page
artifacts/mermaid-diagram-bpmn/src/pages/SkillDetail.tsx     Individual skill detail page
artifacts/mermaid-diagram-bpmn/scripts/generate-skill-files.mjs  Pre-build asset generator
skills/                                                       BP-SKILL SKILL.md source files
context/                                                      Variable layer template source files
docs/bp-skill-overview.md                                     BP-SKILL practitioner introduction
docs/pns-schema.md                                            PNS.md canonical schema reference
docs/variable-layer-guide.md                                  Variable layer configuration guide
docs/agent-skills-install.md                                  Platform-specific install instructions
```

---

## What the playground app does

```
/             Home
/playground   Live bpmn-beta parser and SVG renderer
/dsl          DSL reference tables
/architecture Architecture and design decisions
/roadmap      Development roadmap
/skills       BP-SKILL agent skills browser
/skills/:id   Individual skill detail page
/about        About the project
```

---

## GitHub Pages deployment

```
Base URL:     https://okhp3.github.io/mermaid-diagram-bpmn/
Branch:       gh-pages
Build output: dist/
Vite base:    /mermaid-diagram-bpmn/
```

---

## Scope constraints

This is an OverKill Hill P3 personal brand project. Keep it:

- MIT licensed (code) / CC-BY-4.0 (docs)
- Free of employer, BFS, or Builders FirstSource content
- Scoped to the public OKHP3 bpmn-beta and BP-SKILL work only
- No bpmn-js runtime dependency — SVG rendering is hand-written
- No backend server — all processing is client-side
- No BPMN XML import or export

---

## Dual-compliance requirement

Every bpmn-beta rendered element must satisfy both:

1. Mermaid rendering — output renders via `registerExternalDiagrams()` in all Mermaid-compatible hosts
2. BPMN 2.0.2 notation — shapes, markers, and flow lines match the OMG BPMN 2.0.2 Descriptive Conformance Sub-Class (Section 2.1)

A failure on either side is a failed document. Neither requirement takes priority.
