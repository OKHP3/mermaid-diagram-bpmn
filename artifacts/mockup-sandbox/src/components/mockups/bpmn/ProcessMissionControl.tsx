import { useState } from "react";
import "./process-mission-control.css";

type Step = {
  id: string;
  label: string;
  detail: string;
  state: "done" | "active" | "queued";
  owner: string;
};

const steps: Step[] = [
  { id: "01", label: "Receive request", detail: "Order enters the approval lane", state: "done", owner: "Intake" },
  { id: "02", label: "Check amount", detail: "Route by the purchase threshold", state: "active", owner: "Finance" },
  { id: "03", label: "Manager review", detail: "A human confirms the exception", state: "queued", owner: "Manager" },
  { id: "04", label: "Issue purchase order", detail: "Send the approved order downstream", state: "queued", owner: "Procurement" },
];

function Arrow() {
  return (
    <svg className="pmc-arrow" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h10M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProcessMissionControl() {
  const [selected, setSelected] = useState("02");
  const [mode, setMode] = useState<"trace" | "source">("trace");
  const [ran, setRan] = useState(false);
  const current = steps.find((step) => step.id === selected) ?? steps[1];

  return (
    <main className="pmc-shell">
      <header className="pmc-topbar">
        <div className="pmc-brand">
          <span className="pmc-mark" aria-hidden="true"><span /><span /><span /></span>
          <div>
            <p className="pmc-kicker">BPMN FOR MERMAID <b>beta</b></p>
            <p className="pmc-title">Process Mission Control</p>
          </div>
        </div>
        <div className="pmc-top-actions">
          <span className="pmc-status"><i /> parser ready</span>
          <button className="pmc-quiet-button" onClick={() => setMode(mode === "trace" ? "source" : "trace")}>
            {mode === "trace" ? "View source" : "View trace"}
          </button>
          <button className="pmc-run-button" onClick={() => setRan(true)}>
            {ran ? "Run complete" : "Run simulation"} <Arrow />
          </button>
        </div>
      </header>

      <section className="pmc-intro">
        <div>
          <p className="pmc-eyebrow">Workspace / purchase operations / live draft</p>
          <h1>Purchase approval <em>in motion.</em></h1>
          <p className="pmc-deck">A scenario-first way to inspect BPMN: follow the work as it moves, then open the syntax only when you need to edit it.</p>
        </div>
        <div className="pmc-health">
          <span>Last checked</span><strong>just now</strong>
          <div className="pmc-health-bar"><i /></div>
          <small>4 steps · 1 gateway · 0 errors</small>
        </div>
      </section>

      <div className="pmc-workspace">
        <aside className="pmc-rail" aria-label="Saved scenarios">
          <div className="pmc-rail-heading"><span>Scenarios</span><button aria-label="Add scenario" onClick={() => setRan(false)}>+</button></div>
          <button className="pmc-scenario pmc-scenario-active" onClick={() => setSelected("02")}>
            <span className="pmc-scenario-icon">PO</span><span><b>Purchase approval</b><small>edited 8 min ago</small></span><strong>4</strong>
          </button>
          <button className="pmc-scenario" onClick={() => setSelected("01")}>
            <span className="pmc-scenario-icon muted">ON</span><span><b>Employee onboarding</b><small>edited yesterday</small></span><strong>7</strong>
          </button>
          <button className="pmc-scenario" onClick={() => setSelected("03")}>
            <span className="pmc-scenario-icon muted">ST</span><span><b>Support triage</b><small>edited 3 days ago</small></span><strong>6</strong>
          </button>
          <div className="pmc-rail-bottom"><span className="pmc-avatar">MC</span><span><b>My workspace</b><small>3 collaborators</small></span><button aria-label="Workspace menu">•••</button></div>
        </aside>

        <section className="pmc-main-panel">
          <div className="pmc-panel-header">
            <div><span className="pmc-live-dot" /> <b>Execution trace</b><span className="pmc-tag">DRAFT</span></div>
            <button className="pmc-more" aria-label="More options">•••</button>
          </div>
          <div className="pmc-trace">
            {steps.map((step, index) => (
              <div key={step.id} className={`pmc-step-wrap ${selected === step.id ? "is-selected" : ""}`}>
                <button className={`pmc-step pmc-step-${step.state}`} onClick={() => setSelected(step.id)} aria-pressed={selected === step.id}>
                  <span className="pmc-step-number">{step.state === "done" ? "✓" : step.id}</span>
                  <span className="pmc-step-copy"><b>{step.label}</b><small>{step.detail}</small></span>
                  <span className="pmc-step-owner">{step.owner}</span>
                  <Arrow />
                </button>
                {index < steps.length - 1 && <div className={`pmc-connector ${index === 0 ? "complete" : ""}`}><span /></div>}
              </div>
            ))}
          </div>
          <div className="pmc-gateway">
            <span className="pmc-gateway-shape">×</span><div><b>Amount &gt; $5,000?</b><small>Exclusive gateway · routes to manager review</small></div><span className="pmc-gateway-route">yes <Arrow /></span>
          </div>
          <div className="pmc-bottom-note"><span className="pmc-pulse" /> Select a step to inspect its inputs, owner, and Mermaid mapping.</div>
        </section>

        <aside className="pmc-inspector">
          <div className="pmc-inspector-top"><span className="pmc-eyebrow">Selected step</span><span className="pmc-mini-dot" /></div>
          <div className="pmc-inspector-heading"><span className="pmc-large-number">{current.id}</span><div><h2>{current.label}</h2><p>{current.owner} lane</p></div></div>
          <div className="pmc-divider" />
          <label>Purpose</label><p className="pmc-inspector-copy">{current.detail}. This activity keeps the process legible for the person who needs to act next.</p>
          <label>Mermaid mapping</label>
          <div className="pmc-code"><span className="pmc-code-key">activity</span> {current.id}<br /><span className="pmc-code-string">"{current.label}"</span><br /><span className="pmc-code-muted">→ {current.owner.toLowerCase()}</span></div>
          <label>Inputs</label><div className="pmc-chips"><span>purchase_request</span><span>amount</span><span>requester</span></div>
          <button className="pmc-inspector-button" onClick={() => setMode("source")}>Open in editor <Arrow /></button>
        </aside>
      </div>
      <footer className="pmc-footer"><span><b>⌘ K</b> command menu</span><span>autosaved <i /></span><span>Made for clear handoffs</span></footer>
    </main>
  );
}

export default ProcessMissionControl;