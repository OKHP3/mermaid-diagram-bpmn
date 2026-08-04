# Mermaid Compatibility Reference
## `mermaid-diagram-bpmn` / `bpmn-beta`

**Last updated:** 2026-08-04
**Target repos:** `mermaid-js/mermaid` (≥ 10), `mermaid-js/mermaid-live-editor`

---

## Registration API

The correct entry point for both Mermaid core and the live editor is:

```ts
import mermaid from 'mermaid';
import { bpmnPlugin } from 'mermaid-diagram-bpmn';

await mermaid.registerExternalDiagrams([bpmnPlugin]);
```

`bpmnPlugin` satisfies the `ExternalDiagramDefinition` interface from
`mermaid/src/diagram-api/types.ts`:

```ts
interface ExternalDiagramDefinition {
  id: string;                  // 'BPMNDiagram'
  detector: DiagramDetector;   // (text, config?) => boolean
  loader: DiagramLoader;       // () => Promise<{ id, diagram: DiagramDefinition }>
}
```

The `loader` uses the lazy-load pattern: diagram modules are only evaluated
when Mermaid encounters the first `bpmn-beta` diagram. This matches how
`mermaid-zenuml` and other external diagrams register.

---

## Contract Compliance by Module

### `bpmn-detector.ts` — DiagramDetector ✅

```ts
// Mermaid interface:
type DiagramDetector = (text: string, config?: MermaidConfig) => boolean;

// Our implementation:
export function detect(text: string, _config?: Record<string, unknown>): boolean
```

**Status:** Compliant. The optional `config` parameter is accepted and unused —
detection is purely text-based. Mermaid pre-strips `%%{...}%%` directives and
YAML front matter before calling detectors; our implementation also strips
these patterns defensively.

---

### `bpmn-db.ts` — DiagramDB ✅

```ts
// Mermaid interface (all fields optional):
interface DiagramDB {
  clear?(): void
  setDiagramTitle?(title: string): void
  getDiagramTitle?(): string
  setAccTitle?(title: string): void
  getAccTitle?(): string
  setAccDescription?(desc: string): void
  getAccDescription?(): string
  setDiagramId?(id: string): void
  bindFunctions?(element: Element): void
  getConfig?(): BaseDiagramConfig | undefined
  // ...and others
}
```

**Status:** Compliant. `BpmnDb` implements all required interface methods.
`bindFunctions` is a no-op (read-only SVG, no interactive bindings in v1).
`getConfig` returns `undefined` (no per-diagram config overrides in v1).

**Note:** `BpmnDb` is also the `parser.yy` object — Mermaid's convention for
the shared mutable database that the parser populates and the renderer reads.

---

### `bpmn-parser.ts` + adapter in `bpmn-plugin.ts` — ParserDefinition ✅

```ts
// Mermaid interface:
interface ParserDefinition {
  parse(text: string): void | Promise<void>;
  parser?: { yy: DiagramDB };
}
```

**Status:** Compliant via adapter in `bpmn-plugin.ts`.

`bpmn-parser.ts` exports `parse(source): BpmnDb` (returns a new instance).
This is the correct signature for the standalone parser used by the playground
and the test suite.

`bpmn-plugin.ts` wraps it into Mermaid's expected contract:

```ts
const parserDef = {
  parse(text: string): void {
    db.clear();                  // reset shared instance
    const parsed = parse(text);  // our existing parser
    // copy into shared db that renderer reads from diagramObject.db
    for (const n of parsed.getNodes()) db.addNode(n);
    ...
  },
  yy: db,                        // shared BpmnDb instance
};
```

This keeps `bpmn-parser.ts` unchanged (no impact on tests), while satisfying
the mutation-based parser contract Mermaid expects.

---

### `bpmn-renderer.tsx` + `draw` in `bpmn-plugin.ts` — DiagramRenderer ✅

```ts
// Mermaid interface:
interface DiagramRenderer {
  draw: DrawDefinition;
}
type DrawDefinition = (
  text: string,
  id: string,
  version: string,
  diagramObject: Diagram
) => void | Promise<void>;
```

**Status:** Compliant via `draw` function in `bpmn-plugin.ts`.

