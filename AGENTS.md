# Agent Guidelines: BPMN for Mermaid

This file is the operating constitution for any AI agent working in this repo.
Read it before touching any file. It applies equally to Replit Agent, Copilot,
Claude, and any other AI assistant.

Cross-reference `replit.md` for site-specific architecture, script inventory,
and current state.

- Work in small steps. Ask before large refactors.
- Prefer adding tests before changing logic if risk is medium or high.
- Keep changes localized. Avoid touching unrelated files.
- If you need config or secrets, stop and ask. Never invent credentials.
- Summarize what you changed and why at the end of every session.

> **AGENTS.md sync circuit** -- This file is one of five kept in lockstep.
> Any structural edit to Sections 1-8 must be propagated to the other four repos
> before the session closes. Section 9 (app-level governance) and Section 2.2.1
> (per-app inventory) are intentionally repo-specific and do not need to match
> line for line. When this file is silent or ambiguous on any governance matter,
> defer to the primary authority:
> <https://github.com/OKHP3/OverKill-Hill/blob/main/AGENTS.md>
>
> Static site repos:
> - **OverKill Hill P3:** <https://github.com/OKHP3/OverKill-Hill/blob/main/AGENTS.md>
> - **AskJamie:** <https://github.com/OKHP3/AskJamie/blob/main/AGENTS.md>
> - **Glee-fully Tools:** <https://github.com/OKHP3/Glee-fullyTools/blob/main/AGENTS.md>
>
> Web application repos:
> - **BPMN for Mermaid:** <https://github.com/OKHP3/mermaid-diagram-bpmn/blob/main/AGENTS.md>
> - **Mermaid Theme Builder:** <https://github.com/OKHP3/mermaid-theme-builder/blob/main/AGENTS.md>

---

## Repository Hygiene Standard

**Brand:** OverKill Hill P3 (Forge / Rust-orange) **Body scope class:** none -- this is the default brand; pages set no body class **Canonical stylesheet:** <https://raw.githubusercontent.com/OKHP3/OverKill-Hill/main/assets/css/theme.css> **Version:** 2.0

This section governs how files and folders are named, what structure this repo
uses, what counts as detritus, and the brand contract it serves. It exists
because AI agents, left alone, will name files inconsistently across sessions,
scatter working artifacts into the repo root, and leave paste-buffer transcripts
in `attached_assets/`. The rules below stop that.

---

### 0. Language Standard: en-US

This project is authored, owned, and maintained by a United States-based creator.
All user-facing content must use United States English (`en-US`).

**Scope:** UI copy, documentation, README content, release notes, comments intended
for human readers, prompts, tooltips, button text, error messages, validation
messages, QA/QC reports, marketing language, and any new code identifiers
authored in this repo.

**Examples of required US-EN spellings:** color, behavior, organization, optimize,
customize, center, analyze, modeling, artifact, visualization, standardization,
initialize, finalize, prioritize, summarize, license (noun), program, catalog,
fulfill, gray, toward, among, while.

**Protected exceptions (do NOT change spelling in):**

- Direct quotations from external sources
- Proper nouns, brand names, product names
- Dependency, package, or library names
- URLs, file names, route names
- API fields, schema keys, existing code identifiers
- Generated lockfiles or external standards

**Identifier rule:** en-US applies to identifiers authored in *new* code.
Renaming *existing* identifiers (variables, functions, types, exported symbols)
is a breaking change and falls under the same renaming policy as files in
Section 1: update every importer in the same commit, run the build and tests
after, and set up a redirect if anything external depends on the old name. Do
not run a blanket find-and-replace across existing identifiers without explicit
instruction.

**Status:** US English compliance is a required QA/QC gate, not a stylistic
preference. Any output failing this standard is a defect.

---

### 1. Naming conventions

#### 1.1 Default: lowercase with hyphens (kebab-case)

Every file and folder name defaults to lowercase letters and digits, with words
separated by single hyphens. Use this for documentation, configuration, assets,
data files, CSS, plain scripts, and folder names.

Examples that are correct:

- `bpmn-parser.ts`
- `dsl-spec.md`
- `release-checklist.md`
- `deploy-gh-pages.yml`
- `scripts/validate-skills.mjs`
- `skills/process-intake-and-scope/SKILL.md`

Examples that are wrong and must be renamed when discovered:

