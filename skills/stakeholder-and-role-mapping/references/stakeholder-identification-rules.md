# Stakeholder Identification Rules

## Actor Type Definitions

| Type | Definition | Engagement strategy |
|---|---|---|
| `initiator` | The role that starts the process | Collaborate |
| `performer` | A role that executes one or more process steps | Collaborate |
| `approver` | A role with authority to approve, reject, or stop the process | Consult |
| `reviewer` | A role that checks quality or completeness without final authority | Consult |
| `notified` | A role that must be informed of the outcome but does no process work | Inform |
| `system` | An automated system that performs steps without human intervention | Monitor |

## Influence–Interest Grid

Plot each stakeholder on the 2×2 grid to determine management approach:

| | Low Interest | High Interest |
|---|---|---|
| **High Influence** | Keep Satisfied | Manage Closely |
| **Low Influence** | Monitor | Keep Informed |

### Grid placement rules

- `approver` with `influence: high` → Manage Closely
- `approver` with `influence: medium` or `low` → Keep Satisfied
- `performer` with `influence: high` → Manage Closely
- `performer` with `influence: medium` → Keep Informed
- `reviewer` → Consult / Keep Informed
- `notified` → Monitor or Keep Informed
- `system` → Monitor

## Defaults When Fields Are Missing

| Missing field | Default value |
|---|---|
| `department` | `"Unspecified"` |
| `interest` | `"outcome quality"` |
| `influence` | `"medium"` |

## Minimum Register Requirements

- At least one entry with `engagement_strategy: Collaborate`
- At least one entry with `engagement_strategy: Consult` or `grid_position: Manage Closely`
- No entry with empty `stakeholder_id`
- All `influence` values must be: `high`, `medium`, or `low`

## Derivation Algorithm

```
for each actor in pir.actors:
  stakeholder.stakeholder_id = actor.role_id
  stakeholder.name = actor.role_name
  stakeholder.department = actor.department || "Unspecified"
  stakeholder.primary_role = actor.type
  stakeholder.interest = actor.interest || "outcome quality"
  stakeholder.influence = actor.influence || "medium"
  stakeholder.engagement_strategy = engagementMap[actor.type]
  stakeholder.grid_position = gridMap[actor.type][actor.influence]
```
