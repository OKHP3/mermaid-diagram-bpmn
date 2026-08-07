# PRD-05: Upstream Readiness & Hardening Directive
## BPMN for Mermaid (`OKHP3/mermaid-diagram-bpmn`)

| Field | Value |
|---|---|
| Doc owner | Jamie Hill (OverKill Hill P³), audit and directive by Claude |
| Prepared for | Replit agent (execution) and Jamie (approval) |
| Status | **[PARTIALLY EXECUTED — 2026-08-04/06]** Phase A complete. Phases B–E remain as forward guidance. Superseded for active planning by PRD-06; this document is now a historical record of Phase A execution and an input to PRD-06. |
| Date | 2026-08-04 |
| Verified against | GitHub HEAD `1ba3518` (276 commits), re-cloned and independently run, not read from docs alone |
| Relates to | `app/docs/prd.md` (v0.3), `docs/version-checklist.md`, `docs/strategy.md`, `app/docs/PRD-03-plugin-convergence-directive.md`, the informal "PRD-04" work (package boundary + demo route, referenced in commits and `docs/capability-ledger.md` but never written as its own document — Phase A below fixes that) |
| Supersedes | Nothing formally. Corrects one claim from the PRD-03 verification pass (Section 1a below). |
| Succeeded by | [PRD-06](PRD-06-product-convergence-and-distribution-experience.md) is the current active build directive (2026-08-06). Upstream readiness items from this document remain valid; PRD-06 adds the product convergence and distribution experience scope. |

---

## 0. How to use this document

PRD-03 closed the gap that mattered most: does the plugin actually work against real Mermaid. It does, verified independently, not on anyone's word. This document is the next step: what "done" means for the *original* goal, not just the plugin-works milestone, and the sequenced path to get there.

Same rule as PRD-03: phases are ordered on purpose. Don't start Phase C before Phase B is merged. Every capability claim in this repo must keep citing the test, tag, or command output that proves it, exactly the discipline `docs/capability-ledger.md` and the technical debt register already demonstrate. Keep doing that. It's working.

---

## 1. Where things actually stand

PRD-03 flagged that the Mermaid plugin integration had gone unverified for nine weeks while 130+ commits went into the BP-SKILL suite instead. That gap is now closed, and closed for real. Independently re-cloning the repo and running the actual commands confirmed: `bpmn-plugin-integration.test.ts` genuinely imports real `mermaid@11.4.1`, calls `registerExternalDiagrams()` and `mermaid.render()` against both a flat and a pool/lane corpus example, and all 16 assertions pass. The deploy workflow now gates on typecheck, the full test suite, skill tests, and brand checks before anything reaches the public URL. A real `@okhp3/mermaid-diagram-bpmn` package now exists at `lib/bpmn-plugin/` with a proper ESM+CJS+types export map, builds to 19.63 kB (5.68 kB gzip), and passes a clean-install smoke test, 12/12 assertions, against the packaged artifact, not just the source. Parser errors now show inline in the Playground instead of a blank preview. Good work, verified, not asserted.

**Correction to the record:** the PRD-03 verification pass reported no git tag existed. That was wrong, and it was wrong because of an incomplete `git fetch` on my end, not because of anything missing in the repo. `git ls-remote --tags` and the GitHub Releases page both confirm `v0.1.0` was tagged and released (pre-release) at the same timestamp as the "cut first release" commit. TD-014 is genuinely resolved. Correcting this here rather than letting a wrong finding stand, since the whole point of this exercise is not treating any claim, including my own, as true without checking it.

**One live fact that changes the plan:** Mermaid issue #7699 (the DFKI BPMN proposal that `bpmn-beta` has been positioned against since DEC-005/DEC-012) has moved since the project's last research pass. It's now labeled `Status: Approved`, `Required Grooming`, `Type: New Diagram`, `Contributor needed`. No PR is linked, and there's no visible further activity from the original proposer beyond the May comment. Translation: Mermaid's maintainers have approved the *concept* of a BPMN diagram type, nobody has landed code yet, and the seat is open. That's a real, time-sensitive opening, and it changes the sequencing recommendation in Section 4.

**One real gap remains, and it's cosmetic, not substantive:** `docs/version-checklist.md`'s own V0.6 section (Mermaid plugin packaging) still shows every box unchecked and status `[PLANNED]`, while `app/docs/roadmap.md` says "V0.6 Done, 2026-08-04, via PRD-04." Given everything verified above, the work supports checking those boxes. It reads like the team updated `roadmap.md` and the debt register but forgot to flip `version-checklist.md`'s own checklist for V0.6. Small, but `version-checklist.md` is the file that says it wins when the two disagree, so it should be corrected, not the other way around.

