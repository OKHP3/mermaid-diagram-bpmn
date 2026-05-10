# BPMN for Mermaid — bpmn-beta Diagram Type Proposal

> **Status:** Prototype / Proof-of-concept — DSL unstable. Not full BPMN 2.0. No BPMN XML. No bpmn-js runtime.

A Mermaid-native diagram type for business process modeling. Text-first, version-controllable, Markdown-compatible. Write BPMN the way you write flowcharts — then commit it.

---

## Quick links

| Document | What it covers |
|---|---|
| [Project Snapshot & PRD](./prd.md) | Goals, non-goals, target personas, NFRs |
| [DSL Specification](./dsl-spec.md) | Syntax contract, flow operators, pool/lane rules, canonical examples |
| [Architecture](./architecture.md) | Module map, implementation notes, key decisions |
| [Decision Log](./decisions.md) | Durable governance log — accepted, proposed, and pending decisions |

---

## Project snapshot

**Working name:** BPMN for Mermaid / `bpmn-beta`  
**Project type:** Open-source contribution concept, Mermaid diagram-type proposal, BPMN 2.0 descriptive subset renderer  
**Repo:** [OKHP3/mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn)  
**Live playground:** [okhp3.github.io/mermaid-diagram-bpmn](https://okhp3.github.io/mermaid-diagram-bpmn/)  
**Status:** Concept capture → convergence phase  
**Created:** 2026-05-05

### Primary thesis

Mermaid has a material diagram-type gap: BPMN 2.0 is not represented as a native syntax. The credible path is not to force BPMN through `flowchart`, but to create a dedicated Mermaid-compliant diagram type, starting as an external `bpmn-beta` plugin and later proposing upstream inclusion in Mermaid core.

### Why this matters

BPMN is one of the standard visual languages for business process modeling. It sits directly in the overlap between enterprise architecture, process capture, workflow automation, and AI-assisted diagramming.

Mermaid already supports many diagram types, including recent beta additions such as Venn and Ishikawa. BPMN is conspicuously absent. That absence creates a contribution opportunity: a text-first, version-controllable BPMN notation that fits Markdown, GitHub, Notion, documentation portals, architecture repositories, and AI-generated process artifacts.

### Strategic positioning

> This is not an attempt to implement the entire BPMN 2.0 execution model inside Mermaid. It is a Mermaid-native `bpmn-beta` diagram type implementing a documented BPMN 2.0 descriptive subset for readable, version-controllable process diagrams.

Lead with:
- Mermaid-native readability
- Business/technical shared language
- Markdown and Git compatibility
- AI-generatable process diagrams
- Standards-aware scope control

---

## v1 scope (topline)

**In scope:** start/end events, core tasks (generic, user, service, script, receive, send), common gateways (XOR, AND, OR), sequence flows, conditional/default flows, message flows, pools, one-level lanes, `accTitle`/`accDescr`, theme-aware SVG.

**Deferred:** intermediate events, boundary events, event subprocesses, transactions, choreography, conversation diagrams, BPMN XML import/export, full execution semantics, multi-instance markers, compensation, data objects/stores, groups, deep nested lanes.

---

## Progressive contribution path

1. Engage on existing Mermaid BPMN issues (#7699, #2623, #660).
2. Publish a scoped `bpmn-beta` DSL proposal.
3. Build an external Mermaid diagram plugin (`registerExternalDiagrams()`).
4. Document supported BPMN elements and deferred features.
5. Collect examples, feedback, and usage.
6. Harden parser, renderer, layout, accessibility, styles, and tests.
7. Propose upstream Mermaid core inclusion once the syntax stabilizes.

---

## Related Mermaid issues

- [#7699](https://github.com/mermaid-js/mermaid/issues/7699) — Native BPMN 2.0 support proposal (filed 2026-05-02 by Andreas Emrich, DFKI)
- [#2623](https://github.com/mermaid-js/mermaid/issues/2623) — BPMN support discussion
- [#660](https://github.com/mermaid-js/mermaid/issues/660) — Older BPMN 2.0 diagram request
