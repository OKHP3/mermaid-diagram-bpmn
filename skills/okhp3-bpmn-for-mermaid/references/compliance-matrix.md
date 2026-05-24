# Compliance Matrix — BPMN 2.0.2 Descriptive Subset vs. Mermaid 11.15 bpmn-beta

> **Standard:** OMG BPMN 2.0.2 Descriptive Conformance Sub-Class  
> **Implementation:** Mermaid 11.15 bpmn-beta v0.1.0  
> **Status values:** `Full` | `Partial` | `Experimental` | `Not Supported`

---

## Events

| BPMN 2.0.2 Element | bpmn-beta Support | Notes |
|---|---|---|
| None Start Event | **Full** | `start id "label"` — rendered as thin circle |
| None End Event | **Full** | `end id "label"` — rendered as thick circle |
| Terminate End Event | **Not Supported** | No keyword. Approximate with `end` and a descriptive label. |
| Message Start Event | **Not Supported** | No keyword. Approximate with `start` and a descriptive label. |
| Message Intermediate Catch Event | **Experimental** | `event:message id "label"` — specified in DSL but not yet parsed by v0.1 renderer. Use `task:receive` as runtime approximation. |
| Message Intermediate Throw Event | **Not Supported** | No keyword. Use `task:send` as approximation. |
| Message End Event | **Not Supported** | No keyword. Use `end` + `task:send` in sequence as approximation. |
| Timer Intermediate Catch Event | **Experimental** | `event:timer id "label"` — specified but not parsed. Use `task:service "Wait: [duration]"` as approximation. |
| Timer Start Event | **Not Supported** | No keyword. Use `start` with descriptive label. |
| Error End Event | **Experimental** | `event:error id "label"` — specified but not parsed. Use `end "Error: [condition]"` as approximation. |
| Error Boundary Event | **Not Supported** | Boundary events not in v1 scope. |
| Signal Intermediate Event | **Not Supported** | No keyword. No approximation available. |
| Signal Start/End Event | **Not Supported** | No keyword. |
| Escalation Events | **Not Supported** | Out of Descriptive Conformance scope for v1. |
| Conditional Start/Intermediate Event | **Not Supported** | Out of Descriptive Conformance scope for v1. |
| Link Intermediate Event | **Not Supported** | Out of Descriptive Conformance scope for v1. |
| Compensation Intermediate Event | **Not Supported** | Out of Descriptive Conformance scope for v1. |
| Cancel Events | **Not Supported** | Out of Descriptive Conformance scope for v1. |
| Multiple Events | **Not Supported** | Out of Descriptive Conformance scope for v1. |

---

## Tasks

| BPMN 2.0.2 Element | bpmn-beta Support | Notes |
|---|---|---|
| Abstract Task | **Full** | `task id "label"` — no task type marker |
| User Task | **Full** | `task:user id "label"` — person icon marker |
| Service Task | **Full** | `task:service id "label"` — gear icon marker |
| Script Task | **Full** | `task:script id "label"` — scroll icon marker |
| Receive Task | **Full** | `task:receive id "label"` — envelope icon marker |
| Send Task | **Full** | `task:send id "label"` — filled envelope marker |
| Manual Task | **Not Supported** | Not in v1 scope. Use `task:user` as closest approximation (human performs without software). |
| Business Rule Task | **Not Supported** | Not in v1 scope. Use `task:service "Apply Business Rule"` as approximation. |

---

## Sub-Processes and Call Activities

| BPMN 2.0.2 Element | bpmn-beta Support | Notes |
|---|---|---|
| Embedded Sub-Process (collapsed) | **Not Supported** | Not in v1 scope. Approximate with a task labeled "[Sub-process: name]" with a process doc link in a comment. |
| Embedded Sub-Process (expanded) | **Not Supported** | Not in v1 scope. |
| Call Activity | **Not Supported** | Not in v1 scope. |
| Event Sub-Process | **Not Supported** | Not in v1 scope. |
| Transaction Sub-Process | **Not Supported** | Not in v1 scope. |
| Ad-hoc Sub-Process | **Not Supported** | Not in Descriptive Conformance scope. |
| Multi-Instance Activity | **Not Supported** | Not in v1 scope. Note in label if needed: `task:user "Review Documents (each)"`. |

---

## Gateways