- `BpmnParser.ts` (PascalCase used for a plain module)
- `DslSpec.md` (PascalCase used for a doc)
- `validateSkills.mjs` (camelCase used for a script)
- `My Document.md` (spaces)

The convention does not change with file extension. A markdown doc, a YAML
workflow, and a plain TypeScript module all follow the same rule.

#### 1.2 The full convention by file role

The rule is "kebab-case by default" with three structural exceptions, all
dictated by ecosystem convention rather than preference. The table below is the
complete decision; deviations from it require an explicit reason.

| File role | Convention | Examples |
| ------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Documentation (`.md`) | kebab-case | `dsl-spec.md`, `release-checklist.md` |
| Stylesheets (`.css`) | kebab-case | `forge-tokens.css`, `index.css` |
| YAML, JSON, TOML data and config | kebab-case | `deploy-gh-pages.yml`, `palette-defaults.json` |
| Plain scripts (`.sh`, `.mjs`, `.py`) | kebab-case | `validate-skills.mjs`, `generate-skill-files.mjs` |
| Assets (SVG, PNG, WebP, etc.) | kebab-case | `favicon.svg`, `opengraph.jpg` |
| Folder names | kebab-case | `skills/process-intake-and-scope/`, `docs/`, `evals/` |
| Plain TypeScript modules (`.ts` not exporting a hook or component) | kebab-case | `bpmn-parser.ts`, `bpmn-renderer.tsx` (note: renderer exports a component -- use PascalCase only if it is a component) |
| React hooks (`.ts` exporting `useFoo`) | camelCase matching the hook | `useTheme.ts`, `useDebounce.ts` |
| React components (`.tsx`/`.jsx`) | PascalCase matching the component | `Playground.tsx`, `AgentSkills.tsx`, `SkillDetail.tsx` |
| Root governance files | ALL CAPS (ecosystem convention) | `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `AGENTS.md`, `SKILL.md` |
| Tool-required filenames | Whatever the tool requires | `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `.replit`, `.npmrc`, `.prettierrc`, `pnpm-workspace.yaml` |
| Web-standard files | Whatever the spec dictates | `robots.txt`, `sitemap.xml`, `favicon.svg`, `404.html` |

**Agent Skills skill names** follow the agentskills.io specification: lowercase
alphanumeric and hyphens only, no consecutive hyphens, no leading or trailing
hyphens, max 64 characters. The directory name must match the `name` field in
`SKILL.md` exactly. Do not prefix skill names with `okhp3-` or any other brand
prefix -- skill names should describe the capability, not the author.

#### 1.3 The "why" behind the three structural exceptions

The three non-kebab cases (PascalCase components, camelCase hooks, ALL CAPS
governance) are not aesthetic choices. They are ecosystem signals.

- PascalCase `.tsx` matches the React component it exports, so the filename and
  the JSX tag read the same: `import Playground from './Playground'; <Playground />`.
  Renaming it to kebab-case breaks tooling assumptions.
- camelCase hook files match the hook function name. The convention is universal
  in the React ecosystem.
- ALL CAPS root files (LICENSE, README, SKILL.md, etc.) trigger special rendering
  on GitHub and are recognized by virtually every tool that scans repos.

Everything else is kebab-case because it is the most readable choice in URLs,
shell history, and `ls` output.

#### 1.4 Code identifiers are separate from filenames

These rules govern filenames and folder names only. Identifiers inside code
follow their language conventions: TypeScript uses `camelCase` for variables
and `PascalCase` for types; CSS custom properties use `--kebab-case`. Do not
change identifiers when renaming files.

#### 1.5 Decision tree (when in doubt)

1. Is it a root governance file with a universally expected name (`README`,
   `LICENSE`, `CHANGELOG`, `SKILL.md`, etc.)? Keep the ALL CAPS conventional name.
2. Is it a tool-required filename (`package.json`, `tsconfig.json`, dotfile,
   etc.)? Use whatever the tool requires.
3. Is it a `.tsx`/`.jsx` exporting a React component? Use PascalCase matching
   the component.
4. Is it a `.ts` exporting a React hook (`useFoo`)? Use camelCase matching the
   hook.
5. Otherwise: kebab-case.

#### 1.6 Renaming policy

Renaming a file changes import paths and deployed URLs. When fixing a casing
violation:

- Update every importer in the same change.
- If the file is referenced by a deployed URL, add a redirect or keep a stub
  at the old path until traffic clears.
- Never rename without running the build and tests after.

---

### 2. Repository structural standard

