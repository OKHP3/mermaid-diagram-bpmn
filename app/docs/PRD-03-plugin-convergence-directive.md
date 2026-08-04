# PRD-03: Plugin Convergence & Scope Discipline Directive
## BPMN for Mermaid (`OKHP3/mermaid-diagram-bpmn`)

| Field | Value |
|---|---|
| Doc owner | Jamie Hill (OverKill Hill P³), audit and directive by Claude |
| Prepared for | Replit agent (execution) and Jamie (approval) |
| Status | Final — independent audit + forward directive |
| Date | 2026-08-04 (re-verified same day against GitHub HEAD `64538b9`, see Section 1a) |
| Relates to | `app/docs/prd.md` (v0.3, 2026-05-05), `app/docs/as-built-prd.md`, `app/docs/prototype-to-product-retrospective.md`, `docs/version-checklist.md`, PRD-01 and PRD-02 (prior Replit-facing PRDs referenced in project history) |
| Supersedes | Nothing formally. Reconciles conflicting claims in `app/docs/roadmap.md` vs `docs/version-checklist.md`. |

---

## 0. How to use this document

This is not a wish list. It is a sequenced directive with a hard gate: **Phase 1 must be complete, tested, and merged before any further work happens on the BP-SKILL suite, the skills browser UI, branding, or documentation.** That ordering is the entire point of this document, so read Section 1 before Section 4.

Every factual claim below is sourced to a specific file, commit, or command output, listed in Section 2 and Section 8. If something here turns out to be wrong, the fix is to correct the ledger and this document, not to quietly ignore the finding.

This document assumes whoever executes it (a Replit agent session) starts by reading `AGENTS.md`, which remains the canonical repo guide. Nothing here overrides `AGENTS.md`'s scope boundaries (no backend, no auth, no bpmn-js, no BPMN XML, no AI calls inside the app). This document is about sequencing and verification, not scope expansion.

---

## 1. Independent audit verdict

You asked for a critical second opinion on what's been built against what was promised. Here it is, stated plainly.

**The core claim in this project's name has not been proven true, and hasn't moved since May.** "BPMN for Mermaid" means a diagram type that works inside Mermaid. The PRD (v0.3, 2026-05-05) states the v1 goal as "ship as External Diagram plugin first." The as-built PRD (2026-05-21) logged this as FR-016/INT-001: **GAP**, high confidence. The changelog's own "Unreleased" section lists `bpmn-plugin.ts` as implementing the full adapter contract, but every other current document, `AGENTS.md`, `CONTRIBUTING.md`, and the changelog itself in the same breath, says end-to-end validation against a live `mermaid.render()` host has never happened. That sentence has been true, worded almost identically, since May. It is still true today, August 4th.

The file evidence backs this up independently of what the docs claim. `app/src/lib/bpmn-plugin.ts`, `bpmn-parser.ts`, `bpmn-db.ts`, `bpmn-layout.ts`, `bpmn-detector.ts`, and `bpmn-examples.ts` all carry the identical last-modified timestamp of **2026-05-29**. Nobody has touched the actual DSL engine in over nine weeks. In that same window, 130+ commits landed on this repository.

**Where did those 130+ commits go?** Into a second, genuinely well-built product: the 15-skill BP-SKILL business-process methodology suite, its rename to the `okhp3-` brand line, its evaluation harness, its context/variable-layer templates, its skills-browser UI (`AgentSkills.tsx`, `SkillDetail.tsx`, `SkillsWalkthrough.tsx`), a PNS lifecycle visualization component with its own dedicated test suite, a brand-token drift checker, and several rounds of documentation rewrites (`strategy.md`, `pns-schema.md`, `variable-layer-guide.md`, `README.md`, `AGENTS.md` itself). Commit messages from the last two weeks read: font changes on BPMN node labels, brand-token drift checks, PNS lifecycle scroll behavior, localStorage persistence on a worked example, download-button additions. None of it is bad work. None of it is the thing this project is named after.

