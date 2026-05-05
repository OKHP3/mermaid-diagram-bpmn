import { useState } from "react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { BPMN_EXAMPLES, DEFAULT_EXAMPLE_ID } from "@/lib/bpmn-examples";
import { AlertCircle } from "lucide-react";
import { parseBpmn } from "@/lib/bpmn-parser";

function getParseError(source: string): string | null {
  try {
    const g = parseBpmn(source);
    if (g.nodes.length === 0 && source.trim().length > 10) {
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
    if (ex) {
      setSource(ex.source);
      setActiveExample(id);
    }
  }

  function handleSourceChange(val: string) {
    setSource(val);
    setActiveExample(null);
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-lg font-semibold text-foreground" data-testid="heading-playground">
            bpmn-beta Playground
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Write bpmn-beta DSL source on the left. The diagram renders live on the right.
            This is a minimal proof-of-concept renderer — no external BPMN library.
          </p>
        </div>
      </div>

      {/* Example selector */}
      <div className="border-b border-border px-4 sm:px-6 py-2 bg-muted/30">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-mono mr-1 shrink-0">Examples:</span>
          {BPMN_EXAMPLES.map(ex => (
            <button
              key={ex.id}
              onClick={() => selectExample(ex.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeExample === ex.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
              data-testid={`button-example-${ex.id}`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 max-w-7xl mx-auto w-full">
        {/* Source panel */}
        <div className="flex flex-col md:w-1/2 border-b md:border-b-0 md:border-r border-border min-h-[280px] md:min-h-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-mono text-muted-foreground">source.bpmn-beta</span>
            {parseError && (
              <span className="flex items-center gap-1 text-xs text-destructive" data-testid="text-parse-error">
                <AlertCircle size={11} />
                Parse error
              </span>
            )}
          </div>
          <textarea
            className="flex-1 p-4 bg-card text-foreground font-mono text-xs resize-none focus:outline-none leading-relaxed code-area"
            value={source}
            onChange={e => handleSourceChange(e.target.value)}
            spellCheck={false}
            aria-label="bpmn-beta source code editor"
            data-testid="textarea-bpmn-source"
          />
          {parseError && (
            <div className="px-4 py-2 border-t border-destructive/30 bg-destructive/5 text-xs text-destructive font-mono" data-testid="text-parse-error-detail">
              {parseError}
            </div>
          )}
        </div>

        {/* Renderer panel */}
        <div className="flex flex-col md:w-1/2 min-h-[320px] md:min-h-0">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-mono text-muted-foreground">diagram preview</span>
            <span className="ml-auto text-xs text-muted-foreground/60">proof-of-concept renderer · no bpmn-js</span>
          </div>
          <div className="flex-1 diagram-grid overflow-hidden" data-testid="div-diagram-preview">
            <BpmnRenderer source={source} />
          </div>
        </div>
      </div>

      {/* Footer note */}
      {activeExample && (
        <div className="border-t border-border px-4 sm:px-6 py-3 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
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
