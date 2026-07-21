# Gap Analysis Framework

## Gap Type Taxonomy

### Type 1 — Structural Gaps

Structural gaps are missing or incomplete elements in the process design itself.

| Pattern | Gap type | Severity guide |
|---|---|---|
| Step with no `actor_role_id` | Unowned activity | major |
| No start event or end event | Missing boundary | critical |
| Input with no `source` | Untraced input | minor |
| Output with no `consumer` | Undelivered output | minor |
| `business_rules` empty | Undocumented constraints | major |
| Step sequence has no decision point despite described branching | Missing gateway | major |

### Type 2 — Execution Gaps

Execution gaps occur when the process is structurally defined but inconsistently executed.

| Pattern | Gap type | Severity guide |
|---|---|---|
| `capture_quality: low` on step | Poorly understood activity | major |
| Step notes contain "usually", "sometimes", "depends on" | Inconsistent execution | minor |
| Single person as sole performer across >50% of steps | Key-person dependency | major |
| Step with no system documented in a digitised process | Missing system touchpoint | observation |

### Type 3 — Exception Gaps

Exception gaps are failure paths with undefined or inadequate handling.

| Pattern | Gap type | Severity guide |
|---|---|---|
| Decision point with no exception branch | Unhandled failure branch | critical |
| Exception in PIR with empty `handling` | Undefined recovery | critical |
| Exception path with `owner_role_id` empty | Unowned error handling | major |
| Exception with no `escalation_path` for high-severity cases | Missing escalation | major |

### Type 4 — Compliance Gaps

Compliance gaps are missing governance or control requirements.

| Pattern | Gap type | Severity guide |
|---|---|---|
| `controls` empty on process | No governance controls | major |
| Approval step with no `approver` role in RACI | Missing segregation of duties | critical |
| High-risk exception with no escalation path | Escalation undefined | major |
| Business rule with no `source` citation | Ungoverned constraint | minor |

## Severity Classification

| Severity | Description | Action |
|---|---|---|
| `critical` | Process cannot safely complete without resolution | Must resolve before narrative authoring |
| `major` | Significant risk of nonconformity, failure, or key-person dependency | Resolve before publication |
| `minor` | Inconsistency or improvement opportunity with limited immediate risk | Resolve before next review |
| `observation` | Informational — no immediate action required | Record and monitor |

## Root Cause Analysis Template

For `critical` and `major` gaps, document:
1. **Symptom** — observable effect of the gap
2. **Root cause** — why the gap exists (not just what the gap is)
3. **Contributing factors** — conditions that allow the gap to persist
4. **Impact** — what happens if the gap is not resolved
5. **Recommended action** — brief proposed resolution (not a full design)

## Gap Prioritisation

Resolve gaps in this order:
1. All `critical` gaps before starting `process-narrative-authoring`
2. All `major` Type 3 (exception) gaps before `visual-process-modeling`
3. All `major` Type 4 (compliance) gaps before `publication-and-handoff-packaging`
4. `minor` and `observation` gaps as time permits
