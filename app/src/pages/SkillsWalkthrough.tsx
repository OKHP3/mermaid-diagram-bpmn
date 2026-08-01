import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowDown } from "lucide-react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { SKILLS, PIPELINE_LAYERS } from "@/data/skills-registry";
import { PNS_TRANSITIONS } from "@/data/pns-transitions";
import { PnsLifecycleTracker } from "@/components/skills/PnsLifecycleTracker";
import { PnsBadge } from "@/components/skills/PnsBadge";

const LAYER_COLOR: Record<number, string> = {};
PIPELINE_LAYERS.forEach((l) => { LAYER_COLOR[l.id] = l.color; });

const PIPELINE_NODE_LINKS: Record<string, string> = {};
const PIPELINE_NODE_TOOLTIPS: Record<string, string> = {};
SKILLS.forEach((skill) => {
  const nodeId = `sk${String(skill.pipelineOrder).padStart(2, "0")}`;
  PIPELINE_NODE_LINKS[nodeId] = `/skills/${skill.id}`;
  if (skill.triggerPhrases[0]) {
    PIPELINE_NODE_TOOLTIPS[nodeId] = skill.triggerPhrases[0];
  }
});

const PIPELINE_BPMN = `bpmn-beta
accTitle: BP-SKILL v0.3 — 15-Skill Pipeline
accDescr: Business process documentation lifecycle from intake to publication. Click any skill node to open its detail page.

start s0 "Process Request"
task:user sk01 "01 · Intake & Scope"
task:user sk02 "02 · Stakeholder Mapping"
task:user sk03 "03 · Elicitation"
task sk04 "04 · As-Is Capture"
task sk05 "05 · PNS Authoring"
task:service sk06 "06 · Visual Modeling"
task sk07 "07 · Gap Analysis"
task sk08 "08 · Future State"
task sk09 "09 · Decision Model"
task sk10 "10 · Validation"
task sk11 "11 · Measures"
task:service sk12 "12 · SOP & Work Instructions"
task sk13 "13 · RACI & Governance"
task sk14 "14 · SIPOC"
task:service sk15 "15 · Publication & Handoff"
end e0 "Process Published"

s0 --> sk01
sk01 --> sk02
sk02 --> sk03
sk03 --> sk04
sk04 --> sk05
sk05 --> sk06
sk06 --> sk07
sk07 --> sk08
sk08 --> sk09
sk09 --> sk10
sk10 --> sk11
sk11 --> sk12
sk12 --> sk13
sk13 --> sk14
sk14 --> sk15
sk15 --> e0`;

function nextSkillsFor(skillId: string): typeof SKILLS {
  return SKILLS.filter((s) => s.dependsOn.includes(skillId))
    .sort((a, b) => a.pipelineOrder - b.pipelineOrder);
}

/** Map from skill id → PNS "after" status for that skill (source: PNS_TRANSITIONS). */
const SKILL_PNS_STATUS: Record<string, string> = {};
Object.entries(PNS_TRANSITIONS).forEach(([skillId, tx]) => {
  if (tx.after) SKILL_PNS_STATUS[skillId] = tx.after;
});

