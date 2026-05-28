import { useEffect, useState, useRef, type CSSProperties } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Copy, Check } from "lucide-react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { SKILLS, PIPELINE_LAYERS } from "@/data/skills-registry";

const LAYER_COLOR: Record<number, string> = {};
PIPELINE_LAYERS.forEach((l) => { LAYER_COLOR[l.id] = l.color; });

const OFFBOARDING_BPMN = `bpmn-beta
accTitle: Employee Offboarding — Voluntary Resignation
accDescr: HR and management coordinate with IT to complete an employee departure.

pool hr "HR & Management" {
  lane hr_ops "HR Operations" {
    start s1 "Resignation Confirmed"
    task:user t1 "Open Offboarding Case"
    task:user t6 "Conduct Exit Interview"
    task:user t9 "Close Employee Record"
    end e1 "Offboarding Complete"
  }
  lane mgr "Line Manager" {
    task:user t2 "Set Last Working Day"
    task:user t3 "Assign Handover Tasks"
    task:user t4 "Approve Knowledge Transfer"
  }
  s1 --> t1
  t1 --> t2
  t2 --> t3
  t3 --> t4
  t4 --> t6
  t6 --> t9
  t9 --> e1
}

pool it "IT Services" {
  task:service t5 "Suspend System Accounts"
  task:user t7 "Collect Equipment"
  task:service t8 "Revoke All Access"
  t5 --> t7
  t7 --> t8
}

t1 ~~> t5
t4 ~~> t8`;

interface ExampleStep {
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

const STEPS: ExampleStep[] = [
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
    pnsSet: null,
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
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Build DMN decision tables for the offboarding access-revocation tier and equipment-escalation rules in employee-offboarding.",
    inputLabel: "PNS.md [modeled] + business-glossary + IT security policy + Legal input",
    inputSnippet:
`Two decision points requiring DMN formalisation:
  (1) Access revocation tier — determines which systems to revoke and in which order.
  (2) Equipment recovery path — determines whether remote wipe is authorised.
IT security policy defines 3 access tiers (critical, standard, low).`,
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
    pnsConsumed: "modeled",
    pnsSet: "validated",
    triggerUsed: "Validate and score the employee-offboarding PNS.",
    inputLabel: "PNS.md [modeled] + compliance-controls-registry + IT security policy",
    inputSnippet:
`PNS version: 0.1.0-draft. Sections §1–§7 present; §6 partial (IP policy TBC).
Known open items: GAP-04 (IP ownership) pending Legal; FS-03 sequencing fix not yet integrated.
GDPR data-retention requirement: leavers' personal data deletion schedule must be documented.`,
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
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Generate the RACI matrix for employee-offboarding.",
    inputLabel: "PNS.md [modeled] + role-dictionary",
    inputSnippet:
`5 roles confirmed: emp, mgr, hr, it, fin.
9 activities (act-001 to act-009) plus future-state additions.
RACI-V01 rule: exactly one Accountable per activity.`,
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
    pnsConsumed: "modeled",
    pnsSet: null,
    triggerUsed: "Generate the SIPOC for employee-offboarding.",
    inputLabel: "PNS.md [modeled] + process-taxonomy",
    inputSnippet:
`Process: PROC-2025-108 Employee Offboarding — Voluntary Resignation.
Scope confirmed: resignation receipt to full offboarding completion.
Stakeholder register and system touchpoints available.`,
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
    pnsSet: "published",
    triggerUsed: "Package employee-offboarding for publication.",
    inputLabel: "PNS.md [validated] + all derived artifacts + approval metadata",
    inputSnippet:
`Validation score: 81/100 (V6 GDPR gap accepted as known risk; Legal review scheduled Q2).
Approver: HR Director (Tom B.) + IT Head (Marcus P.), 2025-01-20.
Target repository: Confluence HR Process Library + IT Runbook.`,
    outputLabel: "Publication manifest (excerpt)",
    outputSnippet:
`BUNDLE: PROC-2025-108-v1.0  |  status: published  |  approved: 2025-01-20
Artifacts (11):
  PNS.md                     stakeholder-register.md    gap-report.md
  bpmn-diagram.svg           access-tier.dmn            equipment-escalation.dmn
  sop-PROC-108.md            it-work-instruction.md     raci-matrix.md
  kpi-controls.md            sipoc.md
Approval: HR Director + IT Head (joint sign-off) — countersigned Legal (IP declaration pending Q2)
Known open item: GDPR data-retention schedule (V6) — review by 2025-04-01`,
  },
];

