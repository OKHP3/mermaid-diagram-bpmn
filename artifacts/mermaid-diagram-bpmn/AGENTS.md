# AGENTS.md — BPMN for Mermaid

Guidance for AI agents, automated tools, and contributors working on this repository.

## Project identity

**BPMN for Mermaid** (`mermaid-diagram-bpmn`) is a personal [OverKill Hill P³](https://overkillhill.com) project by Jamie Hill. It is a contributor-facing prototype for a Mermaid-native `bpmn-beta` diagram type. It is not affiliated with Mermaid, Mermaid Chart, Mermaid.ai, the OMG BPMN standards body, or any third-party brand.

## Canonical disclaimer

Always include this disclaimer in README and major docs:

> BPMN for Mermaid is a personal OverKill Hill P³ project by Jamie Hill. It is not affiliated with the mermaid-js maintainers, Mermaid Chart, Mermaid.ai, or any standards body. It implements a documented descriptive subset of BPMN 2.0 — it does not claim full BPMN 2.0 compliance.

## Architecture constraints

Never add:
- `bpmn-js` runtime dependency — SVG rendering is hand-written (see DEC-002)
- BPMN XML import or export (explicitly out of scope for v1)
- Backend server — this is fully client-side in the browser
- LLM inference or AI API calls
- User authentication or accounts
- Any dependency not imported in `src/`

## Module governance

The pipeline has exactly 5 stages. Each stage is a separate module. Do not collapse stages:

```
detect → parse → layout → render → styles
bpmn-detector.ts → bpmn-parser.ts → bpmn-layout.ts → bpmn-renderer.tsx → bpmn-styles.ts
```

`BpmnDb` is the canonical data store between pipeline stages. Parser populates it. Layout and renderer read from it. No data flows around it.

When adding a new BPMN element type:
1. Add typed interface to `bpmn-db.ts`
2. Add parsing logic to `bpmn-parser.ts`
3. Add layout logic to `bpmn-layout.ts`
4. Add SVG rendering to `bpmn-renderer.tsx` AND `bpmn-plugin.ts` draw function
5. Add CSS class to `bpmn-styles.ts`
6. Add or update at least one corpus test

Do not break this sequence. Do not add rendering logic to the parser or layout logic to the renderer.

## DSL governance

- The header keyword is `bpmn-beta` — always. Not `bpmn`. Not `bpmn-diagram`.
- `beta` belongs only in the DSL header keyword. Do not use "beta" in user-facing copy.
- Message flows (`~~>`) must be declared at the top level, not inside pool or lane blocks.
- Pool/lane nesting is one level deep. Nested lanes are not supported in v1.
- New element types must be added to the support matrix on the Home page AND to `docs/dsl-spec.md` before the next release.
- Experimental elements must carry the `experimental: true` flag in `bpmn-examples.ts`.

## Mermaid compatibility governance

The plugin contract is defined in `bpmn-plugin.ts`. These contracts must be kept in sync with the installed Mermaid version:

```ts
export const MERMAID_VERSION_TARGET = "10.x"; // update when target changes
```

When the Mermaid target version changes:
1. Re-verify `ExternalDiagramDefinition` shape against new Mermaid source
2. Update `docs/mermaid-compatibility.md`
3. Re-run all 58 tests
4. Update `MERMAID_VERSION_TARGET` constant

## Testing standards

- All lib modules must have unit tests in `src/lib/__tests__/`
- All `examples/*.mmd` files must be covered by corpus tests
- `pnpm --filter @workspace/mermaid-diagram-bpmn run test` must pass before every commit
- `pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck` must pass before every commit
- Renderer snapshot tests are planned (TD-006) — add them when shape library is extracted

## Style and naming

- SVG classes: `.bpmn-*` — no other prefix
- TypeScript: strict mode, no `any` without documented justification
- File names: `bpmn-*.ts` / `bpmn-*.tsx` for all lib modules
- Do not add `console.log` to any lib module (test files are OK)
- Keep `BpmnDb` as the canonical store — do not introduce parallel data structures

## Versioning

- This project is pre-1.0. The npm package has not been published.
- Version format: `0.MINOR.PATCH` until first public npm publish
- Breaking DSL changes require a minor bump
- `MERMAID_VERSION_TARGET` is the governance constant for Mermaid API compatibility

## UI rules

- The public title is "BPMN for Mermaid" — not "bpmn-beta"
- Do not over-claim BPMN 2.0 compliance anywhere in the UI
- The Status Ribbon ("The Forge — Contributor Prototype") must remain on the Home page until the npm package ships
- Examples marked `experimental: true` must display a visual badge and explanatory note in the playground
