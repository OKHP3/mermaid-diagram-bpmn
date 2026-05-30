# Eval: Discovery Quality

## What it measures

Structural completeness and content quality of Process Intake Records (PIRs). Tests whether a PIR contains all required fields, a properly typed trigger, at least two actors (initiator + performer/approver), input/output definitions, and a minimum of three process steps.

## V-rule enforced

**V8** — PIR Completeness Gate. A PIR with `completeness_score ≥ 70` and `ready_for_narrative: true` is the prerequisite for all downstream narrative and modeling work.

## Score contribution

Discovery quality contributes **20 points** to the composite 0–100 validation score (weight: `pir × 0.20` in the full pipeline).

## Pass criteria

| Criterion | Required for PASS |
|-----------|-------------------|
| `pir_version` present and equals `"0.1"` | ✓ |
| `process_id`, `process_name`, `process_owner`, `department` all non-empty | ✓ |
| `elicitation_method` is one of: interview, workshop, observation, document-analysis, survey | ✓ |
| `trigger.description` and `trigger.event_type` present | ✓ |
| `actors` has ≥ 2 entries, including at least one `initiator` and one `performer`/`approver` | ✓ |
| `inputs` array has ≥ 1 entry with id and name | ✓ |
| `outputs` array has ≥ 1 entry with id and name | ✓ |
| `steps` array has ≥ 3 entries, each with id, description, and actor_role_id | ✓ |

## Fail criteria

Any of the following causes `valid: false`:

- Missing required top-level field
- Invalid `elicitation_method` or `status` value
- Absent or malformed `trigger` section
- Fewer than 2 actors, or no initiator/performer/approver present
- Empty `inputs` or `outputs` arrays
- Fewer than 3 process steps

## Fixtures

| File | Expected | Reason |
|------|----------|--------|
| `good-intake-purchase-approval.yaml` | **pass** | All required fields populated; trigger, actors, inputs, outputs, steps complete |
| `poor-intake-missing-trigger.yaml` | **fail** | `trigger` section absent — V8 requires trigger.description and trigger.event_type |
| `poor-intake-missing-scope.yaml` | **fail** | `inputs` and `outputs` arrays absent — scope boundary undefined |

## Script

`skills/okhp3-process-discovery/scripts/validate-pir.mjs` → `validatePir(pir)`
