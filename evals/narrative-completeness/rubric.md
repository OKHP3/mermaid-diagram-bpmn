# Eval: Narrative Completeness

## What it measures

Whether a Process Narrative Specification (PNS) satisfies all required schema fields and sections (V1), and whether decision points and exception paths are consistently documented (V6).

## V-rules enforced

**V1** — PNS Schema Completeness: all required top-level fields and all 12 required sections must be present.  
**V6** — Exception and Decision Coverage: if decision points exist, at least one exception path must be documented; each exception path must have a `handling` procedure.

## Score contribution

V1 and V6 failures reduce the composite score to Band C or D and block the `ready_for_publication` gate. These two rules together contribute the largest share of the PNS quality score.

## Pass criteria

| Criterion | Required for PASS |
|-----------|-------------------|
| All required top-level fields present (`pns_version`, `process_id`, `process_name`, `process_owner_role_id`, `version`, `status`) | ✓ |
| All 12 required sections present under `sections:` | ✓ |
| `babok_core_concepts` has ≥ 4 of 6 fields populated with ≥ 20 characters | ✓ |
| If `decision_points` is non-empty: `exception_paths` must also be non-empty | ✓ |
| Each `exception_paths` entry has a non-empty `handling` field | ✓ |

## Fail criteria

Any of the following causes `valid: false`:

- Missing required top-level field or required section
- `decision_points` is non-empty but `exception_paths` is empty
- An exception path has no `handling` procedure documented

## Fixtures

| File | Expected | Reason |
|------|----------|--------|
| `pns-all-sections-complete.yaml` | **pass** | All 12 sections populated; decision points and exception paths consistent |
| `pns-missing-exceptions.yaml` | **fail** | `exception_paths: []` while `decision_points` has one entry — V6 error |
| `pns-not-applicable-with-rationale.yaml` | **pass** | No decision points; `exception_paths: []` is valid for a single-happy-path process |

## Script

`skills/okhp3-process-narrative/scripts/validate-pns.mjs` → `validatePns(pns)`
