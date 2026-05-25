# Validation Rules Reference — V1 through V9

## V1 — Required Structure (error)

**Artifact:** pns.yaml

**Checks:**
- All required top-level fields present: `pns_version`, `process_id`, `process_name`, `process_owner`, `department`, `status`, `pir_ref`
- `status` is one of the 9 valid lifecycle states
- All 13 section keys present in the YAML body
- `babok_core_concepts` has at least 4 fields populated with ≥20 characters each

**Remediation:** Add missing fields or populate sparse `babok_core_concepts` entries.

---

## V2 — Activity and Rule Quality (error)

**Artifact:** pns.yaml

**Checks:**
- Every `activity_sequence.activities[]` entry has a non-empty `description` and `actor_role_id`
- Every `business_rules[]` entry has a non-empty `source`

**Remediation:** Fill in missing descriptions or source citations.

---

## V3 — RACI Integrity (error)

**Artifact:** pns.yaml

**Checks:**
- Every `raci_matrix[]` entry has exactly one non-empty `accountable` value
- Every `raci_matrix[]` entry has at least one `responsible[]` value
- Every `activity_sequence.activities[].id` appears in at least one `raci_matrix[].activity_id`

**Remediation:** Add missing RACI entries; ensure each activity has exactly one Accountable.

---

## V4 — Activity Description Style (warning)

**Artifact:** pns.yaml

**Checks:**
- Activity descriptions containing semicolons (compound statements)
- Activity descriptions exceeding 200 characters
- Activity descriptions beginning with subordinate conjunctions (when, if, after, before, while)

**Remediation:** Split compound descriptions; shorten long ones; rewrite subordinate-clause openers as imperative statements.

---

## V5 — KPI Completeness (error)

**Artifact:** pns.yaml

**Checks:**
- Every `kpis[]` entry has a non-empty `formula`
- Every `kpis[]` entry has a non-empty `data_source`

**Remediation:** Add formula and data_source to each KPI.

---

## V6 — Decision and Exception Completeness (error)

**Artifact:** pns.yaml

**Checks:**
- Every `decision_points[]` entry has at least 2 entries in `outcomes[]`
- Every `exception_paths[]` entry has a non-empty `handling`

**Remediation:** Add missing outcomes to decision points; provide handling procedures for all exception paths.

---

## V7 — Controls Coverage (warning)

**Artifact:** pns.yaml

**Checks:**
- `controls_and_compliance` is non-empty
- All activities appear in at least one `activities_covered[]` array across the controls

**Remediation:** Add at least one control; ensure all activities are covered by a control.

---

## V8 — PIR Readiness (error)

**Artifact:** pir.yaml

**Checks:**
- `validation.completeness_score ≥ 70`
- `validation.ready_for_narrative = true`

**Remediation:** Return to `process-intake-and-scope` to complete the PIR.

---

## V9 — BPMN Model Presence (warning)

**Artifact:** bpmn-beta.mmd

**Checks:**
- `bpmn-beta.mmd` file is present in the process artifacts directory
- `validate-bpmn-beta.mjs` exits 0 on the file
- Diagram contains at least one lane

**Remediation:** Run `visual-process-modeling` to generate the diagram.

---

## Composite Scoring Weights

| Artifact | Weight |
|---|---|
| PIR (V8) | 20% |
| PNS (V1–V7) | 60% |
| BPMN (V9) | 20% |

Composite = (PIR_score × 0.20) + (PNS_score × 0.60) + (BPMN_score × 0.20)

## Quality Bands

| Band | Score | Publication gate |
|---|---|---|
| A | 90–100 | `ready_for_publication: true` |
| B | 75–89 | `ready_for_publication: true` |
| C | 50–74 | `ready_for_publication: false` |
| D | 0–49 | `ready_for_publication: false` |
