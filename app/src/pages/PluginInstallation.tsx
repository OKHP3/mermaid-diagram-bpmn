import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, AlertCircle } from "lucide-react";
import { MERMAID_VERSION_TARGET } from "@/lib/bpmn-plugin";

// ── npm publication status ────────────────────────────────────────────────────
// Confirmed published: npm view @okhp3/mermaid-diagram-bpmn returns 0.1.1.
// Set to true once independently re-verified (see version-checklist.md V0.9).
const NPM_PUBLISHED = true;
const NPM_VERSION = "0.1.1";

// ── Known limits ──────────────────────────────────────────────────────────────

const KNOWN_LIMITS = [
  {
    id: "no-xml",
    label: "DSL only — no BPMN XML",
    detail:
      "The plugin parses bpmn-beta text. It cannot import or export BPMN 2.0.2 XML (.bpmn files) or graphical interchange (BPMNDI).",
  },
  {
    id: "node-subset",
    label: "Supported node types (subset of BPMN 2.0.2)",
    detail:
      "start, end, task (plain / user / service / script / subprocess), XOR gateway, OR gateway, intermediate events (timer, message). Not yet supported: collapsed sub-processes, data objects, message flows between pools, boundary events, call activities.",
  },
  {
    id: "single-level-pools",
    label: "Pools are single-level",
    detail:
      "Pool blocks cannot be nested. Nesting is detected and reported as a parse error with a line number.",
  },
  {
    id: "auto-layout",
    label: "Automatic layout only",
    detail:
      "Node positions are computed automatically. Manual coordinate overrides are not part of the DSL.",
  },
  {
    id: "security-level",
    label: "Test environments need securityLevel: 'loose'",
    detail:
      "jsdom and happy-dom drop SVG children after a <defs> block. Initialise Mermaid with securityLevel: 'loose' in those environments. Real browsers do not need this — the default ('strict') works correctly.",
  },
] as const;

// ── CodeBlock ─────────────────────────────────────────────────────────────────

