---
document_type: compliance-controls-registry
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applies_to: "okhp3-process-narrative"
applicability: []
---

## Compliance Controls Registry

Provides the organization's standard compliance controls that `okhp3-process-narrative` automatically inserts into the `controls_and_compliance` section of new PNS documents. Eliminates the need to re-specify recurring controls (SOX, ISO 9001, GDPR, etc.) in every process narrative.

### Required Fields

Each entry in `controls` must include:

| Field | Type | Description |
|---|---|---|
| `control_id` | string | Stable identifier (e.g. `ctrl-SOX-404`, `ctrl-ISO9001-8.4`) |
| `name` | string | Short human-readable control name |
| `framework` | string | Governing framework (e.g. `SOX`, `ISO 9001:2015`, `GDPR`, `HIPAA`) |
| `description` | string | What this control requires in plain language |

### Optional Fields per entry

| Field | Type | Description |
|---|---|---|
| `applies_to_process_families` | string | Comma-separated process family IDs from process-taxonomy (blank = all) |
| `evidence_required` | string | What audit evidence must be retained |
| `review_frequency` | string | How often the control effectiveness must be reviewed |
| `owner_role_id` | string | Role ID from role-dictionary who owns this control |
| `waiver_procedure` | string | How a process can obtain a documented waiver |

### Usage Contract

When this registry is loaded, `okhp3-process-narrative`:
- Pre-populates `controls_and_compliance[]` with applicable controls for the process family
- Marks pre-populated controls with `source: registry` so analysts know they are standardized
- Warns (V7) when a process activity is not covered by any control and has no waiver

Skills must not modify registry entries. They may propose additions to the registry as a separate step.

### Validation Rules

1. All `control_id` values must be unique within the file
2. `framework` must be a non-empty string ≤ 60 characters
3. `description` must be ≥ 20 characters and ≤ 500 characters
4. `owner_role_id` if present must match a `role_id` in the role-dictionary

### Example Populated Instance

```yaml
document_type: compliance-controls-registry
schema_version: "0.2.0"
last_reviewed: "2026-05-25"
owner: "Internal Audit"
applies_to: "okhp3-process-narrative"

controls:
  - control_id: ctrl-SOX-approval
    name: "SOX Segregation of Duties — Approval"
    framework: "SOX Section 404"
    description: "No single individual may both initiate and approve a financial transaction above $1,000."
    applies_to_process_families: "procure-to-pay, order-to-cash"
    evidence_required: "Signed approval log or system-generated approval record"
    review_frequency: quarterly
    owner_role_id: finance_mgr

  - control_id: ctrl-ISO9001-record-keeping
    name: "ISO 9001 Process Record Retention"
    framework: "ISO 9001:2015 §7.5"
    description: "Documented process records must be retained for a minimum of three years and retrievable within 24 hours."
    applies_to_process_families: ""
    evidence_required: "Record storage location and retention log"
    review_frequency: annually
    owner_role_id: quality_mgr
```
