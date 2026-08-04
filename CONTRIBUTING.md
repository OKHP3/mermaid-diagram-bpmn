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

Both should pass before submitting a PR. The current Pages workflow does not
run these checks as a deployment gate, so run them locally before review.

## Where things live

```text
app/
├── src/lib/          parser, layout, renderer, plugin adapter
├── src/pages/        playground and documentation pages
├── examples/         canonical .mmd fixture files
├── docs/             application documentation
└── standards/        BPMN reference material and compliance notes
```

## Brand and identity rules

See `AGENTS.md`. Do not claim full BPMN 2.0 compliance. Do not use `bpmn`
without `-beta` as the DSL keyword anywhere. The public title is
"BPMN for Mermaid", not "bpmn-beta tool" or any name with "beta" in the
product title.

## Forge brand profile

`brand-styles/profiles/okhp3-forge.yaml` is the canonical record of the Forge
design token values. It was extracted from two source files and must stay in
sync with them:

| Source file | What it declares |
|---|---|
| `app/src/styles/forge-tokens.css` | Raw palette hex values, header/footer surfaces, font families, Mermaid render tokens |
| `app/src/index.css` | Base radius (`--radius`), rendered grid size (`.forge-grid` `background-size`) |

**When you change either source file, you must also:**

1. Update the matching token value(s) in `brand-styles/profiles/okhp3-forge.yaml`
   under `tokens.color.foundation`, `tokens.typography`, or `tokens.geometry`.
2. Bump `style.version` (patch → minor if a token role changes meaning; minor →
   major if a token is removed).
3. Update `style.updated_on` to today's date (`YYYY-MM-DD`).
4. Run both the drift check and its failure-mode tests locally to confirm
   nothing was missed and the guard itself still works:

```bash
pnpm brand:check        # exits 0 when CSS matches the profile
pnpm brand:check:test   # exits 0 when each drift detector fires correctly
```

`brand:check` compares live CSS values against the profile's declared values
and exits non-zero if any have drifted, listing each mismatch with the exact
profile field to fix.

`brand:check:test` injects known-bad fixtures and asserts that `brand:check`
exits 1 for each one.  A broken drift detector (e.g. wrong selector, stale
regex) will fail here before it reaches CI.

**Both steps run in CI and both must pass before a pull request can merge.**
There is no `continue-on-error` exemption for either step.  If either exits 1
on your branch, fix the drift or the detector before requesting review.

> **Grid size note:** `--forge-grid-size` (`32px`) is consumed by the
> `.forge-grid` class via `background-size: var(--forge-grid-size) ...`.
> The profile tracks this token under `tokens.geometry.grid.size`.  If you
> change the variable value, update the profile and bump the version.

## Current implementation status

| Category | Elements |
|---|---|
| **Implemented** | `start`, `end`; `task`, `task:user`, `task:service`, `task:script`, `task:receive`, `task:send`; `xor`, `and`, `or`; sequence flow `-->`, conditional label syntax `source --> target: "label"`, default flow `==>`; `accTitle`/`accDescr`; auto layout; theme-aware SVG styling |
| **Experimental** | `pool`, `lane`, message flow `~~>`, pool/lane-aware layout, cross-pool routing |
| **Plugin path** | `bpmn-plugin.ts` exists as a Mermaid External Diagram adapter; npm packaging and end-to-end `mermaid.render()` host validation remain pending |
| **Planned** | Intermediate events, timer/message/error markers, text annotations, associations, Langium grammar, full `getStyles` theme-variable binding, parser-enforced BPMN domain rules |
| **Out of scope (v1)** | BPMN XML import/export, executable semantics, `bpmn-js` runtime dependency, choreography, conversation, complex gateways, event subprocesses |

## Dual-compliance requirement

Every rendered element must satisfy both standards equally. Neither takes priority:

- **Mermaid rendering**: output must render correctly in Mermaid-compatible packaging. Plugin v1 target: `registerExternalDiagrams()` and `mermaid.render()` validation. Current state: standalone React app, direct SVG renderer, and source-level External Diagram adapter.
- **BPMN 2.0.2 notation**: shapes, markers, and flows must match the OMG specification or cite an explicit project decision.

See [`app/standards/bpmn-spec-reference.md`](./app/standards/bpmn-spec-reference.md) for the element-by-element compliance map.

## What we accept

- Bug fixes in the parser, layout engine, renderer, or plugin adapter
- New BPMN element types that are in-scope or explicitly approved by decision log
- New `.mmd` corpus examples accompanied by corpus test updates
- Documentation improvements
- Accessibility improvements
- Mermaid plugin compatibility fixes
- BP-SKILL agent skill improvements with matching eval or documentation updates

## What we don't accept

- `bpmn-js` runtime dependency. The renderer is intentionally hand-written.
- BPMN XML import or export as v1 scope
- Backend server, user accounts, or cloud storage
- New element types outside the Descriptive Conformance subset without an `app/docs/decisions.md` entry
- Breaking DSL changes without a minor version bump and decision log entry

## Adding a new element type

1. Add or update the typed model in `app/src/lib/bpmn-db.ts`.
2. Add parsing logic to `app/src/lib/bpmn-parser.ts`.
3. Add layout dimensions or routing behavior to `app/src/lib/bpmn-layout.ts`.
4. Add React playground rendering to `app/src/lib/bpmn-renderer.tsx`.
5. Add or mirror imperative SVG output in `app/src/lib/bpmn-plugin.ts` if the element must work in Mermaid adapter mode.
6. Add CSS/style support in the applicable style module.
7. Add an example to `app/examples/` and update `app/src/lib/bpmn-examples.ts`.
8. Add unit tests to `app/src/lib/__tests__/`.
9. Update the support matrix on the Home page and in `app/docs/dsl-spec.md`.
10. Verify notation against `app/standards/bpmn-spec-reference.md`.

## DSL changes

Any change to the DSL syntax requires an `app/docs/decisions.md` entry, updated
`app/docs/dsl-spec.md`, updated examples, and parser tests.

## Project surfaces

| Surface | URL |
|---|---|
| Public project page | https://overkillhill.com/projects/bpmn-for-mermaid/ |
| GitHub repository | https://github.com/OKHP3/mermaid-diagram-bpmn |
| Public root app | https://okhp3.github.io/mermaid-diagram-bpmn/ |
| Public playground deep link | https://okhp3.github.io/mermaid-diagram-bpmn/playground |
| Replit development surface | https://replit.com/t/overkill-hill/repls/BPMN-for-Mermaid |
| Strategy doc | docs/strategy.md |
| Version checklist | docs/version-checklist.md |

## License

MIT. All contributions are under the same license.

Built by [OverKill Hill P³](https://overkillhill.com).
