---
name: process-validation-and-quality-scoring
description: "Orchestrate the full V1–V9 validation suite across all BP-SKILL process artifacts and produce a 0-100 quality score with band classification. Use this skill when the user wants to validate a complete process documentation set before publication; when they ask \\\"is this ready to publish\\\", \\\"validate the process docs\\\", \\\"run the quality check\\\", or \\\"what is the quality score\\\". Do not use it to validate a single artifact in isolation — run that artifact's own validate script directly instead. Produces a validation report with per-artifact scores, rule-level findings, band classification (A–D), and a publication gate verdict."
license: "MIT"
compatibility: "Interpreting the result needs no special runtime. scripts/run-validation-suite.mjs orchestrates five underlying .mjs validators and needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, run each artifact's own validate script individually and combine results by hand per references/validation-rules.md, and say so in your output rather than presenting a composite score as machine-computed."
metadata:
  bp_skill_version: "0.3.0"
  status: "core"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-quality"
  standards_refs: "ISO 9001:2015 §9.1 (Monitoring, measurement, analysis and evaluation); BABOK v3 §7.6 (Analyse Potential Value and Recommend Solution); BPM CBOK v4 §8 (Process Performance Management)"
  produces: "validation-report.yaml"
  consumes: "pns.yaml, pir.yaml"
  depends_on: "process-narrative-authoring"
  tags: "validation, quality-scoring, V1-V9, publication-gate, process-quality, ISO9001, BPM-CBOK"
  triggers: "validate the process; quality check; is this ready to publish; run the validation suite; quality score; publication gate; check the process docs; V1 through V9"
  homepage: "https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/process-validation-and-quality-scoring"
  repository: "https://github.com/overkillhill/mermaid-diagram-bpmn"
---

# process-validation-and-quality-scoring

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Orchestrate the full validation suite across all BP-SKILL process artifacts and return a composite 0–100 quality score. The suite runs V1–V9 validation rules and returns a band classification with a binary publication gate verdict.

---

## When to use this skill

- All process artifacts exist (pir.yaml + pns.yaml minimum) and user wants a publication readiness check
- You need a single quality score before passing artifacts to `publication-and-handoff-packaging`
- User asks for a validation report or quality audit of a process documentation set

## When NOT to use this skill

- PNS has not been authored: run `process-narrative-authoring` first
- User only wants to validate a single artifact: use the artifact's own validate script directly
- Do not suppress V1–V3 errors: these are hard gates that must be resolved before publication

---

## V1–V9 Validation Rules

| Rule | Severity | Artifact | Description |
|---|---|---|---|
| V1 | error | pns.yaml | Required top-level fields present; status valid; ≥4 babok_core_concepts; all 13 section keys present |
| V2 | error | pns.yaml | Every activity has non-empty description + actor_role_id; every business rule has non-empty source |
| V3 | error | pns.yaml | Every RACI entry has exactly one Accountable and ≥1 Responsible; every activity has a RACI entry |
| V4 | warning | pns.yaml | Activity descriptions containing semicolons, >200 chars, or starting with subordinate conjunctions |
| V5 | error | pns.yaml | Every KPI must have non-empty formula and data_source |
| V6 | error | pns.yaml | Every decision_point must have ≥2 outcomes; every exception_path must have non-empty handling |
| V7 | warning | pns.yaml | controls_and_compliance is empty; activities not covered by any control |
| V8 | error | pir.yaml | PIR completeness_score ≥ 70; ready_for_narrative = true |
| V9 | warning | bpmn-beta.mmd | bpmn-beta file present; validate-bpmn-beta passes; diagram has at least one lane |

---

## Quality Score Bands

| Band | Score range | Meaning |
|---|---|---|
| **A** | 90–100 | Publication ready: all errors resolved, warnings minimal |
| **B** | 75–89 | Publication ready with minor warnings: may proceed |
| **C** | 50–74 | Below threshold: resolve errors before publication |
| **D** | 0–49 | Significant quality deficit: major rework required |

Publication gate: **Band A or B** (score ≥ 75) → `ready_for_publication: true`

---

## Validation Report Schema

`validation-report.yaml` contains:
- `process_id`: from PIR
- `validation_date`, `validated_by_role`
- `rules_run[]`: each rule: `rule_id`, `severity`, `status` (pass|fail|warn), `findings[]`
- `artifact_scores{}`: per-artifact weighted scores: `pir`, `pns`, `bpmn`
- `composite_score`: 0–100 weighted composite
- `band`: A | B | C | D
- `ready_for_publication`: true | false
- `blocking_errors[]`: rule IDs that must be resolved before publication
- `recommendations[]`: actionable items for each warning

---

## Orchestration Workflow

`scripts/run-validation-suite.mjs` executes in order:

1. Validate PIR: run `validate-pir.mjs`; record V8 pass/fail
2. Validate PNS: run `validate-pns.mjs`; record V1–V7 findings
3. Score PNS: run `score-pns-quality.mjs`; record weighted score
4. Score PIR: run `score-intake-completeness.mjs`; record completeness score
5. Validate BPMN (if present): run `validate-bpmn-beta.mjs`; record V9 pass/fail
6. Compute composite score: weighted average across artifact scores
7. Classify band: assign A/B/C/D based on composite score
8. Set `ready_for_publication`: true only if band A or B and no V1/V2/V3/V5/V6 errors

---

## Handoff Instruction

When `ready_for_publication: true`, pass all artifacts to `publication-and-handoff-packaging`.

When `ready_for_publication: false`, present `blocking_errors[]` to the user and return to the appropriate skill to resolve each error.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/run-validation-suite.mjs` cannot run, run each underlying artifact's own validate script individually and combine the results by hand using the weighting in `references/validation-rules.md`, and state in the output that the orchestrated run was not executed.

## References

Load on demand:
- `references/validation-rules.md`: V1–V9 severity descriptions, remediation guidance, and composite scoring weights

## Scripts

- `scripts/run-validation-suite.mjs`: orchestrates V1–V9 checks and returns composite score, band, and publication gate verdict

## Assets

- `assets/fixtures/validation-report-example.yaml`: canonical validation report for purchase-approval process set

## Evaluation and release status

This skill orchestrates the same underlying validators (`validate-pir.mjs`, `validate-pns.mjs`) that four of the five root-level `evals/` categories target — and those categories' `manifest.json` files currently point at stale `okhp3-process-discovery`/`okhp3-process-narrative` paths that don't exist in this repository (see `process-intake-and-scope` and `process-narrative-authoring` for the exact broken paths, verified by static inspection). This skill's own orchestration logic (`run-validation-suite.mjs`) has no dedicated eval coverage beyond the maintainer-facing `tests/validate-skill.test.mjs` against `assets/fixtures/validation-report-example.yaml` — notably, nothing currently proves the *composite scoring and band classification* logic itself is correct, only that the fixture round-trips. Evidence status: `not-run` for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, the orchestrator fallback instruction, and a sharper discovery-time boundary against single-artifact validation. Classified minor per the versioning table, not patch. No regression suite exists to run before this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn). MIT License.