**This is scope drift, not incompetence.** The code that exists is above-average: typed data model, stack-based parser, a real test suite, a technical debt register that's actually honest about severity, a decision log, dual-standard compliance mapping (BPMN 2.0.2 *and* Mermaid contract simultaneously). The BP-SKILL suite, evaluated on its own terms, is a legitimately novel product, "zero of 89,000+ skills on agentskills.io implement a BABOK knowledge area" per your own competitive research, and it's well-executed. The failure mode is that every session found productive, well-scoped, low-risk work to do in the periphery instead of the one item that's been flagged **High severity, blocks v0.1.0** since May 21st: an actual, tested integration with real Mermaid. That work is riskier (it means finding out, in public, whether the adapter actually works) and less bounded, which is exactly the kind of task an agent will quietly deprioritize in favor of finishing sixteen more well-defined tickets.

**The honest framing for where the project stands:** you have a working BPMN-flavored diagram *playground that sits next to Mermaid*, plus a genuinely good agent-skill product. You do not yet have "BPMN for Mermaid" in the sense the name and the PRD promise. Those are different claims, and right now only the first one is true.

**One thing in the project's favor, and it matters:** nobody has lied about this anywhere I checked. The README, the public marketing page on overkillhill.com, and every internal doc consistently describe the DSL as a prototype with an unverified plugin path. The scope discipline against *technical* creep (no bpmn-js, no XML import, no executable semantics) has held for the entire three-and-a-half months. What drifted was priority ordering, not honesty or the DSL's own non-goals.

**If you feed this project a large new batch of tokens without redirecting it, the most likely outcome is more of the same:** more skill content, more UI polish, more documentation, and the plugin gap still open. That's the risk this directive exists to close off.

---

## 1a. Post-delivery re-verification (same day, before this document was committed)

This document was drafted against commit `79a98cc` (213 total commits). Before committing it to the repo, it was re-checked against the live GitHub HEAD, which had already moved to **`64538b9`** (249 total commits, 36 new commits, local mirror confirmed in sync with GitHub at the time of this check).

**The finding held.** None of the 36 new commits touch `bpmn-plugin.ts`, `bpmn-parser.ts`, `bpmn-db.ts`, `bpmn-layout.ts`, or `bpmn-detector.ts` (confirmed via `git diff --name-only` across the full range: zero matches). Every one of the 36 commits continued the exact pattern Section 1 describes: brand-token drift test coverage (`check-forge-profile.mjs` and its new test file), accessibility and link-routing tests on the skills browser and worked-example pages, `PnsLifecycleTracker` and `ExampleStepTimeline` behavior tests, localStorage persistence tests on the prompt panels, skill filter-count pinning, and font/CSS assertions added to the renderer's *existing* test file (not new plugin-integration coverage). Representative commit titles from the new range: "Add keyboard/aria accessibility tests for 'View Details' link," "Cover all 6 DIAGRAM_INDEX_CHECKS in brand:check drift tests," "Confirm renderer injects bpmn-styles CSS into every SVG it produces."

Also reconfirmed at this HEAD: both `package.json` files still read `"version": "0.0.0"`, still zero git tags, and `deploy-gh-pages.yml` still has no test or typecheck step before deploy.

**Read plainly: the drift this document flags didn't stop while it was being written, it continued in real time.** That's not a criticism of any single commit above, each is small, well-tested, legitimate work on the BP-SKILL/skills-browser product. It's the clearest evidence available that Section 5's guardrails need to be enforced deliberately, because "keep doing more well-scoped peripheral work" is the default gravity this project falls into without an explicit stop.

---

## 2. Ground truth ledger (verified 2026-08-04)

