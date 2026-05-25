---
document_type: notation-preferences
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applies_to: "okhp3-bpmn-for-mermaid"
applicability: []
---

## Notation Preferences

Specifies the diagram notation and formatting conventions that `okhp3-bpmn-for-mermaid` applies when generating or normalizing `bpmn-beta` diagrams. Preferences here override skill defaults without requiring the analyst to specify them in each session.

### Required Fields

| Field | Type | Description |
|---|---|---|
| `default_structure` | string | One of: `flat`, `single-pool`, `multi-pool` — default structural model |
| `id_style` | string | One of: `short` (s1, t1), `semantic` (approve_request), `prefixed` (T_01, G_01) |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `default_task_type` | string | Default task keyword when type is unspecified: `task`, `task:user`, or `task:service` |
| `label_max_length` | integer | Maximum label character length before a warning is issued (default: 80) |
| `require_acc_title` | boolean | Enforce `accTitle` in every output (default: true) |
| `require_acc_descr` | boolean | Enforce `accDescr` in every output (default: false) |
| `lane_naming_convention` | string | One of: `role-title`, `department`, `system-name` |
| `condition_label_style` | string | One of: `short` ("yes"/"no"), `descriptive` ("Approved by Manager") |
| `allow_experimental_keywords` | boolean | Whether to use `event:message`, `event:timer`, `event:error` (default: false) |
| `normalize_on_generate` | boolean | Auto-run normalization after generation (default: true) |

### Usage Contract

Skills read this file before generating any diagram. If a preference conflicts with a BPMN 2.0 structural rule, the structural rule takes precedence and the conflict is noted.

If absent, skills use these defaults:
- `default_structure`: `single-pool`
- `id_style`: `short`
- `default_task_type`: `task:user`
- `require_acc_title`: `true`
- `condition_label_style`: `descriptive`

### Validation Rules

1. `default_structure` must be one of: `flat`, `single-pool`, `multi-pool`
2. `id_style` must be one of: `short`, `semantic`, `prefixed`
3. `default_task_type` if present must be one of: `task`, `task:user`, `task:service`
4. `label_max_length` if present must be an integer between 20 and 200
5. `condition_label_style` if present must be one of: `short`, `descriptive`

### Example Populated Instance

```yaml
bp_skill_variable_type: notation-preferences
version: "0.1.0"
last_updated: "2026-05-25"
owner: "Enterprise Architecture"
applies_to: "okhp3-bpmn-for-mermaid"

default_structure: single-pool
id_style: semantic
default_task_type: task:user
label_max_length: 80
require_acc_title: true
require_acc_descr: true
lane_naming_convention: role-title
condition_label_style: descriptive
allow_experimental_keywords: false
normalize_on_generate: true
```
