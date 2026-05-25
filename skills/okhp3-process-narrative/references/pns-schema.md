# PNS Schema Reference

Full field-level documentation for Process Narrative Specification (PNS) YAML files.
Use `assets/pns-template.yaml` as the authoring starting point.

---

## Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `pns_version` | string | Yes | Schema version — use `"0.1"` |
| `process_id` | string | Yes | Unique identifier matching PIR `process_id` (e.g. `proc-001`) |
| `process_name` | string | Yes | Human-readable process name |
| `process_owner_role_id` | string | Yes | Role ID of the process owner from stakeholder register |
| `version` | string | Yes | Document version (e.g. `"1.0"`, `"2.3"`) |
| `status` | string | Yes | One of: `draft`, `review`, `approved`, `published` |
| `effective_date` | string | No | ISO 8601 date when process version takes effect |
| `review_cycle` | string | No | How often reviewed: `annual`, `semi-annual`, `quarterly` |
| `retention_period` | string | No | How long records are retained (e.g. `"3 years"`) |
| `apqc_pcf_mapping` | string | No | APQC Process Classification Framework level-2 mapping |

---

## babok_core_concepts

Six fields anchoring the process to the BABOK v3 Core Concept Model (see `babok-core-concept-model.md`).

| Field | Description |
|---|---|
| `change` | What changes as a result of this process completing successfully? |
| `need` | What business need, problem, or opportunity does this process address? |
| `solution` | What solution (capability, product, or service) satisfies the need? |
| `stakeholders` | Who is impacted, involved, or has an interest in this process? |
| `value` | What measurable value does this process deliver to the organization or customer? |
| `context` | What environment, scope, or constraints does this process operate within? |

---

## sections

### process_box

ISO 9001 §4.4.1 process-box semantics. Documents the process as a system.

| Field | Type | Description |
|---|---|---|
| `trigger` | string | Event or condition that initiates the process |
| `inputs` | array | Each item: `name` (what enters), `source` (where it comes from) |
| `outputs` | array | Each item: `name` (what is produced), `consumer` (who receives it) |
| `criteria` | string | Completion or acceptance criteria for the process |
| `resources` | string | Resources (systems, tools, people capacity) required |
| `responsibilities` | string | Who owns and who performs the process |
| `risks` | string | Key process risks and their mitigations |

### activity_sequence

Ordered list of activities describing HOW the process is performed.

Each activity item:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique activity identifier (e.g. `act-01`) |
| `description` | string | Single imperative statement (IEEE 29148) |
| `actor_role_id` | string | Role ID of the performer |
| `inputs` | array of strings | Names of inputs consumed by this activity |
| `outputs` | array of strings | Names of outputs produced |
| `systems` | array of strings | Systems used |
| `preconditions` | string | What must be true before activity starts |
| `postconditions` | string | What is guaranteed true after activity completes |

### roles_and_raci

RACI matrix. Documents role responsibilities per activity.

**roles:** Array of `{ role_id, role_name }` — all roles involved in the process.

**raci_matrix:** One entry per activity.

| Field | Type | Description |
|---|---|---|
| `activity_id` | string | References `activity_sequence.activities[i].id` |
| `responsible` | array | Role IDs who do the work (at least one) |
| `accountable` | string | Single role ID — the one answerable for the outcome |
| `consulted` | array | Role IDs whose input is sought before acting |
| `informed` | array | Role IDs who are notified after acting |

### business_rules

Rules that constrain or govern process behavior.

Each rule: `id`, `description`, `source` (policy/regulation/contract/practice), `applies_to` (activity_id or `"all"`), `rationale`.

### decision_points

Explicit decision gates within the process.

Each decision: `id`, `description`, `activity_id` (where it occurs), `criteria` (how the decision is made), `outcomes` (array of `{ label, next_activity }`).

Must have ≥2 outcomes per decision (V6).

### exception_paths

Documented exception and escalation paths.

Each exception: `id`, `description`, `trigger`, `handling`, `owner_role_id`, `escalation_path`.

`handling` must be non-empty (V6).

### kpis

Key performance indicators for measuring process effectiveness.

Each KPI: `id`, `name`, `formula` (calculation expression — required for V5), `data_source` (where the data comes from — required for V5), `target`, `frequency`.

### systems_and_integrations

Systems involved in process execution.

Each entry: `system_name`, `role` (e.g. `processor`, `repository`, `notifier`), `integration_type` (e.g. `ui`, `api`, `manual`), `activities_supported` (array of activity_ids).

### controls_and_compliance

Compliance controls applied to the process.

Each control: `id`, `type` (e.g. `preventive`, `detective`, `corrective`), `description`, `standard_ref` (e.g. `"ISO 9001 §8.4.1"`), `activities_covered` (array of activity_ids), `waiver` (if not applicable, reason why).

### open_questions

Unresolved items requiring clarification before approval.

Each item: `id`, `question`, `owner_role_id`, `target_resolution_date`.

### revision_history

Document change log.

Each entry: `version`, `date` (ISO 8601), `author_role`, `summary`.

### validation (computed — do not author manually)

| Field | Description |
|---|---|
| `pns_quality_score` | 0–100 score from `score-pns-quality.mjs` |
| `ready_for_publication` | `true` when score ≥ 75 |
| `ready_for_bpmn_modeling` | `true` when V1–V3 pass |
