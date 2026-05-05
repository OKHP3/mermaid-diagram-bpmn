const MVP_SCOPE = [
  "Start events",
  "End events",
  "User tasks",
  "Service tasks",
  "Script tasks",
  "Exclusive gateways (XOR)",
  "Parallel gateways (AND)",
  "Inclusive gateways (OR)",
  "Sequence flows",
  "Conditional sequence flow labels",
  "Default sequence flow marker",
  "Accessibility title (accTitle)",
  "Accessibility description (accDescr)",
  "Theme-aware SVG styling",
  "Auto left-to-right layout",
];

const DEFERRED = [
  "Pools",
  "Lanes (one-level)",
  "Message flows",
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
    body: "Implement mermaid-diagram-bpmn as a registerDiagram() plugin. Parser, renderer, layout, shape library, styles, accessibility.",
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
              <li key={item} className="flex items-center gap-3 px-4 py-2.5 bg-card" data-testid={`item-scope-${item.toLowerCase().replace(/\s+/g, '-')}`}>
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
              <li key={item} className="flex items-center gap-3 px-4 py-2.5 bg-card" data-testid={`item-deferred-${item.toLowerCase().replace(/\s+/g, '-')}`}>
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
          order. Pools and lanes come first after the base shapes stabilize. Message flows follow pools.
          Execution semantics are a separate effort and may never be in scope for a Mermaid diagram type.
        </p>
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
    </div>
  );
}
