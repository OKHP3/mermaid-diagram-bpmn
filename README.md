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

## A — Agent Skill Suite (BP-SKILL v0.2)

> The playground is for people. The skills are for agents. The context files are for both.

This repository ships a SKILL.md-compatible **Business Process Agent Skill Suite** under `skills/`. The three core skills cover the full process documentation lifecycle; supporting skills and context files complete the suite.

### Core pipeline

```
okhp3-process-discovery  →  okhp3-process-narrative  →  okhp3-bpmn-for-mermaid
        ↓ pir.yaml                  ↓ pns.yaml                  ↓ bpmn-beta.mmd
```

### Skill catalogue

| Skill | Path | `bp_skill_version` | Trigger domain |
|---|---|---|---|
| `okhp3-process-discovery` | `skills/okhp3-process-discovery/` | 0.2.0 | BABOK v3-aligned process elicitation; produces PIR + stakeholder register |
| `okhp3-process-narrative` | `skills/okhp3-process-narrative/` | 0.2.0 | ISO 9001 §4.4.1 / BABOK process narrative; produces PNS, SIPOC, RACI |
| `okhp3-bpmn-for-mermaid` | `skills/okhp3-bpmn-for-mermaid/` | 0.2.0 | bpmn-beta generation, validation, normalization, repair |
| `okhp3-mermaid-theme-builder` | `skills/okhp3-mermaid-theme-builder/` | — | Palette application, themeVariables, prompt scaffolds, renderer profiles |

### Context files (`context/`)

Nine structured Markdown files (schema v0.2) that skills read at session initialization to tailor output without per-session prompting:

| File | Purpose | Consumed by |
|---|---|---|
| `organization-profile.md` | Org name, type, language, process owner title | all three core skills |
| `sector-context.md` | APQC PCF category, regulatory vocabulary | all three core skills |
| `regional-context.md` | Jurisdiction, currency, date format, locale compliance | all three core skills |
| `role-dictionary.md` | Canonical role IDs → titles + departments | all three core skills |
| `process-taxonomy.md` | Process hierarchy + APQC PCF mappings | all three core skills |
| `compliance-controls-registry.md` | Standing compliance controls (SOX, ISO 9001, GDPR…) | process-narrative |
| `integration-registry.md` | Enterprise systems catalogue + task type hints | process-narrative, bpmn-for-mermaid |
| `notation-preferences.md` | Diagram formatting conventions + layout defaults | bpmn-for-mermaid |
| `business-glossary-and-rulebook.md` | Canonical terms + standing business rules | all three core skills |

**Install:** Copy `skills/` and `context/` into your project or agent workspace.  
**Configure:** Point your agent to discover skills from the local path per [agentskills.io](https://agentskills.io).

**Trigger examples:**
- "I need to document this purchase approval process from scratch." → `okhp3-process-discovery`
- "Turn this PIR into a formal process narrative with RACI and SIPOC." → `okhp3-process-narrative`
- "Convert these process notes into a bpmn-beta diagram with pools and lanes, then validate it." → `okhp3-bpmn-for-mermaid`
- "Apply the Ocean Depth palette to this diagram and give me a prompt scaffold." → `okhp3-mermaid-theme-builder`
- "Document this workflow end-to-end: elicit the process, write the narrative, then generate the BPMN diagram." → all three core skills compose in sequence

## B — Why This Is Not Just a Diagram DSL

Most BPMN tooling draws a hard line: either you get an XML-heavy process engine format (BPMN 2.0 XML, bpmn-js) or you get a loose approximation in a general-purpose diagram tool (flowchart, swimlane). Neither is designed for the text-first, version-controlled, LLM-assisted documentation workflow that engineering and operations teams actually use.

`bpmn-beta` is the diagram layer of a deliberate stack:

1. **Discovery** — structured elicitation produces a machine-readable PIR (BABOK v3-aligned)
2. **Narrative** — PIR becomes a PNS document with ISO 9001 process-box semantics, RACI, SIPOC, KPIs, and controls — a defensible process document, not just a box-and-arrow sketch
3. **Visual** — PNS drives the bpmn-beta diagram; every shape is traceable to a documented process element

The agent skills enforce this stack. The context files eliminate the per-session re-specification of organizational constants. The result is process documentation that is simultaneously human-readable, agent-producible, version-controllable, and notation-compliant.

## C — Ecosystem Position

| Tool | Role | Relationship |
|---|---|---|
| **Mermaid** | Diagram rendering host | `bpmn-beta` targets `registerExternalDiagrams()` for upstream inclusion |
| **bpmn-js** | Full BPMN 2.0 execution tooling | Explicit non-dependency — different design goal (authoring vs execution) |
| **BABOK v3** | Elicitation standard | `okhp3-process-discovery` implements BABOK §4 + §10 techniques |
| **ISO 9001:2015** | Process governance standard | `okhp3-process-narrative` produces §4.4.1-compatible process documentation |
| **BPM CBOK v4** | Process management body of knowledge | Lifecycle framing for the three-skill pipeline |
| **APQC PCF** | Process taxonomy standard | `process-taxonomy.md` context file uses PCF category numbers |
| **agentskills.io** | Skill discovery and distribution | SKILL.md format target; `bp_skill_version` field aligns with registry schema |

The `bpmn-beta` DSL is the **notation bridge** — it gives the agent skill suite a concrete, verifiable output format that satisfies both BPMN 2.0.2 Descriptive Conformance notation rules and Mermaid's text-first rendering model. Neither standard is subordinated to the other.

## License

MIT — see [LICENSE](./LICENSE).

## Manual actions required (project owner)

Two surface updates require manual action outside this repository:

1. **GitHub repo description** — Update in GitHub Settings → About to:  
   `A text-first bpmn-beta diagram type for Mermaid — readable BPMN process diagrams, no XML, no bpmn-js. Includes Business Process Agent Skill Suite: process discovery, narrative specification, and bpmn-beta visual modeling skills (SKILL.md / agentskills.io format).`

2. **overkillhill.com project page** — Add an inline `[experimental]` label on the pool/lane canonical DSL example in the status checklist section, matching the callout now present in the playground DSL Reference page.
