# Eval: Role Consistency

## What it measures

Whether all actor role IDs referenced in activity steps are declared in the `roles_and_raci.roles` dictionary, and whether every role that appears in the RACI matrix is defined. Tests the V2 (traceability) and V3 (RACI integrity) rules.

## V-rules enforced

**V2** — Every activity's `actor_role_id` must be defined in `roles_and_raci.roles`.  
**V3** — Every activity must have a RACI entry; every defined role must appear in the RACI matrix.

## Score contribution

Role consistency contributes to the V2 and V3 checks in the 0–100 composite score. V2/V3 failures reduce the score to band D.

## Pass criteria

| Criterion | Required for PASS |
|-----------|-------------------|
| All `activity_sequence.activities[].actor_role_id` values are present in `roles_and_raci.roles[].role_id` | ✓ |
| Every activity in `activity_sequence` has an entry in `raci_matrix` | ✓ |
| Every role in `roles_and_raci.roles` appears in at least one RACI entry | ✓ |
| Each RACI entry has a non-empty `accountable` field | ✓ |
| Each RACI entry has at least one `responsible` role | ✓ |

## Fail criteria

Any of the following causes `valid: false`:

- An activity references a `role_id` not declared in `roles_and_raci.roles`
- An activity has no RACI entry
- A RACI entry has no `accountable` or no `responsible` roles

## Fixtures

| File | Expected | Reason |
|------|----------|--------|
| `role-dict-complete.yaml` | **pass** | All roles declared; all activities reference valid roles; full RACI coverage |
| `role-dict-provisional-declared.yaml` | **pass** | Includes a role marked `provisional: true`; provisional marker is valid |
| `role-dict-undeclared-role.yaml` | **fail** | Activity `act-003` references `actor_role_id: finance-officer` which is not in the roles list — V2 error |

## Script

`skills/okhp3-process-narrative/scripts/validate-pns.mjs` → `validatePns(pns)`
