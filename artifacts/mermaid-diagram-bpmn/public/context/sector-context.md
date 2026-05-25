---
document_type: sector-context
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"
applicability: []
---

## Sector Context

Provides the industry sector context that skills use to select appropriate APQC PCF category defaults, regulatory vocabulary, and sector-typical process archetypes.

### Required Fields

| Field | Type | Description |
|---|---|---|
| `sector` | string | Primary industry sector (e.g. `manufacturing`, `financial-services`, `healthcare`, `retail`, `logistics`) |
| `apqc_pcf_category` | string | Top-level APQC PCF category number and name (e.g. `1.0 Develop Vision and Strategy`) |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `sub_sector` | string | More specific vertical (e.g. `automotive-OEM`, `commercial-banking`, `acute-care`) |
| `naics_code` | string | 6-digit NAICS code for the primary business activity |
| `sic_code` | string | 4-digit SIC code (legacy — include if your org uses it) |
| `regulatory_bodies` | string | Comma-separated list of primary regulators (e.g. `FDA, EMA`) |
| `typical_process_archetypes` | string | Comma-separated process families relevant to this sector (e.g. `order-to-cash, procure-to-pay`) |

### Usage Contract

Skills use this file to:
- Pre-populate `apqc_pcf_mapping` in the PNS with the correct APQC category
- Suggest sector-typical BABOK stakeholder types during PIR intake
- Warn when a requested BPMN process pattern is atypical for the stated sector

If absent, skills default to generic APQC mappings and do not apply sector-specific validation.

### Validation Rules

1. `sector` must be a non-empty kebab-case string ≤ 60 characters
2. `apqc_pcf_category` must start with a numeric code followed by a space and category name
3. `naics_code` if present must be exactly 6 digits
4. `sic_code` if present must be exactly 4 digits

### Example Populated Instance

```yaml
document_type: sector-context
schema_version: "0.2.0"
last_reviewed: "2026-05-25"
owner: "Business Architecture Team"
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"

sector: manufacturing
sub_sector: industrial-distribution
naics_code: "423840"
apqc_pcf_category: "4.0 Deliver Products and Services"
typical_process_archetypes: "procure-to-pay, order-to-cash, plan-to-produce"
regulatory_bodies: "OSHA, EPA"
```
