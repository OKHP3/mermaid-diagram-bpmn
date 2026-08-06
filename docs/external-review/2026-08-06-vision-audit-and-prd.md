# BPMN for Mermaid — Vision Audit, Gap Analysis, and Build PRD

Prepared as a second opinion for Jamie Hill / OverKill Hill P³. Evidence base: full read of `AGENTS.md`, `replit.md`, `README.md`, and every planning/retrospective/debt doc in `docs/` and `app/docs/` (17 files, ~375KB); a factual code inventory of `app/src` (routes, lib modules, data layer, test files, dependency grep); and a live walkthrough of the deployed app at `okhp3.github.io/mermaid-diagram-bpmn` (Home, Playground, Agent Skills). Repo: `OKHP3/mermaid-diagram-bpmn`, mirrored locally at `/Volumes/OKH-Local/04_GitHub_Mirrors/mermaid-diagram-bpmn`. Snapshot date: 2026-08-06, baseline docs dated through 2026-08-05.

One framing note before the audit: this was never "a custom SPA." Your own docs say so — `README.md` calls it three assets (a DSL, a playground app, a 15-skill agent suite), and `docs/bp-skill-overview.md` warns visitors "often assume bpmn-beta is the product. It is one output of one skill." The app is already built, and mostly intended, as a distribution hub for two linked products under one shell. That's the right read of your brief. The question isn't whether the vision matches "hub" — it does — it's whether the hub actually distributes anything yet.

---

## 1. Reconstructed Product Vision

**Core thesis.** Mermaid has no BPMN diagram type. Business process diagrams currently force a choice between heavyweight tools (Visio, Signavio, Camunda Modeler, bpmn.io) that don't live in Git, and Mermaid flowcharts that live in Git but are semantically too weak for BPMN (no real distinction between events, gateways, message flows, pools/lanes). `bpmn-beta` is a text-first, Git-native DSL closing that gap, shipped first as a Mermaid `registerExternalDiagrams()` plugin and later proposed for Mermaid core.

**Second product, same repo.** BP-SKILL is a 15-skill Agent Skills suite (Discovery → Narrative → Visual/Decision Modeling → Operational → Governance → Publication) packaging the business-process-consulting lifecycle as portable, standards-referenced (BABOK, BPM CBOK, APQC, BPMN 2.0.2, DMN, ISO 9001) SKILL.md files. `bpmn-beta` is explicitly "the visual output layer" of this broader methodology, not the other way around.

**The app's job.** The React/Vite SPA is the shared surface for both: live parser/renderer playground, DSL reference, architecture notes, decision log, worked examples that cross-link diagram nodes to individual skill pages, and a browsable/downloadable skill catalog. It's also positioned as one layer of a larger "OKHP³ Visual Language Stack" (ReFolDec theory → BPMN for Mermaid → Mermaid Theme Builder → OverKill Hill as public narrative surface), and is built to run inside an iframe on `overkillhill.com` with a locked, portable brand-token system ("OKH Forge") so it reads as the same workbench as its sibling apps.

**Audience.** Two named clusters: (a) enterprise architects, process analysts, developers, and AI prompt authors who'd use `bpmn-beta` directly; (b) business analysts, process consultants, and operations analysts who'd use BP-SKILL with an AI agent. A third, smaller audience is Mermaid's own maintainers and contributors — the upstream PR is a stated end goal, not a footnote.

**Definition of done, in your own words** (`docs/version-checklist.md`, V1.0): a live upstream PR at `mermaid-js/mermaid` proposing `bpmn-beta` as a core diagram type, BP-SKILL published as a standalone npm package, a frozen DSL spec, full plugin docs for Mermaid maintainers. Nothing short of that is "mission accomplished" by your own criteria — a working demo page is a milestone, not the finish line.

**Tone target.** "The Forge — Contributor Prototype." Honest-labeled, standards-literate, deliberately not overclaiming BPMN 2.0 conformance. Design intent per `app/docs/design-system.md`: "a workbench aesthetic," not a marketing site.

