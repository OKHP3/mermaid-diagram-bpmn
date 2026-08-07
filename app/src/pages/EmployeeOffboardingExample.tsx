import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EMPLOYEE_OFFBOARDING_STEPS as STEPS } from "@/data/employee-offboarding-steps";
import { ExamplePromptPanel } from "@/components/skills/ExamplePromptPanel";
import { ExampleStepTimeline } from "@/components/skills/ExampleStepTimeline";


/**
 * Node → skill detail route for the Employee Offboarding diagram.
 * Mapping rationale (by node type / role in the process):
 *   s1  – start event     → Intake & Scope       (process trigger: resignation confirmed)
 *   t1  – user task       → Intake & Scope       (opening the offboarding case)
 *   t2  – user task       → Stakeholder & Role Mapping (last working day involves all stakeholders)
 *   t3  – user task       → As-Is Process Capture     (capturing what the leaver currently does)
 *   t4  – user task       → Process Validation & Scoring (sign-off that transfer is complete)
 *   t5  – service task    → Visual Process Modeling    (IT subprocess: account suspension)
 *   t6  – user task       → Elicitation Interviews     (exit interview = formal elicitation)
 *   t7  – user task       → SOP & Work Instructions    (equipment collection follows a checklist)
 *   t8  – service task    → Process Measures & Controls (access revocation is a control step)
 *   t9  – user task       → Publication & Handoff      (closing the record = final package)
 *   e1  – end event       → Publication & Handoff      (completed offboarding outcome)
 */
export const OFFBOARDING_NODE_LINKS: Record<string, string> = {
  s1: "/skills/okhp3-process-intake-and-scope",
  t1: "/skills/okhp3-process-intake-and-scope",
  t2: "/skills/okhp3-stakeholder-and-role-mapping",
  t3: "/skills/okhp3-as-is-process-capture",
  t4: "/skills/okhp3-process-validation-scoring",
  t5: "/skills/okhp3-visual-process-modeling",
  t6: "/skills/okhp3-elicitation-interviews",
  t7: "/skills/okhp3-sop-work-instructions",
  t8: "/skills/okhp3-process-measures-controls",
  t9: "/skills/okhp3-publication-handoff-packaging",
  e1: "/skills/okhp3-publication-handoff-packaging",
};

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

        <ExamplePromptPanel steps={STEPS} downloadFilename="PROC-2025-108-prompts.txt" storageKey="bp-skill:prompts:employee-offboarding" />
      </section>

      {/* ── 15-Step Timeline ─────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
          <p className="forge-eyebrow mb-3">Step-by-Step Trace</p>
          <h2 className="text-xl font-bold text-foreground mb-8">
            All 15 Skills, One Process
          </h2>
          <ExampleStepTimeline
            steps={STEPS}
            bpmnSource={OFFBOARDING_BPMN}
            nodeLinks={OFFBOARDING_NODE_LINKS}
            interactivityHint="Click any node to open its skill detail page"
            endLabel="PROC-2025-108 packaged"
            endStatusCode="packaged"
          />
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
            <Link href="/walkthrough/vendor-onboarding" className="forge-btn-outline inline-flex items-center gap-2">
              Vendor Onboarding Example <ArrowRight size={14} />
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
