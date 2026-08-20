import { useState, useRef, useEffect, useCallback } from "react";
import { BpmnRenderer } from "@/lib/bpmn-renderer";
import { BPMN_EXAMPLES, DEFAULT_EXAMPLE_ID } from "@/lib/bpmn-examples";
import { EXPORT_THEME, getStyles } from "@/lib/bpmn-styles";
import {
  AlertCircle,
  TriangleAlert,
  FlaskConical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  Download,
  FileDown,
  Link,
} from "lucide-react";
import {
  encodeSource,
  isOverLimit,
  parseShareParams,
  SHARE_SOURCE_LIMIT,
} from "@/lib/url-share";
import { parse, ParseError } from "@/lib/bpmn-parser";
import { lint } from "@/lib/bpmn-lint";
import type { LintWarning } from "@/lib/bpmn-lint";
import { validate } from "@/lib/bpmn-validate";
import { trackEvent } from "@/lib/analytics";
import { StatusRibbon } from "@/components/StatusRibbon";

const MIN_SCALE = 0.15;
const MAX_SCALE = 8;
const EDITOR_PADDING_PX = 16;
const EDITOR_LINE_HEIGHT_PX = 23;

interface ErrorInfo {
  /** Human-readable error message; already contains "Line N: " prefix when the
   *  parser knows the offending line. */
  message: string;
  /** 1-based source line number when a `ParseError` carries it; undefined
   *  for non-positional errors (e.g. "no nodes found"). */
  line?: number;
}

function getParseError(source: string): ErrorInfo | null {
  try {
    const db = parse(source);
    if (db.getNodes().length === 0 && source.trim().length > 10) {
      return { message: "No nodes found. Check your syntax — each node must be on its own line." };
    }
    return null;
  } catch (e) {
    if (e instanceof ParseError) {
      return { message: e.message, line: e.line };
    }
    return { message: (e as Error).message };
  }
}

/** Shape shared by lint warnings and validation errors for display purposes. */
interface DiagnosticWarning {
  code: string;
  message: string;
  nodeId?: string;
}

/**
 * Run the domain-rule lint pass and the semantic validation pass and return
 * all advisory diagnostics combined.  Returns an empty array when the source
 * has a hard parse error (errors take priority) or when the source is clean.
 * Never throws.
 */
function getAllWarnings(source: string): DiagnosticWarning[] {
  try {
    const db = parse(source);
    if (db.getNodes().length === 0) return [];
    const lintWarns: LintWarning[] = lint(db);
    const validationErrs = validate(db);
    return [
      ...lintWarns,
      ...validationErrs.map(e => ({ code: e.code, message: e.message, nodeId: e.nodeId })),
    ];
  } catch {
    // Parse error — no warnings shown alongside hard errors.
    return [];
  }
}

/**
 * Read URL search params once at component initialisation and return the
 * intended initial source + activeExample state.  Falls back to the default
 * canonical example when no URL params are present or decoding fails.
 */
