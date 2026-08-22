# BP-SKILL Version Checklist

This document is the authoritative definition of what constitutes a complete, releasable version of this project. It covers both the `bpmn-beta` DSL workstream and the BP-SKILL agent skill suite workstream. When the two disagree on version numbering, this file wins.

**Current evidence baseline:** 2026-08-22 — [Maturity Evidence Baseline](maturity-evidence-baseline-2026-08-22.md). This record distinguishes supported, provisional, disputed, and blocked claims; passing a version checklist does not establish external adoption.

**Authority scope.** This file supersedes all per-PRD release-state claims. The PRD lineage is:
PRD-03 (audit directive, archived) → PRD-04 (plugin convergence, archived) → PRD-05 (Phase A executed; Phases B–E remain as forward guidance) → **PRD-06 (product convergence, current active cycle)**.
When `app/docs/roadmap.md`, `app/src/pages/About.tsx`, `README.md`, or any PRD states that a version is complete, planned, or current, this file is the ground truth. Update this file first; everything else is a derived view.

---

## How versions work

Version numbers follow `MAJOR.MINOR.PATCH`:

- **0.x** — pre-release development. No stability guarantee. Breaking changes between minor versions are expected.
- **1.0** — the first stable, contribution-ready release. Targets upstream Mermaid PR and BP-SKILL npm package.
- **PATCH** — bug fixes and non-breaking content corrections within a minor version.

A version is **complete** when every criterion in its checklist is checked.
A version is **`[CURRENT]`** when it is the lowest in-progress version — the active focus of development.
Versions may be completed out of sequence when independent workstreams converge on different timelines: for example, V0.6 (Mermaid plugin packaging) was completed 2026-08-04 before V0.4 (Content and interactivity) because the plugin path was on the critical upstream engagement track. V0.4 therefore remains `[CURRENT]` (lowest incomplete) while V0.6 is `[DONE]`.

> **Note on `bp_skill_version` and UI labels.** The "BP-SKILL v0.3" label shown in `AgentSkills.tsx` and in each `SKILL.md` frontmatter (`bp_skill_version: "0.3.0"`) is the independently released BP-SKILL *suite* version — it records the published state of the skill files, not the overall project checklist status. These are separate tracks: the suite shipped its v0.3 release (V0.3 `[DONE]`) and will bump to `bp_skill_version: "0.4.0"` when V0.4 criteria are met. Do not conflate `bp_skill_version` with the checklist `[CURRENT]` label.

---

## Version history and completion criteria

### V0.1 — bpmn-beta prototype `[DONE]`

The minimal slice proving the DSL, parser, and renderer concepts.

- [x] Hand-written line parser with stack-based pool/lane block parsing
- [x] `BpmnDb` class with typed add/get API (nodes, flows, pools, lanes)
- [x] `BpmnRenderer` — SVG renderer in React with `bpmn-*` CSS classes
- [x] `getStyles()` — theme-aware CSS injected into SVG `<defs>`
- [x] `layoutGraph()` — flat layout + pool/lane-aware layout modes
- [x] Playground page — live two-panel editor with real SVG rendering
- [x] DSL Reference page — syntax tables for all node types, flow operators, directives
- [x] Architecture page — module workstream map
- [x] 5 canonical `.mmd` example fixtures (including pools/lanes)
- [x] Detector (`detect()` + `DETECTOR_KEY = 'BPMNDiagram'`)
- [x] Vitest unit tests — detector, DB, parser
- [x] Corpus integration tests for all 5 fixtures

---

### V0.2 — BP-SKILL pilot (4 skills) `[DONE]`

The proof-of-concept agent skill layer before the full pipeline was designed.

- [x] 4 `okhp3-*` skills scaffolded with full SKILL.md content
  - `okhp3-process-discovery`
  - `okhp3-process-narrative`
  - `okhp3-bpmn-for-mermaid`
  - `okhp3-mermaid-theme-builder`
- [x] `context/` variable layer — 9 context template files with YAML frontmatter
- [x] GitHub repository scaffolded (`OKHP3/mermaid-diagram-bpmn`)
- [x] Basic README covering both workstreams

---

### V0.3 — BP-SKILL suite — 15-skill pipeline scaffolded `[DONE]`

The full lifecycle pipeline designed, documented, and surfaced in the app.

