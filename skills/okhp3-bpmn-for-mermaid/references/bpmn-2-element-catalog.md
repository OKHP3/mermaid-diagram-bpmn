# BPMN 2.0.2 Element Catalog — Descriptive Conformance Subset

> **Standard:** OMG BPMN 2.0.2 — ISO/IEC 19510:2013  
> **Conformance class:** Descriptive Conformance Sub-Class (Section 2.1)  
> **Scope:** This catalog covers only the Descriptive subset. Analytic and Common Executable elements are excluded.

---

## Flow Objects

Flow objects are the primary elements that define process structure.

### Events

Events represent something that happens. They affect the flow of the process.

#### Start Events

| Canonical Name | Category | Required Attributes | Allowed Incoming | Allowed Outgoing | Shape | Description |
|---|---|---|---|---|---|---|
| **None Start Event** | Catching | name (optional) | None | 1+ sequence flows | Thin circle | Initiates the process with no specified trigger |
| **Message Start Event** | Catching | name, messageRef | None | 1+ sequence flows | Thin circle + envelope | Initiated when a specific message is received |
| **Timer Start Event** | Catching | name, timerDefinition | None | 1+ sequence flows | Thin circle + clock | Initiated at a specified time or interval |
| **Signal Start Event** | Catching | name, signalRef | None | 1+ sequence flows | Thin circle + triangle | Initiated by a broadcast signal |
| **Conditional Start Event** | Catching | name, condition | None | 1+ sequence flows | Thin circle + lines | Initiated when a condition becomes true |

*bpmn-beta implements: None Start Event (`start`) only.*

#### End Events

| Canonical Name | Category | Required Attributes | Allowed Incoming | Allowed Outgoing | Shape | Description |
|---|---|---|---|---|---|---|
| **None End Event** | Throwing | name (optional) | 1+ sequence flows | None | Thick circle | Terminates a process path with no result |
| **Message End Event** | Throwing | name, messageRef | 1+ sequence flows | None | Thick circle + envelope | Sends a message when the path completes |
| **Error End Event** | Throwing | name, errorRef | 1+ sequence flows | None | Thick circle + lightning | Throws an error when the path reaches this event |
| **Terminate End Event** | Throwing | name (optional) | 1+ sequence flows | None | Thick circle + filled inner | Terminates all process paths immediately |
| **Escalation End Event** | Throwing | name, escalationRef | 1+ sequence flows | None | Thick circle + upward arrow | Escalates to a parent process |
| **Signal End Event** | Throwing | name, signalRef | 1+ sequence flows | None | Thick circle + triangle | Broadcasts a signal when the path completes |

*bpmn-beta implements: None End Event (`end`) only. Error End Event is experimental via `event:error`.*

#### Intermediate Events

| Canonical Name | Category | Trigger | Shape | Description |
|---|---|---|---|---|
| **None Intermediate Throw Event** | Throwing | None | Double circle | Marks a point in the process |
| **Message Intermediate Catch Event** | Catching | Message received | Double circle + envelope | Pauses until a message is received |
| **Message Intermediate Throw Event** | Throwing | Message sent | Double circle + filled envelope | Sends a message and continues |
| **Timer Intermediate Catch Event** | Catching | Time or interval | Double circle + clock | Pauses for a specified time |
| **Signal Intermediate Catch Event** | Catching | Signal received | Double circle + triangle | Pauses until a signal is broadcast |
| **Signal Intermediate Throw Event** | Throwing | Signal sent | Double circle + filled triangle | Broadcasts a signal and continues |
| **Escalation Intermediate Throw Event** | Throwing | Escalation | Double circle + upward arrow | Escalates without ending the flow |
| **Compensation Intermediate Throw Event** | Throwing | Compensation | Double circle + backward arrows | Triggers compensation activities |
| **Conditional Intermediate Catch Event** | Catching | Condition | Double circle + lines | Pauses until a condition is true |
| **Link Intermediate Event** | Catch/Throw | Link | Double circle + arrow | Connects flow across diagram sections |

*bpmn-beta experimental: Message Intermediate Catch (`event:message`), Timer Intermediate Catch (`event:timer`).*

---

### Activities

Activities represent work performed within the process.

#### Tasks