function PnsBadgePair({ consumed, produced }: { consumed: string | null; produced: string | null }) {
  const setStyle = {
    background: "hsl(var(--primary) / 0.12)",
    borderColor: "hsl(var(--primary) / 0.4)",
    color: "hsl(var(--primary))",
  };
  const readStyle = {
    background: "hsl(var(--muted))",
    borderColor: "hsl(var(--border))",
    color: "hsl(var(--muted-foreground))",
  };
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {consumed !== null ? (
        <span className="px-1.5 py-0.5 rounded-full border text-[9px] font-mono font-semibold whitespace-nowrap" style={readStyle}>
          {consumed}
        </span>
      ) : (
        produced && (
          <span className="px-1.5 py-0.5 rounded-full border text-[9px] font-mono whitespace-nowrap italic" style={readStyle}>
            (no PNS yet)
          </span>
        )
      )}
      {produced && (
        <>
          <span className="text-[9px] text-muted-foreground/40 font-mono">→</span>
          <span className="px-1.5 py-0.5 rounded-full border text-[9px] font-mono font-semibold whitespace-nowrap" style={setStyle}>
            {produced}
          </span>
        </>
      )}
    </div>
  );
}

function PromptSequencePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [phrases, setPhrases] = useState(() => STEPS.map((s) => s.triggerUsed));
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updatePhrase(i: number, value: string) {
    setPhrases((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  async function copyAll() {
    const text = phrases
      .map((phrase, i) => `${String(i + 1).padStart(2, "0")}. ${phrase}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) setCopied(true);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="rounded-xl border border-border bg-card max-w-3xl mt-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <Copy size={14} className="text-primary shrink-0" />
          <span className="text-sm font-semibold text-foreground">Copy prompt sequence</span>
          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground/60 border border-border rounded px-1.5 py-0.5">
            {STEPS.length} triggers
          </span>
        </div>
        <ChevronDown
          size={16}
          className="text-muted-foreground transition-transform duration-200 shrink-0"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border">
          <div className="flex items-center justify-between px-5 py-2.5 bg-muted/20 border-b border-border">
            <p className="text-[10px] text-muted-foreground leading-tight max-w-sm">
              Edit trigger phrases to match your process name, then copy the full sequence.
            </p>
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 ml-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              style={{
                background: copied ? "hsl(var(--primary) / 0.12)" : "hsl(var(--primary))",
                color: copied ? "hsl(var(--primary))" : "#fff",
                border: copied ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid transparent",
              }}
            >
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy all</>}
            </button>
          </div>
          <ol className="divide-y divide-border">
            {STEPS.map((step, i) => {
              const skill = SKILLS.find((s) => s.id === step.skillId);
              return (
                <li key={step.skillId} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className="text-[10px] font-mono font-bold shrink-0 mt-2.5 w-5 text-right"
                    style={{ color: "hsl(var(--primary) / 0.7)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    {skill && (
                      <p className="text-[9px] font-mono text-muted-foreground/50 mb-1">
                        {skill.displayName}
                      </p>
                    )}
                    <textarea
                      value={phrases[i]}
                      onChange={(e) => updatePhrase(i, e.target.value)}
                      rows={2}
                      className="w-full text-xs font-mono text-foreground bg-muted/30 border border-border/60 rounded px-2.5 py-1.5 resize-none leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors"
                      aria-label={`Trigger phrase for skill ${i + 1}${skill ? `: ${skill.displayName}` : ""}`}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function EmployeeOffboardingExample() {
  useEffect(() => {
    document.title = "Employee Offboarding — Worked Example | BPMN for Mermaid";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Step-by-step trace of all 15 BP-SKILL skills applied to an employee offboarding process — from intake to published HR documentation bundle.");
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Employee Offboarding — Worked Example | BPMN for Mermaid");
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", "Step-by-step trace of all 15 BP-SKILL skills applied to an employee offboarding process.");
  }, []);

  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
        <Link
          href="/walkthrough"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={12} /> Back to Walkthrough
        </Link>
        <p className="forge-eyebrow mb-4">BP-SKILL v0.3 · Worked Example</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
          Employee Offboarding
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-3">
          This page traces all 15 BP-SKILL skills applied to a single HR scenario: documenting
          a voluntary resignation offboarding process. Each step shows the trigger phrase used,
          the key input provided, and an excerpt of the artifact produced.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-8">
          The <code className="font-mono text-xs bg-muted px-1 rounded">bpmn-beta</code> diagram
          at Skill 06 uses a pool/lane layout — HR, management, and IT as separate pools with
          cross-pool message flows. Skills 09 features two DMN decision tables.
        </p>

        {/* Scenario strip */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 max-w-3xl">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-3">Scenario</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Process</p>
              <p className="font-semibold text-foreground">Employee Offboarding — Voluntary Resignation</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Scope</p>
              <p className="text-muted-foreground">Signed resignation to full account revocation + equipment return</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Process ID</p>
              <p className="font-mono text-xs text-foreground/80">PROC-2025-108</p>
            </div>
          </div>
        </div>

        <PromptSequencePanel />
      </section>

      {/* ── 15-Step Timeline ─────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
          <p className="forge-eyebrow mb-3">Step-by-Step Trace</p>
          <h2 className="text-xl font-bold text-foreground mb-8">
            All 15 Skills, One Process
          </h2>

          <div className="relative flex flex-col gap-0">
            {/* Vertical timeline spine */}
            <div
              className="absolute left-[19px] top-10 bottom-10 w-px hidden sm:block"
              style={{ background: "hsl(var(--border))" }}
            />

            {STEPS.map((step, i) => {
              const skill = SKILLS.find((s) => s.id === step.skillId);
              if (!skill) return null;
              const layerColor = LAYER_COLOR[skill.layer] ?? "#888";
              return (
                <div key={step.skillId} className="relative flex gap-4 sm:gap-6 pb-6 last:pb-0">
                  {/* Step circle */}
                  <div className="shrink-0 flex flex-col items-center z-10">
                    <div
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0"
                      style={{ background: layerColor, borderColor: layerColor }}
                    >
                      {String(skill.pipelineOrder).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Step card */}
                  <div
                    className="flex-1 rounded-xl border border-border bg-card overflow-hidden mb-0"
                    style={{ "--layer-color": layerColor } as CSSProperties}
                  >
                    {/* Card header */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Link
                        href={`/skills/${skill.id}`}
                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                      >
                        {skill.displayName}
                      </Link>
                      <span
                        className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                        style={{
                          background: `${layerColor}18`,
                          borderColor: `${layerColor}60`,
                          color: layerColor,
                        }}
                      >
                        {skill.layerLabel}
                      </span>
                      <PnsBadgePair consumed={step.pnsConsumed} produced={step.pnsSet} />
                    </div>

                    {/* Card body */}
                    <div className="divide-y divide-border">
                      {/* Trigger */}
                      <div className="px-4 py-3 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-4 gap-y-1 items-start">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mt-0.5 shrink-0">Trigger</span>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          &ldquo;{step.triggerUsed}&rdquo;
                        </p>
                      </div>

                      {/* Input */}
                      <div className="px-4 py-3 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-4 items-start">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mt-0.5 shrink-0">Input</span>
                        <div>
                          <p className="text-[9px] font-mono text-muted-foreground/70 mb-1">{step.inputLabel}</p>
                          <pre className="text-[10px] font-mono text-foreground/70 leading-relaxed whitespace-pre-wrap bg-muted/40 rounded px-2.5 py-2 border border-border/50 overflow-x-auto">
                            {step.inputSnippet}
                          </pre>
                        </div>
                      </div>

                      {/* Output */}
                      <div className="px-4 py-3 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-4 items-start">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mt-0.5 shrink-0">Output</span>
                        <div>
                          <p className="text-[9px] font-mono text-muted-foreground/70 mb-1">{step.outputLabel}</p>
                          {step.hasDiagram ? (
                            <div className="rounded-lg border border-border bg-card overflow-x-auto">
                              <div style={{ minWidth: 600, padding: "8px 12px" }}>
                                <BpmnRenderer source={OFFBOARDING_BPMN} />
                              </div>
                            </div>
                          ) : (
                            <pre className="text-[10px] font-mono text-foreground/70 leading-relaxed whitespace-pre-wrap bg-muted/40 rounded px-2.5 py-2 border border-border/50 overflow-x-auto">
                              {step.outputSnippet}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pipeline end marker */}
            <div className="relative flex gap-4 sm:gap-6">
              <div className="shrink-0 flex flex-col items-center z-10">
                <div
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    background: "hsl(var(--primary) / 0.12)",
                    borderColor: "hsl(var(--primary) / 0.4)",
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: "hsl(var(--primary))" }} />
                </div>
              </div>
              <div className="flex items-center">
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--primary))" }}>
                  PROC-2025-108 published
                </p>
                <span className="ml-2 text-xs text-muted-foreground">
                  All 15 skills complete. PNS.md status:{" "}
                  <code className="font-mono text-[10px] bg-muted px-1 rounded">published</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="forge-eyebrow mb-2">Next Steps</p>
            <h2 className="text-lg font-bold text-foreground mb-1">
              Run this on your own process
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Each skill has an install command, a full SKILL.md specification, and a frontmatter
              preview so you can drop it into any agent skill runner.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/skills" className="forge-btn-primary inline-flex items-center gap-2">
              Browse All Skills <ArrowRight size={14} />
            </Link>
            <Link href="/walkthrough/purchase-approval" className="forge-btn-outline inline-flex items-center gap-2">
              Purchase Approval Example <ArrowRight size={14} />
            </Link>
            <Link href="/walkthrough" className="forge-btn-outline inline-flex items-center gap-2">
              <ArrowLeft size={14} /> Walkthrough Table
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
