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
| Mermaid source adapter tested via real `mermaid.render()` | `bpmn-plugin-integration.test.ts` — imports real `mermaid@11.4.1`, calls `registerExternalDiagrams`, renders both flat and pool/lane corpus examples, asserts `bpmn-*` classes present; test passes in 390/390 suite | **source-verified** | Test packaged artifact in a clean install (Phase 2) |
| Plugin is externally consumable as an installable package | No package boundary exists — `app/package.json` is `"private": true`, no `exports` map, no `files` allowlist, no clean-install fixture | **not complete** | Phase 2: package smoke fixture |
| FR-018: Live theme-variable binding | `bpmn-plugin-integration.test.ts` — "FR-018: live theme-variable binding" describe block passes, `styles()` provider supplies resolved `themeVariables` at render time | **source-verified** | Verify in production browser (no `securityLevel: loose`) in Phase 3 |
| TD-004: Parser errors show diagnostic, not blank preview | `bpmn-plugin-integration.test.ts` — "TD-004" describe block passes (bad source throws or returns non-empty SVG) | **source-verified** | Visual confirmation in browser; inline error display in React playground may need a separate check |
| BP-SKILL validator passes all 15 source skills | `pnpm run skill:validate` — 235/235 checks, 0 failures | **confirmed** | Preserve as release gate |
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
