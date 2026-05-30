# bpmn-beta Standard

**Version:** 0.1
**Owner:** OverKill Hill P³ / Jamie Hill
**Status:** Active — DSL unstable pre-v1.0

This document defines the technical and design standards that all DSL features, parser behavior, rendering, and documentation in BPMN for Mermaid must conform to.

---

## Dual-compliance requirement

This project has two co-equal hard requirements. **Failure on either side produces a failed document. Neither standard takes priority over the other.**

| Standard | Authority | Current state | Acceptance target |
|---|---|---|---|
| **Mermaid rendering** | Mermaid `registerExternalDiagrams()` API | React playground and source-level External Diagram adapter exist | Plugin renders through `registerExternalDiagrams()` and `mermaid.render()` in supported Mermaid hosts |
| **BPMN 2.0.2 notation** | OMG BPMN 2.0.2 Formal Specification — Descriptive Conformance Sub-Class | Supported elements are rendered as BPMN notation, with experimental pool/lane/message routing | Supported elements match the spec notation or cite an explicit decision-log exception |

When these two requirements create tension, open a `docs/decisions.md` entry and document the trade-off explicitly. Do not silently favor one over the other.

---

## Authoritative standards

**BPMN notation standard:**

| Resource | Location |
|---|---|
| Specification PDF | `app/standards/omg-bpmn-2.0.2-formal-specification.pdf` |
| Section-by-section compliance map | `app/standards/bpmn-spec-reference.md` |
| BPMN standard home | https://www.bpmn.org/ |
| OMG specification page | https://www.omg.org/spec/BPMN/2.0.2/PDF |

**Mermaid rendering standard:**

| Resource | Location |
|---|---|
| Plugin contract | `src/lib/bpmn-plugin.ts` |
| Compatibility reference | `docs/mermaid-compatibility.md` |
| Mermaid API docs | https://mermaid.js.org |
| Detector key | `DETECTOR_KEY` in `bpmn-detector.ts` |

This project targets a documented BPMN 2.0 descriptive process-modeling subset. Any element outside that target requires a `docs/decisions.md` entry before implementation.

---

## 1. Identity standard

### 1.1 Project identity

- This is a personal project of Jamie Hill / OverKill Hill P³.
- It is not affiliated with any employer, the mermaid-js maintainers, Mermaid Chart, Mermaid.ai, OMG, ISO, or any standards body.
- The canonical disclaimer must appear in README and major public docs.

### 1.2 Name usage

| Context | Correct | Incorrect |
|---|---|---|
| DSL header keyword | `bpmn-beta` | `bpmn`, `BPMN`, `bpmn-diagram` |
| Public product name | BPMN for Mermaid | bpmn-beta tool, BPMN Beta |
| Repository name | `mermaid-diagram-bpmn` | anything else |
| Detector key constant | `BPMNDiagram` | anything else |

### 1.3 Compliance claims

Always use:

> a documented BPMN 2.0 descriptive subset

Never use:

- BPMN 2.0 compliant
- full BPMN support
- standards-compliant BPMN

---

## 2. Architecture standard

### 2.1 Pipeline immutability

The five-stage pipeline is fixed. Stages must not be collapsed, merged, or bypassed:

