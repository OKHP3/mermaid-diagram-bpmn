# As-Built PRD — BPMN for Mermaid (`bpmn-beta`)
**Type:** Retrospective Requirements Document
**Date:** 2026-05-21
**Status:** Draft — reverse-engineered from implementation

This document is a reverse-engineered PRD derived from the current implementation. It captures what the system currently does (AS-BUILT), what the implementation implies (IMPLIED), what is missing (GAP), and what is recommended (RECOMMENDED). It is not a forward specification — see `docs/roadmap.md` for forward planning.

---

## Product Statement

`mermaid-diagram-bpmn` is a Mermaid-native diagram type for business process modeling. It implements a documented BPMN 2.0 descriptive subset as a text-first DSL that renders where Mermaid renders: GitHub, Notion, docs portals, and AI outputs. The plugin path is `registerExternalDiagrams()` with upstream Mermaid core inclusion proposed after syntax and tests stabilize.

---

## Functional Requirements

| Req ID | Requirement | Type | Source / Evidence | Current Status | Confidence |
|---|---|---|---|---|---|
| FR-001 | The system shall detect the `bpmn-beta` header keyword and route diagrams to the BPMN diagram handler | AS-BUILT | `bpmn-detector.ts` | Complete | High |
| FR-002 | The system shall parse all v1 in-scope node types: start, end, task (5 subtypes), xor, or, and | AS-BUILT | `bpmn-parser.ts`, Home support matrix | Complete | High |
| FR-003 | The system shall parse all v1 in-scope flow types: sequence, conditional, default, message | AS-BUILT | `bpmn-parser.ts` | Complete | High |
| FR-004 | The system shall parse pool and lane block declarations with one level of nesting | AS-BUILT | `bpmn-parser.ts` stack logic | Complete (experimental) | High |
| FR-005 | The system shall parse `accTitle` and `accDescr` directives and store them in `BpmnDb` | AS-BUILT | `bpmn-parser.ts` lines 36–43 | Complete | High |
| FR-006 | The system shall lay out parsed diagrams automatically in left-to-right orientation without coordinate input | AS-BUILT | `bpmn-layout.ts` | Complete | High |
| FR-007 | The system shall lay out pool/lane diagrams with per-lane node positioning and cross-lane flow routing | AS-BUILT | `bpmn-layout.ts` pool/lane mode | Complete (experimental) | High |
| FR-008 | The system shall render all implemented elements as SVG with correct BPMN notation | AS-BUILT | `bpmn-renderer.tsx` | Complete | High |
| FR-009 | The system shall emit SVG accessibility attributes (`aria-labelledby`, `<title>`, `<desc>`) when accTitle/accDescr are declared | AS-BUILT | `bpmn-renderer.tsx` | Complete | High |
| FR-010 | The system shall apply theming via injected CSS using `.bpmn-*` class names | AS-BUILT | `bpmn-styles.ts` | Complete (static theme only) | High |
| FR-011 | The system shall provide an interactive playground for live diagram editing and preview | AS-BUILT | `Playground.tsx` | Complete | High |
| FR-012 | The system shall support pan and zoom on rendered diagram previews | AS-BUILT | `Playground.tsx` pan/zoom logic | Complete | High |
| FR-013 | The playground shall include pre-loaded examples for all major element categories | AS-BUILT | `bpmn-examples.ts`, 5 `.mmd` files | Complete | High |
| FR-014 | The system shall display parser errors as visible feedback in the playground | **GAP** | — | Missing | High |
| FR-015 | The system shall export rendered diagrams as SVG files | **GAP** | — | Missing | Medium |
| FR-016 | The system shall register all modules via `mermaid.registerExternalDiagrams()` | **GAP** | DEC-018, Roadmap | Missing | High |
| FR-017 | The system shall enforce BPMN domain rules at parse time (gateway fan-in/out, event lifecycle) | **GAP** | Roadmap "planned" | Missing | Medium |
| FR-018 | The system shall read live Mermaid theme variables at render time | **GAP** | Roadmap "experimental" | Missing | High |

---

## Non-Functional Requirements

