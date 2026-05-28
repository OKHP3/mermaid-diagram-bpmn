import { useState } from "react";
import { useLocation } from "wouter";
import { Copy, Check, ExternalLink } from "lucide-react";
import { SKILLS, PIPELINE_LAYERS } from "@/data/skills-registry";
import { SKILL_DEPS } from "@/data/skill-deps-auto";

// Node positions [col, row] derived from SKILL_DEPS (extracted from
// skills/{id}/SKILL.md frontmatter by scripts/extract-skill-deps.mjs).
//
// Layout  5 cols x 8 rows  NW=114 NH=40 CW=155 RH=54:
//   Col 0: PIS (root)
//   Col 1: SRM, EIF, AIS  (direct children of PIS)
//   Col 2: PNA (depends on PIS+SRM), GEA (depends on AIS)
//   Col 3: VPM DMA PVQ PMC SOP RACI SIP (from PNA), FSC (from GEA)
//   Col 4: PUB (depends on PNA+VPM+SOP)
const POSITIONS: Record<string, [number, number]> = {
  "process-intake-and-scope":                [0, 3],
  "stakeholder-and-role-mapping":            [1, 1],
  "elicitation-and-interview-facilitation":  [1, 3],
  "as-is-process-capture":                   [1, 6],
  "process-narrative-authoring":             [2, 3],
  "process-gap-and-exception-analysis":      [2, 6],
  "visual-process-modeling":                 [3, 0],
  "decision-model-authoring":                [3, 1],
  "process-validation-and-quality-scoring":  [3, 2],
  "process-measures-and-controls-definition":[3, 3],
  "sop-and-work-instruction-generation":     [3, 4],
  "raci-and-governance-matrix-generation":   [3, 5],
  "sipoc-generation":                        [3, 6],
  "future-state-and-change-strategy":        [3, 7],
  "publication-and-handoff-packaging":       [4, 3],
};

const SHORT: Record<string, string> = {
  "process-intake-and-scope":                "Intake & Scope",
  "stakeholder-and-role-mapping":            "Stakeholder Map",
  "elicitation-and-interview-facilitation":  "Elicitation",
  "as-is-process-capture":                   "As-Is Capture",
  "process-narrative-authoring":             "Narrative Auth.",
  "visual-process-modeling":                 "Visual Modeling",
  "process-gap-and-exception-analysis":      "Gap Analysis",
  "future-state-and-change-strategy":        "Future State",
  "decision-model-authoring":                "Decision Model",
  "process-validation-and-quality-scoring":  "Validation",
  "process-measures-and-controls-definition":"Measures",
  "sop-and-work-instruction-generation":     "SOP & WIs",
  "raci-and-governance-matrix-generation":   "RACI Matrix",
  "sipoc-generation":                        "SIPOC",
  "publication-and-handoff-packaging":       "Publication",
};

const NW = 114;
const NH = 40;
const CW = 155;
const RH = 54;
const PAD = 12;

const nx = (col: number) => col * CW + PAD;
const ny = (row: number) => row * RH + PAD;

const SVG_W = nx(4) + NW + PAD;
const SVG_H = ny(7) + NH + PAD;

const LAYER_CLS: Record<number, string> = {
  1: "discovery",
  2: "narrative",
  3: "visual",
  4: "operational",
  5: "governance",
  6: "publication",
};

/**
 * Generates Mermaid flowchart code from SKILL_DEPS (extracted from SKILL.md).
 * Edges are: dependency -> dependent (left-to-right data flow).
 */
function buildMermaid(): string {
  const lines: string[] = [
    "flowchart LR",
    "  classDef discovery fill:#e0f2fe,stroke:#4A9EBF,color:#1e3a5f",
    "  classDef narrative fill:#ede9fe,stroke:#7B68EE,color:#3b1f6b",
    "  classDef visual fill:#dcfce7,stroke:#5BA08A,color:#1a3d2e",
    "  classDef operational fill:#fef3c7,stroke:#CC8B30,color:#5c3d0a",
    "  classDef governance fill:#fee2e2,stroke:#C0645A,color:#5c1d1d",
    "  classDef publication fill:#f1f5f9,stroke:#777777,color:#2d3748",
    "",
  ];

  const diagramSkills = SKILLS.filter((s) => POSITIONS[s.id]).sort(
    (a, b) => a.pipelineOrder - b.pipelineOrder,
  );

  for (const s of diagramSkills) {
    const mid = s.id.replace(/-/g, "_");
    const label = `${String(s.pipelineOrder).padStart(2, "0")} - ${s.displayName}`;
    lines.push(`  ${mid}["${label}"]:::${LAYER_CLS[s.layer]}`);
  }
  lines.push("");
  for (const s of diagramSkills) {
    for (const dep of SKILL_DEPS[s.id] ?? []) {
      if (!POSITIONS[dep]) continue;
      lines.push(
        `  ${dep.replace(/-/g, "_")} --> ${s.id.replace(/-/g, "_")}`,
      );
    }
  }
  return lines.join("\n");
}

const MERMAID_CODE = buildMermaid();

interface Arrow {
  key: string;
  d: string;
}

