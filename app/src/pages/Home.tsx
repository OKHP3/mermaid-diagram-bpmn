import { Link } from "wouter";
import type { CSSProperties } from "react";
import { ArrowRight, GitBranch, FileCode2, Layers, CheckCircle2, ExternalLink, CheckCheck, FlaskConical, Clock, XCircle, Users, Building2, Bot, BookOpen, GitPullRequest } from "lucide-react";
import { StatusRibbon } from "@/components/StatusRibbon";
import {
  BPMN_MERMAID_VERIFIED,
  BPMN_PLAYGROUND_ONLY,
  BPMN_EXPERIMENTAL,
  BPMN_DEFERRED,
  BPMN_OUT_OF_SCOPE,
} from "@/data/capability-registry";

// ── Path cards (above-the-fold chooser) ─────────────────────────────────────

const PATH_CARDS = [
  {
    id: "create",
    layerColor: "#c46a2c", // forge rust — primary action
    icon: FileCode2,
    iconClass: "text-primary",
    audience: "Developers · Analysts · Technical writers",
    heading: "Write BPMN as text",
    body: "Author process diagrams in a readable DSL. Commit them to Git, diff them in pull requests, render them in browser — no XML, no heavy modeler.",
    cta: { label: "Open Playground", href: "/playground", testId: "button-open-playground" },
    limitation: "Prototype parser — not production-grade.",
    testId: "path-card-create",
  },
  {
    id: "plugin",
    layerColor: "#1c3a34", // forge teal — structural
    icon: Layers,
    iconClass: "text-emerald-700 dark:text-emerald-400",
    audience: "Teams already using Mermaid",
    heading: "Add BPMN to your Mermaid setup",
    body: "Register bpmn-beta as an external plugin. BPMN shapes, gateways, and pools render alongside your existing flowcharts and sequence diagrams.",
    cta: { label: "See the Plugin Demo", href: "/mermaid-host-demo", testId: "button-plugin-demo" },
    limitation: "External plugin — not core Mermaid yet. Manual registration required.",
    testId: "path-card-plugin",
  },
  {
    id: "skills",
    layerColor: "#e6a03c", // forge amber — accent
    icon: GitBranch,
    iconClass: "text-amber-600 dark:text-amber-400",
    audience: "Process analysts · AI toolers",
    heading: "15 agent skills for the full lifecycle",
    body: "BP-SKILL brings BABOK v3, BPMN 2.0.2, and BPM CBOK into portable SKILL.md files. Take a process from intake to publication with your AI agent.",
    cta: { label: "Browse the 15 Skills", href: "/skills", testId: "button-browse-skills" },
    limitation: "Agent skill files — not a standalone app. Requires a SKILL.md-compatible agent.",
    testId: "path-card-skills",
  },
] as const;

// ── Other page data ──────────────────────────────────────────────────────────

const MARKET_WEDGE = [
  { icon: Building2, segment: "Enterprise architects", pain: "Need process diagrams beside architecture docs", fit: "Git-native text diagrams fit architecture repositories" },
  { icon: Users, segment: "Process analysts", pain: "Need BPMN semantics without heavy tooling", fit: "Readable DSL reduces tool friction" },
  { icon: FileCode2, segment: "Developers", pain: "Need process context in READMEs and ADRs", fit: "Markdown-compatible syntax fits dev workflows" },
  { icon: Bot, segment: "AI tool builders", pain: "Need reliable structured output", fit: "DSL is short, regular, and LLM-friendly" },
  { icon: BookOpen, segment: "Documentation teams", pain: "Need diagrams that can be reviewed and updated", fit: "Text diffs and pull requests replace screenshots" },
  { icon: GitPullRequest, segment: "Open-source maintainers", pain: "Need lightweight examples and docs", fit: "No proprietary BPMN tooling required" },
];

