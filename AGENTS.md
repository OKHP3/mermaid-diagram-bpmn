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

---

## Repository Hygiene Standard (OverKill Hill P3)

**Scope:** Every OverKill Hill P3 Replit-created repo (parent site, companion apps, future siblings).
**Status:** Canonical. Paste this section into every `AGENTS.md` under a heading of `## Repository Hygiene Standard`. Do not edit downstream copies. Edit here and re-sync.
**Version:** 1.0

This section governs how files and folders are named, what structure all sibling repos share, and what counts as detritus that must not accumulate. It exists because Replit Agent, left alone, will name files inconsistently across sessions, scatter working artifacts into the repo root, and leave paste-buffer transcripts in `attached_assets/`. A reader two months later cannot tell what is real, what is stale, and what was junk from the start. The rules below stop that.

---

### 1. Naming conventions

#### 1.1 Default: lowercase with hyphens (kebab-case)

Every file and folder name defaults to lowercase letters and digits, with words separated by single hyphens. Use this for documentation, configuration, assets, data files, CSS, plain scripts, and folder names.

Examples that are correct:
- `forge-tokens.css`
- `design-system.md`
- `brand-conformance-checklist.md`
- `sync-forge-tokens.yml`
- `assets/img/forge-anvil-sigil.svg`
- `docs/release-plan.md`
- `scripts/sync-skills.sh`

Examples that are wrong and must be renamed when discovered:
- `Forge_Tokens.css` (mixed case, underscore)
- `designSystem.md` (camelCase)
- `BrandConformanceChecklist.md` (PascalCase used for a doc)
- `OverKillHillBrandTokens.css` (PascalCase used for a stylesheet)
- `My Document.md` (spaces)

#### 1.2 The full convention by file role

