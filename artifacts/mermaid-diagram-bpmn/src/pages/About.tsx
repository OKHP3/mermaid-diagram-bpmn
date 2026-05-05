import { ExternalLink } from "lucide-react";

interface Decision {
  id: string;
  title: string;
  body: string;
}

const DECISIONS: Decision[] = [
  {
    id: "D1",
    title: "Plugin first, upstream second",
    body: "Start as an external Mermaid diagram plugin registered via registerDiagram(). This reduces core-maintainer review burden, allows faster syntax iteration, and lets the community validate the approach before it lands in core.",
  },
  {
    id: "D2",
    title: "bpmn-beta, not bpmn",
    body: "Use bpmn-beta as the DSL header keyword until the grammar, rendering model, and user expectations stabilize. The -beta suffix is a promise to users that the syntax may change.",
  },
  {
    id: "D3",
    title: "Descriptive subset only",
    body: "Do not attempt executable BPMN, XML interchange, or full BPMN 2.0 standard conformance in v1. A readable descriptive subset covering common process documentation patterns delivers more value than an exhaustive implementation.",
  },
  {
    id: "D4",
    title: "Readability over exhaustiveness",
    body: "A developer with no BPMN background should be able to read a bpmn-beta diagram. The DSL is optimized for the 80% of use cases, not the full BPMN 2.0 specification.",
  },
  {
    id: "D5",
    title: "Shape fidelity matters",
    body: "BPMN users will reject incorrect notation. The renderer must get core shapes right: event borders, task rectangles, gateway markers, sequence flow arrowheads, and default flow slashes. Wrong shapes erode credibility immediately.",
  },
  {
    id: "D6",
    title: "No bpmn-js runtime dependency",
    body: "bpmn-js is a comprehensive BPMN toolkit with different design goals. Using it as a v1 dependency would couple this project to a heavyweight dependency and a different rendering philosophy. The prototype renderer is built from scratch.",
  },
];

interface Risk {
  label: string;
  severity: "High" | "Medium" | "Low";
  mitigation: string;
}

const RISKS: Risk[] = [
  { label: "Scope creep into full BPMN 2.0", severity: "High", mitigation: "Publish explicit v1 support matrix. Say no early and often." },
  { label: "DSL fragmentation with existing prototypes", severity: "High", mitigation: "Engage on GitHub issue #7699 before locking syntax. Don't ship in isolation." },
  { label: "Poor layout quality", severity: "High", mitigation: "Start with constrained left-to-right layout. Complexity grows with scope." },
  { label: "Incorrect BPMN notation", severity: "High", mitigation: "Validate shape library against BPMN reference examples. Get a BPMN practitioner to review." },
  { label: "Maintainer reluctance", severity: "Medium", mitigation: "Plugin-first path. Tests, examples, and docs reduce the review surface." },
  { label: "User expectation of XML export", severity: "Medium", mitigation: "Mark XML interchange as a future milestone in every public communication." },
  { label: "Mermaid theming conflicts", severity: "Medium", mitigation: "Use existing Mermaid theme variables. Do not introduce new theme properties in v1." },
  { label: "Overengineering the grammar", severity: "Medium", mitigation: "Hand-written parser is fine for the prototype. Langium migration when the grammar is proven." },
];

const SEVERITY_COLORS: Record<string, string> = {
  High: "text-destructive bg-destructive/10 border-destructive/30",
  Medium: "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  Low: "text-muted-foreground bg-muted border-muted-border",
};

const CONTRIBUTE_LINKS = [
  { label: "GitHub issue #7699 — Native BPMN 2.0 support", url: "https://github.com/mermaid-js/mermaid/issues/7699" },
  { label: "GitHub issue #2623 — BPMN support discussion", url: "https://github.com/mermaid-js/mermaid/issues/2623" },
  { label: "GitHub issue #660 — Older BPMN diagram request", url: "https://github.com/mermaid-js/mermaid/issues/660" },
  { label: "Mermaid — registerDiagram() API docs", url: "https://mermaid.js.org/config/theming.html" },
  { label: "OMG BPMN 2.0 specification", url: "https://www.omg.org/spec/BPMN/" },
  { label: "bpmn.org", url: "https://www.bpmn.org/" },
];

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground" data-testid="heading-about">
          About & Contribution
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Key decisions made during the design of <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bpmn-beta</code>,
          the risks this project is managing, and how to get involved.
        </p>
      </div>

      {/* Decisions */}
      <section className="mb-14">
        <h2 className="text-base font-semibold text-foreground mb-6" data-testid="heading-decisions">
          Key product decisions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DECISIONS.map(d => (
            <div key={d.id} className="p-5 rounded-lg border border-border bg-card" data-testid={`card-decision-${d.id}`}>
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary font-bold mt-0.5 shrink-0">{d.id}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1.5">{d.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{d.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Risks */}
      <section className="mb-14">
        <h2 className="text-base font-semibold text-foreground mb-4" data-testid="heading-risks">
          Risk register
        </h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Risk</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide w-24">Severity</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {RISKS.map((r, i) => (
                  <tr key={i} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/10"}`} data-testid={`row-risk-${i}`}>
                    <td className="px-4 py-3 text-foreground align-top leading-relaxed">{r.label}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${SEVERITY_COLORS[r.severity]}`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground align-top leading-relaxed">{r.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How to contribute */}
      <section className="mb-14">
        <h2 className="text-base font-semibold text-foreground mb-4" data-testid="heading-how-to-contribute">
          How to get involved
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "Comment on existing issues",
              body: "Start at GitHub issue #7699. Signal interest, share your use case, and see what prior work exists. Do not create a duplicate issue.",
            },
            {
              step: "2",
              title: "Try the playground",
              body: "Use the Playground page to write bpmn-beta diagrams. File an issue in this repo if the parser mishandles valid syntax.",
            },
            {
              step: "3",
              title: "Contribute to the spec",
              body: "Open a discussion about element syntax, edge cases, or deferred features you'd like to prioritize. The DSL is not locked.",
            },
          ].map(s => (
            <div key={s.step} className="p-5 rounded-lg border border-border bg-card">
              <div className="w-8 h-8 rounded-full bg-accent border border-accent-border flex items-center justify-center text-accent-foreground text-xs font-bold font-mono mb-3">
                {s.step}
              </div>
              <p className="text-sm font-semibold text-foreground mb-1.5">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reference links */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4" data-testid="heading-links">
          Reference links
        </h2>
        <div className="flex flex-col gap-2">
          {CONTRIBUTE_LINKS.map(link => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/30 transition-colors group"
              data-testid={`link-ref-${link.label.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="text-xs text-foreground flex-1">{link.label}</span>
              <ExternalLink size={12} className="text-muted-foreground/60 group-hover:text-muted-foreground transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
