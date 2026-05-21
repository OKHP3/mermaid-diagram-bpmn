# Mermaid Compatibility Reference
## `mermaid-diagram-bpmn` / `bpmn-beta`

**Last updated:** 2026-05-21
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

## What Is Not Yet Wired

| Item | Status | Notes |
|---|---|---|
| `bpmn-plugin.ts` published to npm | Not done | Required before end-to-end test |
| End-to-end test against `mermaid.render()` | Not done | Highest priority validation |
| Langium grammar | Not done | Required for upstream Mermaid core PR |
| `%%{init}%%` directive support | Not done | Allows per-diagram theme override |
| `setDisplayMode` on BpmnDb | Stub not present | Add if Mermaid core requires it |

---

## Open Questions

| ID | Question | Blocks |
|---|---|---|
| CQ-001 | Does `registerExternalDiagrams()` call `parser.parse()` before `renderer.draw()`, or does draw re-parse from text? | Determines whether the shared-db copy pattern in parserDef is necessary |
| CQ-002 | What Mermaid version should be pinned as `peerDependencies`? | npm package.json |
| CQ-003 | Does Mermaid pass themeVariables as the `options` arg to `styles()`? | Theme binding correctness |
| CQ-004 | Does `draw()` receive the SVG element created by Mermaid, or a container div? | `el.innerHTML` vs. attribute injection strategy |
| CQ-005 | Does the live editor sandbox allow external diagram registration, or does it lock to a fixed diagram list? | Live editor compatibility |

---

## Test Plan

Before publishing the npm package, run these validation steps:

```bash
# 1. Unit tests (must still pass after compatibility changes)
pnpm --filter @workspace/mermaid-diagram-bpmn run test

# 2. TypeScript (plugin file must type-check)
pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck

# 3. Manual end-to-end test (requires Mermaid installed)
node -e "
  import('mermaid').then(m => {
    import('./src/lib/bpmn-plugin.js').then(async ({ bpmnPlugin }) => {
      await m.default.registerExternalDiagrams([bpmnPlugin]);
      const result = await m.default.render('test', 'bpmn-beta\nstart s1 \"Start\"\nend e1 \"End\"\ns1 --> e1');
      console.log(result.svg.slice(0, 200));
    });
  });
"

# 4. Live editor fork test (manual)
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
