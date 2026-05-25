---
document_type: process-taxonomy
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"
applicability: []
---

## Process Taxonomy

Defines the organization's process hierarchy — the set of named process families, categories, and individual processes that PIR and PNS documents are organized under. Skills use this taxonomy to assign APQC PCF mappings, suggest related processes, and maintain consistent process ID numbering.

### Required Fields

| Field | Type | Description |
|---|---|---|
| `taxonomy_version` | string | Semantic version of this taxonomy (e.g. `1.0.0`) |
| `id_prefix` | string | Prefix used for process IDs in PIR and PNS (e.g. `proc-`, `P-`, `BPA-`) |
| `next_id_sequence` | integer | Next available process ID number (incremented after each new PIR) |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `families` | list | Top-level process families (see schema below) |
| `id_padding` | integer | Zero-pad width for ID numbers (default: 3 → `proc-001`) |
| `retired_ids` | string | Comma-separated IDs that have been retired and must not be reused |

### Process Family Schema

Each entry in `families` must include:
- `family_id`: string — unique kebab-case identifier
- `family_name`: string — display name
- `apqc_category`: string — APQC PCF category reference
- `processes`: list — (optional) known processes under this family with `process_id`, `process_name`, `status`

### Usage Contract

Skills use this file to:
- Assign the next `process_id` automatically when starting a new PIR
- Pre-populate `apqc_pcf_mapping` in the PNS with the family's APQC category
- Warn the analyst if a proposed new process duplicates an existing `process_name`

If absent, skills use `proc-` prefix and start numbering at 001.

### Validation Rules

1. `id_prefix` must be a non-empty string ≤ 10 characters
2. `next_id_sequence` must be a positive integer
3. `id_padding` if present must be an integer between 1 and 6
4. All `family_id` values must be unique within the `families` list
5. All `process_id` values within `processes` must be unique across the entire file

### Example Populated Instance

```yaml
bp_skill_variable_type: process-taxonomy
version: "0.1.0"
last_updated: "2026-05-25"
owner: "Process Excellence COE"
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"

taxonomy_version: "1.0.0"
id_prefix: "proc-"
id_padding: 3
next_id_sequence: 4

families:
  - family_id: procure-to-pay
    family_name: "Procure to Pay"
    apqc_category: "9.0 Manage Financial Resources"
    processes:
      - process_id: proc-001
        process_name: Purchase Approval
        status: approved

  - family_id: order-to-cash
    family_name: "Order to Cash"
    apqc_category: "4.0 Deliver Products and Services"
    processes:
      - process_id: proc-003
        process_name: Quote to Order
        status: approved
```
