# GitHub Copilot Instructions — BPMN for Mermaid

This workspace contains a personal OverKill Hill P³ project by Jamie Hill.
Read these instructions before generating any code, comments, or documentation.

---

## Identity and brand firewall

This is a **personal project repository**. It is not affiliated with any employer,
corporation, or third-party brand. Copilot must never generate content that references:

- Builders FirstSource, BFS, BuildersFirstSource, BFS Light, Builders Blue, FirstSource
- Any employer, daytime workplace, or work-related product of the developer
- Any corporate or third-party brand theme, logo, or hex value
- bpmn-js, Camunda, Activiti, or any commercial BPMN tooling branding

If uncertain whether a reference is safe: omit it.

---

## Dual-compliance requirement

Every rendered BPMN element must satisfy **both** standards. Neither takes priority:

| Standard | Authority |
|---|---|
| Mermaid rendering | `registerExternalDiagrams()` API contract in `src/lib/bpmn-plugin.ts` |
| BPMN 2.0.2 notation | OMG BPMN 2.0.2 formal spec — `standards/OMG-BPMN-2.0.2-formal-specification.pdf` |

A diagram that renders in Mermaid but uses wrong BPMN notation is a failed document.
A diagram that follows BPMN notation but fails to render in Mermaid is equally a failed document.

---

## Architecture rules

The app at `artifacts/mermaid-diagram-bpmn/` is permanently **static and browser-only**.
Never suggest adding:

- A backend server, API route, or serverless function
- User login, authentication, or session management
- AI API calls or LLM inference within the app
- Payment processing or cloud storage
- `bpmn-js`, `bpmn-moddle`, or any bpmn-js ecosystem dependency
- BPMN XML import or export

---

## Module pipeline (immutable — do not collapse stages)

```
detect → parse → layout → render → styles
bpmn-detector.ts → bpmn-parser.ts → bpmn-layout.ts → bpmn-renderer.tsx → bpmn-styles.ts
```

`BpmnDb` is the canonical data store between stages. Do not introduce parallel data structures.

---

## DSL rules

- Header keyword: `bpmn-beta` — always, exactly this. Not `bpmn`. Not `BPMN`. Not `bpmn-diagram`.
- Message flows (`~~>`) must be at the top level, never inside a pool or lane block.
- All generated DSL must use unique lowercase IDs matching `[a-zA-Z][a-zA-Z0-9_]*`.

---

## Notation compliance rules

When generating or modifying SVG rendering code:

1. Check `artifacts/mermaid-diagram-bpmn/standards/BPMN-SPEC-REFERENCE.md` for the relevant spec section
2. Use `.bpmn-*` CSS class names — never inline `style` attributes on rendered shapes
3. Start events: thin single-line circle (spec 10.4.1)
4. End events: thick single-line circle (spec 10.4.2)
5. Tasks: rounded rectangle with type marker in top-left (spec 10.2)
6. Exclusive gateway: diamond + X marker (spec 13.1.2)
7. Parallel gateway: diamond + + marker (spec 13.1.4)
8. Inclusive gateway: diamond + O marker (spec 13.1.3)
9. Default flow: slash on source end of line (spec 9.1.4)
10. Message flow: dashed line, open arrowhead (spec 9.2)

---

## Code generation style

- TypeScript strict mode — all source files in `artifacts/mermaid-diagram-bpmn/src/` are TypeScript
- Tailwind CSS v4 for page styling — no inline styles on UI elements
- Functional React components — no class components
- File names for lib modules: `bpmn-*.ts` / `bpmn-*.tsx`
- SVG class names: `.bpmn-*` prefix only
- No `console.log` in any lib module
- No `any` without a documented justification comment

---

## Versioning constant

`MERMAID_VERSION_TARGET` in `artifacts/mermaid-diagram-bpmn/src/lib/bpmn-plugin.ts` tracks
Mermaid API compatibility. Update it when the Mermaid target version changes. Do not
update it without also verifying the `ExternalDiagramDefinition` shape.

---

## What to do if unsure

1. Check `AGENTS.md` at repo root for project-level rules
2. Check `artifacts/mermaid-diagram-bpmn/AGENTS.md` for artifact-level rules
3. Check `artifacts/mermaid-diagram-bpmn/standards/bpmn-beta-standard.md` for design and architecture constraints
4. Check `artifacts/mermaid-diagram-bpmn/standards/BPMN-SPEC-REFERENCE.md` for notation compliance
5. When in doubt about BPMN notation: **open the spec PDF and verify the spec section**
