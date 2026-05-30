# DMN Modeling Rules

## Hit Policy Selection

| Hit policy | Code | When to use |
|---|---|---|
| Unique | `U` | Exactly one rule fires for any input combination — mutually exclusive conditions |
| First | `F` | Rules are ordered by priority; first matching rule wins |
| Any | `A` | Multiple rules can match but all produce the same output |
| Collect | `C` | Multiple rules can match; outputs are collected into a list |
| Rule Order | `R` | Like Collect but rules are evaluated in defined order |
| Output Order | `O` | Like Collect but outputs are sorted |

**Default:** Use `U` (Unique) unless the business requires ordered or multi-match behaviour.

## Input and Output Types

| Type | Values description |
|---|---|
| `string` | Quoted values: `"manager"`, `"staff"`, `"director"` |
| `number` | Numeric ranges or values: `≤ 1000`, `> 10000` |
| `boolean` | `true`, `false` |
| `date` | ISO 8601 date strings |
| `enum` | Named set: defined in `values[]` on the column |

## Rule Completeness

For `U` (Unique) hit policy, the rules must be **complete** — every possible input combination must have exactly one matching rule.

Mark unhandled combinations as `output: "FAIL"` — do not silently default.

Completeness check: for each input column with finite `values[]`, verify every value appears in at least one rule.

## Traceability Requirements

- Every `decision_id` must match a `pns.decision_points[].id`
- Every output value must match a `pns.decision_points[].outcomes[].label`
- Every `activity_id` must match a `pns.activity_sequence.activities[].id`
- If a gateway appears in `bpmn-beta.mmd`, its label must match the `decision_name`

## Annotation Rules

Every rule must include an `annotation` field explaining the business rationale:
- Good: `"Purchases under $1,000 are auto-approved per Finance Policy FP-003"`
- Bad: `"auto-approve"` (no policy reference)

## DMN Table Markdown Convention

```markdown
## Decision: <Decision Name> (<decision_id>)

Hit policy: **<U|F|A|C>** — <one-line description>

| <Input 1> | <Input 2> | → <Output> | Annotation |
|---|---|---|---|
| value | value | value | rationale |
```

## Mandatory Trigger Condition

This skill is invoked **automatically** when `visual-process-modeling` detects ≥3 gateway nodes in the generated bpmn-beta diagram. The gateway labels become `decision_name` values in the decision model.