---

## 2. Ground truth ledger (re-verified 2026-08-04, HEAD `1ba3518`)

| # | Fact | Status | Evidence |
|---|---|---|---|
| R1 | `bpmn-plugin.ts` works against real Mermaid | **Confirmed** | Ran `bpmn-plugin-integration.test.ts` myself: 16/16 pass, real `mermaid@11.4.1` |
| R2 | Deploy gate closed | **Confirmed** | Read `deploy-gh-pages.yml` directly: typecheck + tests + skill tests + brand checks all run before build/deploy |
| R3 | Plugin is an installable package, not just source | **Confirmed** | `pnpm --filter @okhp3/mermaid-diagram-bpmn run build` + `scripts/run-plugin-smoke.mjs`: 12/12 pass against the packed tarball |
| R4 | v0.1.0 tagged and released | **Confirmed** (corrects a prior false negative) | `git ls-remote --tags origin`, GitHub Releases page |
| R5 | pnpm/version doc drift (G8/G9 from PRD-03) | **Confirmed resolved** | `AGENTS.md`, `package.json`, `docs/technology-inventory.md` all read `pnpm@10.26.1`; `roadmap.md` formally defers to `version-checklist.md` (DEC-021) |
| R6 | Generated file staleness (G6 from PRD-03) | **Confirmed resolved** | `node scripts/extract-pns-transitions.mjs --check` → "up to date" |
| R7 | TD-001 (40+ unused deps, Critical, blocks npm publish) | **Still open** | `app/docs/technical-debt-register.md`, not yet reached — correctly sequenced, this document's Phase B |
| R8 | TD-003/TD-012 (duplicated shape logic) | **Still open** | Same source |
| R9 | TD-005/TD-006 (no snapshot/layout regression tests) | **Still open** | Same source |
| R10 | `version-checklist.md` V0.6 checkboxes vs `roadmap.md`'s "Done" claim | **Resolved 2026-08-04** (Phase A) | `docs/version-checklist.md` V0.6 now shows `[DONE]` with inline evidence citations; `app/docs/roadmap.md` defers to version-checklist per DEC-021 |
| R11 | "PRD-04" has no physical document | **Resolved 2026-08-04** (Phase A) | `app/docs/PRD-04-plugin-convergence.md` created — retrospective record of all five plugin-convergence phases |
| R12 | Mermaid issue #7699 status | **Changed since last research pass** | Live fetch: `Status: Approved`, `Required Grooming`, no linked PR, `Contributor needed` label present |
| R13 | Bundle size | **Better than target, undocumented** | Real build output: 19.63 kB / 5.68 kB gzip (mjs), 16.42 kB / 5.20 kB gzip (cjs) — comfortably under both the original NFR (<200 kB) and the V0.8 target (<50 kB gzip), but `version-checklist.md` V0.8 still shows this unchecked |
| R14 | `CODE_OF_CONDUCT.md` | **Missing** | Named in V0.8's checklist, not present in repo root |

---

## 3. What "the original goal" actually means

Worth restating precisely, because it's easy to declare victory at R1–R4 and stop. The PRD (v0.3) goal was never "have a plugin that works." It was:

> Ship as External Diagram plugin first; upstream later. Pass Mermaid PR gates: tests, accessibility, theming, docs.

`docs/version-checklist.md`'s own V1.0 definition is explicit:

- A formal PR open at `mermaid-js/mermaid` proposing `bpmn-beta` as a core diagram type.
- BP-SKILL v1.0 published as a standalone npm package.
- DSL spec frozen, no breaking syntax changes without a major version bump.
- Full plugin documentation written for Mermaid maintainers.
- All v0.x completion criteria met.

R1–R4 got the project to "the plugin is real and provably works." That's V0.6. The original goal is V1.0: a live upstream PR, reviewed by Mermaid's own maintainers, with a realistic shot at landing. Those are different bars. Everything in Section 4 is about closing that remaining distance, not re-litigating what's already done.

---

## 4. Phased plan

### Phase A — Close the books ✅ COMPLETE (2026-08-04/06)

All Phase A items were executed as of 2026-08-06. `docs/version-checklist.md` V0.6 is [DONE] with evidence citations; `app/docs/PRD-04-plugin-convergence.md` exists; V0.8 bundle-size box is checked; `CODE_OF_CONDUCT.md` is in the repo root; TD-004 (parse errors) is resolved 2026-08-05. The items below are preserved as the historical record of what Phase A required.