| # | Fact | Evidence |
|---|---|---|
| G1 | Core engine files (`bpmn-parser.ts`, `bpmn-db.ts`, `bpmn-layout.ts`, `bpmn-detector.ts`, `bpmn-plugin.ts`, `bpmn-examples.ts`, `utils.ts`) last modified 2026-05-29; zero commits touching them since | Directory listing (`mtimeMs` identical across all seven files: 1780092826062–1780092826069) |
| G2 | `registerExternalDiagrams()` + `mermaid.render()` end-to-end validation has never been performed | `AGENTS.md` ("still an open project gap"), `CONTRIBUTING.md` ("remain pending"), `changelog.md` [Unreleased], `app/docs/as-built-prd.md` FR-016/INT-001 — four independent current docs agree |
| G3 | Neither `package.json` (root or app) has ever been version-bumped off `0.0.0`; zero git tags exist | Direct file read; `git tag` returned empty |
| G4 | `.github/workflows/deploy-gh-pages.yml` (runs on every push to `main`) has no typecheck or test step. Only `.github/workflows/ci.yml` (added within the last few days, PR-triggered only) gates anything | Direct read of both workflow files |
| G5 | TD-001 (40+ unused declared dependencies, marked **Critical**, "blocks npm publish") logged 2026-05-21, still open per the 2026-07-13 technology inventory | `app/docs/technical-debt-register.md`, `docs/technology-inventory.md` |
| G6 | `app/src/data/pns-transitions-auto.ts` (a generated/derived file) is currently stale per the project's own newest guidance | `AGENTS.md`, current as of 2026-07-27 |
| G7 | 213 total commits. Heavy activity May 9–30 (~119 commits: the actual DSL/parser/renderer/plugin build plus the first 4-skill pilot), a sparse June (~25 commits, most days silent) and sparse July (~13 commits), then a 43-commit burst Aug 1–4. None of the post-May-29 commits touch the six core engine files | `git log --oneline`, `git log --format=%ad --date=short \| sort \| uniq -c` |
| G8 | Two versioning schemes describe the same "wire the plugin into real Mermaid" milestone under different names, with no cross-reference: `app/docs/roadmap.md` calls it **v0.1.0**, `docs/version-checklist.md` calls it **V0.6**, three checklist versions later than its own "current" V0.3 | Direct comparison of both files |
| G9 | `AGENTS.md` states pnpm `11.16.0`; the actual committed root `package.json` pins `pnpm@10.26.1`; the 2026-07-13 technology inventory says `11.7.0` locally / `11.12.0` declared. Three different numbers, all currently live | Direct comparison |
| G10 | Public messaging (README, `overkillhill.com/projects/bpmn-for-mermaid/`) is consistent and honest about prototype status; no overclaiming found | WebFetch of live page + README read |
| G11 | The application test suite and build reportedly passed as of the 2026-07-13 technology upgrade snapshot, but no rerun has been logged since, and `AGENTS.md` (2026-07-27) explicitly says current typecheck/build/test status "should still be verified before release" | `docs/technology-inventory.md`, `AGENTS.md` |
| G12 | `.agents/skills/*` (the separate 48-skill meta-tooling suite, out of scope for this product) carries pre-existing uncommitted local changes (~537 lines), confirmed pre-existing and unrelated to this directive | `git status --short`, prior session record |

---

## 3. What "done" actually means for the plugin milestone

The PRD (v0.3) goal, restated precisely: ship `bpmn-beta` as a Mermaid **External Diagram** plugin, verified against Mermaid's own render pipeline, before pursuing an upstream core PR.

Translate that into a testable Definition of Done. All of the following must be true, not claimed:

1. A test exists (Vitest, or Playwright if browser DOM is required) that:
   - imports the real `mermaid` package at the version named by `MERMAID_VERSION_TARGET` in `bpmn-plugin.ts`,
   - calls `mermaid.registerExternalDiagrams([bpmnPlugin])`,
   - calls `mermaid.render()` against at least two corpus examples (`01-linear-process.mmd` and `08-purchase-order-approval.mmd`, since one is flat and one exercises pools/lanes),
   - asserts the returned SVG contains the expected `bpmn-*` classes and throws no error.