| Canonical Name | Marker | Attributes | Incoming | Outgoing | Description |
|---|---|---|---|---|---|
| **Abstract Task** | None | name | 1+ sequence flows | 1+ sequence flows | Work of unspecified type |
| **User Task** | Person icon | name, potentialOwner | 1+ sequence flows | 1+ sequence flows | Work performed by a human using a software interface |
| **Service Task** | Gear icon | name, operationRef | 1+ sequence flows | 1+ sequence flows | Work performed automatically by a web service or system |
| **Script Task** | Scroll icon | name, scriptLanguage, script | 1+ sequence flows | 1+ sequence flows | Work performed by executing a script |
| **Receive Task** | Envelope icon | name, messageRef | 1+ sequence flows | 1+ sequence flows | Waits for a message to arrive |
| **Send Task** | Filled envelope | name, messageRef | 1+ sequence flows | 1+ sequence flows | Sends a message and continues |
| **Manual Task** | Hand icon | name | 1+ sequence flows | 1+ sequence flows | Work performed without software assistance |
| **Business Rule Task** | Table icon | name, calledDecision | 1+ sequence flows | 1+ sequence flows | Evaluates a business rule |

*bpmn-beta implements: Abstract, User, Service, Script, Receive, Send tasks.*  
*bpmn-beta does not implement: Manual Task, Business Rule Task.*

#### Sub-Processes and Call Activities

| Canonical Name | Description | bpmn-beta |
|---|---|---|
| **Sub-Process (Embedded)** | Collapsed or expanded child process inside the parent | Not implemented |
| **Call Activity** | Calls a separately defined process or global task | Not implemented |
| **Event Sub-Process** | Sub-process triggered by a start event, not sequence flow | Not implemented |
| **Transaction Sub-Process** | Sub-process with transaction semantics and compensation | Not implemented |

---

### Gateways

Gateways control how sequence flows converge and diverge.

| Canonical Name | Marker | Split Routing | Join Routing | Description |
|---|---|---|---|---|
| **Exclusive (Data-Based) Gateway** | X | Exactly one outgoing path | First arriving token continues | Routes based on data conditions; XOR logic |
| **Inclusive Gateway** | Circle | One or more paths | All started paths must complete | Routes to one or more paths based on conditions |
| **Parallel Gateway** | + | All outgoing paths simultaneously | Waits for all incoming tokens | Synchronizes parallel paths; AND logic |
| **Event-Based Gateway** | Hexagon + event | First event that occurs | N/A | Routes based on which event occurs first |
| **Complex Gateway** | Asterisk | Custom | Custom | Complex activation conditions defined by expressions |

*bpmn-beta implements: Exclusive (`xor`), Inclusive (`or`), Parallel (`and`).*  
*bpmn-beta does not implement: Event-Based Gateway, Complex Gateway.*

---

## Connecting Objects

### Sequence Flow

| Attribute | Description |
|---|---|
| Name (label) | Optional condition expression; required on XOR outgoing flows |
| Source | Any flow object except End Events |
| Target | Any flow object except Start Events |
| conditionExpression | Boolean condition (for conditional flows from gateways) |
| isDefault | Marks as the default flow from an XOR or Inclusive gateway |

bpmn-beta operators:
- `-->` — standard or conditional sequence flow
- `-->:` — conditional sequence flow with label
- `==>` — default sequence flow

### Message Flow

| Attribute | Description |
|---|---|
| Name (label) | Optional message name |
| Source | Element in one pool |
| Target | Element in a different pool |

bpmn-beta operator: `~~>` (top-level only)

### Association

| Attribute | Description |
|---|---|
| Direction | None, one, or both |
| Source | Any element |
| Target | Text annotation or artifact |

bpmn-beta: Planned (`---`); not implemented in v0.1.

---

## Swimlanes

### Pool

Represents a participant in a collaboration. May contain lanes.

| Attribute | Description |
|---|---|
| Name | Participant name or role |
| processRef | Reference to process definition |
| isExecutable | Whether the process is executable |

bpmn-beta: `pool id "Label" { ... }` — experimental rendering.

### Lane

Subdivides a pool. Represents a role or department.

| Attribute | Description |
|---|---|
| Name | Role, department, or system name |
| flowNodeRef | Elements assigned to this lane |

bpmn-beta: `lane id "Label" { ... }` — experimental rendering.

---

## Artifacts

### Text Annotation

Free text note associated with an element via an association.

bpmn-beta: Not implemented (association `---` is planned).

### Group

Rounded dashed rectangle grouping elements for documentation.

bpmn-beta: Not implemented.

### Data Object

Represents data input or output for an activity.

bpmn-beta: Not implemented (out of v1 scope).

### Data Store

Repository accessible from multiple points in the process.

bpmn-beta: Not implemented (out of v1 scope).
