---
name: okhp3-bpmn-recoverability-audit
description: "Audit a diagram-derived pns.yaml — lacking a companion pir.yaml, typically from okhp3-bpmn-to-process-narrative — and produce an explicit recoverability report on what bpmn-beta grammar can and cannot structurally encode. Use when a PNS was reconstructed from a diagram rather than elicited; when you need to know which sections (KPIs, controls, business-rule rationale, RACI nuance beyond lane-as-owner) are genuinely unrecoverable from the diagram alone; or when a diagram-only reconstruction must not be silently treated as equivalent to an elicited PNS. Do not use it for full publication-readiness scoring — that is okhp3-process-validation-scoring's job, running V1-V9 including the hard V8 gate (pir.yaml completeness_score >= 70) a diagram-only PNS was never meant to satisfy. This skill gives a separate completeness_verdict (full, partial-diagram-derived, or insufficient) and routes gaps to okhp3-elicitation-interviews. Never marks a PNS ready_for_publication: true."
license: "MIT"
compatibility: "Reading the report and its recoverability table needs no special runtime. scripts/audit-diagram-fidelity.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, work through references/recoverability-boundary.md by hand against the pns.yaml under audit and say so in your output rather than presenting an unrun audit's verdict as machine-computed."
metadata:
  bp_skill_version: "0.3.0"
  status: "recommended-extension"
  version: "0.1.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-quality"
  standards_refs: "BPMN 2.0.2 Descriptive Conformance Sub-Class (OMG formal/2013-12-09); BABOK v3 §7.6 (Analyse Potential Value and Recommend Solution); BPM CBOK v4 §8 (Process Performance Management)"
  produces: "fidelity-report.yaml"
  consumes: "pns.yaml"
  depends_on: "okhp3-bpmn-to-process-narrative"
  tags: "recoverability-audit, diagram-derived, fidelity, gap-report, process-quality, reverse-modeling, provenance"
  triggers: "audit this diagram-derived PNS; what did the diagram actually give us; fidelity report; what can't be recovered from the diagram; is this reconstruction trustworthy; gap report for a reversed process; check narrative_provenance"
  homepage: "https://github.com/OKHP3/mermaid-diagram-bpmn/tree/main/skills/okhp3-bpmn-recoverability-audit"
  repository: "https://github.com/OKHP3/mermaid-diagram-bpmn"
---

# okhp3-bpmn-recoverability-audit

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Consume a `pns.yaml` that was reconstructed from a `bpmn-beta.mmd` diagram — most commonly the output of `okhp3-bpmn-to-process-narrative` — or, more generally, any `pns.yaml` that lacks a companion `pir.yaml` elicitation record, and produce an explicit, disclosed recoverability report. The report states which sections of that PNS have real diagram-grammar evidence behind them and which are structurally impossible for any diagram to have supplied, no matter how good the parser is.

This is **not** a duplicate of `okhp3-process-validation-scoring`. That skill's V8 rule is a hard, error-severity gate requiring `pir.yaml completeness_score >= 70` and `ready_for_narrative: true` — a bar that assumes elicitation happened. A diagram-only reconstruction was never meant to clear that gate, and running V1-V9 against one produces a misleadingly low (or, worse, silently patched-up) score rather than an honest account of what actually happened: nobody interviewed anyone, a diagram stood in for that work, and specific fields are genuinely unsupported as a result. This skill exists to give that situation its own, correctly-shaped assessment instead.

---

## When to use this skill

- A `pns.yaml` carries `narrative_provenance: "diagram-derived"` (set by `okhp3-bpmn-to-process-narrative`) and needs a disclosed completeness assessment before anyone treats it as a real process record
- A `pns.yaml` has no companion `pir.yaml` at all — regardless of how it was produced — and you need to know specifically what that absence costs
- You need the fixed boundary table of which PNS fields a `bpmn-beta` diagram's grammar can and cannot structurally carry, independent of any one PNS instance
- You need a routing recommendation (typically to `okhp3-elicitation-interviews`) that names the exact gaps a follow-up pass must close

## When NOT to use this skill

- The PNS already has a qualifying `pir.yaml` (`completeness_score >= 70`, `ready_for_narrative: true`): it is not diagram-only — run `okhp3-process-validation-scoring`'s full V1-V9 suite instead
- You want a 0-100 publication-readiness score or a `ready_for_publication` verdict: this skill never produces either; it produces a `completeness_verdict` of `full` / `partial-diagram-derived` / `insufficient` and nothing more
- Do not treat a `partial-diagram-derived` verdict as "close enough" to publish: the disclosed gaps must be filled (normally via `okhp3-elicitation-interviews`) and then `okhp3-process-validation-scoring` run for real before publication

---

## The recoverability boundary

`bpmn-beta` grammar has dedicated elements for process *shape* — tasks, sequence flows, gateways, branch labels, lanes, pools, start/end/error events — and no elements at all for process *rationale, governance, or measurement*. Concretely:

| Genuinely recoverable (yes/partial) | Genuinely unrecoverable (no) |
|---|---|
| Task labels → `activity_sequence.activities[].description` | KPI `formula` / `data_source` — no measurement concept exists in the grammar |
| Flow order → activity sequence | `controls_and_compliance` detail — governance narrative, no grammar channel |
| Lane/pool assignment → a partial role/ownership signal, **not** a full RACI | `business_rules` rationale/source text |
| Gateway labels + branch labels → `decision_points` and `outcomes[]` | Most of `raci_matrix[]` — accountable vs. responsible vs. consulted vs. informed, beyond "whoever owns the lane" |
| Start/end/error events → `process_box` trigger/outputs, and that an exception path exists | Exception `handling` / `escalation_path` detail |
| — | `babok_core_concepts`, `open_questions`, `revision_history`, `validation` — narrative and meta fields with no diagram equivalent at all |

