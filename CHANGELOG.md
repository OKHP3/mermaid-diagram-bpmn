# Changelog

All notable changes to BPMN for Mermaid are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (pre-1.0)

---

## [Unreleased]

### Added
- `bpmn-plugin.ts` — `ExternalDiagramDefinition` entry point for `mermaid.registerExternalDiagrams()`; implements `draw`, `parser.yy`, scoped marker IDs, and live Mermaid theme variable binding
- `docs/mermaid-compatibility.md` — full contract compliance reference for both `mermaid-js/mermaid` and `mermaid-js/mermaid-live-editor`
- `AGENTS.md` — AI agent and contributor guidance (project identity, architecture constraints, module governance)
- `CHANGELOG.md` — this file; backfilled from development history
- `CONTRIBUTING.md` — contributor onboarding guide
- `LICENSE` — MIT
- `docs/ROADMAP.md` — canonical versioned roadmap (migrated from retrospective)
- `docs/DEPLOYMENT.md` — deployment documentation for GitHub Pages and Replit
- `docs/RELEASE_CHECKLIST.md` — pre-release gate checklist
- `docs/PRODUCT_BRIEF.md` — sharp product brief
- `docs/LEGAL.md` — legal notes and brand policy
- `docs/technical-debt-register.md` — prioritized known-debt register (TD-001–TD-017)
- `docs/COPILOT_PROMPT_KIT.md` — reusable AI prompts for generating `bpmn-beta` diagrams
- `docs/prototype-to-product-retrospective.md` — 90-day retrospective analysis
- `docs/as-built-prd.md` — reverse-engineered requirements document
- `standards/bpmn-beta-standard.md` — canonical DSL and module standards
- `standards/parser-safety-checklist.md` — parser safety rules

### Changed
- `bpmn-detector.ts` — added optional `config?: MermaidConfig` second parameter to match `DiagramDetector` type signature
- `bpmn-db.ts` — added `setDiagramTitle`, `getDiagramTitle`, `setDiagramId`, `bindFunctions`, `getConfig` to satisfy Mermaid `DiagramDB` interface
- `bpmn-styles.ts` — added `MERMAID_FALLBACK_THEME` (concrete hex values for Mermaid SVG context); added `buildMermaidTheme()` mapping Mermaid themeVariables to `BpmnThemeOptions`

---

## [0.0.3] — 2026-05-06

### Added
- Pools and lanes (experimental) — pool/lane block syntax, stack-based parser context, pool/lane-aware layout mode
- Message flows (`~~>`) with top-level constraint enforcement
- Corpus tests for all 5 canonical examples (18 tests, 58 total)
- Pan/zoom on playground preview — scroll-wheel zoom (15%–800%), drag-to-pan, control toolbar, reset
- 5 canonical `.mmd` example files covering all v1 element categories
- `bpmn-examples.ts` with `?raw` imports and `experimental` flag
- `docs/decisions.md` — DEC-001 through DEC-020 decision log
- `docs/dsl-spec.md` — standalone DSL specification
- Status ribbon ("The Forge — Contributor Prototype") on Home page
- Support matrix (Implemented / Experimental / Planned / Out-of-scope) on Home page

### Fixed
- 9 CVEs patched via `pnpm-workspace.yaml` version overrides (`lodash`, `picomatch`, `path-to-regexp`, `postcss`)
- Open Graph image updated for social preview

---

## [0.0.2] — 2026-05-05

### Added
- `bpmn-layout.ts` — heuristic topological left-to-right auto-layout engine
- `bpmn-renderer.tsx` — hand-written SVG React component with BPMN notation; `.bpmn-*` CSS class names
- `bpmn-styles.ts` — `getStyles(BpmnThemeOptions)` injected into SVG `<defs>`; `LIGHT_THEME` for playground
- `bpmn-db.ts` — typed `BpmnDb` class with `BpmnNode`, `BpmnFlow`, `BpmnPool`, `BpmnLane` interfaces
- `bpmn-parser.ts` — stack-based line parser; 4 flow types; 11 node types
- Live two-panel Playground with example selector
- DSL Reference page — full syntax tables
- Architecture page — module workstream map
- Roadmap page — in-scope/deferred split + 7-step contribution path
- About page — decision log summary, risk register, how to contribute
- Unit tests for detector, db, and parser (40 tests)
- GitHub Actions CI/CD → GitHub Pages deployment

---

## [0.0.1] — 2026-04-25

### Added
- Project scaffold — React 19 + Vite 7 + Tailwind CSS v4 + wouter + Vitest 3.x
- `bpmn-detector.ts` — `detect(text): boolean`; `DETECTOR_KEY = 'BPMNDiagram'`
- Home page — project thesis, design principles, related Mermaid issues (#7699)
- `replit.md` — project overview and user preferences
- `docs/README.md` — internal documentation index
- Monorepo structure with `pnpm-workspace.yaml`
