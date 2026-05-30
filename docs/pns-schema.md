# PNS.md — Process Narrative Specification Schema Reference

The canonical reference for anyone writing, enriching, or validating a PNS.md artifact in the BP-SKILL pipeline.

---

## What PNS.md is and why it exists

PNS.md is the central handoff artifact in the BP-SKILL pipeline. It is a structured Markdown document — with a YAML frontmatter block and 13 required body sections — that accumulates the outputs of each upstream skill and provides validated inputs to each downstream skill.

Without a typed handoff artifact, a 15-skill pipeline is just 15 independent prompts. PNS.md is what connects them. Skill 04 (as-is-process-capture) adds the activity sequence. Skill 05 (process-narrative-authoring) populates all required sections. Skill 07 (process-gap-and-exception-analysis) adds the gap register. Skill 10 (process-validation-and-quality-scoring) runs V1-V9 traceability checks and writes the quality score into the frontmatter. Skills 12-15 read the validated PNS.md to generate SOPs, RACI matrices, SIPOC tables, and the publication package.

A PNS.md that scores below 75 does not proceed to the publication layer (skills 12-15). This is by design: a defective narrative produces defective SOPs and governance artifacts.

---

## 10-state status lifecycle

| State | Set by | What it means |
|---|---|---|
| `draft` | Skill 05 (process-narrative-authoring) | PNS.md has been created; sections are being populated |
| `elicitation-in-progress` | Skill 03 (elicitation-and-interview-facilitation) | Active discovery is underway; sections will change |
| `as-is-captured` | Skill 04 (as-is-process-capture) | Current state is documented; Sections 1-5 are stable |
| `narrative-authored` | Skill 05 | All 13 required sections are populated; ready for gap analysis |
| `gap-analyzed` | Skill 07 (process-gap-and-exception-analysis) | Gaps and exceptions are documented in Section 12 |
| `future-state-defined` | Skill 08 (future-state-and-change-strategy) | Target state and change approach are added |
| `validated` | Skill 10 (process-validation-and-quality-scoring) | V1-V9 checks passed; quality score >= 75 |
| `published` | Skill 15 (publication-and-handoff-packaging) | Publication package delivered to stakeholders |
| `superseded` | Manual | A newer version of this PNS.md replaces this one |
| `archived` | Manual | The process has been decommissioned or retired |

Status must advance forward through the lifecycle. A validated PNS.md cannot move back to `draft` — create a new version instead.

---

## YAML frontmatter schema

Every PNS.md begins with a YAML frontmatter block delimited by `---`. All required fields must be present.

```yaml
---
# Required fields
schema: "pns/1.0"            # Always "pns/1.0" — identifies the document type to tooling
process_id: "ORG-PROC-001"   # Stable identifier, never changes between versions
title: "Purchase Order Approval"  # Human-readable process name
version: "1.0.0"             # Semver — increment MINOR for scope changes, PATCH for corrections
status: "draft"              # One of the 10 lifecycle states (see above)
owner: "Procurement Manager" # Role title from role-dictionary.md, not a person's name
author: "Jamie Hill"         # BA or agent that authored this version
created: "2026-05-25"        # ISO 8601 date — set on creation, never changed
updated: "2026-05-25"        # ISO 8601 date — updated on every revision

# Process classification
apqc_id: "13107.0"           # APQC PCF v7.4 element ID for the primary process
apqc_version: "v7.4"         # APQC PCF version used for classification

classification:
  level_1: "Acquire to Retire"    # APQC PCF Level 1 category
  level_2: "Procurement"          # APQC PCF Level 2 process group

# Standards satisfied by this document
standards:
  - "BABOK v3"
  - "ISO 9001:2015 §4.4.1"
  - "BPM CBOK v4.0"

# Quality and validation (set by skill 10)
quality_score: null          # Integer 0-100, null until skill 10 runs
validation_status: "pending" # "pending" | "pass" | "fail"

# Optional fields
related_processes:           # Array of process_id values for related PNS.md files
  - "vendor-onboarding"
  - "invoice-processing"

tags:                        # Free-form tags for search and categorisation
  - "procurement"
  - "finance"
  - "approval"
---
```

