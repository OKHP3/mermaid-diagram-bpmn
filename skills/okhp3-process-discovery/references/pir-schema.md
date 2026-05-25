# PIR Schema Reference

The Process Intake Record (PIR) is a YAML document capturing structured elicitation results.
It is the primary handoff artifact from `okhp3-process-discovery` to `okhp3-process-narrative`.

## Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `pir_version` | string | Yes | Schema version. Use `"0.1"`. |
| `process_id` | string | Yes | Unique identifier (e.g. `proc-001`). |
| `process_name` | string | Yes | Short, descriptive process name. |
| `process_owner` | string | Yes | Role name of the process owner (not a person name). |
| `department` | string | Yes | Primary owning department or business unit. |
| `elicitation_method` | enum | Yes | One of: `interview`, `workshop`, `observation`, `document-analysis`, `survey`. |
| `elicitation_date` | string | No | ISO 8601 date (e.g. `2026-05-25`). |
| `elicited_by` | string | No | Role of the person who conducted elicitation. |
| `status` | enum | Yes | One of: `draft`, `review`, `complete`. |

## Trigger Section

| Field | Type | Required | Description |
|---|---|---|---|
| `trigger.description` | string | Yes | What initiates this process. |
| `trigger.event_type` | enum | Yes | One of: `manual`, `scheduled`, `message`, `system`. |

## Actors Array

Each actor entry:

| Field | Type | Required | Description |
|---|---|---|---|
| `role_id` | string | Yes | Short identifier (e.g. `req`, `mgr`). |
| `role_name` | string | Yes | Human-readable role name. |
| `department` | string | No | Department or team. |
| `type` | enum | Yes | One of: `initiator`, `performer`, `approver`, `reviewer`, `notified`, `system`. |
| `interest` | string | No | What this actor cares about in the process outcome. |
| `influence` | enum | No | One of: `high`, `medium`, `low`. |

**Validation rule:** At least 2 actors required. At least one `initiator`. At least one `performer` or `approver`.

## Inputs Array

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Short identifier. |
| `name` | string | Yes | Input artifact or data name. |
| `source` | string | No | Where the input originates. |
| `format` | string | No | Format (e.g. `form`, `email`, `API`, `document`). |

## Outputs Array

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Short identifier. |
| `name` | string | Yes | Output artifact or data name. |
| `consumer` | string | No | Role or system that consumes this output. |
| `format` | string | No | Format (e.g. `record`, `notification`, `report`). |

## Steps Array

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Short identifier (e.g. `step-01`). |
| `description` | string | Yes | Single imperative sentence describing the activity. |
| `actor_role_id` | string | Yes | References an `actors[].role_id`. |
| `system` | string | No | System used in this step. |

**Validation rule:** At least 3 steps required for a minimally viable PIR.

## Exceptions Array

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Short identifier. |
| `description` | string | Yes | What can go wrong or diverge from the normal path. |
| `trigger` | string | No | What causes this exception. |
| `handling` | string | No | How the exception is resolved or escalated. |

## Business Rules Array

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Short identifier (e.g. `br-01`). |
| `description` | string | Yes | The rule as a declarative statement. |
| `source` | enum | No | One of: `policy`, `regulation`, `contract`, `practice`. |

## Systems Array

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | System or tool name. |
| `role` | enum | No | One of: `source`, `destination`, `processor`, `notification`. |
| `integration_type` | enum | No | One of: `manual`, `api`, `batch`, `ui`. |

## Controls Array

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Short identifier. |
| `type` | enum | Yes | One of: `approval`, `audit`, `segregation`, `validation`. |
| `description` | string | Yes | What the control does. |
| `enforced_by` | string | No | Role or system that enforces it. |

## Open Questions Array

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Short identifier. |
| `question` | string | Yes | The open question. |
| `owner` | string | No | Role responsible for answering. |

## Validation Block

Populated by `validate-pir.mjs` and `score-intake-completeness.mjs`:

| Field | Type | Description |
|---|---|---|
| `completeness_score` | integer 0–100 | Weighted section score. |
| `ready_for_narrative` | boolean | True if score ≥ 70. |
