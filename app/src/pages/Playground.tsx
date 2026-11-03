import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
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
import { useWorkbenchDrafts, type WorkbenchDraft } from "@/hooks/useWorkbenchDrafts";
import { WorkbenchDrafts } from "@/components/WorkbenchDrafts";
import { StatusRibbon } from "@/components/StatusRibbon";

const MIN_SCALE = 0.15;
const MAX_SCALE = 8;
const EDITOR_PADDING_PX = 16;
const EDITOR_LINE_HEIGHT_PX = 23;
const URL_SYNC_DEBOUNCE_MS = 400;

interface ErrorInfo {
  /** Human-readable error message; already contains "Line N: " prefix when the
   *  parser knows the offending line. */
  message: string;
  /** 1-based source line number when a `ParseError` carries it; undefined
   *  for non-positional errors (e.g. "no nodes found"). */
  line?: number;
}

interface SourceDiagnostics {
  parseError: ErrorInfo | null;
  allWarnings: DiagnosticWarning[];
  labels?: { id: string; label: string }[];
}

/**
 * Parse source once, then derive both hard-error state and advisory diagnostics
 * from the same BpmnDb. Hard parse errors take precedence over warnings.
 */
function getSourceDiagnostics(source: string): SourceDiagnostics {
  try {
    const db = parse(source);
    const nodes = db.getNodes();
    if (nodes.length === 0 && source.trim().length > 10) {
      return {
        parseError: {
          message: "No nodes found. Check your syntax — each node must be on its own line.",
        },
        allWarnings: [],
      };
    }
    if (nodes.length === 0) {
      return { parseError: null, allWarnings: [] };
    }
    const lintWarns: LintWarning[] = lint(db);
    const validationErrs = validate(db);
    return {
      parseError: null,
      labels: nodes.map(node => ({ id: node.id, label: node.label || node.id })),
      allWarnings: [
        ...lintWarns,
        ...validationErrs.map(e => ({ code: e.code, message: e.message, nodeId: e.nodeId, sourceLine: e.line })),
      ],
    };
  } catch (e) {
    if (e instanceof ParseError) {
      return { parseError: { message: e.message, line: e.line }, allWarnings: [] };
    }
    return { parseError: { message: (e as Error).message }, allWarnings: [] };
  }
}

/** Shape shared by lint warnings and validation errors for display purposes. */
interface DiagnosticWarning {
  code: string;
  message: string;
  nodeId?: string;
  sourceLine?: number;
}

/**
 * Resolve examples synchronously during initialisation. Compressed source
 * payloads are decoded after mounting because Compression Streams are async.
 */
