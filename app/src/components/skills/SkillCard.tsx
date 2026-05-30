import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { type Skill, PIPELINE_LAYERS, GITHUB_RAW_BASE } from "@/data/skills-registry";
import { DownloadButton } from "./DownloadButton";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const [expanded, setExpanded] = useState(false);
  const layer = PIPELINE_LAYERS.find((l) => l.id === skill.layer);
  const layerColor = layer?.color ?? "#888";
  const isCore = skill.status === "core";

  const shortDesc =
    skill.description.length > 120
      ? skill.description.slice(0, 120).trimEnd() + "…"
      : skill.description;

  const shownRefs = skill.standardsRefs.slice(0, 3);
  const extraRefs = skill.standardsRefs.length - shownRefs.length;

  const shownPhrases = skill.triggerPhrases.slice(0, 3);

  return (
    <div
      className="forge-card flex flex-col hover:shadow-md transition-all group"
      style={{
        borderTopColor: layerColor,
        borderTopWidth: 4,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex flex-col gap-1.5">
          {/* Status badge */}
          {isCore ? (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-white"
              style={{ background: layerColor }}
            >
              Core
            </span>
          ) : (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border"
              style={{ borderColor: layerColor, color: layerColor, borderStyle: "dashed" }}
            >
              Extension
            </span>
          )}
          {/* Layer pill */}
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: `${layerColor}18`, color: layerColor }}
          >
            {layer?.label}
          </span>
        </div>
        {/* Pipeline order */}
        <span className="text-[11px] font-mono font-semibold text-muted-foreground/50 tabular-nums">
          {String(skill.pipelineOrder).padStart(2, "0")}/15
        </span>
      </div>

      {/* Card body */}
      <div className="px-4 pb-3 flex flex-col flex-1 gap-3">
        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground leading-snug">
          {skill.displayName}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {expanded ? skill.description : shortDesc}
          {skill.description.length > 120 && (
            <button
              className="ml-1 text-primary text-xs font-medium hover:underline"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Less" : "More"}
            </button>
          )}
        </p>

        {/* Standards refs */}
        <div className="flex flex-wrap gap-1">
          {shownRefs.map((ref) => (
            <span
              key={ref}
              className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono text-muted-foreground bg-muted border border-border"
              title={ref}
            >
              {ref.length > 28 ? ref.slice(0, 28) + "…" : ref}
            </span>
          ))}
          {extraRefs > 0 && (
            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono text-muted-foreground bg-muted border border-border">
              +{extraRefs} more
            </span>
          )}
        </div>

        {/* Consumes / Produces */}
        <div className="grid grid-cols-1 gap-1 text-[10px]">
          <div className="flex gap-1.5">
            <span className="font-mono text-muted-foreground/60 shrink-0 w-14">Consumes:</span>
            <span className="text-foreground/80 leading-snug">{skill.consumes.slice(0, 2).join(", ")}{skill.consumes.length > 2 ? `, +${skill.consumes.length - 2}` : ""}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-mono text-muted-foreground/60 shrink-0 w-14">Produces:</span>
            <span className="text-foreground/80 leading-snug">{skill.produces.slice(0, 2).join(", ")}{skill.produces.length > 2 ? `, +${skill.produces.length - 2}` : ""}</span>
          </div>
        </div>

        {/* Trigger phrases */}
        <div className="flex flex-col gap-0.5">
          {shownPhrases.map((phrase) => (
            <p key={phrase} className="text-[10px] text-muted-foreground italic">
              "{phrase}"
            </p>
          ))}
        </div>
      </div>

      {/* Footer buttons */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/20"
        style={{ marginTop: "auto" }}
      >
        <Link
          href={`/skills/${skill.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          View Details <ArrowRight size={11} />
        </Link>
        <DownloadButton
          url={`${import.meta.env.BASE_URL}skills/${skill.id}/SKILL.md`}
          filename="SKILL.md"
          label="Download SKILL.md"
          variant="ghost"
          className="text-xs"
        />
      </div>
    </div>
  );
}
