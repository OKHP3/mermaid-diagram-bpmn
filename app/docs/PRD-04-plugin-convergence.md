# PRD-04 — Plugin Convergence: Mermaid External Diagram Integration

> **Document type:** Retrospective. This is a factual record of what was built and verified,
> not a planning document. All claims are backed by named test files or observable artefacts.
>
> **Status:** Complete — all five phases merged to `main` 2026-08-04.
> **Evidence summary:** See `docs/mermaid-compatibility.md` for the full evidence-tier table
> and `docs/capability-ledger.md` for the pre-phase-0 baseline.

---

## Background

An independent audit (PRD-03, 2026-08-04) found that the plugin adapter
(`bpmn-plugin.ts`) had never been exercised against a live `mermaid.render()` call —
130+ commits had gone into the BP-SKILL suite while the core integration promise remained
theoretical. PRD-03 mandated a hard-sequenced convergence plan: prove the integration first,
stop all peripheral work until the plugin is externally consumable.

PRD-04 was the execution plan for that mandate. It ran as five sequential phases. All five
were merged before end-of-day 2026-08-04.

---

## Pre-phase baseline (Phase 0)

**Ref:** Task #178 — "Phase 0: baseline verification"

Before any repairs, a clean `pnpm install` was run and every O1 command was executed to
establish a ground-truth starting point.

| O1 Command | Result at baseline |
|---|---|
| `pnpm run typecheck` | PASS |
| `pnpm --filter @workspace/mermaid-diagram-bpmn run test` | PASS — 390/390 |
| `pnpm run skill:validate` | PASS — 235/235 |
| `pnpm run eval:run` | PASS — 14/14 |
| `pnpm run check:generated` | PASS |
| `pnpm run build` | PASS |

**Key findings at baseline:**
- Plugin source adapter: source-verified via `bpmn-plugin-integration.test.ts` (real
  `mermaid.render()` in happy-dom), but no package boundary existed.
- No `docs/mermaid-compatibility.md` claim document.
- No plugin demo route in the public app.
- Support matrix on Home page driven by inline data, not a capability registry.
- 40+ unused dependencies in `app/package.json` (TD-001, still open).

---

## Phase 1 — Repair the release path

**Ref:** Task #179 — "Phase 1: repair release path"

**Problem:** Filename-case conflicts and skill test/eval failures blocked a clean build on
case-sensitive filesystems (the target deployment environment).

**What was delivered:**
- Resolved filename-case conflicts between `skills/` directories.
- Fixed all skill test and eval failures that were blocking the CI gate.
- Created `docs/mermaid-compatibility.md` as the authoritative claim document with the
  evidence-tier table.

**Acceptance gate:** All O1 commands pass on Linux after the fix.

---

## Phase 2 — Plugin package boundary

**Ref:** Task #180 — "Phase 2: plugin package boundary"

**Problem:** `bpmn-plugin.ts` was private to the app. There was no `exports` map, no `files`
allowlist, and no clean-install fixture. The package could not be consumed externally.

**What was delivered:**
- `lib/bpmn-plugin/` workspace package created with:
  - `package.json` — `name: "@okhp3/mermaid-diagram-bpmn"`, `version: "0.1.0"`,
    `exports` map (ESM + CJS), `files` allowlist.
  - `vite.config.ts` — library-mode Vite build producing `dist/index.mjs` + `dist/index.cjs`.
  - `index.d.ts` / `index.d.cts` — type declarations.
  - `README.md` — consumer install guide.
- `fixtures/plugin-smoke/smoke.mjs` — clean-install smoke test:
  installs from the `.tgz` tarball produced by `npm pack`, then asserts 12 properties of
  the installed package (module resolution, exports shape, plugin API surface).
- `scripts/run-plugin-smoke.mjs` — orchestrator script: `build → pack → install → smoke`.
- Smoke test added as a blocking CI step in `.github/workflows/ci.yml`.

**Acceptance gate:** `scripts/run-plugin-smoke.mjs` — 12/12 smoke assertions pass.

---

## Phase 3 — Mermaid Host Demo route

**Ref:** Task #181 — "Phase 3: Mermaid Host Demo route"

**Problem:** The integration test required `securityLevel: 'loose'` due to a happy-dom SVG
parser limitation (see `docs/mermaid-compatibility.md`, "Known test environment constraint").
No route existed to demonstrate the plugin working in a real browser at default Mermaid
security settings.

