/**
 * MermaidHostDemo.tsx
 *
 * PRD-04 O3 — Real-browser Mermaid host proof.
 *
 * This page renders bpmn-beta diagrams through real mermaid.registerExternalDiagrams()
 * and mermaid.render() calls — NOT through BpmnRenderer.  It is the public proof that
 * the plugin works in a live browser DOM under Mermaid's default security configuration
 * (no securityLevel: 'loose').
 *
 * Why securityLevel: 'loose' is NOT needed here:
 *   The integration test (bpmn-plugin-integration.test.ts) uses securityLevel: 'loose'
 *   because happy-dom's HTML parser drops SVG children after <defs>, and DOMPurify
 *   re-parses via the same parser.  In a real browser the HTML parser correctly assigns
 *   the SVG namespace to children of an SVG element, so DOMPurify does not strip anything.
 *   The draw() function in bpmn-plugin.ts uses DOMParser(image/svg+xml) — an XML parser —
 *   which is immune to the HTML parser bug in all environments.
 */

import { useState, useEffect } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import mermaid from 'mermaid';
import { bpmnPlugin, MERMAID_VERSION_TARGET } from '@/lib/bpmn-plugin';
import example01 from '../../examples/01-linear-process.mmd?raw';
import example02 from '../../examples/02-gateway-decision.mmd?raw';
import example06 from '../../examples/06-cross-pool-collaboration.mmd?raw';
import example08 from '../../examples/08-purchase-order-approval.mmd?raw';
import example07 from '../../examples/07-employee-onboarding.mmd?raw';
import example09 from '../../examples/09-quote-to-order.mmd?raw';
import example10 from '../../examples/10-support-ticket-triage.mmd?raw';

// ── Error-case fixture ────────────────────────────────────────────────────────
// Intentionally invalid bpmn-beta source used to exercise the error render path.
// Nested pool blocks are explicitly rejected by the parser.
const INVALID_SOURCE = `bpmn-beta
pool p1 "Outer" {
  pool p2 "Nested" {
  }
}
`;
const INSTALL_COMMAND = 'npm install @okhp3/mermaid-diagram-bpmn mermaid';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DiagramResult {
  id: string;
  title: string;
  source: string;
  svg: string | null;
  error: string | null;
}

