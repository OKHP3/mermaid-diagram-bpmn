# PIR Schema Reference

## Overview

The Process Intake Record (PIR) is the root artifact of the BP-SKILL suite. Every downstream skill
consumes the PIR directly or transitively.

## Required Fields

| Field | Type | Description |
|---|---|---|
| `pir_version` | string | Schema version — always `"0.1"` |
| `process_id` | string | Stable process identifier (e.g. `proc-purchase-approval`) |
| `process_name` | string | Human-readable process name |
| `process_owner` | string | Role (not person) who owns the process |
| `department` | string | Owning department |
| `elicitation_method` | enum | `interview \| workshop \| observation \| document-analysis \| survey` |
| `elicitation_date` | date | ISO 8601 date |
| `elicited_by` | string | Role of the analyst conducting elicitation |
| `status` | enum | `draft \| review \| complete` |
| `trigger.description` | string | Human-readable trigger description |
| `trigger.event_type` | enum | `manual \| scheduled \| message \| system` |

## Actor Fields

Each entry in `actors[]`:

| Field | Type | Required | Description |
|---|---|---|---|
| `role_id` | string | yes | Stable role identifier (e.g. `role-requester`) |
| `role_name` | string | yes | Human-readable role name |
| `department` | string | no | Defaults to `"Unspecified"` |
| `type` | enum | yes | `initiator \| performer \| approver \| reviewer \| notified \| system` |
| `interest` | string | no | Defaults to `"outcome quality"` |
| `influence` | enum | no | `high \| medium \| low` — defaults to `"medium"` |

**Minimum:** at least one `initiator` and one `performer` or `approver`.

## Step Fields

Each entry in `steps[]`:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Stable step identifier (e.g. `step-001`) |
| `description` | string | yes | Single imperative action statement |
| `actor_role_id` | string | yes | References `actors[].role_id` |
| `system` | string | no | System or tool used |

**Minimum:** at least 3 steps for handoff readiness.

## Business Rule Fields

Each entry in `business_rules[]`:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Stable rule identifier (e.g. `rule-001`) |
| `description` | string | yes | Rule statement |
| `source` | enum | yes | `policy \| regulation \| contract \| practice` |

## Exception Fields

Each entry in `exceptions[]`:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Stable exception identifier (e.g. `exc-001`) |
| `description` | string | yes | Exception description |
| `trigger` | string | yes | What causes this exception |
| `handling` | string | yes | Recovery procedure |

## Validation Section

The `validation` block is computed — do not author manually:

```yaml
validation:
  completeness_score: 85
  ready_for_narrative: true
```

## Handoff Readiness Threshold

Score ≥ 70 → `ready_for_narrative: true` → proceed to `stakeholder-and-role-mapping` and `process-narrative-authoring`.

Score < 70 → record which sections are missing and ask targeted follow-up questions.