```text
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

The renderer is permanently hand-written SVG. Do not add `bpmn-js`, `bpmn-moddle`, or any bpmn-js ecosystem package as a runtime dependency.

### 2.4 No BPMN XML in v1

BPMN XML import and export are out of scope for v1. Do not add XML parsing, serialization, or schema validation without a decision-log entry that moves it into a future scope.

### 2.5 Client-side only

All parsing, layout, and rendering must run in the browser with no server round-trip. Do not add backend routes for diagram processing.

### 2.6 Mermaid plugin contract

The plugin must maintain a valid External Diagram Definition object in `bpmn-plugin.ts`:

```ts
{
  id: DETECTOR_KEY,       // 'BPMNDiagram'
  detector: detect,       // (text, config?) => boolean
  loader: async () => ({
    id: DETECTOR_KEY,
    diagram: {
      db,                 // BpmnDb instance
      renderer: { draw }, // (text, id, version, obj) => void | Promise<void>
      parser: parserDef,  // { parse(text): void; yy: db }
      styles,
    },
  }),
}
```

---

## 3. DSL standard

### 3.1 Header

Every `bpmn-beta` diagram must start with the keyword `bpmn-beta` on the first non-blank, non-comment line. The detector/parser must tolerate or strip:

- YAML front matter (`--- ... ---`)
- Mermaid init directives (`%%{...}%%`)
- Line comments (`%%...`)

### 3.2 Node ID rules

- Must be unique within a diagram.
- Must match `[a-zA-Z][a-zA-Z0-9_]*`.
- Must not be a reserved keyword.

### 3.3 Node types

| Keyword | Kind | Subtype | Visual |
|---|---|---|---|
| `start` | event | start | Thin circle |
| `end` | event | end | Thick circle |
| `task` | task | none | Rounded rect |
| `task:user` | task | user | Person marker |
| `task:service` | task | service | Gear marker |
| `task:script` | task | script | Script marker |
| `task:receive` | task | receive | Envelope marker |
| `task:send` | task | send | Filled envelope |
| `xor` | gateway | xor | Diamond + X |
| `and` | gateway | and | Diamond + + |
| `or` | gateway | or | Diamond + O |

### 3.4 Flow operators

| Syntax | Kind | Notes |
|---|---|---|
| `A --> B` | sequence | Standard sequence flow |
| `A --> B: "label"` | conditional | Label is the condition expression; this is the current parser syntax |
| `A ==> B` | default | Slash marker on source side |
| `A ~~> B` | message | Dashed line; top-level only |

Do not document `A -->|"label"| B` as canonical syntax unless the parser is explicitly changed to support it.

### 3.5 Message flow constraint

Message flows (`~~>`) must be declared at the top level of the diagram. A parser error must be thrown if `~~>` appears inside a `pool` or `lane` block:

```text
ParseError: Line N: message flows (~~>) must be declared at the top level, not inside a pool or lane block
```

### 3.6 Pool and lane blocks

```text
pool <id> "<label>" {
  lane <id> "<label>" {
    <node declarations>
  }
}
```

Rules:

- Pool IDs and lane IDs must be unique across the diagram.
- Lanes must be directly inside a pool block.
- Nested lanes are not supported.
- Message flows that cross pool boundaries must be declared outside all pool blocks.
- Pool and lane rendering remains experimental until routing is deterministic.

### 3.7 Directives

| Keyword | Purpose |
|---|---|
| `accTitle: <text>` | Accessibility title, emitted as SVG `<title>` |
| `accDescr: <text>` | Accessibility description, emitted as SVG `<desc>` |

No other directives are supported in v1.

---

## 4. Rendering standard

### 4.1 CSS class names

All SVG shapes must use `.bpmn-*` class names. Avoid inline `style` attributes on rendered shapes.

| Class | Element |
|---|---|
| `.bpmn-event` | Start event circle |
| `.bpmn-event-start-inner` | Start event inner marker if rendered by current visual design |
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
| `.bpmn-flow-message` | Message flow line |
| `.bpmn-flow-association` | Association line, planned |
| `.bpmn-arrow` | Filled arrowhead |
| `.bpmn-arrow-open` | Open arrowhead for message flow |
| `.bpmn-slash` | Default flow slash marker |
| `.bpmn-text` | Node labels |
| `.bpmn-text-muted` | Flow labels |
| `.bpmn-text-label` | Pool/lane header labels |

### 4.2 SVG accessibility

Every rendered SVG must emit:

- `role="img"` on the root `<svg>` element.
- `aria-labelledby="${id}-title ${id}-desc"` on the root `<svg>` element.
- `<title id="${id}-title">` with the `accTitle` value, or `BPMN Diagram` fallback.
- `<desc id="${id}-desc">` with the `accDescr` value.

### 4.3 Marker ID scoping

Arrow and slash marker IDs in `<defs>` must be scoped with the diagram ID to prevent conflicts when multiple diagrams appear on the same page:

```text
${diagramId}-arrow
${diagramId}-arrow-msg
${diagramId}-slash
```

---

## 5. Theming standard

### 5.1 Theme variable mapping

When running inside Mermaid, the styles function must read from Mermaid theme variables, not static site constants.

| BpmnThemeOptions key | Mermaid themeVariables source | Fallback |
|---|---|---|
| `primaryColor` | `themeVariables.primaryColor` | `#1890ff` |
| `lineColor` | `themeVariables.lineColor` | `#333333` |
| `mainBkg` | `themeVariables.mainBkg` | `#ffffff` |
| `nodeBorder` | `themeVariables.nodeBorder` | `#999999` |
| `clusterBkg` | `themeVariables.clusterBkg` | `#efefef` |
| `textColor` | `themeVariables.textColor` | `#333333` |

### 5.2 CSS custom properties

Playground CSS custom properties are for the React app only. Do not rely on site-level CSS custom properties inside Mermaid's isolated SVG context.

---

## 6. Testing standard

| Test type | Required for | Typical location |
|---|---|---|
| Detector unit tests | Every syntax pattern the detector handles | `__tests__/bpmn-detector.test.ts` |
| DB unit tests | Every `BpmnDb` method | `__tests__/bpmn-db.test.ts` |
| Parser unit tests | Every node type, flow type, and error condition | `__tests__/bpmn-parser.test.ts` |
| Corpus tests | Every `examples/*.mmd` file | `__tests__/bpmn-parser-corpus.test.ts` |
| Renderer snapshot tests | Every SVG output pattern | `__tests__/bpmn-renderer.test.ts` |
| Layout regression tests | Pool widths and node positions | `__tests__/bpmn-layout.test.ts` |
| Mermaid adapter tests | External Diagram adapter behavior | `__tests__/bpmn-plugin.test.ts` |

All tests must pass before any commit that touches parser, layout, renderer, or plugin adapter code. Corpus tests must be updated when a new `.mmd` example is added.

---

## 7. Documentation standard

Before v0.1.0 package publication, all of the following must exist and be current:

- README project status and surfaces.
- DSL specification.
- Mermaid compatibility reference.
- BPMN notation/compliance reference.
- Contribution guide.
- Version checklist.
- Public project page alignment.

Documentation must distinguish four states: implemented, experimental, planned, and out of scope.
