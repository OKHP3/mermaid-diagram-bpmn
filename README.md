# BPMN for Mermaid

A Mermaid-native diagram type for business process modeling using a readable, text-first DSL. Write BPMN the way you write flowcharts — then commit it.

**Status: Prototype. DSL is unstable and subject to change.**

## Project thesis

Mermaid has a material diagram-type gap: BPMN 2.0 is not represented as a native syntax. The credible path is not to force BPMN through `flowchart`, but to create a dedicated `bpmn-beta` plugin implementing a documented descriptive subset — and later propose upstream inclusion once the syntax stabilizes.

## Project surfaces

| Surface | URL |
|---|---|
| Public project page | https://overkillhill.com/projects/bpmn-for-mermaid/ |
| GitHub repository | https://github.com/OKHP3/mermaid-diagram-bpmn |
| Public playground | https://okhp3.github.io/mermaid-diagram-bpmn |
| Replit dev surface | https://replit.com/t/overkill-hill/repls/BPMN-for-Mermaid |
| Notion specification | https://www.notion.so/overkillhill/BPMN-for-Mermaid-bpmn-beta-Diagram-Type-Proposal-357812e0ced481c88b20d2eb493dc775 |

## Current implementation status

| Category | Elements |
|---|---|
| **Implemented** | `start`, `end`; `task`, `task:user`, `task:service`, `task:script`, `task:receive`, `task:send`; `xor`, `and`, `or`; sequence flow `-->`, conditional label, default flow `==>`; `accTitle`/`accDescr`; auto left-to-right layout; theme-aware SVG styling |
| **Experimental** | `pool`, `lane`, message flow `~~>`, pool/lane-aware layout, cross-pool routing |
| **Planned** | Intermediate events, timer/message/error markers, text annotations, associations, Langium grammar, Mermaid External Diagram API packaging, `getStyles` theme variable binding, parser-enforced BPMN domain rules |
| **Out of scope (v1)** | BPMN XML import/export, executable semantics, `bpmn-js` runtime dependency, choreography, conversation, complex gateways, event subprocesses |

## Standards compliance

`bpmn-beta` has two co-equal hard requirements. Both must be satisfied — neither takes priority:

| Requirement | What it means | Acceptance target |
|---|---|---|
| **Mermaid rendering** | Output must render correctly in all Mermaid-compatible hosts (GitHub, Notion, live editor) | Plugin v1 target: render via `registerExternalDiagrams()`. Current state: standalone React app with direct SVG renderer and GitHub Pages playground. |
| **BPMN 2.0.2 notation** | Every shape, marker, flow line, and gateway symbol must match the OMG BPMN 2.0.2 formal specification (Descriptive Conformance Sub-Class, Section 2.1) | Ongoing — all rendered elements must match the spec |

**BPMN specification resources:**

| Resource | Link |
|---|---|
| BPMN standard home | https://www.bpmn.org/ |
| OMG BPMN 2.0.2 specification | https://www.omg.org/spec/BPMN/2.0.2/PDF |
| Specification PDF (in this repo) | [`artifacts/mermaid-diagram-bpmn/standards/OMG-BPMN-2.0.2-formal-specification.pdf`](./artifacts/mermaid-diagram-bpmn/standards/OMG-BPMN-2.0.2-formal-specification.pdf) |
| Compliance reference | [`artifacts/mermaid-diagram-bpmn/standards/BPMN-SPEC-REFERENCE.md`](./artifacts/mermaid-diagram-bpmn/standards/BPMN-SPEC-REFERENCE.md) |
| Standards index | [`standards/README.md`](./standards/README.md) |

## Related reading

- [Notion specification](https://www.notion.so/overkillhill/BPMN-for-Mermaid-bpmn-beta-Diagram-Type-Proposal-357812e0ced481c88b20d2eb493dc775) — full design spec, decisions, and engagement strategy
- [Mermaid issue #7699](https://github.com/mermaid-js/mermaid/issues/7699) — existing BPMN support request
- [Mermaid issue #2623](https://github.com/mermaid-js/mermaid/issues/2623) — BPMN support discussion
- [OMG BPMN 2.0 spec](https://www.omg.org/spec/BPMN/) — official standard

## Quick example

```
bpmn-beta
accTitle: Purchase Request Approval

start s1 "Request Raised"
task:user t1 "Review Request"
xor g1 "Approved?"
task:service t2 "Issue PO"
end e1 "Done"

s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> e1: "no"
t2 --> e1
```

## Getting started

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

## Agent Skill

This repository includes a SKILL.md-compatible agent skill at `skills/okhp3-bpmn-for-mermaid/`.

The skill delivers bpmn-beta DSL generation, validation, and normalization to any SKILL.md-compatible
agent (Claude, GitHub Copilot, Cursor, VS Code, Gemini CLI, OpenAI Codex) without requiring the browser playground.

**Install:** Copy the `skills/` folder into your project or agent workspace.  
**Configure:** Point your agent to discover skills from the local path per [agentskills.io](https://agentskills.io).  
**Trigger example:** "Convert these process notes into a bpmn-beta diagram with pools and lanes, then validate it."

A companion lightweight skill is also available at `skills/bpmn-for-mermaid/` — a smaller reference-only package
without scripts or tests, suited for agents with tighter context budgets.

## License

MIT — see [LICENSE](./LICENSE).
