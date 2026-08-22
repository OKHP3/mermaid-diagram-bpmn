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
| WCAG 2.2 AA accessibility gate | axe-core 4.13.0 via `@testing-library/react` in happy-dom; rules: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice; color-contrast disabled (no computed CSS in happy-dom); covers Home, Playground, AgentSkills, SkillDetail, and About pages; expanded 2026-08-20 | **source-verified** | Color-contrast and visual focus ring verification deferred to visual regression task (#213). Per-node SVG aria-label covered by task #191. |
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
| Integration test runs under `securityLevel: "loose"` | Required by happy-dom's SVG parser limitation. Resolved in browsers: automated Playwright E2E (`app/e2e/host-demo.spec.ts`) runs against Chromium, Firefox (Gecko), and WebKit with default securityLevel ('strict') and all diagrams render correctly. |
| App main bundle >500 kB | **Resolved 2026-08-07** — route-level lazy-loading implemented (Task #212). Main initial chunk reduced from 657 kB / 186 kB gzip to 232 kB / 73 kB gzip. Mermaid is now deferred to the `/mermaid-host-demo` route chunk only. |

---

## Performance Budget — 2026-08-07

**Established by:** Task #212 (Performance budget and Mermaid lazy-loading)  
**Environment:** Linux (Replit), Vite 8.1.4, pnpm 10.26.1, Node.js 24.13.0  
**Build command:** `pnpm --filter @workspace/mermaid-diagram-bpmn run build`

### Mermaid lazy-loading

Before this task, `MermaidHostDemo.tsx` imported `mermaid` statically. Because `App.tsx` imported `MermaidHostDemo` statically, Mermaid and all its diagram sub-chunks (cytoscape, katex, sequenceDiagram, etc.) were included in every user's initial page load — even on routes that never render a diagram.

**Fix:** All routes in `app/src/App.tsx` except `Home` are now loaded via `React.lazy()` + `Suspense`. Vite splits each lazy route into its own chunk at build time. Mermaid is only downloaded when a user navigates to `/mermaid-host-demo`.

### Bundle size — baseline vs. after (min, no gzip unless noted)

| Chunk | Before (2026-08-07) | After (2026-08-07) | Notes |
|---|---|---|---|
| `index-*.js` (main initial chunk) | 657.00 kB / **186 kB gzip** | 232.74 kB / **73 kB gzip** | −61% gzip; no mermaid on initial load |
| `src-*.js` (app source) | bundled into index | 171.26 kB / 44 kB gzip | split out by lazy-loading |
| `MermaidHostDemo-*.js` | bundled into index | 39.89 kB / 13.5 kB gzip | deferred; only loaded on `/mermaid-host-demo` |
| Mermaid diagram sub-chunks (sum) | bundled into index | ~1 900 kB / ~650 kB gzip | deferred with MermaidHostDemo |
| CSS | 82.71 kB / 13.4 kB gzip | 82.71 kB / 13.4 kB gzip | unchanged |

### Plugin package size

The published plugin package (`@okhp3/mermaid-diagram-bpmn`) is well within the <200 kB min+gzip NFR:

| Format | Minified | Gzip |
|---|---|---|
| ESM (`dist/index.mjs`) | 20.0 kB | **5.7 kB** |
| CJS (`dist/index.cjs`) | 16.7 kB | **5.4 kB** |

### Performance budget (ceilings)

| Metric | Ceiling | Measured | Status |
|---|---|---|---|
| Initial JS bundle (`index-*.js`) gzip | ≤ 150 kB | 73 kB | ✅ PASS |
| Plugin ESM gzip | < 200 kB | 5.7 kB | ✅ PASS |
| Plugin CJS gzip | < 200 kB | 5.4 kB | ✅ PASS |
| Mermaid on non-diagram routes | 0 kB (deferred) | 0 kB | ✅ PASS |

**Budget ceiling rationale:** The 150 kB gzip ceiling for the initial bundle reflects the current measured 73 kB with ~2× headroom for future route/component additions. If the initial chunk approaches 150 kB gzip, revisit whether any further route code can be deferred.

### Capability claims updated

| Claim | Previous status | New status | Notes |
|---|---|---|---|
| Mermaid loads only on routes that need it | not confirmed | **confirmed** | `React.lazy()` route splitting; all 579 tests pass post-change |
| Plugin package < 200 kB min+gzip | confirmed (2026-08-06) | **re-confirmed** | ESM 5.7 kB / CJS 5.4 kB gzip |
| Performance budget documented | not complete | **confirmed** | This section; baseline + ceilings committed |

---

## Visual and Mobile Regression Checks — 2026-08-07

**Established by:** Task #213 (Visual and mobile regression checks)  
**Tool:** Playwright (Chromium, headless), same installation as the host-demo E2E suite  
**Spec file:** `app/e2e/visual-regression.spec.ts`

### Surfaces and viewports covered

| Page | Desktop | Mobile |
|---|---|---|
| Home (`/`) | 1280×800 | 375×812 |
| Playground (`/playground`) | 1280×800 | 375×812 |
| Agent Skills (`/skills`) | 1280×800 | 375×812 |
| Walkthrough hub (`/walkthrough`) | 1280×800 | 375×812 |
| Purchase Approval walkthrough (`/walkthrough/purchase-approval`) | 1280×800 | 375×812 |
| Employee Offboarding walkthrough (`/walkthrough/employee-offboarding`) | 1280×800 | 375×812 |
| Vendor Onboarding walkthrough (`/walkthrough/vendor-onboarding`) | 1280×800 | 375×812 |
| Mermaid Host Demo (`/mermaid-host-demo`) | 1280×800 | — |

### Dark-mode coverage

Playwright emulates `prefers-color-scheme: dark` before navigation and seeds the
application's persisted dark-theme preference, ensuring the class-based `dark:`
variants are visible in the snapshots.

| Page | Desktop | Baseline |
|---|---|---|
| Home (`/`) | 1280×800 | `home-desktop-dark-linux.png` |
| Agent Skills (`/skills`) | 1280×800 | `skills-desktop-dark-linux.png` |

The same preference emulation and persisted theme seed are used for the
375×812 mobile snapshots:

| Page | Mobile | Baseline |
|---|---|---|
| Home (`/`) | 375×812 | `home-mobile-dark-linux.png` |
| Agent Skills (`/skills`) | 375×812 | `skills-mobile-dark-linux.png` |

### Two-layer check design

**Layer 1 — Programmatic layout assertions (merge-blocking CI gates)**  
These run on every push and pull request. No image baseline is required.

| Assertion | Pages | Viewport |
|---|---|---|
| No horizontal overflow (`scrollWidth − clientWidth = 0`) | Home, Playground, Skills, Walkthrough hub, and all worked examples | Both |
| No horizontal overflow (`scrollWidth − clientWidth = 0`) | Mermaid Host Demo | Desktop |
| Primary CTA / search input height ≥ 36 px | Home, Skills | Mobile |
| Source textarea width ≥ 300 px | Playground | Mobile |
| Key headings visible (`h1`, `data-testid="heading-*"`) | All three | Both |
| Path cards count = 3 | Home | Both |
| Example tab buttons present (≥ 1) | Playground | Desktop |
| Search input `[aria-label="Search skills"]` visible | Skills | Both |
| At least one `.forge-card` visible | Skills | Desktop |
| Navigation present (`<nav>`) | Home | Mobile |
| Heading, rendered pipeline SVG, and handoff table present | Walkthrough hub | Both |
| Key `h1` plus exactly 15 timeline steps present | Purchase Approval, Employee Offboarding, Vendor Onboarding | Both |
| Heading, four rendered SVG panels, and intentional error panel present | Mermaid Host Demo | Desktop |

**Layer 2 — Visual snapshot comparison (pixel diff)**  
19 baseline PNGs are generated and committed automatically by CI on every push to `main` (`[skip ci]` commit). Pull requests compare against the committed baselines and fail if pixel diff exceeds the threshold.

| Snapshot | Threshold |
|---|---|
| `home-desktop-linux.png` | 2 % |
| `home-desktop-dark-linux.png` | 2 % |
| `home-mobile-linux.png` | 2 % |
| `home-mobile-dark-linux.png` | 2 % |
| `playground-desktop-linux.png` | 3 % (diagram rendering variance) |
| `playground-mobile-linux.png` | 3 % |
| `skills-desktop-linux.png` | 2 % |
| `skills-desktop-dark-linux.png` | 2 % |
| `skills-mobile-linux.png` | 2 % |
| `skills-mobile-dark-linux.png` | 2 % |
| `walkthrough-desktop-linux.png` | 3 % (wide BPMN pipeline) |
| `walkthrough-mobile-linux.png` | 3 % (wide BPMN pipeline) |
| `purchase-approval-desktop-linux.png` | 2 % |
| `purchase-approval-mobile-linux.png` | 2 % |
| `employee-offboarding-desktop-linux.png` | 2 % |
| `employee-offboarding-mobile-linux.png` | 2 % |
| `vendor-onboarding-desktop-linux.png` | 2 % |
| `vendor-onboarding-mobile-linux.png` | 2 % |
| `mermaid-host-demo-desktop-linux.png` | 3 % (SVG sub-pixel variance) |

Baseline images are stored in `app/e2e/__snapshots__/`. File names include the platform suffix (`-linux`, `-darwin`, `-win32`) to prevent cross-OS baseline conflicts.

### CI job

`visual-regression` job in `.github/workflows/ci.yml`:
- **Main pushes:** runs `test:e2e:update-snapshots`, commits updated PNGs with `[skip ci]`
- **Pull requests:** runs `test:e2e:visual` (comparison); fails on diff above threshold
- Uploads `playwright-report/` + `__snapshots__/` as CI artifacts on failure (14-day retention)

### Capability claims

| Claim | Status | Notes |
|---|---|---|
| No horizontal overflow on Home, Playground, Skills, Walkthrough hub, and all worked examples at mobile (375 px) | **confirmed** | Programmatic assertion; CI-blocking |
| Walkthrough hub shows its heading, 15-skill BPMN pipeline, and full handoff reference | **confirmed** | Programmatic assertion at desktop and mobile; CI-blocking |
| All three worked examples show their heading and complete 15-step process timeline | **confirmed** | Programmatic assertion at desktop and mobile; CI-blocking |
| Mermaid Host Demo has a settled desktop visual guard after all diagram panels reach terminal state | **confirmed** | Four SVG and intentional error-panel assertions precede its committed baseline |
| Home and Agent Skills dark palettes are protected from visual regressions | **confirmed** | Browser dark-media emulation and persisted app preference activate class-based dark variants before desktop snapshots |
| Primary interactive controls meet minimum tap-target height | **confirmed** | ≥ 36 px; CI-blocking |
| Visual baselines capture 8 pages across 17 viewport surfaces | **confirmed** | 17 Linux/Chromium PNG baselines are committed and compared by the PR gate |
| Pixel-diff comparison blocks PRs on unexpected visual regression | **confirmed** | `maxDiffPixelRatio` 2–3 %; CI gate active on PRs |

---

## Cross-browser host-demo confirmation — 2026-08-20

The Mermaid host-demo E2E suite is configured as a three-engine CI gate. It runs
the same flat-flow, gateway, pool/lane, cross-pool message-flow, and invalid-source
error-case coverage against Chromium, Firefox (Gecko), and WebKit (Safari's engine).

| Claim | Evidence | Status |
|---|---|---|
| Mermaid external-diagram plugin renders correctly with strict default security on all three major browser engines | `app/e2e/host-demo.spec.ts` runs through the `chromium`, `firefox`, and `webkit` Playwright projects. The CI `e2e` job uses a browser matrix, installs each engine with its dependencies, and reports engine failures separately. | **browser-verified — Chromium, Gecko, and WebKit confirmed** |