This repo ships two deliverables from a single pnpm workspace:

1. **bpmn-beta + playground app** -- the `app/` workspace package
2. **BP-SKILL suite** -- the `skills/` directory and `scripts/` workspace package

The repo uses a workspace layout because it has two genuine workspace packages
(`app` and `scripts`) plus supporting directories for skills, context templates,
evaluation suites, and standards. This is not Replit scaffolding -- it reflects
the dual-deliverable nature of the project.

```
<repo-root>/
|-- AGENTS.md                 this file
|-- CHANGELOG.md
|-- CONTRIBUTING.md
|-- LICENSE
|-- README.md
|-- replit.md                 Replit-specific project notes
|-- skills-lock.json          Replit skill registry pins
|-- package.json              workspace root (orchestrator only; not an app)
|-- pnpm-workspace.yaml       packages: [app, scripts]
|-- pnpm-lock.yaml
|-- tsconfig.base.json        shared strict TypeScript defaults
|-- tsconfig.json             empty solution file for tsc --build
|-- .gitignore
|-- .npmrc
|-- .prettierrc
|-- .replit
|-- .replitignore
|-- .agents/                  Replit Agent working memory (committed; canonical)
|-- .github/
|   |-- workflows/
|   |   +-- deploy-gh-pages.yml   sole CI/CD workflow (build + GitHub Pages deploy)
|   |-- copilot-instructions.md
|   |-- dependabot.yml
|   +-- FUNDING.yml
|-- app/                      THE BPMN WEB APPLICATION (@workspace/mermaid-diagram-bpmn)
|   |-- .replit-artifact/
|   |   +-- artifact.toml     Replit platform registration (one file; not source code)
|   |-- src/                  React application source
|   |   |-- __tests__/        unit and parser tests (Vitest)
|   |   |   +-- __snapshots__/    generated snapshots
|   |   |-- components/       PascalCase React components
|   |   |-- data/             static data (kebab-case: skills-registry.ts, etc.)
|   |   |-- lib/              bpmn-beta parser, layout, renderer, detector, plugin
|   |   |-- pages/            PascalCase route components (10 routes)
|   |   |-- styles/
|   |   |   +-- forge-tokens.css  synced from upstream; do not hand-edit
|   |   |-- App.tsx
|   |   |-- index.css
|   |   +-- main.tsx
|   |-- docs/                 app-level design and deployment docs
|   |-- examples/             bpmn-beta .mmd authoring references
|   |-- public/               static assets (favicon, OG image, 404.html, etc.)
|   |-- standards/            DSL standard, parser safety checklist, spec reference
|   |-- index.html            Vite entry point
|   |-- package.json          @workspace/mermaid-diagram-bpmn
|   |-- tsconfig.json         extends ../../tsconfig.base.json
|   |-- vite.config.ts        base path injected via BASE_PATH env var
|   +-- vitest.config.ts
|-- skills/                   BP-SKILL SUITE (source of truth for all 15 skills)
|   |-- process-intake-and-scope/
|   |-- stakeholder-and-role-mapping/
|   |-- elicitation-and-interview-facilitation/
|   |-- as-is-process-capture/
|   |-- process-gap-and-exception-analysis/
|   |-- future-state-and-change-strategy/
|   |-- process-narrative-authoring/
|   |-- decision-model-authoring/
|   |-- visual-process-modeling/
|   |-- process-validation-and-quality-scoring/
|   |-- process-measures-and-controls-definition/
|   |-- sop-and-work-instruction-generation/
|   |-- raci-and-governance-matrix-generation/
|   |-- sipoc-generation/
|   |-- publication-and-handoff-packaging/
|   +-- __tests__/
|       +-- pipeline.integration.test.mjs   21-stage end-to-end pipeline test
|-- scripts/                  BUILD AND VALIDATION SCRIPTS (@workspace/scripts)
|   |-- src/
|   |   +-- parse-yaml-minimal.mjs    YAML parser utility; imported by 3 root scripts
|   |-- generate-skill-files.mjs      copies skills/ to app/public/skills/
|   |-- validate-skills.mjs           validates all 15 v0.3 skill SKILL.md files
|   |-- package-skills.mjs            bundles all 15 skills into a downloadable zip
|   |-- run-eval-suite.mjs            runs all 5 eval suites
|   |-- validate-dmn-traceability.mjs
|   |-- check-pns-status-transition.mjs
|   |-- extract-pns-transitions.mjs   generates app/src/data/pns-transitions-auto.ts
|   |-- extract-skill-deps.mjs        generates app/src/data/skill-deps-auto.ts
|   |-- init-process-artifact.mjs
|   |-- package-skills.mjs
|   |-- post-merge.sh                 pnpm install after Replit task agent merge
|   |-- push-notion-diagram.mjs       dev-only; requires NOTION_TOKEN secret
|   |-- check-scope-firewall.mjs
|   |-- package.json                  @workspace/scripts
|   +-- tsconfig.json                 extends ../tsconfig.base.json
|-- context/                  VARIABLE LAYER TEMPLATES (source of truth)
|   |-- business-glossary-and-rulebook.md
|   |-- compliance-controls-registry.md
|   |-- integration-registry.md
|   |-- notation-preferences.md
|   |-- organization-profile.md
|   |-- process-taxonomy.md
|   |-- regional-context.md
|   |-- role-dictionary.md
|   +-- sector-context.md
|-- docs/                     PROJECT-LEVEL DOCUMENTATION
|   |-- adoption-blockers.md
|   |-- agent-skills-install.md
|   |-- bp-skill-contributing.md
|   |-- bp-skill-overview.md
|   |-- pns-schema.md
|   |-- skill-readiness-audit.md
|   |-- strategy.md
|   |-- variable-layer-guide.md
|   |-- version-checklist.md
|   +-- archive/
|       +-- 2025-05-25-phase1-audit.md
|-- evals/                    EVALUATION SUITES (5 suites; read by run-eval-suite.mjs)
|   |-- bpmn-traceability/
|   |-- control-coverage/
|   |-- discovery-quality/
|   |-- narrative-completeness/
|   +-- role-consistency/
+-- standards/                REPO-LEVEL STANDARDS POINTER
    +-- README.md             points to app/standards/ for DSL and parser standards
```