| BPMN 2.0.2 Element | bpmn-beta Support | Notes |
|---|---|---|
| Exclusive (Data-Based) Gateway | **Full** | `xor id "label"` — diamond with X marker. All outgoing flows require condition labels. |
| Parallel Gateway | **Full** | `and id "label"` — diamond with + marker. Split must have matching join unless paths end separately. |
| Inclusive Gateway | **Full** | `or id "label"` — diamond with circle marker. |
| Event-Based Gateway | **Not Supported** | Not in v1 scope. Approximate with XOR + intermediate events (or task:receive). |
| Complex Gateway | **Not Supported** | Not in Descriptive Conformance scope. |

---

## Connecting Objects

| BPMN 2.0.2 Element | bpmn-beta Support | Notes |
|---|---|---|
| Sequence Flow | **Full** | `-->` operator. Plain or with condition label. |
| Conditional Sequence Flow | **Full** | `-->: "condition"` — label after colon on same line. |
| Default Sequence Flow | **Full** | `==>` operator — slash marker at source in BPMN notation. |
| Message Flow | **Experimental** | `~~>` operator — must be at top level outside pool blocks. Rendering is approximate. |
| Association | **Not Supported** | `---` is planned but not yet parsed in v0.1. |
| Data Association | **Not Supported** | Data objects not in v1 scope. |
| Compensation Association | **Not Supported** | Compensation not in v1 scope. |

---

## Swimlanes

| BPMN 2.0.2 Element | bpmn-beta Support | Notes |
|---|---|---|
| Pool | **Experimental** | `pool id "label" { ... }` — renders with layout limitations. Cross-lane flow routing is approximate. |
| Lane | **Experimental** | `lane id "label" { ... }` inside a pool block. Nested lanes have unreliable rendering. |
| Participant (Black-Box Pool) | **Not Supported** | No keyword for participant-only pool in v1. |

---

## Artifacts

| BPMN 2.0.2 Element | bpmn-beta Support | Notes |
|---|---|---|
| Text Annotation | **Not Supported** | Requires association (`---`) which is planned but not yet parsed. |
| Group | **Not Supported** | Not in v1 scope. |
| Data Object | **Not Supported** | Not in v1 scope. |
| Data Store | **Not Supported** | Not in v1 scope. |

---

## Summary Counts

| Support Status | Count | Elements |
|---|---|---|
| **Full** | 13 | None Start/End, 6 task types, XOR/AND/OR gateways, Sequence flow, Conditional flow, Default flow |
| **Experimental** | 5 | event:message, event:timer, event:error, Pool, Lane (+ Message flow `~~>`) |
| **Not Supported** | ~35 | All remaining BPMN 2.0.2 Descriptive elements |

---

## Competitive Position

bpmn-beta targets a specific market lane: **BPMN descriptive diagrams for Markdown-first, Git-native, AI-assisted documentation workflows.** It does not compete head-on with full BPM suites.

| Tool | Relevant Strength | Weakness Relative to bpmn-beta |
|---|---|---|
| Mermaid flowchart | Already available, simple, widely adopted | Not semantically BPMN — no events/gateways/message-flow distinction |
| PlantUML | Mature text diagrams, broad diagram support | Not Mermaid-native; does not fill Mermaid's ecosystem gap |
| bpmn.io / bpmn-js | Strong BPMN ecosystem, full modeler | XML/modeler-centric, heavier runtime, not Markdown-first |
| Camunda Modeler | Professional BPMN tooling | Enterprise/modeler oriented, not developer-doc native |
| Visio | Familiar enterprise diagramming | Binary/visual workflow, weak Git-native story |
| Signavio | Enterprise process platform | Heavyweight, commercial, not developer-doc native |
| Mermaid Chart | Strong Mermaid ecosystem integration | BPMN still absent — this is the opportunity gap bpmn-beta fills |

### Differentiating thesis (for agent use)

When explaining the value of bpmn-beta, use this framing:

> bpmn-beta gives the Mermaid ecosystem a standards-aware process diagramming path without forcing users into BPMN XML or semantic-free flowcharts. It targets documentation-grade BPMN — the notation that 80%+ of real-world process diagrams actually need — in a form that is readable, version-controllable, and generatable by LLMs.

Do **not** claim:
- "Better BPMN than Camunda" — it is not
- "Better diagrams than Mermaid" — it is complementary
- "Full BPMN 2.0 conformance" — it targets the Descriptive Conformance sub-class only
