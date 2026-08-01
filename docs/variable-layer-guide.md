# Variable Layer Guide

Configuration guide for the 9 context files that tailor the BP-SKILL suite to a specific organisation.

---

## Why the variable layer exists

The vocabulary alignment problem is the most common failure mode in business process documentation projects. BABOK calls it a "task". BPM CBOK calls it an "activity". Your organisation calls it a "work step". The APQC PCF assigns it a taxonomy code. Your GRC tool assigns it a control ID. Your HR system uses a job title that matches none of the above.

Without a vocabulary alignment layer, an AI agent producing process documentation either picks one vocabulary arbitrarily or produces generic output that requires manual rewriting before it is usable. The variable layer solves this by encoding your organisation's specific vocabulary, role names, taxonomy mappings, and control references once — in files that every skill reads at session initialisation.

The 9 variable files also enable reproducibility. A skill run without variable files produces different output each time depending on what the agent infers from context. A skill run with a complete variable layer produces consistent, organisation-calibrated output across sessions, agents, and platforms.

---

## Recommended completion order

Complete the variable files in this order. Each file you complete unlocks more calibrated output from the skills that consume it.

1. `organization-profile.md` — the foundation; read by all 15 skills
2. `role-dictionary.md` — required for any RACI, stakeholder register, or lane assignment
3. `process-taxonomy.md` — required for APQC classification in PNS.md and SIPOC
4. `sector-context.md` — required for industry-specific vocabulary and regulatory references
5. `regional-context.md` — required for jurisdiction-specific compliance and language variants
6. `compliance-controls-registry.md` — required for Section 11 of PNS.md and skill 11
7. `integration-registry.md` — required for Section 7 of PNS.md (system touchpoints)
8. `notation-preferences.md` — required for skill 06 (okhp3-visual-process-modeling) output format
9. `business-glossary-and-rulebook.md` — the last file to complete; needs roles, systems, and processes defined first

**Minimum viable configuration:** Files 1 and 2. The remaining 7 files are optional until the skills that specifically consume them are triggered. Skills degrade gracefully when variable files are absent — they use generic defaults and flag the gap in their output rather than failing.

---

## 1. organization-profile.md

**Purpose:** The root context file. Establishes the organisation's identity, industry, process maturity, regulatory environment, and language. Read by all 15 skills at session initialisation to anchor every output in the correct organisational context.

**Required fields:**

| Field | Type | Description | Example |
|---|---|---|---|
| `org_name` | string | Legal or trading name | `"Acme Corporation"` |
| `org_type` | string | Commercial, NFP, government, etc. | `"private-commercial"` |
| `primary_language` | string | BCP 47 language tag | `"en-AU"` |
| `industry` | string | ANZSIC/NAICS/SIC classification or plain description | `"Financial Services"` |
| `process_owner_title` | string | The role title used for process accountability in this org | `"Process Owner"` |
| `process_maturity_level` | integer | CMMI or BPM-Maturity level 1-5 | `2` |

**Optional fields:**

| Field | Type | Description | Example |
|---|---|---|---|
| `regulatory_environment` | array | Applicable regulatory frameworks | `["APRA CPS 234", "SOX"]` |
| `geographic_scope` | array | Countries or regions of operation | `["AU", "NZ"]` |
| `employee_count_range` | string | Band for context | `"500-2000"` |
| `quality_management_system` | string | QMS standard in use | `"ISO 9001:2015"` |

**Which skills read it:** All 15.

**Validation rules:** If `org_name` is absent or empty, skills produce output with `[ORG NAME]` placeholders. If `primary_language` is absent, output defaults to `en-US`. If `process_maturity_level` is outside 1-5, skill 01 will warn that intake recommendations cannot be tailored to maturity level.

---

## 2. role-dictionary.md

**Purpose:** Defines all named roles with stable IDs that skills use when writing stakeholder registers, RACI matrices, and lane assignments in bpmn-beta diagrams. Without this file, skills generate generic role names (Process Owner, Subject Matter Expert, Approver) that require manual replacement.