#### 2.1 The `app/` workspace package

The web application lives in `app/`. Its `package.json` is named
`@workspace/mermaid-diagram-bpmn`. The `app/` directory was previously named
`artifacts/mermaid-diagram-bpmn/` -- all historical references to that path
are superseded.

`app/.replit-artifact/artifact.toml` is a required Replit platform registration
file. It contains no source code. Do not delete it.

Build output: `app/dist/public/` (set in `app/vite.config.ts` build.outDir).
Always gitignored. Never commit.

Base path: `/mermaid-diagram-bpmn/` in CI and production (injected via
`BASE_PATH` env var). Defaults to `/` in local dev. The config throws if
`BASE_PATH` or `PORT` is missing in CI.

GitHub Pages deployment: `workflows/deploy-gh-pages.yml`. Uploads from
`app/dist/public`. Deploys to `https://okhp3.github.io/mermaid-diagram-bpmn/`.

#### 2.2 The `scripts/` workspace package

The scripts package (`@workspace/scripts`) contains the build backbone for the
BP-SKILL suite. It is not a web application. Its scripts are run by pnpm
commands at the workspace root or called by the CI workflow.

`scripts/src/parse-yaml-minimal.mjs` is the shared YAML parser utility imported
by `validate-dmn-traceability.mjs`, `run-eval-suite.mjs`, and
`check-pns-status-transition.mjs`. Do not move or rename this file without
updating all three importers.

#### 2.3 The `skills/` directory

The `skills/` directory contains the 15 v0.3 BP-SKILL packages. It is not a
pnpm workspace package -- pnpm does not manage it. Skills are plain directories
containing `SKILL.md` files conforming to the agentskills.io specification.

Skill naming rules (from the agentskills.io spec):
- Lowercase alphanumeric and hyphens only
- No consecutive hyphens, no leading or trailing hyphens
- Max 64 characters
- Directory name must match the `name` field in `SKILL.md` exactly
- No brand prefixes (no `okhp3-`, no `bpmn-`, no `bp-`)
- Names describe the capability: `process-intake-and-scope`, not `okhp3-pir`

The `skills/__tests__/` directory contains `pipeline.integration.test.mjs`,
which runs the full 21-stage end-to-end pipeline integration test. This file
is not a skill -- it is a test runner. It must not be placed inside a skill
directory.

#### 2.4 Folders that must not exist at the repo root

Reserved for detritus: `_unused/`, `attached_assets/`, `attached-assets/`,
`_drafts/`, `_scratch/`, `_old/`, `tmp/`, `temp/`, `unused/`, `build/`,
`.next/`, `.vite/`.

