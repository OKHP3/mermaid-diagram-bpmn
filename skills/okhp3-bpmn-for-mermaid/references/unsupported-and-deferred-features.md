# Unsupported and Deferred Features — bpmn-beta v0.1

> This is a trust document. It ships verbatim in the skill to ensure agents and practitioners set accurate expectations.

---

## What bpmn-beta IS

bpmn-beta is a **text-first, AI-generatable BPMN DSL** that:

- Maps the **BPMN 2.0 Descriptive Conformance Sub-Class** to a Mermaid-idiomatic syntax
- Renders BPMN-shaped SVG natively in any Mermaid host without bpmn-js or BPMN XML
- Is readable and writable by humans without specialized tooling
- Is generatable by LLMs without syntax repair, given this skill
- Targets **documentation-grade process diagrams** — the notation that 80%+ of real-world BPMN diagrams actually use
- Lives in Git alongside code, renderable in GitHub, GitLab, Notion, Obsidian, VS Code, Mintlify, ReadMe, and Docusaurus

---

## What bpmn-beta IS NOT

| Claim | Reality |
|---|---|
| Full BPMN 2.0 conformance | ✗ — targets Descriptive subset only. Many BPMN 2.0 elements are not implemented. |
| Executable BPMN | ✗ — no runtime semantics, no expressions, no service task bindings, no compensation logic |
| BPMN 2.0 XML compatible | ✗ — no import/export to/from `.bpmn` XML format. Not usable with Camunda, Flowable, Zeebe, or Signavio directly |
| bpmn-js compatible | ✗ — completely independent of the bpmn-js ecosystem. No shared APIs, models, or format |
| Production Mermaid plugin | ✗ — prototype stage. Not yet published to npm. No production adoption metrics. |
| Formally certified | ✗ — not submitted to OMG BPMN 2.0 conformance test suite |

---

## Out-of-Scope Elements — v1

For each element: the reason it is deferred.

### Events

| Element | Reason for Deferral |
|---|---|
| Terminate End Event | Parser and renderer not yet extended for terminate semantics; planned post-v1 |
| Message Start Event | Experimental keyword not parsed; `start` with label used as approximation |
| Timer Start Event | Experimental keyword not parsed; `start` with label used as approximation |
| Signal Events (all) | Signal semantics require a signal catalog; outside Descriptive Conformance for v1 |
| Conditional Events | Require expression evaluation engine; outside v1 scope |
| Escalation Events | Escalation to parent process requires nested process support; out of v1 scope |
| Compensation Events | Compensation requires boundary events and compensation task markers; out of v1 |
| Cancel Events | Transaction-scoped; requires Transaction Sub-Process support |
| Multiple Trigger Events | Combination of triggers; requires all trigger types to be implemented first |
| Link Events | Cross-diagram linkage; outside Descriptive Conformance intent for documentation use |

### Activities

| Element | Reason for Deferral |
|---|---|
| Manual Task | Low differentiation from User Task in documentation diagrams; not required for Descriptive subset |
| Business Rule Task | Requires DMN rule references; outside v1 documentation scope |
| Call Activity | References separately defined processes; requires process registry |
| Embedded Sub-Process (expanded) | Nested process rendering requires non-trivial layout changes |
| Embedded Sub-Process (collapsed) | Approximated with a labeled task; full support deferred |
| Event Sub-Process | Triggered by events outside normal flow; complex semantics |
| Transaction Sub-Process | Requires transaction boundary rendering and compensation |
| Multi-Instance Markers | Loop/multi-instance semantics outside documentation scope |
| Ad-hoc Sub-Process | Non-ordered execution; outside Descriptive Conformance |

### Gateways

| Element | Reason for Deferral |
|---|---|
| Event-Based Gateway | Requires intermediate events to function correctly; depends on event:message/event:timer |
| Complex Gateway | Custom activation condition expressions outside v1 scope |

### Structural

| Element | Reason for Deferral |
|---|---|
| Participant (Black-Box Pool) | No external-only participant keyword; approximated with an empty pool |
| Nested Lanes | Parser throws on nested lanes; layout not implemented |

### Artifacts

| Element | Reason for Deferral |
|---|---|
| Data Object | Requires data flow model; outside Descriptive Conformance documentation use case |
| Data Store | Same as Data Object |
| Text Annotation | Depends on Association (`---`) which is planned but not yet parsed |
| Group | Low priority; approximated with comments |
| Association | `---` operator is planned — not parsed in v0.1 |

---

## Experimental Features (Specified, Not Fully Implemented)

These features have DSL keywords but are not fully parsed or reliably rendered:

| Feature | Status | Current Limitation |
|---|---|---|
| `event:message` | Specified, not parsed | Parser regex does not match `event:*` keywords. Silent skip — element not registered. |
| `event:timer` | Specified, not parsed | Same as above |
| `event:error` | Specified, not parsed | Same as above |
| Pool rendering | Experimental | Cross-lane flow routing is approximate. Lane width not equalized. |
| Lane rendering | Experimental | Part of pool rendering. Same limitations. |
| Message flow (`~~>`) | Experimental | Arrow routing between pools is approximate. Label positioning is not guaranteed. |

---

## Parser Limitations (v0.1 Prototype)

The current parser is a line-by-line regex parser — not a formal grammar (no JISON, no Langium).

**Implications:**
- Unknown keywords are **silently skipped**. A misspelled `task:user` (e.g., `task:users`) produces no error — the element simply does not exist in the model. This causes orphan flows that reference a non-existent ID. Run the validation script to catch this.
- No LSP support (no editor autocomplete or inline error highlighting).
- Minimal error messages — only structural errors (nested pools, misplaced message flows, unclosed blocks) throw.
- Flow label whitespace is handled by the regex; inconsistent spacing may cause a flow to match the wrong pattern.

**Planned resolution:** The Langium-grammar phase will replace the regex parser with a formal PEG/Langium grammar that produces proper parse trees with error recovery and LSP support.

---

## Rendering Limitations (v0.1 SVG Renderer)

- **Task markers** are SVG approximations, not the exact icon proportions specified in BPMN 2.0.2.
- **Pool/lane layout** uses a grid-based algorithm that does not account for edge crossings.
- **AND gateway joins** — the renderer does not currently guarantee alignment between a split's outgoing edge paths and its join's incoming edge paths.
- **No collision detection** — overlapping labels are possible in complex diagrams.
- **No dagre/ELK integration** — planned for the Langium grammar phase.

---

---

## Intentional Limitations (Not Bugs)

Some limitations are deliberate design decisions, not defects. Agents must not present these as future fixes — they are architectural choices.

| Limitation | Status | Rationale |
|---|---|---|
| No BPMN XML import/export | Intentional for v1 | User writes lightweight DSL, not BPMN XML. XML is deliberately decoupled from diagram authoring. This keeps bundle size small and avoids coupling to BPMN runtime tooling. |
| No execution semantics | Intentional | The target is descriptive diagramming, not workflow execution. Execution semantics are also likely never in scope for a Mermaid diagram type. |
| No formal conformance certification | Intentional | The project explicitly avoids claiming full BPMN 2.0 conformance. It targets the Descriptive Conformance sub-class only. Overclaiming erodes credibility. |
| No bpmn-js dependency | Intentional | bpmn-js is a comprehensive BPMN toolkit with different design goals. Using it would couple the project to a heavyweight runtime and different rendering philosophy, and would disqualify it from Mermaid's contribution bar. |

---

## Next-Priority Technical Work

Before proposing this plugin upstream, the following hardening steps are required (in approximate priority order):

1. **Convert parser to Langium** — replace the hand-written line parser with a formal Langium grammar. Add error recovery, better diagnostics, LSP support.
2. **Package as Mermaid external diagram plugin** — add `detector`, `loader`, and plugin entry point compatible with `registerExternalDiagrams()`.
3. **Add invalid syntax fixtures** — test corpus of inputs that should fail with specific error messages. Currently, invalid syntax is silently skipped.
4. **Add visual regression tests** — renderer snapshot tests to catch shape regressions.
5. **Formalize pool/lane/message-flow validation** — structural errors for misplaced message flows, unclosed blocks, and nested lanes.
6. **Improve layout determinism** — constraint-based layout that aligns pool widths and routes message flows around pool boundaries.
7. **Add export-to-SVG/PNG download** — allows users to save rendered diagrams without a screenshot.
8. **Document bundle size and dependency posture** — required for Mermaid contribution bar review.
9. **LLM benchmark prompts** — give identical process prompts to major LLMs and compare whether they produce valid `bpmn-beta`. Validates AI-generation-readiness claim.
10. **Engage Mermaid community** — comment on issue #7699 with prototype link and ask for syntax feedback before locking the DSL.

---

## How to Report Issues or Contribute

- GitHub Issues: https://github.com/OKHP3/mermaid-diagram-bpmn/issues
- Playground: https://okhp3.github.io/mermaid-diagram-bpmn/playground
- Strategy and positioning: docs/strategy.md

Priority contribution areas: Langium grammar, dagre layout integration, event:* keyword parsing, BPMN XML round-trip exploration.
