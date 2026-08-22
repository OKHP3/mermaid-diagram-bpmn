import { ExternalLink } from "lucide-react";

// ── Syntax examples ──────────────────────────────────────────────────────────

// The shared process: a purchase-request approval workflow with two roles and
// a split path. Concrete enough to exercise events, tasks, gateways, and flows.

const BPMN_BETA = `bpmn-beta
accTitle: Purchase Request Approval
accDescr: A manager reviews a purchase request and either approves or rejects it.

start s1 "Request Raised"
task:user t1 "Submit Request"
task:user t2 "Review Request"
xor g1 "Approved?"
task:service t3 "Create Purchase Order"
task:user t4 "Notify: Rejected"
end e1 "PO Issued"
end e2 "Rejected"

s1 --> t1
t1 --> t2
t2 --> g1
g1 --> t3: "yes"
g1 --> t4: "no"
t3 --> e1
t4 ==> e2`;

// Verbatim from Andreas Emrich's 2026-05-24 comment on mermaid-js/mermaid#7699.
// This is the author's later proposed simple/default layer, shown exactly as published.
// Reviewed against the primary issue on 2026-08-20; nothing added or paraphrased.
const DFKI_7699 = `bpmn
  start --> review[Review Request] --> approved{Approved?}
  approved -- Yes --> accepted[Approved]
  approved -- No --> rejected[Rejected]`;

const PLANTUML = `@startuml
!theme plain
|Requester|
start
:Submit Request;
|Manager|
:Review Request;
if (Approved?) then (yes)
  :Create Purchase Order;
  |Requester|
  stop
else (no)
  :Notify: Rejected;
  stop
endif
@enduml`;

const MERMAID_FLOWCHART = `flowchart TD
  s1([Request Raised])
  t1[Submit Request]
  t2[Review Request]
  g1{Approved?}
  t3[Create Purchase Order]
  t4[Notify: Rejected]
  e1([PO Issued])
  e2([Rejected])

  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 -->|yes| t3
  g1 -->|no| t4
  t3 --> e1
  t4 --> e2`;

// ── Comparison data ──────────────────────────────────────────────────────────

const SYNTAXES = [
  {
    id: "bpmn-beta",
    label: "bpmn-beta",
    tag: "This project",
    tagClass: "bg-primary/10 text-primary border-primary/20",
    code: BPMN_BETA,
    lineCount: BPMN_BETA.trim().split("\n").length,
    charCount: BPMN_BETA.trim().length,
    strengths: [
      "Mermaid-idiomatic — concise, defaults-first",
      "BPMN-native shapes rendered in browser (events, gateways, pools)",
      "No bpmn-js dependency, no XML",
      "Task subtypes via colon notation (task:user, task:service, …)",
      "Pool/lane blocks mirror BPMN collaboration diagrams",
    ],
    tradeoffs: [
      "External plugin — not a core Mermaid diagram type yet",
      "Hand-written prototype parser (Langium planned for v1)",
      "Pool/lane layout is prototype-grade",
    ],
  },
  {
    id: "dfki-7699",
      label: "DFKI #7699 — current proposal",
      tag: "Proposed — author update, verbatim",
    tagClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    code: DFKI_7699,
    lineCount: DFKI_7699.trim().split("\n").length,
    charCount: DFKI_7699.trim().length,
    strengths: [
        "Later author update proposes a concise Mermaid-like default layer",
        "Optional detailed syntax is proposed for precise BPMN semantics",
        "Original issue targets a full BPMN 2.0 element set including subtypes",
      "Would be MIT-licensed core Mermaid if accepted",
    ],
    tradeoffs: [
        "Issue links a community prototype by @derari; the DFKI author has not linked a public implementation or PR",
        "The tiered syntax and its normalization rules are still proposed, not specified",
        "The original detailed form remains attribute-heavy for advanced elements",
        "Issue is open and marked Status: Approved (reviewed 2026-08-22)",
    ],
  },
  {
    id: "plantuml",
    label: "PlantUML activity-beta",
    tag: "Mature — different ecosystem",
    tagClass: "bg-muted text-muted-foreground border-border",
    code: PLANTUML,
    lineCount: PLANTUML.trim().split("\n").length,
    charCount: PLANTUML.trim().length,
    strengths: [
      "Mature toolchain with broad UML coverage",
      "Swimlane partitions approximate pool/lane BPMN",
      "Self-contained — no additional plugin required",
      "Native in GitLab, Confluence, and many wiki tools",
    ],
    tradeoffs: [
      "Not Mermaid-native — no GitHub/Notion/Obsidian rendering without a server",
      "BPMN support is \u201cfrozen\u201d per maintainers; rendered as activity diagrams",
      "No BPMN-shaped shapes (event circles, gateway diamonds with markers)",
      "Requires Graphviz for layout; server-side rendering story only",
    ],
  },
  {
    id: "mermaid-flowchart",
    label: "Mermaid flowchart",
    tag: "Available now — not semantic BPMN",
    tagClass: "bg-muted text-muted-foreground border-border",
    code: MERMAID_FLOWCHART,
    lineCount: MERMAID_FLOWCHART.trim().split("\n").length,
    charCount: MERMAID_FLOWCHART.trim().length,
    strengths: [
      "Native Mermaid — renders everywhere Mermaid renders (GitHub, Notion, Obsidian, …)",
      "Familiar syntax for anyone already using Mermaid",
      "No setup — just write a fenced code block",
      "Excellent LLM generation support (arXiv 2507.11356 — Mermaid wins 6/6 PMo criteria)",
    ],
    tradeoffs: [
      "Not semantically BPMN — no event subtypes, gateway markers, message flows, or pools/lanes",
      "Round nodes are not event circles; {braces} are not proper gateway diamonds",
      "Cannot represent BPMN collaboration diagrams or cross-pool message flows",
      "Semantically ambiguous for process readers trained on BPMN",
    ],
  },
] as const;