2. That test runs in `ci.yml` and is a merge-blocking check, not an optional/manual step.
3. `docs/mermaid-compatibility.md` is updated to state, with the test file as citation, that this contract is verified, not "designed."
4. No README, homepage, or UI copy claims "works with Mermaid" beyond "adapter source exists" until steps 1–3 are done. (Current copy is already honest on this. Keep it that way until it's earned.)
5. Live theme-variable binding (FR-018, `getStyles()` reading `getConfig().themeVariables` at render time rather than a static fallback) is wired and covered by the same test, not left as a changelog claim.

Until all five are true, `bpmn-plugin.ts` is a design document that happens to be valid TypeScript. That's a fair thing to have built. It is not what "plugin path complete" means, and nothing should describe it that way in the meantime.

---

## 4. Phased build plan

This is sequenced on purpose. **Do not start Phase 2 before Phase 1's Definition of Done (Section 3) is met and merged. Do not start Phase 4 before Phases 1–3 are done.**

### Phase 0 — Verify the baseline (target: half a day)

Nobody should build on top of unverified claims. Before writing new code:

- Run `pnpm install`, `pnpm run typecheck`, `pnpm --filter @workspace/mermaid-diagram-bpmn run test`, and `pnpm run build` fresh, and log the actual output. Do not trust the "58/58" or "63 tests" figures cited in older docs without a fresh run.
- Run `pnpm run check:generated` and regenerate `pns-transitions-auto.ts` / `skill-deps-auto.ts` if stale (G6). Commit the diff.
- Reconcile G8: pick one versioning scheme. Recommended: keep `docs/version-checklist.md` as authoritative for the whole project (it already says so), and edit `app/docs/roadmap.md` to reference the V0.x numbers instead of maintaining a second, conflicting v0.0.x line. Log the reconciliation as a decision in `app/docs/decisions.md`.
- Fix G9: pick the one true pnpm version (whatever `pnpm-lock.yaml` / the root `package.json` actually resolves), and correct `AGENTS.md` and `docs/technology-inventory.md` to match. This is a five-minute fix that's been wrong across three docs simultaneously; fix it in all three at once.

**Exit criteria:** one commit that states, truthfully, what currently passes and what doesn't, with no follow-up doc contradicting another.

### Phase 1 — Prove the Mermaid integration end-to-end (the load-bearing phase)

This is the one that matters. Budget the most tokens and the most session time here, and expect it to be the riskiest, least predictable phase, that's exactly why it's been avoided for nine weeks.

- Add `mermaid` as a real devDependency (or peerDependency, matching the intended plugin distribution model) pinned to whatever `MERMAID_VERSION_TARGET` in `bpmn-plugin.ts` currently names.
- Write the host-validation test described in Section 3. Expect this to surface real bugs in the adapter (`bpmn-plugin.ts` has not been exercised against anything real since it was written).
- Fix whatever breaks. This is genuinely open-ended; don't let the agent quietly downscope it to "the adapter compiles" if the render call itself fails or produces invalid SVG.
- Wire live theme-variable binding (FR-018) so it's true, not just claimed in the changelog.
- Fix TD-004 (parser errors currently render as a blank playground preview, not an error message). This has been open since May, is small effort, and is the single highest-leverage user-facing fix available: right now a first-time visitor who mistypes DSL sees nothing and assumes the tool is broken.

**Exit criteria:** the Section 3 Definition of Done, fully met, merged to `main`, and cited by name in `docs/mermaid-compatibility.md`.

### Phase 2 — Close the deployment gate

- Add the same typecheck/test steps from `ci.yml` directly into `deploy-gh-pages.yml`, before the build step. Right now `ci.yml` only protects pull requests; a direct push to `main`, or a merge that skipped review, ships untested to the public URL (G4/TD-007).
- Cut the project's first real git tag and GitHub Release. Bump both `package.json` files off `0.0.0`. There is no version history right now despite 213 commits and a "V0.3 CURRENT" claim in the version checklist (TD-014).

**Exit criteria:** a broken `main` cannot reach `okhp3.github.io/mermaid-diagram-bpmn` anymore, and there's a tagged release to point at.

### Phase 3 — Debt paydown (only after Phases 1–2 are merged)

- TD-001: audit `package.json` imports and remove genuinely unused packages (Critical severity, explicitly blocks npm publish per the technical debt register's own severity key).
- TD-003/TD-012: extract the shape-drawing logic that's currently duplicated between `bpmn-renderer.tsx` (React) and `bpmn-plugin.ts` (imperative SVG) into a shared `src/lib/shapes/` module.
- TD-005/TD-006: renderer snapshot tests and layout regression tests, so the next nine-week gap in engine commits doesn't also mean nine weeks with no regression coverage.

### Phase 4 — Resume BP-SKILL suite work (only after Phases 1–3 are merged)

The suite itself doesn't need defending, it's good work. It needs to stop being what fills every session by default. Once the plugin claim is actually true, resume `docs/version-checklist.md`'s own V0.4/V0.5 plan (interactive pipeline diagram, `validate-pns.mjs`, eval suite expansion) on its own merits.

---

## 5. Guardrails (the "stop doing this by default" list)

- **No new SKILL.md content, no skills-browser UI polish, no new brand-token or theming work, no further documentation rewrites** until Phase 1's Definition of Done (Section 3) is committed and green in CI. If a session's first instinct is to reach for one of these, that's the drift this directive exists to interrupt.
- Any session that starts work without first running Phase 0's verification commands may not describe subsequent work as building on a "known-good" baseline.
- Any doc, commit message, or UI copy claiming a capability ("plugin works," "vX.Y shipped," "N/N tests passing") must cite the specific test, commit hash, or command output that proves it. Otherwise label it explicitly as unverified. This single rule would have caught most of the drift documented in Section 1.
- If a future session genuinely believes reordering this plan is right, say so explicitly in `app/docs/decisions.md` with a decision ID, the way every other tradeoff in this repo is recorded. Don't silently reprioritize.

---

## 6. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Phase 1 surfaces that the adapter's core approach doesn't actually satisfy Mermaid's `ExternalDiagramDefinition` contract, requiring a rewrite, not a fix | Medium | High | This is exactly why Phase 1 exists and why it's overdue. Better to find out now, in a bounded phase, than to keep building on an unverified foundation indefinitely |
| Another session defaults back to skill-suite work because it's more bounded and lower-risk | High (this is the observed pattern) | High | Section 5's guardrails; consider having Jamie personally gate the transition out of Phase 1 rather than letting an agent self-certify |
| Mermaid's actual API for `registerExternalDiagrams()` has changed since `bpmn-plugin.ts` was written in May | Medium | Medium | First step of Phase 1 is pinning and reading the real, current Mermaid source for the target version, not assuming the May-era contract still holds |
| Fixing TD-001 (dependency cleanup) breaks something that quietly depended on an "unused" package | Low | Medium | Do it after Phase 1/2 are stable, with the full test suite as a safety net, per the sequencing above |
| Reconciling the two versioning schemes (G8) turns into its own multi-day distraction | Low | Low | It's a five-minute decision (adopt `version-checklist.md`), not a redesign. Don't let it become one |

---

## 7. Prompts to hand to Replit directly

Copy-paste these in order. Don't combine them into one mega-prompt, the point is that Phase 0 finishes and reports back before Phase 1 starts.

**Prompt 1 (Phase 0):**
> Run `pnpm install`, `pnpm run typecheck`, `pnpm --filter @workspace/mermaid-diagram-bpmn run test`, and `pnpm run build` from a clean state and report the real output, not a cached or assumed result. Run `pnpm run check:generated` and regenerate any stale generated files, committing the diff. Then reconcile `app/docs/roadmap.md` against `docs/version-checklist.md`: `docs/version-checklist.md` is authoritative for version numbers per its own text, so update `app/docs/roadmap.md` to stop using a conflicting v0.0.x/v0.1.0 scheme and reference the V0.x numbers instead. Log this as a new entry in `app/docs/decisions.md`. Finally, find the one true pnpm version from `pnpm-lock.yaml` and correct `AGENTS.md` and `docs/technology-inventory.md` wherever they currently disagree. Report exact pass/fail status for every command before doing anything else.

**Prompt 2 (Phase 1, the important one):**
> `bpmn-plugin.ts` has never been validated against a real Mermaid instance. Add `mermaid` as a real dependency pinned to the `MERMAID_VERSION_TARGET` already named in that file. Write a test that imports real `mermaid`, calls `mermaid.registerExternalDiagrams([bpmnPlugin])`, and calls `mermaid.render()` against `01-linear-process.mmd` and `08-purchase-order-approval.mmd`, asserting valid SVG output with the expected `bpmn-*` classes and no thrown errors. Fix whatever the adapter gets wrong when it meets real Mermaid for the first time, don't narrow the test until it passes trivially. Also wire live theme-variable binding in `getStyles()` so it reads `getConfig().themeVariables` at render time instead of a static fallback, and fix the playground so parser errors show an inline message instead of a blank preview (TD-004). Add the new test to `ci.yml` as a blocking check. Update `docs/mermaid-compatibility.md` to cite the test by name as proof, not as a design intention.

**Prompt 3 (Phase 2, after Prompt 2 is merged):**
> Add the same typecheck and test steps from `ci.yml` into `deploy-gh-pages.yml` itself, before the build step, so a broken `main` can no longer deploy untested (currently only pull requests are gated). Bump both `package.json` files off `0.0.0` to `0.1.0`, and cut the project's first git tag and GitHub Release with real changelog notes.

---

## 8. Appendix: evidence detail

**Commit cadence by month (from `git log --format=%ad --date=short`):**

| Period | Active days | Approx. commits | What they were, per commit messages |
|---|---|---|---|
| 2026-05-09 to 2026-05-30 | Nearly daily | ~119 | DSL scaffold, parser, layout, renderer, plugin adapter, first 4-skill pilot, CVE patches |
| 2026-06-01 to 2026-06-26 | 9 scattered days | ~25 | Product-brief update, scattered fixes |
| 2026-07-09 to 2026-07-28 | 7 scattered days | ~13 | Technology upgrade (TS7/Vite8/Vitest4), AGENTS.md rewrite |
| 2026-08-01 to 2026-08-04 | 4 days | ~43 | okhp3- brand rename across 108 files, PNS lifecycle UI + tests, brand-token drift checks, this audit |

None of the commits after 2026-05-29 touch `bpmn-parser.ts`, `bpmn-db.ts`, `bpmn-layout.ts`, `bpmn-detector.ts`, or `bpmn-plugin.ts`.

**Files touched since 2026-08-01, outside `skills/`, `context/`, `docs/`, `evals/`, `.agents/` (i.e., outside the BP-SKILL/meta-tooling scope):** `.github/workflows/ci.yml`, `CONTRIBUTING.md`, `README.md`, `SECURITY.md`, `app/package.json`, plus generated mirrors under `app/public/`. Zero application-engine files.

**Deployment workflow comparison:**

| Workflow | Trigger | Runs typecheck? | Runs tests? | Gates what? |
|---|---|---|---|---|
| `ci.yml` | `pull_request` to `main` | Yes | Yes (app + skills) | PRs only |
| `deploy-gh-pages.yml` | `push` to `main` | No | No | Nothing, builds and deploys unconditionally |

This document and its findings are reproducible from the repository state as of 2026-08-04. If Replit's agent disputes a finding, the fix is to point at the specific file or command that contradicts it, not to revise the tone of this document.