| Req ID | Requirement | Type | Source / Evidence | Current Status | Confidence |
|---|---|---|---|---|---|
| NFR-001 | The system shall render diagrams entirely client-side with no server calls | Performance | `replit.md` arch decisions | Complete | High |
| NFR-002 | The system shall pass TypeScript strict mode without errors | Maintainability | `tsconfig.json` strict enabled | Complete | High |
| NFR-003 | All library modules shall have unit test coverage passing in CI | Quality | 58/58 Vitest tests pass | Partial (renderer/layout not covered) | High |
| NFR-004 | The deployed site shall be accessible to screen readers via SVG ARIA | Accessibility | `bpmn-renderer.tsx` | Partial (diagram-level only, not per-element) | High |
| NFR-005 | The system shall patch known CVEs in transitive dependencies via version overrides | Security | `pnpm-workspace.yaml` overrides | Complete (9 CVEs patched) | High |
| NFR-006 | The system shall deploy automatically to GitHub Pages on every push to main | Deployment | `.github/workflows/deploy.yml` | Complete (no test gate) | High |
| NFR-007 | The bundle shall contain no heavyweight rendering runtime dependencies | Performance | DEC-002, `package.json` | Complete | High |
| NFR-008 | The `package.json` shall declare only dependencies actually used by the application | Maintainability | `package.json` audit | **GAP** — 40+ unused template deps | High |
| NFR-009 | The system shall render SVG without rasterization blur at any zoom level | Visual quality | commit `9989524` | Complete | High |

---

## Data Requirements

| Req ID | Requirement | Type | Source / Evidence | Current Status | Confidence |
|---|---|---|---|---|---|
| DATA-001 | The canonical data model shall be `BpmnDb` with typed `BpmnNode`, `BpmnFlow`, `BpmnPool`, `BpmnLane` interfaces | Data model | `bpmn-db.ts` | Complete | High |
| DATA-002 | `BpmnNode` shall support `kind`, `subtype`, `position`, `label`, `laneId`, `poolId` fields | Data model | `bpmn-db.ts` | Complete | High |
| DATA-003 | `BpmnFlow` shall support `kind` values: sequence, conditional, default, message, association | Data model | `bpmn-db.ts` | Complete | High |
| DATA-004 | The DSL source format shall be plain text files with `.mmd` extension and `bpmn-beta` first-line header | Format | `examples/*.mmd` files | Complete | High |
| DATA-005 | The `BpmnDb` public API shall be frozen before the upstream Mermaid PR | Data model | Roadmap readiness table | **GAP** — API not frozen | High |
| DATA-006 | BPMN XML import/export | Format | Home out-of-scope list | **Explicitly out of scope for v1** | High |

---

## User Experience Requirements

| Req ID | Requirement | Type | Source / Evidence | Current Status | Confidence |
|---|---|---|---|---|---|
| UX-001 | The home page shall communicate project status, scope, principles, and community context immediately | UX | `Home.tsx` | Complete | High |
| UX-002 | The playground shall display a live SVG preview that updates as the user types | UX | `Playground.tsx` | Complete | High |
| UX-003 | The playground shall display parse errors as visible inline feedback, not a blank canvas | UX | — | **GAP** | High |
| UX-004 | Experimental examples shall be visually distinguished with a badge and explanatory note | UX | `bpmn-examples.ts` `experimental` flag | Complete | High |
| UX-005 | The site shall support dark mode | UX | `next-themes` dep present | Partial — toggle not confirmed visible | Medium |
| UX-006 | The site shall be readable on mobile viewports | UX | Tailwind responsive classes | Complete | High |

---

## Integration Requirements

| Req ID | Requirement | Type | Source / Evidence | Current Status | Confidence |
|---|---|---|---|---|---|
| INT-001 | The plugin shall register via `mermaid.registerExternalDiagrams()` with all 4 modules | Integration | Roadmap, Architecture page | **GAP** | High |
| INT-002 | The plugin shall respect Mermaid theme variables at render time | Integration | `bpmn-styles.ts` | **GAP** | High |
| INT-003 | The plugin shall be publishable as `mermaid-diagram-bpmn` on npm | Integration | DEC-011, project slug | **GAP** | High |
| INT-004 | The CI pipeline shall run all tests before deploying | Integration | `deploy.yml` | **GAP** | High |

