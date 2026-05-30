---
document_type: business-glossary-and-rulebook
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applies_to: "okhp3-process-discovery, okhp3-process-narrative, okhp3-bpmn-for-mermaid"
applicability: []
---

## Business Glossary and Rulebook

Provides organization-specific term definitions and standing business rules that skills use to produce consistent, accurate process documentation. Skills read this file to resolve ambiguous terms, populate `business_rules` sections with pre-approved rule text, and prevent contradictory definitions across documents.

---

### Terms

A flat list of canonical terms and their organization-approved definitions. Skills substitute these definitions when a term appears in a PIR or PNS context.

#### Schema

Each term entry contains:

| Field | Type | Required | Description |
|---|---|---|---|
| `term` | string | yes | Canonical term as it should appear in process documents |
| `definition` | string | yes | Plain-language definition (≤200 characters) |
| `synonyms` | string[] | no | Accepted alternative names that resolve to this term |
| `domain` | string | no | Functional area where this term primarily applies (e.g. `procurement`, `hr`, `finance`) |
| `standard_ref` | string | no | Governing standard or regulation that defines this term (e.g. `ISO 9001:2015 §3.4.1`) |

#### Example

```yaml
terms:
  - term: "Process Owner"
    definition: "The individual accountable for the end-to-end performance of a defined process, including its documentation and improvement."
    synonyms: ["process accountable", "process steward"]
    domain: governance
    standard_ref: "ISO 9001:2015 §5.3"

  - term: "Purchase Order"
    definition: "A buyer-issued commercial document authorizing a supplier to deliver goods or services at an agreed price."
    synonyms: ["PO", "purchase request"]
    domain: procurement

  - term: "SLA"
    definition: "Service Level Agreement — a documented commitment between a service provider and a customer specifying performance targets."
    synonyms: ["service level agreement", "service agreement"]
    domain: operations
```

---

### Rules

Standing business rules that apply across processes in this organization. Skills inject these into `business_rules[]` sections of PNS documents when the rule's `scope` matches the process under documentation.

#### Schema

Each rule entry contains:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique rule identifier (e.g. `BR-001`) |
| `description` | string | yes | Plain-language statement of the rule (imperative; ≤200 characters) |
| `source` | string | yes | Governing authority: `policy`, `regulation`, `contract`, or `practice` |
| `source_ref` | string | no | Specific document, section, or regulation (e.g. `Procurement Policy §4.2`) |
| `scope` | string[] | no | Process families or APQC PCF categories where this rule applies |
| `effective_date` | string | no | ISO 8601 date when the rule took effect (e.g. `2025-01-01`) |
| `owner_role_id` | string | no | Role ID of the person responsible for maintaining this rule |

#### Example

```yaml
rules:
  - id: BR-001
    description: "All purchase orders above the approval threshold must have a second-level manager approval before issuance."
    source: policy
    source_ref: "Procurement Policy §4.2"
    scope: [procurement, accounts-payable]
    effective_date: "2024-07-01"
    owner_role_id: procurement_manager

  - id: BR-002
    description: "Vendor master data changes require dual-control verification by Finance and Procurement before activation."
    source: regulation
    source_ref: "SOX IT General Controls"
    scope: [procurement, finance]
    effective_date: "2023-01-01"
    owner_role_id: finance_controller

  - id: BR-003
    description: "Customer complaints must be acknowledged within 24 business hours of receipt."
    source: contract
    source_ref: "Customer Framework Agreement §7.1"
    scope: [customer-service, quality]
    owner_role_id: customer_service_manager
```

---

### Validation Rules

1. Each `term.term` must be unique within the file (case-insensitive)
2. Each `rule.id` must be unique within the file
3. `rule.source` must be one of: `policy`, `regulation`, `contract`, `practice`
4. `term.definition` must be ≤200 characters
5. `rule.description` must be ≤200 characters and begin with an imperative verb

### Usage Contract

Skills read this file at session initialization. If a term in a PIR or PNS matches an entry here, the skill uses the canonical definition without prompting the user. If a rule's `scope` matches the process under documentation, the skill includes it in `business_rules[]` with `source` and `source_ref` pre-populated.

Skills must not invent terms or rules not present in this file. If the glossary is absent, proceed without term substitution and note the absence in `open_questions`.
