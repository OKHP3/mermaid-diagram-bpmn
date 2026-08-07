import { useState, useRef, useEffect, useCallback } from "react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { BPMN_EXAMPLES, DEFAULT_EXAMPLE_ID } from "@/lib/bpmn-examples";
import {
  AlertCircle,
  FlaskConical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { parse } from "@/lib/bpmn-parser";
import { StatusRibbon } from "@/components/StatusRibbon";

const MIN_SCALE = 0.15;
const MAX_SCALE = 8;

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

/** Derive a safe filename slug from an example name or fall back to "diagram". */
function toFilenameSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "diagram";
}

export default function Playground() {
  const defaultExample = BPMN_EXAMPLES.find(e => e.id === DEFAULT_EXAMPLE_ID) || BPMN_EXAMPLES[0];
  const [source, setSource] = useState(defaultExample.source);
  const [activeExample, setActiveExample] = useState<string | null>(defaultExample.id);

  // copy state: 'idle' | 'copied' | 'error'
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // download feedback state: 'idle' | 'empty'
  const [downloadState, setDownloadState] = useState<"idle" | "empty">("idle");
  const downloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parseError = getParseError(source);
  const activeExampleDef = BPMN_EXAMPLES.find(e => e.id === activeExample);

  // ── Pan / zoom state ────────────────────────────────────────────────────────
  const [viewState, setViewState] = useState({ scale: 1, tx: 0, ty: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  // Wheel zoom — must be non-passive to call preventDefault
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setViewState(vs => {
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, vs.scale * factor));
        const ratio = newScale / vs.scale;
        return { scale: newScale, tx: mx + ratio * (vs.tx - mx), ty: my + ratio * (vs.ty - my) };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (downloadTimeoutRef.current) clearTimeout(downloadTimeoutRef.current);
    };
  }, []);

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragRef.current = { mx: e.clientX, my: e.clientY, tx: viewState.tx, ty: viewState.ty };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const { mx, my, tx: originTx, ty: originTy } = dragRef.current;
    const dx = e.clientX - mx;
    const dy = e.clientY - my;
    setViewState(vs => ({ ...vs, tx: originTx + dx, ty: originTy + dy }));
  }

  function handlePanEnd() {
    setIsDragging(false);
    dragRef.current = null;
  }

  // Zoom buttons — centered on the viewport midpoint
  const zoomStep = useCallback((factor: number) => {
    const el = canvasRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const cx = width / 2;
    const cy = height / 2;
    setViewState(vs => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, vs.scale * factor));
      const ratio = newScale / vs.scale;
      return { scale: newScale, tx: cx + ratio * (vs.tx - cx), ty: cy + ratio * (vs.ty - cy) };
    });
  }, []);

  function resetView() {
    setViewState({ scale: 1, tx: 0, ty: 0 });
  }

  // ── Example / source handlers ───────────────────────────────────────────────
  function selectExample(id: string) {
    const ex = BPMN_EXAMPLES.find(e => e.id === id);
    if (ex) {
      setSource(ex.source);
      setActiveExample(ex.id);
      resetView();
    }
  }

  function handleSourceChange(val: string) {
    setSource(val);
    setActiveExample(null);
  }

  // ── Copy / Download handlers ────────────────────────────────────────────────

  async function handleCopy() {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);

    if (!source.trim()) {
      setCopyState("error");
      copyTimeoutRef.current = setTimeout(() => setCopyState("idle"), 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(source);
      setCopyState("copied");
      copyTimeoutRef.current = setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      copyTimeoutRef.current = setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  function handleDownload() {
    if (downloadTimeoutRef.current) clearTimeout(downloadTimeoutRef.current);
    if (!source.trim()) {
      setDownloadState("empty");
      downloadTimeoutRef.current = setTimeout(() => setDownloadState("idle"), 2000);
      return;
    }
    const slug = activeExampleDef ? toFilenameSlug(activeExampleDef.name) : "diagram";
    const filename = `${slug}.mmd`;
    const blob = new Blob([source], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const copyLabel =
    copyState === "copied" ? "Copied!" : copyState === "error" ? "Failed" : "Copy";
  const copyAriaLabel =
    copyState === "copied"
      ? "Copied to clipboard"
      : copyState === "error"
        ? "Copy failed — clipboard access denied or source is empty"
        : "Copy source to clipboard";

  return (
    <div className="flex flex-col flex-1 h-full">

      {/* Status ribbon */}
      <StatusRibbon />

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
              className={`${activeExample === ex.id ? "forge-tab-active" : "forge-tab"} flex items-center gap-1.5`}
              data-testid={`button-example-${ex.id}`}
            >
              {ex.name}
              {ex.experimental && (
                <FlaskConical size={9} className={activeExample === ex.id ? "opacity-80" : "text-amber-500"} aria-label="Experimental" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Experimental notice */}
      {activeExampleDef?.experimental && (
        <div
          className="px-4 sm:px-6 py-2 flex items-center gap-2 text-xs forge-experimental-notice"
        >
          <FlaskConical size={11} className="text-amber-600 shrink-0" />
          <span className="text-foreground/80">
            <span className="font-semibold text-foreground">Experimental support.</span>
            {" "}Pools and lanes render with known layout limitations — cross-lane flow ordering and message flow routing are approximate.
          </span>
        </div>
      )}

      {/* Two-panel workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 max-w-7xl mx-auto w-full">

        {/* Source panel */}
        <div
          className="flex flex-col md:w-1/2 border-b md:border-b-0 md:border-r min-h-[280px] md:min-h-0 border-[var(--okh-header-border)]"
        >
          {/* Source panel toolbar */}
          <div className="forge-code-panel-tab flex items-center gap-2 px-4 py-2 border-b">
            <span className="text-xs font-mono shrink-0">source.bpmn-beta</span>

            {/* Accessible live region for copy state announcements */}
            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
              data-testid="copy-live-region"
            >
              {copyState === "copied"
                ? "Source copied to clipboard"
                : copyState === "error"
                  ? "Copy failed. Clipboard access denied or source is empty."
                  : ""}
            </span>

            <div className="ml-auto flex items-center gap-1">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                aria-label={copyAriaLabel}
                data-testid="button-copy-source"
                title="Copy source to clipboard"
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  copyState === "copied"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : copyState === "error"
                      ? "text-red-500 dark:text-red-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                {copyState === "copied" ? <Check size={11} /> : <Copy size={11} />}
                <span>{copyLabel}</span>
              </button>

              {/* Download button */}
              <button
                onClick={handleDownload}
                aria-label={
                  downloadState === "empty"
                    ? "Nothing to download — source is empty"
                    : "Download source as .mmd file"
                }
                data-testid="button-download-mmd"
                title="Download as .mmd file"
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  downloadState === "empty"
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Download size={11} />
                <span>{downloadState === "empty" ? "Empty" : ".mmd"}</span>
              </button>

              {/* Parse error badge */}
              {parseError && (
                <span
                  className="flex items-center gap-1 text-xs forge-parse-error-text"
                  data-testid="text-parse-error"
                >
                  <AlertCircle size={11} />
                  Parse error
                </span>
              )}
            </div>
          </div>

          <textarea
            className="flex-1 p-4 text-sm resize-none focus-visible:outline-none leading-relaxed code-area forge-code-panel"
            value={source}
            onChange={e => handleSourceChange(e.target.value)}
            spellCheck={false}
            aria-label="bpmn-beta source code editor"
            data-testid="textarea-bpmn-source"
          />
          {parseError && (
            <div
              className="px-4 py-2 border-t text-xs font-mono forge-parse-error-bar"
              data-testid="text-parse-error-detail"
            >
              {parseError}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="flex flex-col md:w-1/2 min-h-[320px] md:min-h-0 bg-card">

          {/* Preview toolbar */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/30 shrink-0">
            <span className="forge-eyebrow">Diagram preview</span>
            {activeExampleDef?.experimental && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <FlaskConical size={9} />
                Experimental
              </span>
            )}

            {/* Zoom controls */}
            <div className="ml-auto flex items-center gap-0.5">
              <span className="text-xs text-muted-foreground font-mono tabular-nums w-10 text-right mr-1">
                {Math.round(viewState.scale * 100)}%
              </span>
              <button
                onClick={() => zoomStep(1 / 1.2)}
                title="Zoom out (scroll wheel)"
                aria-label="Zoom out"
                className="p-1.5 rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ZoomOut size={13} />
              </button>
              <button
                onClick={resetView}
                title="Reset view"
                aria-label="Reset view"
                className="p-1.5 rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Maximize2 size={13} />
              </button>
              <button
                onClick={() => zoomStep(1.2)}
                title="Zoom in (scroll wheel)"
                aria-label="Zoom in"
                className="p-1.5 rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>

          {/* Pan / zoom canvas */}
          <div
            ref={canvasRef}
            className="flex-1 diagram-grid overflow-hidden relative select-none"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            data-testid="div-diagram-preview"
          >
            <div
              style={{
                transform: `translate(${viewState.tx}px, ${viewState.ty}px) scale(${viewState.scale})`,
                transformOrigin: "0 0",
                width: "100%",
                height: "100%",
              }}
            >
              <BpmnRenderer source={source} />
            </div>

            {/* Hint — visible only at default zoom */}
            {viewState.scale === 1 && viewState.tx === 0 && viewState.ty === 0 && (
              <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/40 font-mono pointer-events-none select-none">
                scroll to zoom · drag to pan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer note */}
      {activeExampleDef && (
        <div className="border-t border-border px-4 sm:px-6 py-3 bg-card/70">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{activeExampleDef.name}</span>
              {" — "}
              {activeExampleDef.description}
              {activeExampleDef.experimental && (
                <span className="ml-2 text-amber-600 font-medium">· Experimental support — layout approximations apply.</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
