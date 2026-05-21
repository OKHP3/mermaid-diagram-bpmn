# Contributing to BPMN for Mermaid

## Quick Start

```bash
pnpm install
pnpm --filter @workspace/mermaid-diagram-bpmn run dev
```

Then open the preview at `/`.

## Run tests

```bash
pnpm --filter @workspace/mermaid-diagram-bpmn run test
pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck
```

Both must pass before submitting a PR. CI enforces this on every push.

## Where things live

```
artifacts/mermaid-diagram-bpmn/
├── src/lib/          ← parser, layout, renderer, plugin (all contributions here)
├── src/pages/        ← playground and documentation pages
├── examples/         ← canonical .mmd fixture files
├── docs/             ← project documentation
└── standards/        ← DSL standard, parser safety checklist, OMG spec PDF
```

## Brand and identity rules

See `AGENTS.md`. Do not claim full BPMN 2.0 compliance. Do not use `bpmn` (without `-beta`) as the DSL keyword anywhere. The public title is "BPMN for Mermaid".

## Dual-compliance requirement

Every rendered element must satisfy both standards equally — neither takes priority:

- **Mermaid rendering**: output must render correctly in all Mermaid-compatible hosts
- **BPMN 2.0.2 notation**: shapes, markers, and flows must match the OMG specification

See `artifacts/mermaid-diagram-bpmn/standards/BPMN-SPEC-REFERENCE.md` for the element-by-element compliance map.

## What we accept

- Bug fixes in the parser, layout engine, or renderer
- New BPMN element types that are in-scope (see Home page support matrix)
- New `.mmd` corpus examples (must be accompanied by corpus test updates)
- Documentation improvements
- Accessibility improvements
- Mermaid plugin compatibility fixes

## What we don't accept

- `bpmn-js` dependency — the renderer is intentionally hand-written
- BPMN XML import or export
- Backend server, user accounts, or cloud storage
- New element types outside the Descriptive Conformance subset without a `docs/decisions.md` entry

## Adding a new element type

1. Add typed interface to `bpmn-db.ts`
2. Add parsing logic to `bpmn-parser.ts`
3. Add layout dimensions to `bpmn-layout.ts`
4. Add SVG rendering to `bpmn-renderer.tsx` AND `bpmn-plugin.ts` draw function
5. Add CSS class to `bpmn-styles.ts`
6. Add an example to `examples/` and update `bpmn-examples.ts`
7. Add unit tests to `src/lib/__tests__/`
8. Update the support matrix on the Home page and in `docs/dsl-spec.md`
9. Verify notation against `standards/BPMN-SPEC-REFERENCE.md`

## DSL changes

Any change to the DSL syntax requires a `docs/decisions.md` entry, updated `docs/dsl-spec.md`, and parser tests.

## License

MIT. All contributions are under the same license.

Built by [OverKill Hill P³](https://overkillhill.com).