---

## Documentation Requirements

| Req ID | Requirement | Type | Source / Evidence | Current Status | Confidence |
|---|---|---|---|---|---|
| DOC-001 | The repository shall have a README covering install, usage, and contribution | Documentation | `docs/README.md` exists | Partial | High |
| DOC-002 | The DSL specification shall be published as standalone Markdown | Documentation | `docs/dsl-spec.md` exists | Partial — needs review | Medium |
| DOC-003 | The decision log shall be maintained as `docs/decisions.md` | Documentation | `docs/decisions.md` | Complete (active) | High |
| DOC-004 | The repository shall include a CHANGELOG.md | Documentation | — | **GAP** | Medium |
| DOC-005 | The project shall have a documented engagement strategy for Mermaid issue #7699 | Documentation | DEC-012 | Drafted, not yet executed | High |
| DOC-006 | The repository shall include CONTRIBUTING.md | Documentation | — | **GAP** | High |
| DOC-007 | The canonical roadmap shall live in the repository, not in Notion | Documentation | `Roadmap.tsx` defers to Notion | **GAP** | High |

---

## Current Support Matrix (AS-BUILT)

### Implemented

- Start events, End events
- Generic tasks, User tasks (person marker), Service tasks (gear marker), Script tasks (script marker), Receive tasks (envelope), Send tasks (filled envelope)
- XOR gateways, AND gateways, OR gateways
- Sequence flows (`-->`), Conditional flow labels, Default flow marker (`==>`)
- `accTitle` / `accDescr` directives
- Auto left-to-right layout
- Theme-aware SVG styling via `getStyles()`

### Experimental

- Pools (headers, containers)
- Lanes (one level deep)
- Message flows (`~~>`)
- Pool/lane-aware layout
- Cross-pool flow routing

### Planned

- Formal Langium grammar
- `mermaid.registerExternalDiagrams()` integration
- Intermediate events
- Timer / message / error markers
- Deterministic pool/lane layout
- Full Mermaid theme variable binding
- Parser-enforced BPMN domain rules
- Shape extraction from renderer

### Out of scope (v1)

- BPMN XML import / export
- Full BPMN 2.0 execution semantics
- bpmn-js runtime dependency
- Choreography diagrams
- Conversation diagrams
- Event subprocesses
- Complex gateways

---

## Key Design Decisions

| ID | Decision | Status | Consequence |
|---|---|---|---|
| D1 / DEC-004 | Plugin-first, upstream second | Accepted | Must ship npm package before strategy has teeth |
| D2 / DEC-003 | `bpmn-beta` DSL keyword (not `bpmn`) | Accepted | Syntax may still change; signals instability |
| D3 | Descriptive subset only — not executable BPMN | Accepted | Deferred features documented explicitly |
| D4 | Readability over exhaustiveness | Accepted | 80% use cases; developer-readable without BPMN expertise |
| D5 | Shape fidelity matters | Accepted | Incorrect notation erodes credibility; needs BPMN practitioner review |
| D6 / DEC-002 | No bpmn-js runtime dependency | Accepted | Hand-written SVG renderer; small bundle; full ownership |

---

## Active Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Scope creep into full BPMN 2.0 | High | Explicit v1 support matrix; say no early and often |
| DSL fragmentation with Emrich proposal (#7699) | High | Engage on #7699 before locking syntax (DEC-012 — not yet executed) |
| Poor layout quality | High | Constrained left-to-right layout; complexity grows with scope |
| Incorrect BPMN notation | High | Validate against BPMN reference; get BPMN practitioner review |
| Maintainer reluctance | Medium | Plugin-first path; tests, examples, and docs reduce review surface |
| User expectation of XML export | Medium | Mark XML as future milestone in every public communication |
| Mermaid theming conflicts | Medium | Use existing Mermaid theme variables; no new theme props in v1 |
| Overengineering the grammar | Medium | Hand-written parser fine for prototype; Langium when grammar proven |

---

*Derived from the Prototype-to-Product Retrospective. See `docs/retrospective.md` for full analysis.*