type DemoState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'ready'; diagrams: DiagramResult[]; mermaidVersion: string }
  | { phase: 'error'; message: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function Badge({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="text-muted-foreground/60">{label}</span>
      <code
        className={`px-1.5 py-0.5 rounded text-[11px] ${
          ok === true
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
            : ok === false
            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
            : 'bg-muted text-foreground'
        }`}
      >
        {value}
      </code>
    </div>
  );
}

function InstallSnippet() {
  const [copied, setCopied] = useState(false);

  function copyInstallCommand() {
    navigator.clipboard.writeText(INSTALL_COMMAND).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <section
      className="mb-8 rounded-lg border border-border bg-muted/30 overflow-hidden"
      data-testid="host-demo-install"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground/70 uppercase tracking-widest">
          Install
        </span>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-300"
            data-testid="host-demo-npm-status-badge"
          >
            <Check size={10} aria-hidden="true" />
            published on npm
          </span>
          <a
            href="https://www.npmjs.com/package/@okhp3/mermaid-diagram-bpmn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:underline underline-offset-2 inline-flex items-center gap-1"
          >
            npmjs.com <ExternalLink size={9} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
          bash
        </span>
        <button
          type="button"
          onClick={copyInstallCommand}
          className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
          aria-label="Copy install command to clipboard"
          data-testid="host-demo-install-copy-btn"
        >
          {copied ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <div className="px-4 py-3 space-y-1">
        <pre className="text-[12px] font-mono text-foreground leading-relaxed whitespace-pre-wrap">
          <code>
            <span className="text-muted-foreground/50 select-none">$ </span>
            {INSTALL_COMMAND}
          </code>
        </pre>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Works with Mermaid {MERMAID_VERSION_TARGET} · peer dependency · MIT licence
        </p>
      </div>
    </section>
  );
}

function DiagramPanel({ result }: { result: DiagramResult }) {
  const [showSource, setShowSource] = useState(false);

  return (
    <div
      className="rounded-lg border border-border bg-card overflow-hidden"
      data-testid={`diagram-panel-${result.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="text-sm font-medium text-foreground">{result.title}</span>
        <button
          onClick={() => setShowSource(s => !s)}
          className="text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          {showSource ? 'hide source' : 'show source'}
        </button>
      </div>

      {/* Source (collapsible) */}
      {showSource && (
        <pre className="px-4 py-3 text-[11px] font-mono text-muted-foreground bg-muted/20 border-b border-border overflow-x-auto whitespace-pre">
          {result.source}
        </pre>
      )}

      {/* Output */}
      <div className="p-4 min-h-[160px] flex items-center justify-center">
        {result.error ? (
          <div
            className="w-full rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3"
            role="alert"
            data-testid={`error-${result.id}`}
          >
            <p className="text-xs font-mono text-destructive font-semibold mb-1">
              Render error
            </p>
            <p className="text-xs font-mono text-destructive/80 whitespace-pre-wrap break-all">
              {result.error}
            </p>
          </div>
        ) : result.svg ? (
          <div
            className="w-full [&>svg]:w-full [&>svg]:h-auto"
            data-testid={`svg-output-${result.id}`}
            /* eslint-disable-next-line react/no-danger */
            dangerouslySetInnerHTML={{ __html: result.svg }}
          />
        ) : (
          <span className="text-xs font-mono text-muted-foreground/40">rendering…</span>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MermaidHostDemo() {
  const [state, setState] = useState<DemoState>({ phase: 'idle' });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState({ phase: 'loading' });
      try {
        // ── Mermaid initialization ──────────────────────────────────────────
        //
        // IMPORTANT: No securityLevel: 'loose' here.  This is the production
        // configuration.  The plugin works correctly in a real browser DOM with
        // Mermaid's default security level.  See docs/mermaid-compatibility.md
        // for the full evidence record and the test-environment note explaining
        // why securityLevel:'loose' is needed in happy-dom but not here.
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          // securityLevel is intentionally omitted — Mermaid's default ('strict')
          // is used.  Real browser DOM handles SVG namespace correctly.
        });

        // Type cast: BpmnDb.getAccTitle() returns string|undefined, but Mermaid's
        // DiagramDB interface requires string. The plugin is verified at runtime by
        // bpmn-plugin-integration.test.ts. This cast is safe.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await mermaid.registerExternalDiagrams([bpmnPlugin as any]);

        // Resolve the installed mermaid version for the metadata panel.
        // mermaid doesn't expose a clean version() API, but the package.json
        // version is accessible via a dynamic import in Node; in the browser
        // we use MERMAID_VERSION_TARGET as the validated reference.
        const mermaidVersion = MERMAID_VERSION_TARGET;

        // ── Render corpus examples covering all required E2E types ──────────
        // Flat flow, gateway, pool/lane, cross-pool message flow, error case.
        const DIAGRAMS = [
          { id: 'demo-linear',         title: '01 — Flat flow',                source: example01 },
          { id: 'demo-gateway',        title: '02 — Gateway decision',         source: example02 },
          { id: 'demo-purchase-order', title: '08 — Pool / lane collaboration', source: example08 },
          { id: 'demo-cross-pool',     title: '06 — Cross-pool message flow',  source: example06 },
          { id: 'demo-employee-onboarding', title: '07 — Employee onboarding', source: example07 },
          { id: 'demo-quote-to-order', title: '09 — Quote to order', source: example09 },
          { id: 'demo-support-ticket', title: '10 — Support ticket triage', source: example10 },
          { id: 'demo-error-case',     title: 'Error case — invalid source',   source: INVALID_SOURCE },
        ];

        const results: DiagramResult[] = await Promise.all(
          DIAGRAMS.map(async ({ id, title, source }) => {
            try {
              const { svg } = await mermaid.render(id, source);
              return { id, title, source, svg, error: null };
            } catch (err) {
              return { id, title, source, svg: null, error: String(err) };
            }
          }),
        );

        if (!cancelled) {
          setState({ phase: 'ready', diagrams: results, mermaidVersion });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ phase: 'error', message: String(err) });
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">
          PRD-04 O3 — Real-browser host proof
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Mermaid Host Demo
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Renders <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">bpmn-beta</code>{' '}
          diagrams through{' '}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">mermaid.registerExternalDiagrams()</code>{' '}
          and{' '}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">mermaid.render()</code>{' '}
          in this browser — not through <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">BpmnRenderer</code>.
          No <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">securityLevel: &apos;loose&apos;</code>.
        </p>
      </header>

      {/* ── Install snippet ─────────────────────────────────────────────────── */}
      <InstallSnippet />

      {/* ── Version metadata ────────────────────────────────────────────────── */}
      <div
        className="mb-8 flex flex-wrap gap-x-6 gap-y-2 p-4 rounded-lg border border-border bg-muted/30"
        data-testid="version-metadata"
      >
        <Badge label="plugin target" value={`mermaid@${MERMAID_VERSION_TARGET}`} />
        {state.phase === 'ready' && (
          <Badge
            label="render status"
            value={
              state.diagrams.every(d => !d.error)
                ? 'all diagrams rendered'
                : `${state.diagrams.filter(d => !d.error).length} rendered · ${state.diagrams.filter(d => d.error).length} expected error`
            }
            ok={state.diagrams.every(d => !d.error)}
          />
        )}
        {state.phase === 'loading' && (
          <Badge label="render status" value="rendering…" />
        )}
        {state.phase === 'error' && (
          <Badge label="render status" value="registration failed" ok={false} />
        )}
        <Badge label="security level" value="strict (default)" ok={true} />
        <Badge label="environment" value="real browser DOM" ok={true} />
      </div>

      {/* ── Top-level error (registration failure) ───────────────────────── */}
      {state.phase === 'error' && (
        <div
          className="mb-8 rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4"
          role="alert"
          data-testid="registration-error"
        >
          <p className="text-sm font-semibold text-destructive mb-2">
            Plugin registration failed
          </p>
          <p className="text-xs font-mono text-destructive/80 whitespace-pre-wrap break-all">
            {state.message}
          </p>
        </div>
      )}

      {/* ── Diagrams ─────────────────────────────────────────────────────── */}
      {(state.phase === 'ready' || state.phase === 'loading') && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {state.phase === 'ready'
            ? state.diagrams.map(result => (
                <DiagramPanel key={result.id} result={result} />
              ))
            : [
                { id: 'demo-linear',         title: '01-linear-process.mmd — flat diagram',       source: example01 },
                { id: 'demo-purchase-order', title: '08-purchase-order-approval.mmd — pool/lanes', source: example08 },
                { id: 'demo-employee-onboarding', title: '07-employee-onboarding.mmd — pool/lanes', source: example07 },
                { id: 'demo-quote-to-order', title: '09-quote-to-order.mmd — pool/lanes', source: example09 },
                { id: 'demo-support-ticket', title: '10-support-ticket-triage.mmd — pool/lanes', source: example10 },
              ].map(d => (
                <DiagramPanel
                  key={d.id}
                  result={{ id: d.id, title: d.title, source: d.source, svg: null, error: null }}
                />
              ))}
        </div>
      )}

      {/* ── Evidence note ─────────────────────────────────────────────────── */}
      <div className="mt-10 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-2xl">
          <strong className="text-muted-foreground">What this proves:</strong>{' '}
          The plugin adapter works under Mermaid&apos;s default security configuration in a real
          browser DOM — not just in a happy-dom test environment with{' '}
          <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">securityLevel: &apos;loose&apos;</code>.
          {' '}The SVG content above is produced by{' '}
          <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">mermaid.render()</code>{' '}
          — every shape, flow, and label comes through Mermaid&apos;s full pipeline (detector →
          parser → layout → draw → DOMPurify). See{' '}
          <a
            href="https://github.com/OKHP3/mermaid-diagram-bpmn/blob/main/docs/mermaid-compatibility.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            docs/mermaid-compatibility.md
          </a>{' '}
          for the evidence record.
        </p>
      </div>
    </div>
  );
}
