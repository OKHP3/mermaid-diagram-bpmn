import { useEffect, type CSSProperties } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { SKILLS, PIPELINE_LAYERS } from "@/data/skills-registry";
import { PURCHASE_APPROVAL_STEPS as STEPS } from "@/data/purchase-approval-steps";
import { ExamplePnsBadgePair } from "@/components/skills/ExamplePnsBadgePair";
import { ExamplePromptPanel } from "@/components/skills/ExamplePromptPanel";

const LAYER_COLOR: Record<number, string> = {};
PIPELINE_LAYERS.forEach((l) => { LAYER_COLOR[l.id] = l.color; });

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
const PURCHASE_APPROVAL_NODE_LINKS: Record<string, string> = {
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
                <div key={step.skillId} id={`step-${step.skillId}`} className="relative flex gap-4 sm:gap-6 pb-6 last:pb-0">
                  {/* Step circle */}
                  <div className="shrink-0 flex flex-col items-center z-10">
                    <div
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0"
                      style={{
                        background: layerColor,
                        borderColor: layerColor,
                      }}
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
                      <ExamplePnsBadgePair consumed={step.pnsConsumed} produced={step.pnsSet} />
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
                            <>
                              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                                <div style={{ minWidth: 640, padding: "8px 12px" }}>
                                  <BpmnRenderer
                                    source={PURCHASE_APPROVAL_BPMN}
                                    nodeLinks={PURCHASE_APPROVAL_NODE_LINKS}
                                    interactivityHint="Click any node to open its skill detail page"
                                  />
                                </div>
                              </div>
                            </>
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
                <p
                  className="text-sm font-semibold"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  PROC-2024-042 published
                </p>
                <span className="ml-2 text-xs text-muted-foreground">
                  All 15 skills complete. PNS.md status: <code className="font-mono text-[10px] bg-muted px-1 rounded">published</code>
                </span>
              </div>
            </div>
          </div>
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
            <Link href="/walkthrough" className="forge-btn-outline inline-flex items-center gap-2">
              <ArrowLeft size={14} /> Walkthrough Table
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

