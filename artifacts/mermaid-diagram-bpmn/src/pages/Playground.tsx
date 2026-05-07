import { useState } from "react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { BPMN_EXAMPLES, DEFAULT_EXAMPLE_ID } from "@/lib/bpmn-examples";
import { AlertCircle } from "lucide-react";
import { parse } from "@/lib/bpmn-parser";

function getParseError(source: string): string | null {
  try {
    const db = parse(source);
    if (db.getNodes().length === 0 && source.trim().length > 10) {
      return "No nodes found. Check your syntax — each node must be on its own line.";
    }
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

export default function Playground() {
  const defaultExample = BPMN_EXAMPLES.find(e => e.id === DEFAULT_EXAMPLE_ID) || BPMN_EXAMPLES[0];
  const [source, setSource] = useState(defaultExample.source);
  const [activeExample, setActiveExample] = useState<string | null>(defaultExample.id);

  const parseError = getParseError(source);

  function selectExample(id: string) {
    const ex = BPMN_EXAMPLES.find(e => e.id === id);
    if (ex) { setSource(ex.source); setActiveExample(id); }
  }

  function handleSourceChange(val: string) {
    setSource(val);
    setActiveExample(null);
  }

  return (
    <div className="flex flex-col flex-1 h-full">

      {/* Sub-header */}
      <div className="border-b border-border px-4 sm:px-6 py-4 bg-card/70">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-bold text-foreground" data-testid="heading-playground">
              bpmn-beta Playground
            </h1>
            <span className="forge-eyebrow">Proof-of-concept · No bpmn-js</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Write bpmn-beta DSL source on the left — the diagram renders live on the right.
          </p>
        </div>
      </div>

      {/* Example selector */}
      <div className="border-b border-border px-4 sm:px-6 py-2.5 bg-muted/30">
        <div className="max-w-7xl mx-auto forge-tabs">
          <span className="forge-eyebrow mr-1 shrink-0">Examples</span>
          {BPMN_EXAMPLES.map(ex => (
            <button
              key={ex.id}
              onClick={() => selectExample(ex.id)}
              className={activeExample === ex.id ? "forge-tab-active" : "forge-tab"}
              data-testid={`button-example-${ex.id}`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Two-panel workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 max-w-7xl mx-auto w-full">

        {/* Source panel */}
        <div
          className="flex flex-col md:w-1/2 border-b md:border-b-0 md:border-r min-h-[280px] md:min-h-0"
          style={{ borderColor: "#2a3124" }}
        >
          <div className="forge-code-panel-tab flex items-center justify-between px-4 py-2 border-b">
            <span className="text-xs font-mono" style={{ color: "rgba(230, 223, 201, 0.5)" }}>
              source.bpmn-beta
            </span>
            {parseError && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "#e87c5c" }} data-testid="text-parse-error">
                <AlertCircle size={11} />
                Parse error
              </span>
            )}
          </div>
          <textarea
            className="flex-1 p-4 text-sm resize-none focus:outline-none leading-relaxed code-area forge-code-panel"
            value={source}
            onChange={e => handleSourceChange(e.target.value)}
            spellCheck={false}
            aria-label="bpmn-beta source code editor"
            data-testid="textarea-bpmn-source"
          />
          {parseError && (
            <div
              className="px-4 py-2 border-t text-xs font-mono"
              style={{ borderColor: "#4a2018", background: "rgba(196,106,44,0.12)", color: "#e87c5c" }}
              data-testid="text-parse-error-detail"
            >
              {parseError}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="flex flex-col md:w-1/2 min-h-[320px] md:min-h-0 bg-card">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <span className="forge-eyebrow">Diagram preview</span>
            <span className="ml-auto text-xs text-muted-foreground/50 font-mono">bpmn-beta renderer</span>
          </div>
          <div className="flex-1 diagram-grid overflow-hidden" data-testid="div-diagram-preview">
            <BpmnRenderer source={source} />
          </div>
        </div>
      </div>

      {/* Footer note */}
      {activeExample && (
        <div className="border-t border-border px-4 sm:px-6 py-3 bg-card/70">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {BPMN_EXAMPLES.find(e => e.id === activeExample)?.name}
              </span>
              {" — "}
              {BPMN_EXAMPLES.find(e => e.id === activeExample)?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