function computeInitialState(): { source: string; activeExample: string | null } {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const params = new URLSearchParams(search);
  const encodedSource = params.get('src');
  const exampleId = params.get('example');

  // `src` takes precedence over `example`; leave the default in place until
  // the asynchronous source decoder hydrates the shared diagram.
  if (!encodedSource && exampleId) {
    const ex = BPMN_EXAMPLES.find(e => e.id === exampleId);
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

type WorkspaceView = "diagram" | "source" | "split";

export default function Playground() {
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>(() => {
    const view = new URLSearchParams(window.location.search).get("view");
    return view === "source" || view === "split" ? view : "diagram";
  });
  const drafts = useWorkbenchDrafts();
  const [previousWork, setPreviousWork] = useState<{ source: string; example: string | null } | null>(null);
  function changeView(view: WorkspaceView) {
    setWorkspaceView(view);
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    history.replaceState(null, "", url.toString());
  }
  // Initialise from URL params (?src= or ?example=) on first render to avoid a
  // flash of the default content when a shared link is opened.
  const [source, setSource] = useState<string>(() => computeInitialState().source);
  const [activeExample, setActiveExample] = useState<string | null>(() => computeInitialState().activeExample);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const sourceEditorRef = useRef<HTMLTextAreaElement>(null);
  const [activeLintWarningLine, setActiveLintWarningLine] = useState<number | null>(null);

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
  const sourceUrlSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceUrlSyncVersionRef = useRef(0);
  const userChangedSourceRef = useRef(false);

  // Ref for the container holding the rendered BpmnRenderer SVG
  const svgContainerRef = useRef<HTMLDivElement>(null);
  // Fit the workbench viewport to rendered content, including pools and labels.
  // The shared renderer retains its layout contract for other consumers.
  useLayoutEffect(() => {
    if (workspaceView === "source") return;
    const svg = svgContainerRef.current?.querySelector("svg");
    if (!svg || typeof svg.getBBox !== "function") return;
    try {
      const bounds = svg.getBBox();
      if (bounds.width > 0 && bounds.height > 0) {
        const padding = 30;
        svg.setAttribute("viewBox", `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`);
      }
    } catch { /* Hidden SVGs can lack geometry; retain the renderer viewport. */ }
  }, [source, workspaceView]);

  const { parseError, allWarnings, labels = [] } = useMemo(
    () => getSourceDiagnostics(source),
    [source],
  );
  const activeExampleDef = BPMN_EXAMPLES.find(e => e.id === activeExample);

  const scrollEditorToLine = useCallback((line: number, focusEditor = false) => {
    const editor = sourceEditorRef.current;
    if (!editor) return;

    const lineTop = (line - 1) * EDITOR_LINE_HEIGHT_PX;
    const targetScrollTop = Math.max(
      0,
      lineTop - (editor.clientHeight - EDITOR_LINE_HEIGHT_PX) / 2,
    );
    editor.scrollTop = targetScrollTop;
    setEditorScrollTop(targetScrollTop);
    if (focusEditor) editor.focus();
  }, []);

  // Hydrate arbitrary ?src= links after the Compression Streams API decodes
  // them. A user edit or example selection always wins over a late decode.
  useEffect(() => {
    let disposed = false;
    const search = window.location.search;

    void parseShareParams(search).then(shared => {
      if (disposed || userChangedSourceRef.current || shared?.kind !== 'source') return;
      setSource(shared.source);
      setActiveExample(null);
    });

    return () => {
      disposed = true;
    };
  }, []);

  // A changed source invalidates any selected lint coordinate from the previous
  // diagram. Parser errors derive their own coordinate and need no local state.
  useEffect(() => {
    setActiveLintWarningLine(null);
  }, [source]);

  // Position the editor at a parser-reported line without moving keyboard focus.
  // The stripe itself is rendered in a sibling layer and follows textarea scrolling.
  useEffect(() => {
    if (parseError?.line == null) return;
    scrollEditorToLine(parseError.line);
  }, [parseError?.line, scrollEditorToLine]);

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
      if (sourceUrlSyncTimeoutRef.current) clearTimeout(sourceUrlSyncTimeoutRef.current);
      sourceUrlSyncVersionRef.current += 1;
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
  function cancelPendingSourceUrlSync() {
    sourceUrlSyncVersionRef.current += 1;
    if (sourceUrlSyncTimeoutRef.current) {
      clearTimeout(sourceUrlSyncTimeoutRef.current);
      sourceUrlSyncTimeoutRef.current = null;
    }
  }

  async function synchronizeSourceUrl(sourceToSync: string, version: number) {
    const url = new URL(window.location.href);
    url.searchParams.delete('example');

    if (!sourceToSync.trim() || isOverLimit(sourceToSync)) {
      url.searchParams.delete('src');
    } else {
      try {
        const encoded = await encodeSource(sourceToSync);
        if (version !== sourceUrlSyncVersionRef.current) return;
        url.searchParams.set('src', encoded);
      } catch {
        // Encoding failures should never leave a stale source URL behind.
        url.searchParams.delete('src');
      }
    }

    if (version === sourceUrlSyncVersionRef.current) {
      history.replaceState(null, '', url.toString());
    }
  }

  function selectExample(id: string) {
    const ex = BPMN_EXAMPLES.find(e => e.id === id);
    if (ex) {
      if (ex.source === source) return;
      if (activeExample === null) {
        if (!drafts.save(source) && !window.confirm("This draft could not be saved in this browser. Download its source before replacing it. Replace it anyway?")) return;
        setPreviousWork({ source, example: activeExample });
      }
      drafts.start();
      userChangedSourceRef.current = true;
      cancelPendingSourceUrlSync();
      setSource(ex.source);
      setActiveExample(ex.id);
      setActiveLintWarningLine(null);
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
    drafts.save(val);
    setPreviousWork(null);
    userChangedSourceRef.current = true;
    setSource(val);
    setActiveExample(null);
    setActiveLintWarningLine(null);
    cancelPendingSourceUrlSync();
    const version = sourceUrlSyncVersionRef.current;

    // Keep direct address-bar copies shareable without replacing history on every
    // keystroke. The delayed callback runs after React has completed the input
    // update, which keeps synchronous component tests free of URL side effects.
    sourceUrlSyncTimeoutRef.current = setTimeout(() => {
      sourceUrlSyncTimeoutRef.current = null;
      void synchronizeSourceUrl(val, version);
    }, URL_SYNC_DEBOUNCE_MS);
  }

  function restoreSource(value: string, example: string | null = null) {
    if (activeExample === null && !drafts.save(source)
      && !window.confirm("This draft could not be saved. Download its source before restoring other work. Restore anyway?")) return;
    drafts.start();
    handleSourceChange(value);
    setActiveExample(example);
    resetView();
  }

  function restoreDraft(draft: WorkbenchDraft) { restoreSource(draft.source); }

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

    // Build the shareable URL fresh so Share remains correct even when clicked
    // before a pending address-bar synchronization has completed.
    const url = new URL(window.location.href);
    if (activeExample) {
      url.searchParams.set('example', activeExample);
      url.searchParams.delete('src');
    } else if (source.trim()) {
      try {
        url.searchParams.set('src', await encodeSource(source));
        url.searchParams.delete('example');
      } catch {
        setShareState("idle");
        return;
      }
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
    <div className="workbench flex flex-col flex-1" data-view={workspaceView}>

      {/* Status ribbon */}
      <StatusRibbon />

      <div className="workbench-heading">
        <div>
          <p className="workbench-eyebrow">BPMN for Mermaid / Workbench</p>
          <h1 data-testid="heading-playground">{source.match(/^accTitle:\s*(.+)$/m)?.[1] || "Your process diagram"}</h1>
          <p className="workbench-subtitle">Understand the process. Edit its source. Take the result with you.</p>
        </div>
        <label className="workbench-example-label">Try an example
          <select data-testid="select-example" value={activeExample ?? ""} onChange={e => selectExample(e.target.value)}>
            <option value="" disabled>Your draft</option>
            {BPMN_EXAMPLES.map(ex => <option key={ex.id} value={ex.id}>{ex.name}{ex.experimental ? " (experimental)" : ""}</option>)}
          </select>
        </label>
      </div>
      <div className="workbench-controls">
        <div className="workbench-view-tabs" role="tablist" aria-label="Workspace view">
          {(["diagram", "source", "split"] as const).map((view, index, views) => <button
            key={view} id={`workspace-tab-${view}`} role="tab" aria-selected={workspaceView === view}
            aria-controls="workbench-panels" tabIndex={workspaceView === view ? 0 : -1}
            onClick={() => changeView(view)} onKeyDown={event => {
              const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
              if (next === null) return;
              event.preventDefault(); changeView(views[next]);
              document.getElementById(`workspace-tab-${views[next]}`)?.focus();
            }}>
            {view[0].toUpperCase() + view.slice(1)}
          </button>)}
        </div>
        <div className="workbench-exports" role="group" aria-label="Export and share">
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


        </div>
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


        <span role="status" aria-live="polite" className="sr-only">{svgExportState === "done" ? "SVG downloaded" : ""}{shareState === "copied" ? "Shareable link copied" : ""}</span>
      </div>
      <WorkbenchDrafts drafts={drafts.drafts} saveState={drafts.saveState} onRestore={restoreDraft} onForget={drafts.forget} />
      {previousWork && <div className="workbench-notice" role="status">Previous work is available.
        <button className="workbench-action" onClick={() => restoreSource(previousWork.source, previousWork.example)}>Undo example change</button>
      </div>}
      {workspaceView === "diagram" && (parseError || allWarnings.length > 0) && <div className="workbench-notice" role="status">
        <span>{parseError ? parseError.message : `${allWarnings.length} process warnings to review.`}</span>
        <button className="workbench-action" onClick={() => changeView("source")}>Review source</button>
      </div>}

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
      <div id="workbench-panels" role="tabpanel" aria-labelledby={`workspace-tab-${workspaceView}`} className="workbench-panels">

        {/* Source panel */}
        <div
          className="workbench-source" hidden={workspaceView === "diagram"}
        >
          {/* Source panel toolbar */}
          <div className="forge-code-panel-tab flex items-center gap-2 px-4 py-2 border-b">
            <label htmlFor="workbench-source" className="text-xs font-mono shrink-0">Editable bpmn-beta source</label>

            <div className="ml-auto flex items-center gap-1">
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

          {/* Lint warning panel — advisory; shown alongside the rendered diagram.
              It sits below the editor toolbar so authors can see it without
              scrolling the workspace. */}
          {!parseError && allWarnings.length > 0 && (
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="border-b border-amber-300/60 bg-amber-50/80 dark:bg-amber-900/20"
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
                    {...(w.sourceLine != null ? { "data-lint-warning-line": w.sourceLine } : {})}
                    className="px-3 py-1 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2"
                  >
                    <span className="shrink-0 mt-0.5 text-amber-500 dark:text-amber-400 font-mono text-[10px] leading-4 select-none">
                      ▸
                    </span>
                    <span className="min-w-0 flex-1">{w.message}</span>
                    {w.sourceLine != null && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLintWarningLine(w.sourceLine!);
                          scrollEditorToLine(w.sourceLine!, true);
                        }}
                        className="shrink-0 rounded px-1 py-0.5 font-mono text-[10px] font-semibold text-amber-700 underline decoration-amber-500/70 underline-offset-2 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300 dark:hover:bg-amber-900/40"
                        aria-label={`Go to line ${w.sourceLine} for ${w.code}`}
                        data-testid={`button-lint-warning-line-${w.code}-${w.nodeId ?? i}`}
                      >
                        Line {w.sourceLine}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                Source exceeds the {Math.round(SHARE_SOURCE_LIMIT / 1000)} kB sharing limit — sharing via link is unavailable.
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
            {!parseError && activeLintWarningLine != null && (
              <div
                aria-hidden="true"
                className="forge-editor-warning-line absolute left-0 right-0 pointer-events-none"
                data-testid="editor-lint-warning-line-highlight"
                data-lint-warning-line={activeLintWarningLine}
                style={{
                  top: `${EDITOR_PADDING_PX + (activeLintWarningLine - 1) * EDITOR_LINE_HEIGHT_PX}px`,
                  height: `${EDITOR_LINE_HEIGHT_PX}px`,
                  transform: `translateY(-${editorScrollTop}px)`,
                }}
              />
            )}
            <textarea
              id="workbench-source"
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

        </div>

        {/* Preview panel */}
        <div className="workbench-preview" hidden={workspaceView === "source"}>

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
                <span className="flex items-center gap-1"><Maximize2 size={16} /><span className="text-xs">Fit</span></span>
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
            aria-label="Diagram canvas. Keyboard controls: arrow keys pan, plus or minus zoom, and 0 resets the view. Scroll to zoom; drag or touch to pan."
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
              <div ref={svgContainerRef} className="workbench-renderer" style={{ width: "100%", height: "100%" }}>
                <BpmnRenderer source={source} />
              </div>
            </div>

            {/* Affordance hint — always visible; closes TD-016 */}
            <div
              className="absolute bottom-2 right-3 text-xs text-muted-foreground font-mono pointer-events-none select-none"
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
            {(activeExampleDef.supportedSemantics || activeExampleDef.deferredSemantics) && (
              <p className="mt-1 text-[11px] text-muted-foreground/70">
                <span className="font-semibold text-foreground/80">Illustrative evidence:</span>{" "}
                supports {activeExampleDef.supportedSemantics?.join(", ")}.
                {" "}Deferred here: {activeExampleDef.deferredSemantics?.join(", ")}.
              </p>
            )}
          </div>
        </div>
      )}
      <div className="workbench-finish">
        <p>A rendered diagram is a starting point for review. Confirm owners, decisions, and exceptions with the people doing the work.</p>
        <p>Download .mmd to edit later or SVG for documents. Share links include your diagram source.</p>
        {labels.length > 0 && <details><summary>Read all diagram labels ({labels.length})</summary>
          <ul>{labels.map(node => <li key={node.id}><code>{node.id}</code> {node.label}</li>)}</ul>
        </details>}
      </div>
    </div>
  );
}
