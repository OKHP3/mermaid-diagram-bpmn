# BP-SKILL Version Checklist

This document is the authoritative definition of what constitutes a complete, releasable version of this project. It covers both the `bpmn-beta` DSL workstream and the BP-SKILL agent skill suite workstream. When the two disagree on version numbering, this file wins.

---

## How versions work

Version numbers follow `MAJOR.MINOR.PATCH`:

- **0.x** — pre-release development. No stability guarantee. Breaking changes between minor versions are expected.
- **1.0** — the first stable, contribution-ready release. Targets upstream Mermaid PR and BP-SKILL npm package.
- **PATCH** — bug fixes and non-breaking content corrections within a minor version.

A version is **complete** when every criterion in its checklist is checked. A version is **current** when it is the highest complete version. The current version is surfaced in the UI at `AgentSkills.tsx` line 120 and in the frontmatter of all SKILL.md files.

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
- [x] All tests passing (373/373 as of v0.1.0 tag; run: `pnpm --filter @workspace/mermaid-diagram-bpmn run test`)
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

- [ ] Package published to npm at `@okhp3/mermaid-diagram-bpmn`
  _Publish infrastructure ready: `.github/workflows/publish-npm.yml` triggers on GitHub Release. Requires `NPM_TOKEN` secret added to the repo. Run manually via workflow_dispatch (dry_run: false) or publish a GitHub Release._
- [ ] Works when loaded via `<script>` tag against Mermaid CDN build
  _(deferred from V0.6 — blocked on npm publish above)_
- [ ] At least 3 real-world process examples contributed (not purchase-approval)
- [x] Mermaid issue **#7699** engaged with prototype link — comment posted 2026-08-05: https://github.com/mermaid-js/mermaid/issues/7699#issuecomment-5196155299
- [x] Mermaid issues **#2623** and **#660** engaged with prototype link — comments posted 2026-08-05: https://github.com/mermaid-js/mermaid/issues/2623#issuecomment-5198000488 and https://github.com/mermaid-js/mermaid/issues/660#issuecomment-5198000626
- [ ] BP-SKILL suite listed in agentskills.io directory
- [ ] Comparison matrix published: bpmn-beta vs. PlantUML, bpmn.io, Visio, Mermaid flowchart
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
