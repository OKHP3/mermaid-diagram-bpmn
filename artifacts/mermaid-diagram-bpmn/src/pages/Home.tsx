import { Link } from "wouter";
import { ArrowRight, GitBranch, FileCode2, Layers, CheckCircle2, ExternalLink, CheckCheck, FlaskConical, Clock, XCircle } from "lucide-react";
import { StatusRibbon } from "@/components/StatusRibbon";

const PRINCIPLES = [
  { icon: FileCode2, title: "Text-First", body: "Write BPMN as code. Version-control it, diff it, review it in pull requests. No proprietary file formats." },
  { icon: GitBranch, title: "Mermaid-Native", body: "Follows Mermaid DSL conventions. Renders where Mermaid renders: GitHub, Notion, docs portals, AI outputs." },
  { icon: Layers, title: "Scoped Subset", body: "A documented BPMN 2.0 descriptive subset — not a full implementation. Clarity and usability over exhaustive compliance." },
  { icon: CheckCircle2, title: "Plugin-First Path", body: "Starts as an external plugin for fast iteration. Community discussion and upstream proposal come after validation." },
];

const RELATED_ISSUES = [
  { id: "#7699", title: "Native BPMN 2.0 support proposal", url: "https://github.com/mermaid-js/mermaid/issues/7699" },
  { id: "#2623", title: "BPMN support discussion", url: "https://github.com/mermaid-js/mermaid/issues/2623" },
  { id: "#660", title: "Older BPMN 2.0 diagram request", url: "https://github.com/mermaid-js/mermaid/issues/660" },
];

const SUPPORT_MATRIX = {
  implemented: [
    "Start events",
    "End events",
    "Generic tasks",
    "User tasks (person marker)",
    "Service tasks (gear marker)",
    "Script tasks (script marker)",
    "Receive tasks (envelope marker)",
    "Send tasks (filled envelope)",
    "XOR gateways",
    "AND gateways",
    "OR gateways",
    "Sequence flows (-->)",
    "Conditional flow labels",
    "Default flow marker (==>)",
    "accTitle / accDescr directives",
    "Auto left-to-right layout",
    "Theme-aware SVG styling",
  ],
  experimental: [
    "Pools (headers, containers)",
    "Lanes (one level deep)",
    "Message flows (~~>)",
    "Pool/lane-aware layout",
    "Cross-pool flow routing",
  ],
  planned: [
    "Formal Langium grammar",
    "Mermaid registerExternalDiagrams() integration",
    "Intermediate events",
    "Timer / message / error markers",
    "Deterministic pool/lane layout",
    "Full Mermaid theme variable binding",
    "Parser-enforced BPMN domain rules",
    "Shape extraction from renderer",
  ],
  outOfScope: [
    "BPMN XML import / export",
    "Full BPMN 2.0 execution semantics",
    "bpmn-js runtime dependency",
    "Choreography diagrams",
    "Conversation diagrams",
    "Event subprocesses",
    "Complex gateways",
  ],
};

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

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* Status ribbon */}
      <StatusRibbon />

      {/* Hero */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-3xl">

          <p className="forge-eyebrow mb-5" data-testid="badge-status">
            The Forge — Contributor Prototype
          </p>

          <div className="flex items-center gap-5 mb-1">
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="BPMN for Mermaid"
              className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-md"
              data-testid="img-hero-icon"
            />
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight"
              data-testid="heading-hero"
            >
              BPMN for Mermaid
            </h1>
          </div>

          <p className="mt-4 font-mono font-medium text-lg text-primary" data-testid="text-dsl-keyword">
            bpmn-beta
          </p>

          <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-2xl">
            A Mermaid-native diagram type for business process modeling. Text-first, version-controllable,
            Markdown-compatible. Write BPMN the way you write flowcharts — then commit it.
          </p>

          {/* Project thesis card */}
          <div className="mt-7 forge-card">
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

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/playground" className="forge-btn-primary" data-testid="button-open-playground">
              Open Playground
              <ArrowRight size={15} />
            </Link>
            <Link href="/dsl" className="forge-btn-outline" data-testid="button-dsl-reference">
              DSL Reference
            </Link>
          </div>
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
            What the prototype renders today, what is experimental, what is on the roadmap, and what is explicitly outside scope.
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
            label="Planned"
            items={SUPPORT_MATRIX.planned}
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
