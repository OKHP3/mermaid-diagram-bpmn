# Contributing to BPMN for Mermaid

## Quick Start

```bash
pnpm install
pnpm --filter @workspace/mermaid-diagram-bpmn run dev
```

## Run tests

```bash
pnpm --filter @workspace/mermaid-diagram-bpmn run test
pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck
```

Both must pass before submitting a PR.

## Brand and identity rules

See `AGENTS.md`. Do not claim full BPMN 2.0 compliance. Do not use "bpmn" (without `-beta`) as the DSL keyword. The public title is "BPMN for Mermaid" — not "bpmn-beta tool" or anything with "beta" in the product name.

## What we accept

- Bug fixes in the parser, layout engine, or renderer
- New BPMN element types that are in-scope (see Home page support matrix)
- New `.mmd` corpus examples (must be accompanied by corpus test updates)
- Documentation improvements
- Accessibility improvements
- Mermaid plugin compatibility fixes

## What we don't accept

- `bpmn-js` runtime dependency — the renderer is intentionally hand-written
- BPMN XML import or export
- Backend server, user accounts, or cloud storage
- New element types that are explicitly out-of-scope in v1 (event subprocesses, choreography, conversation diagrams)
- Breaking DSL changes without a minor version bump and decision log entry

## Adding a new element type

1. Add the typed interface to `bpmn-db.ts`
2. Add parsing regex and logic to `bpmn-parser.ts`
3. Add layout dimensions to `bpmn-layout.ts`
4. Add SVG rendering to `bpmn-renderer.tsx`
5. Add the same SVG rendering to `bpmn-plugin.ts` draw function (keeps playground + plugin in sync)
6. Add CSS class(es) to `bpmn-styles.ts`
7. Add an example to `examples/` and update `bpmn-examples.ts`
8. Add unit tests to `src/lib/__tests__/`
9. Update the support matrix on the Home page and in `docs/dsl-spec.md`

## DSL changes

Any change to the DSL syntax requires:
1. A new entry in `docs/decisions.md`
2. Updated `docs/dsl-spec.md`
3. Updated examples if affected
4. Parser tests for the new/changed syntax

## Proposing a new feature

Open an issue on GitHub with:
- The BPMN use case you're trying to cover
- A proposed DSL syntax snippet
- Why it fits the "Descriptive Subset" scope

DSL syntax is unstable before v1.0. Proposals are welcome — breaking changes require a decision log entry.

## License

MIT. All contributions are under the same license.

Built by [OverKill Hill P³](https://overkillhill.com).
