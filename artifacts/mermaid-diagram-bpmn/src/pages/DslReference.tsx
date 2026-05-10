interface Row {
  syntax: string;
  description: string;
  example?: string;
}

const NODE_TYPES: Row[] = [
  { syntax: 'start <id> "<label>"', description: "Start event — thin-border circle.", example: 'start s1 "Order Placed"' },
  { syntax: 'end <id> "<label>"', description: "End event — thick-border filled circle.", example: 'end e1 "Order Complete"' },
  { syntax: 'task <id> "<label>"', description: "Generic task — plain rectangle, no marker.", example: 'task t1 "Process Data"' },
  { syntax: 'task:user <id> "<label>"', description: "User task — rectangle with person marker.", example: 'task:user t1 "Review Request"' },
  { syntax: 'task:service <id> "<label>"', description: "Service task — rectangle with gear marker.", example: 'task:service t2 "Call Payment API"' },
  { syntax: 'task:script <id> "<label>"', description: "Script task — rectangle with script marker.", example: 'task:script t3 "Transform Data"' },
  { syntax: 'task:receive <id> "<label>"', description: "Receive task — rectangle with envelope marker (catching).", example: 'task:receive t4 "Receive PO"' },
  { syntax: 'task:send <id> "<label>"', description: "Send task — rectangle with filled envelope marker (throwing).", example: 'task:send t5 "Send Confirmation"' },
  { syntax: 'xor <id> "<label>"', description: "Exclusive gateway — diamond with X. One outgoing path fires.", example: 'xor g1 "Approved?"' },
  { syntax: 'or <id> "<label>"', description: "Inclusive gateway — diamond with circle. One or more paths fire.", example: 'or g2 "Notify Channels?"' },
  { syntax: 'and <id> "<label>"', description: "Parallel gateway — diamond with +. All paths fire.", example: 'and g3 "Split Work"' },
];

const FLOW_OPERATORS: Row[] = [
  { syntax: "<from> --> <to>", description: "Sequence flow — solid line with filled arrowhead.", example: "s1 --> t1" },
  { syntax: '<from> --> <to>: "<label>"', description: "Conditional sequence flow — solid line with quoted label.", example: 'g1 --> t2: "yes"' },
  { syntax: "<from> ==> <to>", description: "Default sequence flow — solid line with slash marker at source.", example: "g1 ==> t3" },
  { syntax: "<from> ~~> <to>", description: "Message flow — dashed line with open arrowhead. Crosses pool boundaries. Must be declared at top level.", example: "t1 ~~> t2" },
];

const POOL_LANE_SYNTAX: Row[] = [
  { syntax: 'pool <id> "<label>" {', description: "Declare a pool (participant). Contains lanes or nodes directly. Close with }.", example: 'pool buyer "Buyer" {' },
  { syntax: 'lane <id> "<label>" {', description: "Declare a swim lane inside a pool. Close with }. Lanes cannot be nested.", example: 'lane req "Requester" {' },
  { syntax: "<node-declaration>", description: "Node declarations inside a lane block are automatically assigned to that pool and lane.", example: 'start s1 "Start"' },
  { syntax: "<flow-declaration>", description: "Sequence flows inside a pool block connect nodes within the same pool.", example: "s1 --> t1" },
  { syntax: "<from> ~~> <to>", description: "Message flows between pools must be declared at the top level (outside any pool block).", example: "t1 ~~> t3" },
];

const DIRECTIVES: Row[] = [
  { syntax: "accTitle: <text>", description: "Accessibility title. Emitted as <title> in the SVG. Shown to screen readers.", example: "accTitle: Purchase Order Approval" },
  { syntax: "accDescr: <text>", description: "Accessibility description. Emitted as <desc> in the SVG.", example: "accDescr: A process showing requester and manager approval." },
];

const DEFERRED_KEYWORDS: string[] = [
  "msg:start", "msg:end", "timer:start", "boundary:timer",
  "subprocess", "call", "annotation",
];

const FULL_EXAMPLE = `bpmn-beta
accTitle: Purchase Request Approval
accDescr: A manager reviews a purchase request and either approves or rejects it.

start s1 "Request Raised"
task:user t1 "Submit Request"
task:user t2 "Review Request"
xor g1 "Approved?"
task:service t3 "Create Purchase Order"
task:user t4 "Notify Requester: Rejected"
end e1 "PO Issued"
end e2 "Rejected"

s1 --> t1
t1 --> t2
t2 --> g1
g1 --> t3: "yes"
g1 --> t4: "no"
t3 --> e1
t4 ==> e2`;

const POOL_EXAMPLE = `bpmn-beta
accTitle: Purchase Order Collaboration

pool buyer "Buyer" {
  lane req "Requester" {
    start s1 "Need Identified"
    task:user t1 "Submit PO Request"
  }
  lane mgr "Manager" {
    task:user t2 "Review Request"
    xor g1 "Approved?"
    end e2 "Rejected"
  }
  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> e2: "no"
}

pool supplier "Supplier" {
  task:receive t3 "Receive PO"
  task t4 "Acknowledge PO"
  end e1 "PO Acknowledged"
  t3 --> t4
  t4 --> e1
}

g1 ~~> t3`;

function RefTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Syntax</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Example</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/10"}`}>
                <td className="px-4 py-2.5 font-mono text-primary align-top whitespace-nowrap">{row.syntax}</td>
                <td className="px-4 py-2.5 text-foreground align-top leading-relaxed">{row.description}</td>
                {row.example && (
                  <td className="px-4 py-2.5 font-mono text-muted-foreground align-top hidden md:table-cell whitespace-nowrap">{row.example}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="text-xs font-mono text-muted-foreground">{title}</span>
      </div>
      <pre className="p-4 text-xs font-mono text-foreground bg-card overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

export default function DslReference() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground" data-testid="heading-dsl">
          DSL Reference
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          The <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bpmn-beta</code> diagram type follows Mermaid DSL conventions.
          Every diagram starts with the <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bpmn-beta</code> keyword.
          The header keyword will change to <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bpmn</code> when the grammar stabilizes.
        </p>
      </div>

      {/* Header keyword */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3" data-testid="heading-header">Diagram header</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <pre className="px-4 py-3 bg-card text-sm font-mono text-primary">bpmn-beta</pre>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Must appear on the first line. The <code className="font-mono bg-muted px-1 py-0.5 rounded">-beta</code> suffix
          signals that the syntax is subject to change. Do not register production diagrams against this keyword until
          it graduates to <code className="font-mono bg-muted px-1 py-0.5 rounded">bpmn</code>.
        </p>
      </section>

      {/* Directives */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3" data-testid="heading-directives">Accessibility directives</h2>
        <RefTable rows={DIRECTIVES} />
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          These directives generate <code className="font-mono bg-muted px-1 py-0.5 rounded">&lt;title&gt;</code> and{" "}
          <code className="font-mono bg-muted px-1 py-0.5 rounded">&lt;desc&gt;</code> elements in the SVG output,
          along with <code className="font-mono bg-muted px-1 py-0.5 rounded">role="img"</code> and{" "}
          <code className="font-mono bg-muted px-1 py-0.5 rounded">aria-labelledby</code> on the root SVG element.
        </p>
      </section>

      {/* Node types */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3" data-testid="heading-nodes">Node types (MVP scope)</h2>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          All node declarations follow the pattern: <code className="font-mono bg-muted px-1 py-0.5 rounded">{"<type> <id> \"<label>\""}</code>.
          IDs must be alphanumeric with underscores. Labels must be double-quoted.
        </p>
        <RefTable rows={NODE_TYPES} />
      </section>

      {/* Flow operators */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3" data-testid="heading-flows">Flow operators</h2>
        <RefTable rows={FLOW_OPERATORS} />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-md border border-border bg-card text-xs">
            <code className="font-mono text-primary">--&gt;</code>
            <p className="text-muted-foreground mt-1">Sequence flow. Solid line, filled arrowhead.</p>
          </div>
          <div className="p-3 rounded-md border border-border bg-card text-xs">
            <code className="font-mono text-primary">--&gt; : "label"</code>
            <p className="text-muted-foreground mt-1">Conditional flow. Label appears beside the arrow.</p>
          </div>
          <div className="p-3 rounded-md border border-border bg-card text-xs">
            <code className="font-mono text-primary">==&gt;</code>
            <p className="text-muted-foreground mt-1">Default flow. Slash marker at source node.</p>
          </div>
          <div className="p-3 rounded-md border border-border bg-card text-xs">
            <code className="font-mono text-primary">~~&gt;</code>
            <p className="text-muted-foreground mt-1">Message flow. Dashed line, open arrowhead. Top level only.</p>
          </div>
        </div>
      </section>

      {/* Pools and lanes */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3" data-testid="heading-pools">Pools and lanes</h2>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Pools represent process participants. Lanes subdivide a pool into responsibility areas.
          Nodes inside a lane are automatically assigned to that pool and lane.
          Message flows between pools use <code className="font-mono bg-muted px-1 py-0.5 rounded">~~&gt;</code> and must appear at the top level.
        </p>
        <RefTable rows={POOL_LANE_SYNTAX} />
        <div className="mt-4">
          <CodeBlock title="pool-lane-collaboration.bpmn-beta" code={POOL_EXAMPLE} />
        </div>
      </section>

      {/* DSL Principles */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3" data-testid="heading-principles">DSL design principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Short explicit IDs", "Use 1-3 character IDs like s1, t2, g1. Long IDs reduce readability."],
            ["Quoted labels", "All user-visible text must be in double quotes. This allows labels with spaces."],
            ["Mermaid-like operators", "Flow arrows follow Mermaid conventions so the syntax feels familiar."],
            ["Renderer owns notation", "The DSL describes intent. The renderer decides how each shape looks."],
            ["Readable without XML knowledge", "A developer with no BPMN background should be able to read a diagram."],
            ["No micromanagement", "The DSL does not accept pixel positions, colors, or layout hints. The engine decides."],
          ].map(([title, body]) => (
            <div key={title} className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs font-semibold text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deferred keywords */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3" data-testid="heading-deferred">Deferred keywords (not in MVP)</h2>
        <div className="flex flex-wrap gap-2">
          {DEFERRED_KEYWORDS.map(kw => (
            <code key={kw} className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-mono border border-border">
              {kw}
            </code>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          These keywords are reserved for future versions. Using them in the current parser will produce no output or be ignored.
        </p>
      </section>

      {/* Full example */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3" data-testid="heading-full-example">Complete worked example</h2>
        <CodeBlock title="approval-process.bpmn-beta" code={FULL_EXAMPLE} />
      </section>
    </div>
  );
}
