import { useState } from "react";
import { Link } from "wouter";
import { SKILLS, PIPELINE_LAYERS, PNS_LIFECYCLE } from "@/data/skills-registry";

const STATUS_COLORS: Record<string, string> = {};
PNS_LIFECYCLE.forEach((s) => { STATUS_COLORS[s.status] = s.order <= 5 ? "#7B68EE" : s.order <= 9 ? "#5BA08A" : "#888"; });

function SkillNode({ skill, layerColor }: { skill: typeof SKILLS[0]; layerColor: string }) {
  const [hover, setHover] = useState(false);
  const isCore = skill.status === "core";

  return (
    <div className="relative flex-shrink-0">
      <Link
        href={`/skills/${skill.id}`}
        className="block rounded-lg border transition-all"
        style={{
          width: 120,
          padding: "8px 10px",
          borderColor: hover ? layerColor : "hsl(var(--border))",
          background: hover ? `${layerColor}12` : "hsl(var(--card))",
          boxShadow: hover ? `0 2px 8px ${layerColor}30` : "none",
          borderLeftWidth: 3,
          borderLeftColor: layerColor,
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <span
            className="text-[8px] font-mono font-bold px-1 py-0.5 rounded"
            style={{
              background: isCore ? layerColor : "transparent",
              color: isCore ? "#fff" : layerColor,
              border: isCore ? "none" : `1px dashed ${layerColor}`,
            }}
          >
            {isCore ? "CORE" : "EXT"}
          </span>
          <span className="text-[8px] font-mono text-muted-foreground/50">
            {String(skill.pipelineOrder).padStart(2, "0")}
          </span>
        </div>
        <p className="text-[10px] font-semibold text-foreground leading-snug">
          {skill.displayName}
        </p>
      </Link>

      {/* Hover tooltip */}
      {hover && (
        <div
          className="absolute z-50 left-0 top-full mt-1 rounded-lg border border-border bg-card shadow-lg p-2.5"
          style={{ width: 180, pointerEvents: "none" }}
        >
          <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1.5">
            Triggers
          </p>
          {skill.triggerPhrases.slice(0, 3).map((t) => (
            <p key={t} className="text-[9px] italic text-foreground/70 mb-0.5">
              "{t}"
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center shrink-0" style={{ width: 16 }}>
      <div
        className="w-full h-px"
        style={{ background: "hsl(var(--border))" }}
      />
      <span className="text-[8px] text-muted-foreground/40 ml-[-1px]">›</span>
    </div>
  );
}

export function PipelineDiagram() {
  return (
    <div className="w-full">
      {/* Desktop: horizontal swim lanes */}
      <div className="hidden md:block">
        <div className="overflow-x-auto pb-4">
          <div style={{ minWidth: 900 }}>
            {PIPELINE_LAYERS.map((layer) => {
              const layerSkills = SKILLS
                .filter((s) => s.layer === layer.id)
                .sort((a, b) => a.pipelineOrder - b.pipelineOrder);
              if (layerSkills.length === 0) return null;

              return (
                <div
                  key={layer.id}
                  className="flex items-stretch mb-2 rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${layer.color}30` }}
                >
                  {/* Lane label */}
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 90,
                      background: `${layer.color}14`,
                      borderRight: `1px solid ${layer.color}30`,
                      padding: "12px 8px",
                    }}
                  >
                    <p
                      className="text-[9px] font-mono font-semibold uppercase tracking-wider text-center"
                      style={{ color: layer.color, writingMode: "horizontal-tb" }}
                    >
                      {layer.label}
                    </p>
                  </div>

                  {/* Skills row */}
                  <div
                    className="flex items-center gap-0 flex-wrap p-3"
                    style={{ background: `${layer.color}06` }}
                  >
                    {layerSkills.map((skill, i) => (
                      <div key={skill.id} className="flex items-center">
                        <SkillNode skill={skill} layerColor={layer.color} />
                        {i < layerSkills.length - 1 && <Arrow />}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* PNS lifecycle bar */}
            <div
              className="mt-4 rounded-xl border p-3"
              style={{ borderColor: "hsl(var(--primary) / 0.3)", background: "hsl(var(--primary) / 0.04)" }}
            >
              <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary/70 mb-2">
                PNS.md lifecycle ↓
              </p>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {PNS_LIFECYCLE.map((state, i) => (
                  <div key={state.status} className="flex items-center gap-1 shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-mono"
                      style={{
                        background: "hsl(var(--primary) / 0.12)",
                        color: "hsl(var(--primary))",
                        border: "1px solid hsl(var(--primary) / 0.25)",
                      }}
                    >
                      {state.status}
                    </span>
                    {i < PNS_LIFECYCLE.length - 1 && (
                      <span className="text-muted-foreground/30 text-[9px]">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: vertical list */}
      <div className="md:hidden flex flex-col gap-2">
        {PIPELINE_LAYERS.map((layer) => {
          const layerSkills = SKILLS
            .filter((s) => s.layer === layer.id)
            .sort((a, b) => a.pipelineOrder - b.pipelineOrder);
          if (layerSkills.length === 0) return null;

          return (
            <div
              key={layer.id}
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${layer.color}30` }}
            >
              {/* Layer header */}
              <div
                className="px-3 py-2"
                style={{ background: `${layer.color}18` }}
              >
                <p
                  className="text-[9px] font-mono font-bold uppercase tracking-wider"
                  style={{ color: layer.color }}
                >
                  Layer {layer.id} · {layer.label}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {layer.description}
                </p>
              </div>

              {/* Skills */}
              <div className="divide-y divide-border">
                {layerSkills.map((skill) => (
                  <Link
                    key={skill.id}
                    href={`/skills/${skill.id}`}
                    className="flex items-center justify-between px-3 py-2.5 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {skill.pipelineOrder}. {skill.displayName}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {skill.status === "core" ? "Core" : "Extension"}
                      </p>
                    </div>
                    <span className="text-muted-foreground/40 text-xs">›</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60">
          Legend:
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: "hsl(var(--primary))" }}
          />
          <span className="text-[9px] text-muted-foreground">CORE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm border border-dashed"
            style={{ borderColor: "hsl(var(--primary))" }}
          />
          <span className="text-[9px] text-muted-foreground">EXTENSION</span>
        </div>
        {PIPELINE_LAYERS.map((l) => (
          <div key={l.id} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: l.color }}
            />
            <span className="text-[9px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
