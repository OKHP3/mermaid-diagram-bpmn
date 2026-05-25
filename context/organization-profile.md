---
document_type: organization-profile
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"
applicability: []
---

## Organization Profile

Provides the organizational context that skills use to tailor PIR intake questions, PNS section defaults, and diagram naming conventions to your specific organization.

### Required Fields

| Field | Type | Description |
|---|---|---|
| `org_name` | string | Legal or operating name of the organization |
| `org_type` | string | One of: `private`, `public`, `nonprofit`, `government`, `cooperative` |
| `primary_language` | string | BCP-47 language tag (e.g. `en-US`, `de-DE`) |
| `process_owner_title` | string | Default title used for process ownership (e.g. "Process Owner", "Responsible Manager") |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `org_short_name` | string | Abbreviation or trading name used in diagrams and document headers |
| `org_size` | string | One of: `micro` (<10), `small` (10–49), `medium` (50–249), `large` (250+) |
| `org_parent` | string | Parent organization name, if applicable |
| `fiscal_year_end` | string | ISO date format `MM-DD` (e.g. `12-31`, `03-31`) |
| `org_website` | string | Public URL |

### Usage Contract

Skills read this file at session initialization. Values are substituted into:
- PIR `process_owner_role_id` defaults
- PNS document headers and `process_owner_role_id` field hints
- BPMN diagram `accTitle` pool labels when actor names are not explicit

Skills must not hallucinate org-specific details if this file is absent. Proceed with generic defaults and note the absence.

### Validation Rules

1. `org_name` must be a non-empty string ≤ 120 characters
2. `org_type` must be one of the five enumerated values
3. `primary_language` must match BCP-47 format (`xx`, `xx-XX`, or `xx-Xxxx-XX`)
4. `process_owner_title` must be a non-empty string ≤ 80 characters

### Example Populated Instance

```yaml
bp_skill_variable_type: organization-profile
version: "0.1.0"
last_updated: "2026-05-25"
owner: "Operations Excellence Team"
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"

org_name: "Meridian Supply Co."
org_short_name: "Meridian"
org_type: private
org_size: medium
primary_language: en-US
process_owner_title: "Process Accountable Manager"
fiscal_year_end: "12-31"
```
