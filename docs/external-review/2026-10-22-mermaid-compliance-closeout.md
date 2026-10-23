# Mermaid compliance audit reconciliation: October 22, 2026

## Decision and source boundary

The supplied "Compliance Audit Against Official Mermaid Directives" was useful
input, but its Langium requirement and upstream timing are outdated. Keep the
published external plugin and coordinate with the existing upstream BPMN work.
This reconciliation does not schedule a parser rewrite, change the detector id,
upgrade Mermaid, publish npm bytes, or authorize a separate Mermaid core PR.

The October 14 conversation verified the supplied audit without editing files.
Its remaining recommendations were documentation reconciliation and dependency
refresh before claiming current compatibility. The October 22 owner request
authorizes completing those items, integration, scoped cleanup, and a receipt.
Available conversation and repository records were reviewed; no omitted or
inaccessible older history is claimed to have been audited.

## Verified claim reconciliation

| Claim | Tier and current evidence | Consequence |
| --- | --- | --- |
| New upstream parsers must use Langium | Confirmed correction: the current contribution guide targets co-located Chevrotain and uses the use-case diagram as its reference. Existing Langium and JISON diagrams remain supported. [S1] | Supersede DEC-013's premise; keep a future migration conditional on upstream direction. |
| `BPMNDiagram` must become `bpmnDiagram` | Confirmed correction: the guide explicitly accepts an uppercase acronym in an accessible diagram id. The current detector and standard use `BPMNDiagram`. [S1] | Keep the existing public id; lowercase naming is optional. |
| Mermaid 11.15.0 is current and ELK requires a separate package | Confirmed correction: npm reports Mermaid 12.2.0. ELK became bundled in the main package at v12, with a tiny-build exception. [S2, S3] | Scope runtime claims to this repository's pinned 11.17.2; no v12 compatibility is inferred. |
| The project still needs package, theme, and accessibility integration | Confirmed correction: `lib/bpmn-plugin`, `bpmn-styles.ts`, `BpmnDb` accessibility methods, package smoke, and strict-browser host tests already exist. | Verify existing paths instead of implementing them again. |
| #7699 is in triage and an upstream proposal should race it | Confirmed correction: #7699 is open with Approved and Required Grooming labels. #8160 tracks an active series; #8166 and #8167 are open and unmerged. [S4-S7] | Coordinate on syntax and core-versus-external distribution. The series' acceptance remains unknown. |
| Upstream requires a specific historical Cypress/Argos recipe | Confirmed correction: the current checklist specifies parser/db tests, `.mmd` visual fixtures, documentation-example tests, docs/demo/examples, configuration and release metadata. [S1] | Follow the target branch's current contribution checklist when core work is agreed. |
| The cited paper establishes this DSL's superiority | Confirmed boundary: it reports compactness for its evaluated Mermaid representation; BPMN text performs best on generation similarity. It did not evaluate this plugin. [S8] | Use it as motivation for text-first authoring, not validation of this syntax. |

The external `{ id, detector, loader }` registration shape, themed SVG output,
custom pool/lane layout, handwritten markers, and descriptive-subset scope remain
compatible architectural choices. They do not establish complete BPMN conformance
or Mermaid-core acceptance.

## Isolation review

Confirmed: `app/src/lib/bpmn-plugin.ts` owns a shared database and module-level
`_cachedThemeVars`. Database `clear()` does not reset that cache. The current
guide requires mutable render state on the database. [S1] Treat isolation,
viewport sizing, theme behavior, and configuration as core-review gaps. No
concurrent-render failure was demonstrated by this audit. The existing serialized
host path is the tested external-plugin contract; no runtime repair or core
readiness claim follows from this observation.

## Validation and diagnosis

The October 14 run used stale installed Mermaid 11.4.1 against a source target of
11.17.2. The October 22 isolated worktree restored the declared lockfile tree
and ran with Node 24.19.0 and pnpm 10.26.1. The pinned Mermaid version assertion
then passed. The first full run passed 865 tests but could not start three
asset tests because `lightningcss.darwin-arm64.node` was absent.

Root cause: workspace overrides removed macOS optional native packages for
Lightning CSS, Tailwind Oxide, esbuild, and Rollup. The repair restores their
existing arm64/x64 dependency declarations and updates the lockfile. It adds no
application library, changes no package version range, and preserves the other
existing overrides. Fresh frozen installation, typechecking, the build, and all 868 application
tests now pass. An intermediate run caught a version-heading format mismatch
introduced during this reconciliation; the heading was corrected without
changing the test. Failed and subsequent results are retained in the evidence
directory. The release gate reports GO-WITH-LIMITS, retaining browser-portability
limits; it is not an upstream acceptance or full conformance decision.

Local verification after repair:

| Check | Result |
| --- | --- |
| Frozen install and pinned Mermaid version | PASS: 11.17.2 installed |
| Application suite | PASS: 868/868 tests across 47 files |
| Typecheck and workspace build | PASS |
| Strict Chromium Mermaid host | PASS: 21/21 tests |
| Packed plugin consumer | PASS: 12/12 assertions |
| Content, version status, roadmap evidence, #7699 drift | PASS |
| Safety/portability release gate | GO-WITH-LIMITS: browser portability remains limited |

Exact hosted CI and integration identities are recorded in the
canonical clone's ignored `.local/closeouts/2026-10-22-mermaid-compliance/`
receipt. The application target remains Mermaid 11.17.2 and the published plugin
remains 0.1.1. Local tests, hosted CI, published package bytes, browser results,
and upstream acceptance are separate evidence surfaces.

## Ownership, preservation, and exclusions

The verified repository is `OKHP3/mermaid-diagram-bpmn`; its canonical branch is
`main`. This audit started at `65888ca8a432bc63a2d2593485c1c61018bfac90`.
The canonical clone was clean, with no staged files, stashes, or nested Git
repositories. Its ignored dependency trees, generated assets, plugin output,
Finder metadata, and copied skill directory were retained. The unrelated local
Dependabot branch and remote maintenance/delegation branches were retained.

A sibling BP-SKILL thread was active in the canonical clone, so this work used
an attached isolated worktree. Its PNS and skill work is excluded. Open PRs
#95-#98 are unrelated dependency maintenance and are not merged by this thread.
The README references a Replit development surface, but this audit has no
Replit task, dispatched agent, checkout synchronization commitment, or deployment
acceptance requirement. No Replit agent, paid mode, or deployment was started.

## Primary-source ledger

All sources below were retrieved on 2026-10-22. Official project sources support
current guidance; issue and PR metadata establish status rather than acceptance.
Raw retrievals are retained with the local closeout evidence.

| ID | Source and publisher | Supported claim |
| --- | --- | --- |
| S1 | [Adding a New Diagram, Mermaid](https://mermaid.ai/open-source/community/new-diagram.html), checked against `develop` source | Parser, id, state, style, and contribution checklist guidance |
| S2 | [Mermaid npm registry](https://registry.npmjs.org/mermaid/latest) | Latest published version 12.2.0 |
| S3 | [Layouts, Mermaid](https://mermaid.ai/open-source/config/layouts.html) | v12 bundled ELK and tiny-build exception |
| S4 | [Issue #7699, Mermaid GitHub](https://github.com/mermaid-js/mermaid/issues/7699) | Open, approved, grooming required; updated 2026-09-28 |
| S5 | [Tracker #8160, Mermaid GitHub](https://github.com/mermaid-js/mermaid/issues/8160) | Active coordination point; updated 2026-10-20 |
| S6 | [PR #8166, Mermaid GitHub](https://github.com/mermaid-js/mermaid/pull/8166) | Implementation PR open and unmerged; reviewed head `4fc725c657b90aaa88a893c3542d1fd94dfb012d` |
| S7 | [PR #8167, Mermaid GitHub](https://github.com/mermaid-js/mermaid/pull/8167) | Documentation PR open and unmerged; reviewed head `629d4abbffabbcc5cd69041bcc07dca70550fe7e` |
| S8 | [Brissard, Cuppens, and Zouaq, arXiv:2507.11356](https://arxiv.org/html/2507.11356v1) | Compactness and generation results within the paper's evaluated representations |

## Remaining decisions

Maintainer selection of syntax and distribution path, a parser migration, full
BPMN conformance, independent adoption, and Mermaid 12 support remain future
project decisions. None is a condition for completing this bounded audit.
The next project action is to use current maintainer direction before scoping
core work; retain the external plugin's tested contract in the meantime.


## October 23 security-gate follow-up

The fresh PR check rejected the pinned DOMPurify 3.4.13 dependency with one
critical and one high advisory. A local audit reproduced the gate failure.
The existing override was updated to patched 3.4.17, following the maintainer's
[release](https://github.com/cure53/DOMPurify/releases/tag/3.4.17) and advisories
[GHSA-cg2g-xh64-v4q7](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cg2g-xh64-v4q7)
and [GHSA-mrv2-3pqr-j5jr](https://github.com/cure53/DOMPurify/security/advisories/GHSA-mrv2-3pqr-j5jr),
retrieved October 23. The npm audit classifies these as critical/high, while
the maintainer pages label them Low; both sources agree on patched 3.4.17.
The release gate and strict-browser compatibility checks
must pass on this updated source before integration. The October 22 results
above remain historical; final results belong to the closeout receipt. This
override changes the source application's resolved dependency, not previously
published Mermaid CDN bundles or plugin bytes.
