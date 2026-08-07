import type { ExampleStep } from "./purchase-approval-steps";
export type { ExampleStep };

export const VENDOR_ONBOARDING_STEPS: ExampleStep[] = [
  {
    skillId: "okhp3-process-intake-and-scope",
    pnsConsumed: null,
    pnsSet: "draft-intake",
    triggerUsed: "Map this process — vendor onboarding for new packaging suppliers. We need documented qualification, compliance review, and agreement steps before a purchase order can be issued.",
    inputLabel: "Brief from Head of Procurement",
    inputSnippet:
`Acme Manufacturing requires a second-source packaging supplier after our
primary supplier missed two delivery windows in Q3. Target supplier: Crestline
Packaging Ltd. Legal requires a supplier compliance pack before we can raise a PO.
No written onboarding process exists — each new vendor is handled ad-hoc.`,
    outputLabel: "pir.yaml (excerpt)",
    outputSnippet:
`process_id: PROC-2025-211
title: Vendor Onboarding — New Supplier Qualification
owner: Head of Procurement
trigger: "Vendor nominated by Procurement following supplier-risk review"
termination: "Signed supplier agreement AND purchase order issued AND vendor record active in ERP"
classification: internal
status: draft-intake`,
  },
  {
    skillId: "okhp3-stakeholder-and-role-mapping",
    pnsConsumed: "draft-intake",
    pnsSet: "scoped",
    triggerUsed: "Map stakeholders for the vendor-onboarding process.",
    inputLabel: "PNS.md [draft-intake] + organization-profile.md",
    inputSnippet:
`Process owner: Head of Procurement
Known actors: Procurement Officer, Procurement Manager, Legal & Compliance,
Finance (solvency check), vendor contact, ERP administrator
Systems mentioned: ERP (SAP), DocuSign, supplier portal`,
    outputLabel: "stakeholder_register (§3 excerpt)",
    outputSnippet:
`role_id  | name                    | raci    | notes
proc_off | Procurement Officer     | R       | Day-to-day coordination; issues RFI and PO
proc_mgr | Procurement Manager     | A       | Final approval; signs off qualification report
legal    | Legal & Compliance      | R / C   | Compliance verification; drafts supplier agreement
finance  | Finance (Credit Control)| C / I   | Vendor solvency and payment-terms review
vendor   | Vendor (Crestline Ltd.) | R       | Submits RFI response; signs agreement
erp_adm  | ERP Administrator       | R / I   | Creates vendor master record in SAP`,
  },
  {
    skillId: "okhp3-elicitation-interviews",
    pnsConsumed: "scoped",
    pnsSet: "elicited",
    triggerUsed: "Run the elicitation interview guide for vendor-onboarding.",
    inputLabel: "PNS.md [scoped] + stakeholder register",
    inputSnippet:
`Interviewees: Procurement Manager (Dana K.), Legal Lead (Harriet V.), Finance (Ray O.)
Sessions: 2025-03-04 to 2025-03-06, 30 min each
Focus: qualification criteria, compliance blockers, exception paths (failed vendors)`,
    outputLabel: "§4 Evidence & Sources (key findings)",
    outputSnippet:
`- No documented scoring rubric for RFI responses; Procurement Manager scores subjectively
- Legal requires a GDPR data processing agreement (DPA) if vendor processes any personal data
  — not always triggered; currently identified case-by-case with no formal decision rule
- Finance solvency check: Dun & Bradstreet report required for orders > £50k; currently ad-hoc
- 2 past vendors onboarded without signed agreements (informal LOI used instead)
Open question: Who has authority to approve a vendor with a borderline compliance score?`,
  },
  {
    skillId: "okhp3-as-is-process-capture",
    pnsConsumed: "elicited",
    pnsSet: "documented-as-is",
    triggerUsed: "Capture the as-is activity sequence for vendor-onboarding.",
    inputLabel: "PNS.md [elicited] + interview transcripts",
    inputSnippet:
`Elicitation confirmed 8 main activities across 4 stakeholder groups.
2 informal path deviations logged (no written agreement in 2 cases).
Vendor capability data currently held in email threads, not a shared system.`,
    outputLabel: "§5 As-Is Activity Sequence (excerpt)",
    outputSnippet:
`act-001 | Procurement Officer | Receive vendor nomination; create qualification folder
act-002 | Procurement Officer | Draft and send RFI to vendor via email
act-003 | Vendor              | Complete and return RFI response (format: unstructured Word doc)
act-004 | Legal               | Review vendor for sanctions, GDPR triggers, and insurance adequacy
act-005 | Procurement Officer | Score RFI response (no formal rubric — manager preference)
act-006 | Procurement Manager | Review scoring summary; approve or reject informally via email
act-007 | Legal               | Draft supplier agreement (template basis; reviewed per vendor)
act-008 | Procurement Officer | Issue purchase order in SAP after signed agreement received`,
  },
  {
    skillId: "okhp3-process-narrative-authoring",
    pnsConsumed: "documented-as-is",
    pnsSet: "modeled",
    triggerUsed: "Author the full PNS.md for vendor-onboarding.",
    inputLabel: "PNS.md [documented-as-is] + business-glossary + role-dictionary",
    inputSnippet:
`All elicitation data captured. 8 activities sequenced across 4 roles.
Glossary terms needed: RFI, DPA, solvency check, vendor master record, PO.
2 informal deviations logged (no agreement used); open question on approval authority.`,
    outputLabel: "PNS.md header + section completion status",
    outputSnippet:
`title: Vendor Onboarding — New Supplier Qualification  |  version: 0.1.0-draft  |  status: modeled
§1  Process Identification         complete  (PROC-2025-211, owner: Head of Procurement)
§2  Scope & Boundaries             complete  (trigger: nomination; exclusion: contract renewal)
§3  Stakeholder & RACI Register    complete  (6 roles, 8 activities)
§4  Evidence & Sources             complete  (3 interviews, 2 deviations, 1 open question)
§5  As-Is Activity Sequence        complete  (act-001 to act-008, linear with 1 informal branch)
§6  Business Rules & Decision Pts  partial   (DPA trigger rule and approval authority unresolved)
§7  System Touchpoints             complete  (SAP, DocuSign, D&B portal, email)`,
  },
  {
    skillId: "okhp3-visual-process-modeling",
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Generate the bpmn-beta diagram for vendor-onboarding using pool-lane notation.",
    inputLabel: "PNS.md [modeled] + notation-preferences",
    inputSnippet:
`§5 activity sequence: 8 acts across 4 stakeholder groups.
Notation preference: pool-lane BPMN with message flows for cross-pool handoffs.
Render target: bpmn-beta DSL for Mermaid.`,
    outputLabel: "bpmn-beta pool/lane diagram",
    outputSnippet: "",
    hasDiagram: true,
  },
  {
    skillId: "okhp3-process-gap-exception-analysis",
    pnsConsumed: "modeled",
    pnsSet: "analyzed",
    triggerUsed: "Analyse gaps and exceptions in the vendor-onboarding process.",
    inputLabel: "PNS.md [modeled] + compliance-controls-registry + procurement policy",
    inputSnippet:
`2 informal deviations: vendors approved without signed agreements.
Open question: DPA trigger rule undefined; approval authority for borderline scores unresolved.
Finance: D&B solvency check ad-hoc (no value threshold documented in process).`,
    outputLabel: "Gap report (excerpt)",
    outputSnippet:
`GAP-01 [HIGH]   No formal scoring rubric for RFI evaluation
  Risk: subjective scoring exposes the company to procurement bias and audit failure.
GAP-02 [HIGH]   Supplier agreement bypassed in 2 historical cases
  Contracts policy requires a signed agreement before PO; informal LOI is not compliant.
GAP-03 [MEDIUM] GDPR DPA trigger rule is undefined
  If vendor processes personal data and no DPA is issued, the company breaches UK GDPR Art. 28.
GAP-04 [MEDIUM] Solvency check threshold not documented
  D&B report required "for orders > £50k" per Finance — but no policy document exists.
GAP-05 [LOW]    Vendor record creation in SAP is not linked to agreement signing
  ERP admin can activate a vendor before a signed agreement is received.`,
  },
  {
    skillId: "okhp3-future-state-change-strategy",
    pnsConsumed: "analyzed",
    pnsSet: "future-designed",
    triggerUsed: "Model future-state improvements for vendor-onboarding based on the gap report.",
    inputLabel: "PNS.md [analyzed] + gap report + procurement policy",
    inputSnippet:
`GAP-01 through GAP-05 confirmed for future-state design.
Organisation: 800-person manufacturer, procurement team of 6, SAP S/4HANA.
Legal confirmed: DPA template ready; formalising the trigger as a decision rule is in scope.`,
    outputLabel: "Future-state narrative (excerpt)",
    outputSnippet:
`FS-01: Scoring rubric — standardised 5-criterion RFI scorecard (quality, price, lead time,
  compliance, financial stability); Procurement Manager approves vendors scoring >= 70/100.
FS-02: Agreement gate — SAP vendor master activation blocked by system until DocuSign
  agreement status = "fully executed"; removes the informal LOI exception path.
FS-03: DPA decision rule — new decision table triggers DPA requirement if vendor handles
  any employee, customer, or operational personal data (formal Yes/No field added to RFI).
FS-04: Solvency threshold formalised — D&B report mandatory for order value >= £50k;
  added as a step in the scoring phase, linked to Finance workflow in SAP.
Delta: +1 decision gateway (scoring threshold); 1 system gate (DocuSign-SAP integration); 1 new step (DPA trigger check).`,
  },
  {
    skillId: "okhp3-decision-model-authoring",
    pnsConsumed: "analyzed",
    pnsSet: "decision-enriched",
    triggerUsed: "Build DMN decision tables for vendor qualification approval and DPA trigger in vendor-onboarding.",
    inputLabel: "PNS.md [analyzed] + gap report + Legal input + procurement policy",
    inputSnippet:
`Gap report confirmed two decision points requiring DMN formalisation:
  GAP-01: vendor qualification approval (scoring threshold and exception authority)
  GAP-03: GDPR DPA trigger (data processing flag on RFI)
Legal confirmed DPA template reference and data-type classification.`,
    outputLabel: "DMN decision tables (qualification-approval + DPA trigger)",
    outputSnippet:
`TABLE 1: vendor-qualification-approval.dmn
rule | rfi_score | financial_risk | outcome
R1   | >= 70     | low or medium  | approve — Procurement Manager sign-off
R2   | >= 70     | high           | conditional approve — Legal review required
R3   | 50–69     | any            | escalate to Head of Procurement
R4   | < 50      | any            | reject — vendor not qualified

TABLE 2: dpa-trigger.dmn
rule | handles_employee_data | handles_customer_data | handles_ops_data | outcome
R1   | yes                   | any                   | any              | DPA required
R2   | any                   | yes                   | any              | DPA required
R3   | no                    | no                    | yes              | DPA required
R4   | no                    | no                    | no               | DPA not required`,
  },
  {
    skillId: "okhp3-process-validation-scoring",
    pnsConsumed: "decision-enriched",
    pnsSet: "validated",
    triggerUsed: "Validate and score the vendor-onboarding PNS now that the DMN tables are in place.",
    inputLabel: "PNS.md [decision-enriched] + compliance-controls-registry + DMN tables",
    inputSnippet:
`PNS version: 0.1.0-draft. §6 Business Rules supplemented by two DMN tables.
DMN tables: vendor-qualification-approval.dmn and dpa-trigger.dmn.
Validation checks GAP-01/03 addressed via DMN; GAP-02 via FS-02 (DocuSign gate).
GAP-04 (solvency threshold) now documented in FS-04. GAP-05 partially resolved.`,
    outputLabel: "Quality scorecard (excerpt)",
    outputSnippet:
`Overall score: 84 / 100  |  Recommendation: implement DocuSign-SAP integration before publication
V1  Process Identification     10/10  no defects
V2  Scope & Boundaries          9/10  contract-renewal exclusion clearly stated
V3  Stakeholder Register        9/10  ERP admin role present; vendor as external party noted
V4  Evidence & Sources          9/10  2 informal deviation cases documented with root cause
V6  Regulatory Alignment        9/10  UK GDPR Art. 28 DPA trigger now formalised via DMN
V7  Exception Handling          8/10  scoring escalation path defined; vendor appeal path absent
V9  Handoff Conditions          9/10  DocuSign gate specified; SAP activation block confirmed in design`,
  },
  {
    skillId: "okhp3-process-measures-controls",
    pnsConsumed: "validated",
    pnsSet: null,
    triggerUsed: "Define KPIs and controls for vendor-onboarding.",
    inputLabel: "PNS.md [validated] + compliance-controls-registry + procurement policy",
    inputSnippet:
`Validated PNS with 84/100 score accepted for measures definition.
ISO 9001 §8.4 supplier evaluation requirement applies.
Key risks: scoring bias (GAP-01), agreement bypass (GAP-02), GDPR DPA omission (GAP-03).`,
    outputLabel: "Measures & controls table (excerpt)",
    outputSnippet:
`KPI-01  Onboarding cycle time         target <= 15 business days from nomination to active   per vendor case
KPI-02  RFI response completeness      target 100% scored fields completed                   per RFI
KPI-03  Agreement-before-PO rate       target 100%                                           measured monthly
KPI-04  DPA coverage rate              target 100% of in-scope vendors                       measured quarterly
CTL-01  Scoring rubric gate            mandatory before Procurement Manager review            blocks act-006
CTL-02  DocuSign agreement status      SAP activation blocked until "fully executed"          system gate
CTL-03  D&B solvency report            mandatory for vendor orders >= £50k                   blocks PO issuance
CTL-04  DPA trigger check              mandatory field in RFI; Legal notified if triggered    blocks act-007`,
  },
  {
    skillId: "okhp3-sop-work-instructions",
    pnsConsumed: "validated",
    pnsSet: null,
    triggerUsed: "Generate the SOP for vendor-onboarding.",
    inputLabel: "PNS.md [validated] + role-dictionary + regional-context",
    inputSnippet:
`Target audiences: Procurement Officer (SOP) and Legal (Work Instruction for DPA step).
Format: numbered steps with role callouts, decision rule references, and system links.
UK Bribery Act 2010 due-diligence requirement noted; ISO 9001 §8.4 applies.`,
    outputLabel: "SOP-PROC-211 (first two steps)",
    outputSnippet:
`SOP-PROC-211  Vendor Onboarding — New Supplier Qualification  |  v1.0-draft  |  Owner: Head of Procurement

Step 1  [Procurement Officer]  On receipt of vendor nomination, create a qualification case in the
  shared procurement folder. Assign case reference PROC-YYYY-NNN.
  Complete the standard RFI template (Form RFI-01); populate vendor contact, commodity category,
  and the DPA trigger field (§ 3.2 — is personal data in scope?).

Step 2  [Procurement Officer]  Send RFI-01 to the vendor contact within 2 business days of nomination.
  Record send date and expected response deadline (10 business days from send) in the case log.
  Copy Legal if the DPA trigger field is marked "Yes" (Legal initiates DPA review in parallel).`,
  },
  {
    skillId: "okhp3-raci-governance-matrix",
    pnsConsumed: "decision-enriched",
    pnsSet: null,
    triggerUsed: "Generate the RACI matrix for vendor-onboarding including the DMN-governed decision activities.",
    inputLabel: "PNS.md [decision-enriched] + role-dictionary",
    inputSnippet:
`6 roles confirmed: proc_off, proc_mgr, legal, finance, vendor, erp_adm.
8 activities (act-001 to act-008) plus 2 future-state additions (DPA trigger check, SAP gate).
RACI-V01 rule: exactly one Accountable per activity.
Decision activities (qualification approval, DPA trigger) now included as accountable rows.`,
    outputLabel: "RACI matrix (excerpt)",
    outputSnippet:
`Activity                       | Proc. Officer | Proc. Mgr | Legal | Finance | Vendor | ERP Admin
Create qualification case      |     A/R       |     I     |   —   |    —    |    —   |     —
Send RFI to vendor             |     A/R       |     C     |   I   |    —    |    —   |     —
Submit RFI response            |      I        |     I     |   —   |    —    |   A/R  |     —
Compliance & DPA review        |      I        |     C     |  A/R  |    —    |    —   |     —
Score RFI (scorecard)          |     A/R       |     C     |   I   |    C    |    —   |     —
Approve qualification          |      I        |    A/R    |   C   |    I    |    —   |     —
Draft & execute agreement      |      C        |     I     |  A/R  |    —    |    R   |     —
Activate vendor in SAP         |      I        |     I     |   I   |    —    |    —   |    A/R`,
  },
  {
    skillId: "okhp3-sipoc-generation",
    pnsConsumed: "decision-enriched",
    pnsSet: null,
    triggerUsed: "Generate the SIPOC for vendor-onboarding.",
    inputLabel: "PNS.md [decision-enriched] + process-taxonomy",
    inputSnippet:
`Process: PROC-2025-211 Vendor Onboarding — New Supplier Qualification.
Scope confirmed: vendor nomination to active ERP vendor record.
Stakeholder register, system touchpoints, and DMN tables all available.`,
    outputLabel: "SIPOC table",
    outputSnippet:
`Suppliers   | Head of Procurement (nomination), Vendor (RFI response), Legal (DPA/agreement), Finance (D&B report)
Inputs      | Vendor nomination memo, completed RFI-01, D&B solvency report, supplier agreement template, DPA template
Process     | Nominate -> Issue RFI -> Compliance review -> Score -> Approve -> Execute agreement -> Activate in ERP -> Issue PO
Outputs     | Signed supplier agreement, DPA (if triggered), vendor master record (SAP), approved purchase order
Customers   | Operations (qualified supplier), Finance (audit trail), Legal (compliance evidence), ERP (clean vendor master)`,
  },
  {
    skillId: "okhp3-publication-handoff-packaging",
    pnsConsumed: "validated",
    pnsSet: "packaged",
    triggerUsed: "Package vendor-onboarding for publication.",
    inputLabel: "PNS.md [validated] + all derived artifacts + approval metadata",
    inputSnippet:
`Validation score: 84/100 (DocuSign-SAP integration gap accepted as known risk; IT delivery Q2).
Approver: Head of Procurement (Dana K.) + Legal Lead (Harriet V.), 2025-03-21.
Target repository: SharePoint Procurement Process Library + SAP process documentation.`,
    outputLabel: "Publication manifest (excerpt)",
    outputSnippet:
`BUNDLE: PROC-2025-211-v1.0  |  status: packaged  |  approved: 2025-03-21
Artifacts (11):
  PNS.md                         stakeholder-register.md    gap-report.md
  bpmn-diagram.svg               qualification-approval.dmn dpa-trigger.dmn
  sop-PROC-211.md                legal-work-instruction.md  raci-matrix.md
  kpi-controls.md                sipoc.md
Approval: Head of Procurement + Legal Lead (joint sign-off)
Known open item: DocuSign-SAP integration gate (GAP-05 partial) — IT delivery target 2025-06-01`,
  },
];