const DISTINCTIONS = [
  {
    versus: "Mermaid flowchart",
    difference: "Flowchart is generic shape syntax. bpmn-beta is domain-specific process notation — it encodes BPMN concepts (events, activities, gateways, sequence flows, message flows, pools, lanes) directly into the syntax and data model.",
  },
  {
    versus: "BPMN XML tools",
    difference: "BPMN XML tools optimize for standard interchange and execution tooling. bpmn-beta optimizes for readable authoring, version control, documentation, and AI generation. XML import/export is explicitly out of v1 scope.",
  },
  {
    versus: "bpmn-js",
    difference: "bpmn-js is a comprehensive BPMN modeler/renderer ecosystem with different design goals. bpmn-beta is a lightweight Mermaid-native path that keeps bundle size manageable and avoids coupling to a heavier runtime.",
  },
  {
    versus: "PlantUML",
    difference: "PlantUML has broad text-diagram support but is not Mermaid-native. bpmn-beta is aimed specifically at filling Mermaid's own native BPMN gap — where Markdown-first adoption already exists.",
  },
];

const PRINCIPLES = [
  { icon: FileCode2, title: "Text-First", body: "Write BPMN as code. Version-control it, diff it, review it in pull requests. No proprietary file formats." },
  { icon: GitBranch, title: "Mermaid-Native", body: "Follows Mermaid DSL conventions. Designed to render wherever Mermaid renders once registered as an external diagram plugin." },
  { icon: Layers, title: "Scoped Subset", body: "A documented BPMN 2.0 descriptive subset — not a full implementation. Clarity and usability over exhaustive compliance." },
  { icon: CheckCircle2, title: "Plugin-First Path", body: "Starts as an external plugin for fast iteration. Community discussion and upstream proposal come after validation." },
];

const RELATED_ISSUES = [
  { id: "#7699", title: "Native BPMN 2.0 support proposal", url: "https://github.com/mermaid-js/mermaid/issues/7699" },
  { id: "#2623", title: "BPMN support discussion", url: "https://github.com/mermaid-js/mermaid/issues/2623" },
  { id: "#660", title: "Older BPMN 2.0 diagram request", url: "https://github.com/mermaid-js/mermaid/issues/660" },
];