export default function SkillsWalkthrough() {
  useEffect(() => {
    document.title = "BP-SKILL Suite Walkthrough | BPMN for Mermaid";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "End-to-end walkthrough of all 15 BP-SKILL skills — from intake to publication. Trigger conditions, inputs consumed, artifacts produced, and downstream handoffs.");
  }, []);

  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined);
  const intersectingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const intersecting = intersectingRef.current;

    function updateActiveStatus() {
      if (intersecting.size === 0) {
        setActiveStatus(undefined);
        return;
      }
      // Pick the visible skill with the lowest pipeline order
      let bestSkill: (typeof SKILLS)[number] | undefined;
      for (const skillId of intersecting) {
        const skill = SKILLS.find((s) => s.id === skillId);
        if (!skill) continue;
        if (!bestSkill || skill.pipelineOrder < bestSkill.pipelineOrder) {
          bestSkill = skill;
        }
      }
      if (bestSkill) {
        setActiveStatus(SKILL_PNS_STATUS[bestSkill.id]);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Extract skill id from e.g. "row-okhp3-process-intake-and-scope-lg" or "-sm"
          const rawId = entry.target.id;
          const skillId = rawId.replace(/^row-/, "").replace(/-(lg|sm)$/, "");
          if (entry.isIntersecting) {
            intersecting.add(skillId);
          } else {
            intersecting.delete(skillId);
          }
        }
        updateActiveStatus();
      },
      {
        // A band spanning from 10% to 55% from the top of the viewport
        rootMargin: "-10% 0px -45% 0px",
        threshold: 0,
      }
    );

    // Observe all desktop and mobile row elements
    for (const skill of SKILLS) {
      const lg = document.getElementById(`row-${skill.id}-lg`);
      const sm = document.getElementById(`row-${skill.id}-sm`);
      if (lg) observer.observe(lg);
      if (sm) observer.observe(sm);
    }

    return () => {
      observer.disconnect();
      intersecting.clear();
    };
  }, []);

  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
        <p className="forge-eyebrow mb-4">BP-SKILL v0.3 · End-to-End Guide</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
          BP-SKILL Suite Walkthrough
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-3">
          All 15 skills connect through a single handoff artifact — <code className="font-mono text-xs bg-muted px-1 rounded">PNS.md</code>.
          This page shows the full pipeline in order: what triggers each skill, what it reads,
          what it writes, and which skill picks up next.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-8">
          The diagram below shows the sequential critical path. The walkthrough table below it
          documents the complete dependency graph, including branches and parallel tracks.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/skills" className="forge-btn-primary inline-flex items-center gap-2">
            Browse All Skills <ArrowRight size={14} />
          </Link>
          <a href="#walkthrough-table" className="forge-btn-outline inline-flex items-center gap-2">
            Jump to Walkthrough Table <ArrowDown size={14} />
          </a>
          <Link href="/walkthrough/purchase-approval" className="forge-btn-outline inline-flex items-center gap-2">
            Worked Example (Procurement) <ArrowRight size={14} />
          </Link>
          <Link href="/walkthrough/employee-offboarding" className="forge-btn-outline inline-flex items-center gap-2">
            Worked Example (HR) <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── bpmn-beta Pipeline Diagram ────────────────────────── */}
      <section className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
          <p className="forge-eyebrow mb-3">Pipeline Diagram</p>
          <h2 className="text-xl font-bold text-foreground mb-2">
            15 Skills — Sequential Critical Path
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-relaxed">
            Rendered as a <code className="font-mono text-xs bg-muted px-1 rounded">bpmn-beta</code> diagram.
            Each box is a BP-SKILL skill. The flow follows the primary handoff sequence —
            see the table below for branch paths and optional tracks.
            Click any skill to open its detail page. Scroll right to view the full pipeline.
          </p>

          <div
            className="rounded-xl border border-border bg-card overflow-x-auto"
            style={{ minHeight: 180 }}
          >
            <div style={{ minWidth: 2400, padding: "12px 16px" }}>
              <BpmnRenderer
                source={PIPELINE_BPMN}
                nodeLinks={PIPELINE_NODE_LINKS}
                nodeTooltips={PIPELINE_NODE_TOOLTIPS}
              />
            </div>
          </div>

          <p className="mt-3 text-[10px] font-mono text-muted-foreground/50">
            bpmn-beta · accTitle: BP-SKILL v0.3 — 15-Skill Pipeline
          </p>
        </div>
      </section>

      {/* ── Walkthrough Table ─────────────────────────────────── */}
      <section id="walkthrough-table" className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
          <p className="forge-eyebrow mb-3">Walkthrough Table</p>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Skill-by-Skill Handoff Reference
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl leading-relaxed">
            For each skill: the phrase that triggers it, the artifacts it reads, what it produces,
            and which skills immediately follow. Click a skill name to view its full specification.
          </p>

          {/* PNS lifecycle chain — pills link to matching skill rows */}
          <div className="mb-8 p-4 rounded-xl border border-border bg-card/40">
            <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-3">
              PNS.md lifecycle — click a pill to jump to the skill that sets it
            </p>
            <PnsLifecycleTracker withAnchors activeStatus={activeStatus} />
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide w-8">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide w-44">Skill</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide w-48">Trigger Condition</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide w-48">Inputs Consumed</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide w-48">Artifacts Produced</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide w-36">
                      PNS.md
                      <span className="block text-[8px] font-normal normal-case tracking-normal text-muted-foreground/50 mt-0.5">lifecycle status</span>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Next Downstream Skill(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {SKILLS.map((skill, i) => {
                    const layerColor = LAYER_COLOR[skill.layer] ?? "#888";
                    const downstream = nextSkillsFor(skill.id);
                    return (
                      <tr
                        key={skill.id}
                        id={`row-${skill.id}-lg`}
                        className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/10"}`}
                        style={{ "--layer-color": layerColor } as CSSProperties}
                      >
                        {/* # */}
                        <td className="px-4 py-3 align-top">
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded text-[9px] font-mono font-bold forge-layer-badge"
                          >
                            {String(skill.pipelineOrder).padStart(2, "0")}
                          </span>
                        </td>

                        {/* Skill name + layer badge */}
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col gap-1">
                            <Link
                              href={`/skills/${skill.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline text-xs leading-snug"
                            >
                              {skill.displayName}
                            </Link>
                            <span
                              className="inline-block text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full self-start forge-layer-badge--soft"
                            >
                              {skill.layerLabel}
                              {skill.status === "recommended-extension" && " · ext"}
                            </span>
                          </div>
                        </td>

                        {/* Trigger */}
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {skill.triggerPhrases.slice(0, 2).map((t) => (
                              <li key={t} className="text-muted-foreground leading-relaxed italic">
                                "{t}"
                              </li>
                            ))}
                          </ul>
                        </td>

                        {/* Consumes */}
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {skill.consumes.map((c) => (
                              <li key={c} className="text-foreground/75 leading-relaxed font-mono">
                                {c}
                              </li>
                            ))}
                          </ul>
                        </td>

                        {/* Produces */}
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {skill.produces.map((p) => (
                              <li key={p} className="text-foreground/75 leading-relaxed font-mono">
                                {p}
                              </li>
                            ))}
                          </ul>
                        </td>

                        {/* PNS.md lifecycle status */}
                        <td className="px-4 py-3 align-top">
                          <PnsBadge skillId={skill.id} />
                        </td>

                        {/* Next downstream */}
                        <td className="px-4 py-3 align-top">
                          {downstream.length === 0 ? (
                            <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded-full forge-pipeline-end">
                              Pipeline end
                            </span>
                          ) : (
                            <ul className="space-y-1">
                              {downstream.map((d) => (
                                <li key={d.id}>
                                  <Link
                                    href={`/skills/${d.id}`}
                                    className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-2"
                                  >
                                    <span
                                      className="text-[8px] font-mono forge-layer-text"
                                      style={{ "--layer-color": LAYER_COLOR[d.layer] } as CSSProperties}
                                    >
                                      {String(d.pipelineOrder).padStart(2, "0")}
                                    </span>
                                    {d.displayName}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden flex flex-col gap-4">
            {SKILLS.map((skill) => {
              const layerColor = LAYER_COLOR[skill.layer] ?? "#888";
              const downstream = nextSkillsFor(skill.id);
              return (
                <div
                  key={skill.id}
                  id={`row-${skill.id}-sm`}
                  className="rounded-xl border border-border bg-card overflow-hidden forge-layer-border-left"
                  style={{ "--layer-color": layerColor } as CSSProperties}
                >
                  {/* Card header */}
                  <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded text-[10px] font-mono font-bold shrink-0 forge-layer-badge"
                    >
                      {String(skill.pipelineOrder).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/skills/${skill.id}`}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors block leading-snug"
                      >
                        {skill.displayName}
                      </Link>
                      <span
                        className="text-[8px] font-mono uppercase tracking-wider forge-layer-text"
                      >
                        {skill.layerLabel}{skill.status === "recommended-extension" ? " · extension" : " · core"}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-4 py-3 grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1">
                        Trigger
                      </p>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        "{skill.triggerPhrases[0]}"
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1">
                        Consumes
                      </p>
                      <p className="text-xs font-mono text-foreground/75 leading-relaxed">
                        {skill.consumes.join(" · ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1">
                        Produces
                      </p>
                      <p className="text-xs font-mono text-foreground/75 leading-relaxed">
                        {skill.produces.join(" · ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                        PNS.md Status
                      </p>
                      <PnsBadge skillId={skill.id} />
                    </div>
                    {downstream.length > 0 && (
                      <div>
                        <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1">
                          Next Skill(s)
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {downstream.map((d) => (
                            <Link
                              key={d.id}
                              href={`/skills/${d.id}`}
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline underline-offset-2 font-medium"
                            >
                              <span
                                className="text-[8px] font-mono forge-layer-text"
                                style={{ "--layer-color": LAYER_COLOR[d.layer] } as CSSProperties}
                              >
                                {String(d.pipelineOrder).padStart(2, "0")}
                              </span>
                              {d.displayName}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PNS Lifecycle callout ─────────────────────────────── */}
      <section className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
          <p className="forge-eyebrow mb-3">The Connecting Thread</p>
          <h2 className="text-lg font-bold text-foreground mb-3">
            Every skill reads or advances PNS.md
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-6">
            The Process Narrative Specification (<code className="font-mono text-xs bg-muted px-1 rounded">PNS.md</code>)
            is the single handoff document that makes BP-SKILL a pipeline rather than a pile of
            disconnected prompts. Each skill either reads a PNS lifecycle status or advances it —
            from <code className="font-mono text-xs bg-muted px-1 rounded">draft-intake</code> (set by Skill 01)
            to <code className="font-mono text-xs bg-muted px-1 rounded">published</code> (set by Skill 15).
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/skills" className="forge-btn-primary inline-flex items-center gap-2">
              Explore All Skills <ArrowRight size={14} />
            </Link>
            <Link href="/skills#pns" className="forge-btn-outline inline-flex items-center gap-2">
              PNS Schema Reference
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
