# BABOK v3 Core Concept Model

The BABOK v3 Core Concept Model (CCM) defines six interrelated concepts that form the foundation
of all business analysis work. In the PNS, the `babok_core_concepts` section anchors each process
description to the CCM to ensure the narrative is analytically complete.

---

## The Six Concepts

### Change

> "The act of transformation in response to a need."

In the PNS: Describe what state changes when this process completes successfully.

**Good example (purchase-approval):**
"An unvalidated spend request is transformed into an authorized purchase order, changing the organization's committed expenditure state."

**Poor example:** "The process changes things." (Too vague — does not describe what state transforms.)

---

### Need

> "A problem or opportunity to be addressed."

In the PNS: Describe the business problem, operational gap, or strategic opportunity the process addresses.

**Good example (support-triage):**
"Customer-reported incidents are unresolved and untracked until assigned to a qualified support agent, creating response time risk and customer dissatisfaction."

**Poor example:** "The need is to have a process." (Circular — not a problem statement.)

---

### Solution

> "A specific way of satisfying one or more needs in a context."

In the PNS: Describe the capability or work product this process delivers that satisfies the need.

**Good example (quote-to-order):**
"A structured quoting and order confirmation workflow that converts validated customer requirements into committed sales orders, backed by ERP and CRM integration."

---

### Stakeholders

> "A group or individual with a relationship to the change, the need, or the solution."

In the PNS: Name the key stakeholder groups — who is impacted, involved, or has an interest.

**This field complements the stakeholder register (from okhp3-process-discovery) with a narrative summary.**

---

### Value

> "The worth, importance, or usefulness of something to a stakeholder within a context."

In the PNS: Express the measurable or qualitative value the process delivers.

**Good example:** "Reduces unauthorized spend by enforcing approval thresholds; SLA compliance rate improves response time consistency for customers."

**Poor example:** "The process adds value." (Not measurable or specific.)

---

### Context

> "The circumstances that influence, are influenced by, and provide understanding of the change."

In the PNS: Describe the organizational, technical, and regulatory environment.

**Good example:** "Operates within an ERP-governed procurement environment; subject to SOX spend controls above $5,000; cross-functional between Finance and Operations."

---

## Anchoring Rules for PNS Authoring

1. All six CCM concepts should be populated for publication-ready PNS documents.
2. A minimum of four are required for V1 to pass.
3. The `stakeholders` CCM field is a narrative summary — it does not replace the stakeholder register from okhp3-process-discovery.
4. CCM content must be grounded in the PIR — never invent problems or solutions not present in the source intake.
5. If a concept is genuinely unclear, record the gap in `sections.open_questions` rather than inventing content.

---

## CCM Completeness and Quality Score

| Populated concepts | Score contribution |
|---|---|
| 6 of 6 | 5 pts (full) |
| 5 of 6 | 4 pts |
| 4 of 6 | 3 pts |
| 3 or fewer | 0 pts |

The CCM fields require ≥ 20 characters each to count as "populated."