- [x] 15-skill pipeline designed and documented (`skills/*/SKILL.md`)
- [x] `skills-registry.ts` — canonical data layer with all 15 skills, pipeline layers, PNS schema
- [x] Agent Skills browser page (`/skills`) — standard section, pipeline diagram, skill browser, variable layer, PNS schema viewer
- [x] Walkthrough page (`/walkthrough`) — end-to-end 15-skill guide
- [x] `SkillDetail` page (`/skills/:skillId`) — full skill spec with download
- [x] Single-skill and full-suite ZIP download buttons
- [x] PNS.md lifecycle tracker + 13-section schema viewer in UI
- [x] Documentation rewrite: README.md, AGENTS.md, docs/bp-skill-overview.md, docs/agent-skills-install.md, docs/pns-schema.md, docs/variable-layer-guide.md, docs/bp-skill-contributing.md, docs/adoption-blockers.md
- [x] GitHub Pages deployment workflow (BASE_PATH + dist/public path)
- [x] `bp_skill_version: "0.3.0"` in all 15 source SKILL.md files
- [x] okhp3-* skills marked deprecated in frontmatter
- [x] This version checklist published at `docs/version-checklist.md`
- [x] All tests passing (717/717 across 36 test files; run: `pnpm --filter @workspace/mermaid-diagram-bpmn run test`)
- [x] `pnpm run typecheck` passes clean

**Tag:** `v0.1.0` — 2026-08-04. All V0.3 criteria are met. This tag is the V0.3 baseline commit.

---

### V0.4 — Content and interactivity `[CURRENT]`

Make the suite genuinely usable and the UI interactive.

- [ ] Interactive pipeline diagram — click any skill to navigate to its detail page
- [ ] PNS.md lifecycle advancement shown in Walkthrough table (which skill advances which state)
- [ ] Purchase-approval worked example tracing all 15 skills end-to-end
- [ ] Skill dependency flow diagram surfaced on the Architecture page
- [ ] `bp_skill_version: "0.4.0"` bumped across all 15 source files
- [ ] All tests passing

---

### V0.5 — Validation tooling `[PLANNED]`

Machine-checkable quality gates for the skill suite.

- [ ] `skill:validate` CLI — conformance checks for SKILL.md frontmatter and required sections
- [ ] `validate-pns.mjs` — schema-enforced PNS completeness check
- [ ] Eval suite with pass/fail fixtures for all 15 skills (runs via `pnpm eval:run`)
- [ ] Completeness scoring scripts present and documented for all 15 skill output types
- [ ] All existing tests still passing

---

### V0.6 — Mermaid plugin packaging `[DONE]`

Wire the prototype to Mermaid's external diagram API.
Completed 2026-08-04 via PRD-04. See `docs/mermaid-compatibility.md` for the full evidence record.

- [x] `registerExternalDiagrams()` integration — detector, parser, DB accessor, renderer all registered
  _(verified: `bpmn-plugin-integration.test.ts` — 16 assertions against real `mermaid@11.4.1`; runs in merge-blocking CI gate)_
- [x] Theme variable binding — `getStyles()` reads live Mermaid theme vars at render time
  _(verified: `bpmn-plugin-integration.test.ts` — "FR-018: live theme-variable binding" describe block)_
- [x] Plugin entry point (`@okhp3/mermaid-diagram-bpmn`) exported from package
  _(verified: `lib/bpmn-plugin/package.json` `exports` map; `scripts/run-plugin-smoke.mjs` — 12/12 smoke assertions on clean install)_
- [x] Demo page shows live Mermaid-rendered `bpmn-beta` output
  _(verified: `/mermaid-host-demo` route in public app; `mermaid-host-demo.test.tsx` component tests)_

**Deferred from V0.6** (requires npm publish and CDN distribution; tracked in V0.9):
- Works when loaded via `<script>` tag against Mermaid CDN build

---

### V0.7 — Langium parser `[PLANNED]`

Replace the hand-written parser with a formal grammar.

- [ ] Langium grammar file covers all bpmn-beta syntax (nodes, flows, pools, lanes, directives)
- [ ] Error recovery — invalid lines produce a diagnostic, not a crash
- [ ] Parser snapshot tests covering all 5 canonical fixtures
- [ ] Visual regression tests for SVG renderer output
- [ ] Parity branch established before replacing prototype parser
- [ ] LSP support (hover, completion, diagnostics in VS Code)

---

### V0.8 — Quality gates `[PLANNED]`

Hardening before community exposure.

- [ ] Full BPMN 2.0.2 Descriptive Conformance Sub-Class element matrix published
- [ ] Accessibility audit — WCAG 2.1 AA on all rendered SVG output
- [x] Bundle size baseline documented (< 50 kB gzip target) — plugin: **19.63 kB / 5.68 kB gzip** (ESM); 16.42 kB / 5.20 kB gzip (CJS); verified 2026-08-05 via `pnpm --filter @okhp3/mermaid-diagram-bpmn run build`
- [ ] Dependency audit — no critical CVEs, license compatibility verified
- [ ] LLM benchmark prompts — identical prompts tested across ChatGPT, Claude, Gemini for bpmn-beta generation accuracy
- [x] CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md added to repo root
  _(CONTRIBUTING.md and SECURITY.md were present; CODE_OF_CONDUCT.md added 2026-08-05 — Contributor Covenant 2.1)_