Additionally, these directories must not exist because they are either detritus
or have been superseded:

- `artifacts/` -- the app formerly lived here; now lives in `app/`. If
  `artifacts/` still exists after migration, it must be deleted entirely.
- Any skill directory prefixed with `okhp3-` -- these are deprecated v0.2 skill
  packages. All three (`okhp3-process-narrative/`, `okhp3-process-discovery/`,
  `okhp3-bpmn-for-mermaid/`) have been removed. If any survive, delete them.
- `attached_assets/` -- Replit paste-buffer detritus. Already gitignored but
  was committed in early sessions; if still tracked, untrack and delete.

#### 2.2.1 Per-app directory inventory

Current state as of post-migration (target state for this document).

| Directory | Contents | Notes |
| -------------------------------- | ----------------------------------------- | --------------------------------------------- |
| `app/src/` | Full React application source | All app code |
| `app/src/__tests__/` | Parser and unit tests (Vitest) | Snapshots in `__snapshots__/` are regenerable |
| `app/src/lib/` | bpmn-beta parser, layout, renderer, detector, plugin | Core DSL implementation |
| `app/src/data/` | skills-registry.ts, pns-transitions-auto.ts, skill-deps-auto.ts, etc. | Some files are generated (see Section 9.5) |
| `app/src/pages/` | 10 route components | Home, Playground, DslReference, Architecture, Roadmap, AgentSkills, SkillDetail, About, SkillsWalkthrough, walkthrough examples |
| `app/src/components/` | React UI components | All PascalCase .tsx |
| `app/docs/` | App-level design docs | architecture.md, dsl-spec.md, design-system.md, etc. |
| `app/examples/` | bpmn-beta .mmd reference files | Imported via ?raw in bpmn-examples.ts; also contains migrated bpmn-beta canonical examples |
| `app/public/` | Static assets + generated skill files | public/skills/ and public/context/ are generated; do not hand-edit |
| `app/standards/` | DSL standard, parser safety, spec reference | bpmn-beta-standard.md, bpmn-spec-reference.md, parser-safety-checklist.md |
| `skills/` | 15 v0.3 BP-SKILL packages | Each is an agentskills.io-compliant skill directory |
| `skills/__tests__/` | pipeline.integration.test.mjs | 21-stage end-to-end test |
| `scripts/` | Build and validation scripts | @workspace/scripts package |
| `scripts/src/` | parse-yaml-minimal.mjs | Shared YAML parser; imported by 3 scripts |
| `context/` | 9 variable layer template .md files | Source of truth; copied to app/public/context/ by skill:generate |
| `docs/` | Project-level documentation | bp-skill-overview.md, pns-schema.md, strategy.md, etc. |
| `evals/` | 5 evaluation suites | Read by scripts/run-eval-suite.mjs |

---

### 3. Detritus (what does not belong in version control)

#### 3.1 Replit working-buffer artifacts

- **`attached_assets/`**: paste-buffer transcripts and screenshots. Always
  gitignore. Delete from history if accidentally committed.
- **`_unused/`**: code Replit moved out of the way. Read once, then delete.
- **`attached-assets/`** (hyphen variant) and **`unused/`**: same rules.

#### 3.2 Test and build output

- **`test-results/`**, **`playwright-report/`**, **`coverage/`**: always gitignored.
- **`app/dist/`**, **`build/`**, **`.next/`**, **`.vite/`**: build output. Gitignore.
- **`node_modules/`**: already gitignored by default; verify.
- **`app/src/__tests__/__snapshots__/`**: generated snapshots. Commit them as
  baselines and update with `pnpm test -- --update-snapshots` after intentional
  output changes. Do not manually edit snapshot files.

#### 3.3 IDE and OS junk

- **`.DS_Store`**, **`Thumbs.db`**, **`.idea/`**, **`.vscode/`** (team-specific
  settings): gitignore unless the project deliberately ships a workspace config.

#### 3.4 Stale planning artifacts

- **`_replit/`**: triage before deleting. Move anything worth keeping into
  `docs/` or `docs/archive/`, delete the rest.

#### 3.5 Duplicated content from sibling repos

If a skill, asset, or folder from another OKHP3 repo appears here and is not
owned by this project, remove it.

#### 3.6 Pre-deploy preview directories

Pre-deploy previews of sibling apps are dead weight once the live URL is
deployed. Delete them.

#### 3.7 Superseded directories

