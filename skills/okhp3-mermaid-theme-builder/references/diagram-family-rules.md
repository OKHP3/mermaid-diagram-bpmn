# Diagram Family Rules — okhp3-mermaid-theme-builder

Rules for how `themeVariables` coverage differs across Mermaid diagram families.

---

## Detection

Detect family from the first non-whitespace keyword in the diagram body (after stripping any existing `%%{init}%%` block and code fences):

| Keyword(s) | Family |
|---|---|
| `flowchart`, `graph` | Flowchart |
| `sequenceDiagram` | Sequence |
| `classDiagram` | Class |
| `gantt` | Gantt |
| `erDiagram` | ER |
| `stateDiagram-v2`, `stateDiagram` | State |
| `pie` | Pie |
| `journey` | Journey |
| `bpmn-beta` | BPMN (OKHP3 prototype) |
| `mindmap` | Mindmap |
| `xychart-beta` | XY Chart |
| `timeline` | Timeline |
| `block-beta` | Block |

If no keyword is recognized, report as `unknown` and proceed with full variable set (safe default).

---

## Full Support Families

Apply all 21 themeVariables. No renderer note needed (unless target renderer has init-block restrictions — see `references/mermaid-renderer-profiles.md`).

| Family | Notes |
|---|---|
| Flowchart / Graph | Full support. `classDef` can supplement for node-level color differentiation. |
| Class | Full support. Node backgrounds, borders, and text all respond. |
| ER | Full support. Entity boxes, lines, and labels all respond. |
| State | Full support. State nodes, transitions, and labels all respond. |
| XY Chart | Full support. Axis colors and plot fills respond. |
| BPMN (bpmn-beta) | Full support via OKHP3 theme integration. Key variables: `primaryColor` (task fill), `lineColor` (flow arrows), `secondaryColor` (gateway fill), `background`, `nodeBorder`. |

---

## Reduced Support Families

Include a renderer note immediately after the styled output block.

### Sequence

```
Renderer note: Sequence diagrams have partial themeVariables support. Actor box fills and borders respond to primaryColor/primaryBorderColor. Activation box fills use secondaryColor. Note backgrounds use tertiaryColor. Arrow and line colors respond to lineColor. Some renderer versions ignore fontFamily on actor labels. Verify output in your target renderer.
```

Key variables that work: `primaryColor`, `primaryBorderColor`, `secondaryColor`, `tertiaryColor`, `lineColor`, `background`, `fontFamily`, `fontSize`.
Variables with limited effect: `mainBkg`, `clusterBkg`, `nodeBorder`.

### Gantt

```
Renderer note: Gantt diagrams have partial themeVariables support. Background and label colors apply; task bar fills use Mermaid's internal section rotation and do not respond to themeVariables. fontFamily and fontSize apply to axis labels. Verify output in your target renderer.
```

Key variables that work: `background`, `fontFamily`, `fontSize`, `titleColor`, `lineColor`.
Variables with limited effect: `primaryColor`, `mainBkg`, `nodeBorder` (task bars use internal palette).

### Pie

```
Renderer note: Pie charts have partial themeVariables support. Background and font settings apply. Segment colors use Mermaid's internal color rotation and do not respond to themeVariables. To enforce brand colors on pie segments, use classDef workarounds or export to SVG and apply post-processing.
```

Key variables that work: `background`, `fontFamily`, `fontSize`, `titleColor`.
Variables with no effect: `primaryColor`, `mainBkg`, `lineColor`, `nodeBorder` (segments use rotation).

### Journey

```
Renderer note: Journey diagrams have partial themeVariables support. Label and background colors apply; task bar fills use internal section colors. Verify output in your target renderer.
```

Key variables that work: `background`, `fontFamily`, `fontSize`, `titleColor`, `labelBackground`, `labelTextColor`.

### Mindmap

```
Renderer note: Mindmap diagrams have limited themeVariables support. Base colors (background, fontFamily, fontSize) apply. Node fill colors use Mermaid's internal level-based palette and do not fully respond to themeVariables. Verify output in your target renderer.
```

Key variables that work: `background`, `fontFamily`, `fontSize`, `titleColor`.
Variables with limited effect: `primaryColor`, `lineColor`.

### Timeline

```
Renderer note: Timeline diagrams have limited themeVariables support. Background and font settings apply; period and event colors use internal defaults. Verify output in your target renderer.
```

---

## classDef Supplementation

For Flowchart and BPMN diagrams, `classDef` can enforce node-level color overrides beyond the palette:

```
classDef primary fill:#0d4f6c,stroke:#1a7da8,color:#e8f4f8
classDef accent fill:#5cc8e8,stroke:#0d4f6c,color:#0a2535
```

Apply with `:::className` on nodes (flowchart) or as part of post-processing notes (bpmn-beta, which uses its own `.bpmn-*` CSS classes rather than Mermaid classDef).

Only suggest classDef supplementation when:
- The user asks for semantic color differentiation (e.g., "make error states red")
- The diagram family is Flowchart or Graph
- The user has not explicitly restricted output to themeVariables only

---

## bpmn-beta Specific Notes

`bpmn-beta` is the OKHP3 prototype DSL — not a Mermaid v11 native diagram type.

It uses its own internal CSS class set (`.bpmn-event`, `.bpmn-task`, `.bpmn-gateway`, etc.) injected via `getStyles()`. The themeVariables integration works through `buildMermaidTheme()` in the renderer, which maps:

| themeVariable | bpmn-beta internal |
|---|---|
| `primaryColor` | Task fill |
| `lineColor` + `edgeLabelBackground` | Sequence flow line color |
| `mainBkg` + `primaryColor` | Node background |
| `nodeBorder` + `lineColor` | Node border color |
| `clusterBkg` | Pool/lane container background |
| `primaryTextColor` + `textColor` | Label text |

The `%%{init}%%` block must appear before `bpmn-beta` keyword. See `skills/okhp3-bpmn-for-mermaid/references/theming-integration.md` for worked examples.
