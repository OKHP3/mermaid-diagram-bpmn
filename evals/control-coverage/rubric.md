# Eval: Control Coverage

## What it measures

Whether all process activities are covered by at least one documented control, or whether any unmapped controls are explicitly waived with written rationale. Tests the V7 (controls coverage) rule.

## V-rule enforced

**V7** — `controls_and_compliance` must have at least one entry. If no global waiver is declared, every activity must be referenced in at least one control's `activities_covered` list.

## Score contribution

V7 is a warning-severity rule. Unmapped controls do not reduce `valid` to `false` but they do reduce the PNS quality score and prevent a Band A rating.

## Pass criteria

| Criterion | Required for PASS |
|-----------|-------------------|
| `controls_and_compliance` array is non-empty | ✓ |
| If no `waiver` field is set on any control: every activity ID appears in at least one `activities_covered` list | ✓ |
| If a control has a non-empty `waiver` field: per-activity coverage check is waived | ✓ |

## Fail criteria (eval-level — V7 warnings treated as failures)

This eval treats any V7 warning as a failure to enforce strict control coverage:

- `controls_and_compliance` is empty → V7 warning → eval FAIL
- Any activity not covered by a control and no waiver declared → V7 warning → eval FAIL

## Fixtures

| File | Expected | Reason |
|------|----------|--------|
| `controls-fully-mapped.yaml` | **pass** | All activities listed in `activities_covered`; no V7 warnings |
| `controls-waived-with-rationale.yaml` | **pass** | `waiver` field is populated with rationale; per-activity check waived; no V7 warnings |
| `controls-unmapped.yaml` | **fail** | `controls_and_compliance: []` — empty; V7 warning fires; eval treats V7 warnings as failures |

## Script

`skills/okhp3-process-narrative/scripts/validate-pns.mjs` → `validatePns(pns)`

> **Note:** This eval uses `fail_on_warnings_matching: "[V7]"` — V7 warnings are treated as eval failures.
