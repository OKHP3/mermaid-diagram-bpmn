# SVG export compatibility check

**Validation date:** 2026-08-24 (America/Los_Angeles)
**Scope:** Playground SVG export with a task label and an annotation

## Representative export

The export was generated through the live Playground UI, not by calling the
serializer directly, using this `bpmn-beta` source:

```text
bpmn-beta
accTitle: Export Compatibility Check
accDescr: A representative process with a task label and a muted annotation.

task:user t1 "Review Request"
note n1 "SLA: 48 hours"
t1 --- n1
```

The browser download produced `diagram.svg`. The captured SVG was inspected
before being removed from temporary storage.

## Local evidence

- The export contains the expected `title` and `desc` metadata.
- The export contains two SVG `<text>` elements: `Review Request` and
  `SLA: 48 hours`.
- The text is represented as SVG text, not outlines. The export contains no
  text converted to a path.
- The annotation is present as `.bpmn-annotation` and the association connector
  is present.
- The serialized style contains the concrete `EXPORT_THEME` values and no
  unresolved `var(--...)` custom properties.
- Primary text uses the portable sans stack:
  `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`.
- Muted text uses the portable fixed-width stack:
  `ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace`.
- ImageMagick successfully rasterized the SVG to a 560×720 PNG. This confirms
  the file is syntactically renderable, but rasterization is not an editor
  compatibility test.

On this Linux environment, the installed-font fallback resolves to DejaVu
Sans for the sans stack and DejaVu Sans Mono for the fixed-width stack. This
is expected substitution behavior and preserves the visual distinction.

## Vector-editor availability

| Tool | Result |
| --- | --- |
| Inkscape | Not installed in the validation environment |
| Figma | Not available as a local executable or connected import target |
| Illustrator | Not installed in the validation environment |

Consequently, external-editor selection/editability could not be directly
verified here. The repository has browser and serialization evidence that text
nodes and portable font declarations survive export, but a future validation
run with those editors should still confirm that imported text remains
selectable/editable and that each editor applies the documented fallback.

## 2026-08-24 availability rerun

The vector-editor availability check was repeated in the current validation
environment before attempting an import:

- `inkscape`, `illustrator`, and other local editor executables were not found.
- No Figma import target or Figma connection was available.
- The session has no supported editor workflow through which `diagram.svg`
  could be opened.

Therefore no editor import was performed, and there is no new observation to
report for text selection/editability or editor-specific font fallback. The
claims above remain limited to the captured SVG structure and Linux font
fallback evidence; they must not be treated as an external-editor result.

## 2026-08-25 availability rerun

The vector-editor availability check was repeated again before attempting the
representative import:

- No `inkscape`, `illustrator`, Krita, or other supported local vector-editor
  executable was found.
- No Figma import target or Figma connection was available.
- No supported editor workflow was available for opening `diagram.svg`.

Therefore the representative export could not be imported, and task-label or
annotation selection/editability remains unverified. Sans and monospace
fallback remain visually distinct only under the documented Linux
font-resolution evidence; no editor-specific fallback result is claimed.
