# Prototype-to-Product Retrospective
## BPMN for Mermaid — `mermaid-diagram-bpmn`

**Analysis date:** 2026-05-21
**Horizon:** 90 days
**Depth:** EXHAUSTIVE

---

## 1. Executive Summary

### What this is

A contributor-facing prototype for a new Mermaid diagram type called `bpmn-beta`. It is simultaneously a working DSL renderer, a living specification, a developer documentation site, and a strategic pitch document aimed at the Mermaid open-source maintainers and community.

### What problem it solves

Mermaid — the dominant text-to-diagram tool in developer documentation — has no native BPMN diagram type. Business analysts, architects, and developers who want version-controllable process diagrams must either misuse `flowchart`, leave Markdown, or use heavyweight tools like bpmn-js or Camunda Modeler. `bpmn-beta` fills this gap with a Mermaid-idiomatic DSL that renders BPMN notation directly from text.

### What has been built

A fully client-side React/Vite application with:
- A working hand-written DSL parser (`bpmn-parser.ts`) that handles 17 implemented element types plus 5 experimental ones including pools and lanes
- A typed diagram database (`BpmnDb`) matching Mermaid's internal DiagramDB contract
- A heuristic layout engine supporting both flat and pool/lane modes
- A hand-written SVG renderer with correct BPMN notation and CSS-class-based theming
- A 6-page documentation and playground site (Home, Playground, Architecture, DSL Reference, Roadmap, About)
- 5 canonical `.mmd` example files with matching corpus tests
- 58/58 passing unit + corpus tests
- GitHub Pages deployment at `okhp3.github.io/mermaid-diagram-bpmn` (linked from `overkillhill.com`)
- A formal decision log (DEC-001 through DEC-020) and a published 7-step contribution path

### Why it has crossed into product territory

The project self-identifies as a prototype but behaves as a product candidate: it has a public URL, a published DSL specification, an accessibility story, a documented decision register, a strategic roadmap, a risk register, and automated deployment. The bar has been raised further by an external forcing function — Mermaid GitHub issue #7699, filed 2026-05-02 by Andreas Emrich (DFKI), who has an academic paper forthcoming and has stated intent to implement a competing approach. This creates a time constraint that prototype-mode thinking does not accommodate.

### Strongest product direction

The project is most clearly a **Mermaid ecosystem contribution** — not a standalone tool. Its entire architecture (detector/parser/DB/renderer/styles contract), naming conventions, deployment, and roadmap are oriented toward `registerExternalDiagrams()` integration and eventual upstream proposal. The playground and documentation site are contribution scaffolding, not end-user product.

### Next productization step

Wire the existing modules into a real `registerExternalDiagrams()` package (`mermaid-diagram-bpmn` on npm). This is the single highest-leverage action: it converts the prototype from a demo into something the Mermaid community can actually install and use, which is the prerequisite for every downstream goal.

### Top 3 risks