### Frontmatter field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `schema` | string | Yes | Always `"pns/1.0"` |
| `process_id` | string | Yes | Stable ID, uppercase kebab or ORG-code style |
| `title` | string | Yes | Max 120 characters |
| `version` | string | Yes | Semver string |
| `status` | string | Yes | Must be one of the 10 valid lifecycle states |
| `owner` | string | Yes | Role title from role-dictionary.md |
| `author` | string | Yes | Person or agent name |
| `created` | string | Yes | ISO 8601 date, never changed after creation |
| `updated` | string | Yes | ISO 8601 date, updated on every revision |
| `apqc_id` | string | Yes | APQC PCF element ID |
| `apqc_version` | string | Yes | `"v7.4"` or `"v8.0"` |
| `classification.level_1` | string | Yes | APQC Level 1 category label |
| `classification.level_2` | string | Yes | APQC Level 2 process group label |
| `standards` | array | Yes | At least one standard reference |
| `quality_score` | integer or null | Yes | Null until skill 10 runs; integer 0-100 thereafter |
| `validation_status` | string | Yes | `"pending"`, `"pass"`, or `"fail"` |
| `related_processes` | array | No | `process_id` values of related PNS.md files |
| `tags` | array | No | Free-form strings |

---

## 13 required body sections

Each section heading is H2. Do not rename them — the headings are matched by tooling.

### 1. Process Identification

**What to document:** A two-to-three paragraph description of the process: its name, the business function it supports, the organisational scope, and the primary trigger that initiates it. State the process boundaries explicitly: what event starts the process and what state constitutes a successful end.

**Standard satisfied:** ISO 9001:2015 §4.4.1 (understanding the organisation and its context); BABOK v3 §7.2 (business analysis scope)

**Not Applicable:** Never — all processes require identification.

---

### 2. Business Context

**What to document:** The business rationale for the process. Why does this process exist? What business problem does it solve? What happens if it is not performed? Include any regulatory or contractual obligations that make this process mandatory.

**Standard satisfied:** BABOK v3 §6.1 (business need); BPM CBOK v4.0 §3.1 (process context)

**Not Applicable:** Never.

---

### 3. Scope and Boundaries

**What to document:** A table or bullet list defining what is in scope and what is explicitly out of scope. Include the start event, end state, departments involved, systems in scope, and geographic or jurisdictional boundaries.

**Standard satisfied:** BABOK v3 §7.2 (scope definition); BPM CBOK v4.0 §3.2 (process boundary)

**Not Applicable:** Never.

---

### 4. Stakeholder Register

**What to document:** A table of all roles involved in the process. Columns: Role ID (from role-dictionary.md), Role Title, Department, RACI default (R/A/C/I), Notes.

**Standard satisfied:** BABOK v3 §2.4 (stakeholders); BPM CBOK v4.0 §7.1 (process participants)

**Not Applicable:** Never. Every process has at least one role.

---

### 5. Activity Sequence

**What to document:** A numbered list of all process steps in execution order. For each step: step number, step name, performing role (from Section 4), inputs consumed, outputs produced, and any decision point or gateway. Use the same step identifiers that will appear in the bpmn-beta diagram.

**Standard satisfied:** BABOK v3 §10.7 (process analysis); BPM CBOK v4.0 §4.3 (process documentation)

**Not Applicable:** Never.

---

### 6. Decision Points and Business Rules

**What to document:** A table of every decision point identified in Section 5. Columns: Rule ID, Decision question, Conditions (table rows), Outcome per condition, Authority (who decides), Reference standard or policy. Rule IDs must be stable and referenced in Section 5.

**Standard satisfied:** BABOK v3 §9.8 (business rules analysis); DMN 1.4 (OMG) decision table structure

