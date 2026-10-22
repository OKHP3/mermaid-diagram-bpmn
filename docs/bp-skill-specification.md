# BP-SKILL v0.3: implemented profile and draft reconciliation

Reconciled October 22, 2026 from the owner-supplied v0.1 working draft, source
skills, context files, generators, and executable validation. This document
describes the repository profile. It does not declare an endorsed industry standard.

## Source boundary

The [original v0.1 proposal](archive/bp-skill-working-draft-v0.1.md) is preserved
verbatim from the October 14 conversation titled "Review BP-SKILL Working Draft"
(thread `01a13cb1-577c-76a3-bd30-d731a5ff49f8`). Its claims, dates, market counts,
conformance promises, and staged recommendations remain historical proposals.
They are not implementation requirements or independently verified facts.

The current profile uses 15 pipeline skills, nine context templates, and
`pns.yaml` as the machine handoff, accompanied by human-readable Markdown.
The schema and executable rules are documented in [pns-schema.md](pns-schema.md).

## Skill reconciliation

| Draft capability | Current portable package |
|---|---|
| Intake and scoping | `okhp3-process-intake-and-scope` |
| Stakeholder and role identification | `okhp3-stakeholder-and-role-mapping` |
| Elicitation and interviews | `okhp3-elicitation-interviews` |
| As-is documentation | `okhp3-as-is-process-capture` |
| Process narrative | `okhp3-process-narrative-authoring` |
| BPMN visual modeling | `okhp3-visual-process-modeling` |
| Gap and exception analysis | `okhp3-process-gap-exception-analysis` |
| Validation and scoring | `okhp3-process-validation-scoring` |
| SOP and work instructions | `okhp3-sop-work-instructions` |
| RACI and governance | `okhp3-raci-governance-matrix` |
| SIPOC | `okhp3-sipoc-generation` |
| Publication and handoff | `okhp3-publication-handoff-packaging` |
| Performance measurement | `okhp3-process-measures-controls` |
| Decision extraction | `okhp3-decision-model-authoring` |
| Additional existing pipeline capability | `okhp3-future-state-change-strategy` |

The current decision skill produces `decision-model.yaml` and `dmn-table.md`.
The visual skill produces `bpmn-beta` text and SVG for the supported descriptive
subset. Neither output establishes full BPMN or DMN interchange conformance.
Simulation, mining import, XML interchange, telemetry, endorsement work, new
marketplace submissions, and new runtime dependencies are outside this reconciliation.

Four additional packages are outside the 15-member application catalog:
`okhp3-recurring-task-capture`, `okhp3-skill-promotion`,
`okhp3-bpmn-to-process-narrative`, and `okhp3-bpmn-recoverability-audit`.
The reverse-direction packages retain their existing recommended-extension status.

## Variable layer and metadata

The original eight context types remain represented by `organization-profile.md`,
`sector-context.md`, `regional-context.md`, `role-dictionary.md`,
`process-taxonomy.md`, `notation-preferences.md`,
`compliance-controls-registry.md`, and `integration-registry.md`.
The ninth existing template is `business-glossary-and-rulebook.md`.
Current templates use `document_type`, `schema_version`, `owner`, `last_reviewed`,
`applies_to`, and `applicability`; the draft's variable frontmatter was not adopted.

Agent Skills `metadata` values are strings. This repository serializes
`consumes` and `produces` as comma-separated artifact names, `depends_on` as
semicolon-separated skill names, and `standards_refs` as a descriptive string.
These are BP-SKILL conventions, not upstream typed input/output enforcement.
The format is portable; runtime availability, tool permissions, model behavior,
and engagement quality require evidence on each target host.

## Handoff and validation

PNS section keys are top-level siblings of the metadata. A `sections` wrapper
is not the current handoff contract. The nine lifecycle states run from
`draft-intake` through `published`; review approval belongs in `approval_state`.
The download generator and artifact initializer use the same canonical YAML
template. Empty templates intentionally fail validation until authored.

| Rule | Implemented check | Severity |
|---|---|---|
| V1 | Required fields/sections, lifecycle, substantive core concepts, unresolved publication questions | Error |
| V2 | Activity descriptions and role references; sourced business rules | Error |
| V3 | Accountable/Responsible assignments and activity coverage | Error |
| V4 | Heuristics for singular activity descriptions | Warning |
| V5 | KPI formula and source presence | Error |
| V6 | Decision outcomes, referenced activities, and exception handling | Error |
| V7 | Control coverage or documented waiver | Warning |
| V8 | PIR completeness and narrative readiness | Error |
| V9 | Diagram structure heuristics when a diagram is supplied | Warning |

These meanings supersede the different V6-V9 numbering in the draft. V1-V7
come from the canonical authoring validator. The scoring skill bundles identical
copies of that validator and scorer; generated-drift checks reject disagreement.
Scores are recomputed from content. A score of 75 or higher cannot override
blocking errors, an unresolved publication question, or missing owner approval.

Automated checks do not establish APQC element existence in a cited release,
legal/regulatory compliance, standards certification, actual process performance,
or human acceptance. Review those separately with the relevant source and owner.

## Claim-to-source ledger

Sources retrieved October 22, 2026. Publishers are authoritative for their own
format, version history, or framework description. No restricted standards text
is reproduced.

| Claim | Tier | Evidence | Implication / next check |
|---|---|---|---|
| Agent Skills metadata is a string-to-string mapping; compatibility is optional | Confirmed | [Agent Skills specification](https://agentskills.io/specification) | Keep BP-SKILL serialization explicit; validate host behavior separately |
| DMN 1.4 formal adoption is April 2023 | Confirmed | [OMG version history](https://www.omg.org/spec/DMN/1.4/) | Correct the draft's March 2022 date in current descriptions |
| APQC describes PCF copying, publication, modification, and derivative works with attribution | Confirmed publisher statement | [APQC framework description](https://www.apqc.org/What-Are-the-Main-Types-of-Core-Business-Processes-and-How-Do-They-Impact-Overall-Performance) | Do not repeat a blanket no-redistribution claim; check each resource's own terms |
| The five CBOK phase names were supported by the earlier review | Previously source-reported; fresh access blocked | [ABPMP guide](https://www.abpmp.org/page/guide_BPM_CBOK), HTTP 403 on this retrieval | Use standards-aligned language; verify clause-level mappings against an authorized copy before claiming conformance |
| No competing skills existed; catalog/adopter counts establish market uniqueness | Unknown | The supplied draft has no reproducible survey ledger | Exclude these assertions from current positioning; a future survey needs dated queries, repositories, revisions, and inclusion criteria |
| agentskills.io offers a formal domain-extension plugin submission route | Unknown | [Official documentation index](https://agentskills.io/llms.txt) did not establish that program | Treat submission and endorsement as proposals requiring an actual published route |
| All hosts execute the suite identically | Unknown | Format compatibility does not supply a cross-host evaluation matrix | Do not make this guarantee |

## Acceptance boundary

This reconciliation is complete when one canonical example passes the authoring
validator and scorer, produces populated downstream artifacts, is accepted by the
full suite, and its CLI and generated-template regressions pass. Existing positive
and negative evaluation expectations must remain intact. Repository integration
and the final closeout receipt provide the commit and CI evidence.

Industry endorsement, external adoption, exhaustive ecosystem uniqueness, XML
conformance, and real engagement outcomes are not prerequisites for correcting
this repository contract and are not claimed by this document.
