import React from "react";
import { CheckCheck, FlaskConical, Clock, Wrench, GitBranch, Database, Puzzle, Palette, Shield, AlignVerticalJustifyStart, CircleDot, ExternalLink } from "lucide-react";

// ─── Version Ladder ────────────────────────────────────────────────────────────

type VersionStatus = "done" | "current" | "planned";

interface VersionStep {
  version: string;
  title: string;
  status: VersionStatus;
  deliverables: React.ReactNode[];
}

const VERSION_LADDER: VersionStep[] = [
  {
    version: "V0.1",
    title: "bpmn-beta prototype",
    status: "done",
    deliverables: [
      "Hand-written parser with stack-based pool/lane block parsing",
      "SVG renderer in React — all BPMN shape types, bpmn-* CSS classes",
      "getStyles() — theme-aware CSS injected into SVG <defs>",
      "layoutGraph() — flat + pool/lane-aware layout modes",
      "Playground, DSL Reference, Architecture pages",
      "5 canonical .mmd example fixtures",
      "Detector, BpmnDb, Vitest unit + corpus tests",
    ],
  },
  {
    version: "V0.2",
    title: "BP-SKILL pilot — 4 skills",
    status: "done",
    deliverables: [
      "4 okhp3-* skills with full SKILL.md content (process-discovery, process-narrative, bpmn-for-mermaid, mermaid-theme-builder)",
      "context/ variable layer — 9 context template files with YAML frontmatter",
      "GitHub repository scaffolded (OKHP3/mermaid-diagram-bpmn)",
    ],
  },
  {
    version: "V0.3",
    title: "BP-SKILL suite — 15-skill pipeline",
    status: "current",
    deliverables: [
      "15-skill full lifecycle pipeline with complete SKILL.md content",
      "Agent Skills browser (/skills) — standard, pipeline diagram, skill browser, variable layer, PNS schema",
      "Walkthrough page (/walkthrough) — end-to-end 15-skill guide",
      "SkillDetail page (/skills/:skillId) with single + suite ZIP downloads",
      "PNS.md lifecycle tracker + 13-section schema viewer",
      "Documentation rewrite: README, AGENTS, 6 docs/ files",
      "GitHub Pages deployment workflow",
      "bp_skill_version: \"0.3.0\" across all 15 source SKILL.md files",
      "okhp3-* skills deprecated in frontmatter",
      "Version checklist published at docs/version-checklist.md",
    ],
  },
  {
    version: "V0.4",
    title: "Content and interactivity",
    status: "planned",
    deliverables: [
      "Interactive pipeline diagram — click any skill to navigate to its detail page",
      "PNS.md lifecycle advancement shown per skill in Walkthrough table",
      "Purchase-approval worked example tracing all 15 skills end-to-end",
      "Skill dependency flow diagram surfaced on the Architecture page",
    ],
  },
  {
    version: "V0.5",
    title: "Validation tooling",
    status: "planned",
    deliverables: [
      "skill:validate CLI — conformance checks for SKILL.md frontmatter and required sections",
      "validate-pns.mjs — schema-enforced PNS completeness checker",
      "Eval suite with pass/fail fixtures for all 15 skills (pnpm eval:run)",
      "Completeness scoring scripts for all 15 skill output types",
    ],
  },
  {
    version: "V0.6",
    title: "Mermaid plugin packaging",
    status: "planned",
    deliverables: [
      "registerExternalDiagrams() integration — detector, parser, DB, renderer all registered",
      "Theme variable binding — getStyles() reads live Mermaid theme vars at render time",
      "Plugin entry point exported from package, loadable via <script> against Mermaid CDN",
    ],
  },
  {
    version: "V0.7",
    title: "Langium parser",
    status: "planned",
    deliverables: [
      "Formal Langium grammar covering all bpmn-beta syntax",
      "Error recovery — invalid lines produce a diagnostic, not a crash",
      "Parser snapshot + visual regression test suite",
      "LSP support: hover, completion, and diagnostics in VS Code",
    ],
  },
  {
    version: "V0.8",
    title: "Quality gates",
    status: "planned",
    deliverables: [
      "BPMN 2.0.2 Descriptive Conformance Sub-Class element matrix published",
      "WCAG 2.1 AA accessibility audit on all rendered SVG output",
      "Bundle size baseline documented; dependency audit — no critical CVEs",
      "LLM benchmark prompts tested across ChatGPT, Claude, Gemini for bpmn-beta generation accuracy",
      "CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md added",
    ],
  },
  {
    version: "V0.9",
    title: "Community and upstream prep",
    status: "planned",
    deliverables: [
      "3+ real-world process examples contributed (beyond purchase-approval)",
      <>
        Mermaid issues{" "}
        <a href="https://github.com/mermaid-js/mermaid/issues/7699" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">#7699</a>
        {", "}
        <a href="https://github.com/mermaid-js/mermaid/issues/2623" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">#2623</a>
        {", "}
        <a href="https://github.com/mermaid-js/mermaid/issues/660" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">#660</a>
        {" engaged with prototype link"}
      </>,
      "BP-SKILL suite listed in agentskills.io directory",
      "Comparison matrix: bpmn-beta vs. PlantUML, bpmn.io, Visio, Mermaid flowchart",
    ],
  },
  {
    version: "V1.0",
    title: "Upstream Mermaid PR",
    status: "planned",
    deliverables: [
      "Formal PR open at mermaid-js/mermaid proposing bpmn-beta as a core diagram type",
      "BP-SKILL v1.0 published as standalone npm package (@okhp3/bp-skill)",
      "DSL spec v1.0 frozen — no breaking syntax changes without a new major",
      "Full plugin documentation written for Mermaid maintainers",
    ],
  },
];

