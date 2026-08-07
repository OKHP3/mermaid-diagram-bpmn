import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PURCHASE_APPROVAL_STEPS as STEPS } from "@/data/purchase-approval-steps";
import { ExamplePromptPanel } from "@/components/skills/ExamplePromptPanel";
import { ExampleStepTimeline } from "@/components/skills/ExampleStepTimeline";


/**
 * Node → skill detail route for the Purchase Approval diagram.
 * Mapping rationale (by node type / role in the process):
 *   s1  – start event     → Intake & Scope (documents the process trigger)
 *   t1  – user task       → As-Is Process Capture (captures the review activity)
 *   g1  – gateway         → Gap & Exception Analysis (documents the decision branch)
 *   t2  – service task    → Visual Process Modeling (models the system-generated PO)
 *   t3  – user task       → Gap & Exception Analysis (the rejection exception path)
 *   e1  – end event       → Publication & Handoff (the successful process outcome)
 *   e2  – end event       → Gap & Exception Analysis (the exception end state)
 */
export const PURCHASE_APPROVAL_NODE_LINKS: Record<string, string> = {
  s1: "/skills/okhp3-process-intake-and-scope",
  t1: "/skills/okhp3-as-is-process-capture",
  g1: "/skills/okhp3-process-gap-exception-analysis",
  t2: "/skills/okhp3-visual-process-modeling",
  t3: "/skills/okhp3-process-gap-exception-analysis",
  e1: "/skills/okhp3-publication-handoff-packaging",
  e2: "/skills/okhp3-process-gap-exception-analysis",
};

const PURCHASE_APPROVAL_BPMN = `bpmn-beta
accTitle: Purchase Request Approval
accDescr: A manager reviews a request and either approves or rejects it via an exclusive gateway.

start s1 "Request Raised"
task:user t1 "Review Request"
xor g1 "Approved?"
task:service t2 "Issue Purchase Order"
task:user t3 "Notify Rejection"
end e1 "Order Issued"
end e2 "Rejected"

s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> t3: "no"
t2 --> e1
t3 ==> e2`;

export default function PurchaseApprovalExample() {
  useEffect(() => {
    document.title = "Purchase Approval — Worked Example | BPMN for Mermaid";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Step-by-step trace of all 15 BP-SKILL skills applied to a purchase-approval process — from intake to published documentation bundle.");
  }, []);

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
        <Link
          href="/walkthrough"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={12} /> Back to Walkthrough
        </Link>
        <p className="forge-eyebrow mb-4">BP-SKILL v0.3 · Worked Example</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
          Purchase Approval
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-3">
          This page traces all 15 BP-SKILL skills applied to a single concrete scenario: documenting
          a company's purchase-request approval process. Each step shows the trigger phrase used,
          the key input provided, and an excerpt of the artifact produced.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-8">
          The <code className="font-mono text-xs bg-muted px-1 rounded">bpmn-beta</code> diagram is
          embedded at Skill 06 (Visual Process Modeling), rendered from the same DSL the practitioner
          would generate at that stage.
        </p>

        {/* Scenario strip */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 max-w-3xl">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-3">Scenario</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Process</p>
              <p className="font-semibold text-foreground">Purchase Request Approval</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Scope</p>
              <p className="text-muted-foreground">Spend requests over £200, manager decides within 48 h</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-1">Process ID</p>
              <p className="font-mono text-xs text-foreground/80">PROC-2024-042</p>
            </div>
          </div>
        </div>
        <ExamplePromptPanel steps={STEPS} downloadFilename="PROC-2024-042-prompts.txt" storageKey="bp-skill:prompts:purchase-approval" />
      </section>

      {/* ── 15-Step Timeline ──────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
          <p className="forge-eyebrow mb-3">Step-by-Step Trace</p>
          <h2 className="text-xl font-bold text-foreground mb-8">
            All 15 Skills, One Process
          </h2>
          <ExampleStepTimeline
            steps={STEPS}
            bpmnSource={PURCHASE_APPROVAL_BPMN}
            nodeLinks={PURCHASE_APPROVAL_NODE_LINKS}
            interactivityHint="Click any node to open its skill detail page"
            endLabel="PROC-2024-042 published"
            endStatusCode="published"
          />
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
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
            <Link href="/walkthrough/employee-offboarding" className="forge-btn-outline inline-flex items-center gap-2">
              Employee Offboarding Example <ArrowRight size={14} />
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