**Not Applicable:** Only if the process has no branching logic (linear sequence only). Document this explicitly in the section.

---

### 7. System and Tool Touchpoints

**What to document:** A table of every system, tool, or platform touched in Section 5. Columns: System ID (from integration-registry.md), System Name, Step numbers where used, Integration type (manual entry, API, batch), Owner. System IDs must be resolvable against integration-registry.md.

**Standard satisfied:** BABOK v3 §9.6 (system interface analysis); ISO/IEC 29148:2018 §5.2 (interface requirements)

**Not Applicable:** Only if the process involves no systems (pure manual process). Document explicitly.

---

### 8. Exception and Error Paths

**What to document:** A table or list of every exception scenario identified in the process. For each exception: exception name, triggering condition, step where it occurs, handling procedure, escalation path, and resolution state. Cover both expected exceptions (business rule violations) and error conditions (system failures).

**Standard satisfied:** BABOK v3 §10.7 (exception analysis); BPM CBOK v4.0 §4.4 (exception handling)

**Not Applicable:** Only in a proof-of-concept or stub document. Real processes always have exceptions.

---

### 9. Handoff and Transition Points

**What to document:** A list of every point where work crosses a role boundary or department boundary. For each handoff: from role, to role, artifact passed, acceptance criteria, and expected turnaround time. These handoffs drive the SIPOC generation (skill 14) and the lane boundaries in the bpmn-beta diagram.

**Standard satisfied:** BABOK v3 §10.7; BPM CBOK v4.0 §4.3 (process interfaces)

**Not Applicable:** Only if the process is executed by a single role with no external dependencies.

---

### 10. Metrics and SLAs

**What to document:** KPIs, cycle time targets, SLA commitments, and quality thresholds for the process. Link each metric to the activity in Section 5 that it measures. Columns: Metric ID, Metric name, Target value, Measurement method, Linked activity, Owner.

**Standard satisfied:** ISO 9001:2015 §9.1 (monitoring and measurement); BPM CBOK v4.0 §6.1 (process performance)

**Not Applicable:** Acceptable for internal administrative processes with no formal SLA. Document the reason explicitly.

---

### 11. Compliance and Control Requirements

**What to document:** A table of applicable regulations, standards, and internal controls that govern this process. Columns: Control ID (from compliance-controls-registry.md), Control description, Framework reference, Linked activity, Control type (preventive/detective/corrective), Evidence requirement.

**Standard satisfied:** ISO 9001:2015 §8.1 (operational planning and control); BPM CBOK v4.0 §8.1 (governance)

**Not Applicable:** Acceptable only for processes with no regulatory or internal audit exposure. Document the reason.

---

### 12. Known Gaps and Assumptions

**What to document:** Gaps identified during elicitation (information not obtained, stakeholders not interviewed, steps not validated), assumptions made in lieu of evidence, and deferred items. This section is populated by skill 07 (process-gap-and-exception-analysis). Format: Gap ID, Description, Impact, Owner, Resolution status.

**Standard satisfied:** BABOK v3 §8.1 (solution evaluation); BPM CBOK v4.0 §5.1 (process improvement)

**Not Applicable:** Never — every first-draft PNS.md has at least one assumption.

---

### 13. Change and Version History

**What to document:** A table of all versions of this PNS.md. Columns: Version, Date, Author, Change summary, Approval status. The first row is always the initial draft. Add a row for every version increment.

**Standard satisfied:** ISO 9001:2015 §7.5 (documented information control)

**Not Applicable:** Never.

---

## 7 optional sections

These sections can be added after Section 13 when applicable:

| Section | When to include |
|---|---|
| **Process Variants** | When the same process has named variant paths (e.g. fast-track vs standard approval) |
| **Glossary** | Local terms not defined in business-glossary-and-rulebook.md |
| **Training Requirements** | When the process requires specific training or certification to perform |
| **Communication Plan** | When the process requires scheduled stakeholder communication |
| **Tool Requirements** | When specific tool versions, licenses, or configurations are required |
| **Related Processes** | Cross-references to related PNS.md files beyond the frontmatter `related_processes` list |
| **Audit Notes** | Post-publication review findings that do not warrant a new version |

