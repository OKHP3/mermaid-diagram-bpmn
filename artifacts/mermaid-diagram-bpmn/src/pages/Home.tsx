import { Link } from "wouter";
import { ArrowRight, GitBranch, FileCode2, Layers, CheckCircle2, ExternalLink } from "lucide-react";

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

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-accent text-accent-foreground text-xs font-mono mb-6" data-testid="badge-status">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Concept capture — plugin prototype
          </div>

          <div className="flex items-center gap-5 mb-2">
            <img
              src="/icon.png"
              alt="BPMN for Mermaid"
              className="w-16 h-16 rounded-xl object-cover shrink-0 ring-1 ring-border shadow-sm"
              data-testid="img-hero-icon"
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight" data-testid="heading-hero">
              BPMN for Mermaid
            </h1>
          </div>

          <p className="mt-4 text-xl text-primary font-mono font-medium" data-testid="text-dsl-keyword">
            bpmn-beta
          </p>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            A Mermaid-native diagram type for business process modeling. Text-first, version-controllable,
            Markdown-compatible. Write BPMN the way you write flowcharts — then commit it.
          </p>

          <div className="mt-8 p-5 rounded-lg border border-border bg-card">
            <p className="text-sm font-medium text-foreground mb-1">Project thesis</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mermaid has a material diagram-type gap: BPMN 2.0 is not represented as a native syntax.
              The credible path is not to force BPMN through <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">flowchart</code>,
              but to create a dedicated <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bpmn-beta</code> plugin
              implementing a documented descriptive subset — and later propose upstream inclusion once the syntax stabilizes.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              data-testid="button-open-playground"
            >
              Open Playground
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/dsl"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
              data-testid="button-dsl-reference"
            >
              DSL Reference
            </Link>
          </div>
        </div>
      </section>

      {/* Strategic positioning */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Positioning statement</p>
          <blockquote className="text-base text-foreground leading-relaxed max-w-3xl border-l-2 border-primary pl-5">
            This is not an attempt to implement the entire BPMN 2.0 execution model inside Mermaid.
            It is a Mermaid-native <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">bpmn-beta</code> diagram type
            implementing a documented BPMN 2.0 descriptive subset for readable, version-controllable process diagrams.
          </blockquote>
        </div>
      </section>

      {/* Principles */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-16">
        <h2 className="text-xl font-semibold text-foreground mb-8" data-testid="heading-principles">
          Design principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRINCIPLES.map(p => (
            <div key={p.title} className="p-5 rounded-lg border border-border bg-card" data-testid={`card-principle-${p.title.toLowerCase()}`}>
              <p.icon size={18} className="text-primary mb-3" />
              <p className="font-semibold text-sm text-foreground mb-1">{p.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick DSL preview */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">What bpmn-beta looks like</h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              The DSL is designed to feel like Mermaid, not like XML. IDs are short, labels are quoted,
              flow operators are familiar, and BPMN semantics are readable without requiring XML knowledge.
            </p>
            <Link
              href="/playground"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              data-testid="link-try-playground"
            >
              Try it in the playground
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">approval.bpmn-beta</span>
            </div>
            <pre className="p-4 text-xs font-mono text-foreground bg-card overflow-x-auto leading-relaxed whitespace-pre" data-testid="code-preview-home">{`bpmn-beta
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
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Related Mermaid GitHub issues</p>
          <div className="flex flex-wrap gap-3">
            {RELATED_ISSUES.map(issue => (
              <a
                key={issue.id}
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm hover:border-primary/50 hover:bg-accent transition-colors"
                data-testid={`link-issue-${issue.id}`}
              >
                <code className="font-mono text-xs text-primary">{issue.id}</code>
                <span className="text-muted-foreground text-xs">{issue.title}</span>
                <ExternalLink size={11} className="text-muted-foreground/60" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
