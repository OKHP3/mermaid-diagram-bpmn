# Roadmap — BPMN for Mermaid

> **Version numbers in this file follow `docs/version-checklist.md`, which is
> the authoritative source for what each version contains and whether it is
> complete. If the two files disagree, `docs/version-checklist.md` wins.**
>
> See DEC-021 in `app/docs/decisions.md` for the reconciliation decision.

---

## V0.1 — bpmn-beta prototype ✅ Done (2026-05-06)

The minimal slice proving the DSL, parser, and renderer concepts.
Delivered in three build increments:

- **Scaffold** (2026-04-25) — React + Vite + Tailwind CSS v4 + wouter + Vitest,
  detector module, home page, GitHub Pages CI/CD
- **Core Pipeline** (2026-05-05) — `BpmnDb` typed data store, stack-based DSL
  parser (4 flow types, 11 node types), heuristic auto-layout engine, hand-written
  SVG renderer with BPMN notation (`.bpmn-*` CSS classes), CSS-class-based theming,
  live two-panel Playground, DSL Reference / Architecture / Roadmap / About pages,
  unit tests for detector, db, parser (40 tests)
- **Pools, Lanes, Corpus, Pan/Zoom** (2026-05-06) — block syntax, stack-based
  context, pool/lane-aware layout, message flows (`~~>`), corpus tests for all 5
  fixtures (58 total tests), pan/zoom on playground, 5 canonical example files,
  decision log DEC-001 through DEC-020, 9 CVEs patched

---

## V0.2 — BP-SKILL pilot (4 skills) ✅ Done (2026-05-30)

The proof-of-concept agent skill layer before the full pipeline was designed.
See `docs/version-checklist.md` V0.2 for the full criterion list.

---

## V0.3 — BP-SKILL suite (15-skill pipeline) ✅ Done (2026-08-04)

The full lifecycle pipeline designed, documented, and surfaced in the app.
See `docs/version-checklist.md` V0.3 for the full criterion list.

---

## V0.6 — Mermaid Plugin Packaging ✅ Done (2026-08-04, via PRD-04)

Wire the prototype to Mermaid's external diagram API.
Completed across PRD-04 phases 1–4. See `docs/mermaid-compatibility.md` for
the full evidence record and `docs/capability-ledger.md` for the baseline.

- ✅ `registerExternalDiagrams()` integration — all 4 modules registered and
  exercised against real `mermaid.render()` in `bpmn-plugin-integration.test.ts`
- ✅ Live theme variable binding — FR-018 verified: `getStyles()` reads live
  Mermaid `themeVariables` at render time (not a static fallback)
- ✅ Plugin entry point (`@okhp3/mermaid-diagram-bpmn`) exported and packaged;
  `pnpm pack` produces a clean 6-file tarball; 12/12 smoke assertions pass
- ✅ Host demo page (`/mermaid-host-demo`) shows live Mermaid-rendered
  `bpmn-beta` output without `securityLevel: 'loose'`
- ✅ Plugin build, pack dry-run, and smoke test added as CI blocking steps
- ✅ `docs/mermaid-compatibility.md` is the authoritative claim document with
  evidence-tier table; every claim backed by a named test or corpus file

Not completed in this phase (still deferred):
- `<script>` tag CDN load path (requires npm publish and CDN distribution; tracked in V0.9)

Resolved after initial V0.6 scope (now closed):
- Parser errors shown inline in the playground (TD-004) — `Playground.tsx` has been confirmed to
  show a parse-error badge and detail bar via `data-testid="text-parse-error"` and
  `data-testid="text-parse-error-detail"`; resolved 2026-08-05

---

## V0.4 — Content and interactivity (Planned, after V0.3)

Make the suite genuinely usable and the UI interactive.
See `docs/version-checklist.md` V0.4 for the full criterion list.

---

## V0.5 — Validation tooling (Planned, after V0.4)

Machine-checkable quality gates for the skill suite.
See `docs/version-checklist.md` V0.5 for the full criterion list.

---

## V0.7 — Langium parser (Planned, after V0.6)

Replace the hand-written parser with a formal grammar.
See `docs/version-checklist.md` V0.7 for the full criterion list.

---

## V0.8 — Quality gates (Planned, after V0.7)

Hardening before community exposure.
See `docs/version-checklist.md` V0.8 for the full criterion list.

---

## V0.9 — Community and upstream prep (Planned)

Prepare for external contribution and Mermaid engagement.
See `docs/version-checklist.md` V0.9 for the full criterion list.

---

## V1.0 — Upstream Mermaid PR (Planned)

The first stable, contribution-ready release.
See `docs/version-checklist.md` V1.0 for the full criterion list.

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
| `bpmn-plugin.ts` | Source-verified + published | `bpmn-plugin-integration.test.ts` passes; `@okhp3/mermaid-diagram-bpmn@0.1.1` published to npm |
| `bpmn-styles.ts` | Stable | Yes |
| `bpmn-examples.ts` | Stable | Yes (add examples) |
| Tests | Active | Yes — more is better |

---

*For the full forward-looking backlog (BL-001–BL-020), see
`docs/prototype-to-product-retrospective.md`.*
