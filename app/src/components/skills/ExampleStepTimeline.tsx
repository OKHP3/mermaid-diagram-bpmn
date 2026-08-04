import { type CSSProperties } from "react";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { SKILLS, PIPELINE_LAYERS } from "@/data/skills-registry";
import { type ExampleStep } from "@/data/purchase-approval-steps";
import { ExamplePnsBadgePair } from "@/components/skills/ExamplePnsBadgePair";

const LAYER_COLOR: Record<number, string> = {};
PIPELINE_LAYERS.forEach((l) => { LAYER_COLOR[l.id] = l.color; });

interface ExampleStepTimelineProps {
  steps: ExampleStep[];
  /** BPMN source shown in the step that has hasDiagram: true. */
  bpmnSource: string;
  /** Optional node → skill-route map passed to BpmnRenderer (e.g. for Purchase Approval). */
  nodeLinks?: Record<string, string>;
  /** Optional interactivity hint shown by BpmnRenderer when nodeLinks are set. */
  interactivityHint?: string;
  /** Bold label on the pipeline end marker, e.g. "PROC-2024-042 published". */
  endLabel: string;
  /** PNS lifecycle status shown in the end-marker monospace badge, e.g. "published". */
  endStatusCode: string;
}

/**
 * Shared 15-step timeline used by both worked-example pages.
 * Renders the vertical spine, step circles, step cards (trigger/input/output),
 * and the pipeline end marker.
 */
export function ExampleStepTimeline({
  steps,
  bpmnSource,
  nodeLinks,
  interactivityHint,
  endLabel,
  endStatusCode,
}: ExampleStepTimelineProps) {
  return (
    <div className="relative flex flex-col gap-0">
      {/* Vertical timeline spine */}
      <div
        className="absolute left-[19px] top-10 bottom-10 w-px hidden sm:block"
        style={{ background: "hsl(var(--border))" }}
      />

      {steps.map((step) => {
        const skill = SKILLS.find((s) => s.id === step.skillId);
        if (!skill) return null;
        const layerColor = LAYER_COLOR[skill.layer] ?? "#888";
        return (
          <div key={step.skillId} id={`step-${step.skillId}`} className="relative flex gap-4 sm:gap-6 pb-6 last:pb-0">
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
                      <div className="rounded-lg border border-border bg-card overflow-x-auto">
                        <div style={{ minWidth: 640, padding: "8px 12px" }}>
                          <BpmnRenderer
                            source={bpmnSource}
                            nodeLinks={nodeLinks}
                            interactivityHint={interactivityHint}
                          />
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
            {endLabel}
          </p>
          <span className="ml-2 text-xs text-muted-foreground">
            All 15 skills complete. PNS.md status:{" "}
            <code className="font-mono text-[10px] bg-muted px-1 rounded">{endStatusCode}</code>
          </span>
        </div>
      </div>
    </div>
  );
}
