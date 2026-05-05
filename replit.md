# BPMN for Mermaid — mermaid-diagram-bpmn

A contributor-facing prototype and documentation workspace for a Mermaid-native `bpmn-beta` diagram type. Serves as the development environment before the GitHub repository is created.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Frontend workflow: `artifacts/mermaid-diagram-bpmn: web` (preview at `/`)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS v4
- **Routing**: wouter
- **API framework**: Express 5 (api-server artifact, not used by frontend yet)
- **Database**: PostgreSQL + Drizzle ORM (provisioned but not used in frontend)

## Where things live

- `artifacts/mermaid-diagram-bpmn/src/` — all frontend source
  - `lib/bpmn-parser.ts` — hand-written line parser for `bpmn-beta` DSL
  - `lib/bpmn-layout.ts` — heuristic topological left-to-right layout engine
  - `lib/bpmn-renderer.tsx` — scratch SVG renderer (no bpmn-js dependency)
  - `lib/bpmn-examples.ts` — 4 canonical example diagrams as string constants
  - `components/Layout.tsx` — shared nav + dark mode header
  - `pages/Home.tsx` — hero, thesis, principles, quick DSL preview
  - `pages/Playground.tsx` — two-panel live editor + SVG preview
  - `pages/Architecture.tsx` — module workstream map and repo shape
  - `pages/DslReference.tsx` — full syntax reference tables
  - `pages/Roadmap.tsx` — MVP scope, deferred list, contribution path
  - `pages/About.tsx` — decisions, risks, how to contribute
- `lib/api-spec/openapi.yaml` — API contract (health only, no BPMN routes)

## Architecture decisions

- **No bpmn-js dependency**: The renderer is hand-written SVG in React. Avoids coupling to a heavyweight library with different design goals.
- **bpmn-beta keyword only**: `beta` belongs only in the DSL header keyword. The project title is "BPMN for Mermaid" throughout.
- **Plugin-first path**: Targets Mermaid's `registerDiagram()` API. Upstream core proposal comes after syntax stabilizes.
- **Client-side only**: No backend routes for diagram rendering. Parser, layout, and renderer all run in the browser.
- **Descriptive subset**: Explicitly not full BPMN 2.0. MVP scope is documented and deferred features are named.

## Product

- **Home**: Project thesis, strategic positioning, DSL preview, related GitHub issues
- **Playground**: Live two-panel `bpmn-beta` editor with real SVG rendering
- **DSL Reference**: Full syntax tables for node types, flow operators, directives
- **Architecture**: Module workstream map (Detector, Parser, DiagramDB, Renderer, etc.)
- **Roadmap**: MVP in-scope / deferred split + progressive contribution path
- **About**: Key decisions, risk register, how to contribute

## User preferences

- Repo/package slug: `mermaid-diagram-bpmn` (matches future GitHub repo name)
- Public title: "BPMN for Mermaid"
- DSL header keyword: `bpmn-beta` (beta only in DSL, not in project name)
- No overclaiming BPMN 2.0 compliance
- Start with minimal vertical slice before expanding scope

## Gotchas

- The `bpmn-beta` parser is line-by-line; multi-line blocks (pools, lanes) are not yet supported
- Layout is heuristic — works well for linear chains, less so for complex branching
- The `@theme inline` block in `index.css` requires all referenced CSS vars to be defined in `:root`/`.dark`
- Google Fonts import must be the first line in `index.css` before any other `@import`

## Pointers

- Mermaid diagram extension API: https://mermaid.js.org
- Mermaid BPMN issue #7699: https://github.com/mermaid-js/mermaid/issues/7699
- OMG BPMN 2.0 spec: https://www.omg.org/spec/BPMN/
