# BPMN 2.0.2 Specification Reference

**Standard:** Business Process Model and Notation (BPMN) Version 2.0.2
**Issuing body:** Object Management Group (OMG)
**Document number:** OMG Document Number: formal/2013-12-09
**ISO publication:** ISO/IEC 19510:2013
**Status in this project:** Authoritative notation reference — all rendered elements must conform to the notation defined in this specification

---

## Specification file

| File | Purpose |
|---|---|
| [`OMG-BPMN-2.0.2-formal-specification.pdf`](./OMG-BPMN-2.0.2-formal-specification.pdf) | Full OMG BPMN 2.0.2 formal specification — included in this repository as the authoritative notation reference |

---

## Official links

| Resource | URL |
|---|---|
| BPMN standard home | https://www.bpmn.org/ |
| OMG BPMN specification landing page | https://www.omg.org/spec/BPMN/ |
| BPMN 2.0.2 PDF (OMG) | https://www.omg.org/spec/BPMN/2.0.2/PDF |
| Original OMG document submission | http://www.omg.org/cgi-bin/doc?dtc/10-06-02 |

---

## Dual-compliance requirement

`bpmn-beta` has two co-equal hard requirements. **Both must be satisfied. Neither takes priority.**

| Requirement | What it means |
|---|---|
| **Mermaid rendering compliance** | Output must render correctly via Mermaid's `registerExternalDiagrams()` API and in all Mermaid-compatible hosts (GitHub, Notion, live editor). See `docs/mermaid-compatibility.md`. |
| **BPMN notation compliance** | Every shape, marker, flow line, and gateway symbol must match this specification. A diagram that renders in Mermaid but uses incorrect BPMN notation is a failed document. |

A diagram that renders correctly in Mermaid but violates BPMN notation is a failed document. A diagram that follows BPMN notation but fails to render in Mermaid is equally a failed document.

## Why this spec is here

Every shape, marker, flow type, gateway symbol, and event marker that this project renders must be grounded in the OMG BPMN 2.0.2 notation standard — not invented independently.

Including the spec in the repository means:
- Contributors can verify notation correctness without leaving the repo
- AI agents working on this codebase can resolve notation questions against the authoritative source
- Reviewers can cite a specific section when flagging a notation deviation
- The project's compliance claims are traceable to a concrete document
- When Mermaid and BPMN notation requirements create tension, the spec is the starting point for the decision log entry

---

## Descriptive conformance subset

`bpmn-beta` targets the **Descriptive Conformance Sub-Class** defined in BPMN 2.0.2 Section 2.1. This is the subset intended for human-readable process documentation — it excludes orchestration execution semantics, choreography, and conversation diagrams.

| Descriptive subset element | BPMN 2.0.2 section | bpmn-beta status |
|---|---|---|
| None Start Event | 10.4.1 | ✅ Implemented (`start`) |
| None End Event | 10.4.2 | ✅ Implemented (`end`) |
| Abstract Task | 10.2.1 | ✅ Implemented (`task`) |
| User Task | 10.3.4 | ✅ Implemented (`task:user`) |
| Service Task | 10.3.5 | ✅ Implemented (`task:service`) |
| Script Task | 10.3.6 | ✅ Implemented (`task:script`) |
| Receive Task | 10.3.2 | ✅ Implemented (`task:receive`) |
| Send Task | 10.3.1 | ✅ Implemented (`task:send`) |
| Exclusive Gateway (XOR) | 13.1.2 | ✅ Implemented (`xor`) |
| Parallel Gateway (AND) | 13.1.4 | ✅ Implemented (`and`) |
| Inclusive Gateway (OR) | 13.1.3 | ✅ Implemented (`or`) |
| Sequence Flow | 9.1 | ✅ Implemented (`-->`) |
| Conditional Flow | 9.1.3 | ✅ Implemented (`-->|"label"|`) |
| Default Flow | 9.1.4 | ✅ Implemented (`==>`) |
| Message Flow | 9.2 | ✅ Implemented (`~~>`) |
| Pool | 8.2 | ✅ Implemented (experimental) |
| Lane | 8.3 | ✅ Implemented (experimental) |
| Message Intermediate Event | 10.4.3 | 🔵 Planned |
| Timer Start Event | 10.4.1 | 🔵 Planned |
| Data Object | 10.6 | ⬜ Deferred |
| Subprocess | 10.5 | ⬜ Deferred |
| Call Activity | 10.5.3 | ⬜ Out of scope v1 |
| Choreography | 11.x | ⬜ Out of scope |
| Conversation | 12.x | ⬜ Out of scope |
| Collaboration | 8.x | ⬜ Out of scope |

Legend: ✅ Implemented · 🔵 Planned · ⬜ Deferred/Out of scope

---

## Key spec sections for contributors

When adding, modifying, or reviewing a rendered element, consult the relevant section:

| Topic | Spec section | What it defines |
|---|---|---|
| Flow objects overview | Chapter 9 | Sequence flow, message flow, association rules |
| Events (start/end/intermediate) | Chapter 10 | Event types, markers, lifecycle |
| Activities (tasks, subprocesses) | Chapter 10 | Task types, markers, boundary events |
| Gateways | Chapter 13 | XOR/AND/OR symbols, routing semantics |
| Swim lanes (pools/lanes) | Chapter 8 | Pool border rules, lane labels, participant identity |
| Descriptive conformance class | Section 2.1 | Official definition of the subset this project targets |
| Shape notation appendix | Appendix B | Visual reference for all markers and shapes |

---

## Notation compliance rules

These rules apply to every element rendered by `bpmn-renderer.tsx` and `bpmn-plugin.ts`:

1. **Start events** — thin single-line circle, no fill marker for "None" type (spec 10.4.1)
2. **End events** — thick single-line circle (spec 10.4.2)
3. **Tasks** — rounded rectangle; type marker in top-left corner (spec 10.2)
4. **Exclusive gateway** — diamond shape with an X marker (spec 13.1.2)
5. **Parallel gateway** — diamond shape with a + marker (spec 13.1.4)
6. **Inclusive gateway** — diamond shape with an O (circle) marker (spec 13.1.3)
7. **Default flow** — slash marker on the *source* end of the sequence flow line (spec 9.1.4)
8. **Message flow** — dashed line with open arrowhead (spec 9.2)
9. **Sequence flow** — solid line with filled arrowhead (spec 9.1)
10. **Pool** — rectangular container with a horizontal header on the left (vertical text) or top (spec 8.2)
11. **Lane** — horizontal subdivision of a pool with a label (spec 8.3)

Any deviation from these rules in a PR must cite a specific rationale and a `docs/decisions.md` entry.

---

## Accessing the specification

The PDF included at `standards/OMG-BPMN-2.0.2-formal-specification.pdf` is the full formal specification. It is publicly available from OMG at no cost:

- Direct PDF download: https://www.omg.org/spec/BPMN/2.0.2/PDF
- Specification home: https://www.omg.org/spec/BPMN/
- BPMN community: https://www.bpmn.org/

The OMG publishes its specifications for free public use. Including a copy in this repository is permitted under OMG's standard specification distribution policy.
