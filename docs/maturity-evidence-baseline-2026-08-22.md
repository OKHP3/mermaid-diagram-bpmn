# Maturity Evidence Baseline — 2026-08-22

## Review record

**Review date:** 2026-08-22  
**Source boundary:** repository `HEAD` `b80734320560c95e2c8f0ad1e6074b3612b86853`, plus the uncommitted working-tree changes present at review start. Working-tree diff fingerprint: `0266852ed58b742bd09b1a472bafc5267b40890cd31a3c1bb7fa1f3639f62b87`.  
**Decision question:** Is BPMN for Mermaid ready to be described as a mature, adoption-ready solution within its deliberately limited scope?

### Decision

**Approve with limits.** BPMN for Mermaid is a credible, technically demonstrated prototype and static distribution experience for a documented BPMN descriptive subset. It is not yet adoption-ready as a mature solution: browser interaction regressions remain, first-time user outcome evidence is absent, the browser-CDN path is incomplete, external adoption is unproven, and upstream Mermaid status remains externally dependent.

This verdict does not treat passing local tests as proof of adoption, maintainer endorsement, full BPMN conformance, or production readiness.

### Audience and scope

The evaluated audiences are process analysts and business analysts, Mermaid-oriented technical contributors, process-documentation practitioners, and prospective Mermaid maintainers. The product boundary is intentionally static and browser-first: `bpmn-beta` text → detector → parser → typed database → layout → SVG, plus the portable BP-SKILL suite. Accounts, persistence, execution semantics, BPMN XML interchange, bpmn-js, and an in-app LLM remain out of scope.

Acceptance criteria are: technical correctness for supported syntax; useful public paths and honest limits; accessible, portable output; reproducible release checks; and evidence sufficient to distinguish local proof from external adoption and upstream readiness.

## Claim and evidence ledger

Statuses use **supported**, **provisional**, **disputed**, and **blocked**. Evidence is dated at retrieval or execution time; older records remain historical.

| ID | Material claim | Type | Evidence | Status | Consequence if false | Smallest next test |
|---|---|---|---|---|---|---|
| MAT-01 | The supported `bpmn-beta` DSL parses, lays out, and renders diagrams through the React pipeline. | Fact | `pnpm --filter @workspace/mermaid-diagram-bpmn run test`: 839/839, 46 files, 2026-08-22; parser, layout, renderer, and corpus tests. | supported | Users cannot create the documented artifact. | Keep corpus and renderer regression gates green. |
| MAT-02 | The Mermaid external-diagram adapter renders supported examples through real `mermaid@11.4.1`. | Fact | `bpmn-plugin-integration.test.ts`; plugin smoke 12/12 on a packed tarball; Chromium host-demo coverage, 2026-08-22. | supported | The advertised Mermaid integration path fails at its core contract. | Re-run host-demo across configured browser engines after interaction fixes. |
| MAT-03 | The published plugin package is installable and consumable. | Fact | `@okhp3/mermaid-diagram-bpmn@0.1.1` registry response 200 on 2026-08-22; clean pack/install smoke 12/12. | supported | Users cannot install the advertised package. | Verify the next published version from a clean external fixture. |
| MAT-04 | The plugin respects Mermaid theme variables at render time. | Fact | FR-018 integration test in `bpmn-plugin-integration.test.ts`; compatibility reference, reviewed 2026-08-22. | supported | Host output may ignore the host theme or render with incorrect colors. | Confirm theme changes in a real host browser under strict security. |
| MAT-05 | The BP-SKILL suite is structurally valid and its evaluation fixtures pass. | Fact | `pnpm run skill:test`: 196/196; `pnpm run skill:validate`: 235/235; `pnpm run eval:run`: 14/14 and 100/100, all 2026-08-22. | supported | Downloads may be malformed or workflow claims may be untrustworthy. | Preserve these as release gates and add unseen cross-platform evidence. |
| MAT-06 | The public UX reliably takes a first-time visitor to a completed diagram or workflow outcome. | Hypothesis | PRD-06 success criteria and existing routes; no moderated first-time evaluator study or completion-funnel evidence. | provisional | The technically sound surfaces may still fail the intended job. | Run the planned first-time visitor outcome validation. |
| MAT-07 | Primary public surfaces meet the intended accessibility bar. | Fact | axe checks in application tests; visual/mobile assertions and snapshots in `app/e2e/visual-regression.spec.ts`; 2026-08-22. Color contrast in happy-dom and complete keyboard/touch work-surface behavior are not proven. | provisional | Users may be blocked despite semantic controls passing automated checks. | Complete real-browser keyboard, touch, focus, and contrast checks. |
| MAT-08 | Releases are reproducible from the committed lockfile and generated sources. | Fact | `pnpm install --frozen-lockfile`, typecheck, generated-file, content, version, and manifest checks all pass on 2026-08-22. | supported | A green source tree could produce a stale or unreproducible release. | Keep the full clean-install sequence in CI. |
| MAT-09 | The measured performance budget is currently met. | Fact | Production build and `check:bundle-size` pass on 2026-08-22; initial JS 72.74 kB gzip against 150 kB ceiling; plugin build 5.94/5.44 kB gzip. | supported | Initial load or package size may regress beyond stated limits. | Re-measure after route or Mermaid dependency changes. |
| MAT-10 | The project is ready for broad adoption and has external traction. | Interpretation | No project adoption metrics, third-party integrations, or independent user study; competitive notes explicitly say adoption is unproven. | blocked | Public positioning could imply traction that has not been demonstrated. | Obtain independent adoption or usage evidence; do not infer it from local tests. |
| MAT-11 | The upstream Mermaid path is ready and likely to converge on this implementation. | Interpretation | Mermaid issue #7699 and related issue checks retrieved 2026-08-21; issue remains externally controlled, its labels changed, and no maintainer reply to the project is recorded. | provisional | Roadmap timing and syntax convergence may be misrepresented. | Re-run the source check at the next review date and record any PR/maintainer action. |
| MAT-12 | The browser-CDN/script-tag adoption path is complete. | Fact | Version checklist V0.9 criterion remains unchecked; compatibility reference lists live-editor testing as open. | blocked | Users following the CDN path may fail despite npm package success. | Complete or explicitly retire the CDN path and update all derived claims. |
| MAT-13 | Existing worked-example node navigation is browser-verified. | Fact | 2026-08-22 Chromium run: 49/57 passed, 8 node-navigation tests failed by timeout while locating mapped skill buttons. | blocked | Readers may be unable to follow diagrams into the BP-SKILL workflow. | Fix or narrow the interaction contract, then rerun the affected specs. |

