---
bp_skill_variable_type: role-dictionary
version: "0.1.0"
last_updated: ""
owner: ""
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"
---

## Role Dictionary

Maps canonical role IDs used across PNS and BPMN diagrams to human-readable titles, departments, and personas. Skills use this to produce consistent, organization-specific naming without requiring the analyst to re-specify roles on every session.

### Required Fields

Each entry in `roles` must include:

| Field | Type | Description |
|---|---|---|
| `role_id` | string | Stable kebab-case identifier used in PNS and BPMN (e.g. `finance_mgr`) |
| `display_name` | string | Human-readable title shown in diagrams and documents (e.g. "Finance Manager") |
| `department` | string | Organizational department or function (e.g. "Finance", "Operations") |

### Optional Fields per entry

| Field | Type | Description |
|---|---|---|
| `persona_type` | string | One of: `human`, `system`, `external-party`, `regulator` |
| `authority_level` | string | One of: `operator`, `supervisor`, `manager`, `director`, `executive` |
| `default_raci` | string | Default RACI designation for this role if unspecified: `R`, `A`, `C`, or `I` |
| `aliases` | string | Comma-separated alternate names (for matching against free-text process descriptions) |

### Usage Contract

When this file is loaded, skills:
- Auto-populate `roles_and_raci.roles[]` in new PNS documents from this dictionary
- Map diagram lane labels to `display_name` rather than raw `role_id`
- Suggest this dictionary's roles first when the analyst names an actor in natural language

Skills must not invent role_ids not in this dictionary for formal PNS documents. They may propose new entries and ask confirmation before using them.

### Validation Rules

1. All `role_id` values must be unique within the file
2. `role_id` must match `[a-z][a-z0-9_]*` (lowercase, underscores allowed, no hyphens)
3. `display_name` must be non-empty and ≤ 80 characters
4. `persona_type` if present must be one of the four enumerated values
5. `authority_level` if present must be one of the five enumerated values

### Example Populated Instance

```yaml
bp_skill_variable_type: role-dictionary
version: "0.1.0"
last_updated: "2026-05-25"
owner: "Enterprise Architecture"
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"

roles:
  - role_id: procurement_specialist
    display_name: "Procurement Specialist"
    department: Procurement
    persona_type: human
    authority_level: operator
    default_raci: R

  - role_id: procurement_mgr
    display_name: "Procurement Manager"
    department: Procurement
    persona_type: human
    authority_level: manager
    default_raci: A

  - role_id: erp_system
    display_name: "ERP System"
    department: IT
    persona_type: system
    default_raci: R
    aliases: "SAP, Oracle, ERP"

  - role_id: supplier
    display_name: "Supplier"
    department: External
    persona_type: external-party
    default_raci: C
```
