import { useEffect, useState, useRef, type CSSProperties } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Copy, Check } from "lucide-react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { SKILLS, PIPELINE_LAYERS } from "@/data/skills-registry";
import { PURCHASE_APPROVAL_STEPS as STEPS } from "@/data/purchase-approval-steps";

const LAYER_COLOR: Record<number, string> = {};
PIPELINE_LAYERS.forEach((l) => { LAYER_COLOR[l.id] = l.color; });

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
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-border bg-card max-w-3xl mt-6 overflow-hidden">
      {/* Header / toggle */}
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
            15 triggers
          </span>
        </div>
        <ChevronDown
          size={16}
          className="text-muted-foreground transition-transform duration-200 shrink-0"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="border-t border-border">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-muted/20 border-b border-border">
            <p className="text-[10px] text-muted-foreground leading-tight max-w-sm">
              Edit trigger phrases to match your process name, then copy the full sequence.
            </p>
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 ml-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              style={{
                background: copied
                  ? "hsl(var(--primary) / 0.12)"
                  : "hsl(var(--primary))",
                color: copied ? "hsl(var(--primary))" : "#fff",
                borderColor: copied ? "hsl(var(--primary) / 0.4)" : "transparent",
                border: copied ? "1px solid" : "1px solid transparent",
              }}
            >
              {copied ? (
                <><Check size={12} /> Copied!</>
              ) : (
                <><Copy size={12} /> Copy all</>
              )}
            </button>
          </div>

          {/* Phrase list */}
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
        <PromptSequencePanel />
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
                <div key={step.skillId} className="relative flex gap-4 sm:gap-6 pb-6 last:pb-0">
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
                              <div style={{ minWidth: 640, padding: "8px 12px" }}>
                                <BpmnRenderer source={PURCHASE_APPROVAL_BPMN} />
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
