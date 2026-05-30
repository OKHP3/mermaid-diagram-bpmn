# Eval: BPMN Traceability

## What it measures

Whether every task and event element in a `bpmn-beta` diagram carries a `# pns:act-NNN` trace comment on the immediately preceding line, linking each visual element back to the authoritative PNS activity record.

## Convention

Trace comments are placed on the line immediately preceding the element declaration:

```
# pns:act-001
task T1 "Submit Purchase Request"
```

The comment format is: `# pns:<activity-id>` where `<activity-id>` matches a PNS `activity_sequence.activities[].id` value (e.g. `act-001`, `act-002`).

## V-rule enforced

This eval enforces the **BPMN ↔ PNS traceability** requirement. Without trace comments, a BPMN diagram cannot be automatically linked back to the governing narrative, SOP, or RACI entries.

## Score contribution

Traceability is a prerequisite for the `ready_for_publication` gate. Untraced BPMN diagrams do not receive the traceability certificate required for Band A or B ratings.

## Pass criteria

| Criterion | Required for PASS |
|-----------|-------------------|
| Every `task`, `start`, `end`, `xor`, `and`, `or` declaration is preceded by a `# pns:` comment | ✓ |
| The trace comment follows the format `# pns:<id>` where `<id>` is non-empty | ✓ |

## Fail criteria

Any element declaration not preceded by a `# pns:` trace comment causes an eval FAIL.

## Fixtures

| File | Expected | Reason |
|------|----------|--------|
| `bpmn-all-steps-traced.bpmn-beta.mmd` | **pass** | Every task/event has a `# pns:act-NNN` trace comment on the preceding line |
| `bpmn-orphan-task.bpmn-beta.mmd` | **fail** | `task T3` has no trace comment — traceability check fails |

## Script

Custom `bpmn-trace` validator in `run-eval-suite.mjs` (inline — no separate module).