`bpmn-renderer.tsx` exports `<BpmnRenderer source={...} />` — a React
component used by the playground. It is **not** directly compatible with
Mermaid's imperative `draw(text, id, ...)` API.

`bpmn-plugin.ts` provides a parallel `draw` function that:
1. Gets the SVG element by `id` (`document.getElementById(id)`)
2. Runs `parse()` + `layoutGraph()` on the text
3. Generates SVG markup as a string using the same shape logic
4. Sets the SVG's `viewBox`, aria attributes, and `innerHTML`

The SVG string generator in `bpmn-plugin.ts` (`renderNodeSvg`, `renderFlowSvg`,
`renderPoolsSvg`) mirrors `bpmn-renderer.tsx` shape-for-shape without React.

**Design decision:** React was not added as a runtime dependency of the plugin.
The playground React component and the plugin draw function share the same
underlying data pipeline (`parse → layoutGraph → shape data`) but use different
output strategies (JSX vs. string interpolation). This avoids bundling
`react-dom/server` into the plugin.

**Marker ID scoping:** Arrow and slash marker IDs are prefixed with the
diagram's `id` (e.g. `mermaid-123-arrow`). This prevents conflicts when
multiple `bpmn-beta` diagrams appear on the same page.

---

### `bpmn-styles.ts` — DiagramStylesProvider ✅

```ts
// Mermaid interface (styles field in DiagramDefinition):
type DiagramStylesProvider = (options?: any, svgId?: string) => string;
```

**Status:** Compliant.

`bpmn-plugin.ts` registers:
```ts
styles: (options?: Record<string, string>) => getStyles(buildMermaidTheme(options))
```

`buildMermaidTheme(themeVariables)` maps Mermaid's resolved theme variables to
`BpmnThemeOptions`:

| Mermaid theme variable | Maps to BpmnThemeOptions |
|---|---|
| `primaryColor` | `primaryColor` (end event fill, inner markers) |
| `lineColor` | `lineColor` (flows, gateway markers, arrows) |
| `mainBkg` | `mainBkg` (task/event/gateway background fill) |
| `nodeBorder` | `nodeBorder` (node stroke, pool/lane borders) |
| `clusterBkg` | `clusterBkg` (pool header, lane header fill) |
| `textColor` / `primaryTextColor` | `textColor` (all SVG text) |

**Important:** `LIGHT_THEME` in `bpmn-styles.ts` uses CSS custom properties
(`hsl(var(--foreground))` etc.) — these resolve correctly in the playground
where Tailwind's CSS vars are loaded in the DOM, but **will not resolve**
inside Mermaid's isolated SVG context. The plugin always uses
`buildMermaidTheme()` + `MERMAID_FALLBACK_THEME`, never `LIGHT_THEME`.

---

## Live Editor Compatibility

`mermaid-live-editor` calls `mermaid.registerExternalDiagrams([...])` on
startup (see `src/lib/util/mermaid.ts`). The `bpmnPlugin` object is a valid
`ExternalDiagramDefinition` and can be passed directly:

```ts
// In a live editor fork or plugin config:
import mermaid from 'mermaid';
import { bpmnPlugin } from 'mermaid-diagram-bpmn';

mermaid.registerLayoutLoaders([...]);
const init = mermaid.registerExternalDiagrams([bpmnPlugin]);
```

The live editor's `render(config, code, id)` function then calls
`mermaid.render(id, code)`, which triggers the lazy loader, parser, and
draw function in sequence.

**Not yet tested end-to-end** against a live editor instance. This is the next
validation milestone — see Open Questions below.

---

## Integration Test (PRD-03 §3 — verified)

The plugin has been exercised against a real `mermaid.render()` call:

```
app/src/lib/__tests__/bpmn-plugin-integration.test.ts
```

The test:
- Imports `mermaid@11.4.1` (the `MERMAID_VERSION_TARGET` pin)
- Calls `mermaid.registerExternalDiagrams([bpmnPlugin])`
- Calls `mermaid.render()` against `examples/01-linear-process.mmd` and `examples/08-purchase-order-approval.mmd`
- Asserts the returned SVG contains `bpmn-task`, `bpmn-event`, `bpmn-flow-sequence`, `bpmn-pool`, `bpmn-lane`, `bpmn-gateway`, and `bpmn-flow-conditional` class names
- Asserts the `<style>` block contains live theme color values (FR-018 — not a static fallback)
- Asserts that invalid source text throws or returns non-empty SVG (TD-004)