- **`artifacts/`**: the app formerly lived here. If this directory still exists
  after migration, delete it entirely. The app now lives in `app/`.
- **`okhp3-*` skill directories**: all deprecated. If any survive in `skills/`,
  delete them.

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
app/dist/
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

If a folder in this list is currently tracked, untrack it
(`git rm -r --cached <folder>`) before committing the `.gitignore` change.

---

### 5. Decrapify command (reusable instruction)

When the repo accumulates working artifacts, paste this message to Replit Agent:

> **Decrapify this repo per the Repository Hygiene Standard in `AGENTS.md`
> Section 5.** Triage, do not just delete. Produce a plan first, then execute
> on confirmation. Cover: `attached_assets/` and any hyphen variant, `_unused/`,
> `test-results/`, `playwright-report/`, `coverage/`, `app/dist/`, `build/`,
> `_replit/` (triage contents into `docs/` or `docs/archive/` before deleting),
> any duplicated sibling-repo content, any file or folder violating Section 1,
> any folder listed as forbidden in Section 2.4 or Section 3.7. Do NOT delete
> `app/.replit-artifact/artifact.toml` -- that is a required Replit platform
> file. Ensure `.gitignore` covers everything in Section 4 and
> `git rm -r --cached` anything that became newly-ignored. Output a plain-text
> plan with: each item, category (gitignore-only, delete, triage-then-delete,
> rename), justification, and risk. Wait for "go" before executing.
> No em dashes in the plan.

---

### 6. Brand contract (OverKill Hill P3 Forge)

This repo serves the OverKill Hill P3 Forge motif.
Canonical reference: <https://raw.githubusercontent.com/OKHP3/OverKill-Hill/main/assets/css/theme.css>

Forge motif declared values:

| Aspect | Value |
| --------------------- | ---------------------------------------------------------- |
| Body scope class | none -- this is the default brand; pages set no body class |
| Display font | Alfa Slab One |
| Body font | DM Sans |
| Mono font | JetBrains Mono |
| Primary accent | rust-orange `#c46a2c` |
| Secondary accent | amber `#e6a03c` |
| Header surface | teal `#1c3a34` |
| Light page background | `#f0ebe5` (warm paper) |
| Light ink | `#0f172a` (deep navy) |
| Dark mode | espresso/slate-blue family (hue ~224) |
| Base radius | `0.75rem` |
| Mermaid line/border | `#c46a2c` |
| Tone | precise, editorial, forge-mode |

**Forbidden in this brand's design system:**

- Coral `#d94f63` (that is Glee-fully)
- Aqua/teal `#2d6f7e` as a primary accent (that is AskJamie)
- Fredoka or Baloo 2 headings (those are Glee-fully and AskJamie)
- Any font outside Alfa Slab One / DM Sans / JetBrains Mono
- Olive hue family in dark mode
- Builders FirstSource (BFS) references, color systems, or examples of any kind

The forge design tokens live in `app/src/styles/forge-tokens.css`. Do not
hand-edit this file -- it is synced from upstream via the CI workflow
`sync-forge-tokens.yml` (if present) or manually from
`OKHP3/OverKill-Hill/main/assets/css/forge-tokens.css`.

---

### 7. Universal guardrails

These apply in every session, regardless of task:

- No em dashes anywhere (code, comments, copy, commit messages). Use periods
  or restructure the sentence.
- No AI filler in copy or comments: not "seamlessly," "robust," "powerful,"
  "effortlessly," "elevate," "unleash."
- Tailwind v4 only: no `tailwind.config.js` (tokens live in CSS via
  `@theme inline`).
- No new dependencies unless explicitly requested.
- All user-facing content must use US English per the Language Standard in
  Section 0. UK and Commonwealth spellings are defects, not stylistic variants.
- ROY principle: understanding produced / explanation invested. Verbosity must
  earn its space. Never pad a response to seem thorough.
- AutoCAD version for any AutoCAD-adjacent work is R10. This is locked; do not
  suggest upgrading or substitute a different version.

---

### 8. US English audit command (reusable instruction)

When the repo accumulates UK or Commonwealth spellings, paste this message to
Replit Agent:

> **Run the US English audit per the Language Standard in `AGENTS.md` Section
> 0.** Produce a QA summary first; execute corrections only after I say "go."
> Cover: UI copy, docs, README, release notes, human-readable comments,
> prompts, tooltips, error and validation messages, and QA/QC reports. Apply
> protected exceptions in Section 0. For existing code identifiers with UK
> spellings, list them as renaming candidates but do not auto-rename without
> confirmation. Output: (1) files scanned, (2) files to change, (3) UK spellings
> found with location, (4) US-EN replacements proposed, (5) protected exceptions
> intentionally left unchanged with reason, (6) identifier renaming candidates
> flagged for separate handling, (7) final confirmation the report itself
> contains no UK spellings. Wait for "go." No em dashes.

---

### 9. App-level governance

#### 9.1 Project identity and brand firewall

**BPMN for Mermaid** is a personal OverKill Hill P3 project by Jamie Hill.
It is not affiliated with Builders FirstSource, BFS, Mermaid, Mermaid Chart,
Mermaid.ai, the OMG, or any third-party brand.

This repository must never contain:

- BFS, Builders FirstSource, or any employer or workplace references
- Content derived from BABOK, BPM CBOK, or APQC -- these are copyrighted
  standards bodies and their content must not be embedded, paraphrased, or
  reproduced anywhere in this repo
- Any brand other than OverKill Hill P3 ecosystem properties

**Approved brand properties:**

- OverKill Hill / OverKill Hill P3 (overkillhill.com)
- AskJamie (askjamie.bot)
- Glee-fully (glee-fully.tools)

**Notion anchor:** <https://app.notion.com/p/357812e0ced481c88b20d2eb493dc775>

**Related repos in the OKHP3 ecosystem (not in AGENTS.md sync circuit):**