function computeInitialState(): { source: string; activeExample: string | null } {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const shared = parseShareParams(search);

  if (shared?.kind === 'source') {
    return { source: shared.source, activeExample: null };
  }
  if (shared?.kind === 'example') {
    const ex = BPMN_EXAMPLES.find(e => e.id === shared.id);
    if (ex) return { source: ex.source, activeExample: ex.id };
  }

  const defaultEx = BPMN_EXAMPLES.find(e => e.id === DEFAULT_EXAMPLE_ID) || BPMN_EXAMPLES[0];
  return { source: defaultEx.source, activeExample: defaultEx.id };
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
  // Initialise from URL params (?src= or ?example=) on first render to avoid a
  // flash of the default content when a shared link is opened.
  const [source, setSource] = useState<string>(() => computeInitialState().source);
  const [activeExample, setActiveExample] = useState<string | null>(() => computeInitialState().activeExample);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const sourceEditorRef = useRef<HTMLTextAreaElement>(null);

  // copy state: 'idle' | 'copied' | 'error'
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // download feedback state: 'idle' | 'empty'
  const [downloadState, setDownloadState] = useState<"idle" | "empty">("idle");
  const downloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SVG export state: 'idle' | 'done'
  const [svgExportState, setSvgExportState] = useState<"idle" | "done">("idle");
  const svgExportTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Share state: 'idle' | 'copied' | 'toolong'
  const [shareState, setShareState] = useState<"idle" | "copied" | "toolong">("idle");
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref for the container holding the rendered BpmnRenderer SVG
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const parseError = getParseError(source);
  // All warnings (lint + semantic validation) are only computed when there is
  // no hard parse error. The parse is pure and sub-millisecond for the diagram
  // sizes the Playground handles, so calling it twice is acceptable.
  const allWarnings = parseError ? [] : getAllWarnings(source);
  const activeExampleDef = BPMN_EXAMPLES.find(e => e.id === activeExample);

  // Position the editor at a parser-reported line without moving keyboard focus.
  // The stripe itself is rendered in a sibling layer and follows textarea scrolling.
  useEffect(() => {
    if (parseError?.line == null) return;

    const editor = sourceEditorRef.current;
    if (!editor) return;

    const lineTop = (parseError.line - 1) * EDITOR_LINE_HEIGHT_PX;
    const targetScrollTop = Math.max(
      0,
      lineTop - (editor.clientHeight - EDITOR_LINE_HEIGHT_PX) / 2,
    );
    editor.scrollTop = targetScrollTop;
    setEditorScrollTop(targetScrollTop);
  }, [parseError?.line]);

  // ── Pan / zoom state ────────────────────────────────────────────────────────
  const [viewState, setViewState] = useState({ scale: 1, tx: 0, ty: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  // Ref kept in sync with viewState on every render — lets native event handlers
  // read current tx/ty without going stale inside a useEffect closure.
  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  // Ref tracking an in-progress touch gesture: single-finger pan or two-finger pinch.
  const touchRef = useRef<
    | {
      kind: "pan";
      cx: number; cy: number;     // touch start position
      startTx: number; startTy: number; // view origin at touch start
    }
    | {
      kind: "pinch";
      midpointX: number; midpointY: number;
      startDistance: number;
      startScale: number;
      startTx: number; startTy: number;
    }
    | null
  >(null);

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

  // Touch gestures — single-finger drag pans; two fingers pinch to zoom about their
  // midpoint. Touchmove is non-passive so gestures do not scroll the page.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const getTouchMidpoint = (first: Touch, second: Touch) => {
      const rect = el.getBoundingClientRect();
      return {
        x: (first.clientX + second.clientX) / 2 - rect.left,
        y: (first.clientY + second.clientY) / 2 - rect.top,
      };
    };

    const getTouchDistance = (first: Touch, second: Touch) =>
      Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchRef.current = {
          kind: "pan",
          cx: t.clientX,
          cy: t.clientY,
          startTx: viewStateRef.current.tx,
          startTy: viewStateRef.current.ty,
        };
      } else if (e.touches.length === 2) {
        const [first, second] = [e.touches[0], e.touches[1]];
        const midpoint = getTouchMidpoint(first, second);
        touchRef.current = {
          kind: "pinch",
          midpointX: midpoint.x,
          midpointY: midpoint.y,
          startDistance: getTouchDistance(first, second),
          startScale: viewStateRef.current.scale,
          startTx: viewStateRef.current.tx,
          startTy: viewStateRef.current.ty,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const gesture = touchRef.current;
      if (!gesture) return;

      if (e.touches.length === 1 && gesture.kind === "pan") {
        e.preventDefault();
        const t = e.touches[0];
        const dx = t.clientX - gesture.cx;
        const dy = t.clientY - gesture.cy;
        setViewState(vs => ({ ...vs, tx: gesture.startTx + dx, ty: gesture.startTy + dy }));
      } else if (e.touches.length === 2 && gesture.kind === "pinch") {
        e.preventDefault();
        const [first, second] = [e.touches[0], e.touches[1]];
        const distance = getTouchDistance(first, second);
        const newScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, gesture.startScale * (distance / gesture.startDistance)),
        );
        const ratio = newScale / gesture.startScale;
        setViewState({
          scale: newScale,
          tx: gesture.midpointX + ratio * (gesture.startTx - gesture.midpointX),
          ty: gesture.midpointY + ratio * (gesture.startTy - gesture.midpointY),
        });
      }
    };

    const onTouchEnd = () => { touchRef.current = null; };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (downloadTimeoutRef.current) clearTimeout(downloadTimeoutRef.current);
      if (svgExportTimeoutRef.current) clearTimeout(svgExportTimeoutRef.current);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
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

  // Keyboard zoom and pan — fires when the canvas has keyboard focus (tabIndex=0).
  //   +  /  =   → zoom in
  //   -         → zoom out
  //   0         → reset view
  //   Arrow keys → pan 40 px in the corresponding direction
  function handleCanvasKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "+":
      case "=":
        e.preventDefault();
        zoomStep(1.2);
        break;
      case "-":
        e.preventDefault();
        zoomStep(1 / 1.2);
        break;
      case "0":
        e.preventDefault();
        resetView();
        break;
      case "ArrowLeft":
        e.preventDefault();
        setViewState(vs => ({ ...vs, tx: vs.tx + 40 }));
        break;
      case "ArrowRight":
        e.preventDefault();
        setViewState(vs => ({ ...vs, tx: vs.tx - 40 }));
        break;
      case "ArrowUp":
        e.preventDefault();
        setViewState(vs => ({ ...vs, ty: vs.ty + 40 }));
        break;
      case "ArrowDown":
        e.preventDefault();
        setViewState(vs => ({ ...vs, ty: vs.ty - 40 }));
        break;
    }
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
      // Keep the address bar shareable: canonical examples use the lightweight
      // ?example=<id> form so the URL remains human-readable.
      const url = new URL(window.location.href);
      url.searchParams.set('example', id);
      url.searchParams.delete('src');
      history.replaceState(null, '', url.toString());
    }
  }

  function handleSourceChange(val: string) {
    setSource(val);
    setActiveExample(null);
    // Clear stale URL params when the user starts editing freely.
    // The Share button builds a fresh ?src= link on demand.
    const url = new URL(window.location.href);
    url.searchParams.delete('example');
    url.searchParams.delete('src');
    history.replaceState(null, '', url.toString());
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

  function handleExportSvg() {
    if (svgExportTimeoutRef.current) clearTimeout(svgExportTimeoutRef.current);
    const svgEl = svgContainerRef.current?.querySelector("svg");
    if (!svgEl) return;

    // Export a copy so the live renderer remains bound to its CSS-variable theme.
    // Vector editors do not resolve those variables, so replace all SVG styles
    // with a concrete light-palette theme before serializing.
    const exportSvg = svgEl.cloneNode(true) as SVGSVGElement;
    exportSvg.querySelectorAll("style").forEach(style => style.remove());
    const svgNamespace = "http://www.w3.org/2000/svg";
    const defs = exportSvg.querySelector("defs")
      ?? document.createElementNS(svgNamespace, "defs");
    if (!defs.parentNode) {
      exportSvg.insertBefore(defs, exportSvg.firstChild);
    }
    const style = document.createElementNS(svgNamespace, "style");
    style.textContent = getStyles(EXPORT_THEME);
    defs.insertBefore(style, defs.firstChild);

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(exportSvg);
    const slug = activeExampleDef ? toFilenameSlug(activeExampleDef.name) : "diagram";
    const filename = `${slug}.svg`;
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSvgExportState("done");
    svgExportTimeoutRef.current = setTimeout(() => setSvgExportState("idle"), 2000);
    trackEvent('playground-export-svg');
  }

  function handleDownload() {
    if (downloadTimeoutRef.current) clearTimeout(downloadTimeoutRef.current);
    if (!source.trim()) {
      setDownloadState("empty");
      downloadTimeoutRef.current = setTimeout(() => setDownloadState("idle"), 2000);
      return;
    }
    let slug = activeExampleDef ? toFilenameSlug(activeExampleDef.name) : "diagram";
    if (!activeExampleDef) {
      try {
        slug = toFilenameSlug(parse(source).getAccTitle() ?? "diagram");
      } catch {
        // A download should remain available while the author is fixing invalid source.
      }
    }
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

  // ── Share handler ────────────────────────────────────────────────────────────
  async function handleShare() {
    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);

    if (isOverLimit(source)) {
      setShareState("toolong");
      shareTimeoutRef.current = setTimeout(() => setShareState("idle"), 3_500);
      return;
    }

    // Build the shareable URL fresh — don't rely on window.location.href being
    // current since handleSourceChange deliberately clears URL params while the
    // user edits.
    const url = new URL(window.location.href);
    if (activeExample) {
      url.searchParams.set('example', activeExample);
      url.searchParams.delete('src');
    } else if (source.trim()) {
      url.searchParams.set('src', encodeSource(source));
      url.searchParams.delete('example');
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      setShareState("copied");
      shareTimeoutRef.current = setTimeout(() => setShareState("idle"), 2_000);
    } catch {
      // Clipboard access denied — silent fallback
      setShareState("idle");
    }
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

              {/* Share button — copies the current URL (with encoded source) to clipboard */}
              <button
                onClick={handleShare}
                aria-label={
                  shareState === "copied"
                    ? "Shareable link copied to clipboard"
                    : shareState === "toolong"
                      ? "Source is too large to share via URL — download the .mmd file instead"
                      : "Copy shareable link to clipboard"
                }
                data-testid="button-share-url"
                title="Copy shareable link"
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  shareState === "copied"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : shareState === "toolong"
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                {shareState === "copied" ? <Check size={11} /> : <Link size={11} />}
                <span>
                  {shareState === "copied"
                    ? "Copied!"
                    : shareState === "toolong"
                      ? "Too long"
                      : "Share"}
                </span>
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

              {/* Lint warning badge — shown when there are advisory warnings but no hard parse error */}
              {!parseError && allWarnings.length > 0 && (
                <span
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
                  data-testid="badge-lint-warnings"
                >
                  <TriangleAlert size={11} />
                  {allWarnings.length === 1 ? "1 warning" : `${allWarnings.length} warnings`}
                </span>
              )}
            </div>
          </div>

          {/* Over-limit notice — shown when source exceeds the URL encoding limit */}
          {isOverLimit(source) && (
            <div
              role="alert"
              aria-live="polite"
              aria-atomic="true"
              className="px-4 py-2 flex items-center gap-2 text-xs border-b border-amber-300/60 bg-amber-50/80 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
              data-testid="banner-url-too-long"
            >
              <AlertCircle size={11} className="shrink-0" />
              <span>
                Source exceeds the {Math.round(SHARE_SOURCE_LIMIT / 1000)} kB URL limit — sharing via link is unavailable.
                {" "}Use the <strong>.mmd</strong> download button to save and share this diagram.
              </span>
            </div>
          )}

          <div
            className="relative flex-1 min-h-0 overflow-hidden forge-code-panel"
            data-testid="source-editor-viewport"
          >
            {parseError?.line != null && (
              <div
                aria-hidden="true"
                className="forge-editor-error-line absolute left-0 right-0 pointer-events-none"
                data-testid="editor-error-line-highlight"
                data-error-line={parseError.line}
                style={{
                  top: `${EDITOR_PADDING_PX + (parseError.line - 1) * EDITOR_LINE_HEIGHT_PX}px`,
                  height: `${EDITOR_LINE_HEIGHT_PX}px`,
                  transform: `translateY(-${editorScrollTop}px)`,
                }}
              />
            )}
            <textarea
              ref={sourceEditorRef}
              className="absolute inset-0 w-full h-full p-4 text-sm resize-none focus-visible:outline-none leading-relaxed code-area bg-transparent"
              value={source}
              onChange={e => handleSourceChange(e.target.value)}
              onScroll={e => setEditorScrollTop(e.currentTarget.scrollTop)}
              spellCheck={false}
              wrap="off"
              aria-label="bpmn-beta source code editor"
              data-testid="textarea-bpmn-source"
              style={{ lineHeight: `${EDITOR_LINE_HEIGHT_PX}px` }}
            />
          </div>
          {parseError && (
            <div
              role="alert"
              aria-live="polite"
              aria-atomic="true"
              className="px-4 py-2 border-t text-xs font-mono forge-parse-error-bar"
              data-testid="text-parse-error-detail"
              {...(parseError.line != null ? { "data-parse-error-line": parseError.line } : {})}
            >
              {parseError.message}
            </div>
          )}

          {/* Lint warning panel — advisory; shown alongside the rendered diagram.
              Only appears when there is no hard parse error (parsing succeeded
              but the diagram violates one or more domain rules).
              Visually distinct from the error bar: amber tint, TriangleAlert icon,
              "Warning" label instead of "Error". */}
          {!parseError && allWarnings.length > 0 && (
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="border-t border-amber-300/60 bg-amber-50/80 dark:bg-amber-900/20"
              data-testid="div-lint-warnings"
            >
              <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-amber-200/60 dark:border-amber-700/40">
                <TriangleAlert size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  {allWarnings.length === 1 ? "1 Warning" : `${allWarnings.length} Warnings`}
                </span>
                <span className="ml-1 text-xs text-amber-600/70 dark:text-amber-400/70 font-normal">
                  · diagram still renders
                </span>
              </div>
              <ul className="py-1" aria-label="Lint warnings">
                {allWarnings.map((w, i) => (
                  <li
                    key={w.code + (w.nodeId ?? '') + i}
                    data-testid={`lint-warning-${w.code}-${w.nodeId ?? i}`}
                    className="px-3 py-1 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2"
                  >
                    <span className="shrink-0 mt-0.5 text-amber-500 dark:text-amber-400 font-mono text-[10px] leading-4 select-none">
                      ▸
                    </span>
                    {w.message}
                  </li>
                ))}
              </ul>
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

            {/* SVG export button */}
            <button
              onClick={handleExportSvg}
              disabled={!!parseError || !source.trim()}
              aria-label={
                svgExportState === "done"
                  ? "SVG downloaded"
                  : "Download rendered diagram as SVG file"
              }
              data-testid="button-export-svg"
              title="Download rendered diagram as SVG"
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                !!parseError || !source.trim()
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : svgExportState === "done"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <FileDown size={13} />
              <span>{svgExportState === "done" ? "Saved!" : "SVG"}</span>
            </button>

            {/* Zoom controls */}
            <div className="ml-auto flex items-center gap-0.5">
              <span
                className="text-xs text-muted-foreground font-mono tabular-nums w-10 text-right mr-1"
                data-testid="zoom-level"
              >
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
            tabIndex={0}
            role="application"
            aria-label="Diagram canvas — scroll to zoom, drag or touch to pan, arrow keys to pan, + / − to zoom by keyboard"
            onKeyDown={handleCanvasKeyDown}
            className="flex-1 diagram-grid overflow-hidden relative select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
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
              <div ref={svgContainerRef} style={{ width: "100%", height: "100%" }}>
                <BpmnRenderer source={source} />
              </div>
            </div>

            {/* Affordance hint — always visible; closes TD-016 */}
            <div
              className="absolute bottom-2 right-3 text-xs text-muted-foreground/40 font-mono pointer-events-none select-none"
              data-testid="canvas-hint"
            >
              scroll to zoom · drag or touch to pan · +/− keys
            </div>
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
