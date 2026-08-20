import { useState } from "react";
import "./BpmnBlueprintVariant.css";

const cards = [
  ["01", "Write BPMN as text", "A compact language for events, tasks, gateways, pools, and the decisions between them.", "Open playground"],
  ["02", "Keep Mermaid close", "A plugin-shaped path for teams that already think in Markdown and Mermaid diagrams.", "See the plugin"],
  ["03", "Give agents a method", "Portable skills bring process intake, modeling, governance, and handoff into one workflow.", "Browse skills"],
];

export default function BpmnBlueprintVariant() {
  const [active, setActive] = useState("Write BPMN as text");
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const copy = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
  return (
    <div className="bpv-root">
      <header className="bpv-header">
        <div className="bpv-shell bpv-nav">
          <a className="bpv-brand" href="#top"><span className="bpv-mark">β</span><span><strong>BPMN for Mermaid</strong><small>bpmn-beta / field notes</small></span></a>
          <nav className="bpv-links" aria-label="Primary navigation"><a href="#paths">Paths</a><a href="#context">The case</a><a href="#support">Support</a><button onClick={() => setShowMore(v => !v)} aria-expanded={showMore}>More {showMore ? "−" : "+"}</button></nav>
          <div className="bpv-tools"><button className="bpv-tool" onClick={copy} aria-label="Copy project slug">{copied ? "✓" : "↗"}</button><button className="bpv-tool" onClick={() => document.documentElement.classList.toggle("bpv-focus")} aria-label="Toggle focus mode">◐</button></div>
        </div>
      </header>
      <div className="bpv-ribbon"><div className="bpv-shell bpv-ribbon-inner"><span><span className="bpv-live"><i />LIVE BUILD</span> · descriptive subset / v0.3</span><span>last checked 14 feb 2025 · 15 skills indexed</span></div></div>
      <main id="top">
        <section className="bpv-shell bpv-hero">
          <p className="bpv-kicker">A small language for serious processes</p>
          <h1>Process diagrams that belong in the <em>repository.</em></h1>
          <p>BPMN for Mermaid is a text-first workbench for business process diagrams. Author a readable subset, keep the semantics visible, and let the artifact travel with your documentation instead of living in a silo.</p>
          <div className="bpv-actions"><button className="bpv-btn" onClick={() => document.getElementById("paths")?.scrollIntoView({behavior:"smooth"})}>Choose a path →</button><button className="bpv-btn secondary" onClick={copy}>{copied ? "Copied project slug" : "Copy bpmn-beta"}</button></div>
        </section>
        <section id="paths" className="bpv-shell bpv-grid" aria-label="Choose a path">
          {cards.map(([n, title, body, cta]) => <article className="bpv-card" key={title}><span className="bpv-card-index">{n} / 03</span><h2>{title}</h2><p>{body}</p><button onClick={() => setActive(title)}>{active === title ? "Selected ✓" : `${cta} →`}</button></article>)}
        </section>
        <section id="context" className="bpv-divider"><div className="bpv-shell bpv-context"><div><p className="bpv-kicker">The project thesis</p><h2 className="bpv-section-title">Readable is a feature.</h2><p className="bpv-context-copy">Heavy BPMN platforms solve a different problem. This project is for the process diagram that needs to sit beside an ADR, a README, an architecture decision, or an AI-generated draft.</p><div className="bpv-note">“The credible path is a documented descriptive subset — then an upstream proposal once the syntax earns its shape.”</div></div><div className="bpv-code"><div className="bpv-code-head"><span>approval.bpmn-beta</span><button onClick={copy}>{copied ? "copied" : "copy"}</button></div><pre><span className="kw">bpmn-beta</span>{"\n"}accTitle: Purchase Request Approval{"\n"}{"\n"}<span className="kw">start</span> <span className="id">s1</span> <span className="str">"Request raised"</span>{"\n"}<span className="kw">task:user</span> <span className="id">t1</span> <span className="str">"Review request"</span>{"\n"}<span className="kw">xor</span> <span className="id">g1</span> <span className="str">"Approved?"</span>{"\n"}<span className="kw">task:service</span> <span className="id">t2</span> <span className="str">"Issue purchase order"</span>{"\n"}{"\n"}<span className="id">s1</span> --&gt; <span className="id">t1</span>{"\n"}<span className="id">t1</span> --&gt; <span className="id">g1</span>{"\n"}<span className="id">g1</span> --&gt; <span className="id">t2</span>: <span className="str">"yes"</span></pre></div></div></section>
        <section id="support" className="bpv-divider"><div className="bpv-shell bpv-matrix"><div className="bpv-matrix-head"><div><p className="bpv-kicker">Syntax ledger</p><h2 className="bpv-section-title">What works today.</h2></div><p>Small claims, clearly labeled. The workbench distinguishes what is verified from what is still a conversation.</p></div><div className="bpv-matrix-grid">{[["Implemented",["events + activities","sequence flows","pools + lanes"]],["Experimental",["message flows","boundary events","subprocess notation"]],["Deferred",["full XML interchange","execution semantics","DMN integration"]],["Out of scope",["proprietary model files","runtime orchestration","visual modeler"]]].map(([title, items]) => <div className="bpv-matrix-col" key={title}><h3>{title}</h3><ul>{(items as string[]).map(item => <li key={item}>{item}</li>)}</ul></div>)}</div></div></section>
      </main>
      <footer className="bpv-footer"><div className="bpv-shell">OKH Forge / BPMN for Mermaid · text-first, Mermaid-native, Git-friendly.</div></footer>
    </div>
  );
}