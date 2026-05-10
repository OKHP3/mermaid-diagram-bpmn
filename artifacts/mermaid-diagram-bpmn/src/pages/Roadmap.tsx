import { CheckCheck, FlaskConical, Clock, Wrench, GitBranch, Database, Puzzle, Palette, Shield, AlignVerticalJustifyStart } from "lucide-react";

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

const CONTRIBUTION_STEPS = [
  {
    n: "01",
    title: "Engage on existing issues",
    body: "Read and comment on Mermaid GitHub issues #7699, #2623, and #660. Signal intent without prematurely locking syntax.",
  },
  {
    n: "02",
    title: "Publish DSL proposal",
    body: "Share a scoped bpmn-beta DSL proposal as a GitHub Discussions post or issue comment. Gather early syntax feedback.",
  },
  {
    n: "03",
    title: "Build the external plugin",
    body: "Implement mermaid-diagram-bpmn as a registerExternalDiagrams() plugin. Parser, renderer, layout, shape library, styles, accessibility.",
  },
  {
    n: "04",
    title: "Document supported elements",
    body: "Publish a clear supported element matrix. Name deferred features explicitly. Avoid overclaiming compliance.",
  },
  {
    n: "05",
    title: "Collect examples and feedback",
    body: "Publish real process examples. Gather usage patterns. Identify the 20% of features covering 80% of use cases.",
  },
  {
    n: "06",
    title: "Harden quality gates",
    body: "Add parser tests, renderer snapshots, visual regression tests, accessibility checks. Pass all Mermaid quality standards.",
  },
  {
    n: "07",
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
          strategy document lives in{" "}
          <a
            href="https://www.notion.so/overkillhill/BPMN-for-Mermaid-bpmn-beta-Diagram-Type-Proposal-357812e0ced481c88b20d2eb493dc775"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline font-medium"
          >
            Notion
          </a>
          . If they disagree, Notion wins.
        </p>
      </div>
    </div>
  );
}