---

## 2. Current Application Assessment

What's actually live and working, verified directly (not just claimed in docs):

- **The app is real and deployed.** `okhp3.github.io/mermaid-diagram-bpmn` loads, is visually coherent, and the brand system holds up — dark forge palette, Alfa Slab One display type, honest status ribbon ("Prototype. DSL unstable · Not full BPMN 2.0 · No BPMN XML import/export · No bpmn-js runtime") right at the top of Home. That ribbon is doing real work: it's the single most credible thing on the site, because it tells the truth before you ask.
- **The playground actually parses and renders.** Loaded the "Gateway decision" example live: DSL source on the left, real SVG BPMN notation on the right (start event, user task, XOR gateway, service task, two end events), pan/zoom controls, example picker. This is not a mockup. It's a working pipeline: detector → parser → `BpmnDb` → layout → SVG.
- **The skill catalog works as a distribution surface.** `/skills` renders tabbed views (Standard, Pipeline, Skills, Variable Layer, PNS Schema), a 15/9/6 stat block, platform-compatibility badges (Claude Code, Codex, Copilot, Gemini CLI, Cursor, VS Code), a dependency-flow diagram, and functioning single-file and whole-suite ZIP downloads (via `fflate`, client-side).
- **14 routes, three-tier nav.** Home, Playground, Agent Skills, Reference (DSL Reference, Syntax Comparison, Architecture, Plugin Setup, Host Demo), More (Walkthrough, Roadmap, About), plus skill detail and two worked-example pages. 5,135 lines of page code. Nothing found is a stub — no TODO/FIXME/"coming soon"/Lorem ipsum anywhere in `app/src`. What reads as unfinished (deferred DSL keywords, "in-progress" architecture statuses) is explicitly and honestly labeled as such in the UI, not silently missing.
- **Engineering discipline is unusually strong for a solo project.** 23 test files (13 page/component, 9 core-lib, one integration test that runs real `mermaid@11.4.1` against corpus fixtures), a generated-file policy with `check:generated` CI gates, an ADR-style decision log (DEC-001 through DEC-021), a technical-debt register with severity tiers, and three internal audit documents (PRD-03, PRD-04, PRD-05) that caught, fixed, and re-verified a real scope-drift problem in the same week. Self-reported baseline as of 2026-08-04: 390/390 app tests, 196/196 skill tests, 235/235 skill validations, 14/14 eval fixtures, clean typecheck and build.
- **Static, no backend, by design.** Confirmed by grep: the only `fetch()` calls in the entire app are same-origin, fetching bundled SKILL.md/context files for download. No analytics SDK, no third-party API calls, no accounts. This matches the stated non-goals exactly.

What's *not* there yet, also verified:

