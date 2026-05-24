# BPMN 2.0 ↔ bpmn-beta Element Map

> **Standard:** OMG BPMN 2.0.2 — ISO/IEC 19510:2013  
> **Conformance class:** Descriptive Conformance Sub-Class (Section 2.1 of the spec)  
> **Direction:** Both ways — use this table to translate from BPMN 2.0 concepts to bpmn-beta keywords and vice versa.

---

## Events

### In-Scope Events

| BPMN 2.0.2 Element | BPMN Symbol | bpmn-beta Keyword | Shape in SVG | v0.1 Status |
|---|---|---|---|---|
| None Start Event | Thin circle | `start` | Circle, thin stroke | Implemented |
| None End Event | Thick circle | `end` | Circle, thick stroke | Implemented |

### Specified but Not Yet Parsed

| BPMN 2.0.2 Element | BPMN Symbol | Planned bpmn-beta Keyword | Closest v0.1 Approximation |
|---|---|---|---|
| Message Intermediate Catch Event | Circle + envelope | `event:message` | `task:receive` with a label noting it is a wait state |
| Timer Intermediate Catch Event | Circle + clock | `event:timer` | `task:service` with a label like "Wait: 2-hour SLA" |
| Error End Event | Thick circle + lightning bolt | `event:error` | `end` with a label noting the error condition |
| Message Start Event | Thin circle + envelope | — | `start` with descriptive label |
| Terminate End Event | Thick circle + filled inner circle | — | `end` with descriptive label |
| Signal Intermediate Event | Circle + triangle | — | Not representable in v0.1 |

### Out-of-Scope Events

| BPMN 2.0.2 Element | Why Out of Scope |
|---|---|
| Conditional Start/Intermediate | Execution semantics; not in Descriptive conformance |
| Escalation Events | Outside v0.1 scope |
| Compensation Events | Requires compensation task markers; outside v0.1 scope |
| Cancel Events | Transaction-related; outside v0.1 scope |
| Link Events | Cross-diagram linkage; outside v0.1 scope |
| Multiple Events | Outside v0.1 scope |

---

## Tasks

### In-Scope Tasks

| BPMN 2.0.2 Element | BPMN Marker | bpmn-beta Keyword | Marker in SVG | v0.1 Status |
|---|---|---|---|---|
| Abstract Task | None | `task` | None | Implemented |
| User Task | Person icon | `task:user` | Person icon (top-left) | Implemented |
| Service Task | Gear icon | `task:service` | Gear icon (top-left) | Implemented |
| Script Task | Scroll/script icon | `task:script` | Scroll icon (top-left) | Implemented |
| Receive Task | Envelope (unfilled) | `task:receive` | Envelope icon (top-left) | Implemented |
| Send Task | Envelope (filled) | `task:send` | Filled envelope (top-left) | Implemented |

### Out-of-Scope Tasks

| BPMN 2.0.2 Element | Why Out of Scope |
|---|---|
| Manual Task | Out of Descriptive subset for v0.1 |
| Business Rule Task | Out of Descriptive subset for v0.1 |
| Call Activity | Requires subprocess reference; out of v0.1 scope |

### Subprocesses and Call Activities

Not representable in v0.1. Approximate with a collapsed task labeled "[Subprocess: name]" and a process-document link in a comment.

---

## Gateways

### In-Scope Gateways

| BPMN 2.0.2 Element | BPMN Marker | bpmn-beta Keyword | Routing | v0.1 Status |
|---|---|---|---|---|
| Exclusive (Data-Based) Gateway | X | `xor` | Exactly one path | Implemented |
| Parallel Gateway | + | `and` | All paths simultaneously | Implemented |
| Inclusive Gateway | Circle | `or` | One or more paths | Implemented |

### Out-of-Scope Gateways

| BPMN 2.0.2 Element | Why Out of Scope |
|---|---|
| Event-Based Gateway | Requires event trigger semantics |
| Complex Gateway | Requires custom routing expressions |
| Exclusive Event-Based Gateway | Combines event-based and exclusive routing |

---

## Flows

### In-Scope Flows

| BPMN 2.0.2 Element | BPMN Line Style | bpmn-beta Operator | Notes |
|---|---|---|---|
| Sequence Flow | Solid arrow | `-->` | Standard connection between elements in same pool |
| Conditional Sequence Flow | Solid arrow + condition | `-->` + `:` + label | Condition appears as edge label |
| Default Sequence Flow | Solid arrow + slash | `==>` | Slash at source; no label |
| Message Flow | Dashed open arrow | `~~>` | Cross-pool only; top-level declaration only |

### Out-of-Scope Flows

| BPMN 2.0.2 Element | Why Out of Scope |
|---|---|
| Association | Planned (`---`) but not yet parsed in v0.1 |
| Data Association | Requires data objects; out of v0.1 scope |
| Compensation Association | Out of v0.1 scope |

---

## Structural Elements

### In-Scope Structural

| BPMN 2.0.2 Element | bpmn-beta Keyword | v0.1 Status |
|---|---|---|
| Pool | `pool` | Experimental — renders with limitations |
| Lane | `lane` | Experimental — renders with limitations |

### Out-of-Scope Structural

| BPMN 2.0.2 Element | Why Out of Scope |
|---|---|
| Participant (Black-Box Pool) | No explicit keyword in v0.1 |
| Data Object | Out of v0.1 scope |
| Data Store | Out of v0.1 scope |
| Group | Out of v0.1 scope |
| Text Annotation | Planned (`---`); not yet parsed |

---

## Reverse Map: bpmn-beta → BPMN 2.0.2

| bpmn-beta Keyword | BPMN 2.0.2 Element |
|---|---|
| `start` | None Start Event |
| `end` | None End Event |
| `task` | Abstract Task |
| `task:user` | User Task |
| `task:service` | Service Task |
| `task:script` | Script Task |
| `task:receive` | Receive Task |
| `task:send` | Send Task |
| `xor` | Exclusive (Data-Based) Gateway |
| `and` | Parallel Gateway |
| `or` | Inclusive Gateway |
| `-->` | Sequence Flow |
| `-->` + label | Conditional Sequence Flow |
| `==>` | Default Sequence Flow |
| `~~>` | Message Flow |
| `pool` | Pool |
| `lane` | Lane |
