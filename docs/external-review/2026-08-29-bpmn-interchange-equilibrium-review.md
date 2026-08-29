# Equilibrium review: BPMN-to-process narrative extension

**Review date:** 2026-08-29  
**Artifact reviewed:** User vision, the last three-turn peer exchange, and the
current BP-SKILL contracts in this repository  
**Decision question:** What is the smallest defensible new-skill set for a
trustworthy text/visual business-process interchange?

## Decision

**Approve with limits for a pilot-grade single skill. Defer a second
reconciliation skill.**

Create `okhp3-bpmn-to-process-narrative` as a recommended extension. It closes
the currently missing reverse direction for textual `bpmn-beta` source by
producing an explicitly incomplete, provenance-bearing observation and an
optional PNS-shaped draft. It must not claim that a bare diagram contains the
full evidence of an elicited process narrative.

The reviewers agreed that three new skills would fragment an unsettled contract.
They disagreed on whether reconciliation deserves its own package immediately.
The negotiator resolved that disagreement in favor of one pilot because the
repository's PNS contracts are inconsistent and no live reverse-conversion
evidence exists yet. A second skill becomes justified if repeated paired-source
work demonstrates a distinct conflict-resolution workflow and release gate.

## Independent review record

| Role | Decision | Material finding |
|---|---|---|
| Evidence reviewer | `defer-for-evidence` | One reverse reconstruction skill is justified; a separate validator is conditional on pilot evidence. |
| Outcome reviewer | `approve-with-limits` | Reconstruction and reconciliation are different user journeys; two packages may eventually be justified. |
| Safety and portability reviewer | `approve-with-limits` | Restrict the portable core to textual `bpmn-beta`; image interpretation must be provisional and human-confirmed. |
| Negotiator | `approve-with-limits` | Create one pilot-grade reverse skill now; defer a separate reconciliation skill. |

The reviews were conducted in separated subagent contexts using the repository
guidance and relevant source files. They were analytical design reviews, not
live task-quality benchmarks or independent release evidence.

## Claim ledger

| ID | Claim | Status | Evidence | Consequence if false | Next check |
|---|---|---|---|---|---|
| CLM-01 | The current suite is primarily forward-only: process evidence becomes a PNS, diagram, SOP, or governance output. | Supported | `skills/okhp3-process-narrative-authoring/SKILL.md`; `skills/okhp3-visual-process-modeling/SKILL.md` | Visual-first users cannot reliably recover documentation. | Run a diagram-only reconstruction pilot. |
| CLM-02 | A bare diagram cannot establish all PNS fields. | Supported | `docs/pns-schema.md`; `skills/okhp3-visual-process-modeling/SKILL.md` | Roles, controls, KPIs, rationale, and approvals may be fabricated or overstated. | Run a field-level recoverability comparison. |
| CLM-03 | One bounded reverse-reconstruction skill can advance the vision without replacing existing skills. | Provisional | `docs/bp-skill-overview.md`; existing intake, narrative, and visual contracts | A broad monolith could duplicate the full pipeline and create trigger collisions. | Test routing and output contracts on normal and lossy fixtures. |
| CLM-04 | Reconciliation may become a distinct future skill, but is not yet required for the first pilot. | Disputed / provisional | Review disagreement; `skills/okhp3-process-validation-scoring/SKILL.md` | Immediate package splitting may encode unstable contracts. | Add paired conflicting-source cases and measure repeated conflict work. |
| CLM-05 | Stable trace metadata belongs in visual modeling and packaging, not a third trace skill. | Supported | `evals/bpmn-traceability/rubric.md`; visual-modeling skill | Reverse observations lose source linkage. | Test PNS IDs, source lines, and sidecar metadata through generation and reconstruction. |
| CLM-06 | Release readiness is not established for the new skill. | Blocked | No live benchmark, unseen holdout, or reverse implementation evidence | Public claims could exceed demonstrated behavior. | Run development cases, protected holdout, and independent review. |

## Required limits

- The supported primary input is textual `bpmn-beta` source.
- SVG or raster images are blocked without host image capability and remain
  provisional even when a capable host can inspect them.
- A reconstructed output is a draft observation, not an approved or validated
  PNS.
- `encoded`, `inferred`, `not-encoded`, `unknown`, and `conflict` must remain
  visible at field and entity level.
- No silent overwrites or conflict resolution by recency or plausibility.
- The claim is loss-bounded, evidence-traceable reconstruction, not literal
  lossless conversion.

## Follow-up conditions

1. Resolve the repository's competing PNS schema/lifecycle descriptions before
   claiming suite-wide interoperability.
2. Add stable PNS trace comments to forward diagram generation, as documented in
   `skills/okhp3-visual-process-modeling/SKILL.md`.
3. Run the new package's normal, lossy, malformed, and image-boundary cases.
4. Create a second reconciliation skill only after paired conflicting-source
   work demonstrates a distinct repeatable job and acceptance gate.

