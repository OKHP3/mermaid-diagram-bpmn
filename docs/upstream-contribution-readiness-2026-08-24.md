# Upstream Mermaid Contribution Readiness — 2026-08-24 (reassessed 2026-08-26)

## Decision

**NO-GO for opening a Mermaid core pull request now.**  
**GO for maintaining a reviewable external-plugin proposal and preparing a
contribution packet.**

This is a project decision, not a prediction of Mermaid maintainer acceptance.
The current implementation is credible evidence for a narrowly scoped,
documentation-oriented external diagram, but the evidence is not yet sufficient
for a core contribution that would ask Mermaid to adopt a new public syntax and
long-term maintenance surface.

## Reassessment — 2026-08-26

**Decision unchanged: NO-GO for preparing or opening a competing Mermaid core
pull request.**
**Selected path: continue the external-plugin path and align with Mermaid issue
#7699.**

The live GitHub review gives useful upstream direction, but not an invitation
for this project to submit a second core implementation:

- Issue [#7699](https://github.com/mermaid-js/mermaid/issues/7699) remains open,
  labeled `Status: Approved`, `Contributor needed`, `Required Grooming`, and
  `Type: New Diagram`, with `updated_at` still `2026-08-05T19:07:08Z`.
- Mermaid collaborator `knsv` asked on #7699 on 2026-05-28 whether it should be
  merged with #2623. Mermaid collaborator `pbrolin47` then wrote on #2623 on
  2026-06-12 that #7699 was approved and that one contributor had volunteered
  to create an MVP PR. This supports alignment with the existing upstream
  effort; it is not an invitation to OKHP3 to open a competing PR.
- The six live #7699 comments include the OKHP3 prototype comment from
  2026-08-05, but no maintainer response to that comment or explicit
  invitation to this project. The repeatable `check:dfki-7699` check passes and
  confirms that the tracked issue source has not drifted.

Fresh local evidence improves the technical case without clearing the release
or portability blockers:

- The application suite passes **867/867 tests across 47 files**.
- The corrected real-browser run passes **86/86 Linux/Chromium E2E tests**,
  including Mermaid host rendering, SVG output, worked-example navigation, and
  the tested keyboard paths. Chromium launch preflight also passes.
- Firefox and WebKit cannot launch in this environment because their native
  system libraries are unavailable. No Firefox, WebKit, Windows, touch, or
  assistive-technology claim is inferred from the Chromium result.
- Automated accessibility and axe checks remain passing, but manual
  assistive-technology review and complete cross-browser interaction coverage
  remain unverified.
- The current release-gate report remains **NO-GO**. The license gate still
  records `Unknown` for the three Replit Vite plugins and `khroma`, and the
  DOMPurify record uses the unaccepted spelling `(MPL-2.0 OR Apache-2.0)`.
  Dependency high/critical findings are clear, but Mermaid `11.4.1` still has
  nine documented moderate/low advisory findings.
- The public release manifest remains the historical 2026-08-22 snapshot
  (including the older 839-test evidence), so a fresh `GO-WITH-LIMITS`
  manifest does not exist for this reassessment.

### Path decision

| Path | Decision | Reason |
|---|---|---|
| Prepare a focused Mermaid core PR now | **No** | No project-specific invitation exists, the approved #7699 effort is already the upstream coordination point, and release/portability conditions remain unresolved. |
| Align with issue #7699 | **Yes** | Keep the prototype visible as prior art, track the approved upstream MVP effort, avoid duplicating its syntax or PR, and seek maintainer direction before any core work. |
| Continue the external-plugin path | **Yes** | It is the reviewable, installable, evidence-backed path that does not claim Mermaid-core adoption or full BPMN conformance. |

The maintainer and linked-issue signals therefore narrow the next step rather
than promote the project to core-PR readiness. No PR should be opened or posted
automatically.

## Decision question and criteria

**Question:** Is BPMN for Mermaid ready to open or prepare an upstream Mermaid
contribution within its declared descriptive subset?

The contribution must be:

1. technically reviewable against a current Mermaid API;
2. explicit about supported syntax and exclusions;
3. safe and portable enough that its claims do not exceed its evidence;
4. supported by representative examples and a reproducible release record; and
5. framed as a proposal for maintainer review, not as accepted Mermaid
   functionality.

## Evidence packet

| Evidence | Current result | Evidence status and boundary |
|---|---|---|
| Maturity ledger | Core DSL, real Mermaid adapter, package smoke, generated BP-SKILL assets, and performance are supported within limits; browser interaction, external adoption, and mature positioning remain blocked or provisional | [Maturity Evidence Baseline](maturity-evidence-baseline-2026-08-22.md), refreshed interpretation; historical/current records remain distinct |
| Upstream issue | `pnpm run check:dfki-7699` passes; live GitHub review on 2026-08-26 still finds #7699 open, approved, and unchanged since 2026-08-05, with two author-authored fenced examples | **Live** source check; linked maintainer comments support alignment with #7699, but no direct invitation to this project is recorded |
| Real-world corpus | Employee onboarding, vendor collaboration, quote to order, and support ticket triage render through the authored descriptive subset | **Live/analytical** local evidence; illustrative fixtures are not independent adoption or BPMN-conformance evidence |
| Adoption proof | No independent users, third-party integrations, moderated first-visit outcome study, or maintainer endorsement | **Blocked**; do not infer adoption from local tests or npm availability |
| Safety/portability | Source/SVG checks, SAST, HoundDog, dependency high/critical remediation, build, and 867/867 application tests pass; the 2026-08-26 release report is `NO-GO` because license records remain unresolved and browser evidence is limited locally | [Safety and Portability Release Gates](release-gates.md); **Live** report command, with explicit limitations |
| Release manifest | Plugin `0.1.1`, Mermaid target `11.4.1`, compatibility range `>=10.0.0`, and dated evidence tiers are recorded | [release-manifest.json](../app/public/release-manifest.json); **Historical snapshot** generated 2026-08-22, must be regenerated for a release |
| CDN adoption path | Exact native-ESM Mermaid/plugin assets return 2xx and the standalone Chromium success/failure proof is present | **Live** check for the pinned pair only; not legacy script-tag, arbitrary-version, or live-editor proof |

## Falsification pass

| Strong reason not to proceed | Result | Consequence |
|---|---|---|
| Mermaid API or target-version drift makes the adapter non-reviewable | Current integration and compatibility records still match Mermaid `11.4.1`; the CDN check passes | This objection is not currently decisive, but any target upgrade requires a new integration/browser/CDN run |
| The proposed syntax claims exceed implemented syntax | Corpus and public documentation explicitly name deferred boundary/timer events, choreography, data objects, executable semantics, and XML interchange | Survives as a scope limit; the upstream proposal must use the descriptive subset, not “full BPMN 2.0” |
| Browser loading or SVG safety is unproven | Native-ESM CDN success/failure is browser-tested; SAST/HoundDog are clean; strict-security host output is covered | Partial counterexample survives: Firefox/WebKit launch evidence is environment-dependent locally, and AT/Windows evidence is absent |
| Accessibility is complete because automated checks pass | Automated SVG semantics and axe checks pass, but complete keyboard/touch/assistive-technology behavior remains unproven | Survives; accessibility claims must stay provisional |
| Maintainer position has changed since outreach | Linked issue review found maintainer direction to keep the approved #7699 MVP effort coordinated with #2623, but no direct reply to or invitation for OKHP3; the repeatable source check reports no issue drift | Survives; the project should align with #7699 and should not open a competing PR without project-specific maintainer direction |
| Release hygiene is complete because tests pass | The 2026-08-26 release gate is still `NO-GO` on unknown license records and an unaccepted DOMPurify license spelling; Mermaid 11.4.1 advisories remain documented | Survives; resolve license records and review the Mermaid upgrade path before a public core-PR claim |

The surviving counterexamples are material. They prevent a `GO` decision even
though the plugin itself is technically demonstrable.

## Smallest reviewable contribution contract

If the owner later receives a suitable maintainer signal, the first upstream
proposal should be limited to:

### Supported syntax

- `bpmn-beta` header and readable line-oriented node declarations;
- start/end events and MVP intermediate events as documented shapes;
- task nodes, including supported task markers;
- exclusive, parallel, and documented gateway forms;
- sequence, conditional/default, message, and association flows;
- pools and lanes;
- collapsed subprocess footprint with the documented bottom `+`;
- diagram title/description metadata and accessible SVG groups where supported
  by the host contract.

### Explicit exclusions

- full BPMN 2.0 conformance or executable semantics;
- BPMN XML import/export;
- bpmn-js or a graphical modeler runtime;
- choreography, correlation, runtime queues, ERP/CRM execution, and data-object
  semantics;
- unverified boundary/timer event behavior;
- legacy script-tag loading, arbitrary Mermaid versions, arbitrary loaders, and
  untested live-editor behavior;
- the BP-SKILL suite as a Mermaid-core dependency.

### Compatibility promise

The evidence-backed target is the external plugin contract used by Mermaid
`11.4.1`, with the published plugin `0.1.1` and the exact native-ESM CDN pair
documented in [Mermaid compatibility](../app/docs/mermaid-compatibility.md).
The existing `>=10.0.0` manifest range is not evidence that every Mermaid 10+
build has been tested; a core proposal must either narrow that claim or add
version-matrix evidence.

### Maintainer asks

1. Is an external-plugin prototype useful as the basis for a core diagram-type
   proposal, or should the work align directly with #7699?
2. Which syntax layer and grammar technology does Mermaid want contributors to
   target for a new diagram type?
3. What descriptive element subset and accessibility contract would be
   acceptable for an initial `bpmn-beta` contribution?
4. Which Mermaid release line should be used for compatibility and security
   review?
5. Should the project prepare a focused core PR, a design discussion, or only
   maintain the external plugin?

## Reopening conditions and exact next action

Reopen this decision when all of the following are true:

1. unknown license metadata is resolved or the affected dependencies are removed;
2. the pinned Mermaid target is reviewed for its advisories and the integration,
   browser, and CDN contract is rerun if it changes;
3. the outstanding browser interaction and accessibility evidence is either
   fixed and verified or explicitly narrowed in the public compatibility record;
4. a fresh release manifest and `GO-WITH-LIMITS` safety report exist for the
   proposed revision; and
5. a maintainer response or explicit invitation clarifies whether a core PR is
   wanted alongside #7699.

**Next action:** keep the external plugin and evidence packet reviewable, align
with the approved #7699 effort without duplicating its core PR, and complete the
license, release-manifest, browser, and accessibility evidence work before
reopening the core-contribution decision. Do not open or post an upstream PR
automatically.
