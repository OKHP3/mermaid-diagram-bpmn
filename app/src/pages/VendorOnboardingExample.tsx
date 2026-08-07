import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { VENDOR_ONBOARDING_STEPS as STEPS } from "@/data/vendor-onboarding-steps";
import { ExamplePromptPanel } from "@/components/skills/ExamplePromptPanel";
import { ExampleStepTimeline } from "@/components/skills/ExampleStepTimeline";


/**
 * Node → skill detail route for the Vendor Onboarding diagram.
 * Mapping rationale (by node type / role in the process):
 *   s1  – start event     → Intake & Scope          (vendor nomination = process trigger)
 *   t1  – user task       → Intake & Scope          (capturing requirements = intake deliverable)
 *   t2  – user task       → Elicitation Interviews  (RFI = structured elicitation of vendor capabilities)
 *   t3  – user task       → Process Validation & Scoring (scoring = structured evaluation against rubric)
 *   t4  – user task       → Process Gap & Exception Analysis (compliance review = gap & risk identification)
 *   t5  – user task       → As-Is Process Capture   (vendor submits current capabilities = as-is data)
 *   t6  – user task       → Decision Model Authoring (manager approval = qualification DMN in action)
 *   t7  – user task       → Publication & Handoff   (PO issuance = formal procurement handoff)
 *   t8  – user task       → SOP & Work Instructions (supplier agreement = legal work instruction output)
 *   t9  – user task       → RACI Governance Matrix  (agreement signing = governance formalisation)
 *   e1  – end event       → Publication & Handoff   (vendor active = packaged onboarding outcome)
 */
export const VENDOR_ONBOARDING_NODE_LINKS: Record<string, string> = {
  s1: "/skills/okhp3-process-intake-and-scope",
  t1: "/skills/okhp3-process-intake-and-scope",
  t2: "/skills/okhp3-elicitation-interviews",
  t3: "/skills/okhp3-process-validation-scoring",
  t4: "/skills/okhp3-process-gap-exception-analysis",
  t5: "/skills/okhp3-as-is-process-capture",
  t6: "/skills/okhp3-decision-model-authoring",
  t7: "/skills/okhp3-publication-handoff-packaging",
  t8: "/skills/okhp3-sop-work-instructions",
  t9: "/skills/okhp3-raci-governance-matrix",
  e1: "/skills/okhp3-publication-handoff-packaging",
};

const VENDOR_ONBOARDING_BPMN = `bpmn-beta
accTitle: Vendor Onboarding — New Supplier Qualification
accDescr: Procurement, Legal, and the vendor coordinate to qualify and activate a new supplier.

pool procurement "Procurement" {
  lane proc_officer "Procurement Officer" {
    start s1 "Vendor Nominated"
    task:user t1 "Capture Requirements"
    task:user t2 "Send RFI to Vendor"
    task:user t3 "Score Vendor Response"
    task:user t7 "Issue Purchase Order"
    end e1 "Vendor Active"
  }
  lane proc_mgr "Procurement Manager" {
    task:user t6 "Review & Approve"
  }
  s1 --> t1
  t1 --> t2
  t2 --> t3
  t3 --> t6
  t6 --> t7
  t7 --> e1
}

pool legal "Legal & Compliance" {
  task:user t4 "Verify Compliance"
  task:user t8 "Draft Supplier Agreement"
}

pool vendor "Vendor" {
  task:user t5 "Submit RFI Response"
  task:user t9 "Sign Agreement"
}

t1 ~~> t4
t2 ~~> t5
t5 ~~> t3
t4 ~~> t6
t7 ~~> t8
t8 ~~> t9`;

export default function VendorOnboardingExample() {
  useEffect(() => {
    document.title = "Vendor Onboarding — Worked Example | BPMN for Mermaid";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Step-by-step trace of all 15 BP-SKILL skills applied to a vendor onboarding process — from supplier nomination to signed agreement and active ERP record.");
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Vendor Onboarding — Worked Example | BPMN for Mermaid");
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", "Step-by-step trace of all 15 BP-SKILL skills applied to a vendor onboarding process.");
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
          Vendor Onboarding
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-3">
          This page traces all 15 BP-SKILL skills applied to a single procurement scenario:
          qualifying and onboarding a new packaging supplier. Each step shows the trigger phrase
          used, the key input provided, and an excerpt of the artifact produced.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-8">
          The <code className="font-mono text-xs bg-muted px-1 rounded">bpmn-beta</code> diagram
          at Skill 06 uses three pools — Procurement (two lanes), Legal, and the Vendor — with
          cross-pool message flows coordinating the RFI exchange and agreement signing.
        </p>

        {/* Scenario strip */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 max-w-3xl">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-3">Scenario</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Process</p>
              <p className="font-semibold text-foreground">Vendor Onboarding — New Supplier Qualification</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Scope</p>
              <p className="text-muted-foreground">Vendor nomination to signed supplier agreement and active ERP record</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Process ID</p>
              <p className="font-mono text-xs text-foreground/80">PROC-2025-211</p>
            </div>
          </div>
        </div>

        <ExamplePromptPanel steps={STEPS} downloadFilename="PROC-2025-211-prompts.txt" storageKey="bp-skill:prompts:vendor-onboarding" />
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
            bpmnSource={VENDOR_ONBOARDING_BPMN}
            nodeLinks={VENDOR_ONBOARDING_NODE_LINKS}
            interactivityHint="Click any node to open its skill detail page"
            endLabel="PROC-2025-211 packaged"
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
            <Link href="/walkthrough/employee-offboarding" className="forge-btn-outline inline-flex items-center gap-2">
              Employee Offboarding Example <ArrowRight size={14} />
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