**What was delivered:**
- `app/src/pages/MermaidHostDemo.tsx` — public route at `/mermaid-host-demo`:
  loads `@okhp3/mermaid-diagram-bpmn`, calls `mermaid.initialize()` **without**
  `securityLevel: 'loose'`, renders a `bpmn-beta` diagram via `mermaid.render()`.
- `app/src/__tests__/mermaid-host-demo.test.tsx` — 13 component tests including a key
  assertion: `mermaid.initialize()` is never called with `securityLevel: 'loose'`.
- Plugin Installation page (`app/src/pages/PluginInstallation.tsx`) — consumer guide
  accessible at `/plugin-installation`.

**Acceptance gate:** 13/13 mermaid-host-demo tests pass; no `securityLevel: 'loose'`
assertion is the load-bearing test.

---

## Phase 4 — Reconcile public truth

**Ref:** Task #182 — "Phase 4: reconcile public truth"

**Problem:** The public app's Home page support matrix, Architecture page, and About page
contained claims that had drifted from the current state. "Planned" labels persisted on
features that were now implemented or source-verified.

**What was delivered:**
- `app/src/data/capability-registry.ts` — new single source of truth for every public BPMN
  element and plugin integration claim, with typed evidence tiers
  (`packaged | source-verified | implemented | experimental | deferred | out-of-scope`).
- `app/src/pages/Home.tsx` — support matrix now derives from the capability registry;
  "Planned" renamed to "Deferred"; stale items removed.
- `app/src/pages/Architecture.tsx` — integration note updated
  ("registers" not "will register"); status badges added.
- `app/src/pages/About.tsx` — pool/lane vs. message-flow limitation split to reflect
  current evidence; plugin adapter note updated.
- Historical-note banners added to `app/docs/as-built-prd.md` and `app/docs/prd.md`
  to prevent confusion with current directives.
- `app/docs/roadmap.md` — V0.6 marked ✅ Done (2026-08-04); readiness table updated.

**Acceptance gate:** All 7 O1 commands pass after reconciliation.

---

## Post-phase state (all phases merged)

All O1 commands green after Phase 4:

| O1 Command | Result |
|---|---|
| `pnpm run typecheck` | PASS |
| `pnpm --filter @workspace/mermaid-diagram-bpmn run test` | PASS — 403/403 |
| `pnpm run skill:validate` | PASS — 235/235 |
| `pnpm run eval:run` | PASS — 14/14 |
| `pnpm run check:generated` | PASS |
| `pnpm run build` | PASS |
| `scripts/run-plugin-smoke.mjs` | PASS — 12/12 |

**Git tag:** `v0.1.0` (2026-08-04) — the first externally consumable version of the plugin.

---

## What was explicitly deferred from PRD-04 scope

| Item | Why deferred | Where tracked |
|---|---|---|
| Strip unused `app/package.json` deps (TD-001) | Requires careful audit; no blocker to integration proof | Task #187 |
| `<script>` tag CDN load path | Requires npm publish + CDN distribution | V0.9 checklist |
| Automated Playwright E2E in real browser | Task #185 (separate follow-up) | `docs/mermaid-compatibility.md` footnote |
| Typed `ParseError` (TD-010) | Separate hardening task | Task #188 |
| Shape extraction from renderer (TD-003) | Separate hardening task | Task #188 |

---

## Key design decisions made during PRD-04

- **DEC-022 (inferred):** The integration test must use `securityLevel: 'loose'` in
  happy-dom because happy-dom's HTML parser drops SVG children after `<defs>`. This is a
  test-environment constraint, not a security compromise in production.
- **DEC-023 (inferred):** The plugin package is a separate workspace package
  (`lib/bpmn-plugin/`) rather than an exports-only view of the app, so the app can remain
  `"private": true` and the plugin can be published independently.
- **DEC-024 (inferred):** Evidence tiers in `capability-registry.ts` follow a strict
  promotion ladder (`implemented → source-verified → packaged`) requiring a named test or
  fixture for each upgrade.

---

*For the forward plan beyond PRD-04, see `app/docs/PRD-05-upstream-readiness-directive.md`
(the current authoritative directive) and `docs/version-checklist.md` V0.7–V1.0.*
