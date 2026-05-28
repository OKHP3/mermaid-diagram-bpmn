export interface ExampleStep {
  skillId: string;
  pnsConsumed: string | null;
  pnsSet: string | null;
  triggerUsed: string;
  inputLabel: string;
  inputSnippet: string;
  outputLabel: string;
  outputSnippet: string;
  hasDiagram?: true;
}

export const PURCHASE_APPROVAL_STEPS: ExampleStep[] = [
  {
    skillId: "process-intake-and-scope",
    pnsConsumed: null,
    pnsSet: "draft-intake",
    triggerUsed: "Map this process — purchase request approval. Requesters submit for any spend over £200, a manager reviews and decides within 48 hours.",
    inputLabel: "Brief from process owner",
    inputSnippet:
`We approve purchases over £200. Requester fills a form, manager reviews,
finance signs off on anything above £5k. Sometimes the manager is on leave
and things just sit there. We want this documented properly.`,
    outputLabel: "pir.yaml (excerpt)",
    outputSnippet:
`process_id: PROC-2024-042
title: Purchase Request Approval
owner: Procurement Manager
trigger: "Purchase request submitted, value >= £200"
termination: "PO issued OR request formally rejected"
classification: internal
status: draft-intake`,
  },
  {
    skillId: "stakeholder-and-role-mapping",
    pnsConsumed: "draft-intake",
    pnsSet: "scoped",
    triggerUsed: "Map stakeholders for the purchase-approval process.",
    inputLabel: "PNS.md [draft-intake] + organization-profile.md",
    inputSnippet:
`Process owner: Procurement Manager
Known actors (from brief): requesters, manager, finance
Systems mentioned: PO portal (system name TBC)`,
    outputLabel: "stakeholder_register (§3 excerpt)",
    outputSnippet:
`role_id | name                  | raci  | notes
req     | Requester             | R     | Any employee with budget need
mgr     | Dept. Manager         | A     | Single accountable approver
fin     | Finance Controller    | C     | Consulted on amounts > £5,000
it      | IT / PO System        | I     | Processes PO issuance`,
  },
  {
    skillId: "elicitation-and-interview-facilitation",
    pnsConsumed: "scoped",
    pnsSet: "elicited",
    triggerUsed: "Run the elicitation interview guide for purchase-approval.",
    inputLabel: "PNS.md [scoped] + stakeholder register",
    inputSnippet:
`Interviewee: Dept. Manager (Sarah K.)
Session: 2024-11-14, 40 min (video call)
Facilitator note: cover exception paths and SLA enforcement`,
    outputLabel: "§4 Evidence & Sources (key findings excerpt)",
    outputSnippet:
`- No formal delegation rule when manager is on leave (ad-hoc email used)
- 48-hour SLA is policy only; no system timer or escalation trigger exists
- Amounts under £500 sometimes approved verbally — no audit trail
- Contradiction: policy says "no verbal approvals" (Finance handbook §4.2)
Open question: Who is the backup approver when the manager is absent?`,
  },
  {
    skillId: "as-is-process-capture",
    pnsConsumed: "elicited",
    pnsSet: "documented-as-is",
    triggerUsed: "Capture the as-is activity sequence for purchase-approval.",
    inputLabel: "PNS.md [elicited] + interview transcript",
    inputSnippet:
`Elicitation confirmed 7 main activities.
Decision point at act-004 (approve/reject).
Exception path: finance escalation for amounts > £5k.`,
    outputLabel: "§5 As-Is Activity Sequence (excerpt)",
    outputSnippet:
`act-001 | Requester        | Submit purchase request form (amount >= £200)
act-002 | PO System        | Route request to Dept. Manager inbox
act-003 | Dept. Manager    | Review request details (SLA: 48 h)
act-004 | Dept. Manager    | Approve (-> act-005) OR Reject (-> act-007)
act-005 | Finance (>£5k?)  | Countersign if amount exceeds £5,000 threshold
act-006 | PO System        | Issue Purchase Order, notify Requester
act-007 | PO System        | Send formal rejection notice to Requester`,
  },
  {
    skillId: "process-narrative-authoring",
    pnsConsumed: "documented-as-is",
    pnsSet: "modeled",
    triggerUsed: "Author the full PNS.md for purchase-approval.",
    inputLabel: "PNS.md [documented-as-is] + business-glossary + role-dictionary",
    inputSnippet:
`All elicitation data captured. 7 activities sequenced.
1 decision gateway (act-004). Finance escalation branch confirmed.
Glossary terms needed: PO, cost centre, countersignature.`,
    outputLabel: "PNS.md header + section completion status",
    outputSnippet:
`title: Purchase Request Approval  |  version: 0.1.0-draft  |  status: modeled
§1  Process Identification         complete  (PROC-2024-042, owner: mgr)
§2  Scope & Boundaries             complete  (trigger, termination, 2 exclusions)
§3  Stakeholder & RACI Register    complete  (4 roles, 7 activities)
§4  Evidence & Sources             complete  (1 interview, 1 contradiction logged)
§5  As-Is Activity Sequence        complete  (act-001 to act-007, 1 gateway)
§6  Business Rules & Decision Pts  complete  (rule-001: approval threshold logic)
§7  System Touchpoints             partial   (PO portal ID unconfirmed)`,
  },
  {
    skillId: "visual-process-modeling",
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Generate the bpmn-beta diagram for purchase-approval.",
    inputLabel: "PNS.md [modeled] + notation-preferences",
    inputSnippet:
`§5 activity sequence: 7 acts, 1 xor gateway, 2 end events.
Notation preference: BPMN 2.0 task types (user, service).
Render target: bpmn-beta DSL for Mermaid.`,
    outputLabel: "bpmn-beta diagram",
    outputSnippet: "",
    hasDiagram: true,
  },
  {
    skillId: "process-gap-and-exception-analysis",
    pnsConsumed: "modeled",
    pnsSet: "analyzed",
    triggerUsed: "Analyse gaps and exceptions in the purchase-approval process.",
    inputLabel: "PNS.md [modeled] + compliance-controls-registry",
    inputSnippet:
`Contradiction logged in §4: verbal approvals occur but policy forbids them.
Open question unresolved: backup approver when manager is absent.
SLA commitment in policy (48 h) has no system enforcement.`,
    outputLabel: "Gap report (excerpt)",
    outputSnippet:
`GAP-01 [HIGH]   No manager-absence delegation rule
  Workaround: ad-hoc email approval bypasses PO system; no audit trail created.
GAP-02 [MEDIUM] 48-hour SLA has no system enforcement
  Overruns are invisible until Finance queries the outstanding PO queue.
GAP-03 [MEDIUM] Verbal approvals accepted for urgent requests under £500
  Direct contradiction with Finance handbook §4.2 (no verbal approvals).`,
  },
  {
    skillId: "future-state-and-change-strategy",
    pnsConsumed: "analyzed",
    pnsSet: null,
    triggerUsed: "Model future-state improvements for purchase-approval based on the gap report.",
    inputLabel: "PNS.md [analyzed] + gap report + process-taxonomy",
    inputSnippet:
`GAP-01, GAP-02, GAP-03 confirmed in scope for future-state design.
Organisation profile: mid-size, single ERP system, no self-service approval module yet.`,
    outputLabel: "Future-state narrative (excerpt)",
    outputSnippet:
`FS-01: Delegation rule — system auto-routes to backup approver after 24 h of inactivity.
FS-02: SLA timer — escalation alert at 36 h; auto-escalation to Finance at 48 h.
FS-03: All approval actions (including verbal confirmations) captured in PO system log.
Delta: 2 new act-NNN entries; gateway g1 gains a third branch "escalate-to-backup".`,
  },
  {
    skillId: "decision-model-authoring",
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Build the DMN decision table for the approval gateway in purchase-approval.",
    inputLabel: "PNS.md [modeled] + business-glossary (rule-001)",
    inputSnippet:
`rule-001: Approval authority threshold = £200 standard, £5,000 Finance countersign.
Gateway act-004 has 2 branches (approve, reject); future-state adds escalate-to-backup.
Decision logic owner: Finance Controller.`,
    outputLabel: "DMN decision table (approval-gateway.dmn excerpt)",
    outputSnippet:
`rule | amount         | requester_auth  | result
R1   | < £200         | any             | auto-approve (petty cash)
R2   | £200 - £5,000  | standard        | manager-review
R3   | £200 - £5,000  | budget-holder   | auto-approve
R4   | > £5,000       | any             | finance-escalate
R5   | any            | manager-absent  | delegate-to-backup`,
  },
  {
    skillId: "process-validation-and-quality-scoring",
    pnsConsumed: "modeled",
    pnsSet: "validated",
    triggerUsed: "Validate and score the purchase-approval PNS.",
    inputLabel: "PNS.md [modeled] + compliance-controls-registry",
    inputSnippet:
`PNS version: 0.1.0-draft. All 8 sections present.
Known open items: GAP-03 (verbal approvals) not yet resolved in narrative.
Delegation rule not yet reflected in §5 activity sequence (future-state only).`,
    outputLabel: "Quality scorecard (excerpt)",
    outputSnippet:
`Overall score: 84 / 100  |  Recommendation: address V3 and V7 before publication
V1  Process Identification     10/10  no defects
V2  Scope & Boundaries          9/10  termination criteria partially ambiguous
V3  Stakeholder Register        8/10  delegation path undocumented in §3
V5  Activity Sequence           9/10  future-state delta not yet integrated
V7  Exception Handling          6/10  GAP-03 verbal approval not resolved in §6
V9  Handoff Conditions          9/10  countersign threshold unambiguous`,
  },
  {
    skillId: "process-measures-and-controls-definition",
    pnsConsumed: "validated",
    pnsSet: null,
    triggerUsed: "Define KPIs and controls for purchase-approval.",
    inputLabel: "PNS.md [validated] + compliance-controls-registry",
    inputSnippet:
`Validated PNS with 84/100 score accepted for measures definition.
Governance requirement: ISO 9001 §9.1 monitoring and measurement.
Finance audit obligation: PO records retained 7 years.`,
    outputLabel: "Measures & controls table (excerpt)",
    outputSnippet:
`KPI-01  Approval cycle time     target <= 48 h      measured per request
KPI-02  Rejection rate           target < 15%        measured monthly
KPI-03  SLA breach rate          target 0%           measured monthly
CTL-01  Finance countersign >£5k mandatory gate      blocks PO issuance
CTL-02  PO system audit log      evidence retained   7 years (ISO 9001 §7.5.3)`,
  },
  {
    skillId: "sop-and-work-instruction-generation",
    pnsConsumed: "validated",
    pnsSet: null,
    triggerUsed: "Generate the SOP for purchase-approval.",
    inputLabel: "PNS.md [validated] + role-dictionary + regional-context",
    inputSnippet:
`Target audience: Requesters and Dept. Managers.
Format: numbered steps with role callouts.
Scope: standard approval path; delegation path covered in a separate SOP addendum.`,
    outputLabel: "SOP-PROC-042 (first two steps)",
    outputSnippet:
`SOP-PROC-042  Purchase Request Approval  |  v1.0-draft  |  Owner: Procurement Manager

Step 1  [Requester]  Submit a purchase request via the PO portal for any spend >= £200.
  Required fields: supplier name, amount, cost centre, business justification.
  If amount < £200 use petty-cash process (SOP-PROC-015) — this SOP does not apply.

Step 2  [PO System]  Route the submitted request to the Dept. Manager inbox automatically.
  SLA clock starts at submission timestamp. Manager has 48 hours to act.`,
  },
  {
    skillId: "raci-and-governance-matrix-generation",
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Generate the RACI matrix for purchase-approval.",
    inputLabel: "PNS.md [modeled] + role-dictionary",
    inputSnippet:
`4 roles confirmed: req (Requester), mgr (Manager), fin (Finance), it (IT/PO System).
7 activities in §5. RACI-V01 rule: exactly one Accountable per activity.`,
    outputLabel: "RACI matrix (excerpt)",
    outputSnippet:
`Activity                 | Requester | Manager | Finance | IT System
Submit request           |     R     |    I    |    —    |    I
Review & decide          |     I     |   A/R   |  C>5k   |    —
Finance countersign      |     I     |    A    |    R    |    —
Issue Purchase Order     |     I     |    A    |    —    |    R
Send rejection notice    |     I     |    A    |    —    |    R`,
  },
  {
    skillId: "sipoc-generation",
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Generate the SIPOC for purchase-approval.",
    inputLabel: "PNS.md [modeled] + process-taxonomy",
    inputSnippet:
`Process: PROC-2024-042 Purchase Request Approval.
Scope confirmed: submission to PO issuance or rejection.
Stakeholder register available.`,
    outputLabel: "SIPOC table",
    outputSnippet:
`Suppliers   | Requester, Finance handbook, Supplier catalogue
Inputs      | Purchase request form, cost centre code, business justification
Process     | Submit -> Route -> Review -> Approve/Reject -> Issue PO / Notify
Outputs     | Purchase Order, rejection notice, PO audit log entry
Customers   | Requester (outcome), Finance (audit), Supplier (PO), IT (log)`,
  },
  {
    skillId: "publication-and-handoff-packaging",
    pnsConsumed: "validated",
    pnsSet: "published",
    triggerUsed: "Package purchase-approval for publication.",
    inputLabel: "PNS.md [validated] + all derived artifacts + approval metadata",
    inputSnippet:
`Validation score: 84/100 (V3 and V7 defects accepted by process owner).
Approver: Procurement Manager (Sarah K.), 2024-12-01.
Target repository: SharePoint / BP-SKILL Notion workspace.`,
    outputLabel: "Publication manifest (excerpt)",
    outputSnippet:
`BUNDLE: PROC-2024-042-v1.0  |  status: published  |  approved: 2024-12-01
Artifacts (10):
  PNS.md                stakeholder-register.md  gap-report.md
  bpmn-diagram.svg      decision-table.dmn       sop-PROC-042.md
  raci-matrix.md        kpi-controls.md          sipoc.md
  pir.yaml
Approval: Procurement Manager (digital signature) — countersigned Finance Controller`,
  },
];