function CodeBlock({
  code,
  language = "bash",
  testId,
}: {
  code: string;
  language?: string;
  testId?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div
      className="relative group rounded-lg border border-border bg-muted/40 overflow-hidden"
      data-testid={testId}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/60">
        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
          {language}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
          aria-label="Copy code to clipboard"
          data-testid={testId ? `${testId}-copy-btn` : undefined}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono text-foreground/90 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  title,
  children,
  testId,
}: {
  title: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <section className="mb-12" data-testid={testId}>
      <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PluginInstallation() {
  useEffect(() => {
    document.title = "Plugin Installation — BPMN for Mermaid";
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <header className="mb-10">
        <div className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-3">
          @okhp3/mermaid-diagram-bpmn
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Plugin Installation</h1>
        <p className="text-muted-foreground leading-relaxed">
          Use <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">bpmn-beta</code> diagrams
          in your own Mermaid installation. Three lines of setup code.
        </p>
      </header>

      {/* ── Install ─────────────────────────────────────────────────────────── */}
      <Section title="Install" testId="section-install">
        {/* npm publication status badge */}
        <div
          className="flex items-center gap-2 mb-4"
          data-testid="npm-status-badge"
        >
          {NPM_PUBLISHED ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                <Check size={10} />
                published · {NPM_VERSION}
              </span>
              <a
                href="https://www.npmjs.com/package/@okhp3/mermaid-diagram-bpmn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-primary hover:underline underline-offset-2 inline-flex items-center gap-1"
              >
                npmjs.com <ExternalLink size={9} />
              </a>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-mono text-amber-700 dark:text-amber-300">
              <AlertCircle size={10} />
              pre-release — not yet on npm
            </span>
          )}
        </div>

        {NPM_PUBLISHED ? (
          <CodeBlock
            language="bash"
            testId="code-install"
            code={`npm install @okhp3/mermaid-diagram-bpmn\nnpm install mermaid`}
          />
        ) : (
          <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm">
            <p className="text-amber-900 dark:text-amber-200 leading-relaxed">
              The package is not yet published to npm. Clone the repository and
              build locally, or check back after the npm release.
            </p>
          </div>
        )}

        <p className="mt-3 text-sm text-muted-foreground">
          Or with pnpm:{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            pnpm add @okhp3/mermaid-diagram-bpmn mermaid
          </code>
        </p>
      </Section>

      {/* ── Register and render ──────────────────────────────────────────────── */}
      <Section title="Register and render" testId="section-register">
        <p className="text-sm text-muted-foreground mb-4">
          Call{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">registerExternalDiagrams</code>{" "}
          once before Mermaid processes any content. After that, any{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">bpmn-beta</code> code fence
          is handled automatically.
        </p>
        <CodeBlock
          language="typescript"
          testId="code-register"
          code={`import mermaid from 'mermaid';
import { bpmnPlugin } from '@okhp3/mermaid-diagram-bpmn';

mermaid.initialize({ startOnLoad: false });
await mermaid.registerExternalDiagrams([bpmnPlugin]);
await mermaid.run();`}
        />
      </Section>

      {/* ── Render explicitly ────────────────────────────────────────────────── */}
      <Section title="Render explicitly" testId="section-render">
        <p className="text-sm text-muted-foreground mb-4">
          Use{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">mermaid.render()</code>{" "}
          when you need the SVG string directly.
        </p>
        <CodeBlock
          language="typescript"
          testId="code-render"
          code={`const { svg } = await mermaid.render('my-diagram', \`
bpmn-beta
accTitle: Purchase Approval
accDescr: A simple approval flow.

start  s1  "Request Received"
task:user  t1  "Review Request"
xor    g1  "Approved?"
end    e1  "Approved"
end    e2  "Rejected"

s1 --> t1
t1 --> g1
g1 --> e1 : "yes"
g1 --> e2 : "no"
\`);

document.getElementById('output')!.innerHTML = svg;`}
        />
      </Section>

      {/* ── Browser-verified demo ────────────────────────────────────────────── */}
      <Section title="Browser-verified demo" testId="section-demo">
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          The host demo page renders two real{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">bpmn-beta</code>{" "}
          diagrams through{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">mermaid.registerExternalDiagrams()</code>{" "}
          and{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">mermaid.render()</code>{" "}
          in this browser — not through{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">BpmnRenderer</code>. No{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">securityLevel: 'loose'</code>.
          It is the public proof that the plugin works under Mermaid's default security configuration.
        </p>
        <a
          href="/mermaid-host-demo"
          className="inline-flex items-center gap-2 forge-btn-primary"
          data-testid="link-host-demo"
        >
          Open live host demo
        </a>
      </Section>

      {/* ── Version compatibility ─────────────────────────────────────────────── */}
      <Section title="Version compatibility" testId="section-version">
        <p className="text-sm text-muted-foreground mb-4">
          The plugin exports{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">MERMAID_VERSION_TARGET</code>{" "}
          — the Mermaid version this release is validated against. You can assert it in your tests:
        </p>
        <CodeBlock
          language="typescript"
          testId="code-version-assert"
          code={`import { MERMAID_VERSION_TARGET } from '@okhp3/mermaid-diagram-bpmn';

// In your test suite:
expect(installedMermaidVersion).toBe(MERMAID_VERSION_TARGET); // '${MERMAID_VERSION_TARGET}'`}
        />
        <div className="mt-4 overflow-x-auto" data-testid="compat-table">
          <table className="w-full text-sm font-mono border border-border rounded-md overflow-hidden">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-2 text-left text-muted-foreground font-medium text-xs uppercase tracking-wider">Plugin</th>
                <th className="px-4 py-2 text-left text-muted-foreground font-medium text-xs uppercase tracking-wider">Mermaid target</th>
                <th className="px-4 py-2 text-left text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-2.5 text-foreground">0.1.x</td>
                <td className="px-4 py-2.5 text-foreground">mermaid@{MERMAID_VERSION_TARGET}</td>
                <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400 text-xs">source-verified</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground/70">
          "source-verified" means the integration is confirmed by{" "}
          <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">
            bpmn-plugin-integration.test.ts
          </code>{" "}
          running real{" "}
          <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">mermaid.render()</code>{" "}
          calls. See{" "}
          <a
            href="https://github.com/OKHP3/mermaid-diagram-bpmn/blob/main/docs/mermaid-compatibility.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            docs/mermaid-compatibility.md
            <ExternalLink size={10} />
          </a>{" "}
          for the full evidence record.
        </p>
      </Section>

      {/* ── Known limits ─────────────────────────────────────────────────────── */}
      <Section title="Known limits" testId="section-known-limits">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          The following constraints apply in v0.1.x. They are intentional scope decisions, not bugs.
          Each is tracked in{" "}
          <a
            href="https://github.com/OKHP3/mermaid-diagram-bpmn/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            the issue tracker
            <ExternalLink size={10} />
          </a>
          .
        </p>
        <ul className="space-y-4" data-testid="known-limits-list">
          {KNOWN_LIMITS.map((limit) => (
            <li
              key={limit.id}
              className="rounded-lg border border-border bg-card p-4"
              data-testid={`known-limit-${limit.id}`}
            >
              <p className="text-sm font-semibold text-foreground mb-1">{limit.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{limit.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Security level note ───────────────────────────────────────────────── */}
      <Section title="Security level note" testId="section-security">
        <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm">
          <p className="text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Testing note:</strong> In{" "}
            <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">jsdom</code>{" "}
            or{" "}
            <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">happy-dom</code>{" "}
            test environments, initialise Mermaid with{" "}
            <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">
              securityLevel: 'loose'
            </code>
            . These environments' HTML parsers drop SVG children after a{" "}
            <code className="font-mono text-xs">&lt;defs&gt;</code> block; DOMPurify (Mermaid's
            default sanitizer) re-parses SVG through the same parser and strips shape elements.
            With <code className="font-mono text-xs">'loose'</code>, Mermaid skips DOMPurify and
            returns the SVG string produced by{" "}
            <code className="font-mono text-xs">DOMParser(image/svg+xml)</code>, which preserves
            all elements. This is not needed in real browsers.
          </p>
        </div>
      </Section>

      {/* ── Resources ─────────────────────────────────────────────────────────── */}
      <Section title="Resources" testId="section-resources">
        <ul className="space-y-2 text-sm" data-testid="resources-list">
          {[
            {
              href: "/dsl",
              label: "bpmn-beta DSL Reference",
              external: false,
              desc: "Full syntax reference for the diagram language",
            },
            {
              href: "/playground",
              label: "Playground",
              external: false,
              desc: "Try bpmn-beta diagrams in your browser",
            },
            {
              href: "/mermaid-host-demo",
              label: "Live Host Demo",
              external: false,
              desc: "Browser-verified proof of registerExternalDiagrams() in action",
            },
            {
              href: "https://github.com/OKHP3/mermaid-diagram-bpmn",
              label: "GitHub repository",
              external: true,
              desc: "Source code, releases, and full documentation",
            },
            {
              href: "https://github.com/OKHP3/mermaid-diagram-bpmn/issues",
              label: "Issue tracker",
              external: true,
              desc: "Report bugs, request features, or track known limits",
            },
            {
              href: "https://github.com/OKHP3/mermaid-diagram-bpmn/blob/main/CONTRIBUTING.md",
              label: "Contributing guide",
              external: true,
              desc: "How to contribute code, diagrams, or documentation",
            },
            {
              href: "https://mermaid.js.org/config/externalDiagrams.html",
              label: "Mermaid: External Diagrams",
              external: true,
              desc: "Mermaid's official guide to registerExternalDiagrams()",
            },
          ].map((link) => (
            <li key={link.href} data-testid={`resource-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
              >
                {link.label}
                {link.external && <ExternalLink size={11} />}
              </a>
              <span className="text-muted-foreground ml-2">— {link.desc}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
