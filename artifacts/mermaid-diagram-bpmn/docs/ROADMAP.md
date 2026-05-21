# Roadmap — BPMN for Mermaid

---

## v0.0.1 — Scaffold ✅ Shipped (2026-04-25)

- Project scaffold — React + Vite + Tailwind CSS v4 + wouter + Vitest
- Detector module (`bpmn-detector.ts`)
- Home page with project thesis and design principles
- GitHub Pages deployment via CI/CD

---

## v0.0.2 — Core Pipeline ✅ Shipped (2026-05-05)

- `BpmnDb` typed data store
- Stack-based DSL parser (4 flow types, 11 node types)
- Heuristic auto-layout engine (topological, left-to-right)
- Hand-written SVG renderer with BPMN notation (`.bpmn-*` CSS classes)
- CSS-class-based theming via injected `<style>` block
- Live two-panel Playground with example selector
- DSL Reference, Architecture, Roadmap, About pages
- Unit tests for detector, db, parser (40 tests)

---

## v0.0.3 — Pools, Lanes, Corpus, Pan/Zoom ✅ Shipped (2026-05-06)

- **Pools and lanes (experimental)** — block syntax, stack-based context, pool/lane-aware layout
- **Message flows** (`~~>`) with top-level constraint enforcement
- **Corpus tests** — all 5 examples covered (58 total tests)
- **Pan/zoom on playground** — scroll, drag, control toolbar, reset
- **5 canonical example files** — events, tasks, gateways, pools/lanes, mixed
- **Decision log** — DEC-001 through DEC-020
- **9 CVEs patched** via pnpm overrides

---

## v0.1.0 — Plugin Integration (Target: TBD)

- **`registerExternalDiagrams()` wiring** — verified end-to-end against `mermaid.render()`
- **npm package publish** — `mermaid-diagram-bpmn` on npm with plugin exports
- **Live Mermaid theme binding** — `buildMermaidTheme()` reading `getConfig().themeVariables`
- **Error display in playground** — parser errors shown inline, not blank preview
- **Test pre-gate in CI** — `pnpm test` runs before build/deploy
- **Pruned `package.json`** — remove all unused template dependencies

---

## v0.2.0 — Quality and Shape Library (Target: after v0.1.0)

- **Extract shape library** — move SVG drawing from `bpmn-renderer.tsx` to `src/lib/shapes/`
- **Renderer snapshot tests** — Vitest SVG snapshots for all 5 corpus examples
- **Layout regression tests** — assert pool widths and node positions
- **Accessibility tests** — assert ARIA attributes on SVG output
- **Freeze `BpmnDb` public API** — document stable surface; semver note
- **Enforce message-flow constraint** in parser with clear error message
- **Langium grammar prototype** — `bpmn-grammar.langium`; validate against corpus

---

## v0.3.0 — Feature Expansion (Target: after v0.2.0)

- **Intermediate events** — `msg:start`, `msg:end`, `timer:start` markers
- **Coordinate hints** — optional `@[row,col]` node annotation (DEC-001)
- **Deterministic constraint-based layout** — replace heuristic with proper algorithm
- **Export SVG from playground** — "Export SVG" button
- **Copy DSL to clipboard** — Playground utility button
- **Dark mode toggle** — implement or remove `next-themes`

---

## v1.0.0 — Upstream Proposal (Target: when grammar stabilised)

- **Langium grammar** — production-ready, replacing hand-written parser
- **Upstream Mermaid PR** — draft core PR with DSL spec, tests, npm package
- **Full BPMN practitioner review** — notation correctness sign-off
- **Semantic BPMN validation** — gateway rules, event lifecycle, meaningful errors

---

## Permanently out of scope (v1)

- BPMN XML import / export
- Full BPMN 2.0 execution semantics
- Choreography diagrams
- Conversation diagrams
- Event subprocesses
- Complex gateways
- bpmn-js runtime dependency

---

## Contribution readiness

| Module | Status | Safe to contribute? |
|---|---|---|
| `bpmn-detector.ts` | Stable | Yes |
| `bpmn-db.ts` | Stable | Yes (add stubs only) |
| `bpmn-parser.ts` | Active development | Coordinate first |
| `bpmn-layout.ts` | Active development | Coordinate first |
| `bpmn-renderer.tsx` | Active development | Coordinate first |
| `bpmn-plugin.ts` | New | Yes (needs end-to-end test) |
| `bpmn-styles.ts` | Stable | Yes |
| `bpmn-examples.ts` | Stable | Yes (add examples) |
| Tests | Active | Yes — more is better |

---

*For the full forward-looking backlog (BL-001–BL-020), see `docs/prototype-to-product-retrospective.md`.*