**Required fields (per role entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `role_id` | string | Stable uppercase identifier, never changes | `"ROLE-001"` |
| `role_title` | string | The exact job title used in this organisation | `"Procurement Manager"` |
| `department` | string | Organisational unit | `"Supply Chain"` |
| `raci_default` | string | Default RACI assignment for this role | `"A"` |

**Optional fields (per role entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `reports_to` | string | role_id of the manager role | `"ROLE-005"` |
| `hr_system_id` | string | ID in the HR system for import/export | `"HRS-2041"` |
| `abbreviation` | string | Short form used in diagrams | `"PM"` |
| `lane_label` | string | Label for bpmn-beta lane declaration | `"Procurement"` |

**Which skills read it:** Skills 02, 04, 05, 06, 12, 13, 14, 15.

**Validation rules:** V3 in okhp3-process-validation-scoring checks that every role referenced in PNS.md Section 5 exists in this file. Missing role IDs fail V3. Duplicate `role_id` values are rejected by the validator — each role must have a unique ID.

---

## 3. process-taxonomy.md

**Purpose:** Maps your organisation's internal process names to APQC PCF codes. Enables skills to classify every process with dual taxonomy IDs (v7.4 and v8.0) for benchmarking and audit trail purposes, and to map internal process names to the standard hierarchy without asking the practitioner to look up APQC codes manually.

**Required fields (per process entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `process_id` | string | Internal process identifier | `"PROC-001"` |
| `process_name` | string | Internal process name | `"PO Approval"` |
| `apqc_id_v74` | string | APQC PCF v7.4 element ID | `"13107.0"` |
| `apqc_id_v80` | string | APQC PCF v8.0 element ID | `"13107.1"` |
| `apqc_level` | integer | APQC hierarchy level (1-5) | `4` |

**Optional fields (per process entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `apqc_name` | string | APQC's name for this process | `"Process purchase orders"` |
| `parent_process_id` | string | Internal ID of the parent process | `"PROC-000"` |
| `lifecycle_phase` | string | Where in the business lifecycle | `"Acquire"` |

**Which skills read it:** Skills 01, 04, 05, 10, 14, 15.

**APQC PCF dual-tagging rule:** Every process entry must include both `apqc_id_v74` and `apqc_id_v80`. As the APQC migrates clients from v7.4 to v8.0, outputs must carry both IDs to remain useful across both schema versions. If only one version is known, include it in the known field and set the other to `"TBD"` — the validator will warn but not fail on `"TBD"` values.

**Validation rules:** If `apqc_id_v74` or `apqc_id_v80` is missing entirely (not `"TBD"`), skill 14 (SIPOC generation) will warn that APQC classification cannot be completed. Skill 10 will flag V9 if a PNS.md claims APQC alignment but the referenced process ID is not in this file.

---

## 4. sector-context.md

**Purpose:** Provides industry-specific vocabulary, acronym definitions, regulatory standards, and the APQC PCF sector profile that applies to this organisation. Skills use this file to use correct industry terminology (not generic business-analysis terms) in all outputs.

**Required fields:**

| Field | Type | Description | Example |
|---|---|---|---|
| `sector` | string | Industry sector, plain language | `"Retail Banking"` |
| `apqc_sector_profile` | string | APQC sector profile name | `"Financial Services"` |
| `primary_regulatory_standard` | string | Most important regulatory framework | `"APRA CPS 234"` |

**Optional fields:**

| Field | Type | Description | Example |
|---|---|---|---|
| `sector_vocabulary` | array of objects | Industry-specific terms with definitions | `[{term: "AML", definition: "Anti-Money Laundering compliance programme"}]` |
| `additional_standards` | array | Secondary regulatory frameworks | `["Basel III", "GDPR"]` |
| `banned_terms` | array | Terms never used in this industry (replace with what?) | `[{avoid: "customer complaint", use: "client feedback"}]` |

**Which skills read it:** Skills 01, 02, 03, 04, 05, 07, 10, 15.

**Validation rules:** If absent, skills default to generic cross-industry vocabulary. No hard validation failures — the skill flags the absence in its output.

---

## 5. regional-context.md

**Purpose:** Specifies jurisdictional requirements, language variants, date and currency conventions, and compliance frameworks specific to the regions in which the organisation operates. Enables skills to produce documentation that is compliant in the relevant jurisdiction without requiring the practitioner to specify it per session.

**Required fields:**

| Field | Type | Description | Example |
|---|---|---|---|
| `primary_jurisdiction` | string | ISO 3166-1 alpha-2 country code | `"AU"` |
| `date_format` | string | Date format preference | `"DD/MM/YYYY"` |
| `currency` | string | ISO 4217 currency code | `"AUD"` |

**Optional fields:**

| Field | Type | Description | Example |
|---|---|---|---|
| `additional_jurisdictions` | array | Other countries of operation | `["NZ", "SG"]` |
| `language_variants` | object | Terminology differences by region | `{AU: {color: "colour"}, US: {color: "color"}}` |
| `compliance_frameworks` | array | Jurisdiction-specific frameworks | `["Privacy Act 1988", "ASIC RG 271"]` |
| `timezone` | string | IANA timezone | `"Australia/Sydney"` |

**Which skills read it:** Skills 11, 12, 15.

**Validation rules:** No hard validation failures. Skills will default to `en-US` conventions and UTC timestamps when this file is absent.

---

## 6. compliance-controls-registry.md

**Purpose:** Provides the organisation's internal control inventory with stable IDs. Skills use this file to link process activities to existing controls in Section 11 of PNS.md, generating audit-ready traceability without requiring the practitioner to look up control IDs manually.

**Required fields (per control entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `control_id` | string | Stable internal control identifier | `"CTRL-001"` |
| `control_name` | string | Short descriptive name | `"Segregation of Duties — PO Approval"` |
| `control_type` | string | `"preventive"`, `"detective"`, or `"corrective"` | `"preventive"` |
| `framework` | string | Compliance framework this control satisfies | `"ISO 9001:2015 §8.1"` |

**Optional fields (per control entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `grc_system_id` | string | ID in the GRC tool | `"GRC-4421"` |
| `evidence_requirement` | string | What evidence satisfies this control | `"Signed approval record"` |
| `frequency` | string | How often the control is exercised | `"per transaction"` |
| `control_owner` | string | role_id of the control owner | `"ROLE-004"` |

**Which skills read it:** Skills 10, 11, 15.

**Validation rules:** V9 in skill 10 checks that control IDs in PNS.md Section 11 exist in this file. Missing control IDs fail V9 unless the control is new and explicitly flagged as `"proposed"` in the PNS.md section.

---

## 7. integration-registry.md

**Purpose:** Provides the organisation's named system inventory with stable IDs. Skills use this file to resolve system names in PNS.md Section 7 (System Touchpoints) and in bpmn-beta diagrams, ensuring that system references are consistent and traceable across all process documents.

**Required fields (per system entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `system_id` | string | Stable internal system identifier | `"SYS-001"` |
| `system_name` | string | Common name used in the organisation | `"Workday"` |
| `system_type` | string | Category of system | `"HRIS"` |
| `owner_role_id` | string | role_id of the system owner | `"ROLE-007"` |

**Optional fields (per system entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `vendor` | string | Software vendor name | `"Workday Inc."` |
| `integration_type` | string | How processes interact with it | `"API"`, `"manual"`, `"batch"` |
| `environment` | string | `"production"`, `"staging"`, `"test"` | `"production"` |
| `data_classification` | string | Data sensitivity level | `"Confidential"` |

**Which skills read it:** Skills 04, 05, 06, 10, 15.

**Validation rules:** V5 in skill 10 checks that every `system_id` referenced in PNS.md Section 7 exists in this file. Missing system IDs fail V5. Skill 06 (okhp3-visual-process-modeling) uses system IDs as annotation labels in bpmn-beta diagrams — unresolved IDs produce placeholder text in the diagram.

---

## 8. notation-preferences.md

**Purpose:** Configures the output format and visual style for all diagram-producing skills. Sets the diagram notation (bpmn-beta by default), renderer target, colour palette, and labelling conventions. Without this file, skills default to bpmn-beta notation with the default palette.

**Required fields:**

| Field | Type | Description | Example |
|---|---|---|---|
| `primary_notation` | string | Diagram notation for skill 06 output | `"bpmn-beta"` |
| `renderer_target` | string | Where diagrams will be rendered | `"github-markdown"` |

**Optional fields:**

| Field | Type | Description | Example |
|---|---|---|---|
| `palette` | object | Custom colours for diagram elements | `{task: "#4A9EBF", gateway: "#CC8B30"}` |
| `lane_label_position` | string | `"top"` or `"left"` | `"left"` |
| `use_icons` | boolean | Whether to include task type icons | `true` |
| `max_lane_width` | integer | Max lane width in diagram units | `200` |
| `secondary_notation` | string | Fallback if primary not available | `"mermaid-flowchart"` |

**Which skills read it:** Skill 06 (okhp3-visual-process-modeling).

**Validation rules:** If `primary_notation` is not `"bpmn-beta"`, skill 06 will warn that bpmn-beta is the only notation currently supported by the renderer. The field is present for future extensibility.

---

## 9. business-glossary-and-rulebook.md

**Purpose:** Defines the organisation's controlled vocabulary and business rules. Skills use this file to enforce consistent terminology throughout all outputs and to resolve ambiguous terms without asking the practitioner for clarification. Complete this file last — it should reference roles, systems, and processes already defined in files 1-7.

**Required fields (per glossary entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `term` | string | The controlled term | `"Purchase Order"` |
| `definition` | string | The organisation's definition | `"A formal commercial document authorising a vendor to supply goods or services"` |
| `abbreviation` | string or null | Standard short form | `"PO"` |
| `domain` | string | Business domain this term belongs to | `"Procurement"` |

**Optional fields (per glossary entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `synonyms` | array | Other terms meaning the same thing in this org | `["purchase requisition", "buying order"]` |
| `avoid` | array | Terms never used for this concept | `["purchase request"]` |
| `standard_ref` | string | Standards body definition this aligns to | `"ISO/IEC 29148:2018 §4.1"` |

**Required fields (per business rule entry):**

| Field | Type | Description | Example |
|---|---|---|---|
| `rule_id` | string | Stable identifier | `"BR-001"` |
| `rule_name` | string | Short descriptive name | `"PO approval threshold"` |
| `rule_statement` | string | The rule in plain language | `"All POs exceeding $10,000 require Finance Director approval"` |
| `rule_authority` | string | Policy or regulation that mandates this rule | `"Procurement Policy v3.1 §4.2"` |

**Which skills read it:** Skills 03, 04, 05, 06, 07, 09, 12.

**Validation rules:** If a term used in PNS.md body text appears in the `avoid` list for a controlled term, skill 10 flags a terminology compliance warning (not a hard validation failure). Business rule IDs referenced in PNS.md Section 6 are checked against this file — missing rule IDs produce a V4 warning.

---

## APQC PCF dual-tagging rule

Every process entry in `process-taxonomy.md` must carry both APQC PCF v7.4 and v8.0 IDs. This is not optional if your organisation intends to use BP-SKILL outputs in an APQC-benchmarking context.

**Why both versions:** APQC migrated from PCF v7.4 to v8.0 in 2023. Many benchmarking databases still use v7.4 codes. If your outputs carry only v8.0 codes, they cannot be matched against v7.4 benchmarks. Dual-tagging ensures backwards compatibility during the migration period.

**What to do if you only have one version:** Enter the known version and set the other to `"TBD"`. The validator warns but does not fail. Resolve `"TBD"` entries using the APQC crosswalk tool available at apqc.org before any benchmarking engagement.

---

## Minimal viable configuration

Fill in these fields and you can run the first 5 skills with calibrated output:

**organization-profile.md:** `org_name`, `primary_language`, `industry`, `process_owner_title`

**role-dictionary.md:** At minimum 5-10 roles covering the process being documented. Include at minimum the process performer, the approver, and the finance/operations reviewer for the domain.

All other files can remain at template defaults until the skills that consume them are triggered.

---

## How to import roles from an existing org chart or HR system

Most HR systems (Workday, SAP SuccessFactors, BambooHR) can export a role or position list as CSV. To import into `role-dictionary.md`:

1. Export the position list from your HR system — you need: position title, department, reports_to position, and the HR system's internal ID.
2. Map each position to a `ROLE-NNN` ID. Use a sequential numbering scheme (ROLE-001 through ROLE-NNN) that is independent of the HR system's own IDs — this prevents role IDs from changing when the HR system reorganises.
3. Populate `raci_default` based on the role's typical involvement in process documentation: executive = A, operational = R, advisory = C, informed = I.
4. Add the HR system's ID to `hr_system_id` for future synchronisation.
5. Do not import personal names — roles in BP-SKILL are always by title, not by person.

---

## How to map controls from an existing GRC tool

GRC tools (ServiceNow GRC, MetricStream, Archer) maintain a control inventory that can usually be exported to CSV or Excel.

1. Export the control library from your GRC tool — you need: control ID, control name, control type, framework reference, and control owner.
2. Map your GRC tool's control IDs directly into `control_id` — use the GRC tool's own IDs rather than creating new ones. This makes it trivial to trace from a PNS.md control reference back to the GRC tool record.
3. Record the GRC tool's own ID in `grc_system_id` if you used a different numbering scheme (e.g., if you needed to prefix or normalise the IDs for YAML safety).
4. Map the control owner's job title to a `role_id` from `role-dictionary.md`.
5. Include only the controls relevant to the process domains you are documenting — do not import the entire control library. A targeted subset is easier to maintain and faster for skills to search.
