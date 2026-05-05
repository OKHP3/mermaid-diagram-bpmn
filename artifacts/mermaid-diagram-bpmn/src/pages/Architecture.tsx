type Status = "planned" | "prototype" | "in-progress";

interface Module {
  name: string;
  file: string;
  responsibility: string;
  status: Status;
  notes: string;
}

const MODULES: Module[] = [
  {
    name: "Detector",
    file: "bpmnDetector.ts",
    responsibility: "Recognize the bpmn-beta header keyword and route diagrams to the correct diagram type handler.",
    status: "prototype",
    notes: "Header keyword is bpmn-beta. Registered via Mermaid's diagram extension API."
  },
  {
    name: "Grammar / Parser",
    file: "parser/bpmn.langium",
    responsibility: "Formal grammar definition and parser generation. Converts raw DSL text into a typed AST.",
    status: "prototype",
    notes: "Current prototype uses a hand-written line parser. Target: Langium grammar for robustness and error recovery."
  },
  {
    name: "DiagramDB",
    file: "bpmnDb.ts",
    responsibility: "Normalize parsed AST into canonical BPMN graph: nodes, edges, pools, lanes, annotations, accessibility metadata.",
    status: "planned",
    notes: "Will hold parsed state, support queries, and expose the interface that the renderer and layout engine consume."
  },
  {
    name: "Renderer",
    file: "bpmnRenderer.ts",
    responsibility: "Convert the laid-out graph into SVG output. Responsible for correct BPMN visual notation.",
    status: "prototype",
    notes: "Prototype SVG renderer built in React. Handles start, end, user tasks, XOR/AND gateways, sequence flows."
  },
  {
    name: "Shape Library",
    file: "shapes/",
    responsibility: "Individual shape drawing functions for every BPMN element: events, tasks, gateways, markers, pools, lanes.",
    status: "prototype",
    notes: "MVP shapes implemented inline. Will be extracted into a dedicated module per shape family."
  },
  {
    name: "Layout Engine",
    file: "layout/laneLayout.ts",
    responsibility: "Automatic node positioning and flow routing. Handles left-to-right layout, branching, and lane boundaries.",
    status: "prototype",
    notes: "Heuristic topological-level layout for prototype. Target: proper lane-aware layout with flow routing."
  },
  {
    name: "Styles",
    file: "bpmnStyles.ts",
    responsibility: "Integrate Mermaid theme variables (primaryColor, lineColor, nodeBorder, etc.) into SVG output.",
    status: "prototype",
    notes: "Uses CSS custom properties for light/dark adaptation. Will hook into Mermaid's theming system."
  },
  {
    name: "Accessibility",
    file: "bpmnA11y.ts",
    responsibility: "Support accTitle and accDescr directives. Emit aria-labelledby, role=img, and SVG title/desc elements.",
    status: "prototype",
    notes: "Implemented in the MVP renderer. Will expand to per-element aria-labels and keyboard navigation."
  },
  {
    name: "Examples",
    file: "examples/",
    responsibility: "Canonical .mmd example files covering common process patterns. Used in docs, tests, and the playground.",
    status: "in-progress",
    notes: "4 examples in the current prototype. Target: 10-15 examples covering all supported elements."
  },
  {
    name: "Tests",
    file: "test/",
    responsibility: "Parser unit tests, detector tests, renderer snapshot tests, visual regression tests, accessibility checks.",
    status: "planned",
    notes: "No tests yet. Test infrastructure is required before proposing upstream. Vitest target."
  },
  {
    name: "Docs",
    file: "docs/",
    responsibility: "Syntax reference page, supported element matrix, limitations table, contributor guide, roadmap.",
    status: "in-progress",
    notes: "This Replit prototype serves as the living docs workspace. Target: Mermaid docs site page format."
  },
];

const STATUS_COLORS: Record<Status, string> = {
  planned: "text-muted-foreground bg-muted border-muted-border",
  prototype: "text-accent-foreground bg-accent border-accent-border",
  "in-progress": "text-primary bg-primary/10 border-primary/30",
};

const STATUS_LABELS: Record<Status, string> = {
  planned: "Planned",
  prototype: "Prototype",
  "in-progress": "In Progress",
};

const REPO_SHAPE = `mermaid-diagram-bpmn/
  src/
    diagram/
      bpmnDiagram.ts
      bpmnDb.ts
      bpmnRenderer.ts
      bpmnStyles.ts
      bpmnDetector.ts
      parser/
        bpmn.langium
        generated/
    shapes/
      event.ts
      task.ts
      gateway.ts
      flow.ts
    layout/
      laneLayout.ts
      flowRouting.ts
    index.ts
  test/
    parser.test.ts
    detector.test.ts
    renderer.test.ts
    fixtures/
  docs/
    syntax.md
    examples.md
    supported-elements.md
    roadmap.md
  examples/
    simple-process.mmd
    approval-gateway.mmd
    parallel-split.mmd
  README.md`;

export default function Architecture() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground" data-testid="heading-architecture">
          Architecture & Workstreams
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          A proper Mermaid diagram type requires a defined set of modules working together.
          This map shows the target architecture for <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">mermaid-diagram-bpmn</code> and
          the current development status of each layer.
        </p>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(Object.keys(STATUS_LABELS) as Status[]).map(s => (
          <span key={s} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${STATUS_COLORS[s]}`}>
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>

      {/* Module table */}
      <div className="rounded-lg border border-border overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">Module</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsibility</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28 hidden lg:table-cell">Target file</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod, i) => (
                <tr
                  key={mod.name}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/10"}`}
                  data-testid={`row-module-${mod.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <td className="px-4 py-3 font-semibold text-foreground text-sm align-top">{mod.name}</td>
                  <td className="px-4 py-3 align-top">
                    <p className="text-xs text-foreground leading-relaxed">{mod.responsibility}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.notes}</p>
                  </td>
                  <td className="px-4 py-3 align-top hidden lg:table-cell">
                    <code className="text-xs font-mono text-muted-foreground">{mod.file}</code>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_COLORS[mod.status]}`}>
                      {STATUS_LABELS[mod.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repo shape */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4" data-testid="heading-repo-shape">
          Proposed repository shape
        </h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
            <span className="text-xs font-mono text-muted-foreground">mermaid-diagram-bpmn / directory structure</span>
          </div>
          <pre className="p-4 text-xs font-mono text-foreground bg-card overflow-x-auto leading-relaxed whitespace-pre" data-testid="code-repo-shape">
            {REPO_SHAPE}
          </pre>
        </div>
      </div>

      {/* Integration note */}
      <div className="mt-8 p-5 rounded-lg border border-border bg-card">
        <p className="text-sm font-medium text-foreground mb-2">How it plugs into Mermaid</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Mermaid supports external diagram types registered via <code className="font-mono bg-muted px-1 py-0.5 rounded">mermaid.registerDiagram()</code>.
          This is the same mechanism used by community diagram types. The <code className="font-mono bg-muted px-1 py-0.5 rounded">bpmn-beta</code> plugin
          will register a detector, parser, DB accessor, and renderer — matching the internal diagram type contract — without requiring changes to the Mermaid core codebase.
          Upstream inclusion can be proposed after the syntax, renderer, and test suite are stable.
        </p>
      </div>
    </div>
  );
}