// Support matrix is derived from the canonical capability registry.
// Edit app/src/data/capability-registry.ts to change claims — do not hardcode here.
const SUPPORT_MATRIX = {
  // All source-verified + packaged items (verified against real mermaid.render())
  implemented: [
    ...BPMN_MERMAID_VERIFIED.map(c => c.label),
    // playground-only items follow (tested in BpmnRenderer, not in Mermaid integration test)
    ...BPMN_PLAYGROUND_ONLY.map(c => c.label),
  ],
  experimental: BPMN_EXPERIMENTAL.map(c => c.label),
  deferred: BPMN_DEFERRED.map(c => c.label),
  outOfScope: BPMN_OUT_OF_SCOPE.map(c => c.label),
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface PathCardProps {
  card: typeof PATH_CARDS[number];
}

function PathCard({ card }: PathCardProps) {
  return (
    <div
      className="forge-card forge-layer-border-top flex flex-col"
      style={{ "--layer-color": card.layerColor } as CSSProperties}
      data-testid={card.testId}
    >
      {/* Header row: icon + audience */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <card.icon size={20} className={card.iconClass} />
        <span className="forge-eyebrow text-[10px] text-right leading-snug">{card.audience}</span>
      </div>

      {/* Heading — h2 so the document outline goes h1 → h2, not h1 → h3 (WCAG heading-order) */}
      <h2 className="forge-card-title text-sm mb-2 leading-snug">{card.heading}</h2>

      {/* Body */}
      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-5">{card.body}</p>

      {/* CTA */}
      <Link
        href={card.cta.href}
        className="forge-btn-primary inline-flex items-center gap-2 self-start mb-4 text-xs"
        data-testid={card.cta.testId}
      >
        {card.cta.label}
        <ArrowRight size={13} />
      </Link>

      {/* Limitation */}
      <p className="text-[11px] text-muted-foreground/60 flex items-start gap-1.5">
        <XCircle size={11} className="shrink-0 mt-0.5" />
        {card.limitation}
      </p>
    </div>
  );
}

interface MatrixColProps {
  icon: React.ElementType;
  label: string;
  items: string[];
  iconClass: string;
  headerClass: string;
}

function MatrixCol({ icon: Icon, label, items, iconClass, headerClass }: MatrixColProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className={`px-3 py-2.5 border-b border-border flex items-center gap-2 ${headerClass}`}>
        <Icon size={13} className={iconClass} />
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{items.length}</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map(item => (
          <li key={item} className="px-3 py-1.5 text-xs text-foreground bg-card flex items-start gap-2">
            <Icon size={10} className={`${iconClass} mt-0.5 shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* Status ribbon */}
      <StatusRibbon />

      {/* ── Above-the-fold chooser ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-10 pb-8 md:pt-14 md:pb-10">

        {/* Compact brand heading */}
        <div className="mb-7">
          <p className="forge-eyebrow mb-4" data-testid="badge-status">
            The Forge — Contributor Prototype
          </p>
          <div className="flex items-center gap-4 mb-3">
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="BPMN for Mermaid"
              className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md"
              data-testid="img-hero-icon"
            />
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight"
              data-testid="heading-hero"
            >
              BPMN for Mermaid
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Two tools, one workbench — a Mermaid diagram plugin and a suite of agent skills for
            business process modeling. Pick the path that matches what you're trying to do.
          </p>
        </div>

        {/* Three intent-led path cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          data-testid="path-chooser"
        >
          {PATH_CARDS.map(card => (
            <PathCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* ── Project context (below the chooser) ─────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
          <div className="max-w-3xl">

            <p
              className="font-mono font-medium text-lg text-primary mb-1"
              data-testid="text-dsl-keyword"
            >
              bpmn-beta
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
              Standards-aware · Text-first · Git-native
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
              A Mermaid-native diagram type for business process modeling. Text-first, version-controllable,
              Markdown-compatible. Write BPMN the way you write flowcharts — then commit it.
              The process-structure and notation layer of the{" "}
              <a href="/about" className="text-primary underline underline-offset-2 hover:text-primary/80">
                OKHP³ Visual Language Stack
              </a>.
            </p>

            {/* Project thesis card */}
            <div className="forge-card mb-6">
              <p className="forge-eyebrow mb-2 text-primary/70">Project thesis</p>
              <p className="text-sm text-foreground leading-relaxed">
                Mermaid has a material diagram-type gap: BPMN 2.0 is not represented as a native syntax.
                The credible path is not to force BPMN through{" "}
                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">flowchart</code>,
                but to create a dedicated{" "}
                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">bpmn-beta</code> plugin
                implementing a documented descriptive subset — and later propose upstream inclusion once the syntax stabilizes.
              </p>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/dsl" className="forge-btn-outline" data-testid="button-dsl-reference">
                DSL Reference
              </Link>
              <Link href="/comparison" className="forge-btn-outline">
                Syntax Comparison
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-xl font-bold text-foreground mb-3">The problem</h2>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed mb-6">
            Business process diagrams occupy an awkward tooling space. At one end are heavyweight BPMN platforms —
            Visio, Signavio, Camunda Modeler, Bizagi, bpmn.io — visually powerful but hostile to Markdown-first
            documentation workflows, pull requests, and AI-generated artifacts. At the other end are Mermaid flowcharts,
            which are excellent for general-purpose boxes-and-arrows but semantically weak for BPMN.
            Flowcharts do not enforce distinctions between events, activities, gateways, sequence flows,
            message flows, pools, lanes, and process boundaries.
          </p>
          <blockquote className="forge-callout text-sm text-foreground leading-relaxed max-w-3xl">
            Business users, architects, analysts, developers, and AI systems need a way to express BPMN-like
            process diagrams as clean text that can live in documentation repositories, render in browsers,
            and remain readable without exposing users to BPMN XML.
          </blockquote>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="border-y border-border bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="forge-eyebrow mb-4">Positioning statement</p>
          <blockquote className="forge-callout text-sm text-foreground leading-relaxed max-w-3xl">
            This is not an attempt to implement the entire BPMN 2.0 execution model inside Mermaid.
            It is a Mermaid-native{" "}
            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">bpmn-beta</code> diagram type
            implementing a documented BPMN 2.0 descriptive subset for readable, version-controllable process diagrams.
          </blockquote>
        </div>
      </section>

      {/* Current support matrix */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground" data-testid="heading-support-matrix">
            Current support
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
            What renders today (Mermaid-verified or React playground), what is experimental, what is deferred, and what is explicitly out of scope.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MatrixCol
            icon={CheckCheck}
            label="Implemented"
            items={SUPPORT_MATRIX.implemented}
            iconClass="text-emerald-600 dark:text-emerald-400"
            headerClass="bg-emerald-50/60 dark:bg-emerald-900/20"
          />
          <MatrixCol
            icon={FlaskConical}
            label="Experimental"
            items={SUPPORT_MATRIX.experimental}
            iconClass="text-amber-600 dark:text-amber-400"
            headerClass="bg-amber-50/60 dark:bg-amber-900/20"
          />
          <MatrixCol
            icon={Clock}
            label="Deferred"
            items={SUPPORT_MATRIX.deferred}
            iconClass="text-primary/70"
            headerClass="bg-primary/5"
          />
          <MatrixCol
            icon={XCircle}
            label="Out of scope (v1)"
            items={SUPPORT_MATRIX.outOfScope}
            iconClass="text-muted-foreground/60"
            headerClass="bg-muted/50"
          />
        </div>
      </section>

      {/* Agent Skills tease */}
      <section className="border-t border-border bg-gradient-to-br from-card/60 to-primary/4">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: copy */}
            <div className="flex-1 max-w-2xl">
              <p className="forge-eyebrow mb-3">BP-SKILL v0.3 · Agent Skills</p>
              <h2 className="text-xl font-bold text-foreground mb-3 leading-snug">
                15 portable agent skills for the full process lifecycle.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The Agent Skills open standard defines SKILL.md files as portable, filesystem-resident
                instruction sets for AI agents. BP-SKILL brings standards-conformant business process
                methodology — BABOK v3, BPM CBOK v4.0, APQC PCF v7.4, BPMN 2.0.2, DMN 1.4, ISO 9001 — into
                that ecosystem for the first time.
              </p>
              <blockquote className="forge-callout mb-5">
                <p className="text-xs font-semibold text-foreground mb-0.5">89,000+ skills in the public ecosystem.</p>
                <p className="text-xs text-muted-foreground">Zero implement a BABOK knowledge area. BP-SKILL is first.</p>
              </blockquote>
              <div className="flex flex-wrap gap-3">
                <Link href="/skills" className="forge-btn-primary inline-flex items-center gap-2">
                  Browse the 15 Skills <ArrowRight size={14} />
                </Link>
                <Link href="/walkthrough" className="forge-btn-outline inline-flex items-center gap-2">
                  End-to-End Walkthrough <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right: pipeline snippet */}
            <div className="shrink-0 w-full lg:w-72">
              <div className="forge-card p-3 space-y-1.5">
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Pipeline overview
                </p>
                {[
                  { n: "01", name: "Process Intake & Scope",           layer: "#4A9EBF" },
                  { n: "05", name: "Process Narrative Authoring",       layer: "#7B68EE" },
                  { n: "06", name: "Visual Process Modeling",           layer: "#5BA08A" },
                  { n: "12", name: "SOP & Work Instruction Generation", layer: "#CC8B30" },
                  { n: "13", name: "RACI & Governance Matrix",          layer: "#C0645A" },
                  { n: "15", name: "Publication & Handoff Packaging",   layer: "#777777" },
                ].map((row) => (
                  <div key={row.n} className="flex items-center gap-2.5">
                    <div className="w-1 h-5 rounded-full shrink-0 forge-layer-dot" style={{ "--layer-color": row.layer } as CSSProperties} />
                    <span className="text-[9px] font-mono text-muted-foreground/50 shrink-0 w-4">{row.n}</span>
                    <span className="text-[10px] text-foreground font-medium leading-tight">{row.name}</span>
                  </div>
                ))}
                <p className="text-[9px] text-muted-foreground/40 pt-1 font-mono">+9 more skills …</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design principles */}
      <section className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
          <h2
            className="text-xl font-bold text-foreground mb-7"
            data-testid="heading-principles"
          >
            Design principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRINCIPLES.map(p => (
              <div
                key={p.title}
                className="forge-card hover:shadow-md transition-shadow"
                data-testid={`card-principle-${p.title.toLowerCase()}`}
              >
                <p.icon size={17} className="text-primary mb-3" />
                <p className="forge-card-title mb-1.5">{p.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market wedge */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-xl font-bold text-foreground mb-2">Who it's for</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-relaxed">
            The target is not "people who want another BPMN modeler." The precise market is process diagrams
            that belong in Markdown, Git, documentation portals, architecture repositories, and AI workbenches.
          </p>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Segment</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Pain</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Why bpmn-beta fits</th>
                  </tr>
                </thead>
                <tbody>
                  {MARKET_WEDGE.map((row, i) => (
                    <tr key={row.segment} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/10"}`}>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <row.icon size={12} className="text-primary shrink-0" />
                          <span className="font-semibold text-foreground">{row.segment}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground align-top leading-relaxed">{row.pain}</td>
                      <td className="px-4 py-3 text-foreground align-top leading-relaxed">{row.fit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* DSL preview */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-14">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">What bpmn-beta looks like</h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              The DSL is designed to feel like Mermaid, not like XML. IDs are short, labels are quoted,
              flow operators are familiar, and BPMN semantics are readable without requiring XML knowledge.
            </p>
            <Link
              href="/playground"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
              data-testid="link-try-playground"
            >
              Try it in the playground
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">approval.bpmn-beta</span>
            </div>
            <pre
              className="p-4 text-xs font-mono text-foreground bg-card overflow-x-auto leading-relaxed whitespace-pre"
              data-testid="code-preview-home"
            >{`bpmn-beta
accTitle: Purchase Request Approval
accDescr: Manager reviews and approves or rejects.

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
t3 ==> e2`}</pre>
          </div>
        </div>
      </section>

      {/* Why not X? */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-xl font-bold text-foreground mb-2">Why not existing tools?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-relaxed">
            Each tool in this space solves a different problem. bpmn-beta is not trying to replace any of them —
            it fills a specific gap: BPMN descriptive diagrams for Markdown-first, Git-native, AI-assisted documentation.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {DISTINCTIONS.map(d => (
              <div key={d.versus} className="forge-card">
                <p className="text-xs font-mono text-primary font-bold mb-2">vs. {d.versus}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{d.difference}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related issues */}
      <section className="border-t border-border bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="forge-eyebrow mb-4">Related Mermaid GitHub issues</p>
          <div className="flex flex-wrap gap-3">
            {RELATED_ISSUES.map(issue => (
              <a
                key={issue.id}
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-sm hover:border-primary/40 hover:shadow-sm transition-all"
                data-testid={`link-issue-${issue.id}`}
              >
                <code className="font-mono text-xs text-primary font-bold">{issue.id}</code>
                <span className="text-muted-foreground text-xs">{issue.title}</span>
                <ExternalLink size={10} className="text-muted-foreground/50" />
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