const VERSION_STATUS_CONFIG: Record<VersionStatus, { label: string; pill: string; dot: string }> = {
  done: {
    label: "Done",
    pill: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  current: {
    label: "Current",
    pill: "text-primary bg-primary/10 border-primary/30",
    dot: "bg-primary ring-4 ring-primary/20",
  },
  planned: {
    label: "Planned",
    pill: "text-muted-foreground bg-muted/50 border-border",
    dot: "bg-border",
  },
};

// ─── MVP Scope / Deferred ──────────────────────────────────────────────────────

const MVP_SCOPE = [
  "Start events",
  "End events",
  "Generic tasks",
  "User tasks",
  "Service tasks",
  "Script tasks",
  "Receive tasks",
  "Send tasks",
  "Exclusive gateways (XOR)",
  "Parallel gateways (AND)",
  "Inclusive gateways (OR)",
  "Sequence flows",
  "Conditional sequence flow labels",
  "Default sequence flow marker",
  "Pools",
  "Lanes (one-level)",
  "Message flows",
  "Accessibility title (accTitle)",
  "Accessibility description (accDescr)",
  "Theme-aware SVG styling via getStyles()",
  "Auto left-to-right layout",
  "Pool/lane-aware layout",
];

const DEFERRED = [
  "Intermediate events",
  "Timer / message / error markers",
  "Call activities",
  "Collapsed subprocesses",
  "Event-based gateways",
  "Boundary events",
  "Event subprocesses",
  "Transaction subprocesses",
  "Multi-instance markers",
  "Compensation behavior",
  "Data objects and data stores",
  "Text annotations",
  "Associations",
  "Groups",
  "Correlation keys",
  "Complex gateway",
  "Choreography diagrams",
  "Conversation diagrams",
  "BPMN XML import / export",
  "Full BPMN 2.0 execution semantics",
  "Deeply nested lanes",
];

const GITHUB_ISSUE_BASE = "https://github.com/mermaid-js/mermaid/issues/";

const CONTRIBUTION_STEPS: { n: string; title: string; body: React.ReactNode }[] = [
  {
    n: "01",
    title: "Engage on existing issues",
    body: (
      <>
        Read and comment on Mermaid GitHub issues{" "}
        <a href={`${GITHUB_ISSUE_BASE}7699`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-2 font-medium">#7699</a>,{" "}
        <a href={`${GITHUB_ISSUE_BASE}2623`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-2 font-medium">#2623</a>, and{" "}
        <a href={`${GITHUB_ISSUE_BASE}660`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-2 font-medium">#660</a>.{" "}
        Signal intent without prematurely locking syntax.
      </>
    ),
  },
  {
    n: "02",
    title: "Publish DSL proposal",
    body: "Share a scoped bpmn-beta DSL proposal as a GitHub Discussions post or issue comment. Gather early syntax feedback.",
  },
  {
    n: "03",
    title: "Build the external plugin",
    body: "Implement mermaid-diagram-bpmn as a registerExternalDiagrams() plugin. Add detector, loader, and plugin entry point. Parser, renderer, layout, shape library, styles, accessibility.",
  },
  {
    n: "04",
    title: "Document supported elements",
    body: "Publish a clear supported element matrix. Name deferred features explicitly. Avoid overclaiming compliance. Add CONTRIBUTING, SECURITY, and CODE_OF_CONDUCT files.",
  },
  {
    n: "05",
    title: "Convert parser to Langium",
    body: "Replace hand-written line parser with a formal Langium grammar. Add error recovery, better diagnostics, LSP support, and upstream Mermaid compatibility. Establish Langium parity branch before replacing the prototype parser.",
  },
  {
    n: "06",
    title: "Collect examples and feedback",
    body: "Publish real process examples. Add LLM benchmark prompts — give identical process prompts to ChatGPT, Claude, and Gemini and compare whether they produce valid bpmn-beta. Gather usage patterns and identify the 20% of features covering 80% of use cases.",
  },
  {
    n: "07",
    title: "Harden quality gates",
    body: "Add parser tests, renderer snapshots, visual regression tests, invalid syntax fixtures, and accessibility checks. Formalize pool/lane/message-flow validation. Document bundle size and dependency posture. Pass all Mermaid quality standards.",
  },
  {
    n: "08",
    title: "Polish commercial readiness",
    body: "Add a demo GIF or screenshots. Add export-to-SVG/PNG download. Improve layout determinism. Add comparison matrix against PlantUML, bpmn.io, flowchart, and Visio. Engage Mermaid community on issue #7699 with prototype link.",
  },
  {
    n: "09",
    title: "Propose upstream inclusion",
    body: "Once syntax is stable and tests are solid, open a formal Mermaid PR proposing bpmn as a core diagram type.",
  },
];

interface ReadinessStep {
  icon: React.ElementType;
  title: string;
  current: string;
  target: string;
  status: "done" | "experimental" | "planned";
}

const READINESS_STEPS: ReadinessStep[] = [
  {
    icon: GitBranch,
    title: "Parser",
    current: "Hand-written line parser with stack-based block parsing for pools and lanes.",
    target: "Formal Langium grammar with error recovery, better diagnostics, and upstream Mermaid compatibility.",
    status: "experimental",
  },
  {
    icon: Database,
    title: "DiagramDB",
    current: "BpmnDb class with typed add/get API — nodes, flows, pools, lanes, accessibility metadata.",
    target: "Stable public API surface, frozen before upstream proposal. Must match Mermaid's internal DiagramDB contract.",
    status: "experimental",
  },
  {
    icon: Puzzle,
    title: "Mermaid External Diagram API",
    current: "Prototype renders standalone in a Vite app. Not wired to Mermaid's registerExternalDiagrams() yet.",
    target: "Full registerExternalDiagrams() integration — detector, parser, DB accessor, renderer all registered.",
    status: "planned",
  },
  {
    icon: Palette,
    title: "Theme integration via getStyles()",
    current: "getStyles(BpmnThemeOptions) emits a CSS block. Uses a fixed LIGHT_THEME constant, not live Mermaid theme vars.",
    target: "Read Mermaid's primaryColor, lineColor, nodeBorder, etc. at render time. Respect user theme config.",
    status: "experimental",
  },
  {
    icon: Shield,
    title: "Parser-enforced BPMN domain rules",
    current: "Parser accepts any syntactically valid line. No semantic validation (e.g. gateway fan-in/fan-out rules).",
    target: "Meaningful errors for invalid BPMN patterns. Gateway rules, event lifecycle constraints, lane membership.",
    status: "planned",
  },
  {
    icon: AlignVerticalJustifyStart,
    title: "Deterministic pool/lane layout",
    current: "Heuristic topological layout per lane. Cross-lane flow ordering is approximate. Pool widths may not align.",
    target: "Constraint-based layout that aligns pool widths, respects cross-lane dependencies, routes message flows around pool boundaries.",
    status: "planned",
  },
];

const STATUS_CONFIG = {
  done: {
    icon: CheckCheck,
    label: "Done",
    pill: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  },
  experimental: {
    icon: FlaskConical,
    label: "Experimental",
    pill: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  },
  planned: {
    icon: Clock,
    label: "Planned",
    pill: "text-primary/80 bg-primary/8 border-primary/25",
  },
};

export default function Roadmap() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground" data-testid="heading-roadmap">
          MVP Scope & Roadmap
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          The v1 proof-of-concept targets a minimal vertical slice — enough to validate the DSL,
          the rendering model, and the Mermaid integration path. Deferred features are explicitly named
          to avoid scope creep and to set clear expectations with contributors and users.
        </p>
      </div>

      {/* ─── Version Ladder ───────────────────────────────────────── */}
      <div className="mb-14">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground" data-testid="heading-version-ladder">
            Version ladder — V0.1 to V1.0
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Each version is a releasable milestone with explicit completion criteria. The full checklist
            lives in{" "}
            <code className="font-mono text-xs bg-muted px-1 rounded">docs/version-checklist.md</code>.
          </p>
        </div>

        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-[1.4rem] top-3 bottom-3 w-px bg-border hidden sm:block" />

          <div className="flex flex-col gap-0">
            {VERSION_LADDER.map((step, i) => {
              const cfg = VERSION_STATUS_CONFIG[step.status];
              const isLast = i === VERSION_LADDER.length - 1;
              return (
                <div
                  key={step.version}
                  className={`relative flex gap-4 sm:gap-5 items-start ${!isLast ? "pb-6" : ""}`}
                >
                  {/* Dot */}
                  <div className="shrink-0 w-11 flex justify-center pt-0.5 z-10">
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-background ${cfg.dot} mt-1`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {step.version}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cfg.pill}`}
                      >
                        {step.status === "current" && (
                          <CircleDot size={9} className="shrink-0" />
                        )}
                        {cfg.label}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {step.title}
                      </span>
                    </div>

                    <ul className="space-y-0.5">
                      {step.deliverables.map((d, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scope columns */}
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-accent/30">
            <p className="text-sm font-semibold text-foreground" data-testid="heading-in-scope">In scope — v1 MVP</p>
            <p className="text-xs text-muted-foreground mt-0.5">{MVP_SCOPE.length} elements targeted</p>
          </div>
          <ul className="divide-y divide-border">
            {MVP_SCOPE.map(item => (
              <li key={item} className="flex items-center gap-3 px-4 py-2.5 bg-card" data-testid={`item-scope-${item.toLowerCase().replace(/[\s/()]+/g, '-')}`}>
                <span className="w-3.5 h-3.5 rounded-full bg-primary/20 border border-primary/40 flex-shrink-0 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </span>
                <span className="text-xs text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <p className="text-sm font-semibold text-foreground" data-testid="heading-deferred">Deferred</p>
            <p className="text-xs text-muted-foreground mt-0.5">{DEFERRED.length} features explicitly out of scope for v1</p>
          </div>
          <ul className="divide-y divide-border">
            {DEFERRED.map(item => (
              <li key={item} className="flex items-center gap-3 px-4 py-2.5 bg-card" data-testid={`item-deferred-${item.toLowerCase().replace(/[\s/()]+/g, '-')}`}>
                <span className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Positioning note */}
      <div className="mb-14 p-5 rounded-lg border border-border bg-card">
        <p className="text-sm font-semibold text-foreground mb-2">Why a small scope matters</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A readable DSL covering 80-90% of common process documentation use cases is more valuable than
          an exhaustive notation nobody wants to write. The v1 in-scope set represents the minimal viable
          diagram that a developer, business analyst, or architect would find genuinely useful — without
          requiring them to understand BPMN's full execution model or XML interchange format.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          Features are deferred, not abandoned. Each item in the deferred list has a natural implementation
          order. Intermediate events and subprocesses come next after the base pool/lane/flow set stabilizes.
          Execution semantics are a separate effort and may never be in scope for a Mermaid diagram type.
        </p>
      </div>

      {/* Contribution-readiness roadmap */}
      <div className="mb-14">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground" data-testid="heading-readiness-roadmap">
            Contribution-readiness roadmap
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-2xl leading-relaxed">
            What needs to change in each module before this prototype is ready to propose upstream to Mermaid.
            Each row shows the current prototype state and the target state required for a credible PR.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {READINESS_STEPS.map((step) => {
            const cfg = STATUS_CONFIG[step.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={step.title} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
                  <step.icon size={14} className="text-primary shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{step.title}</span>
                  <span className={`ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.pill}`}>
                    <StatusIcon size={9} />
                    {cfg.label}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                  <div className="px-4 py-3">
                    <p className="forge-eyebrow mb-1.5" style={{ fontSize: "0.6rem" }}>Current (prototype)</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.current}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="forge-eyebrow mb-1.5 text-primary/60" style={{ fontSize: "0.6rem" }}>Target (contribution-ready)</p>
                    <p className="text-xs text-foreground leading-relaxed">{step.target}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contribution path */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-6" data-testid="heading-contribution-path">
          Progressive contribution path
        </h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="flex flex-col gap-4">
            {CONTRIBUTION_STEPS.map(step => (
              <div key={step.n} className="flex gap-4 items-start" data-testid={`step-contribution-${step.n}`}>
                <div className="w-12 h-12 rounded-full border-2 border-primary bg-card flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-xs font-mono font-bold text-primary">{step.n}</span>
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wrench note */}
      <div className="mt-12 p-4 rounded-lg border border-border bg-muted/30 flex items-start gap-3">
        <Wrench size={14} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This roadmap is the working state of the prototype, not a formal commitment. The canonical
          strategy document is{" "}
          <code className="font-mono text-xs bg-muted px-1 rounded">docs/strategy.md</code>
          {" "}in this repository. If they disagree, that file wins.
        </p>
      </div>

      {/* Reference links */}
      <div className="mt-6 rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Reference links</p>
        </div>
        <ul className="divide-y divide-border">
          <li className="flex items-center gap-3 px-4 py-3">
            <ExternalLink size={12} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <a
                href={`${GITHUB_ISSUE_BASE}7699`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline underline-offset-2"
              >
                mermaid-js/mermaid #7699
              </a>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                BPMN diagram support proposal by Andreas Emrich (DFKI) — filed 2026-05-02
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <ExternalLink size={12} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <a
                href={`${GITHUB_ISSUE_BASE}2623`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline underline-offset-2"
              >
                mermaid-js/mermaid #2623
              </a>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Earlier BPMN / process diagram request in the Mermaid issue tracker
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <ExternalLink size={12} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <a
                href={`${GITHUB_ISSUE_BASE}660`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline underline-offset-2"
              >
                mermaid-js/mermaid #660
              </a>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Original BPMN diagram feature request in the Mermaid issue tracker
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <ExternalLink size={12} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <a
                href="https://www.notion.so/36c812e0ced481ef816de1cd471fd1cd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline underline-offset-2"
              >
                BP-SKILL v0.2 Suite
              </a>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Full suite documentation — all 15 skills, PNS schema, context files, and install instructions
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
