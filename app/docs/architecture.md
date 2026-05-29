# Architecture: bpmn-beta Prototype

---

## Module map

```
bpmn-beta DSL text
       │
       ▼
 ┌─────────────┐
 │  Detector   │  detect(text): boolean — matches "bpmn-beta" header
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │   Parser    │  parse(source): BpmnDb — stack-based block parser
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │   BpmnDb    │  Typed store: nodes, flows, pools, lanes, accessibility
 └──────┬──────┘
        │
        ├──────────────────┐
        ▼                  ▼
 ┌─────────────┐   ┌───────────────┐
 │Layout engine│   │  getStyles()  │  CSS block injected into SVG <defs>
 └──────┬──────┘   └───────┬───────┘
        │                  │
        └──────┬───────────┘
               ▼
        ┌─────────────┐
        │  Renderer   │  <BpmnRenderer source={…} /> → SVG
        └─────────────┘
```

---

## Current file structure (prototype)

```
artifacts/mermaid-diagram-bpmn/src/lib/
  bpmn-detector.ts      detect(text): boolean; DETECTOR_KEY = 'BPMNDiagram'
  bpmn-db.ts            BpmnDb class — typed nodes, flows, pools, lanes
  bpmn-parser.ts        parse(source): BpmnDb; stack-based block parser
  bpmn-layout.ts        layoutGraph(db): BpmnLayout; flat + pool/lane layout modes
  bpmn-renderer.tsx     <BpmnRenderer source={…} />; SVG with bpmn-* CSS classes
  bpmn-styles.ts        getStyles(BpmnThemeOptions): string; injected into <defs>
  bpmn-examples.ts      BPMN_EXAMPLES[] with raw .mmd imports; experimental flag

artifacts/mermaid-diagram-bpmn/examples/
  01-linear-process.mmd
  02-gateway-decision.mmd
  03-pool-lane-collaboration.mmd
  04-multi-event.mmd
  05-parallel-split.mmd
```

---

## Proposed npm package layout (plugin v1)

```
packages/mermaid-bpmn-beta/
  src/
    index.ts              registerExternalDiagrams() entry point
    bpmnDiagram.ts        diagram descriptor object
    detector.ts
    grammar/              Langium grammar (replaces hand-written parser)
    parser/
    db/
    renderer/
    styles.ts
  examples/
  tests/
  docs/
```

---

## Key design decisions

### No bpmn-js dependency (DEC-002)

**Status:** Accepted

BPMN shapes are implemented from scratch as hand-written SVG in React. No bpmn-js runtime dependency. Rationale: bundle size, license friction, and divergent design goals. bpmn-js is a full BPMN editor runtime; we only need shape rendering.

### DSL header keyword = `bpmn-beta` (DEC-003)

**Status:** Accepted

`beta` belongs only in the DSL header keyword. The project title is "BPMN for Mermaid" everywhere else. This avoids coupling the public project name to a stability qualifier.

### aria-roledescription key = `BPMNDiagram` (DEC-004)

**Status:** Accepted

Used as the detector key and the ARIA role description on the SVG root element.

### Layout engine = coordinate-hint hybrid (DEC-001)

**Status:** Proposed (pending PoC validation)

Default to row-major auto-placement within lanes; allow optional `@[row,col]` annotation per node. Cross-lane flows handled by level-assignment across lane boundaries.

### Parser strategy = hand-written prototype → Langium plugin (DEC-013)

**Status:** Proposed

Keep the hand-written line parser as the prototype/playground engine for DSL iteration. Port to Langium when packaging for npm publication. Add a parity test corpus asserting both parsers produce equivalent ASTs for the canonical example set.

Rationale: The hand-written parser is faster to iterate during DSL design. Langium is required only for upstream PR acceptance (JISON is deprecated in Mermaid). Treating them as serial rather than parallel concerns avoids paying Langium tax during the volatile DSL phase.

### GitHub Pages as canonical public playground URL (DEC-018)

**Status:** Accepted (2026-05-07)

Deploy the React playground from `artifacts/mermaid-diagram-bpmn` to GitHub Pages at `https://okhp3.github.io/mermaid-diagram-bpmn/`. The Replit app is the development environment. The GitHub Pages deployment is the shareable public demo URL.

---

## BpmnDb API (stable surface)

```typescript
class BpmnDb {
  addNode(node: BpmnNode): void
  addFlow(flow: BpmnFlow): void
  addPool(pool: BpmnPool): void
  addLane(lane: BpmnLane): void
  setAccTitle(title: string): void
  setAccDescription(desc: string): void

  getNodes(): BpmnNode[]
  getFlows(): BpmnFlow[]
  getPools(): BpmnPool[]
  getLanes(): BpmnLane[]
  getAccTitle(): string | undefined
  getAccDescription(): string | undefined
}
```

---

## CSS class naming convention

All SVG shapes carry `bpmn-*` class names. Colors come from a `<style>` block injected into SVG `<defs>` via `getStyles()`, not from inline props.

| Class | Shape |
|---|---|
| `.bpmn-event` | Start event ring |
| `.bpmn-event-start-inner` | Start event inner circle |
| `.bpmn-event-end` | End event thick ring |
| `.bpmn-task` | Task rounded rect |
| `.bpmn-task-marker` | Task subtype icon (stroke) |
| `.bpmn-gateway` | Gateway diamond |
| `.bpmn-gateway-marker` | XOR/AND marker lines |
| `.bpmn-gateway-or-marker` | OR marker circle |
| `.bpmn-flow-sequence` | Sequence flow line |
| `.bpmn-flow-default` | Default flow line |
| `.bpmn-flow-message` | Message flow dashed line |
| `.bpmn-pool` | Pool outer rect |
| `.bpmn-pool-header` | Pool label strip |
| `.bpmn-lane` | Lane rect |
| `.bpmn-lane-header` | Lane label strip |
| `.bpmn-text` | Node label text |
| `.bpmn-text-muted` | Edge label text |
| `.bpmn-text-label` | Pool/lane rotated header label |
| `.bpmn-arrow` | Filled arrowhead |
| `.bpmn-arrow-open` | Open arrowhead (message flows) |
| `.bpmn-slash` | Default flow slash marker |
