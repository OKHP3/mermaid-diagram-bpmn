# bpmn-beta Standard

**Version:** 0.1
**Owner:** OverKill Hill P³ / Jamie Hill
**Status:** Active — DSL unstable pre-v1.0

This document defines the technical and design standards that all DSL features, parser behavior, rendering, and documentation in BPMN for Mermaid must conform to.

## Authoritative standard

All rendered notation in this project must conform to the **OMG BPMN 2.0.2 Formal Specification**:

| Resource | Location |
|---|---|
| Specification PDF (local copy) | [`OMG-BPMN-2.0.2-formal-specification.pdf`](./OMG-BPMN-2.0.2-formal-specification.pdf) |
| Section-by-section compliance map | [`BPMN-SPEC-REFERENCE.md`](./BPMN-SPEC-REFERENCE.md) |
| BPMN standard home | https://www.bpmn.org/ |
| OMG specification page | https://www.omg.org/spec/BPMN/2.0.2/PDF |

This project targets the **Descriptive Conformance Sub-Class** (spec Section 2.1). Any element outside that class requires a `docs/decisions.md` entry before implementation.

---

## 1. Identity standard

### 1.1 Project identity

- This is a personal project of Jamie Hill / OverKill Hill P³
- It is not affiliated with any employer, the mermaid-js maintainers, Mermaid Chart, Mermaid.ai, or any standards body
- The canonical disclaimer (see `AGENTS.md`) must appear in README and major docs

### 1.2 Name usage

| Context | Correct | Incorrect |
|---|---|---|
| DSL header keyword | `bpmn-beta` | `bpmn`, `BPMN`, `bpmn-diagram` |
| Public product name | "BPMN for Mermaid" | "bpmn-beta tool", "BPMN Beta" |
| npm package name | `mermaid-diagram-bpmn` | anything else |
| DETECTOR_KEY constant | `'BPMNDiagram'` | anything else |

### 1.3 Compliance claims

Always use: "a documented BPMN 2.0 descriptive subset"

Never use:
- "BPMN 2.0 compliant"
- "full BPMN support"
- "standards-compliant BPMN"

---

## 2. Architecture standard

### 2.1 Pipeline immutability

The five-stage pipeline is fixed. Stages must not be collapsed, merged, or bypassed:

```
detect → parse → layout → render → styles
```

| Stage | Module | Input | Output |
|---|---|---|---|
| Detect | `bpmn-detector.ts` | Raw text | `boolean` |
| Parse | `bpmn-parser.ts` | Raw text | `BpmnDb` |
| Layout | `bpmn-layout.ts` | `BpmnDb` | `BpmnLayout` |
| Render | `bpmn-renderer.tsx` or `bpmn-plugin.ts` | `BpmnDb` + `BpmnLayout` | SVG |
| Style | `bpmn-styles.ts` | `BpmnThemeOptions` | CSS string |

### 2.2 BpmnDb as canonical store

All data flows through `BpmnDb`. No data structure may pass between pipeline stages except:
- `BpmnDb` instance between parse → layout → render
- `BpmnLayout` instance between layout → render
- `BpmnThemeOptions` between style → render

### 2.3 No bpmn-js dependency

The renderer is permanently hand-written SVG. Do not add `bpmn-js`, `bpmn-moddle`, or any bpmn-js ecosystem package as a dependency.

### 2.4 No BPMN XML

BPMN XML import and export are permanently out of scope for v1. Do not add XML parsing, serialization, or schema validation.

### 2.5 Client-side only

All parsing, layout, and rendering must run in the browser with no server round-trip. Do not add backend routes for diagram processing.

### 2.6 Mermaid plugin contract

The plugin must maintain a valid `ExternalDiagramDefinition` object in `bpmn-plugin.ts`:

```ts
{
  id: DETECTOR_KEY,       // 'BPMNDiagram'
  detector: detect,       // (text, config?) => boolean
  loader: async () => ({
    id: DETECTOR_KEY,
    diagram: {
      db,                 // BpmnDb instance (shared)
      renderer: { draw }, // (text, id, version, obj) => void | Promise<void>
      parser: parserDef,  // { parse(text): void; yy: db }
      styles,             // (options?) => string
    },
  }),
}
```

---

## 3. DSL standard

### 3.1 Header

Every `bpmn-beta` diagram must start with the keyword `bpmn-beta` on the first non-blank, non-comment line. The parser must strip:
- YAML front matter (`--- ... ---`)
- Mermaid init directives (`%%{...}%%`)
- Line comments (`%%...`)

### 3.2 Node ID rules

- Must be unique within a diagram
- Must match: `[a-zA-Z][a-zA-Z0-9_]*`
- Must not be a reserved keyword

### 3.3 Node types (v1 in-scope)

| Keyword | Kind | Subtype | Visual |
|---|---|---|---|
| `start` | event | start | Thin circle |
| `end` | event | end | Thick circle |
| `task` | task | — | Rounded rect |
| `task:user` | task | user | Person marker |
| `task:service` | task | service | Gear marker |
| `task:script` | task | script | Script marker |
| `task:receive` | task | receive | Envelope marker |
| `task:send` | task | send | Filled envelope |
| `xor` | gateway | xor | Diamond + X |
| `and` | gateway | and | Diamond + + |
| `or` | gateway | or | Diamond + O |

### 3.4 Flow operators

| Operator | Kind | Notes |
|---|---|---|
| `A --> B` | sequence | Standard sequence flow |
| `A -->|"label"| B` | conditional | Label is the condition expression |
| `A ==> B` | default | Slash marker on source node |
| `A ~~> B` | message | Dashed line; **top-level only** |

### 3.5 Message flow constraint

Message flows (`~~>`) must be declared at the top level of the diagram. A parser error must be thrown if `~~>` appears inside a `pool` or `lane` block:

```
ParseError: Line N: message flows (~~>) must be declared at the top level, not inside a pool or lane block
```

### 3.6 Pool and lane blocks

```
pool <id> "<label>" {
  lane <id> "<label>" {
    <node declarations>
  }
}
```

Rules:
- Pool IDs and lane IDs must be unique across the diagram
- Lanes must be directly inside a pool block
- Nested lanes are not supported (throw a parse error)
- Message flows that cross pool boundaries must be declared outside all pool blocks

### 3.7 Directives

| Keyword | Purpose |
|---|---|
| `accTitle: <text>` | Accessibility title (SVG `<title>`) |
| `accDescr: <text>` | Accessibility description (SVG `<desc>`) |

No other directives are supported in v1.

---

## 4. Rendering standard

### 4.1 CSS class names

All SVG shapes must use `.bpmn-*` class names. No inline `style` attributes on rendered shapes.

| Class | Element |
|---|---|
| `.bpmn-event` | Start event circle |
| `.bpmn-event-start-inner` | Start event inner fill |
| `.bpmn-event-end` | End event circle |
| `.bpmn-task` | Task rectangle |
| `.bpmn-task-marker` | Task type marker shapes |
| `.bpmn-gateway` | Gateway diamond |
| `.bpmn-gateway-marker` | XOR/AND marker lines |
| `.bpmn-gateway-or-marker` | OR marker circle/lines |
| `.bpmn-pool` | Pool container border |
| `.bpmn-pool-header` | Pool header fill |
| `.bpmn-lane` | Lane border |
| `.bpmn-lane-header` | Lane header fill |
| `.bpmn-flow-sequence` | Sequence flow line |
| `.bpmn-flow-conditional` | Conditional flow line |
| `.bpmn-flow-default` | Default flow line |
| `.bpmn-flow-message` | Message flow line (dashed) |
| `.bpmn-flow-association` | Association line |
| `.bpmn-arrow` | Filled arrowhead |
| `.bpmn-arrow-open` | Open arrowhead (message) |
| `.bpmn-slash` | Default flow slash marker |
| `.bpmn-text` | Node labels |
| `.bpmn-text-muted` | Flow labels |
| `.bpmn-text-label` | Pool/lane header labels |

### 4.2 SVG accessibility

Every rendered SVG must emit:
- `role="img"` on the root `<svg>` element
- `aria-labelledby="${id}-title ${id}-desc"` on the root `<svg>` element
- `<title id="${id}-title">` with the `accTitle` value (or "BPMN Diagram")
- `<desc id="${id}-desc">` with the `accDescr` value

### 4.3 Marker ID scoping

Arrow and slash marker IDs in `<defs>` must be scoped with the diagram's `id` to prevent conflicts when multiple diagrams appear on the same page:

```
${diagramId}-arrow
${diagramId}-arrow-msg
${diagramId}-slash
```

---

## 5. Theming standard

### 5.1 Theme variable mapping

When running inside Mermaid, the styles function must read from Mermaid's `themeVariables` config block, not from static constants:

| BpmnThemeOptions key | Mermaid themeVariables source | Fallback |
|---|---|---|
| `primaryColor` | `themeVariables.primaryColor` | `#1890ff` |
| `lineColor` | `themeVariables.lineColor` | `#333333` |
| `mainBkg` | `themeVariables.mainBkg` | `#ffffff` |
| `nodeBorder` | `themeVariables.nodeBorder` | `#999999` |
| `clusterBkg` | `themeVariables.clusterBkg` | `#efefef` |
| `textColor` | `themeVariables.textColor` | `#333333` |

### 5.2 CSS custom properties

`LIGHT_THEME` (CSS custom properties) is for the playground only, where Tailwind's `:root` variables are defined. Never use `LIGHT_THEME` in the Mermaid plugin. Always use `buildMermaidTheme()` in plugin context.

---

## 6. Testing standard

| Test type | Required for | Location |
|---|---|---|
| Detector unit tests | Every syntax pattern the detector handles | `__tests__/bpmn-detector.test.ts` |
| DB unit tests | Every `BpmnDb` method | `__tests__/bpmn-db.test.ts` |
| Parser unit tests | Every node type, flow type, and error condition | `__tests__/bpmn-parser.test.ts` |
| Corpus tests | Every `examples/*.mmd` file | `__tests__/bpmn-parser-corpus.test.ts` |
| Renderer snapshot tests | Every SVG output pattern (planned) | `__tests__/bpmn-renderer.test.ts` |
| Layout regression tests | Pool widths and node positions (planned) | `__tests__/bpmn-layout.test.ts` |

- All tests must pass before any commit that touches `src/lib/`
- Corpus tests must be updated when a new `.mmd` example is added

---

## 7. Documentation standard

### 7.1 Required files

Before v0.1.0 npm publish, all of the following must exist and be current:

| File | Purpose |
|---|---|
| `README.md` | Root project README |
| `AGENTS.md` | AI agent and contributor guidance |
| `CHANGELOG.md` | Release history |
| `CONTRIBUTING.md` | Contributor onboarding |
| `LICENSE` | MIT |
| `docs/dsl-spec.md` | Standalone DSL specification |
| `docs/mermaid-compatibility.md` | Plugin contract reference |
| `docs/decisions.md` | Decision log |
| `docs/ROADMAP.md` | Versioned roadmap |
| `docs/RELEASE_CHECKLIST.md` | Pre-release gate |
| `docs/technical-debt-register.md` | Known-debt register |

### 7.2 Decision log entries

Every breaking DSL change, architecture change, or scope change requires a new entry in `docs/decisions.md` with:
- A unique `DEC-NNN` ID
- Decision title
- Status (proposed / accepted / superseded)
- Rationale
- Consequences