| # | Risk | Status |
|---|---|---|
| 1 | **DSL fragmentation with Emrich proposal (#7699)** — A competing implementation with academic backing exists. Engaging too late or too aggressively risks community split. | Active, unmitigated |
| 2 | **registerExternalDiagrams() integration gap** — The prototype has never been wired to actual Mermaid. Every claim about Mermaid-native rendering is currently theoretical. | Active, unmitigated |
| 3 | **Package.json bloat** — 40+ unused Radix UI and other template dependencies remain declared in `package.json`. This is a credibility hazard for a project pitching clean, minimal architecture to open-source maintainers. | Active, unmitigated |

---

## 2. Prototype Origin Reconstruction

### Original spark

**Inferred.** The project likely began as a personal frustration: Mermaid has no BPMN support, and the existing Mermaid issue threads (#7699 / #2623 / #660) had discussion but no implementation. The Notion page title ("BPMN for Mermaid — bpmn-beta Diagram Type Proposal") and the framing as a "Proposal" suggests the original intent was to produce a credible contribution artifact, not a product.

### Evolution timeline (reconstructed from git log)

| Phase | Commits | What happened |
|---|---|---|
| **Scaffolding** | `e36efe3`, `3e6c5aa` | Initial scaffold, visual styling to match OverKill Hill branding |
| **Build stabilization** | `c327f92`, `b7779cd`, `ec7d4de`, `6c0bb2e` | GitHub Pages deployment, build fixes, image assets |
| **Design system** | `7a9e4dd`, `7158632`, `7a0e1af`, `67391a5` | Visual design system, broken icon fixes, renderer updates |
| **Site maturation** | `fdf1e66`, `f2dc670`, `a0fae5c` | Status ribbon, support matrix, roadmap page added — this is where it became product-shaped |
| **Public documentation** | `15ef1c2` | Replaced private Notion links with public ones — commitment to public audience |
| **Feature** | `93f2637` | Pan/zoom added to Playground — indicates usability investment |
| **Cleanup** | `36d8710` | Removed unused code/deps — deliberate code hygiene signal |
| **Quality** | `63a29ec` | 9 CVE fixes via pnpm overrides — security maturity signal |
| **Polish** | `56c0232` | Open Graph image update — public presentation care |

### Inflection / combustion point

**Verified** (commit `fdf1e66`): The addition of the status ribbon, support matrix, and roadmap page is the clear combustion point. Before this, it was a rendering experiment. After it, it was a product with a defined scope, a public roadmap, and documented trade-offs. The creation of the decision log (`decisions.md` with DEC-001 through DEC-020) further cements this as the moment it became a managed effort.

### Current classification

This is a **public product candidate / platform foundation hybrid**:
- Working prototype (not a proof of concept — it actually renders correct BPMN diagrams)
- Platform foundation (module architecture explicitly targets the Mermaid plugin contract)
- Contribution proposal (the entire site exists to make the case to the Mermaid community)
- **Not yet**: an installable plugin, an npm package, or a product with end users

---

## 3. Product Archaeology Ledger

| ID | Evidence Source | Observed Artifact / Behavior | Inferred Completed Task | Resulting Capability | Derived Requirement | Confidence | Follow-Up |
|---|---|---|---|---|---|---|---|
| A01 | `bpmn-detector.ts` | `detect(text): boolean`; matches `bpmn-beta` first line; exports `DETECTOR_KEY = 'BPMNDiagram'` | Implemented Mermaid detector contract | System routes `bpmn-beta` diagrams to correct handler | The system shall detect `bpmn-beta` header and export a Mermaid-compatible `DETECTOR_KEY` | High | Wire to actual `mermaid.registerExternalDiagrams()` call |
| A02 | `bpmn-db.ts` | `BpmnDb` class with `addNode/addFlow/addPool/addLane/setAccTitle/setAccDescription` + typed interfaces | Implemented typed diagram database matching Mermaid's DiagramDB contract | Parser output is stored in a structured, typed graph | The system shall maintain a canonical typed representation of parsed BPMN elements | High | Freeze public API surface before upstream proposal |
| A03 | `bpmn-parser.ts` | Stack-based line parser; regex patterns for all 4 flow types + node types + pool/lane blocks | Implemented hand-written DSL parser | All documented node types and flow operators can be parsed from text | The system shall parse all v1 in-scope DSL constructs into a `BpmnDb` instance | High | Add parser-level semantic validation (gateway fan-in/out rules) |
| A04 | `bpmn-layout.ts` | `layoutGraph(db): BpmnLayout`; dual-mode (flat / pool/lane); topological level assignment | Implemented heuristic auto-layout engine | Diagrams render with automatic left-to-right node positioning | The system shall automatically position nodes and route flows without requiring coordinate input | High | Replace heuristic with constraint-based layout; pool widths must align |
| A05 | `bpmn-renderer.tsx` | `<BpmnRenderer source={…} />`; hand-written SVG for all implemented element types | Implemented BPMN SVG renderer | Parsed diagrams render as standards-conformant BPMN SVG | The system shall render all implemented BPMN elements as correct SVG notation | High | Extract shapes into dedicated shape library module; add snapshot tests |
| A06 | `bpmn-styles.ts` | `getStyles(BpmnThemeOptions): string`; emits CSS block injected into SVG `<defs>`; `.bpmn-*` class names | Implemented CSS-class-based SVG theming | Diagrams adapt to light/dark theme without inline style props | The system shall express all visual properties via injected CSS using `bpmn-*` class names | High | Bind to live Mermaid theme variables at render time, not static constants |
| A07 | `bpmn-examples.ts` + `examples/*.mmd` | 5 canonical `.mmd` files; imported via `?raw` | Built canonical example corpus | Playground pre-loads 5 realistic examples; tests run against corpus | The system shall include at least 5 canonical examples covering all v1 element categories | High | Add more complex real-world process examples |
| A08 | `__tests__/` (4 test files) | 58/58 Vitest tests passing; corpus tests run parser against all 5 examples | Implemented unit test suite | Parser, detector, and DB correctness is automatically verified | The system shall have unit tests for all library modules that pass in CI | High | Add renderer snapshot tests; add layout regression tests |
| A09 | `Playground.tsx` | Two-panel live editor; scroll-wheel zoom (0.15×–8×); drag-to-pan; zoom buttons; reset; live % readout; example selector | Built interactive playground with pan/zoom | Contributors and users can write and preview `bpmn-beta` diagrams interactively | The system shall provide an interactive playground with live rendering, pan/zoom, and example loading | High | Add error display panel; add copy-to-clipboard; add export as SVG |
| A10 | `DslReference.tsx` | Full tables for node types (11), flow operators (4), pool/lane syntax (5), directives (2); deferred keywords list | Built complete DSL reference | DSL syntax is fully documented in the app | The system shall provide a complete DSL reference with syntax, description, and examples for every element | High | Publish as standalone Markdown for GitHub wiki / Mermaid docs submission |
| A11 | `Home.tsx` | Support matrix (implemented/experimental/planned/out-of-scope); 4 design principles; project thesis; related Mermaid issues | Built contributor-facing landing page | Visitors understand project scope, design philosophy, and community context immediately | The system shall communicate its scope, status, and relationship to the Mermaid ecosystem on the home page | High | Add version/date stamp on matrix |
| A12 | `Architecture.tsx` | 10-module workstream table with current/target state; annotated repo directory tree | Built architecture documentation | Current and target state of each module is visible | The system shall document its target architecture and module-level development status | High | Update when shape library is extracted; add module dependency diagram |
| A13 | `Roadmap.tsx` | In-scope (22 items), deferred (21 items), contribution-readiness table, 7-step contribution path | Built contributor onboarding roadmap | Scope, deferred features, and contribution pathway are public | The system shall publish an explicit MVP scope, deferred feature list, and contribution-readiness roadmap | High | Mark items done as they complete |
| A14 | `About.tsx` | 6 key decisions (D1–D6); 8-item risk register with severity + mitigation; 3-step "how to get involved" | Built project governance documentation | Product decisions and active risks are transparent | The system shall document key design decisions and maintain a public risk register | High | Sync with `docs/decisions.md` |
| A15 | `.github/workflows/deploy.yml` | GitHub Actions deploy workflow targeting GitHub Pages | Implemented CI/CD deployment pipeline | Every push to main deploys a live public demo | The system shall automatically deploy to GitHub Pages on every push to main | High | Add test run as pre-deploy gate |
| A16 | `docs/decisions.md` | DEC-001 through DEC-020 with statuses | Maintained a formal engineering decision log | Architecture and product decisions are traceable | The system shall maintain a durable, numbered decision log with rationale and status | High | Resolve DEC-001, DEC-014 |
| A17 | `pnpm-workspace.yaml` overrides | `lodash`, `picomatch`, `path-to-regexp`, `postcss` version overrides | Fixed 9 CVEs in transitive dependencies | Known critical/high CVEs in transitive deps are patched | The system shall maintain dependency overrides to patch known CVEs | High | Audit remaining direct deps |
| A18 | `bpmn-renderer.tsx` | `aria-labelledby`, `role="img"`, SVG `<title>` and `<desc>` emitted | Implemented basic SVG accessibility | Diagrams expose screen-reader-accessible title and description | The system shall emit ARIA attributes and SVG accessibility metadata when `accTitle`/`accDescr` are declared | High | Expand to per-element aria-labels |
| A19 | `StatusRibbon` on Home | "The Forge — Contributor Prototype" label | Built contributor status communication | Visitors understand this is an active prototype | The system shall clearly communicate prototype status on public-facing pages | Medium | Update when npm package ships |
| A20 | `docs/decisions.md` DEC-005 / DEC-012 | Issue #7699 verified; Emrich/DFKI competitor identified; engagement strategy drafted | Performed competitive intelligence and drafted response strategy | Project has a defined stance on the competing implementation | The project shall have a documented engagement strategy for Mermaid issue #7699 | High | Execute DEC-012 within 7 days of prototype stabilization |

---

## 4. As-Built Capability Inventory

### DSL Parsing

| Capability | Status | Evidence | Product Value | Maturity | Notes |
|---|---|---|---|---|---|
| Node parsing (all types) | Complete | `bpmn-parser.ts` | Core | Functional | Hand-written; no error recovery |
| Pool/lane block parsing | Complete | Stack-based context in parser | Collaboration diagrams | Experimental | One level deep |
| Flow parsing (4 types) | Complete | 4 regex patterns | Core | Functional | Message flow top-level constraint not enforced |
| Directive parsing | Complete | Parser lines 36–43 | Accessibility | Functional | Only `accTitle` / `accDescr` |
| Parser error messages | Partial | `throw new Error(...)` on mismatch | Developer UX | Experimental | No recovery; errors appear as blank render |
| Semantic BPMN validation | Not present | — | Correctness | — | Gateway rules, lifecycle constraints missing |

### Rendering

| Capability | Status | Evidence | Product Value | Maturity | Notes |
|---|---|---|---|---|---|
| All implemented node types | Complete | `bpmn-renderer.tsx` | Core | Functional | Correct BPMN notation |
| Sequence/conditional/default/message flows | Complete | Renderer | Core | Functional | Message routing approximate |
| Pool + lane containers | Complete | Renderer | Collaboration | Experimental | Pool widths may not align |
| SVG accessibility metadata | Complete | aria-labelledby, title, desc | Accessibility | Functional | Per-element labels deferred |
| Theme-aware CSS styling | Complete | `bpmn-styles.ts` | Theming | Experimental | Static constants, not live Mermaid vars |

### Layout

| Capability | Status | Evidence | Product Value | Maturity | Notes |
|---|---|---|---|---|---|
| Flat left-to-right auto-layout | Complete | `bpmn-layout.ts` | Core | Functional | Heuristic topological |
| Pool/lane-aware layout | Complete | `bpmn-layout.ts` | Collaboration | Experimental | Approximate cross-lane ordering |
| Deterministic constraint-based layout | Not present | Roadmap | Quality | — | Key gap before upstream PR |

### Playground / UI

| Capability | Status | Evidence | Product Value | Maturity | Notes |
|---|---|---|---|---|---|
| Live two-panel editor | Complete | `Playground.tsx` | Core demo | Functional | |
| Pan/zoom on preview | Complete | Scroll/drag/buttons/reset/% | Usability | Functional | |
| Example selector (5 + experimental flag) | Complete | `bpmn-examples.ts` | Onboarding | Functional | |
| Error display | **Not present** | — | DX | — | Critical gap |
| Export as SVG | Not present | — | Utility | — | |
| Copy DSL to clipboard | Not present | — | Utility | — | |

### Testing

| Capability | Status | Evidence | Product Value | Maturity | Notes |
|---|---|---|---|---|---|
| Unit tests (detector, DB, parser) | Complete | 4 test files, 58/58 pass | Quality gate | Functional | |
| Corpus tests (all 5 examples) | Complete | `bpmn-parser-corpus.test.ts` | Regression safety | Functional | |
| Renderer snapshot tests | **Not present** | Architecture page notes as target | Quality gate | — | |
| Visual regression tests | Not present | — | Quality gate | — | |
| Layout regression tests | Not present | — | Quality gate | — | |

### Deployment / Infrastructure

| Capability | Status | Evidence | Product Value | Maturity | Notes |
|---|---|---|---|---|---|
| GitHub Pages deployment | Complete | `deploy.yml` | Public visibility | Stable | |
| Pre-deploy test gate | **Not present** | — | Quality assurance | — | |
| npm package publication | **Not present** | — | Distribution | — | Biggest missing piece |
| `registerExternalDiagrams()` wiring | **Not present** | Roadmap "planned" | Core integration | — | |

---

## 5. Architecture and Implementation Summary

### Tech Stack

- **Runtime**: Browser-only (no backend for BPMN). Node.js 24 for build tooling.
- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4
- **Routing**: wouter (~2KB)
- **Testing**: Vitest 3.x
- **Language**: TypeScript 5.9 strict
- **Package manager**: pnpm workspaces (monorepo)

### Module Dependency Chain

```
bpmn-detector.ts  (standalone)
bpmn-db.ts        (no deps)
bpmn-parser.ts    → bpmn-db.ts
bpmn-layout.ts    → bpmn-db.ts
bpmn-styles.ts    (standalone)
bpmn-renderer.tsx → bpmn-db.ts, bpmn-layout.ts, bpmn-styles.ts
bpmn-examples.ts  (standalone — ?raw imports)
```

Clean, layered architecture. No circular dependencies.

### Mermaid Integration Contract (designed, not yet wired)

```ts
registerExternalDiagrams([{
  id: DETECTOR_KEY,      // 'BPMNDiagram'
  detector: detect,      // from bpmn-detector.ts
  parser: { parse },     // from bpmn-parser.ts → returns BpmnDb
  renderer: { draw },    // from bpmn-renderer.tsx (needs adapter)
  styles: getStyles,     // from bpmn-styles.ts
}])
```

### Architectural Strengths

- Clean module separation per concern (detect / parse / layout / render / style)
- CSS-class-based theming via `.bpmn-*` — theme switching requires only changing the options object
- `BpmnDb` as canonical store — no data leaks between pipeline stages
- Corpus tests catch parser regressions immediately

### Architectural Smells / Fragile Areas

1. **Shape library inline in renderer** — All SVG shape drawing is inside `bpmn-renderer.tsx`. Will become unmaintainable as element count grows.
2. **No `registerExternalDiagrams()` wiring** — "Mermaid-native" positioning is aspirational, not verified.
3. **Static theme constants** — `bpmn-styles.ts` uses `LIGHT_THEME` constants; ignores live Mermaid theme preferences.
4. **`package.json` dep bloat** — 40+ Radix UI components and other template packages declared but unused in source.
5. **No error UI in playground** — Parser errors (`throw new Error(...)`) are swallowed silently; blank preview.
6. **Notion as canonical roadmap** — `Roadmap.tsx` defers to Notion. Public OSS canonical spec should live in the repo.

---

## 6. User Flows and Use Cases

### Major User Flows

| Flow ID | User Goal | Entry Point | Main Steps | Current Support | Gaps | Product Importance |
|---|---|---|---|---|---|---|
| UF-01 | Write and preview a BPMN diagram from scratch | Playground | Type DSL → live SVG | Complete | No error feedback | Critical |
| UF-02 | Explore an existing example | Playground → example selector | Click tab → see source + render → modify | Complete | Cannot save modifications | High |
| UF-03 | Learn DSL syntax | DSL Reference | Browse tables, copy examples | Complete | Cannot try examples from reference directly | High |
| UF-04 | Understand project scope | Home | Read thesis, matrix, principles | Complete | No version/date stamp on matrix | High |
| UF-05 | Evaluate contributing | About / Roadmap | Read decisions, risks, contribution path | Complete | Notion dependency for canonical strategy | Medium |
| UF-06 | Install the plugin in Mermaid | — | — | **Not supported** | No npm package, no plugin wiring | Critical |
| UF-07 | Pan/zoom on a complex diagram | Playground (auto) | Scroll to zoom, drag to pan | Complete | Zoom controls not discoverable on first visit | Medium |

### Use Cases

| Use Case | Actor | Goal | Current Support | Notes |
|---|---|---|---|---|
| UC-01 | Developer / BA | Write BPMN as code in Markdown | Prototype only — no Mermaid integration | Most important; not yet achievable end-to-end |
| UC-02 | Mermaid contributor | Evaluate the DSL proposal | Fully supported via playground + docs | Primary current use case |
| UC-03 | Mermaid maintainer | Assess code quality for PR | Partial — tests pass, no npm package | Key gap |
| UC-04 | BPMN practitioner | Validate notation correctness | Supported via playground | No BPMN practitioner review yet |
| UC-05 | Issue #7699 stakeholders | Compare this approach to Emrich proposal | Partial — deployment URL exists | DEC-012 not yet executed |

---

## 7. Decision and Tradeoff Register

| Decision ID | Decision / Tradeoff | Evidence | Likely Rationale | Consequence | Keep / Revisit |
|---|---|---|---|---|---|
| DEC-002 | No bpmn-js dependency | `package.json`; `docs/decisions.md` | Avoid ~1.5MB bundle, license friction, divergent design goals | Hand-written renderer; total ownership; small bundle | **Keep** |
| DEC-003 | Header keyword = `bpmn-beta` | `bpmn-detector.ts`; `docs/decisions.md` | Signal instability without coupling project name | Syntax may change; `bpmn` reserved for stable future | **Keep** |
| DEC-004/D1 | Plugin-first, upstream second | About D1; Roadmap contribution path | Reduces maintainer review burden; faster iteration | Must ship npm package before strategy has teeth | **Keep** |
| DEC-013 | Hand-written parser now, Langium later | `docs/decisions.md` | Hand-written faster for DSL iteration; Langium only for upstream PR | No error recovery; must port before upstream PR | **Keep** (serial) |
| DEC-014 | Ship pools/lanes before announce | `docs/decisions.md` | Without pools/lanes, can't claim Descriptive Conformance | Pools/lanes shipped as experimental — resolve status | **Resolved — update** |
| DEC-018 | GitHub Pages as canonical public URL | `docs/decisions.md` | Free, fast, trusted by OSS community | Replit = dev; GH Pages = public demo | **Keep** |
| DEC-019 | No inline `style` props on SVG | `docs/decisions.md` | Theme changes require only options object change | Currently static; must bind live Mermaid vars before release | **Keep arch; fix impl** |
| DEC-012 | Engage on #7699 publicly | `docs/decisions.md` | Prototype is differentiator; no running code from competitor | Clock ticking; not yet executed | **Execute now** |
| Implicit | Radix UI full suite in `package.json` | `package.json` — 40+ unused | Template residue | Credibility hazard for OSS PR | **Revisit immediately** |
| Implicit | Notion as canonical strategy | `Roadmap.tsx` footer note | Personal knowledge management preference | Public OSS canonical spec should be in repo | **Revisit** |

---

## 8. Technical Debt and Hardening Map

| Debt ID | Area | Issue | Impact | Severity | Recommended Fix | Effort |
|---|---|---|---|---|---|---|
| TD-001 | Dependency risk | 40+ unused Radix UI + other template packages in `package.json` | Credibility; false project weight | **Critical** | Prune to only used packages | Small |
| TD-002 | Architecture | Shape drawing inline in `bpmn-renderer.tsx` | Unmaintainable at scale | **High** | Extract to `src/lib/shapes/` | Medium |
| TD-003 | Integration | No `registerExternalDiagrams()` wiring | "Mermaid-native" claim is theoretical | **High** | Wire all 4 modules; test against real Mermaid | Medium |
| TD-004 | Architecture | Static theme constants in `bpmn-styles.ts` | Plugin always renders in light mode | **High** | Read live Mermaid theme vars at render time | Medium |
| TD-005 | UX / Error handling | Parser errors surface as blank preview | Zero feedback for invalid syntax | **High** | Try/catch + error display in playground | Small |
| TD-006 | Testing | No renderer or layout tests | Regressions silently break visual output | **High** | Add Vitest snapshot + layout regression tests | Medium |
| TD-007 | Deployment | No test pre-gate in `deploy.yml` | Broken code deploys to public URL | **High** | Add `pnpm test` step before deploy | Small |
| TD-008 | Documentation | Notion is canonical roadmap | OSS ground truth must be in repo | **High** | Migrate to `docs/roadmap.md` | Medium |
| TD-009 | Data integrity | No semantic BPMN validation | Invalid patterns silently render | **Medium** | Add semantic validation pass after parsing | Large |
| TD-010 | Documentation | `About.tsx` decisions partially duplicate `docs/decisions.md` | Drift risk | **Medium** | Consolidate; one source of truth | Small |
| TD-011 | Documentation | No CHANGELOG.md | Release history not tracked | **Medium** | Create; backfill from git log | Small |
| TD-012 | Architecture | Message flow top-level constraint not enforced by parser | Silent bad diagrams | **Medium** | Throw error if `~~>` inside pool context | Small |
| TD-013 | Testing | No accessibility tests | aria output not verified | **Medium** | Assert SVG aria attributes in tests | Small |
| TD-014 | Performance | `[...contextStack].reverse().find()` in parser loop | O(n²) for deep stacks | **Low** | Maintain separate current-pool/lane pointers | Small |
| TD-015 | UX polish | Zoom controls not discoverable | Users miss pan/zoom interaction | **Low** | Add tooltip / subtle hint | Small |
| TD-016 | Accessibility | Per-element aria-labels deferred | Screen readers can't announce individual nodes | **Low** | `aria-label` on each shape group | Large |
| TD-017 | Maintainability | Dark mode toggle not visible in pages despite `next-themes` in deps | Feature may be partially implemented or dead code | **Low** | Implement toggle or remove dep | Small |

---

## 9. Product Directionality Analysis

### Trendline

The project has been consistently moving from a rendering experiment toward a credible Mermaid ecosystem contribution. Every inflection point — adding the status ribbon, writing the decision log, publishing the contribution path, documenting the support matrix, engaging with issue #7699, shipping pools/lanes, adding corpus tests — moves in one direction: *becoming the reference implementation for `bpmn-beta` in Mermaid*.

### Directionality Statement

> Based on the current implementation, this Repl appears to be evolving from **a rendering prototype and DSL proposal site** into **a publishable Mermaid external diagram plugin with an upstream core proposal path**, with the strongest gravity around **DSL design and the Mermaid ecosystem integration contract**. The next logical productization move is **wiring the existing modules to `registerExternalDiagrams()` and publishing a v0.1.0 npm package**, not **expanding the BPMN element set or rebuilding the layout engine**.

### Product Direction Options

| Option | Description | Pros | Cons | Recommended? |
|---|---|---|---|---|
| **A — Conservative hardening** | Fix dep bloat (TD-001), wire `registerExternalDiagrams()` (TD-003), fix live theme (TD-004), add error UI (TD-005), add CI gate (TD-007), move roadmap to repo (TD-008). Publish v0.1.0 npm package. | Directly unlocks all downstream goals; minimum viable contribution artifact | No new BPMN features | **Yes — do this first** |
| **B — Feature expansion** | Add intermediate events, timer/message/error markers, deterministic layout, coordinate hints (DEC-001). Expand support matrix before publishing. | More impressive demo; covers more use cases | Delays integration milestone; risks scope creep | After A |
| **C — Platform / ecosystem** | Langium grammar, VS Code extension, Mermaid CLI integration, full npm ecosystem. | Maximally impactful | Very large scope; premature | After B |

---

## 10. Productization Gap Analysis

| Area | Current Maturity (0–5) | Required for Productization | Gap | Priority |
|---|---|---|---|---|
| Product definition | 4 | Stable, public, in repo | Decision log strong; Notion is canonical (should be repo) | P1 |
| Target users | 4 | Clear, documented | Well-defined | P2 |
| Core workflows | 3 | End-to-end journey works | Playground ✓; Mermaid integration ✗ | P0 |
| UX clarity | 3 | Error handling, discoverability | Error display gap; dep bloat affects impression | P1 |
| Data model | 4 | Frozen API before upstream PR | `BpmnDb` well-designed; not frozen | P1 |
| Security/privacy | 3 | No known CVEs; client-only | 9 CVEs patched; dep audit incomplete | P2 |
| Error handling | 1 | Errors surfaced visibly | Parser errors silently blank the preview | **P0** |
| Testing | 3 | Parser + renderer + layout + integration | Parser/detector/DB tested; renderer/layout/integration not | P1 |
| Deployment | 3 | npm package + CI gate | GH Pages ✓; npm ✗; test pre-gate ✗ | **P0** |
| Documentation | 3 | README, DSL spec, CHANGELOG in repo | Split between React pages and Notion | P1 |
| Maintainability | 2 | Dep hygiene, no dead code | 40+ unused deps; shape library inline | **P0** |
| Roadmap | 3 | In repo, versioned | Roadmap page exists; Notion is canonical | P1 |
| Support model | 1 | GitHub Issues triage process | No process defined | P3 |
| Analytics/feedback | 0 | Usage signals | No analytics | P3 |
| Governance | 3 | Decision log, contribution guide | Decision log strong; no CONTRIBUTING.md | P2 |

**Overall readiness score: ~2.7/5** — Solid foundation, significant gaps in integration, error handling, and distribution.

---

## 11. Forward Roadmap (90-day horizon)

### Phase 1 — Stabilize (Days 1–21)

| Deliverable | Description | Priority | Effort |
|---|---|---|---|
| BL-001: Prune unused deps | Remove all 40+ unused Radix UI + template packages from `package.json` | P0 | Small |
| BL-002: Add test CI gate | Add `pnpm test` step to `deploy.yml` before deploy | P0 | Small |
| BL-003: Error display in Playground | Try/catch around render; show error + line number in preview panel | P0 | Small |
| BL-004: Migrate canonical roadmap to repo | Create `docs/roadmap.md`; remove Notion-wins footnote from `Roadmap.tsx` | P0 | Small |
| BL-008: Create CHANGELOG.md | Backfill from git log; Keep a Changelog format | P1 | Small |
| BL-015: CONTRIBUTING.md | Filing issues, DSL proposals, running tests, PR process | P1 | Small |
| BL-017: Dark mode toggle or dep cleanup | Implement or remove `next-themes` | P1 | Small |

### Phase 2 — Clarify (Days 22–45)

| Deliverable | Description | Priority | Effort |
|---|---|---|---|
| BL-005: Wire `registerExternalDiagrams()` | Create `src/lib/mermaid-plugin.ts`; test against real Mermaid | P0 | Medium |
| BL-006: Live Mermaid theme binding | Read `primaryColor`, `lineColor`, `nodeBorder` at render time | P0 | Medium |
| BL-007: Extract shape library | Move SVG drawing to `src/lib/shapes/` | P1 | Medium |
| BL-010: Freeze `BpmnDb` public API | Document stable surface; add semver note | P1 | Small |
| BL-012: Enforce message-flow constraint | Throw error if `~~>` inside pool block | P1 | Small |
| BL-009: Execute DEC-012 engagement | Post comment on #7699 with prototype URL and DSL framing | **P0** | Small |

### Phase 3 — Extend (Days 46–70)

| Deliverable | Description | Priority | Effort |
|---|---|---|---|
| BL-011: Renderer snapshot tests | Vitest snapshots for all 5 corpus examples | P1 | Medium |
| BL-019: Layout regression tests | Assert node positions and pool widths | P1 | Medium |
| BL-014: Accessibility tests | Assert aria attributes on SVG output | P1 | Small |
| BL-016: Coordinate-hint layout (DEC-001) | Optional `@[row,col]` node annotation | P2 | Medium |
| BL-013: Publish v0.1.0 npm package | Publishable `package.json`; publish to npm | **P0** | Medium |

### Phase 4 — Productize (Days 71–90)

| Deliverable | Description | Priority | Effort |
|---|---|---|---|
| Prototype Langium grammar | Begin `bpmn-grammar.langium`; validate against corpus | P1 | Large |
| Intermediate events | `msg:start`, `msg:end`, `timer:start` — first deferred tier | P2 | Large |
| Semantic BPMN validation | Gateway rules; event lifecycle; meaningful errors | P2 | Large |
| BL-020: Open formal upstream PR | Draft Mermaid core PR with DSL spec, tests, npm package | P1 | Medium |

---

## 12. Recommended Backlog

| Backlog ID | Title | User Story / Task | Acceptance Criteria | Priority | Effort | Type |
|---|---|---|---|---|---|---|
| BL-001 | Prune unused package.json deps | Remove all packages not imported in source | Every declared dep imported; build + tests pass | P0 | Small | Refactor |
| BL-002 | Add test pre-gate to CI | Add test step to `deploy.yml` before build/deploy | Deploy fails when tests fail; passes when tests pass | P0 | Small | DevOps |
| BL-003 | Error display in Playground | As a contributor, when I type invalid syntax I see a clear error message | Error with line number shown; clears when fixed | P0 | Small | UX |
| BL-004 | Migrate canonical roadmap to repo | Move from Notion to `docs/roadmap.md`; update `Roadmap.tsx` | Notion-wins footnote removed; `docs/roadmap.md` exists with full content | P0 | Small | Documentation |
| BL-005 | `registerExternalDiagrams()` wiring | Create `src/lib/mermaid-plugin.ts` registering all 4 modules | Plugin importable; `bpmn-beta` renders via `mermaid.render()` | P0 | Medium | Feature |
| BL-006 | Live Mermaid theme binding | `bpmn-styles.ts` reads live Mermaid theme at render time | Light/dark theme switching changes diagram colors | P0 | Medium | Feature |
| BL-007 | Extract shape library | Move SVG shape drawing to `src/lib/shapes/` | Each element type has its own shape module; 58 tests still pass | P1 | Medium | Refactor |
| BL-008 | Create CHANGELOG.md | Keep a Changelog format; backfill from git log | File exists; unreleased section present; git history reflected | P1 | Small | Documentation |
| BL-009 | Execute DEC-012 engagement | Post public comment on mermaid-js/mermaid#7699 | Comment posted; links to playground + DSL spec; framing is complementary | P0 | Small | Research |
| BL-010 | Freeze `BpmnDb` public API | Document stable surface; add semver note | `CHANGELOG.md` notes API freeze; breaking changes require major bump | P1 | Small | Architecture |
| BL-011 | Renderer snapshot tests | Vitest snapshots for SVG output of all 5 corpus examples | Snapshot file per example; diffs caught; tests run in CI | P1 | Medium | Test |
| BL-012 | Parser message-flow enforcement | Throw error if `~~>` inside pool/lane block | Parser throws `"Line N: message flows must be declared at top level"` | P1 | Small | Feature |
| BL-013 | Publish v0.1.0 npm package | Publishable `package.json` with name + exports | `npm install mermaid-diagram-bpmn` works | P0 | Medium | DevOps |
| BL-014 | Accessibility tests | Assert aria attributes on SVG output | Tests assert `role="img"`, `aria-labelledby`, `<title>` content | P1 | Small | Test |
| BL-015 | CONTRIBUTING.md | Cover: bugs, DSL proposals, tests, PR process | File exists at repo root; covers all 4 topics | P1 | Small | Documentation |
| BL-016 | Coordinate-hint layout (DEC-001) | Optional `@[row,col]` node annotation | Syntax parsed; overrides auto-placement; existing examples unchanged | P2 | Medium | Feature |
| BL-017 | Dark mode toggle | Implement toggle or remove `next-themes` dep | Toggle visible in nav OR dep removed | P1 | Small | Feature |
| BL-018 | Export SVG from Playground | "Export SVG" button downloads current render | SVG file downloaded on button click | P2 | Small | Feature |
| BL-019 | Layout regression tests | Assert layout dimensions for corpus examples | Pool header widths match; node positions within bounds | P1 | Medium | Test |
| BL-020 | Upstream Mermaid PR draft | Draft Mermaid core PR proposing `bpmn` diagram type | PR exists; links npm package, DSL spec, test suite, playground | P1 | Medium | Architecture |

---

## 13. Documentation Artifact Plan

| Document | Purpose | Recommended Filename | Should Create Now? | Notes |
|---|---|---|---|---|
| Prototype-to-Product Retrospective | This document — permanent as-built record | `docs/retrospective.md` | **Yes** | |
| As-Built PRD | Reverse-engineered requirements; scope source of truth | `docs/as-built-prd.md` | **Yes** | Extracts requirements tables |
| Decision Register (existing) | Durable governance log | `docs/decisions.md` | **Extend** | DEC-014 needs resolution |
| DSL Specification (existing) | Standalone DSL reference for Mermaid docs | `docs/dsl-spec.md` | **Extend** | Needs review for completeness |
| Canonical Roadmap | Authoritative roadmap; replaces Notion | `docs/roadmap.md` | **Yes — P0** | Required to remove Notion dependency |
| Architecture Summary (existing) | Module dependency + narrative for Mermaid PR | `docs/architecture.md` | **Extend** | Add module dependency diagram |
| Technical Debt Register | Prioritized known debt | `docs/technical-debt.md` | **Yes** | TD-001..TD-017 |
| Open Questions | Unresolved product and technical questions | `docs/open-questions.md` | **Yes** | |
| CHANGELOG.md | Release history | `CHANGELOG.md` | **Yes — P0** | Backfill from git log |
| CONTRIBUTING.md | Contributor onboarding | `CONTRIBUTING.md` | **Yes — before npm publish** | |
| README.md | Root README with install, usage, contribute | `README.md` | **Refresh** | Must cover: what it is, playground link, how to install/contribute |

---

## 14. External Artifact Sync Plan

| Destination | Recommended Artifact | Purpose | Sync Method | Notes |
|---|---|---|---|---|
| **This repo** | `docs/retrospective.md` | Permanent as-built record | This file | Done |
| **This repo** | `docs/as-built-prd.md` | Requirements source of truth | Create from Deliverable 5 | |
| **This repo** | `docs/roadmap.md` | Canonical roadmap | Migrate from Notion | P0 |
| **This repo** | `CHANGELOG.md` | Release history | Create; backfill from git | |
| **This repo** | `CONTRIBUTING.md` | Contributor onboarding | Write new | |
| **GitHub repo root** | `README.md` refresh | Install, usage, playground, contribute | Push to origin/main | Must be clean and compelling |
| **GitHub** | GitHub Issues | Actionable backlog | Convert BL-001..BL-020 | Labels: type, priority |
| **GitHub** | `docs/dsl-spec.md` | Standalone DSL spec for Mermaid PR | Ensure current before PR | Match `DslReference.tsx` exactly |
| **Notion** | Deliverables 1 + 10 (exec summary + directionality) | Personal strategic narrative | Paste manually | Notion = strategy; repo = technical |
| **Mermaid #7699** | Playground URL + DSL proposal comment | Community engagement (DEC-012) | Post manually | Time-sensitive |

---

## 15. Open Questions

### Product

| QID | Question | Why It Matters | Recommended Owner | Blocks? |
|---|---|---|---|---|
| PQ-001 | Is the goal to get `bpmn-beta` into Mermaid core, or maintain as permanent external plugin? | Shapes entire Phase 4 investment | Project owner | Yes |
| PQ-002 | Does `bpmn-beta` keyword become `bpmn` when syntax stabilizes, or stay `bpmn-beta` permanently? | Breaking change; affects all downstream users | Project owner + Mermaid maintainers | Yes |
| PQ-003 | Has a BPMN practitioner reviewed the shape library for notation correctness? | Documented High risk; erodes credibility immediately | Project owner | Yes — before announce |

### Technical

| QID | Question | Why It Matters | Recommended Owner | Blocks? |
|---|---|---|---|---|
| TQ-001 | Does `BpmnDb` API surface match Mermaid's internal DiagramDB contract? | Any mismatch must be resolved before upstream PR | Project owner (verify against Mermaid source) | Yes |
| TQ-002 | What Mermaid version is the integration target? | API may differ between versions | Project owner | Yes — blocks BL-005 |
| TQ-003 | Does `registerExternalDiagrams()` support the async renderer signature needed for React SVG output? | May require non-React adapter | Project owner | Yes — blocks BL-005 |
| TQ-004 | Should the npm package include the React playground, or only lib modules? | Affects bundle size and consumer surface | Project owner | Yes — blocks BL-013 |
| TQ-005 | Is the hand-written parser sufficient for error recovery or is Langium needed sooner? | Affects DEC-013 timing | Project owner | No |

### UX

| QID | Question | Why It Matters | Recommended Owner | Blocks? |
|---|---|---|---|---|
| UXQ-001 | Should playground auto-reformat/indent DSL source? | Quality of life | Project owner | No |
| UXQ-002 | Should playground support sharing via URL hash? | High value for DEC-012 community engagement | Project owner | No |

### Business

| QID | Question | Why It Matters | Recommended Owner | Blocks? |
|---|---|---|---|---|
| BMQ-001 | If Mermaid accepts `bpmn-beta` into core, what is the maintenance commitment? | Long-term responsibility | Project owner | No — but must think through before PR |
| BMQ-002 | How should the project relate to the Emrich/DFKI paper? Collaborate, compete, or ignore? | Engagement strategy (DEC-012) needs a stance | Project owner | Yes — blocks BL-009 |

### Deployment

| QID | Question | Why It Matters | Recommended Owner | Blocks? |
|---|---|---|---|---|
| DPQ-001 | Should npm package publish under personal npm account or project-specific org? | Governance; hard to change after publish | Project owner | Yes — blocks BL-013 |

---

## 16. Recommended Next Prompts

### Version A — Documentation Creation

```
You are in BUILD MODE.

The Prototype-to-Product Retrospective for mermaid-diagram-bpmn has been reviewed.

Create these documentation artifacts in order:

1. CHANGELOG.md at repo root — Keep a Changelog format; [Unreleased] section; backfill from git log using [0.0.x] for pre-release entries
2. CONTRIBUTING.md at repo root — Sections: overview, file a bug, propose a DSL change, run tests, PR process; under 150 lines; link to docs/decisions.md and #7699
3. docs/roadmap.md — Migrate canonical roadmap content (MVP scope, deferred, readiness table, 7-step path); update Roadmap.tsx to remove the "Notion wins" footnote and link to this file instead
4. docs/open-questions.md — Export all open questions from the retrospective by category
5. docs/technical-debt.md — Export TD-001 through TD-017, grouped by severity

After all files are created, run: pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck
```

### Version B — Productization Implementation (Phase 1)

```
You are in BUILD MODE.

Implement Phase 1 (Stabilize) of the mermaid-diagram-bpmn forward roadmap. These are the P0 items that block all downstream goals.

BL-001: Prune unused dependencies
- Audit every package in artifacts/mermaid-diagram-bpmn/package.json against actual source imports
- Remove all packages not imported in src/ (expect: all unused @radix-ui/*, recharts, react-hook-form, @hookform/resolvers, date-fns, embla-carousel-react, react-day-picker, cmdk, vaul, react-icons, input-otp, framer-motion — confirm by checking imports first)
- Run typecheck and tests; both must pass

BL-002: Add test pre-gate to CI
- Edit .github/workflows/deploy.yml
- Add pnpm --filter @workspace/mermaid-diagram-bpmn run test before build and deploy
- Deploy must not run if tests fail

BL-003: Error display in Playground
- Edit artifacts/mermaid-diagram-bpmn/src/pages/Playground.tsx
- Wrap render call in try/catch
- Show error message + line number in preview panel when parsing/rendering throws
- Error clears when diagram renders successfully

BL-004: Migrate canonical roadmap to repo
- Create artifacts/mermaid-diagram-bpmn/docs/roadmap.md with full roadmap content
- Update Roadmap.tsx to remove the "Notion wins" footnote; replace with link to docs/roadmap.md

When done: run pnpm --filter @workspace/mermaid-diagram-bpmn run test (58 tests must pass) and pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck (no errors).
```

---

*This document was auto-generated by a Prototype-to-Product Retrospective analysis on 2026-05-21. Evidence labels: **Verified** = directly supported by files/behavior/commits. **Inferred** = strongly suggested by implementation patterns. **Speculative** = plausible, needs confirmation. **Unknown** = insufficient evidence.*