- [x] Shared shape library extracted — geometry constants, `escapeXml`, `truncateLabel`, `taskMarkerSvg`, `gatewayMarkerSvg` live in `bpmn-shapes.ts`; both plugin and renderer import from it (TD-003, TD-012 resolved 2026-08-05)
- [x] SVG renderer snapshot tests — 5 corpus fixtures snapshotted via `BpmnRenderer`; any shape/class/geometry change now fails CI (TD-005 resolved 2026-08-05)
- [x] Layout regression tests — 20 assertions on flat and pool/lane layouts; node positions formula-verified (TD-006 resolved 2026-08-05)
- [x] Typed `ParseError` class with `line`, `column`, `code` fields; all 5 parser throw sites updated; re-exported from `bpmn-parser.ts` (TD-010 resolved 2026-08-05)

---

### V0.9 — Community and upstream prep `[PLANNED]`

Prepare for external contribution and Mermaid engagement.

- [x] Package published to npm at `@okhp3/mermaid-diagram-bpmn`
  _Published 2026-08-06: `@okhp3/mermaid-diagram-bpmn@0.1.1` — exports map (ESM + CJS + types), `files` allowlist, `sideEffects: false`. Smoke test (12/12) CI-gated in `publish-npm.yml`. Confirmed live: `npm view @okhp3/mermaid-diagram-bpmn` returns `0.1.1`._
- [ ] Works when loaded via `<script>` tag against Mermaid CDN build
  _(deferred from V0.6 — npm package publication is complete, but CDN/live-editor behavior remains unverified as of 2026-08-22)_
- [ ] At least 3 real-world process examples contributed (not purchase-approval)
- [x] Mermaid issue **#7699** engaged with prototype link — comment posted 2026-08-05: https://github.com/mermaid-js/mermaid/issues/7699#issuecomment-5196155299
- [x] Repeatable DFKI #7699 source check — `pnpm run check:dfki-7699` compares the live issue state, updated timestamp, labels, and a deterministic fingerprint of all author-authored fenced examples against `docs/dfki-7699-source-baseline.json`; drift fails with review/update instructions. The check cannot prove that the cited paper has no DOI or preprint. Baseline reviewed 2026-08-22.
- [x] Mermaid issues **#2623** and **#660** engaged with prototype link — comments posted 2026-08-05: https://github.com/mermaid-js/mermaid/issues/2623#issuecomment-5198000488 and https://github.com/mermaid-js/mermaid/issues/660#issuecomment-5198000626
- [x] Reply state confirmed via GitHub API — checked 2026-08-07 and re-checked 2026-08-21: no maintainer replies to any OKHP3 comment on #7699, #2623, or #660 at either check date. Key intelligence: (1) #7699 was formally approved by @pbrolin47/COLLABORATOR per a 2026-06-12 comment on #2623; (2) competitor @derari has posted a working prototype and signalled PR intent (2026-07-31) but has not yet opened a Mermaid PR as of 2026-08-21; (3) recommended action is to wait until @derari's PR materialises before deciding on a second comment. Full analysis in `app/docs/competitive-landscape.md` Phase D sections. Next re-check target: 2026-10-05 (60 days from outreach), or earlier if @derari opens a PR.
- [ ] BP-SKILL suite listed in public Agent Skills registries (agentskills.io is the spec site, not a searchable directory)
- [x] Comparison matrix published: bpmn-beta vs. DFKI #7699, PlantUML, Mermaid flowchart — live at `/comparison` (2026-08-05)
- [~] Wider distribution push sequenced — 2026-08-07: LinkedIn and HN Show HN post drafts complete; npm prerequisite confirmed live (`@okhp3/mermaid-diagram-bpmn@0.1.1`). Channel selected: LinkedIn first, then HN Show HN 24–48 h later. Full drafts and sequencing rules in `app/docs/competitive-landscape.md` Phase E section. Posting is a pending human action; update this entry with post URLs and response summary when published.
- [ ] Release notes drafted for v0.9 → v1.0

---

### V1.0 — Upstream Mermaid PR `[PLANNED]`

The first stable, contribution-ready release.

- [ ] Formal PR open at `mermaid-js/mermaid` proposing `bpmn-beta` as a core diagram type
- [ ] BP-SKILL v1.0 published as standalone npm package (`@okhp3/bp-skill`)
- [ ] DSL spec v1.0 frozen — no breaking syntax changes without a new major version
- [ ] Full plugin documentation written for Mermaid maintainers
- [ ] All v0.x completion criteria met

---

## Updating this file

When a criterion is met: change `[ ]` to `[x]`. When a version's last criterion is checked, update its status label from `[PLANNED]` to `[DONE]` and update the UI version string in:

1. `artifacts/mermaid-diagram-bpmn/src/pages/AgentSkills.tsx` — the `forge-eyebrow` paragraph in Section A
2. `scripts/generate-skill-files.mjs` — the `bp_skill_version` field in the generated frontmatter template
3. All 15 `skills/*/SKILL.md` source files — `bp_skill_version` in frontmatter (use `sed -i`)

If this file and `docs/strategy.md` disagree, this file wins for version criteria. Strategy and engagement notes live in `docs/strategy.md`.