- **No installable plugin.** `app/package.json` for the plugin package is still `"private": true` with no `exports` map and no `files` allowlist. The Mermaid integration is proven in a live-browser demo route (`/mermaid-host-demo`, confirmed real — it calls actual `mermaid.registerExternalDiagrams()`/`mermaid.render()`), but nothing is published to npm. `README.md`'s own install instructions (`npm install @okhp3/mermaid-diagram-bpmn`) point at a package that does not exist yet on the registry.
- **No semantic validation.** The parser catches structural errors (unclosed blocks, bad syntax) but not semantic ones — orphan nodes, unbalanced XOR/AND gateways, cross-pool flow violations all render silently without warning.
- **No automated cross-browser E2E.** The one browser-verified proof is a manual demo page; automated Playwright E2E is deferred (tracked as issue #185 in your own docs).
- **No accessibility testing, no per-node ARIA labels.** `accTitle`/`accDescr` exist at the diagram level; individual SVG node groups don't carry `aria-label`, and there's no automated a11y test (TD-011, TD-017, both self-flagged and still open).

---

## 3. Vision-to-Execution Gap Analysis

| Category | Item | Status |
|---|---|---|
| **Fully aligned** | Static, no-backend architecture | Matches stated non-goal exactly |
| | Live parser/renderer playground | Verified working end-to-end |
| | Skill catalog browse/download/zip | Verified working |
| | Brand/design-token consistency | Verified visually, holds across pages |
| | Worked examples linking diagram nodes → skill pages | This is the best evidence of "hub" behavior actually working — it's the one place the two products visibly cooperate |
| | Decision-log / ADR discipline | DEC-001–021, real and current |
| **Partially implemented** | Mermaid plugin integration | Proven live in-browser; not packaged, not published, not automated-tested |
| | Pool/lane/message-flow support | Explicitly labeled "experimental" |
| | Documentation self-consistency | Mostly reconciled (DEC-021 fixed one scheme conflict); residual drift remains (see below) |
| | Accessibility | Diagram-level only; node-level and automated testing both deferred |
| **Present but misaligned** | Hypothetical-competitor comparison (`SyntaxComparison.tsx` renders a "DFKI-7699-style" syntax that isn't the real competing proposal's actual code) | Risk: looks like a strawman on a public page, and your own `competitive-landscape.md` already flags overclaiming as a problem to fix |
| | "Distribution center" claim | Currently means client-side file download only — no registry, no versioning notice, no update path for anyone who already downloaded a skill zip |
| **Missing** | npm-published plugin package | Not done |
| | Langium grammar | Needed for the stated V1.0 upstream-PR goal; not started |
| | Semantic DSL validation | Not implemented — silent on orphan nodes, gateway cardinality, cross-pool flows |
| | Automated E2E / accessibility testing | Both deferred |
| | Any usage signal or feedback loop | Zero — no analytics, no way to know if anyone outside you has used this |
| **UX/UI gaps** | Pan/zoom not discoverable on first visit | Self-flagged (TD-016), still open |
| | Nav depth (3 tiers, 14 routes) for a site still branded "Prototype" | Not broken, but worth user-testing before adding a 15th–20th route |
| | Doc/UI claim drift (e.g. `release-checklist.md` still references a parser-error bug the debt register calls resolved) | Small but real — public claims should trace to one source of truth |
| **Technical concerns** | O(n²) parser stack lookup at nested pool/lane depth | Low severity, self-flagged (TD-015) |
| | Inline shape-geometry library | Flagged in retrospective as a maintainability smell as it grows |
| | `BpmnDb` public API not frozen | Blocks the V1.0 "frozen DSL spec" criterion |
| | Bus factor of one | Your own competitive doc's phrase, not mine — real for a solo project pursuing an upstream OSS contribution |
| **Strategy concerns** | Two products, one brand, ambiguous framing | Your own docs admit visitors assume `bpmn-beta` is the whole thing |
| | Competitive clock | DFKI's #7699 proposal targets the same Mermaid gap; your own doc shows zero maintainer engagement on your entry as of the last snapshot |
| | Hub depends on siblings you don't control from here | Mermaid Theme Builder, OverKill Hill routing — their maturity isn't verifiable from this repo, and the "coherent stack" experience is only as strong as the weakest sibling |
| **Risk if unchanged** | Recurrence of the exact drift PRD-03 caught once already: 130+ commits over 9 weeks with zero touches to the DSL engine, while breadth (skills browser, branding) grew | Nothing currently *prevents* a repeat — PRD-03/04/05 were a one-time correction, not a standing gate |

---

## 4. Critical Verdict

**Is it on track?** Yes, more than most personal projects at this stage — but "on track" here means "disciplined process, real prototype," not "delivers the hub promise today." An outside user cannot `npm install` this. They can read a very well-organized plan for how they eventually will. That's the single biggest distance between where you are and where the README already claims to be.

**Coherent product or a pile of parts?** Genuinely closer to coherent than most two-product-one-repo efforts get. The worked-examples-to-skills cross-linking is real evidence of intentional hub design, not just shared navigation chrome. Where it stops being coherent is framing: the project is named after one half of what it does, and your own internal docs already flagged that a first-time visitor mistakes the DSL for the whole product. You've diagnosed this correctly already — you just haven't fixed the IA to match the diagnosis.

**Scalable?** The engineering practices are — generated-file discipline, decision logs, severity-tiered debt tracking are all things that get harder to maintain as a project grows, and you've built them in early, which is the right sequencing. The information architecture is closer to its ceiling: 14 routes across a three-tier nav is already a lot for a site that still opens with "Prototype" in the header. Adding more content routes before fixing distribution would be adding rooms to a house with no front door.

**Strongest parts.** The playground (it's real, it works, it's the credible core). The skill catalog and its download mechanics. The brand system holding together across every page I checked. The self-correcting behavior — catching your own 9-week drift via PRD-03 and fixing it same-week is a genuinely strong signal, better than most teams manage.

**Weakest parts.** The gap between "the plugin works" (true, in a demo) and "the plugin is installable" (not true) is the one gap that matters most, because it's the one thing your own project name promises. Second: documentation governance — three PRDs in one day, each claiming not to formally supersede the others while functionally correcting them, is a pattern that will confuse a future contributor (or a future you) faster than it'll ever confuse an end user, because end users won't read the PRDs. Third: the DSL has no semantic validation, which matters more than it sounds like it should, because "silent wrong diagram" is a worse failure mode for a documentation tool than "loud error."

**What to preserve.** Static-only architecture. The brand contract. Generated-file discipline. The decision-log habit. The worked-examples cross-linking pattern — it's your best hub mechanic, do more of it, not less.

**What to rework.** Navigation IA — make the two-product duality explicit (a real fork in the road on Home, not an implicit thing buried in a "Reference" dropdown). Documentation governance — collapse to one live status document that everything else defers to, and literally archive PRD-03 instead of leaving three same-day documents in ambiguous relationship to each other.

**What to remove or simplify.** The hypothetical-competitor syntax comparison, unless you can cite the real DFKI proposal's actual syntax — right now it's a comparison against a strawman on a public page. Prune dependency bloat if it recurs (you already did this once per TD-001).

**What to prioritize next.** In order: (1) npm-publish the plugin — this is the single highest-leverage move, it's the last mile between "demo" and "real," and it's the thing your README already promises exists; (2) semantic DSL validation, because silent-wrong is worse than blocked; (3) automated E2E without the `securityLevel: "loose"` workaround; (4) Langium grammar and the actual upstream PR, sequenced against the DFKI competitive clock, not after it.

---

## 5. Recommended Product Direction

Stop treating this as one SPA with a lot of pages, and start treating it explicitly as **two linked products sharing one distribution shell**: bpmn-beta (the diagram engine and plugin) and BP-SKILL (the agent skill suite). That's already true underneath — make it true on the surface. A first-time visitor to Home should be offered a real choice, not a scroll through DSL syntax followed eventually by a mention of skills three navigation levels deep.

Close the installability gap before adding more breadth. Every hour spent on new skill content or new comparison pages right now is an hour not spent on the one thing that turns "prototype people can read about" into "tool people can use." You already wrote the rule that should govern this (PRD-03's own sequencing mandate); the recommendation here is to make that rule standing, not one-time.

Collapse documentation to one source of truth. `docs/version-checklist.md` is already declared authoritative over `roadmap.md` — extend that principle to the PRD lineage and the debt register. One current-state doc, everything else either generates from it or explicitly points to it.

Add a feedback loop. Right now there is no way to know if anyone besides you has used this. That doesn't require a backend or an account system — GitHub star/issue/download-count instrumentation is enough to start, and it's consistent with the static-only constraint.

---

## 6. Long-Form PRD — v0.2 → v1.0 Development Cycle

### 6.1 Product vision

BPMN for Mermaid is the process-structure and notation layer of the OKHP³ Visual Language Stack: a text-first, Git-native BPMN diagram type for Mermaid, distributed alongside a standards-conformant Agent Skills suite for business process consulting work, through a single self-contained web application that functions as documentation, live tool, and download hub for both.

### 6.2 Product goals (this cycle)

1. Make the plugin genuinely installable (npm-published, version-pinned, documented) — closes the credibility gap between claim and reality.
2. Make the DSL trustworthy, not just parseable — semantic validation surfaces bad models instead of silently rendering them.
3. Make the two-product structure legible on first visit — IA reflects the real shape of the offering.
4. Establish a single, load-bearing status document and retire the multi-PRD sprawl pattern.
5. Instrument minimal usage signal without violating the static/no-backend constraint.

### 6.3 Target users

- **Plugin adopters** — developers and technical writers who want BPMN-shaped diagrams in Mermaid-rendered Markdown (GitHub, Notion, docs sites). Success = `npm install`, register, render, done in under 10 minutes.
- **AI-agent-assisted BAs/consultants** — practitioners using Claude Code, Copilot, Cursor, etc. who want a standards-aligned skill suite for process documentation work. Success = install one skill, run it against a real process, get a usable PNS.md and diagram.
- **Mermaid maintainers/contributors** — the upstream-PR audience. Success = a frozen spec, a Langium grammar, and evidence (tests, docs, adoption) sufficient to justify a maintainer's review time.

### 6.4 Core use cases

1. Author a business process as `bpmn-beta` text and get a correct, readable SVG rendering, inside a Markdown-rendering host (GitHub/Notion) — not just inside this app's own playground.
2. Discover, preview, and install one or more BP-SKILL packages into an agent-compatible tool (Claude Code, Copilot, etc.) without leaving the browser.
3. Walk a worked example end to end — from a raw process description, through a relevant skill, to a rendered diagram — as a single guided path, not three separately-discovered pages.
4. As a Mermaid maintainer, evaluate the proposal's readiness against a stable spec and test evidence in one place.

### 6.5 Primary user journeys

- **Plugin adopter:** Home → sees the two-product fork → picks "Diagram plugin" → Playground (proves it works) → Plugin Setup (npm install) → own project, working diagram. Currently this journey dead-ends at Plugin Setup because the package isn't published — fixing that closes the loop.
- **BA/consultant:** Home → picks "Agent skills" → Agent Skills catalog → browses by pipeline layer → downloads one skill or the full suite → installs into their agent tool. Already works end-to-end today; the gap is discoverability from Home, not mechanics.
- **Cross-product:** Walkthrough page → clicks a diagram node → lands on the specific skill that produced it → downloads that skill. Already works and is the strongest existing hub mechanic — extend this pattern rather than replacing it.

### 6.6 Functional requirements

- **FR-1 (Plugin packaging).** `@okhp3/mermaid-diagram-bpmn` publishable via `npm publish`, with a real `exports` map, `files` allowlist, and a clean-install smoke test in CI. Acceptance: a fresh `npm install @okhp3/mermaid-diagram-bpmn mermaid` in an empty project, following only the README, renders a `bpmn-beta` diagram with zero manual workarounds.
- **FR-2 (Semantic validation).** Parser or a post-parse pass flags: orphan nodes (no incoming/outgoing flow), unbalanced XOR/AND split-join pairs, cross-pool sequence flows (should be message flows), and missing start/end events. Acceptance: each violation has a fixture test asserting a specific, human-readable error — not a silent render.
- **FR-3 (IA restructure).** Home presents an explicit two-product choice above the fold. Nav collapses from three tiers to two: primary product switcher (Diagram / Skills) plus a shared "About the project" area. Acceptance: a first-time visitor can state, after 10 seconds on Home, that this is two things, not one.
- **FR-4 (Automated E2E).** Playwright suite renders `bpmn-beta` via real `registerExternalDiagrams()` in a real headless browser with default (non-loose) `securityLevel`, covering the same corpus fixtures already used in the integration test. Acceptance: CI-gated, replaces the manual `/mermaid-host-demo` page as the source of truth (the page can stay as a live proof surface, but it stops being the *only* evidence).
- **FR-5 (Accessibility).** Per-node `aria-label` on SVG groups; automated a11y test (axe or equivalent) gated in CI. Acceptance: TD-011 and TD-017 both close.
- **FR-6 (Documentation consolidation).** One canonical status document (extend `docs/version-checklist.md`'s existing authority). `About.tsx`, `roadmap.md`, and README status claims either read from it or explicitly link to it instead of restating it. PRD-03 archived with a one-line pointer to PRD-05 as its resolution. Acceptance: no two documents in the repo make contradictory "is X done" claims as of any given commit.
- **FR-7 (Usage signal).** Lightweight, privacy-respecting instrumentation compatible with static hosting — GitHub API-sourced star/fork/clone counts surfaced on an internal or public metrics view, and/or download-count tracking on the ZIP endpoint via a static counter service. Acceptance: at least one number exists, refreshed automatically, that tells you whether anyone outside you used this in the last 30 days.
- **FR-8 (Competitive comparison accuracy).** `SyntaxComparison.tsx` either cites the real DFKI #7699 proposal's actual published syntax (with a source link) or is reframed to compare against Mermaid flowchart and PlantUML only, dropping the invented "DFKI-7699-style" column. Acceptance: no comparison content on a public page that isn't sourced.

### 6.7 Non-functional requirements

- Plugin bundle stays under the stated <200KB min+gzip budget (per existing `prd.md` NFR — verify against current build, this may already be at risk given growth from 373→403+ tests and associated code).
- Zero backend, zero accounts, zero PII collection — hard constraint, carried forward unchanged.
- `BpmnDb` public API frozen before any V1.0 claim is made (blocks the upstream-PR milestone by your own criteria).
- Theme integration must resolve to real hex values in the Mermaid SVG export path (already done per `buildMermaidTheme()` — keep test coverage on this as the theme system evolves).

### 6.8 Content requirements

- Every public status claim (roadmap items, "done" badges, support-matrix entries) must cite the specific test or commit that proves it, per your own PRD-03 §5 standard — extend this norm to the redesigned Home page copy, not just internal docs.
- Worked examples: at least one more pairing beyond Purchase Approval and Employee Offboarding, chosen to exercise message flows and multi-lane pools (currently "experimental" — a third worked example is also a good de-risking exercise for FR-2's validation work).

### 6.9 UX/UI requirements

- Pan/zoom affordance discoverable without scrolling documentation — a one-time inline hint or visible control label, closing TD-016.
- Parser/render error states always visibly surfaced in the Playground, never a blank canvas (verify TD-004's fix is reflected in `release-checklist.md` test text, currently stale).
- Two-tier nav max (see FR-3).

### 6.10 Navigation and information architecture (target state)

```
Home (product fork: Diagram Plugin | Agent Skills | About the Stack)
├── Diagram Plugin
│   ├── Playground
│   ├── DSL Reference
│   ├── Plugin Setup (npm install, now real)
│   ├── Architecture
│   └── Comparison (sourced, per FR-8)
├── Agent Skills
│   ├── Catalog (existing /skills, tabs preserved)
│   ├── Skill Detail (existing /skills/:id)
│   └── Walkthrough (existing worked examples, extended per 6.8)
└── About the Stack
    ├── Decisions (About.tsx content)
    ├── Roadmap (reads from canonical status doc)
    └── OKHP³ stack context
```

### 6.11 Technical architecture recommendations

- Extract the inline shape-geometry library (`bpmn-shapes.ts`) into a documented, independently-testable module before it grows further — the retrospective already flagged this as a maintainability smell; do it now while it's cheap.
- Replace the `[...contextStack].reverse().find()` O(n²) pattern in the parser (TD-015) with an indexed stack lookup before pool/lane nesting depth grows with the new worked example.
- Add a package boundary (`exports`, `files`, `sideEffects: false`) to `app/package.json`'s plugin build target as the concrete mechanism behind FR-1.
- Keep the generated-file discipline (`app/public/skills/`, `app/public/context/`, `-auto.ts` files) exactly as-is — it's working and shouldn't be touched as part of this cycle.

### 6.12 Data and state management

No change to the static, client-state-only model. Skill registry (`skills-registry.ts`) and capability registry (`capability-registry.ts`) remain the canonical in-repo data sources; continue generating derived files rather than hand-editing them.

### 6.13 Integration requirements

- npm registry (publish target, FR-1).
- GitHub API (read-only, for FR-7 usage signal — no auth token exposed client-side; if a token is needed server-side, that's a GitHub Actions job writing a static JSON file into the build, not a live backend call).
- Mermaid core repo (upstream PR target, out of scope for this cycle but FR-4/FR-6 are direct prerequisites).

### 6.14 Distribution workflows

- Plugin: `npm publish` from a tagged release, gated by the full CI suite including the new automated E2E (FR-4).
- Skills: existing ZIP/single-file download mechanics preserved; consider adding a version manifest so a previously-downloaded skill can be diffed against the current suite (addresses the "no update path" gap noted in §3, stretch goal for this cycle, not blocking).

### 6.15 Success criteria (this cycle)

- A person with no prior context can `npm install` the plugin and render a diagram in under 10 minutes, following only public docs.
- Zero contradictory "is X done" claims across the repo's documentation at any audited commit.
- At least one semantic validation error type has a passing fixture test.
- CI includes a real-browser, non-loose-security E2E run.
- A usage-signal number exists and is visibly surfaced somewhere in the repo or app.

### 6.16 MVP / V1 / future-phase split

- **MVP (this cycle, "v0.2 hardening"):** FR-1, FR-3, FR-6, FR-8. Get the plugin real and the IA legible. This is the minimum that turns "distribution center" from aspiration into fact.
- **V1 (next cycle):** FR-2, FR-4, FR-5. Trust and reliability layer — semantic validation, automated E2E, accessibility.
- **Future (post-V1, matches your existing V0.7–V1.0 ladder):** Langium grammar, frozen `BpmnDb` API, formal upstream Mermaid PR, FR-7 usage instrumentation maturing into a real adoption dashboard.

### 6.17 Acceptance criteria for major features (summary table)

| Feature | Acceptance test |
|---|---|
| Plugin npm publish (FR-1) | Fresh `npm install` + README-only steps render a diagram, zero manual workaround |
| Semantic validation (FR-2) | Each violation type has a named fixture test with a human-readable error string |
| IA restructure (FR-3) | Cold-start user survey: 10-second Home visit correctly identifies "two products" |
| Automated E2E (FR-4) | CI-gated Playwright run against real, non-loose `securityLevel`, same corpus as integration test |
| Accessibility (FR-5) | Automated a11y scan passes; every SVG node group has `aria-label` |
| Doc consolidation (FR-6) | Repo-wide grep for "done"/"complete"/"[PLANNED]" status claims traces to exactly one canonical source per item |
| Usage signal (FR-7) | A live, auto-refreshing number is visible somewhere, sourced without violating the no-backend constraint |
| Comparison accuracy (FR-8) | Every comparison syntax on `SyntaxComparison.tsx` has a citation or is removed |

---

## 7. Replit Build Directive

Written to be actionable directly in the Replit workspace. Sequence matters — this order exists specifically to avoid repeating the drift PRD-03 already caught once.

**Do not, until Phase 1 is green:**
- Add new SKILL.md content or new skills beyond the existing 15.
- Add new comparison pages, new marketing copy, or new brand-system polish.
- Restructure the skills browser UI.

This mirrors your own PRD-03 mandate — the recommendation is to keep enforcing it, not relax it now that the immediate crisis is resolved.

**Phase 1 — Make it real (FR-1, FR-8).**
1. Add `exports`, `files`, and `sideEffects: false` to the plugin package's `package.json`. Run a clean-install fixture test in CI (install into a scratch directory, import, render, assert SVG output).
2. `npm publish` the package under `@okhp3/mermaid-diagram-bpmn` at version matching the current `0.1.0` tag (or bump if publishing changes the contract).
3. Verify README's existing install instructions work verbatim against the published package. Fix any drift.
4. Fix or remove the hypothetical DFKI comparison column in `SyntaxComparison.tsx` — cite the real proposal or cut it.
5. Preserve everything else exactly as-is. This phase touches packaging and one content page only.

**Phase 2 — Make the structure legible (FR-3, FR-6).**
1. Redesign Home's above-the-fold section to present the two-product fork explicitly (Diagram Plugin / Agent Skills), before the current project-thesis copy block.
2. Collapse nav from three tiers to two per §6.10. Preserve every existing route — this is a re-grouping, not a deletion.
3. Extend `docs/version-checklist.md`'s existing "authoritative when documents disagree" status to cover the PRD lineage explicitly. Add an archive header to PRD-03 pointing at PRD-05 as its resolution.
4. Sweep `About.tsx`, `roadmap.md`, and README for any status claim not sourced from the canonical doc; fix or link.

**Phase 3 — Make it trustworthy (FR-2, FR-4, FR-5).**
1. Add semantic-validation pass: orphan-node check, gateway cardinality check, cross-pool flow check, missing start/end check. One fixture test per check.
2. Stand up Playwright E2E against the existing corpus fixtures, real browser, default `securityLevel`. Gate in CI alongside existing typecheck/test/skill:validate steps.
3. Add per-node `aria-label` generation in `bpmn-renderer.tsx` and `bpmn-plugin.ts`. Add an automated a11y scan (axe-core or equivalent) as a CI gate.
4. Close TD-011, TD-015, TD-016, TD-017 as part of this phase — they're small, already diagnosed, and this is the natural place to clear them.

**Phase 4 — Instrument and extend (FR-7, stretch items).**
1. Add a GitHub Actions job that writes a static JSON of star/fork/download counts into the build at deploy time; surface it somewhere in the app (a small "Project Signal" widget on Home or About is enough — doesn't need to be a dashboard).
2. Author the third worked example (message flows + multi-lane pool) to de-risk the "experimental" label ahead of any future work on that feature.
3. Only after Phases 1–3 are green: resume Langium grammar work and the actual upstream Mermaid PR groundwork, sequenced against the #7699 competitive timeline, not after it.

**What to preserve untouched throughout:** static/no-backend architecture, brand token system, generated-file pipeline (`skill:generate`, `check:generated`), the decision-log habit, the worked-examples-to-skills cross-linking pattern, and the existing test suite's structure.

---

## 8. Prioritized Implementation Roadmap

1. Package and publish the plugin to npm (FR-1) — highest leverage, closes the single biggest claim-vs-reality gap.
2. Fix the sourced-vs-hypothetical comparison page (FR-8) — cheap, fast, removes a credibility risk on a public page.
3. Redesign Home for the two-product fork and collapse nav to two tiers (FR-3) — makes the existing hub mechanics discoverable instead of implicit.
4. Consolidate documentation to one canonical status source and archive PRD-03 formally (FR-6) — prevents the drift pattern from recurring.
5. Add semantic DSL validation (FR-2) — turns "silently wrong" into "loudly wrong," which matters more for a documentation tool than raw feature breadth.
6. Stand up automated, non-loose-security E2E in CI (FR-4) — replaces a manual proof with a repeatable one.
7. Close the accessibility gap: per-node ARIA labels plus automated a11y testing (FR-5).
8. Add minimal usage instrumentation (FR-7) — you can't tell if any of the above mattered without this.
9. Third worked example exercising message flows and multi-lane pools — de-risks "experimental" ahead of broader adoption.
10. Resume Langium grammar and upstream Mermaid PR groundwork — sequence against the #7699 competitive window, not after it.

Steps 1–4 are the MVP for this cycle. Steps 5–7 are the trust layer that should follow immediately, not eventually. Steps 8–10 are what turns a good prototype into a project other people can find, verify, and adopt.
