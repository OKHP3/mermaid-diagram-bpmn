# Capability Ledger

Authoritative record of validated runtime versions, test gate results, and build measurements. Updated on each clean-install validation run. All figures here are source of truth for the content-drift validator and release manifest.

---

## Baseline — 2026-08-06

### Runtime and toolchain versions

| Package | Version |
|---|---|
| Node.js | 24.13.0 |
| pnpm | 10.26.1 |
| TypeScript | ~7.0.2 |
| Vite | 8.1.4 |
| Vitest | 4.1.10 |
| mermaid | 11.4.1 |
| `@okhp3/mermaid-diagram-bpmn` | 0.1.0 |

### Gate results

| Gate | Command | Result |
|---|---|---|
| Frozen install | `pnpm install --frozen-lockfile` | ✅ PASS |
| Typecheck | `pnpm run typecheck` | ✅ PASS |
| App tests | `pnpm --filter @workspace/mermaid-diagram-bpmn run test` | ✅ PASS — 432/432 tests, 23 files |
| Skill tests | `pnpm run skill:test` | ✅ PASS — 196/196 |
| Skill validate | `pnpm run skill:validate` | ✅ PASS — 235/235 checks |
| Eval suite | `pnpm run eval:run` | ✅ PASS — 14/14 fixtures, 100/100 pts |
| Generated-file check | `pnpm run check:generated` | ✅ PASS |
| Plugin build | `pnpm run plugin:build` | ✅ PASS |
| Plugin smoke | `pnpm run plugin:smoke` | ✅ PASS — 12/12 assertions |
| Production build | `pnpm --filter @workspace/mermaid-diagram-bpmn run build` | ✅ PASS |

All local validation gates pass. **Release status: BLOCKED** — the consumer-install path is not functional until Task #198 resolves the npm 404 (see below).

### Plugin bundle size

| Format | Minified | Gzip |
|---|---|---|
| ESM (`dist/index.mjs`) | 20.01 kB | 5.88 kB |
| CJS (`dist/index.cjs`) | 16.74 kB | 5.40 kB |

Both well within the <200 kB min+gzip NFR.

### App bundle notes

Production build emits a chunk-size warning for chunks >500 kB (largest: `index-*.js` at 631.80 kB / 179.92 kB gzip). This is driven by Mermaid bundled into the main chunk. Tracked in Task #212 (Performance budget and Mermaid lazy-loading) — lazy-loading Mermaid on demand is the resolution path.

### npm registry status

`@okhp3/mermaid-diagram-bpmn` — **NOT published** as of 2026-08-06. The npm registry returns 404. README install instructions reference this package; the gap is a release blocker for promotion. Tracked in Task #198.

---

## How to update this file

Run the full gate sequence, record results, and update the table above with the new date. The content-drift validator (Task #211) will compare public-facing version claims against values in this file.
