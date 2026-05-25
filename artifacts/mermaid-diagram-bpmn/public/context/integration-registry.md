---
document_type: integration-registry
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applies_to: "okhp3-process-narrative, okhp3-bpmn-for-mermaid"
applicability: []
---

## Integration Registry

Catalogs the organization's enterprise systems and integration touchpoints. Skills use this to auto-populate `systems_and_integrations` in PNS documents and to select the correct task type (`task:service`, `task:receive`, `task:send`) when a known system is an actor in a BPMN diagram.

### Required Fields

Each entry in `systems` must include:

| Field | Type | Description |
|---|---|---|
| `system_id` | string | Stable kebab-case identifier (e.g. `erp-core`, `crm-salesforce`) |
| `system_name` | string | Human-readable display name (e.g. "SAP S/4HANA", "Salesforce CRM") |
| `system_type` | string | One of: `erp`, `crm`, `hrm`, `wms`, `mes`, `ecom`, `iam`, `bi`, `messaging`, `api-gateway`, `other` |

### Optional Fields per entry

| Field | Type | Description |
|---|---|---|
| `vendor` | string | Software vendor name |
| `version` | string | Version or release in use |
| `integration_style` | string | One of: `api-rest`, `api-soap`, `file-sftp`, `event-stream`, `batch`, `rpa`, `manual` |
| `owner_role_id` | string | Role ID from role-dictionary who owns this system |
| `data_classification` | string | One of: `public`, `internal`, `confidential`, `restricted` |
| `aliases` | string | Comma-separated alternate names used in process descriptions |

### Usage Contract

When this registry is loaded:
- `okhp3-process-narrative` pre-populates `systems_and_integrations[]` with systems referenced by name in the PIR elicitation notes
- `okhp3-bpmn-for-mermaid` uses `system_type` to select the appropriate task keyword:
  - `erp`, `crm`, `wms`, `mes`, `iam` → `task:service`
  - `messaging`, `api-gateway` → `task:send` or `task:receive` depending on direction
  - `rpa` → `task:script`

Skills must not invent system_ids not in this registry for formal PNS documents.

### Validation Rules

1. All `system_id` values must be unique within the file
2. `system_id` must match `[a-z][a-z0-9-]*` (kebab-case)
3. `system_type` must be one of the eleven enumerated values
4. `integration_style` if present must be one of the seven enumerated values
5. `data_classification` if present must be one of the four enumerated values

### Example Populated Instance

```yaml
document_type: integration-registry
schema_version: "0.2.0"
last_reviewed: "2026-05-25"
owner: "Enterprise Architecture"
applies_to: "okhp3-process-narrative, okhp3-bpmn-for-mermaid"

systems:
  - system_id: erp-sap
    system_name: "SAP S/4HANA"
    system_type: erp
    vendor: SAP
    version: "2023"
    integration_style: api-rest
    owner_role_id: erp_admin
    data_classification: confidential
    aliases: "SAP, ERP, S4"

  - system_id: crm-salesforce
    system_name: "Salesforce CRM"
    system_type: crm
    vendor: Salesforce
    integration_style: api-rest
    owner_role_id: crm_admin
    data_classification: confidential
    aliases: "Salesforce, SFDC, CRM"

  - system_id: wms-core
    system_name: "Warehouse Management System"
    system_type: wms
    integration_style: batch
    data_classification: internal
    aliases: "WMS"
```