Small, cheap, and it's the discipline this whole project has been earning back since PRD-03. Do it before anything else so the record is clean going into Phase B.

- Fix `docs/version-checklist.md`'s V0.6 section: check the boxes that R1–R3 above actually satisfy (`registerExternalDiagrams()` integration, theme binding, plugin entry point, demo page), citing the specific test/commit for each, and flip status from `[PLANNED]` to `[DONE]`.
- Write `app/docs/PRD-04-plugin-packaging.md` (or fold it into this repo's doc set under whatever name fits) documenting what the informal "PRD-04" work actually did, since right now it only exists as commit-message archaeology and a capability ledger. Future sessions shouldn't have to reconstruct it from `git log`.
- Document the real bundle-size number (R13) in `docs/version-checklist.md` V0.8 and check that box.
- Get a real screenshot or browser-based confirmation of the Playground's inline parse-error display (TD-004 is marked open pending exactly this, and it's a five-minute check now that the code exists).
- Add `CODE_OF_CONDUCT.md` (R14), a V0.8 requirement, small effort.

### Phase B — Debt paydown (this is PRD-03's original Phase 3, still not started)

- TD-001: audit `app/package.json` imports, remove what's genuinely unused. Marked Critical, explicitly blocks npm publish per the register's own severity key. This has been open since May 21st across three PRDs now; it should not survive a fourth.
- TD-003/TD-012: extract the shape-drawing logic duplicated between `bpmn-renderer.tsx` and `bpmn-plugin.ts` into a shared `src/lib/shapes/` module.
- TD-005/TD-006: renderer snapshot tests and layout regression tests, so the next stretch of feature work doesn't silently regress the thing that just got proven to work.
- TD-010: typed `ParseError` (line, column, message, code) instead of plain strings, now that parse errors are actually surfaced (TD-004), make them structured.

### Phase C — Public-readiness quality gates (`version-checklist.md` V0.8)

- Publish the full BPMN 2.0.2 Descriptive Conformance Sub-Class element matrix (the raw material already exists in `app/standards/bpmn-spec-reference.md` and the OMG spec PDF in-repo; this is a synthesis task, not new research).
- Accessibility audit: WCAG 2.1 AA pass on rendered SVG output. TD-011 and TD-017 (per-element `aria-label` on SVG node groups) belong here; per-diagram accessibility (`accTitle`/`accDescr`) already works, per-element does not yet.
- Dependency and license audit, folds naturally out of Phase B's TD-001 work.
- LLM benchmark prompts: identical prompts run across ChatGPT, Claude, Gemini for `bpmn-beta` generation accuracy. This is genuinely differentiating evidence, `app/docs/competitive-landscape.md` already cites the Mermaid-favorable LLM-generation research (arXiv 2507.11356, MermaidSeqBench) as a legitimate positioning angle; a `bpmn-beta`-specific number would make that claim concrete instead of borrowed.

### Phase D — Engage on #7699 now, not after Langium (this reorders the original roadmap, deliberately)

The original roadmap sequenced community engagement (V0.9) after the Langium grammar rewrite (V0.7). That made sense when #7699 was sitting untouched in Triage. It's now `Approved` and in `Required Grooming` with a `Contributor needed` label and zero linked PRs. That's a live opening, and there's no evidence the DFKI side has shipped anything beyond the original comment. Waiting for a full Langium rewrite before saying anything risks either losing the opening to a second mover or spending weeks on grammar work whose exact shape the maintainers might want to weigh in on anyway.

