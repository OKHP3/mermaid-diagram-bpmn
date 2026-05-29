---
document_type: regional-context
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"
applicability: []
---

## Regional Context

Provides the geographic and jurisdictional context that skills use to apply correct regulatory references, currency, date formats, and locale-specific compliance controls.

### Required Fields

| Field | Type | Description |
|---|---|---|
| `primary_jurisdiction` | string | ISO 3166-1 alpha-2 country code (e.g. `US`, `DE`, `GB`, `CA`) |
| `currency` | string | ISO 4217 currency code (e.g. `USD`, `EUR`, `GBP`) |
| `date_format` | string | One of: `ISO8601` (YYYY-MM-DD), `US` (MM/DD/YYYY), `EU` (DD/MM/YYYY) |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `sub_jurisdiction` | string | State, province, or region (e.g. `CA`, `Bavaria`, `Ontario`) |
| `additional_jurisdictions` | string | Comma-separated ISO 3166-1 codes for multi-jurisdiction operations |
| `time_zone` | string | IANA timezone identifier (e.g. `America/New_York`, `Europe/Berlin`) |
| `data_privacy_regime` | string | Applicable privacy law framework (e.g. `GDPR`, `CCPA`, `PIPEDA`, `LGPD`) |
| `labor_law_framework` | string | Primary labor law context affecting approval and escalation rules |

### Usage Contract

Skills use this file to:
- Apply jurisdiction-correct date and currency formatting in PNS documents
- Include appropriate `controls_and_compliance` entries for data privacy (e.g. GDPR consent requirements)
- Warn when a process step implies cross-border data transfer without a stated legal basis

If absent, skills use ISO 8601 dates, generic currency references, and do not apply jurisdiction-specific compliance warnings.

### Validation Rules

1. `primary_jurisdiction` must be a valid ISO 3166-1 alpha-2 code (2 uppercase letters)
2. `currency` must be a valid ISO 4217 code (3 uppercase letters)
3. `date_format` must be one of: `ISO8601`, `US`, `EU`
4. `time_zone` if present must be a valid IANA timezone string

### Example Populated Instance

```yaml
document_type: regional-context
schema_version: "0.2.0"
last_reviewed: "2026-05-25"
owner: "Legal and Compliance"
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"

primary_jurisdiction: US
sub_jurisdiction: NC
additional_jurisdictions: "CA, MX"
currency: USD
date_format: ISO8601
time_zone: America/New_York
data_privacy_regime: CCPA
```
