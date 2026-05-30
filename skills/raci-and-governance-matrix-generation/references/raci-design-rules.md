# RACI Design Rules

## Cell Definitions

| Cell | Meaning | Rules |
|---|---|---|
| **R** (Responsible) | Does the work | At least one R per activity; multiple R roles allowed |
| **A** (Accountable) | Owns the outcome; signs off | Exactly one A per activity — never more, never less |
| **C** (Consulted) | Provides input; two-way communication | Optional; use when expert input is needed before acting |
| **I** (Informed) | Receives outcome notification; one-way | Optional; use for roles that need to know but not act |

## Validation Rules

1. Every activity must have exactly one **A** (Accountable)
2. Every activity must have at least one **R** (Responsible)
3. No role may be both R and A for the same activity unless they are the process owner
4. A role should not be both C and I for the same activity — choose one
5. All role IDs in the RACI matrix must match entries in `roles_and_raci.roles[]`
6. Activities listed in `activity_sequence[]` must each appear in the RACI matrix

## Governance Matrix Extensions

The governance matrix extends the RACI with:

| Extension field | Description |
|---|---|
| `escalation_path` | Which role a decision escalates to when outside the primary role's authority |
| `delegation_rule` | Conditions under which the Accountable role can delegate to another |
| `absence_cover` | The backup role when the primary Accountable is unavailable |
| `authority_limit` | Financial or operational ceiling on the Accountable role's authority |

Derive `escalation_path` from `pns.exception_paths[].escalation_path` where `owner_role_id` matches.

Derive `authority_limit` from `pns.business_rules[]` where the rule describes a threshold or ceiling.

## RACI Table Formatting

```markdown
| Activity | Role A | Role B | Role C |
|---|---|---|---|
| Act description | **R** | **A** | I |
```

- Bold the primary cell designation (**R**, **A**, **C**, **I**)
- Use `—` (em dash) for cells with no assignment
- Activities appear in sequence order from `activity_sequence[]`
- Roles appear as columns in the order they first appear in `roles[]`

## Common Anti-Patterns

| Anti-pattern | Why it's a problem | Correction |
|---|---|---|
| Multiple A per activity | Creates authority ambiguity | Assign exactly one A; others become R or C |
| No R for an activity | Activity is unowned | Assign the Accountable role as R if no other R exists |
| Everyone is R | Diffuses accountability | Reduce to primary performer(s) only |
| System listed as A | Systems cannot be held accountable | Assign the role that owns the system as A |
