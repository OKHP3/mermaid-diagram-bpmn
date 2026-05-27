# Product Brief — BPMN for Mermaid

**Project:** BPMN for Mermaid (`mermaid-diagram-bpmn`)
**Owner:** Jamie Hill / OverKill Hill P³
**Status:** Contributor prototype — pre-v0.1.0
**Last updated:** 2026-05-21

---

## What it is

BPMN for Mermaid is a Mermaid-native diagram type for business process modeling. It implements a documented BPMN 2.0 descriptive subset as a text-first DSL that renders where Mermaid renders: GitHub, Notion, docs portals, and AI outputs.

The path is `registerExternalDiagrams()` first, upstream Mermaid core inclusion second — after syntax and tests stabilize.

---

## The problem it solves

Mermaid is the dominant text-to-diagram tool in developer documentation. It has no native BPMN diagram type. Business analysts, architects, and developers who want version-controllable process diagrams must either misuse `flowchart`, leave Markdown, or use heavyweight tools like bpmn-js or Camunda Modeler that have fundamentally different design goals.

`bpmn-beta` fills this gap with a Mermaid-idiomatic DSL:

```
bpmn-beta
start s1 "Order Received"
task:user t1 "Review Order"
xor g1 "Valid?"
task t2 "Fulfil Order"
end e1 "Order Complete"
s1 --> t1
t1 --> g1
g1 -->|yes| t2
g1 ==> e1
t2 --> e1
```

---

## Core workflow

```
bpmn-beta text → detect → parse → layout → render → SVG in Markdown
```

1. **Write** — DSL in any text file, Markdown, or Mermaid-compatible tool
2. **Detect** — `bpmn-beta` header routes to the plugin
3. **Parse** — stack-based parser populates `BpmnDb`
4. **Layout** — heuristic topological positioning
5. **Render** — hand-written SVG with correct BPMN notation
6. **Preview** — interactive playground with pan/zoom

---

## Non-goals (v1)

- No BPMN XML import or export
- No full BPMN 2.0 execution semantics
- No bpmn-js runtime dependency
- No backend, login, or cloud storage
- No choreography or conversation diagrams

---

## Target audience

| Persona | Goal | How this helps |
|---|---|---|
| Mermaid contributor | Propose a credible bpmn-beta implementation | Working DSL + plugin + tests to build on |
| Mermaid maintainer | Evaluate the DSL for upstream inclusion | Complete spec, tests, playground, compatibility doc |
| Developer/BA | Write BPMN as code in Markdown | Text-first, version-controllable process diagrams |
| BPMN practitioner | Validate notation correctness | Playground for live feedback |

---

## What has been built

- Working DSL parser handling 17 implemented element types
- Typed diagram database (`BpmnDb`) matching Mermaid's DiagramDB contract
- Heuristic layout engine with flat + pool/lane modes
- Hand-written SVG renderer with correct BPMN notation
- `ExternalDiagramDefinition` plugin entry point (`bpmn-plugin.ts`)
- 6-page documentation and playground site
- 5 canonical `.mmd` example files
- 58/58 passing tests
- GitHub Pages public deployment

## What is still missing

- End-to-end verification against `mermaid.render()`
- npm package publication
- Error display in playground
- Test pre-gate in CI/CD
- Shape library extraction
- Renderer snapshot tests

---

## Competitive context

[Mermaid issue #7699](https://github.com/mermaid-js/mermaid/issues/7699) (filed 2026-05-02 by Andreas Emrich, DFKI) proposes a competing BPMN implementation with academic backing. The engagement strategy is documented in `docs/decisions.md` (DEC-012).

---

## Disclaimer

BPMN for Mermaid is a personal OverKill Hill P³ project by Jamie Hill. It is not affiliated with the mermaid-js maintainers, Mermaid Chart, Mermaid.ai, or any standards body. It implements a documented descriptive subset of BPMN 2.0 — it does not claim full BPMN 2.0 compliance.