## Conditional equilibrium review

The review used the required evidence, outcome, safety-portability, narrow disruptor, and adjudication perspectives over the frozen records above. These are analytical review results, not external adoption evidence.

| Role | Finding | Evidence status |
|---|---|---|
| Evidence reviewer | Core pipeline, package smoke, skill suite, generated assets, build, and performance claims are directly supported by fresh local artifacts. | analytical |
| Outcome reviewer | The product has credible routes and examples, but completion for first-time users is not measured and the browser node-navigation failures interrupt the workflow promise. | analytical |
| Safety and portability reviewer | Static/no-account boundaries are clear; accessibility is partly automated and browser coverage is meaningful, but CDN/live-editor portability and complete keyboard/touch behavior remain unresolved. | analytical |
| Disruptor | A passing local suite can coexist with a broken public adoption path: a fresh visitor can render the diagram yet fail to follow a linked skill or load the package through the promised CDN route. | analytical; counterexample survives |
| Negotiator | Local technical maturity is supported; mature adoption-ready positioning is not. The surviving browser and distribution counterexamples require limits on the verdict. | analytical |

**Evidence limitations:** All five perspectives share the same repository and public artifact set, so their agreement is correlated. The review did not claim a protected holdout, external user study, independent security audit, or maintainer endorsement.

## Fresh release and public-artifact checks

Executed on **2026-08-22** from the frozen boundary:

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| Application tests | PASS — 839/839 |
| `pnpm run skill:test` | PASS — 196/196 |
| `pnpm run check:generated` | PASS |
| `pnpm run skill:validate` | PASS — 235/235 |
| `pnpm run eval:run` | PASS — 14/14, 100/100 |
| `pnpm run plugin:build` | PASS — ESM 5.94 kB gzip, CJS 5.44 kB gzip |
| `pnpm run plugin:smoke` | PASS — 12/12 |
| `pnpm run build` | PASS |
| `pnpm run check:bundle-size` | PASS — 72.74 kB gzip, 150 kB ceiling |
| `pnpm run check:content` | PASS |
| `pnpm run check:version-status` | PASS — V0.4 remains lowest incomplete milestone |
| `pnpm run manifest:check` | PASS |
| `pnpm --filter @workspace/mermaid-diagram-bpmn run test:e2e --project=chromium` | **BLOCKED** — 49/57 passed; 8 existing purchase/vendor node-navigation tests timed out |
| `pnpm run check:dfki-7699` | **BLOCKED pending review** — public issue labels/examples changed since the 2026-08-21 source baseline |

Public checks on 2026-08-22 returned HTTP 200 for the deployed root application, its deployed `release-manifest.json`, the npm package metadata, and the npm `0.1.1` version record. GitHub Pages deep links `/playground`, `/skills`, and `/plugin` returned 404 from direct HTTP requests; this is retained as a portability observation because the static app may rely on SPA navigation/fallback behavior. The deployed JavaScript filename check returned 404 because the local build emitted a newer hashed filename; no claim is made about that stale public asset URL.

## Canonical reconciliation

- `docs/capability-ledger.md` now points to this dated baseline and uses the four claim statuses above; earlier dated baselines remain historical.
- `docs/version-checklist.md` remains authoritative for release completion and marks unresolved CDN, real-world proof, and upstream work as incomplete.
- `README.md`, the Mermaid compatibility reference, and the comparison surface describe the package as published/source- and browser-tested, not as a mature upstream Mermaid feature or full BPMN implementation.
- `app/public/release-manifest.json` is regenerated on this review date and its generator remains the canonical source for release metadata.
- `app/docs/PRD-06-product-convergence-and-distribution-experience.md` remains a historical product review/forward directive; this baseline supersedes its older test-state observations without deleting them.

## Follow-up conditions

The verdict may be revisited only after the browser interaction blocker is resolved, the CDN path is completed or retired, first-time outcome evidence is collected, and the upstream/public-artifact checks are refreshed. A passing local suite alone cannot promote the maturity or adoption claim.