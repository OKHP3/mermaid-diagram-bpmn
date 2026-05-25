# PNS Validation Rules Reference

The `validate-pns.mjs` script applies seven rules (V1–V7) to assess PNS quality and readiness.
Each rule has a severity (`error` or `warning`) and a remediation action.

---

## V1 — Schema Completeness

**Severity:** error

**Rule:** The following top-level fields must be present and non-empty:
- `pns_version`
- `process_id`
- `process_name`
- `process_owner_role_id`
- `version`
- `status` (must be one of: `draft`, `review`, `approved`, `published`)
- At least 4 of 6 `babok_core_concepts` fields populated (change, need, solution, stakeholders, value, context)
- All 12 sections present in `sections` object (keys must exist; may be empty structures)

**Remediation:** Populate all required fields. Use `pns-template.yaml` as the authoring guide.

---

## V2 — Traceability

**Severity:** error

**Rule:** Every activity in `sections.activity_sequence.activities` must have:
- Non-empty `description`
- Non-empty `actor_role_id`

Every business rule in `sections.business_rules` must have:
- Non-empty `source` field (policy / regulation / contract / practice)

**Remediation:** Review each activity and rule; add missing descriptions and source citations.

---

## V3 — RACI Integrity

**Severity:** error

**Rule:** For each entry in `sections.roles_and_raci.raci_matrix`:
- `accountable` must be a non-empty string (exactly one Accountable per activity)
- `responsible` must be a non-empty array (at least one Responsible)

For the overall RACI matrix:
- Every activity_id in `sections.activity_sequence.activities` must have a corresponding RACI entry

**Remediation:** Add RACI entries for missing activities. Assign exactly one Accountable per entry.

---

## V4 — Singular Activity Statements

**Severity:** warning

**Rule:** Each activity description should be a single imperative statement (IEEE 29148 §5.2.1).
Flag descriptions that:
- Contain a semicolon (likely compound statements)
- Exceed 200 characters (likely multi-clause)
- Begin with a subordinate conjunction ("When", "If", "After", "Before")

**Remediation:** Rewrite compound descriptions as individual activities. Each description should start with an imperative verb.

---

## V5 — Verifiable KPIs

**Severity:** error

**Rule:** Every entry in `sections.kpis` must have:
- Non-empty `formula` field
- Non-empty `data_source` field

**Remediation:** Add a calculation formula and an explicit data source for each KPI.

---

## V6 — Exception and Decision Coverage

**Severity:** error

**Rule:**
- Each entry in `sections.decision_points` must have `outcomes` array with at least 2 items
- Each entry in `sections.exception_paths` must have a non-empty `handling` field

**Remediation:** Add at least two outcome paths for each decision point. Document handling procedures for each exception.

---

## V7 — Controls Coverage

**Severity:** warning

**Rule:** If `sections.controls_and_compliance` is empty or missing, a warning is issued.
For each entry in `controls_and_compliance`, the `activities_covered` array should be non-empty.

**Remediation:** Add at least one control for the process. Reference the relevant compliance standard where applicable. If a control is not applicable, add a waiver note.

---

## Validation Report Format

```
PNS Validation: PASS | FAIL (n errors, m warnings)
Rules fired: [V1, V3, V5, ...]
Issues:
  [V1] Missing required field: process_name
  [V3] Activity act-02 has no RACI entry
  [V5] KPI kpi-01 missing formula
Warnings:
  [V4] Activity act-03 description contains semicolon
  [V7] controls_and_compliance is empty
```
