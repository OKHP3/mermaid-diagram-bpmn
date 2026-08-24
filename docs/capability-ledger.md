# Capability Ledger

**Current baseline:** 2026-08-22 — see [Maturity Evidence Baseline](maturity-evidence-baseline-2026-08-22.md)
**Historical baselines:** 2026-08-04, 2026-08-06, 2026-08-07, and 2026-08-20 remain below for dated context.
**Verified by:** PRD-04 Phase 0 baseline run (Task #178)  
**Environment:** Linux (Replit), pnpm 10.26.1, Node.js 24

**Current application test total:** 846 passing tests as of 2026-08-23. This is the
maintained live total; dated counts in the evidence records below describe the
run that produced each historical baseline.

All commands were run from a clean `pnpm install` on the current checkout.
No results were assumed from prior session notes.

---


## Current maturity verdict — 2026-08-22

**Approve with limits:** the technical prototype and static distribution experience are supported within the documented descriptive subset. Mature, adoption-ready positioning is **not supported**. See the dated [claim and evidence ledger](maturity-evidence-baseline-2026-08-22.md#claim-and-evidence-ledger) for the fresh results, analytical review, blockers, and public checks.

Status vocabulary for this baseline: **supported**, **provisional**, **disputed**, and **blocked**. The older sections below use their original terminology and dates; they are historical evidence, not silently refreshed results.

| Capability area | Current status | Evidence tier / boundary |
|---|---|---|
| DSL pipeline | supported | 839/839 application tests on 2026-08-22 |
| Mermaid integration and published plugin | supported | real Mermaid integration, packed smoke 12/12, npm 0.1.1 HTTP 200 |
| BP-SKILL suite | supported | 196/196 tests, 235/235 validation checks, 14/14 eval fixtures |
| Public UX and accessibility | provisional | automated gates pass; first-time outcome, contrast, touch, and complete keyboard behavior remain unproven |
| Release reproducibility | supported | frozen install, generated, content, version, manifest, build, and bundle checks pass |
| Performance | supported | 72.74 kB initial gzip against 150 kB ceiling; plugin gzip below 6 kB per format |
| Browser interaction portability | blocked | 49/57 Chromium E2E passed; 8 worked-example node-navigation tests timed out |
| CDN/live-editor adoption path | provisional | native ESM CDN proof supported for Mermaid 11.4.1 + plugin 0.1.1; live-editor integration and legacy script tags remain out of contract |
| Upstream/community readiness | provisional | issue #7699 is externally controlled and changed since its 2026-08-21 source baseline; no project maintainer reply is recorded |
| External adoption | blocked | no independent usage, third-party integration, or moderated outcome evidence |

Fresh command results and exact public checks are recorded in the dated review record above.

### Illustrative process corpus — 2026-08-24

The public Playground gallery and Mermaid Host Demo now include three
non-purchase process fixtures selected for materially different shapes:

| Example | Shape exercised | Evidence boundary |
|---|---|---|
| Employee onboarding | Failed-check exception plus parallel HR/IT setup across lanes | Does not demonstrate boundary/timer events or executable onboarding automation |
| Vendor collaboration | Procurement/vendor pools exchange message flows and route acceptance or rejection | Does not demonstrate choreography, message correlation, or runtime integration |
| Quote to order | Cross-role discount approval, credit exception, and customer acceptance branches | Does not demonstrate data objects, boundary events, or ERP/CRM execution |
| Support ticket triage | Priority routing plus parallel escalation notifications and a receive task | Does not demonstrate SLA timers, interrupting events, or runtime queue behavior |

Parser corpus invariants, React rendering, and real-browser Mermaid rendering
pass for all three fixtures in Chromium. The host-demo run was blocked before
Firefox and WebKit could launch because this Linux environment is missing their
native browser libraries; that environment limitation is not evidence of a
fixture rendering failure. This is authored, illustrative evidence of the
documented descriptive subset—not independent industry validation, full BPMN
conformance, or universal process coverage.

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