- [mermaid-theme-builder](https://github.com/OKHP3/mermaid-theme-builder)
- [first-diagram-is-a-liar](https://github.com/OKHP3/first-diagram-is-a-liar)

**Local working-copy paths (for reference; not checked in):**

- Windows: `C:\Users\jamie\OKH-Local\04_GitHub_Mirrors\mermaid-diagram-bpmn`
- Mac: `/Volumes/OKH-Local/04_GitHub_Mirrors/mermaid-diagram-bpmn`

#### 9.2 Architecture constraints

**bpmn-beta playground app** -- never add:

- Backend server (fully static, client-side only)
- User login, authentication, or user accounts
- AI API calls or LLM inference within the app
- Payment processing or cloud storage
- BPMN XML import or export (this is a DSL, not an XML processor)
- bpmn-js runtime dependency (SVG rendering is hand-written)
- Unpinned CDN dependencies in production

**BP-SKILL suite** -- never add:

- Skills that embed or reproduce BABOK, BPM CBOK, or APQC copyrighted content
- Skills prefixed with `okhp3-` or any other brand prefix
- Skills that require network access unless clearly documented in the
  `compatibility` frontmatter field
- Skill names that do not conform to the agentskills.io naming specification

#### 9.3 Core workflows

**bpmn-beta rendering pipeline** -- preserve at all times:

```
bpmn-beta DSL text -> bpmn-parser.ts -> BpmnDb -> bpmn-layout.ts ->
BpmnLayout -> bpmn-renderer.tsx -> SVG output
```

**bpmn-beta Mermaid integration** -- preserve at all times:

```
bpmn-detector.ts identifies 'BPMNDiagram' keyword ->
bpmn-plugin.ts registers parser + renderer via registerExternalDiagrams() ->
Mermaid host renders output
```

**BP-SKILL pipeline** -- preserve at all times:

```
skills/<skill-name>/SKILL.md (source of truth) ->
scripts/generate-skill-files.mjs ->
app/public/skills/<skill-name>/SKILL.md (generated; do not hand-edit) +
app/public/context/*.md (generated from context/ source)
```

Any change that breaks any of these three workflows is a defect.

#### 9.4 DSL and parser governance

The bpmn-beta DSL syntax source of truth is the parser in
`app/src/lib/bpmn-parser.ts`. The formal spec is in `app/standards/bpmn-beta-standard.md`.

**Correct bpmn-beta syntax examples:**

```
task:user t1 "Review Request"
task:service t2 "Send Notification"
gateway:exclusive g1 "Approved?"
start s1
end e1
flow t1 -> g1
```

**Never use** `task("Label")@{ type: "userTask" }` -- that is not bpmn-beta
syntax. It is Mermaid flowchart syntax with metadata attributes.

Every bpmn-beta rendered element must satisfy both:

1. Mermaid rendering -- output renders via `registerExternalDiagrams()` in all
   Mermaid-compatible hosts.
2. BPMN 2.0.2 notation -- shapes, markers, and flow lines match the OMG BPMN
   2.0.2 Descriptive Conformance Sub-Class (Section 2.1).

A failure on either side is a failed document. Neither requirement takes priority.

Parser safety rules are documented in `app/standards/parser-safety-checklist.md`.
Read this before modifying `bpmn-parser.ts`.

#### 9.5 App-specific conventions

**Generated files -- do not hand-edit:**

- `app/public/skills/` -- generated by `scripts/generate-skill-files.mjs`
- `app/public/context/` -- same
- `app/src/data/pns-transitions-auto.ts` -- generated by `scripts/extract-pns-transitions.mjs`
- `app/src/data/skill-deps-auto.ts` -- generated by `scripts/extract-skill-deps.mjs`
- `app/src/data/skills-registry.ts` -- hand-authored; this IS the canonical
  source of truth for all 15 skills in the UI. Update it when adding or
  modifying skills.

After editing `skills/` or `context/`, always run:

```
pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate
```

**Validation before commit:**

All new and modified skills must pass:

```
pnpm run skill:validate
pnpm run skill:test
```

Run from the workspace root. Both must exit 0.

**Styling tokens:** All new React components in `app/src/` must use existing
Tailwind utility classes and CSS custom properties from `forge-tokens.css`.
Existing class names to reuse: `forge-card`, `forge-btn-primary`,
`forge-btn-secondary`. Do not introduce ad-hoc color or spacing values.

**Skill agentskills.io compliance:** All SKILL.md files must conform to the
agentskills.io specification. Required frontmatter fields: `name`, `description`.
Optional: `license`, `compatibility`, `metadata`, `allowed-tools`. The `name`
field must match the containing directory name exactly.

**parse-yaml-minimal.mjs:** This utility lives at `scripts/src/parse-yaml-minimal.mjs`.
It is imported by three scripts. Do not move or rename it without updating all
three importers: `scripts/validate-dmn-traceability.mjs`,
`scripts/run-eval-suite.mjs`, `scripts/check-pns-status-transition.mjs`.

#### 9.6 Build commands

```
pnpm install                                                   Install dependencies
pnpm --filter @workspace/mermaid-diagram-bpmn run dev          Start dev server (PORT and BASE_PATH required or defaults used)
pnpm build                                                     Build all packages
pnpm run typecheck                                             Typecheck all packages
pnpm --filter @workspace/mermaid-diagram-bpmn run test         Run unit tests
pnpm run skill:validate                                        Validate all skill SKILL.md files
pnpm run skill:test                                            Run skill pipeline integration tests
pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate  Generate public/skills/ and public/context/
```

#### 9.7 GitHub Pages deployment

```
Base URL:     https://okhp3.github.io/mermaid-diagram-bpmn/
Workflow:     .github/workflows/deploy-gh-pages.yml
Branch:       gh-pages
Build output: app/dist/public/
Vite base:    /mermaid-diagram-bpmn/ (injected via BASE_PATH env var in CI)
```

The deploy workflow:
1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate`
3. `pnpm --filter @workspace/mermaid-diagram-bpmn run build` with `BASE_PATH=/mermaid-diagram-bpmn/`
4. Uploads `app/dist/public` to GitHub Pages

#### 9.8 Scope constraints

Keep this project:

- MIT licensed (code) / CC-BY-4.0 (docs)
- Free of employer, BFS, or Builders FirstSource content
- Free of BABOK, BPM CBOK, or APQC copyrighted content
- Scoped to the public OKHP3 bpmn-beta and BP-SKILL work only
- Client-side only for the web app (no backend server)
- No BPMN XML import or export

#### 9.9 Deprecated files and directories

The following no longer exist after migration and must not be recreated:

- `artifacts/` -- superseded by `app/`
- `artifacts/api-server/` -- unused Express server; deleted
- `artifacts/mockup-sandbox/` -- unused Replit Canvas tool; deleted
- `skills/okhp3-process-narrative/` -- deprecated v0.2 skill; deleted; `parse-yaml-minimal.mjs` migrated to `scripts/src/`
- `skills/okhp3-process-discovery/` -- deprecated v0.2 skill; deleted
- `skills/okhp3-bpmn-for-mermaid/` -- deprecated v0.2 skill; deleted; .mmd examples migrated to `app/examples/`
- `skills/okhp3-mermaid-theme-builder/` -- wrong-repo sibling content; deleted
