import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import {
  SKILLS, VARIABLE_FILES, PIPELINE_LAYERS,
  PNS_LIFECYCLE, PNS_SECTIONS, PNS_FRONTMATTER_SCHEMA,
  SUITE_DOWNLOAD_FILENAME, CONTEXT_PACK_FILENAME,
} from "@/data/skills-registry";
import { SkillCard } from "@/components/skills/SkillCard";
import { PipelineDiagram } from "@/components/skills/PipelineDiagram";
import { DependencyFlowDiagram } from "@/components/skills/DependencyFlowDiagram";
import { PnsLifecycleTracker } from "@/components/skills/PnsLifecycleTracker";
import { VariableFileCard } from "@/components/skills/VariableFileCard";
import { SkillFrontmatterPreview } from "@/components/skills/SkillFrontmatterPreview";
import { ZipDownloadButton } from "@/components/skills/ZipDownloadButton";
import { DownloadButton } from "@/components/skills/DownloadButton";
import { ExternalLinkAnchor } from "@/components/ExternalLinkAnchor";
import { StartHerePanel } from "@/components/skills/StartHerePanel";
import { trackEvent } from "@/lib/analytics";

// Derived once at module load — update automatically when SKILLS changes.
const CORE_COUNT = SKILLS.filter((s) => s.status === "core").length;
const EXT_COUNT  = SKILLS.filter((s) => s.status === "recommended-extension").length;

const SECTION_TABS = [
  { id: "start-here", label: "Start Here" },
  { id: "standard",  label: "The Standard" },
  { id: "pipeline",  label: "Pipeline" },
  { id: "browser",   label: "Skills" },
  { id: "variables", label: "Variable Layer" },
  { id: "pns",       label: "PNS Schema" },
];

const SUITE_README = `# BP-SKILL v0.3 — Business Process Agent Skill Suite\n\nAn open-standard domain extension to agentskills.io\nBuilt by OverKill Hill P³™ — overkillhill.com\nSource: github.com/OKHP3/mermaid-diagram-bpmn\nLicensed MIT (code) / CC-BY-4.0 (documentation)\n\n## What is BP-SKILL?\n\n15 portable SKILL.md agent skills covering the full business process documentation lifecycle.\nAligned to BABOK v3, BPM CBOK v4.0, APQC PCF v7.4, BPMN 2.0.2, DMN 1.4, and ISO 9001:2015.\n\n## Installation\n\nPlace each SKILL.md file in your agent platform's skills directory.\nSee agentskills.io for platform-specific paths.\n`;

function buildSuiteEntries() {
  const base = import.meta.env.BASE_URL;
  return [
    ...SKILLS.map((s) => ({
      path: `skills/${s.id}/SKILL.md`,
      url: `${base}skills/${s.id}/SKILL.md`,
    })),
    ...VARIABLE_FILES.map((f) => ({
      path: `context/${f.filename}`,
      url: `${base}context/${f.filename}`,
    })),
    { path: "pns-template.yaml", url: `${base}pns-template.yaml` },
  ];
}

function buildContextEntries() {
  const base = import.meta.env.BASE_URL;
  return VARIABLE_FILES.map((f) => ({
    path: f.filename,
    url: `${base}context/${f.filename}`,
  }));
}

