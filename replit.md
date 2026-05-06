# BPMN for Mermaid — mermaid-diagram-bpmn

A contributor-facing prototype and documentation workspace for a Mermaid-native `bpmn-beta` diagram type. Serves as the development environment before the GitHub repository is created.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/mermaid-diagram-bpmn run test` — run vitest unit + corpus tests
- Frontend workflow: `artifacts/mermaid-diagram-bpmn: web` (preview at `/`)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite 7 + Tailwind CSS v4
- **Routing**: wouter
- **Test runner**: Vitest 3.x (unit + corpus tests)
- **API/DB**: Express 5 + Drizzle ORM (provisioned but unused by BPMN frontend)

## Where things live

- `artifacts/mermaid-diagram-bpmn/src/lib/` — all library modules
  - `bpmn-detector.ts` — `detect(text): boolean`, `DETECTOR_KEY = 'BPMNDiagram'`
  - `bpmn-db.ts` — `BpmnDb` class with typed nodes, flows, pools, lanes
  - `bpmn-parser.ts` — `parse(source): BpmnDb`; stack-based block parser for pools/lanes
  - `bpmn-layout.ts` — `layoutGraph(db): BpmnLayout`; flat + pool/lane layout modes
  - `bpmn-renderer.tsx` — `<BpmnRenderer source={…} />`; SVG with bpmn-* CSS classes
  - `bpmn-styles.ts` — `getStyles(BpmnThemeOptions): string`; injected into SVG `<defs>`
  - `bpmn-examples.ts` — `BPMN_EXAMPLES[]` with `?raw` imports from `examples/`
  - `__tests__/` — unit tests (detector, db, parser) + corpus tests
- `artifacts/mermaid-diagram-bpmn/examples/` — 5 canonical `.mmd` fixture files
- `artifacts/mermaid-diagram-bpmn/src/pages/` — Home, Playground, Architecture, DslReference, Roadmap, About
- `_unused/` — template scaffolding (api-spec, api-client-react, api-zod, db) moved here

## Architecture decisions

- **No bpmn-js dependency**: The renderer is hand-written SVG in React. Avoids coupling to a heavyweight library with different design goals.
- **bpmn-beta keyword only**: `beta` belongs only in the DSL header keyword. The project title is "BPMN for Mermaid" throughout.
- **Plugin-first path**: Targets Mermaid's `registerExternalDiagrams()` API. Upstream core proposal comes after syntax stabilizes.
- **Client-side only**: No backend routes for diagram rendering. Parser, layout, and renderer all run in the browser.
- **Descriptive subset**: Explicitly not full BPMN 2.0. MVP scope is documented and deferred features are named.
- **BpmnDb as canonical store**: Parser populates a `BpmnDb` instance (not a plain object). Layout and renderer read from `db.getNodes()` / `db.getFlows()` / `db.getPools()` / `db.getLanes()`.
- **bpmn-* CSS class names**: All SVG shapes carry `.bpmn-event`, `.bpmn-task`, etc. class names. Colors come from an injected `<style>` block via `getStyles()`, not inline props.

## Product

- **Home**: Project thesis, strategic positioning, DSL preview, related GitHub issues
- **Playground**: Live two-panel `bpmn-beta` editor with real SVG rendering; 5 examples including pools/lanes
- **DSL Reference**: Full syntax tables for node types, flow operators, pool/lane blocks, directives
- **Architecture**: Module workstream map with current file structure
- **Roadmap**: MVP in-scope (pools/lanes now included) / deferred split + progressive contribution path
- **About**: Key decisions, risk register, how to contribute

## User preferences

- Repo/package slug: `mermaid-diagram-bpmn` (matches future GitHub repo name)
- Public title: "BPMN for Mermaid"
- DSL header keyword: `bpmn-beta` (beta only in DSL, not in project name)
- No overclaiming BPMN 2.0 compliance
- Start with minimal vertical slice before expanding scope

## Gotchas

- The `bpmn-beta` parser uses a stack for block contexts; closing `}` must match an open `pool` or `lane` block
- Message flows (`~~>`) must be declared at the top level, not inside pool/lane blocks
- The `@theme inline` block in `index.css` requires all referenced CSS vars to be defined in `:root`/`.dark`
- Google Fonts import must be the first line in `index.css` before any other `@import`
- `**/*.test.ts` is excluded from the main tsconfig; tests run via `vitest.config.ts` independently
- `lib/api-client-react` was removed from `mermaid-diagram-bpmn`'s deps — do not re-add unless the frontend needs a real API

## Pointers

- Mermaid diagram extension API: https://mermaid.js.org
- Mermaid BPMN issue #7699: https://github.com/mermaid-js/mermaid/issues/7699
- OMG BPMN 2.0 spec: https://www.omg.org/spec/BPMN/
- Related work (Notion): https://www.notion.so/overkillhill/BPMN-for-Mermaid-bpmn-beta-Diagram-Type-Proposal-357812e0ced481c88b20d2eb493dc775