| File role | Convention | Examples |
|---|---|---|
| Documentation (`.md`) | kebab-case | `design-system.md`, `release-plan.md` |
| Stylesheets (`.css`) | kebab-case | `forge-tokens.css`, `index.css` |
| YAML, JSON, TOML data and config | kebab-case | `sync-forge-tokens.yml`, `palette-defaults.json` |
| Plain scripts (`.sh`, `.py`) | kebab-case | `sync-skills.sh`, `build-tokens.py` |
| Assets (SVG, PNG, etc.) | kebab-case | `forge-anvil-sigil.svg` |
| Folder names | kebab-case | `src/styles/`, `docs/roadmap/`, `skills/agent-skills/` |
| Plain TypeScript modules (`.ts` that don't export a hook or component) | kebab-case | `bpmn-styles.ts`, `theme-mode.ts`, `palettes.ts` |
| React hooks (`.ts` exporting `useFoo`) | camelCase matching the hook | `useTheme.ts`, `useDebounce.ts` |
| React components (`.tsx`/`.jsx`) | PascalCase matching the component | `ApplyTab.tsx`, `DiffView.tsx`, `BuilderNote.tsx` |
| Root governance files | ALL CAPS (ecosystem convention) | `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `AGENTS.md`, `SKILL.md` |
| Tool-required filenames | Whatever the tool requires | `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `.gitignore`, `.replit`, `.npmrc`, `.prettierrc`, `Dockerfile`, `Makefile`, `CNAME` |
| Web-standard files | Whatever the spec dictates | `humans.txt`, `robots.txt`, `llms.txt`, `404.html`, `_headers`, `favicon.ico`, `manifest.webmanifest` |

#### 1.3 Decision tree (when in doubt)

1. Is it a root governance file with a universally expected name (`README`, `LICENSE`, `CHANGELOG`, etc.)? Keep the ALL CAPS conventional name.
2. Is it a tool-required filename (`package.json`, `tsconfig.json`, dotfile, etc.)? Use whatever the tool requires.
3. Is it a `.tsx`/`.jsx` exporting a React component? Use PascalCase matching the component.
4. Is it a `.ts` exporting a React hook (`useFoo`)? Use camelCase matching the hook.
5. Otherwise: kebab-case.

#### 1.4 Renaming policy

Renaming a file changes import paths and breaks builds. When fixing a casing violation:
- Update every importer in the same change.
- If the file is referenced by URL on a deployed site, add a redirect or keep a stub at the old path until traffic clears.
- Never rename without running the build and the test suite after.

---

### 2. Sibling repo structural standard

Every OverKill Hill P3 companion app (TypeScript/Vite/React/Tailwind v4) shares this top-level structure:

```
<repo-root>/
├── .agents/                  Replit Agent working memory (committed; canonical)
│   └── skills/               agent skills consumed by this app
├── .github/                  GitHub Actions, issue templates
├── .gitignore
├── .npmrc
├── .prettierrc
├── .replit
├── .replitignore
├── AGENTS.md                 governance for AI agents working in this repo
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── docs/                     human-readable design and process docs
│   ├── design-system.md      canonical brand spec (synced from upstream)
│   ├── conformance-audit.md  brand audit evidence
│   ├── release-plan.md       active release plan
│   └── roadmap/              ahead-of-current planning
├── public/                   static assets served as-is
├── scripts/                  build, sync, and maintenance scripts
├── skills/                   SKILL.md packages this app owns or ships
│   └── <skill-name>/         one folder per skill
├── src/                      application source (the app lives here)
│   ├── components/           PascalCase React components
│   ├── data/                 static data (lowercase-hyphen filenames)
│   ├── hooks/                React hooks
│   ├── lib/                  pure logic, palette tables, theme engines
│   ├── pages/                top-level route components
│   ├── styles/               CSS, including forge-tokens.css
│   └── __tests__/            unit tests (Vitest)
├── e2e/                      end-to-end tests (Playwright)
├── examples/                 reference diagrams or demo inputs
├── standards/                process standards this app applies
├── index.html                Vite entrypoint
├── package.json
├── playwright.config.ts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml       if and only if monorepo
├── tsconfig.base.json
├── tsconfig.json
└── vite.config.ts
```

#### 2.1 Flat layout vs `artifacts/` monorepo

Two valid layouts exist in the current siblings: a flat layout (`src/` at repo root) and a monorepo layout (`artifacts/<app-name>/src/`). The flat layout is the default for single-app repos. Use `artifacts/` only when the repo legitimately ships more than one app or sandbox. Do not put a single app under `artifacts/` for no reason.

#### 2.2 Folders that must not exist at the repo root

These names are reserved for detritus and must not be used as legitimate folders:
`_unused/`, `attached_assets/`, `attached-assets/`, `_drafts/`, `_scratch/`, `_old/`, `tmp/`, `temp/`, `unused/`

---

### 3. Detritus (what does not belong in version control)

#### 3.1 Replit working-buffer artifacts

- **`attached_assets/`** — paste-buffer transcripts and screenshots from Replit Agent prompts. Always gitignore. Delete from history if accidentally committed.
- **`_unused/`** — code moved out of the way during a refactor. Read it once to make sure nothing important is stranded, then delete the folder.
- **`attached-assets/`** (hyphen variant) and **`unused/`** — same rules.

#### 3.2 Test and build output

- **`test-results/`**, **`playwright-report/`**, **`coverage/`** — always gitignored.
- **`dist/`**, **`build/`**, **`.next/`**, **`.vite/`** — build output. Gitignore.
- **`node_modules/`** — already gitignored by default; verify.

#### 3.3 IDE and OS junk

- **`.DS_Store`**, **`Thumbs.db`**, **`.idea/`**, **`.vscode/`** (with team-specific settings) — gitignore unless the project deliberately ships a workspace config.

#### 3.4 Stale planning artifacts

- **`_replit/`** — old Replit working notes. Triage before deleting: move anything worth keeping into `docs/`, archive the rest into `docs/archive/<date>-<topic>.md`, delete the rest.

#### 3.5 Duplicated content from sibling repos

When Replit Agent copies a skill or asset from another repo, it sometimes lands in the wrong repo. If the skill is not owned or shipped by this app, remove it.

---

### 4. Required `.gitignore` entries

```
# Replit working-buffer artifacts
attached_assets/
attached-assets/
_unused/
unused/

# Test and build output
test-results/
playwright-report/
coverage/
dist/
build/
.next/
.vite/

# IDE / OS
.DS_Store
Thumbs.db
.idea/

# Node
node_modules/
*.log
```

If a folder in this list is currently tracked, untrack it (`git rm -r --cached <folder>`) before committing the `.gitignore` change so it actually disappears from the index.

---

### 5. Decrapify command (the reusable instruction)

When the repo accumulates the artifacts above, run the following short command as a chat message to Replit Agent:

> **Decrapify this repo per the Repository Hygiene Standard in `AGENTS.md` Section 5.** Triage, do not just delete. Produce a plan first, then execute on confirmation. Cover: `attached_assets/` and any hyphen variant, `_unused/`, `test-results/`, `playwright-report/`, `coverage/`, `dist/`, `build/`, `_replit/` (triage contents into `docs/` or `docs/archive/` before deleting), any duplicated sibling-repo content, any file or folder violating the naming rules in Section 1, and any folder name listed as forbidden in Section 2.2. Ensure `.gitignore` covers everything in Section 4 and `git rm -r --cached` anything that became newly-ignored. Output a plain-text plan with: each item, category (gitignore-only, delete, triage-then-delete, rename), justification, and risk. Wait for my "go" before executing.

---

### 6. Why this is committed into the repo

Governance documents committed to the repository are available to every contributor and AI agent working in the repo without network access or authentication. An AI agent starting a new session can read this file and apply the same hygiene rules without being told. A human contributor can open `AGENTS.md` and understand what the agent is and is not allowed to do. Both get the same source of truth.