const CAPABILITY_MATRIX = [
  {
    capability: "Renders in GitHub / Notion / Obsidian natively",
    notes: {
      "bpmn-beta": "via external plugin",
      "dfki-7699": "no implementation yet",
      "plantuml": "GitLab / Confluence (not GitHub/Notion)",
      "mermaid-flowchart": "✓ native",
    },
  },
  {
    capability: "BPMN event circles (start / end / intermediate)",
    notes: {
      "bpmn-beta": "✓ start, end (more planned)",
      "dfki-7699": "proposed — original issue targets all subtypes",
      "plantuml": "approximate via activity shapes",
      "mermaid-flowchart": "round node only (([…]))",
    },
  },
  {
    capability: "Gateway diamonds with BPMN markers (XOR / AND / OR)",
    notes: {
      "bpmn-beta": "✓ xor, and, or",
      "dfki-7699": "proposed",
      "plantuml": "if/else branching only",
      "mermaid-flowchart": "generic {diamond} — no markers",
    },
  },
  {
    capability: "Task subtypes (user, service, script, send, receive)",
    notes: {
      "bpmn-beta": "✓ task:user, task:service, task:script, task:send, task:receive",
      "dfki-7699": "proposed via optional detailed syntax",
      "plantuml": "not natively differentiated",
      "mermaid-flowchart": "label convention only",
    },
  },
  {
    capability: "Pools and swim lanes",
    notes: {
      "bpmn-beta": "✓ pool { lane { } } blocks",
      "dfki-7699": "proposed via detailed syntax; original issue shows pool attributes",
      "plantuml": "| Swimlane | partitions",
      "mermaid-flowchart": "subgraph only — not BPMN pools",
    },
  },
  {
    capability: "Message flows between pools",
    notes: {
      "bpmn-beta": "✓ ~~> operator (experimental)",
      "dfki-7699": "proposed",
      "plantuml": "not native BPMN message flow",
      "mermaid-flowchart": "not representable",
    },
  },
  {
    capability: "No XML authoring",
    notes: {
      "bpmn-beta": "✓",
      "dfki-7699": "✓ (proposed text DSL)",
      "plantuml": "✓",
      "mermaid-flowchart": "✓",
    },
  },
  {
    capability: "No bpmn-js / server-side dependency",
    notes: {
      "bpmn-beta": "✓ pure-JS SVG renderer",
      "dfki-7699": "✓ (proposed)",
      "plantuml": "✗ requires PlantUML server or JAR",
      "mermaid-flowchart": "✓ client-side Mermaid only",
    },
  },
  {
    capability: "Working implementation today",
    notes: {
      "bpmn-beta": "✓ prototype — try in Playground",
      "dfki-7699": "community prototype linked; DFKI author’s work not public",
      "plantuml": "✓ mature",
      "mermaid-flowchart": "✓ native Mermaid",
    },
  },
  {
    capability: "Conciseness for simple processes",
    notes: {
      "bpmn-beta": "high — keyword + id + label per element",
      "dfki-7699": "not settled — concise default layer; detailed tier is more verbose",
      "plantuml": "medium — @startuml wrapper + swimlane syntax",
      "mermaid-flowchart": "high — but loses BPMN semantics",
    },
  },
] as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function CodeBlock({ label, tag, tagClass, code, lineCount, charCount }: {
  label: string;
  tag: string;
  tagClass: string;
  code: string;
  lineCount: number;
  charCount: number;
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="text-xs font-semibold text-foreground truncate">{label}</span>
        </div>
        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-mono ${tagClass}`}>{tag}</span>
      </div>
      <pre className="p-4 text-xs font-mono text-foreground bg-card overflow-x-auto leading-relaxed whitespace-pre flex-1">
        {code}
      </pre>
      <div className="flex gap-4 px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground font-mono">
        <span>{lineCount} lines</span>
        <span>{charCount} chars</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SyntaxComparison() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground" data-testid="heading-comparison">
          Syntax Comparison
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          A purchase-request approval process written in three notations —{" "}
          <strong className="text-foreground">bpmn-beta</strong> (this project),{" "}
          <strong className="text-foreground">PlantUML activity-beta</strong>, and{" "}
          <strong className="text-foreground">Mermaid flowchart</strong> — plus the{" "}
          <strong className="text-foreground">verbatim syntax snippet</strong> from{" "}
          <a href="https://github.com/mermaid-js/mermaid/issues/7699" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
            DFKI issue #7699
          </a>{" "}
          (the author's later proposed simple/default layer; five elements, not the full process).
          Each notation has genuine strengths — this page is a factual reference, not a sales pitch.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <a
            href="https://github.com/mermaid-js/mermaid/issues/7699"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            Mermaid issue #7699 <ExternalLink size={11} />
          </a>
          <span>·</span>
          <a
            href="https://plantuml.com/activity-diagram-beta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            PlantUML activity-beta docs <ExternalLink size={11} />
          </a>
          <span>·</span>
          <a
            href="https://mermaid.js.org/syntax/flowchart.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            Mermaid flowchart docs <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* The process being compared */}
      <section className="mb-12">
        <h2 className="text-base font-semibold text-foreground mb-1" data-testid="heading-process">
          The process
        </h2>
        <p className="text-xs text-muted-foreground mb-6 max-w-2xl leading-relaxed">
          A requester raises a purchase request; a manager reviews it and either approves (creating
          a purchase order) or rejects it (notifying the requester). The bpmn-beta, PlantUML, and
          Mermaid flowchart columns each render this full process: one start event, two end events,
          four tasks, one exclusive gateway, and seven sequence flows. The DFKI #7699 column shows
          the author's later, verbatim simple/default snippet from the issue — five elements covering
          a simplified approval/rejection branch. The issue also contains earlier detailed and
          pool-oriented examples; this page does not combine or rewrite them.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SYNTAXES.map(s => (
            <CodeBlock
              key={s.id}
              label={s.label}
              tag={s.tag}
              tagClass={s.tagClass}
              code={s.code}
              lineCount={s.lineCount}
              charCount={s.charCount}
            />
          ))}
        </div>
      </section>

      {/* Strengths and trade-offs */}
      <section className="mb-12">
        <h2 className="text-base font-semibold text-foreground mb-1" data-testid="heading-strengths">
          Strengths and trade-offs
        </h2>
        <p className="text-xs text-muted-foreground mb-6 max-w-2xl leading-relaxed">
          Each notation occupies a different point in the trade-off space. Choose the one whose
          strengths match your documentation workflow.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SYNTAXES.map(s => (
            <div key={s.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-mono ${s.tagClass}`}>{s.tag}</span>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Strengths</p>
                <ul className="flex flex-col gap-1">
                  {s.strengths.map((pt, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-primary shrink-0 mt-0.5">+</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Trade-offs</p>
                <ul className="flex flex-col gap-1">
                  {s.tradeoffs.map((pt, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-muted-foreground/50 shrink-0 mt-0.5">–</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capability matrix */}
      <section className="mb-12">
        <h2 className="text-base font-semibold text-foreground mb-1" data-testid="heading-matrix">
          Capability matrix
        </h2>
        <p className="text-xs text-muted-foreground mb-6 max-w-2xl leading-relaxed">
          Feature-by-feature comparison across all four notations.
          ✓ = supported. ✗ = not supported. All other cells describe the level or caveat.
        </p>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide min-w-[180px]">Capability</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide min-w-[140px]">bpmn-beta</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide min-w-[140px]">DFKI #7699</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide min-w-[140px]">PlantUML</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide min-w-[140px]">Mermaid flowchart</th>
                </tr>
              </thead>
              <tbody>
                {CAPABILITY_MATRIX.map((row, i) => (
                  <tr key={i} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/10"}`}>
                    <td className="px-4 py-3 font-semibold text-foreground align-top leading-relaxed">{row.capability}</td>
                    <td className="px-4 py-3 text-muted-foreground align-top leading-relaxed">{row.notes["bpmn-beta"]}</td>
                    <td className="px-4 py-3 text-muted-foreground align-top leading-relaxed">{row.notes["dfki-7699"]}</td>
                    <td className="px-4 py-3 text-muted-foreground align-top leading-relaxed">{row.notes["plantuml"]}</td>
                    <td className="px-4 py-3 text-muted-foreground align-top leading-relaxed">{row.notes["mermaid-flowchart"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Context and methodology */}
      <section className="mb-12">
        <h2 className="text-base font-semibold text-foreground mb-1" data-testid="heading-context">
          Context and methodology
        </h2>
        <p className="text-xs text-muted-foreground mb-4 max-w-2xl leading-relaxed">
          This comparison is maintained by the bpmn-beta project team. The bpmn-beta, PlantUML, and
          Mermaid flowchart examples are hand-written for the same notional process and verified to
          be syntactically valid in their respective parsers. The DFKI #7699 column reproduces one
          complete, later author-authored fenced example from the issue exactly — no elements were
          added, combined, or paraphrased. It remains proposed Mermaid syntax, not a released Mermaid parser.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs font-semibold text-foreground mb-1.5">DFKI #7699 example source</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The DFKI column is the <strong className="text-foreground">complete verbatim simple/default example</strong> from{" "}
              <a href="https://github.com/mermaid-js/mermaid/issues/7699" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Mermaid issue #7699 <ExternalLink size={10} />
              </a>{" "}
              — the later 2026-05-24 author update by Andreas Emrich. It is reproduced exactly, with
              nothing added, combined, or paraphrased. The issue also includes earlier detailed and
              pool examples. The cited Emrich &amp; Hollax 2025 paper remains described there as in
              preparation. The source check records what the issue says, but cannot prove that the paper
              has no DOI or preprint; reviewed 2026-08-22.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs font-semibold text-foreground mb-1.5">LLM-friendliness research</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Brissard, Cuppens, and Zouaq (Polytechnique Montréal, arXiv 2507.11356) empirically
              compared nine Process Model Representations for LLM-based process modeling. Mermaid
              scored highest across six criteria (token compactness, expressivity, human readability,
              visualization, usability, extensibility). bpmn-beta is designed to preserve that
              LLM-readability advantage while adding BPMN semantic precision.
            </p>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4" data-testid="heading-next">
          Try it or contribute
        </h2>
        <div className="flex flex-wrap gap-3">
          <a href="/playground" className="forge-btn-primary inline-flex items-center gap-2 text-xs">
            Try bpmn-beta in the Playground
          </a>
          <a
            href="https://github.com/mermaid-js/mermaid/issues/7699"
            target="_blank"
            rel="noopener noreferrer"
            className="forge-btn-secondary inline-flex items-center gap-2 text-xs"
          >
            View Mermaid issue #7699 <ExternalLink size={11} />
          </a>
          <a href="/dsl" className="forge-btn-secondary inline-flex items-center gap-2 text-xs">
            bpmn-beta DSL Reference
          </a>
        </div>
      </section>
    </div>
  );
}
