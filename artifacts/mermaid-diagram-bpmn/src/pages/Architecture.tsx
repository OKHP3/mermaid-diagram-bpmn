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
    file: "bpmn-detector.ts",
    responsibility: "Recognize the bpmn-beta header keyword and route diagrams to the correct diagram type handler.",
    status: "in-progress",
    notes: "Header keyword is bpmn-beta. DETECTOR_KEY = 'BPMNDiagram'. Registered via mermaid.registerExternalDiagrams()."
  },
  {
    name: "Grammar / Parser",
    file: "bpmn-parser.ts",
    responsibility: "Formal grammar definition and parser generation. Converts raw DSL text into a typed DiagramDB.",
    status: "in-progress",
    notes: "Hand-written line parser with stack-based block parsing for pools and lanes. Exports parse(source): BpmnDb. Target: Langium grammar for error recovery."
  },
  {
    name: "DiagramDB",
    file: "bpmn-db.ts",
    responsibility: "Normalize parsed AST into canonical BPMN graph: nodes, flows, pools, lanes, accessibility metadata.",
    status: "in-progress",
    notes: "Implemented as BpmnDb class with typed add/get methods. Supports nodes (kind/subtype/position), flows, pools, and lanes."
  },
  {
    name: "Renderer",
    file: "bpmn-renderer.tsx",
    responsibility: "Convert the laid-out graph into SVG output. Responsible for correct BPMN visual notation.",
    status: "in-progress",
    notes: "Scratch SVG renderer in React. Handles events, tasks (user/service/script/receive/send), gateways, sequence/conditional/default/message flows, pools, and lanes."
  },
  {
    name: "Shape Library",
    file: "shapes/",
    responsibility: "Individual shape drawing functions for every BPMN element: events, tasks, gateways, markers, pools, lanes.",
    status: "prototype",
    notes: "MVP shapes implemented inline in bpmn-renderer.tsx. Will be extracted into a dedicated module per shape family."
  },
  {
    name: "Layout Engine",
    file: "bpmn-layout.ts",
    responsibility: "Automatic node positioning and flow routing. Handles left-to-right layout, branching, and pool/lane boundaries.",
    status: "in-progress",
    notes: "Heuristic topological-level layout. Supports flat mode and pool/lane mode. BpmnLayout includes PoolLayout and LaneLayout structs."
  },
  {
    name: "Styles",
    file: "bpmn-styles.ts",
    responsibility: "Integrate Mermaid theme variables (primaryColor, lineColor, nodeBorder, etc.) into SVG output.",
    status: "in-progress",
    notes: "getStyles(BpmnThemeOptions) emits a CSS block injected into SVG <defs>. All shapes use .bpmn-* class names. CSS vars for light/dark adaptation."
  },
  {
    name: "Accessibility",
    file: "bpmn-renderer.tsx",
    responsibility: "Support accTitle and accDescr directives. Emit aria-labelledby, role=img, and SVG title/desc elements.",
    status: "in-progress",
    notes: "Implemented in the MVP renderer via db.getAccTitle() and db.getAccDescription(). Expanding to per-element aria-labels is deferred."
  },
  {
    name: "Examples",
    file: "examples/",
    responsibility: "Canonical .mmd example files covering common process patterns. Used in docs, tests, and the playground.",
    status: "in-progress",
    notes: "5 examples: 01-linear-process, 02-gateway-decision, 03-pool-lane-collaboration, 04-multi-event, 05-parallel-split. Imported via Vite ?raw."
  },
  {
    name: "Tests",
    file: "src/lib/__tests__/",
    responsibility: "Parser unit tests, detector tests, renderer snapshot tests, visual regression tests, accessibility checks.",
    status: "in-progress",
    notes: "Vitest infrastructure set up. Unit tests for Detector, DiagramDB, Parser. Corpus tests for all 5 example files."
  },
  {
    name: "Docs",
    file: "src/pages/",
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
    lib/
      bpmn-detector.ts       ← DETECTOR_KEY, detect()
      bpmn-db.ts             ← BpmnDb class, BpmnNode, BpmnFlow, BpmnPool, BpmnLane
      bpmn-parser.ts         ← parse(source): BpmnDb
      bpmn-layout.ts         ← layoutGraph(db): BpmnLayout
      bpmn-renderer.tsx      ← <BpmnRenderer source={...} />
      bpmn-styles.ts         ← getStyles(BpmnThemeOptions): string
      bpmn-examples.ts       ← BPMN_EXAMPLES[], ?raw imports
      __tests__/
        bpmn-detector.test.ts
        bpmn-db.test.ts
        bpmn-parser.test.ts
        bpmn-parser-corpus.test.ts
        corpus/README.md
    pages/
      Home.tsx
      Playground.tsx
      Architecture.tsx
      DslReference.tsx
      Roadmap.tsx
      About.tsx
    components/
      Layout.tsx
  examples/
    01-linear-process.mmd
    02-gateway-decision.mmd
    03-pool-lane-collaboration.mmd
    04-multi-event.mmd
    05-parallel-split.mmd
  README.md
  LICENSE`;

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
          Current repository shape
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
          Mermaid supports external diagram types registered via <code className="font-mono bg-muted px-1 py-0.5 rounded">mermaid.registerExternalDiagrams()</code>.
          This is the same mechanism used by community diagram types. The <code className="font-mono bg-muted px-1 py-0.5 rounded">bpmn-beta</code> plugin
          will register a detector, parser, DB accessor, and renderer — matching the internal diagram type contract — without requiring changes to the Mermaid core codebase.
          Upstream inclusion can be proposed after the syntax, renderer, and test suite are stable.
        </p>
      </div>
    </div>
  );
}
