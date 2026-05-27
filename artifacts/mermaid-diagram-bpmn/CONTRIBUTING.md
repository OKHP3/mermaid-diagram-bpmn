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

Both must pass before submitting a PR.

## Brand and identity rules

See `AGENTS.md`. Do not claim full BPMN 2.0 compliance. Do not use "bpmn" (without `-beta`) as the DSL keyword. The public title is "BPMN for Mermaid" — not "bpmn-beta tool" or anything with "beta" in the product name.

## Current implementation status

| Category | Elements |
|---|---|
| **Implemented** | `start`, `end`; `task`, `task:user`, `task:service`, `task:script`, `task:receive`, `task:send`; `xor`, `and`, `or`; sequence flow `-->`, conditional label, default flow `==>`; `accTitle`/`accDescr`; auto layout; theme-aware SVG styling |
| **Experimental** | `pool`, `lane`, message flow `~~>`, pool/lane-aware layout, cross-pool routing |
| **Planned** | Intermediate events, timer/message/error markers, text annotations, associations, Langium grammar, Mermaid External Diagram API packaging, `getStyles` theme variable binding, parser-enforced BPMN domain rules |
| **Out of scope (v1)** | BPMN XML import/export, executable semantics, `bpmn-js` runtime dependency, choreography, conversation, complex gateways, event subprocesses |

## Dual-compliance requirement

Every rendered element must satisfy both standards equally — neither takes priority:

- **Mermaid rendering**: output must render correctly in all Mermaid-compatible hosts. Plugin v1 target: `registerExternalDiagrams()`. Current state: standalone React app with direct SVG renderer.
- **BPMN 2.0.2 notation**: shapes, markers, and flows must match the OMG specification.

See `standards/bpmn-spec-reference.md` for the element-by-element compliance map.

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
5. Add CSS class(es) to `bpmn-styles.ts`
6. Add an example to `examples/` and update `bpmn-examples.ts`
7. Add unit tests to `src/lib/__tests__/`
8. Update the support matrix on the Home page and in `docs/dsl-spec.md`
9. Verify notation against `standards/bpmn-spec-reference.md`

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

## Project surfaces

| Surface | URL |
|---|---|
| Public project page | https://overkillhill.com/projects/bpmn-for-mermaid/ |
| GitHub repository | https://github.com/OKHP3/mermaid-diagram-bpmn |
| Public playground | https://okhp3.github.io/mermaid-diagram-bpmn |
| Strategy doc | docs/strategy.md |
| Version checklist | docs/version-checklist.md |

## License

MIT. All contributions are under the same license.

Built by [OverKill Hill P³](https://overkillhill.com).