export default function AgentSkills() {
  const [activeSection, setActiveSection] = useState("standard");
  const [statusFilter, setStatusFilter] = useState<"all" | "core" | "extension">("all");
  const [layerFilter, setLayerFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [pnsExpanded, setPnsExpanded] = useState(false);
  const [pnsSectionOpen, setPnsSectionOpen] = useState<number | null>(null);
  const [pipelineView, setPipelineView] = useState<"layers" | "deps">("layers");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Agent Skills — BP-SKILL Suite | BPMN for Mermaid";
    const desc = document.querySelector('meta[name="description"]');
    const content = "15 portable SKILL.md agent skills for the full business process lifecycle. Aligned to BABOK v3, BPM CBOK v4.0, APQC PCF v7.4, BPMN 2.0.2, DMN 1.4, and ISO 9001:2015. Works with Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, Cursor, and VS Code.";
    if (desc) desc.setAttribute("content", content);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Agent Skills — BP-SKILL Suite | BPMN for Mermaid");
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", content);
  }, []);

  const filteredSkills = SKILLS.filter((s) => {
    if (statusFilter === "core" && s.status !== "core") return false;
    if (statusFilter === "extension" && s.status !== "recommended-extension") return false;
    if (layerFilter !== null && s.layer !== layerFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.displayName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.triggerPhrases.some((t) => t.toLowerCase().includes(q)) ||
        s.standardsRefs.some((r) => r.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  function scrollTo(id: string) {
    setActiveSection(id);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="flex flex-col">

      {/* Sticky section tabs */}
      <nav
        aria-label="Page sections"
        className="sticky z-40 border-b border-border bg-background/95"
        style={{ top: "3.5rem", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.id)}
                aria-current={activeSection === tab.id ? "true" : undefined}
                className={`px-4 py-3 text-xs font-medium whitespace-nowrap shrink-0 forge-section-tab${activeSection === tab.id ? " forge-section-tab--active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ─── Section 0: Start Here ─────────────────────────── */}
      <section id="start-here" className="border-b border-border">
        <StartHerePanel onBrowseAll={() => scrollTo("browser")} />
      </section>

      {/* ─── Section A: The Standard ──────────────────────────── */}
      <section id="standard" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-16">
        <p className="forge-eyebrow mb-4">BP-SKILL v0.3 · agentskills.io</p>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
          Skills are the AI analogue of SOPs.
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-3">
          BP-SKILL packages the full business process documentation lifecycle as 15 portable agent
          skills, aligned to BABOK v3, BPM CBOK v4.0, APQC PCF v7.4, BPMN 2.0.2, DMN 1.4, and
          ISO 9001:2015.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-8">
          The Agent Skills open standard (<ExternalLinkAnchor href="https://agentskills.io" className="text-primary underline-offset-2 hover:underline">agentskills.io</ExternalLinkAnchor>) defines a SKILL.md file format for packaging
          reusable AI agent capabilities as modular, portable, filesystem-resident instruction sets. As of
          May 2026, the format is adopted by Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, Cursor,
          VS Code, and 30+ other platforms. The business process analysis domain has been absent from that
          ecosystem — until now.
        </p>

        {/* Gap callout */}
        <blockquote className="forge-callout mb-8 max-w-2xl">
          <p className="text-sm font-semibold text-foreground mb-1">
            The public Agent Skills ecosystem contains 89,000+ skills.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Zero implement a BABOK knowledge area. BP-SKILL is the first standards-conformant,
            lifecycle-complete business process agent skill suite.
          </p>
        </blockquote>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
          {[
            { stat: "15", label: "Skills", sub: "Full lifecycle coverage" },
            { stat: "9", label: "Variable Files", sub: "Context configuration" },
            { stat: "6", label: "Standards", sub: "BABOK · CBOK · APQC · BPMN · DMN · ISO 9001" },
          ].map((s) => (
            <div key={s.stat} className="forge-card text-center py-4">
              <p className="text-3xl font-bold text-primary">{s.stat}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{s.label}</p>
              <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Platform badges */}
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-3">
            Works on all Agent Skills-compatible platforms
          </p>
          <div className="flex flex-wrap gap-2">
            {["Claude Code", "OpenAI Codex", "GitHub Copilot", "Gemini CLI", "Cursor", "VS Code"].map((p) => (
              <span
                key={p}
                className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => scrollTo("browser")}
            className="forge-btn-primary"
          >
            Browse the 15 Skills ↓
          </button>
          <ZipDownloadButton
            entries={buildSuiteEntries()}
            filename={SUITE_DOWNLOAD_FILENAME}
            label="Download the Suite"
            variant="outline"
            readme={SUITE_README}
          onDownloaded={() => trackEvent('suite-download')}
          />
          <a
            href="https://agentskills.io"
            target="_blank"
            rel="noopener noreferrer"
            className="forge-btn-outline inline-flex items-center gap-2"
          >
            View on agentskills.io <ExternalLink size={13} />
          </a>
        </div>
      </section>

      {/* ─── Section B: Pipeline ─────────────────────────────── */}
      <section id="pipeline" className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
          <p className="forge-eyebrow mb-3">The Pipeline</p>
          <h2 className="text-xl font-bold text-foreground mb-2">
            A coherent methodology, not a collection of prompts.
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-relaxed">
            All 15 skills connect through a single handoff artifact — PNS.md. Each skill either
            reads or advances its lifecycle status, from <code className="font-mono text-xs bg-muted px-1 rounded">draft-intake</code> to <code className="font-mono text-xs bg-muted px-1 rounded">published</code>.
            Click any skill to view its full specification.
          </p>

          <div className="forge-tabs mb-6" role="group" aria-label="Pipeline view">
            <button
              onClick={() => setPipelineView("layers")}
              aria-pressed={pipelineView === "layers"}
              className={pipelineView === "layers" ? "forge-tab-active" : "forge-tab"}
            >
              Layer View
            </button>
            <button
              onClick={() => setPipelineView("deps")}
              aria-pressed={pipelineView === "deps"}
              className={pipelineView === "deps" ? "forge-tab-active" : "forge-tab"}
            >
              Dependency Flow
            </button>
          </div>

          {pipelineView === "layers" ? (
            <PipelineDiagram />
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4 max-w-2xl leading-relaxed">
                Arrows show which skills must run before each downstream skill. Derived from the{" "}
                <code className="font-mono text-[10px] bg-muted px-1 rounded">depends_on</code>{" "}
                field in each SKILL.md. Click any node to open its specification.
              </p>
              <DependencyFlowDiagram />
            </>
          )}
        </div>
      </section>

      {/* ─── Section C: Skill Browser ────────────────────────── */}
      <section id="browser" className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
          <p className="forge-eyebrow mb-3">Skill Browser</p>
          <h2 className="text-xl font-bold text-foreground mb-6">All 15 Skills</h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Status filter */}
            <div className="forge-tabs shrink-0" role="group" aria-label="Filter by type">
              {(["all", "core", "extension"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  aria-pressed={statusFilter === f}
                  className={statusFilter === f ? "forge-tab-active" : "forge-tab"}
                >
                  {f === "all"
                    ? `All Skills (${SKILLS.length})`
                    : f === "core"
                    ? `Core (${CORE_COUNT})`
                    : `Extensions (${EXT_COUNT})`}
                </button>
              ))}
            </div>

            {/* Layer filter */}
            <div className="forge-tabs" role="group" aria-label="Filter by layer">
              <button
                onClick={() => setLayerFilter(null)}
                aria-pressed={layerFilter === null}
                className={layerFilter === null ? "forge-tab-active" : "forge-tab"}
              >
                All Layers
              </button>
              {PIPELINE_LAYERS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayerFilter(layerFilter === l.id ? null : l.id)}
                  aria-pressed={layerFilter === l.id}
                  className={layerFilter === l.id ? "forge-layer-tab-active" : "forge-tab"}
                  style={{ "--layer-color": l.color } as CSSProperties}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={13} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search skills…"
                aria-label="Search skills"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-full border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={11} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          {(statusFilter !== "all" || layerFilter !== null || search) && (
            <p className="text-xs text-muted-foreground mb-4">
              Showing {filteredSkills.length} of {SKILLS.length} skills
            </p>
          )}

          {/* Grid */}
          {filteredSkills.length === 0 ? (
            <div className="forge-card text-center py-12">
              <p className="text-sm text-muted-foreground">No skills match your filters.</p>
              <button
                className="mt-3 text-xs text-primary hover:underline"
                onClick={() => { setStatusFilter("all"); setLayerFilter(null); setSearch(""); }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Section D: Variable Layer ───────────────────────── */}
      <section id="variables" className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
          <p className="forge-eyebrow mb-3">Variable Layer</p>
          <h2 className="text-xl font-bold text-foreground mb-3">
            9 Configuration Files That Tailor the Suite
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-8">
            The 15 skills operate on shared process knowledge, but every organisation has different
            terminology, roles, systems, regulations, and taxonomies. The Variable Layer is a set of 9
            context files that live alongside the skills and tell them how to interpret your world. They
            are not SKILL.md files — they are structured Markdown documents with YAML frontmatter that
            skills read to adapt their behaviour.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {VARIABLE_FILES.map((f) => (
              <VariableFileCard key={f.id} file={f} />
            ))}
          </div>

          {/* Context pack download */}
          <div className="forge-card max-w-2xl">
            <p className="text-sm font-semibold text-foreground mb-1.5">
              Don't want to configure from scratch?
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Download the full <code className="font-mono text-xs bg-muted px-1 rounded">context/</code> template
              pack with minimal viable defaults pre-populated.
            </p>
            <ZipDownloadButton
              entries={buildContextEntries()}
              filename={CONTEXT_PACK_FILENAME}
              label="Download context/ Template Pack"
              variant="outline"
              onDownloaded={() => trackEvent('starter-pack-download')}
              readme={`# BP-SKILL v0.3 — Context / Variable Layer Templates\n\nBuilt by OverKill Hill P³™ — overkillhill.com\nSource: github.com/OKHP3/mermaid-diagram-bpmn\nLicensed MIT (code) / CC-BY-4.0 (documentation)\n`}
            />
          </div>
        </div>
      </section>

      {/* ─── Section E: PNS Schema Viewer ────────────────────── */}
      <section id="pns" className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">

          {/* Collapsible header */}
          <button
            className="w-full flex items-start justify-between gap-4 text-left group"
            onClick={() => setPnsExpanded((e) => !e)}
          >
            <div>
              <p className="forge-eyebrow mb-2">PNS Schema</p>
              <h2 className="text-xl font-bold text-foreground">
                The Process Narrative Specification — The Handoff Artifact
              </h2>
            </div>
            <div className="shrink-0 mt-1 text-muted-foreground group-hover:text-foreground transition-colors">
              {pnsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {pnsExpanded && (
            <div className="mt-8">
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-8">
                Every skill in BP-SKILL either reads or writes a single central document: PNS.md. It
                is not a template — it is a schema-enforced structured document aligned to ISO 9001
                §4.4.1, BABOK Core Concept Model, and IEEE/ISO/IEC 29148. It is what makes BP-SKILL
                a pipeline rather than a pile of disconnected prompts.
              </p>

              {/* Lifecycle tracker */}
              <div className="mb-10">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  PNS.md Lifecycle — {PNS_LIFECYCLE.length} States
                </h3>
                <div className="forge-card overflow-x-auto">
                  <PnsLifecycleTracker />
                </div>
              </div>

              {/* 13 sections accordion */}
              <div className="mb-10">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  13 Required Sections
                </h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  {PNS_SECTIONS.map((sec, i) => (
                    <div
                      key={sec.number}
                      className={i > 0 ? "border-t border-border" : ""}
                    >
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                        onClick={() => setPnsSectionOpen(pnsSectionOpen === sec.number ? null : sec.number)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground/50 w-4 shrink-0">
                            {String(sec.number).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-medium text-foreground">{sec.title}</span>
                        </div>
                        {pnsSectionOpen === sec.number ? (
                          <ChevronUp size={14} className="text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                        )}
                      </button>

                      {pnsSectionOpen === sec.number && (
                        <div className="px-4 pb-4 bg-muted/10">
                          <div className="grid sm:grid-cols-3 gap-3 text-xs ml-7">
                            <div>
                              <p className="font-mono text-muted-foreground/60 text-[9px] uppercase tracking-wider mb-1">Documents</p>
                              <p className="text-foreground/80 leading-relaxed">{sec.documents}</p>
                            </div>
                            <div>
                              <p className="font-mono text-muted-foreground/60 text-[9px] uppercase tracking-wider mb-1">Standard</p>
                              <p className="text-foreground/80 leading-relaxed">{sec.standard}</p>
                            </div>
                            <div>
                              <p className="font-mono text-muted-foreground/60 text-[9px] uppercase tracking-wider mb-1">Not Applicable?</p>
                              <p className="text-foreground/80 leading-relaxed">
                                {sec.naCondition ?? "Cannot be marked N/A — always required."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Frontmatter schema */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  PNS.md YAML Frontmatter Schema
                </h3>
                <SkillFrontmatterPreview content={PNS_FRONTMATTER_SCHEMA} collapsedLines={30} />
              </div>

              {/* Download PNS template */}
              <DownloadButton
                url={`${import.meta.env.BASE_URL}pns-template.yaml`}
                filename="pns-template.yaml"
                label="Download PNS.md Template"
                variant="primary"
              />
            </div>
          )}

          {!pnsExpanded && (
            <button
              className="mt-4 text-xs text-primary hover:underline underline-offset-2"
              onClick={() => setPnsExpanded(true)}
            >
              Expand PNS schema viewer ↓
            </button>
          )}
        </div>
      </section>

    </div>
  );
}
