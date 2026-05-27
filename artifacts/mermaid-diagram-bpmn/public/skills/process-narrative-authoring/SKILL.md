---
name: process-narrative-authoring
description: Author and validate a Process Narrative Specification (PNS) from a PIR and stakeholder register. Use this skill when you have a completed Process Intake Record from process-intake-and-scope and need to produce a structured narrative document that anchors ISO 9001 §4.4.1 process-box semantics, BABOK Core Concept Model, RACI matrix, SIPOC table, business rules, decision points, KPIs, and controls. The PNS is the authoritative handoff input for visual-process-modeling, sop-and-work-instruction-generation, raci-and-governance-matrix-generation, and sipoc-generation.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/process-narrative-authoring
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: core
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-documentation
  standards_refs:
    - "ISO 9001:2015 §4.4.1 (Quality Management System and its processes)"
    - "BABOK v3 §7 (Solution Evaluation)"
    - "BABOK v3 Core Concept Model"
    - "BPM CBOK v4 §5 (Process Analysis)"
  produces: "pns.yaml, pns.md"
  consumes: "pir.yaml, stakeholder-register.yaml"
  depends_on: ["process-intake-and-scope", "stakeholder-and-role-mapping"]
  tags: process-narrative, pns, iso9001, babok, raci, sipoc, business-rules, kpis, process-documentation
  triggers:
    - write the process narrative
    - author the PNS
    - process narrative specification
    - document the process formally
    - ISO 9001 process document
    - narrative from PIR
    - RACI matrix
    - SIPOC table
---

## Purpose

Transform a validated PIR and stakeholder register into a Process Narrative Specification (PNS) — the structured document that anchors process semantics for human review and downstream diagram generation.

The PNS is the single source of truth between process discovery and visual modeling. It documents what the process does, who does it, how it is governed, how it is measured, and what can go wrong.

---

## When to use this skill

- PIR has `completeness_score ≥ 70` and `ready_for_narrative: true`
- User needs a formal process document (ISO 9001 §4.4.1, BABOK §7)
- You need to produce SIPOC, RACI, or business rules as standalone artifacts
- Preparing input for `visual-process-modeling`

## When NOT to use this skill

- PIR has not been validated — complete `process-intake-and-scope` first
- User only needs a quick diagram without governance structure — go directly to `visual-process-modeling`
- Process is exploratory and roles/rules are completely unknown — return to `process-intake-and-scope`

---

## PNS Structure — 13 Required Sections

### 1. process_box (ISO 9001 §4.4.1)

`trigger`, `inputs[]` (each with `name`, `source`), `outputs[]` (each with `name`, `consumer`), `criteria`, `resources`, `responsibilities`, `risks`.

### 2. activity_sequence

Ordered activities. Each: `id`, `description` (single imperative per IEEE 29148), `actor_role_id`, `inputs[]`, `outputs[]`, `systems[]`, `preconditions`, `postconditions`.

Minimum 3 activities for full quality score.

### 3. roles_and_raci

**roles[]:** `{ role_id, role_name }`. **raci_matrix[]:** one per activity — `activity_id`, `responsible[]` (≥1), `accountable` (exactly 1), `consulted[]`, `informed[]`.

### 4. business_rules

`{ id, description, source, applies_to, rationale }`. `source` is mandatory. `applies_to` references an `activity_id` or `"all"`.

### 5. decision_points

`{ id, description, activity_id, criteria, outcomes[] }`. Each entry must have ≥2 outcomes. Each outcome: `{ label, next_activity }`.

### 6. exception_paths

`{ id, description, trigger, handling, owner_role_id, escalation_path }`. `handling` is mandatory and non-empty.

### 7. kpis

`{ id, name, formula, data_source, target, frequency }`. Both `formula` and `data_source` are mandatory.

### 8. systems_and_integrations

`{ system_name, role, integration_type, activities_supported[] }`.

### 9. controls_and_compliance

`{ id, type, description, standard_ref, activities_covered[], waiver }`. Empty triggers a V7 warning.

### 10. open_questions

`{ id, question, owner_role_id, target_resolution_date }`. Record gaps — do not invent content.

### 11. babok_core_concepts

Minimum 4 of 6 fields populated (≥20 chars each): `change`, `need`, `solution`, `stakeholders`, `value`, `context`.

### 12. revision_history

`{ version, date, author_role, summary }`. Required for document change traceability.

### 13. validation (computed)

`{ pns_quality_score, ready_for_publication, ready_for_bpmn_modeling }`. Populated by `scripts/score-pns-quality.mjs`. Do not author manually.

---

## V1–V7 Validation Rules

| Rule | Severity | Description |
|---|---|---|
| V1 | error | Required top-level fields present; status valid; ≥4 babok_core_concepts; all 13 section keys present |
| V2 | error | Every activity has non-empty description + actor_role_id; every business rule has non-empty source |
| V3 | error | Every RACI entry has exactly one Accountable and at least one Responsible; every activity has a RACI entry |
| V4 | warning | Activity descriptions containing semicolons, >200 chars, or starting with subordinate conjunctions |
| V5 | error | Every KPI must have non-empty formula and data_source |
| V6 | error | Every decision_point must have ≥2 outcomes; every exception_path must have non-empty handling |
| V7 | warning | controls_and_compliance is empty; activities not covered by any control |

Run: `node scripts/validate-pns.mjs <pns.yaml>`

---

## Quality Score and Publication Gate

Weighted 0–100. Publication threshold: **≥75**.

| Section | Max pts |
|---|---|
| process_box | 15 |
| activity_sequence | 15 |
| roles_and_raci | 10 |
| business_rules | 10 |
| decision_points | 10 |
| exception_paths | 10 |
| kpis | 10 |
| systems_and_integrations | 5 |
| controls_and_compliance | 5 |
| babok_core_concepts | 5 |
| apqc_pcf_mapping | 5 |
| **Total** | **100** |

Run: `node scripts/score-pns-quality.mjs <pns.yaml>`

---

## Authoring Workflow

Execute in order:
1. Load PIR — read `pir.yaml` and `stakeholder-register.yaml`
2. Map inputs — PIR actors → roles, steps → activities, rules → business_rules
3. Draft process_box — trigger, inputs, outputs, criteria, responsibilities, risks
4. Expand activities — enrich each step with preconditions, postconditions, system assignments
5. Build RACI — assign R/A/C/I for each activity from PIR actor types
6. Document rules + decisions — expand business_rules with source citations; derive decision points
7. Define KPIs — at least one KPI with formula and data_source per core process objective
8. Add controls — map applicable compliance standards to activities
9. Anchor CCM — populate all 6 babok_core_concepts fields
10. Record open questions — do not invent content
11. Validate — run `scripts/validate-pns.mjs`; fix all errors before continuing
12. Score — run `scripts/score-pns-quality.mjs`; ensure score ≥75 before handoff

---

## Handoff Instruction

When validation passes and score ≥ 75, pass `pns.yaml` to:
- `visual-process-modeling` — for BPMN diagram generation
- `sop-and-work-instruction-generation` — for SOP documents
- `raci-and-governance-matrix-generation` — for standalone RACI matrix
- `sipoc-generation` — for SIPOC table

---

## References

Load on demand:
- `references/pns-schema.md` — complete field-level documentation for all 13 sections, 9-state PNS lifecycle, and traceability rules

## Scripts

- `scripts/validate-pns.mjs` — V1–V7 validation
- `scripts/score-pns-quality.mjs` — weighted quality score

## Assets

- `assets/fixtures/pns-example.yaml` — canonical PNS fixture for purchase-approval process
