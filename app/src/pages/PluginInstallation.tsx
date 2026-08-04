import { useEffect } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="relative group rounded-lg border border-border bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/60">
        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
          {language}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
          aria-label="Copy code"
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  );
}

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

      <Section title="Install">
        <CodeBlock
          language="bash"
          code={`npm install @okhp3/mermaid-diagram-bpmn\nnpm install mermaid`}
        />
        <p className="mt-3 text-sm text-muted-foreground">
          Or with pnpm:{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            pnpm add @okhp3/mermaid-diagram-bpmn mermaid
          </code>
        </p>
      </Section>

      <Section title="Register and render">
        <p className="text-sm text-muted-foreground mb-4">
          Call <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">registerExternalDiagrams</code>{" "}
          once before Mermaid processes any content. After that, any{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">bpmn-beta</code> code fence
          is handled automatically.
        </p>
        <CodeBlock
          language="typescript"
          code={`import mermaid from 'mermaid';
import { bpmnPlugin } from '@okhp3/mermaid-diagram-bpmn';

mermaid.initialize({ startOnLoad: false });
await mermaid.registerExternalDiagrams([bpmnPlugin]);
await mermaid.run();`}
        />
      </Section>

      <Section title="Render explicitly">
        <p className="text-sm text-muted-foreground mb-4">
          Use <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">mermaid.render()</code>{" "}
          when you need the SVG string directly.
        </p>
        <CodeBlock
          language="typescript"
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

      <Section title="Version compatibility">
        <p className="text-sm text-muted-foreground mb-4">
          The plugin exports{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">MERMAID_VERSION_TARGET</code>{" "}
          — the Mermaid version this release is validated against. You can assert it in your tests:
        </p>
        <CodeBlock
          language="typescript"
          code={`import { MERMAID_VERSION_TARGET } from '@okhp3/mermaid-diagram-bpmn';

// In your test suite:
expect(installedMermaidVersion).toBe(MERMAID_VERSION_TARGET); // '11.4.1'`}
        />
        <div className="mt-4 overflow-x-auto">
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
                <td className="px-4 py-2.5 text-foreground">mermaid@11.4.1</td>
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
          running real <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">mermaid.render()</code> calls.
          See{" "}
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

      <Section title="Security level note">
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

      <Section title="Resources">
        <ul className="space-y-2 text-sm">
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
              href: "https://github.com/OKHP3/mermaid-diagram-bpmn",
              label: "GitHub repository",
              external: true,
              desc: "Source, issues, and contribution guide",
            },
            {
              href: "https://mermaid.js.org/config/externalDiagrams.html",
              label: "Mermaid: External Diagrams",
              external: true,
              desc: "Mermaid's official guide to registerExternalDiagrams()",
            },
          ].map((link) => (
            <li key={link.href}>
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
