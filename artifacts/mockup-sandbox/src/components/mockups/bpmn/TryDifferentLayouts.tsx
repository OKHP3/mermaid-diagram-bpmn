import { useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FlaskConical,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";
import "./TryDifferentLayouts.css";

const EXAMPLES = [
  { id: "purchase", label: "Purchase approval", meta: "6 nodes · 2 gateways" },
  { id: "onboarding", label: "Employee onboarding", meta: "11 nodes · 3 lanes" },
  { id: "support", label: "Support triage", meta: "8 nodes · 1 gateway" },
];

const SOURCE = `bpmn-beta
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
t3 ==> e2`;

function Node({
  className,
  title,
  subtitle,
  accent,
}: {
  className?: string;
  title: string;
  subtitle?: string;
  accent?: "rust" | "teal" | "amber" | "slate";
}) {
  return (
    <div className={`diagram-node ${accent ?? "slate"} ${className ?? ""}`}>
      <span className="node-kicker">{subtitle}</span>
      <span className="node-title">{title}</span>
    </div>
  );
}

export function TryDifferentLayouts() {
  const [activeExample, setActiveExample] = useState("purchase");
  const [activeSection, setActiveSection] = useState("Playground");
  const [source, setSource] = useState(SOURCE);
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleCopy() {
    setCopied(true);
    if (navigator.clipboard) navigator.clipboard.writeText(source).catch(() => undefined);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="layout-variant">
      <header className="variant-header">
        <div className="variant-brand">
          <div className="brand-mark">B</div>
          <div>
            <div className="brand-name">BPMN for Mermaid</div>
            <code>bpmn-beta</code>
          </div>
        </div>
        <nav className="variant-nav" aria-label="Primary navigation">
          {["Playground", "Agent Skills", "Plugin", "Learn"].map((item) => (
            <button key={item} className={activeSection === item ? "nav-active" : ""} type="button" onClick={() => setActiveSection(item)}>{item}</button>
          ))}
        </nav>
        <div className="header-tools">
          <span className="beta-badge"><span /> contributor prototype</span>
          <button type="button" aria-label="Reset layout" onClick={() => setZoom(100)}><RotateCcw size={15} /></button>
        </div>
      </header>

      <main className="variant-main">
        <div className="workspace-intro">
          <div>
            <p className="eyebrow">Text-first process modeling</p>
            <h1>Build the diagram, then read the shape.</h1>
            <p className="intro-copy">A deliberately stacked workbench keeps source, diagnostics, and the rendered process in one focused reading order.</p>
          </div>
          <div className="intro-status"><span className="status-dot" /> live renderer <span className="status-divider" /> no bpmn-js</div>
        </div>

        <section className="example-strip" aria-label="Choose an example">
          <div className="strip-label">Examples</div>
          {EXAMPLES.map((example) => (
            <button
              key={example.id}
              type="button"
              className={activeExample === example.id ? "example-chip active" : "example-chip"}
              onClick={() => setActiveExample(example.id)}
            >
              <span>{example.label}</span>
              <small>{example.meta}</small>
              {example.id === "onboarding" && <FlaskConical size={12} />}
            </button>
          ))}
          <button type="button" className="new-example" onClick={() => { setActiveExample("purchase"); setSource(""); }}><Plus size={14} /> New diagram</button>
        </section>

        <section className="editor-stage">
          <div className="source-column">
            <div className="panel-heading dark-heading">
              <div>
                <span className="file-dot" />
                <span className="file-name">approval.bpmn-beta</span>
                <span className="file-state">edited</span>
              </div>
              <div className="panel-actions">
                <button type="button" onClick={handleCopy}><Copy size={13} /> {copied ? "Copied" : "Copy"}</button>
                <button type="button" onClick={() => setSource(SOURCE)}><RotateCcw size={13} /> Reset</button>
              </div>
            </div>
            <div className="editor-wrap">
              <div className="line-numbers" aria-hidden="true">{source.split("\n").map((_, i) => <span key={i}>{String(i + 1).padStart(2, "0")}</span>)}</div>
              <textarea
                value={source}
                onChange={(event) => setSource(event.target.value)}
                spellCheck={false}
                aria-label="bpmn-beta source code editor"
              />
            </div>
            <div className="diagnostic-bar"><span className="diagnostic-check"><Check size={12} /></span><strong>Diagram valid</strong><span>7 nodes · 6 flows</span><span className="diagnostic-spacer" /><span className="mono">last rendered just now</span></div>
          </div>

          <div className="preview-column">
            <div className="panel-heading">
              <div><span className="preview-label">Diagram preview</span><span className="render-badge">SVG</span></div>
              <div className="panel-actions dark-actions">
                <button type="button" onClick={() => setSaved(true)}><Download size={13} /> {saved ? "Saved" : "Export"}</button>
                <button type="button" onClick={handleSave}><Share2 size={13} /> Share</button>
              </div>
            </div>
            <div className="diagram-canvas">
              <div className="canvas-legend"><Sparkles size={13} /> semantic preview</div>
              <div className="diagram-art" style={{ transform: `scale(${zoom / 100})` }}>
                <Node className="start-node" title="Request Raised" subtitle="start event" accent="teal" />
                <div className="connector c1" /><Node className="review-node" title="Review Request" subtitle="user task" accent="slate" />
                <div className="connector c2" /><div className="gateway-node"><span>Approved?</span></div>
                <div className="connector c3" /><Node className="issue-node" title="Issue Purchase Order" subtitle="service task" accent="rust" />
                <div className="connector c4" /><Node className="reject-node" title="Notify Rejection" subtitle="user task" accent="amber" />
                <div className="connector c5" /><Node className="end-node" title="Order Issued" subtitle="end event" accent="teal" />
                <div className="connector c6" /><Node className="end-reject-node" title="Rejected" subtitle="end event" accent="amber" />
                <span className="flow-label yes">yes</span><span className="flow-label no">no</span>
              </div>
              <div className="canvas-hint">drag to pan · scroll to zoom</div>
            </div>
            <div className="preview-footer"><span><span className="mini-dot teal" /> start / end event</span><span><span className="mini-dot rust" /> service task</span><span><span className="mini-dot amber" /> alternate path</span><span className="zoom-control"><button type="button" onClick={() => setZoom(Math.max(75, zoom - 10))} aria-label="Zoom out"><Minus size={13} /></button><span>{zoom}%</span><button type="button" onClick={() => setZoom(Math.min(130, zoom + 10))} aria-label="Zoom in"><Plus size={13} /></button><button type="button" onClick={() => setZoom(100)} aria-label="Reset zoom"><Maximize2 size={13} /></button></span></div>
          </div>
        </section>
      </main>
      <footer className="variant-footer"><span><strong>BPMN for Mermaid</strong> · standards-aware, Git-native diagrams</span><span>Prototype status <span className="footer-status">●</span></span></footer>
    </div>
  );
}

export default TryDifferentLayouts;