The full field-by-field table, with the reasoning behind every row, lives in `references/recoverability-boundary.md` — it is the single most important reference file in this skill and the actual intellectual content behind the report.

---

## Fidelity report contents

`fidelity-report.yaml` contains, at minimum:

- `source_pns`: the audited PNS's `process_id` and `title`, and its `narrative_provenance` value
- `recoverable_from_diagram[]`: PNS fields/sections a `bpmn-beta` diagram's own grammar CAN structurally encode, each with its `diagram_signal` and any `caveat`
- `unrecoverable_from_diagram[]`: PNS fields/sections that CANNOT be recovered from diagram grammar alone, each with a `reason`, plus a `populated_in_this_pns` flag — when a nominally unrecoverable field is populated anyway, that is a fabrication-risk warning, not a pass
- `completeness_verdict`: one of
  - `full` — a real, qualifying `pir.yaml` exists; this PNS is not actually diagram-only
  - `partial-diagram-derived` — the expected case for a `okhp3-bpmn-to-process-narrative` output: real diagram signal exists, real gaps exist, both disclosed
  - `insufficient` — the source diagram itself is too sparse (no activities, no lanes) to support a meaningful audit at all
- `recommended_next_action`: a routing instruction naming the specific unrecoverable fields — normally "route to `okhp3-elicitation-interviews` for a targeted follow-up pass covering: {list}" — never "ready for publication"
- `validation_boundary_notice`: a fixed statement that this report is not a substitute for `okhp3-process-validation-scoring`'s V1-V9 suite

---

## Workflow

1. **Read the PNS.** Load `pns.yaml`. Note `narrative_provenance` and any `unrecoverable_fields` markers the producing skill already attached.
2. **Check for a real PIR.** If a `pir.yaml` exists and qualifies (`completeness_score >= 70`, `ready_for_narrative: true`), this PNS is not diagram-only: set `completeness_verdict: full` and redirect to `okhp3-process-validation-scoring` rather than continuing this audit.
3. **Classify every section against the boundary table.** For each row in `references/recoverability-boundary.md`, decide whether the field is populated in this PNS and bucket it into `recoverable_from_diagram` or `unrecoverable_from_diagram` accordingly. Honor any `unrecoverable_fields` the producing skill already declared; flag any that don't match the known table for review.
4. **Flag contradictions, don't resolve them silently.** A diagram-derived tag alongside a qualifying PIR, or a nominally unrecoverable field that's populated anyway, is a warning to surface — not a discrepancy to quietly patch over.
5. **Set the verdict and the next action.** Use `insufficient` when the diagram itself gave too little to work with, `partial-diagram-derived` for the normal case, `full` only when a real PIR makes this audit moot. Name the specific gaps in `recommended_next_action`.
6. **Validate with the script.** Run `scripts/audit-diagram-fidelity.mjs` (or call `auditDiagramFidelity` directly) and report its `errors`/`warnings` alongside the report.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/audit-diagram-fidelity.mjs` cannot run, work through `references/recoverability-boundary.md` by hand against the pns.yaml under audit, and state in the output that the scripted audit was not executed.

## References

Load on demand:
- `references/recoverability-boundary.md`: the definitive PNS-field-by-field recoverability table with the reasoning behind every yes/partial/no rating

## Scripts

- `scripts/audit-diagram-fidelity.mjs`: classifies a pns.yaml's sections against the recoverability boundary and returns a fidelity-report.yaml-shaped object with `completeness_verdict` and `recommended_next_action`

## Assets

- `assets/fixtures/fidelity-report-example.yaml`: worked example against a diagram-derived reconstruction of the purchase-approval process

## Handoff Instruction

When `completeness_verdict: partial-diagram-derived`, pass `recommended_next_action`'s field list to `okhp3-elicitation-interviews` for a targeted follow-up pass. Only after that pass closes the disclosed gaps should `okhp3-process-validation-scoring` be run for real publication-readiness scoring — never run it against the diagram-only PNS as a substitute for this audit, and never let this skill itself set `ready_for_publication: true`.

## Evaluation and release status

The package includes `evals/evals.json` with development cases for ordinary diagram-derived input, the PIR boundary, and populated-but-unrecoverable fields. The maintainer-facing `tests/validate-skill.test.mjs` also checks the worked fixture's shape and enum values. These are structural and design-level checks, not an independently benchmarked task-quality result against a held-out set of real `bpmn-beta` diagrams and elicited counterparts. Evidence status: `not-run` for task quality and skill uplift; external holdout evaluation remains required before promotion.

Version 0.1.0 is the initial release. It was authored against the real `pns.yaml` schema in use by this repository's scripts (as fixed by `skills/okhp3-process-narrative-authoring/assets/fixtures/pns-example.yaml` and exercised by `skills/okhp3-process-validation-scoring/tests/validate-skill.test.mjs`), not against `docs/pns-schema.md`'s separate `PNS.md`-with-Markdown-sections description, which this repository's own validators and fixtures do not follow. That discrepancy between the two schema descriptions is disclosed here rather than silently resolved. The package has no external regression benchmark yet; that limitation is disclosed, not implied away.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3/mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
