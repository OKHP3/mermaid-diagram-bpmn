import type { ExampleStep } from "./purchase-approval-steps";
export type { ExampleStep };

export const EMPLOYEE_OFFBOARDING_STEPS: ExampleStep[] = [
  {
    skillId: "process-intake-and-scope",
    pnsConsumed: null,
    pnsSet: "draft-intake",
    triggerUsed: "Map this process — employee offboarding for voluntary resignations. Notice period is 4 weeks standard, IT access must be revoked within 24 hours of the last working day.",
    inputLabel: "Brief from HR Business Partner",
    inputSnippet:
`A senior developer (Jordan T.) has resigned, last day 2025-01-17.
Standard notice is 4 weeks. We need a documented process covering
handover, IT access, equipment return, and final pay.
Currently there is no written SOP — each case is handled ad-hoc by HR.`,
    outputLabel: "pir.yaml (excerpt)",
    outputSnippet:
`process_id: PROC-2025-108
title: Employee Offboarding — Voluntary Resignation
owner: HR Business Partner
trigger: "Signed resignation letter received by HR"
termination: "All accounts revoked AND equipment collected AND final pay issued"
classification: internal
status: draft-intake`,
  },
  {
    skillId: "stakeholder-and-role-mapping",
    pnsConsumed: "draft-intake",
    pnsSet: "scoped",
    triggerUsed: "Map stakeholders for the employee-offboarding process.",
    inputLabel: "PNS.md [draft-intake] + organization-profile.md",
    inputSnippet:
`Process owner: HR Business Partner
Known actors (from brief): employee, line manager, HR, IT, Finance
Systems mentioned: Active Directory, HRIS (BambooHR), payroll`,
    outputLabel: "stakeholder_register (§3 excerpt)",
    outputSnippet:
`role_id | name                  | raci    | notes
emp     | Departing Employee    | R / I   | Must complete handover and return kit
mgr     | Line Manager          | A       | Approves knowledge-transfer completion
hr      | HR Business Partner   | R / A   | Process owner; issues all formal comms
it      | IT Operations         | R       | Account and equipment management
fin     | Payroll / Finance     | C / I   | Issues final pay, closes benefits`,
  },
  {
    skillId: "elicitation-and-interview-facilitation",
    pnsConsumed: "scoped",
    pnsSet: "elicited",
    triggerUsed: "Run the elicitation interview guide for employee-offboarding.",
    inputLabel: "PNS.md [scoped] + stakeholder register",
    inputSnippet:
`Interviewees: HR BP (Clara D.), IT Lead (Marcus P.), Line Manager (Priya S.)
Sessions: 2025-01-08 to 2025-01-10, 30 min each
Focus: exception paths, IP/code ownership, equipment recovery failures`,
    outputLabel: "§4 Evidence & Sources (key findings)",
    outputSnippet:
`- No SLA documented for Active Directory deactivation; IT currently targets "same day" (informal)
- 3 laptops unreturned in past 12 months — no escalation procedure exists
- IP ownership of personal GitHub repos unclear when built partly on company time
- Contradiction: HRIS exit checklist requires manager sign-off BEFORE IT revokes, but
  IT policy says accounts suspend on last-day start regardless of HR checklist status
Open question: Who authorises remote-wipe if equipment is not returned within 14 days?`,
  },
  {
    skillId: "as-is-process-capture",
    pnsConsumed: "elicited",
    pnsSet: "documented-as-is",
    triggerUsed: "Capture the as-is activity sequence for employee-offboarding.",
    inputLabel: "PNS.md [elicited] + interview transcripts",
    inputSnippet:
`Elicitation confirmed 9 main activities across 3 stakeholder groups.
2 contradictions logged. 1 open question (remote-wipe authority) unresolved.
No existing written SOP — activities reconstructed from interviews.`,
    outputLabel: "§5 As-Is Activity Sequence (excerpt)",
    outputSnippet:
`act-001 | HR             | Receive resignation letter; open HRIS offboarding ticket
act-002 | Line Manager   | Confirm last working day; notify team
act-003 | Line Manager   | Assign knowledge-transfer tasks to employee
act-004 | Employee       | Complete handover documentation and code comments
act-005 | Line Manager   | Sign off knowledge transfer in HRIS
act-006 | IT Operations  | Deactivate Active Directory account on last-day morning
act-007 | Employee / IT  | Return laptop, access cards, and mobile device
act-008 | HR             | Conduct exit interview; record feedback
act-009 | Payroll        | Process final pay run including holiday accrual`,
  },
  {
    skillId: "process-narrative-authoring",
    pnsConsumed: "documented-as-is",
    pnsSet: "modeled",
    triggerUsed: "Author the full PNS.md for employee-offboarding.",
    inputLabel: "PNS.md [documented-as-is] + business-glossary + role-dictionary",
    inputSnippet:
`All elicitation data captured. 9 activities sequenced, 2 contradictions logged.
Glossary terms needed: Active Directory, HRIS, remote wipe, knowledge transfer.
IP policy ambiguity flagged for gap analysis — not resolved in narrative.`,
    outputLabel: "PNS.md header + section completion status",
    outputSnippet:
`title: Employee Offboarding — Voluntary Resignation  |  version: 0.1.0-draft  |  status: modeled
§1  Process Identification         complete  (PROC-2025-108, owner: HR BP)
§2  Scope & Boundaries             complete  (trigger: signed letter; 2 exclusions: redundancy, retirement)
§3  Stakeholder & RACI Register    complete  (5 roles, 9 activities)
§4  Evidence & Sources             complete  (3 interviews, 2 contradictions, 1 open question)
§5  As-Is Activity Sequence        complete  (act-001 to act-009, no gateways — sequential)
§6  Business Rules & Decision Pts  partial   (IP ownership rule pending Legal input)
§7  System Touchpoints             complete  (Active Directory, BambooHR, payroll system)`,
  },
  {
    skillId: "visual-process-modeling",
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Generate the bpmn-beta diagram for employee-offboarding using pool-lane notation.",
    inputLabel: "PNS.md [modeled] + notation-preferences",
    inputSnippet:
`§5 activity sequence: 9 acts across 3 stakeholder groups.
Notation preference: pool-lane BPMN with message flows for cross-pool handoffs.
Render target: bpmn-beta DSL for Mermaid.`,
    outputLabel: "bpmn-beta pool/lane diagram",
    outputSnippet: "",
    hasDiagram: true,
  },
  {
    skillId: "process-gap-and-exception-analysis",
    pnsConsumed: "modeled",
    pnsSet: "analyzed",
    triggerUsed: "Analyse gaps and exceptions in the employee-offboarding process.",
    inputLabel: "PNS.md [modeled] + compliance-controls-registry + IT security policy",
    inputSnippet:
`2 contradictions logged in §4: (1) IT deactivation timing vs HR checklist sign-off;
  (2) no escalation path for unreturned equipment.
Open question: remote-wipe authority not resolved.
Legal: IP on personal repos built partly on company time — no written policy.`,
    outputLabel: "Gap report (excerpt)",
    outputSnippet:
`GAP-01 [HIGH]   IT account deactivation has no contractual SLA
  Risk: delay past last-day exposes systems to unauthorised post-employment access.
GAP-02 [HIGH]   No escalation path for unreturned equipment
  3 laptops unrecovered in 12 months; no remote-wipe authority documented.
GAP-03 [MEDIUM] HR sign-off sequencing contradicts IT's unilateral deactivation rule
  Contradiction between HRIS checklist (manager sign-off first) and IT policy (last-day start).
GAP-04 [MEDIUM] IP ownership of code built on personal repos is unaddressed
  Legal risk if company IP exists in repositories outside corporate ownership.`,
  },
  {
    skillId: "future-state-and-change-strategy",
    pnsConsumed: "analyzed",
    pnsSet: "future-designed",
    triggerUsed: "Model future-state improvements for employee-offboarding based on the gap report.",
    inputLabel: "PNS.md [analyzed] + gap report + organization-profile",
    inputSnippet:
`GAP-01 through GAP-04 confirmed for future-state design.
Organisation: 250-person tech company, single IT domain, no MDM tool yet.
Legal confirmed: IP policy update in scope for Q2; can reference in SOP as pending.`,
    outputLabel: "Future-state narrative (excerpt)",
    outputSnippet:
`FS-01: SLA mandate — IT deactivates Active Directory within 2 hours of last-day start (SLA timer).
FS-02: Equipment escalation — if not returned by day 3, HR auto-escalates to IT for remote wipe request;
  Legal authorises wipe by day 7 (documented in new act-010 and act-011).
FS-03: Sequencing fix — HR sends "OK to deactivate" signal via HRIS on manager sign-off;
  IT deactivation becomes event-triggered rather than time-triggered.
FS-04: IP acknowledgement step — employee signs IP declaration at act-001 (new mandatory field).
Delta: +2 act-NNN entries; 1 new event trigger (HRIS signal); 1 decision gateway added (equipment status).`,
  },
  {
    skillId: "decision-model-authoring",
    pnsConsumed: "analyzed",
    pnsSet: "decision-enriched",
    triggerUsed: "Build DMN decision tables for the offboarding access-revocation tier and equipment-escalation rules in employee-offboarding.",
    inputLabel: "PNS.md [analyzed] + gap report + IT security policy + Legal input",
    inputSnippet:
`Gap report confirmed two decision points requiring DMN formalisation:
  GAP-01: access revocation tier (critical/standard/low) — no SLA yet, needs formal rules.
  GAP-02: equipment recovery path — remote-wipe authority unresolved.
DMN authoring uses the analyzed PNS so decision tables reflect confirmed gap findings.`,
    outputLabel: "DMN decision tables (access-tier + equipment escalation)",
    outputSnippet:
`TABLE 1: access-revocation-tier.dmn
rule | role_sensitivity | system_type      | action
R1   | critical         | any              | revoke within 1 h of last-day start
R2   | standard         | cloud-saas       | revoke within 2 h
R3   | standard         | internal         | revoke within 4 h
R4   | low              | any              | revoke end of last working day

TABLE 2: equipment-escalation.dmn
rule | days_since_last_day | asset_value | outcome
R1   | <= 3                | any         | reminder email only
R2   | 4–7                 | >= £500     | HR escalates; IT prepares wipe request
R3   | > 7                 | any         | Legal authorises remote wipe`,
  },
  {
    skillId: "process-validation-and-quality-scoring",
    pnsConsumed: "decision-enriched",
    pnsSet: "validated",
    triggerUsed: "Validate and score the employee-offboarding PNS now that the DMN tables are in place.",
    inputLabel: "PNS.md [decision-enriched] + compliance-controls-registry + DMN tables",
    inputSnippet:
`PNS version: 0.1.0-draft. §6 Business Rules now supplemented by two DMN tables.
DMN tables include access-revocation-tier.dmn and equipment-escalation.dmn.
Validation checks that all GAP findings are addressed: GAP-01/02 via DMN; GAP-03 via FS-03; GAP-04 pending Legal.
GDPR data-retention requirement still absent from §7 — noted as V6 defect.`,
    outputLabel: "Quality scorecard (excerpt)",
    outputSnippet:
`Overall score: 81 / 100  |  Recommendation: resolve V6 (data retention) before publication
V1  Process Identification     10/10  no defects
V2  Scope & Boundaries          9/10  retirement/redundancy exclusions clearly stated
V3  Stakeholder Register        9/10  GDPR data-controller role not explicitly named
V4  Evidence & Sources          9/10  IP policy gap acknowledged; Legal input pending
V6  Regulatory Alignment        7/10  GDPR data-retention schedule absent from §7
V7  Exception Handling          8/10  remote-wipe authorisation path now documented
V9  Handoff Conditions          9/10  HRIS signal trigger clearly specified`,
  },
  {
    skillId: "process-measures-and-controls-definition",
    pnsConsumed: "validated",
    pnsSet: null,
    triggerUsed: "Define KPIs and controls for employee-offboarding.",
    inputLabel: "PNS.md [validated] + compliance-controls-registry + IT security policy",
    inputSnippet:
`Validated PNS with 81/100 score accepted for measures definition.
GDPR data-retention obligation noted (V6 defect). ISO 9001 §9.1 monitoring required.
IT security: account deactivation SLA must be measurable and auditable.`,
    outputLabel: "Measures & controls table (excerpt)",
    outputSnippet:
`KPI-01  Account deactivation time    target <= 2 h from last-day start   per offboarding case
KPI-02  Equipment recovery rate       target 100% within 7 days           measured monthly
KPI-03  Handover completion rate      target 100% signed off by last day  per offboarding case
KPI-04  Exit interview completion     target >= 90%                       measured quarterly
CTL-01  HRIS sign-off gate            mandatory before IT deactivation    blocks act-006
CTL-02  IP declaration signature      mandatory at act-001 (intake)       blocks case progression
CTL-03  Payroll final-pay run audit   evidence retained 7 years           HMRC / GDPR obligation`,
  },
  {
    skillId: "sop-and-work-instruction-generation",
    pnsConsumed: "validated",
    pnsSet: null,
    triggerUsed: "Generate the SOP for employee-offboarding.",
    inputLabel: "PNS.md [validated] + role-dictionary + regional-context",
    inputSnippet:
`Target audiences: HR Business Partner (SOP) and IT Operations (Work Instruction).
Format: numbered steps with role callouts and system references.
UK employment law applies (Employment Rights Act 1996); GDPR data obligations noted.`,
    outputLabel: "SOP-PROC-108 (first two steps)",
    outputSnippet:
`SOP-PROC-108  Employee Offboarding — Voluntary Resignation  |  v1.0-draft  |  Owner: HR BP

Step 1  [HR]       On receipt of signed resignation letter, open an offboarding case in BambooHR.
  Mandatory: employee must sign IP & confidentiality acknowledgement form (CTL-02) at this step.
  Record resignation date, agreed last working day, and notice period in the HRIS case.

Step 2  [Manager]  Within 24 hours of step 1, confirm last working day with the employee in writing.
  Create handover task list in the project management tool; assign to departing employee.
  SLA: manager sign-off on handover tasks must be completed before the final working day.`,
  },
  {
    skillId: "raci-and-governance-matrix-generation",
    pnsConsumed: "decision-enriched",
    pnsSet: null,
    triggerUsed: "Generate the RACI matrix for employee-offboarding including the DMN-governed decision activities.",
    inputLabel: "PNS.md [decision-enriched] + role-dictionary",
    inputSnippet:
`5 roles confirmed: emp, mgr, hr, it, fin.
9 activities (act-001 to act-009) plus 2 future-state additions (act-010, act-011).
RACI-V01 rule: exactly one Accountable per activity.
Decision activities (access-tier, equipment-escalation) now included as accountable IT rows.`,
    outputLabel: "RACI matrix (excerpt)",
    outputSnippet:
`Activity                    | Employee | Manager | HR   | IT   | Finance
Open offboarding case       |    I     |    I    | A/R  |  I   |   —
Confirm last working day    |    I     |   A/R   |  C   |  I   |   —
Complete knowledge transfer |   A/R    |    C    |  I   |  —   |   —
Approve handover sign-off   |    I     |   A/R   |  C   |  —   |   —
Deactivate system accounts  |    —     |    I    |  I   | A/R  |   —
Collect equipment           |   R/I    |    I    |  I   | A/R  |   —
Conduct exit interview      |    R     |    —    | A/R  |  —   |   —
Process final pay           |    I     |    —    |  C   |  —   |  A/R`,
  },
  {
    skillId: "sipoc-generation",
    pnsConsumed: "decision-enriched",
    pnsSet: null,
    triggerUsed: "Generate the SIPOC for employee-offboarding.",
    inputLabel: "PNS.md [decision-enriched] + process-taxonomy",
    inputSnippet:
`Process: PROC-2025-108 Employee Offboarding — Voluntary Resignation.
Scope confirmed: resignation receipt to full offboarding completion.
Stakeholder register, system touchpoints, and DMN decision tables all available.
SIPOC captures the DMN-governed access and equipment decisions as process steps.`,
    outputLabel: "SIPOC table",
    outputSnippet:
`Suppliers   | Employee (resignation), Line Manager (sign-off), IT (systems list), Legal (IP policy)
Inputs      | Resignation letter, signed IP acknowledgement, HRIS offboarding ticket, equipment register
Process     | Intake -> Handover assignment -> Handover approval -> Exit interview -> Account revocation -> Equipment collection -> Final pay
Outputs     | Closed HRIS record, revoked accounts, recovered equipment, signed exit interview, final payslip
Customers   | HR (compliance record), IT (clean access state), Finance (audit trail), Legal (IP declaration)`,
  },
  {
    skillId: "publication-and-handoff-packaging",
    pnsConsumed: "validated",
    pnsSet: "packaged",
    triggerUsed: "Package employee-offboarding for publication.",
    inputLabel: "PNS.md [validated] + all derived artifacts + approval metadata",
    inputSnippet:
`Validation score: 81/100 (V6 GDPR gap accepted as known risk; Legal review scheduled Q2).
Approver: HR Director (Tom B.) + IT Head (Marcus P.), 2025-01-20.
Target repository: Confluence HR Process Library + IT Runbook.`,
    outputLabel: "Publication manifest (excerpt)",
    outputSnippet:
`BUNDLE: PROC-2025-108-v1.0  |  status: packaged  |  approved: 2025-01-20
Artifacts (11):
  PNS.md                     stakeholder-register.md    gap-report.md
  bpmn-diagram.svg           access-tier.dmn            equipment-escalation.dmn
  sop-PROC-108.md            it-work-instruction.md     raci-matrix.md
  kpi-controls.md            sipoc.md
Approval: HR Director + IT Head (joint sign-off) — countersigned Legal (IP declaration pending Q2)
Known open item: GDPR data-retention schedule (V6) — review by 2025-04-01`,
  },
];
