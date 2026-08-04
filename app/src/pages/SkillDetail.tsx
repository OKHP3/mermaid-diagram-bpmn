import { useEffect } from "react";
import type { CSSProperties } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  SKILLS, PIPELINE_LAYERS, VARIABLE_FILES,
} from "@/data/skills-registry";
import { PnsBadge } from "@/components/skills/PnsBadge";
import { PnsLifecycleTracker } from "@/components/skills/PnsLifecycleTracker";
import { PNS_TRANSITIONS } from "@/data/pns-transitions";
import { SkillMiniCard } from "@/components/skills/SkillMiniCard";
import { SkillFrontmatterPreview } from "@/components/skills/SkillFrontmatterPreview";
import { InstallTabs } from "@/components/skills/InstallTabs";
import { DownloadButton } from "@/components/skills/DownloadButton";
import { WORKED_EXAMPLES } from "@/data/worked-examples";

export default function SkillDetail() {
  const params = useParams<{ skillId: string }>();
  const skillId = params?.skillId ?? "";
  const skill = SKILLS.find((s) => s.id === skillId);

  useEffect(() => {
    if (skill) {
      document.title = `${skill.displayName} — Agent Skill | BPMN for Mermaid`;
      const desc = document.querySelector('meta[name="description"]');
      const content = skill.description.slice(0, 160);
      if (desc) desc.setAttribute("content", content);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", `${skill.displayName} — Agent Skill | BPMN for Mermaid`);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", content);
    }
  }, [skill]);

  if (!skill) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="forge-eyebrow mb-4 text-destructive">404 — Skill not found</p>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          No skill with ID <code className="font-mono text-primary">"{skillId}"</code>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          That skill ID does not match any skill in the BP-SKILL registry.
        </p>
        <Link href="/skills" className="forge-btn-primary">
          <ArrowLeft size={14} /> Back to All Skills
        </Link>
      </div>
    );
  }

  const layer = PIPELINE_LAYERS.find((l) => l.id === skill.layer)!;
  const layerColor = layer.color;
  const isCore = skill.status === "core";

  const prevSkill = SKILLS.find((s) => s.pipelineOrder === skill.pipelineOrder - 1);
  const nextSkill = SKILLS.find((s) => s.pipelineOrder === skill.pipelineOrder + 1);

  const upstreamSkills = skill.dependsOn
    .map((id) => SKILLS.find((s) => s.id === id))
    .filter((s): s is typeof SKILLS[0] => !!s);

  const downstreamSkills = SKILLS.filter((s) =>
    s.dependsOn.includes(skill.id)
  );

  const usedContextFiles = VARIABLE_FILES.filter((f) =>
    f.usedBy.includes(skill.id)
  );

  const workedExamplesForSkill = WORKED_EXAMPLES.filter((ex) =>
    ex.stepSkillIds.includes(skill.id)
  );

  // Outgoing PNS status this skill produces (null when skill doesn't advance the chain)
  const pnsTransition = PNS_TRANSITIONS[skill.id];
  const pnsActiveStatus = pnsTransition?.after ?? undefined;

  return (
    <div className="flex flex-col" style={{ "--layer-color": layerColor } as CSSProperties}>

      {/* ─── Header ──────────────────────────────────────────── */}
      <div
        className="border-b border-border forge-layer-border-top"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Breadcrumb */}
          <Link
            href="/skills"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={12} /> Agent Skills
          </Link>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full forge-layer-badge"
            >
              Skill {String(skill.pipelineOrder).padStart(2, "0")} of 15
            </span>
            <span
              className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full forge-layer-badge"
            >
              {layer.label}
            </span>
            {isCore ? (
              <span
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full forge-layer-badge--filled"
              >
                CORE
              </span>
            ) : (
              <span
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full forge-layer-badge--outlined"
              >
                EXTENSION
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {skill.displayName}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-8">
            {skill.description}
          </p>

          {/* PNS lifecycle chain — compact read-only tracker with this skill's outgoing status highlighted */}
          <div>
            <p className="forge-eyebrow mb-3">PNS Lifecycle Position</p>
            <PnsLifecycleTracker
              withAnchors={false}
              activeStatus={pnsActiveStatus}
              compact
            />
          </div>
        </div>
      </div>

      {/* ─── Overview grid ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-8">

          {/* Left: Purpose + Triggers + Platforms */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="forge-eyebrow mb-2">Purpose</p>
              <p className="text-sm text-foreground leading-relaxed">{skill.purpose}</p>
            </div>

            <div>
              <p className="forge-eyebrow mb-3">Trigger Phrases</p>
              <div className="flex flex-col gap-1.5">
                {skill.triggerPhrases.map((phrase) => (
                  <div
                    key={phrase}
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm italic text-muted-foreground"
                  >
                    "{phrase}"
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="forge-eyebrow mb-3">Compatible With</p>
              <div className="flex flex-wrap gap-2">
                {skill.compatibleWith.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-full border border-border bg-card text-xs font-medium text-foreground"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Pipeline position + Consumes/Produces */}
          <div className="flex flex-col gap-6">

            {/* Mini pipeline position */}
            <div>
              <p className="forge-eyebrow mb-3">Pipeline Position</p>
              <div className="forge-card p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {prevSkill && (
                    <>
                      <Link
                        href={`/skills/${prevSkill.id}`}
                        className="text-[10px] font-mono px-2 py-1 rounded border border-border bg-muted text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                      >
                        {prevSkill.pipelineOrder}. {prevSkill.displayName}
                      </Link>
                      <span className="text-muted-foreground/40 text-xs">→</span>
                    </>
                  )}
                  <span
                    className="text-[11px] font-mono font-bold px-2.5 py-1.5 rounded forge-layer-badge--filled"
                  >
                    {skill.pipelineOrder}. {skill.displayName}
                  </span>
                  {nextSkill && (
                    <>
                      <span className="text-muted-foreground/40 text-xs">→</span>
                      <Link
                        href={`/skills/${nextSkill.id}`}
                        className="text-[10px] font-mono px-2 py-1 rounded border border-border bg-muted text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                      >
                        {nextSkill.pipelineOrder}. {nextSkill.displayName}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Consumes */}
            <div>
              <p className="forge-eyebrow mb-2">Consumes</p>
              <ul className="flex flex-col gap-1">
                {skill.consumes.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-foreground/80">
                    <span className="text-muted-foreground/40 mt-px shrink-0">→</span>
                    <code className="font-mono">{c}</code>
                  </li>
                ))}
              </ul>
            </div>

            {/* Produces */}
            <div>
              <p className="forge-eyebrow mb-2">Produces</p>
              <ul className="flex flex-col gap-1">
                {skill.produces.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-foreground/80">
                    <span className="mt-px shrink-0 font-bold forge-layer-text">←</span>
                    <code className="font-mono">{p}</code>
                  </li>
                ))}
              </ul>
            </div>

            {/* PNS.md lifecycle status */}
            {!!PNS_TRANSITIONS[skill.id] && (
              <div>
                <p className="forge-eyebrow mb-2">PNS.md Status</p>
                <div className="forge-card p-3">
                  <PnsBadge skillId={skill.id} verbose />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Standards References ─────────────────────────────── */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
          <h2 className="text-lg font-bold text-foreground mb-4">Standards References</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Standard</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {skill.standardsRefs.map((ref, i) => {
                    const parts = ref.split(" §");
                    const std = parts[0];
                    const section = parts.length > 1 ? "§" + parts.slice(1).join(" §") : "";
                    return (
                      <tr
                        key={ref}
                        className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/10"}`}
                      >
                        <td className="px-4 py-2.5 font-mono text-foreground font-medium">{std}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{section || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SKILL.md Preview + Download ─────────────────────── */}
      <div className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">SKILL.md Preview</h2>
            <DownloadButton
              url={`${import.meta.env.BASE_URL}skills/${skill.id}/SKILL.md`}
              filename="SKILL.md"
              label="Download SKILL.md"
              variant="primary"
            />
          </div>
          <SkillFrontmatterPreview content={skill.skillMdPreview} collapsedLines={20} />
        </div>
      </div>

      {/* ─── Installation Instructions ────────────────────────── */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
          <h2 className="text-lg font-bold text-foreground mb-4">Installation</h2>
          <InstallTabs skillId={skill.id} />
        </div>
      </div>

      {/* ─── Related Skills ───────────────────────────────────── */}
      {(upstreamSkills.length > 0 || downstreamSkills.length > 0) && (
        <div className="border-t border-border bg-card/40">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Related Skills</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {upstreamSkills.map((s) => (
                <SkillMiniCard key={s.id} skill={s} relation="upstream" />
              ))}
              {downstreamSkills.slice(0, 4).map((s) => (
                <SkillMiniCard key={s.id} skill={s} relation="downstream" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Variable Files Used ─────────────────────────────── */}
      {usedContextFiles.length > 0 && (
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Variable Files Used</h2>
            <p className="text-xs text-muted-foreground mb-4">
              This skill reads the following context files from your{" "}
              <code className="font-mono bg-muted px-1 rounded">context/</code> directory.
            </p>
            <div className="flex flex-col gap-2">
              {usedContextFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card"
                >
                  <div>
                    <code className="text-xs font-mono font-semibold text-foreground">{f.filename}</code>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.displayName}</p>
                  </div>
                  <Link
                    href="/skills#variables"
                    className="text-[10px] text-primary hover:underline underline-offset-2"
                  >
                    Variable Layer ↗
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── See it in action ────────────────────────────────── */}
      {workedExamplesForSkill.length > 0 && (
        <div className="border-t border-border bg-card/40">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
            <h2 className="text-lg font-bold text-foreground mb-1">See it in Action</h2>
            <p className="text-xs text-muted-foreground mb-5">
              These worked examples trace every BP-SKILL step end-to-end. Each link jumps
              directly to the step for this skill.
            </p>
            <div className="flex flex-col gap-3">
              {workedExamplesForSkill.map((ex) => (
                <Link
                  key={ex.slug}
                  href={`${ex.path}#step-${skill.id}`}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {ex.title}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      Worked example · {ex.stepSkillIds.length} skills traced end-to-end
                    </p>
                  </div>
                  <span className="text-xs text-primary font-semibold shrink-0 ml-4">
                    Jump to step →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Back nav ─────────────────────────────────────────── */}
      <div className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/skills" className="forge-btn-outline text-sm">
            <ArrowLeft size={13} /> All Skills
          </Link>
          <a
            href={`https://github.com/OKHP3/mermaid-diagram-bpmn/tree/main/skills/${skill.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View on GitHub <ExternalLink size={11} />
          </a>
        </div>
      </div>

    </div>
  );
}
