import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { type Skill, PIPELINE_LAYERS } from "@/data/skills-registry";

interface SkillMiniCardProps {
  skill: Skill;
  relation?: "upstream" | "downstream" | "related";
}

export function SkillMiniCard({ skill, relation }: SkillMiniCardProps) {
  const layer = PIPELINE_LAYERS.find((l) => l.id === skill.layer);
  const layerColor = layer?.color ?? "#888";

  return (
    <Link
      href={`/skills/${skill.id}`}
      className="block p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all group"
      style={{ borderTopColor: layerColor, borderTopWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: `${layerColor}22`, color: layerColor }}
        >
          {layer?.label}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          #{String(skill.pipelineOrder).padStart(2, "0")}
        </span>
      </div>
      {relation && (
        <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1">
          {relation === "upstream" ? "← depends on" : relation === "downstream" ? "→ unlocks" : "related"}
        </p>
      )}
      <p className="text-xs font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
        {skill.displayName}
      </p>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        View <ArrowRight size={9} />
      </div>
    </Link>
  );
}