**Runs in CI** as part of `pnpm --filter @workspace/mermaid-diagram-bpmn run test` (see `.github/workflows/ci.yml` → "Unit tests" step). This step is merge-blocking.

**Test environment note:** The test uses `securityLevel: 'loose'` when calling `mermaid.initialize()`. This disables DOMPurify sanitization inside the test runner. The reason: `happy-dom` (the Vitest DOM environment) drops all SVG sibling elements following a `<defs>` block when parsing HTML — DOMPurify re-parses the SVG string through this same HTML parser, which strips `<g>` nodes for flows and shapes. In a real browser, DOMPurify uses the native browser DOM and handles SVG content correctly; `securityLevel: 'loose'` is a test-only accommodation. The plugin's `draw()` function itself uses `DOMParser('image/svg+xml')` + `document.importNode` to inject content with correct SVG namespace in all environments.

---

## What Is Not Yet Wired

| Item | Status | Notes |
|---|---|---|
| `bpmn-plugin.ts` published to npm | Not done | Required before end-to-end test |
| Integration test against `mermaid.render()` | **Done** — `app/src/lib/__tests__/bpmn-plugin-integration.test.ts` |
| Langium grammar | Not done | Required for upstream Mermaid core PR |
| `%%{init}%%` directive support | Not done | Allows per-diagram theme override |
| `setDisplayMode` on BpmnDb | Stub not present | Add if Mermaid core requires it |

---

## Open Questions

| ID | Question | Status | Blocks |
|---|---|---|---|
| CQ-001 | Does `registerExternalDiagrams()` call `parser.parse()` before `renderer.draw()`? | **Answered** — Yes, parser runs first; shared-db pattern is correct. | Resolved |
| CQ-002 | What Mermaid version should be pinned as `peerDependencies`? | **Answered** — `^11.4.1` (`MERMAID_VERSION_TARGET`). | Resolved |
| CQ-003 | Does Mermaid pass themeVariables as the `options` arg to `styles()`? | **Answered** — Yes. `styles(themeVars)` receives resolved theme variables; `_cachedThemeVars` captures them for `draw()`. | Resolved |
| CQ-004 | Does `draw()` receive the SVG element `id` and must find it via `getElementById`? | **Answered** — Yes; Mermaid creates `<div id="d{id}"><svg id="{id}">` before calling `draw()`. | Resolved |
| CQ-005 | Does the live editor sandbox allow external diagram registration? | Open — not yet tested end-to-end. | Live editor compatibility |

---

## Test Plan

```bash
# Run all tests (includes integration test — blocks CI merge on failure)
pnpm --filter @workspace/mermaid-diagram-bpmn run test

# TypeScript check
pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck

# Integration test specifically
pnpm --filter @workspace/mermaid-diagram-bpmn exec vitest run \
  src/lib/__tests__/bpmn-plugin-integration.test.ts

# Live editor fork test (manual — still pending)
# Clone mermaid-live-editor, add bpmnPlugin to registerExternalDiagrams call,
# type a bpmn-beta diagram, verify SVG renders.
```

---

## Decision Log Entries

| Decision | Rationale |
|---|---|
| Separate React playground renderer from Mermaid draw function | Keeps the plugin bundle free of `react-dom/server`; playground and plugin share parse/layout pipeline but use different output strategies |
| Shared mutable `db` instance via `parser.yy` | Matches Mermaid's parser convention; avoids re-parsing in the renderer when parser has already populated the db |
| Scoped marker IDs (`${diagramId}-arrow`) | Prevents SVG `<defs>` conflicts when multiple bpmn-beta diagrams appear on the same page |
| `buildMermaidTheme()` maps Mermaid theme vars → BpmnThemeOptions | Ensures bpmn-beta respects user theme; falls back to `MERMAID_FALLBACK_THEME` for unknown theme vars |
| `LIGHT_THEME` retained for playground | CSS vars resolve correctly in browser DOM context; only the plugin uses concrete values |