Recommended order:
- Post on #7699 now: reference the working, tested, packaged prototype (link the repo, the demo route, the two-syntax side-by-side comparison already drafted in `competitive-landscape.md` §5.1). Frame it per DEC-012, complementary alternative, not a rejection of the existing proposal. Bring code, not opinion, exactly as `competitive-landscape.md` §4.4 already recommends.
- Use whatever maintainer response comes back to inform whether Phase E's grammar work should be Langium, a hardened hand-written parser, or something the maintainers specifically ask for. Don't guess that in isolation.
- In parallel, not blocking: get real-world example coverage (V0.9's "at least 3 real-world process examples, not purchase-approval" requirement), list in the agentskills.io directory, publish the comparison matrix against PlantUML/bpmn.io/Visio/Mermaid-flowchart (inputs already exist in `competitive-landscape.md` §5).

### Phase E — V1.0: the actual PR

- Only after Phase D produces a maintainer signal: formalize the grammar (Langium per DEC-013, or whatever the maintainer conversation indicates), freeze the DSL spec, write the plugin documentation Mermaid maintainers actually need to review a PR, and open it.
- BP-SKILL v1.0 as its own published npm package (`@okhp3/bp-skill`) can proceed on its own timeline; it doesn't block the Mermaid PR and shouldn't wait for it.

---

## 5. Guardrails

- The BP-SKILL/UI-polish drift PRD-03 flagged is a lower risk now that the load-bearing item is done and verified, but the pattern shouldn't be assumed gone. If a session's next instinct is another round of skill-browser polish before Phase A/B here land, that's the same gravity reasserting itself.
- Every new capability claim keeps citing its test, tag, or commit, no exceptions. This project has now demonstrated it can do this well (`docs/capability-ledger.md`, the debt register's resolution notes), keep it as a standing rule, not a one-time discipline for the PRD-03 response.
- Don't start Phase E token/time investment (a Langium rewrite is not small) before Phase D produces an actual maintainer signal on #7699. That ordering is the whole point of this document's one deliberate deviation from the original roadmap.

---

## 6. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| #7699 gets claimed by another contributor before Phase D's outreach happens | Medium | Medium | Phase D's first bullet is cheap and fast (a comment, not a PR); do it before Phase B/C finish, it doesn't need to wait |
| Maintainers respond to Phase D with requirements that make Phase B/C work partially moot | Low-Medium | Low | Better to find that out before a Langium rewrite than after |
| TD-001 cleanup breaks something that quietly depended on an "unused" package | Low | Medium | Full test suite (403 tests) plus the new integration/smoke tests are the safety net; run them after cleanup, not just before |
| Phase A's paperwork gets skipped because it feels like busywork next to Phase B/C/D | Medium | Low | It's an hour of work and it's what keeps the next audit from re-finding the same discrepancy this document just corrected |

---

## 7. Prompts to hand Replit

**Prompt 1 (Phase A):**
> Sync `docs/version-checklist.md`'s V0.6 section to match verified reality: `bpmn-plugin-integration.test.ts` (16/16 passing), the `deploy-gh-pages.yml` test gate, and the `@okhp3/mermaid-diagram-bpmn` package at `lib/bpmn-plugin/` together satisfy V0.6's criteria. Check the boxes, cite each one, flip status to `[DONE]`. Write down the "PRD-04" work (package boundary, demo route) as an actual document since it currently only exists in commit messages and `docs/capability-ledger.md`. Document the real bundle size (19.63 kB / 5.68 kB gzip) against the V0.8 target and check that box. Add `CODE_OF_CONDUCT.md`. Take a real screenshot or browser-run confirmation of the Playground's inline parse-error display and update TD-004's status from Open to Resolved with that evidence attached.

**Prompt 2 (Phase B):**
> Audit `app/package.json` for genuinely unused dependencies (TD-001, Critical, blocks npm publish) and remove them, verifying nothing breaks against the full test suite. Extract the shape-drawing logic duplicated between `bpmn-renderer.tsx` and `bpmn-plugin.ts` into a shared `src/lib/shapes/` module (TD-003/TD-012). Add renderer snapshot tests and layout regression tests for all corpus examples (TD-005/TD-006). Define a typed `ParseError` (line, column, message, code) replacing the current plain-string errors (TD-010).

**Prompt 3 (Phase D, can run in parallel with Phase B, don't wait):**
> Post a comment on `mermaid-js/mermaid` issue #7699 referencing the working `bpmn-beta` prototype: the repo, the live demo route, and a short side-by-side syntax comparison against the DFKI proposal (material already drafted in `app/docs/competitive-landscape.md` §5.1). Frame it as a complementary alternative per `docs/decisions.md` DEC-012, not a rejection of the existing proposal. Do not commit to a specific grammar rewrite in that comment; the point is to get a maintainer read before Phase E's larger investment.

---

## 8. Appendix: what changed in this re-evaluation vs PRD-03

- PRD-03's central finding (plugin unverified since May 29) is resolved, independently confirmed, not just accepted on commit-message say-so.
- PRD-03's claim of a missing git tag was itself wrong, caused by an incomplete `git fetch` on the verifier's end. Corrected here (Section 1, R4).
- New information not available when PRD-03 was written: issue #7699 moved from `Triage` to `Approved`/`Required Grooming` with a `Contributor needed` label. This is the basis for Section 4's Phase D reordering.
- Remaining real gaps are narrower and lower-stakes than PRD-03's: a doc-sync discrepancy (R10), a missing retroactive document (R11), and the debt-paydown/quality-gate work that was always going to come after the plugin integration, not a repeat of the original scope-drift problem.