export function DependencyFlowDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();

  const layerColors = Object.fromEntries(
    PIPELINE_LAYERS.map((l) => [l.id, l.color]),
  ) as Record<number, string>;

  function handleCopy() {
    navigator.clipboard.writeText(MERMAID_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const arrows: Arrow[] = [];
  for (const skill of SKILLS) {
    if (!POSITIONS[skill.id]) continue;
    const [tcol, trow] = POSITIONS[skill.id];
    for (const dep of SKILL_DEPS[skill.id] ?? []) {
      if (!POSITIONS[dep]) continue;
      const [scol, srow] = POSITIONS[dep];
      const x1 = nx(scol) + NW;
      const y1 = ny(srow) + NH / 2;
      const x2 = nx(tcol);
      const y2 = ny(trow) + NH / 2;
      const bend = Math.abs(x2 - x1) * 0.38;
      arrows.push({
        key: `${dep}->${skill.id}`,
        d: `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`,
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-card/40">
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="block"
          style={{ minWidth: SVG_W }}
        >
          <defs>
            <marker
              id="dep-arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L7,4 L0,8 Z" fill="#94a3b8" />
            </marker>
          </defs>

          <g>
            {arrows.map(({ key, d }) => (
              <path
                key={key}
                d={d}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={1.5}
                opacity={0.55}
                markerEnd="url(#dep-arrowhead)"
              />
            ))}
          </g>

          {SKILLS.filter((s) => POSITIONS[s.id]).map((skill) => {
            const [col, row] = POSITIONS[skill.id];
            const x = nx(col);
            const y = ny(row);
            const isHov = hovered === skill.id;
            const color = layerColors[skill.layer] ?? "#888";
            const label = SHORT[skill.id] ?? skill.displayName;
            const order = String(skill.pipelineOrder).padStart(2, "0");

            return (
              <g
                key={skill.id}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(skill.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/skills/${skill.id}`)}
                role="link"
                aria-label={`${skill.displayName} — ${skill.status === "core" ? "Core" : "Extension"}, ${skill.layerLabel}`}
              >
                <rect
                  x={x}
                  y={y}
                  width={NW}
                  height={NH}
                  rx={6}
                  fill={color}
                  fillOpacity={isHov ? 0.18 : 0.08}
                  stroke={color}
                  strokeWidth={isHov ? 2 : 1}
                  strokeOpacity={isHov ? 0.9 : 0.4}
                  strokeDasharray={skill.status === "recommended-extension" ? "5 3" : undefined}
                />
                <text
                  x={x + 8}
                  y={y + 13}
                  fontSize={8}
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                  style={{ fill: color, fillOpacity: 0.8 }}
                >
                  {order}
                </text>
                <text
                  x={x + 8}
                  y={y + 28}
                  fontSize={10}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  style={{ fill: "hsl(var(--foreground))", fillOpacity: 0.85 }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* ── Hover tooltip ─────────────────────────────────────────── */}
          {hovered && (() => {
            const skill = SKILLS.find((s) => s.id === hovered);
            if (!skill || !POSITIONS[skill.id]) return null;
            const [col, row] = POSITIONS[skill.id];
            const cx = nx(col) + NW / 2;
            const ty = ny(row);
            const statusLabel = skill.status === "core" ? "Core" : "Extension";
            const tipText = `${statusLabel} · ${skill.layerLabel}`;
            const tw = tipText.length * 5.6 + 18;
            const th = 18;
            const tx = Math.min(Math.max(cx - tw / 2, PAD), SVG_W - tw - PAD);
            const tooltipY = ty - th - 5;
            return (
              <g style={{ pointerEvents: "none" }}>
                <rect
                  x={tx}
                  y={tooltipY}
                  width={tw}
                  height={th}
                  rx={4}
                  fill="hsl(var(--popover, 0 0% 100%))"
                  stroke="hsl(var(--border, 0 0% 80%))"
                  strokeWidth={1}
                  opacity={0.97}
                />
                <text
                  x={tx + tw / 2}
                  y={tooltipY + 12}
                  fontSize={9}
                  textAnchor="middle"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  style={{ fill: "hsl(var(--foreground, 0 0% 10%))", fillOpacity: 0.9 }}
                >
                  {tipText}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50">
          Layer:
        </span>
        {PIPELINE_LAYERS.map((l) => (
          <div key={l.id} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: l.color }}
            />
            <span className="text-[9px] text-muted-foreground font-mono">
              {l.label}
            </span>
          </div>
        ))}
        <span className="text-muted-foreground/20 text-[9px] font-mono">|</span>
        <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50">
          Border:
        </span>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" className="flex-shrink-0">
            <rect x="1" y="1" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60" />
          </svg>
          <span className="text-[9px] text-muted-foreground font-mono">Core</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" className="flex-shrink-0">
            <rect x="1" y="1" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="text-muted-foreground/60" />
          </svg>
          <span className="text-[9px] text-muted-foreground font-mono">Extension</span>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
            Mermaid — paste into a Notion code block (language: Mermaid)
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://mermaid.live"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
            >
              mermaid.live <ExternalLink size={9} />
            </a>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
            >
              {copied ? (
                <Check size={10} className="text-green-500" />
              ) : (
                <Copy size={10} />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <pre className="text-[9px] font-mono p-3 overflow-x-auto text-muted-foreground/70 leading-relaxed max-h-40 bg-muted/10">
          {MERMAID_CODE}
        </pre>
      </div>
    </div>
  );
}