---

## 9 traceability rules (V1-V9)

Skill 10 (process-validation-and-quality-scoring) runs these checks and reports pass/fail for each.

| Rule | Checks | Failure means |
|---|---|---|
| **V1** — Schema conformance | Frontmatter validates against the PNS schema: all required fields present, correct types, valid lifecycle state | Document cannot be processed by downstream skills — fix frontmatter before proceeding |
| **V2** — Section completeness | All 13 required sections are present with non-empty content | Downstream skills will produce incomplete output — populate missing sections |
| **V3** — Activity-stakeholder alignment | Every role referenced in Section 5 (Activity Sequence) exists in Section 4 (Stakeholder Register) | RACI generation (skill 13) will produce orphaned roles — add missing roles to the register |
| **V4** — Decision-rule traceability | Every decision point in Section 5 has a corresponding rule ID in Section 6 | DMN generation (skill 09) will miss decision logic — add rule entries for every gateway |
| **V5** — System resolution | Every system ID in Section 7 is registered in integration-registry.md | Integration references are unresolvable — add the system to integration-registry.md or correct the ID |
| **V6** — Exception coverage | Every gateway or branching point in Section 5 has at least one exception path in Section 8 | Exception paths are missing from the BPMN diagram output — document the exception handling |
| **V7** — Handoff completeness | Every role boundary crossing in Section 5 has an entry in Section 9 | SIPOC generation (skill 14) will produce incomplete supplier/customer columns — add missing handoffs |
| **V8** — Metrics-activity alignment | Every metric in Section 10 references a specific activity from Section 5 | Controls definition (skill 11) will produce orphaned KPIs — link metrics to activities |
| **V9** — Compliance traceability | Every control in Section 11 references a specific activity from Section 5 | Audit trail is incomplete — link controls to the activities they govern |

A PNS.md that fails V1 or V2 receives a score of 0. Failures on V3-V9 each deduct from the quality score using the scoring rubric defined in skill 10.

---

## Quality score bands

| Band | Score | Meaning |
|---|---|---|
| **A** | 90-100 | Publish-ready. Proceed to skills 12-15 without exception approval. |
| **B** | 75-89 | Minor defects. Publish with explicit process owner approval. Document the approved exceptions in Section 12. |
| **C** | 50-74 | Significant defects. Rework required. Address defect list, then rerun skill 10 before proceeding. |
| **D** | 0-49 | Fundamental gaps. Return to skill 04 or 05. Do not proceed to publication layer. |

---

## Minimal example PNS.md

