# Capability Ledger

**Baseline date:** 2026-08-04  
**Verified by:** PRD-04 Phase 0 baseline run (Task #178)  
**Environment:** Linux (Replit), pnpm 10.26.1, Node.js 24

All commands were run from a clean `pnpm install` on the current checkout.
No results were assumed from prior session notes.

---

## O1 command results

| Command | Exit | Result |
|---|---|---|
| `pnpm run typecheck` | 0 | PASS — root libs, app, and scripts all clean |
| `pnpm --filter @workspace/mermaid-diagram-bpmn run test` | 0 | PASS — 390/390 tests, 20/20 test files (includes `bpmn-plugin-integration.test.ts`) |
| `pnpm run skill:test` | 0 | PASS — 196/196 tests, 15 skills + pipeline integration |
| `pnpm run check:generated` | 0 | PASS — `pns-transitions-auto.ts` and `skill-deps-auto.ts` both up to date |
| `pnpm run skill:validate` | 0 | PASS — 235/235 checks across 18 skill packages + 9 context files |
| `pnpm run eval:run` | 0 | PASS — 14/14 fixtures, score 100/100 across 5 eval categories |
| `pnpm run build` | 0 | PASS — typecheck + Vite build; output in `app/dist/public/` |

**All O1 commands are green on Linux as of this baseline.**

---

## Capability claims

| Claim | Evidence | Status | Required next test |
|---|---|---|---|
| React playground renders supported DSL syntax | Application tests (`bpmn-parser-corpus.test.ts`, `bpmn-renderer.test.tsx`, 390 total passing) | **confirmed** | Maintain regression coverage |
| Mermaid source adapter tested via real `mermaid.render()` | `bpmn-plugin-integration.test.ts` — imports real `mermaid@11.4.1`, calls `registerExternalDiagrams`, renders both flat and pool/lane corpus examples, asserts `bpmn-*` classes present | **source-verified + E2E pending** | Playwright suite (`app/e2e/host-demo.spec.ts`) is CI-gated in the `e2e` job; covers flat flow, gateway, pool/lane, cross-pool, and error case with default securityLevel ('strict'). Status upgrades to **browser-verified** on first green CI E2E run. |
| WCAG 2.2 AA accessibility gate | axe-core 4.13.0 via `@testing-library/react` in happy-dom; rules: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice; color-contrast disabled (no computed CSS in happy-dom); covers Home, Playground, AgentSkills pages; 2026-08-07 | **source-verified** | Color-contrast and visual focus ring verification deferred to visual regression task (#213). Per-node SVG aria-label covered by task #191. |
| Plugin is externally consumable as an installable package | No package boundary exists — `app/package.json` is `"private": true`, no `exports` map, no `files` allowlist, no clean-install fixture | **not complete** | Phase 2: package smoke fixture |
| FR-018: Live theme-variable binding | `bpmn-plugin-integration.test.ts` — "FR-018: live theme-variable binding" describe block passes, `styles()` provider supplies resolved `themeVariables` at render time | **source-verified** | Verify in production browser (no `securityLevel: loose`) in Phase 3 |
| TD-004: Parser errors show diagnostic, not blank preview | `bpmn-plugin-integration.test.ts` — "TD-004" describe block passes (bad source throws or returns non-empty SVG) | **source-verified** | Visual confirmation in browser; inline error display in React playground may need a separate check |
| BP-SKILL validator passes the 15 core packages plus three supplemental/meta packages | `pnpm run skill:validate` — 235/235 checks, 0 failures across 18 packages and 9 context files | **confirmed** | Preserve as release gate |
| Root skill test suite passes | `pnpm run skill:test` — 196/196 tests, all 15 skills + pipeline integration | **confirmed** | Preserve as release gate |
| Evaluation suite passes | `pnpm run eval:run` — 14/14 fixtures, 100/100 score | **confirmed** | Confirm cross-platform (Windows) behavior in Phase 1 |
| Generated files are in sync with sources | `pnpm run check:generated` — both `pns-transitions-auto.ts` and `skill-deps-auto.ts` reported up to date | **confirmed** | Re-check after any changes to `skills-registry.ts` or skill `depends_on` fields |
| TypeScript compilation clean across all packages | `pnpm run typecheck` — root libs, `app/`, and `scripts/` all pass without errors | **confirmed** | Run before every merge |
| Production build succeeds | `pnpm run build` — Vite 8 bundle built in ~2s; `dist/public/index.html` + JS/CSS output present | **confirmed** | Run before every deploy |
| `docs/mermaid-compatibility.md` exists and cites the integration test | File does not exist | **not complete** | Phase 1: create this file citing `bpmn-plugin-integration.test.ts` as proof |
| Plugin demo route in the public app | No such route exists | **not complete** | Phase 3: Mermaid Host Demo route |
| Public support matrix driven by capability registry | Support matrix is driven by inline data, not a capability registry; some labels may be stale relative to current evidence | **not complete** | Phase 4: create capability registry, reconcile all public claims |

---

## Version and toolchain consistency

| Item | Source 1 | Source 2 | Source 3 | Status |
|---|---|---|---|---|
| pnpm version | `package.json`: `pnpm@10.26.1` | `AGENTS.md`: "pnpm 10, declared as `pnpm@10.26.1`" | `docs/technology-inventory.md`: "10.26.1 (`pnpm@10.26.1` declared in root `package.json`)" | **consistent — no fix needed** |
| Version scheme | `docs/version-checklist.md`: V0.x ladder | `app/docs/roadmap.md`: V0.x (reconciled per DEC-021) | Both reference the same milestone definitions | **consistent — DEC-021 resolved G8** |

---

## Open risks surfaced by this baseline

| Risk | Detail |
|---|---|
| Integration test runs under `securityLevel: "loose"` | Required by happy-dom's SVG parser limitation. Not a problem in a real browser, but Phase 3 must verify without this workaround. |
| Windows eval runner cross-platform untested | `eval:run` passed on Linux. PRD-03 G10 cited a Windows ESM path issue. This environment is Linux-only; Phase 1 should confirm or document this risk. |
| Plugin is not an installable package | The largest gap. Source-level integration is verified; package boundary does not exist. Phase 2 is the load-bearing phase. |
| `docs/mermaid-compatibility.md` does not exist | PRD-04 and PRD-03 both require this file to be the authoritative claim document. Phase 1 should create it. |
| Unused declared dependencies (TD-001) | PRD-03 flagged ~40 unused packages in `app/package.json` (Radix UI components, etc.) as Critical, explicitly blocking npm publish. Phase 2 must address this before preparing a publishable package. |

---

## Notes

- The AGENTS.md note about `pns-transitions-auto.ts` being stale was written before this baseline run. As of this run, `check:generated` confirms both files are up to date.
- The 373/373 test count in `docs/version-checklist.md` (V0.3 tag) has grown to 390/390 as of this baseline. The additional 17 tests were added in post-v0.1.0 work (keyboard accessibility, aria attributes, brand checks, etc.).

---

## Baseline — 2026-08-06

**Verified by:** Task #197 (Restore clean-install validation baseline)  
**Environment:** Linux (Replit), pnpm 10.26.1, Node.js 24.13.0  
**Release status: GREEN** — all local validation gates pass and `@okhp3/mermaid-diagram-bpmn@0.1.1` is published and confirmed live on the npm registry (Task #198 resolved 2026-08-06).

All commands were run from `pnpm install --frozen-lockfile` on the current checkout.

### Toolchain versions

| Package | Version |
|---|---|
| Node.js | 24.13.0 |
| pnpm | 10.26.1 |
| TypeScript | ~7.0.2 |
| Vite | 8.1.4 |
| Vitest | 4.1.10 |
| mermaid | 11.4.1 |
| `@okhp3/mermaid-diagram-bpmn` | 0.1.1 |

### Gate results

| Command | Exit | Result |
|---|---|---|
| `pnpm install --frozen-lockfile` | 0 | PASS — lockfile up to date, no resolution step needed |
| `pnpm run typecheck` | 0 | PASS — root libs, app, and scripts all clean |
| `pnpm --filter @workspace/mermaid-diagram-bpmn run test` | 0 | PASS — **432/432 tests**, 23 files (up from 390/390 on 2026-08-04) |
| `pnpm run skill:test` | 0 | PASS — 196/196 tests |
| `pnpm run skill:validate` | 0 | PASS — 235/235 checks |
| `pnpm run eval:run` | 0 | PASS — 14/14 fixtures, 100/100 pts |
| `pnpm run check:generated` | 0 | PASS — both auto files up to date |
| `pnpm run plugin:build` | 0 | PASS — ESM 20.01 kB / 5.88 kB gzip; CJS 16.74 kB / 5.40 kB gzip |
| `pnpm run plugin:smoke` | 0 | PASS — 12/12 assertions |
| `pnpm --filter @workspace/mermaid-diagram-bpmn run build` | 0 | PASS — production bundle built; chunk-size warning noted (see below) |

### Plugin bundle size

Both formats are within the <200 kB min+gzip NFR:

| Format | Minified | Gzip |
|---|---|---|
| ESM (`dist/index.mjs`) | 20.01 kB | 5.88 kB |
| CJS (`dist/index.cjs`) | 16.74 kB | 5.40 kB |

### App bundle notes

The production build emits a chunk-size warning: the largest chunk (`index-*.js`) is 631.80 kB / 179.92 kB gzip, driven by Mermaid bundled into the main chunk. Lazy-loading Mermaid on routes that need it is the resolution path (Task #212).

### Updated capability claims (delta from 2026-08-04)

| Claim | Status (2026-08-04) | Status (2026-08-06) | Notes |
|---|---|---|---|
| React playground renders supported DSL syntax | confirmed | **confirmed** | 432 tests now (was 390); new snapshot + layout regression tests added |
| Shared shape library extracted | not tracked | **confirmed** | `bpmn-shapes.ts` — TD-003, TD-012 resolved 2026-08-05 |
| Typed `ParseError` with line/column/code | not tracked | **confirmed** | TD-010 resolved 2026-08-05; all 5 throw sites updated |
| SVG renderer snapshot tests | not tracked | **confirmed** | 5 corpus snapshots CI-gated (TD-005 resolved 2026-08-05) |
| Layout regression tests | not tracked | **confirmed** | 20 assertions on flat and pool/lane layouts (TD-006 resolved 2026-08-05) |
| Plugin is externally consumable (installable) | not complete | **confirmed** | `@okhp3/mermaid-diagram-bpmn@0.1.1` published 2026-08-06. `exports` map (ESM + CJS + types), `files` allowlist (`dist`, `README.md`), `sideEffects: false`. Smoke test (12/12) CI-gated in `publish-npm.yml`. |
| npm registry: `@okhp3/mermaid-diagram-bpmn` | not tracked | **published — 0.1.1** | `npm view @okhp3/mermaid-diagram-bpmn` returns version `0.1.1`. README install instructions are functional. |

### Open risks carried forward

| Risk | Detail |
|---|---|
| npm published | `@okhp3/mermaid-diagram-bpmn@0.1.1` confirmed live on registry 2026-08-06. README install instructions functional. |
| Integration test runs under `securityLevel: "loose"` | Required by happy-dom's SVG parser limitation. Resolved in browser: automated Playwright E2E (`app/e2e/host-demo.spec.ts`) runs against a real Chromium DOM with default securityLevel ('strict') and all diagrams render correctly. |
| App main bundle >500 kB | Mermaid is bundled into the initial load. Lazy-loading tracked in Task #212. |