```markdown
---
schema: "pns/1.0"
process_id: "ACME-PROC-001"
title: "Employee Expense Reimbursement"
version: "1.0.0"
status: "narrative-authored"
owner: "Finance Manager"
author: "BA Team"
created: "2026-05-25"
updated: "2026-05-25"
apqc_id: "11215.0"
apqc_version: "v7.4"
classification:
  level_1: "Manage Financial Resources"
  level_2: "Process Payroll"
standards:
  - "ISO 9001:2015 §8.1"
  - "BABOK v3 §10.7"
quality_score: null
validation_status: "pending"
---

## Process Identification

The Employee Expense Reimbursement process governs the submission, review,
and payment of out-of-pocket expenses incurred by employees on behalf of
the organisation. The process begins when an employee submits an expense
claim and ends when the reimbursement payment is confirmed. Scope covers
all employees, all expense categories, and all jurisdictions in which the
organisation operates.

## Business Context

The organisation is legally obligated to reimburse employees for legitimate
business expenses within 30 days of submission under applicable employment
law. Failure to process claims within this window creates payroll compliance
risk. The process also enforces the organisation's expense policy, preventing
reimbursement of non-compliant claims.

## Scope and Boundaries

**In scope:** Expense claim submission, manager approval, finance review,
payment processing, receipt archival.

**Out of scope:** Corporate card reconciliation, vendor invoices, travel
pre-approval.

**Start event:** Employee submits expense claim.
**End state:** Reimbursement payment confirmed and claim archived.

## Stakeholder Register

| Role ID | Role Title | Department | RACI | Notes |
|---|---|---|---|---|
| ROLE-001 | Employee | All | R | Submits claim |
| ROLE-002 | Line Manager | All | A | Approves claim |
| ROLE-003 | Finance Officer | Finance | R | Reviews and pays |
| ROLE-004 | Finance Manager | Finance | A | Escalation authority |

## Activity Sequence

1. Employee (ROLE-001) submits expense claim with receipts — produces: ClaimDraft
2. System validates receipt totals against policy limits [RULE-001] — gateway
3. Line Manager (ROLE-002) reviews and approves or rejects claim [RULE-002] — gateway
4. Finance Officer (ROLE-003) processes approved claim in payroll system [SYS-001]
5. Finance Officer (ROLE-003) confirms payment and archives claim

## Decision Points and Business Rules

| Rule ID | Decision | Conditions | Outcome | Authority |
|---|---|---|---|---|
| RULE-001 | Claim within policy limits? | Amount <= $500 per receipt, <= $2000 total | Pass: continue; Fail: flag for manager note | Finance Manager (ROLE-004) |
| RULE-002 | Manager approves? | Manager reviews receipts and business justification | Approve: proceed to finance; Reject: return to employee | Line Manager (ROLE-002) |

## System and Tool Touchpoints

| System ID | System Name | Steps | Integration type | Owner |
|---|---|---|---|---|
| SYS-001 | Payroll System | 4, 5 | Manual entry | Finance Manager |

## Exception and Error Paths

| Exception | Trigger | Step | Handling | Escalation |
|---|---|---|---|---|
| Missing receipt | Claim submitted without receipt | 1 | System rejects; employee notified | Line Manager if repeated |
| Policy breach | Claim exceeds limits | 2 | Flagged for manager override note | Finance Manager (ROLE-004) |
| Manager unavailable | Line Manager absent > 5 days | 3 | Escalate to Finance Manager | Finance Manager (ROLE-004) |

## Handoff and Transition Points

| From | To | Artifact | Acceptance criteria | Turnaround |
|---|---|---|---|---|
| Employee (ROLE-001) | Line Manager (ROLE-002) | ClaimDraft with receipts | All receipts attached, totals match | 2 business days |
| Line Manager (ROLE-002) | Finance Officer (ROLE-003) | Approved ClaimDraft | Manager approval recorded | 1 business day |

## Metrics and SLAs

| Metric ID | Metric | Target | Measurement | Activity | Owner |
|---|---|---|---|---|---|
| KPI-001 | Claim-to-payment cycle time | <= 10 business days | Date submitted to date paid | Steps 1-5 | Finance Manager |
| KPI-002 | Rejection rate | < 5% | Rejected claims / total claims | Step 3 | Finance Manager |

## Compliance and Control Requirements

| Control ID | Description | Framework | Activity | Type | Evidence |
|---|---|---|---|---|---|
| CTRL-001 | 30-day reimbursement SLA | Employment law | Steps 4-5 | Detective | Payment date log |
| CTRL-002 | Receipt retention 7 years | Tax regulation | Step 5 | Preventive | Archive record |

## Known Gaps and Assumptions

| Gap ID | Description | Impact | Owner | Status |
|---|---|---|---|---|
| GAP-001 | Payroll system integration type not confirmed | SYS-001 may support API; assumed manual entry | Finance Manager | Open |
| ASS-001 | Assumed all managers have system access | Not validated with IT | IT Manager | Open |

## Change and Version History

| Version | Date | Author | Change | Approval |
|---|---|---|---|---|
| 1.0.0 | 2026-05-25 | BA Team | Initial draft | Pending |
```
