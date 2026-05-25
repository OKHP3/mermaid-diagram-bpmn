---
name: bpmn-for-mermaid
description: Generate, validate, or explain business process diagrams using the bpmn-beta Mermaid diagram type. Use this skill when the user describes a business process and wants a diagram; when they ask for a BPMN diagram; when they want to convert a flowchart or process description to BPMN notation; when they ask for bpmn-beta syntax, DSL, or Mermaid BPMN; when they want to validate existing bpmn-beta code; or when they want to understand BPMN elements like tasks, gateways, events, pools, or lanes in Mermaid format. Also use when the user references the OverKill Hill P³ BPMN DSL.
license: LICENSE
metadata:
  version: 0.1.0
  author: OverKill Hill P³
  tags: bpmn, mermaid, bpmn-beta, business-process, process-modeling, dsl, workflow, lanes, pools, gateways
  produces: "bpmn-beta.mmd"
---

## Overview

This skill generates and validates `bpmn-beta` Mermaid diagrams — the OverKill Hill P³ BPMN-native diagram type for Mermaid. The DSL maps BPMN 2.0 Descriptive Conformance subset elements to a clean, text-first syntax that is readable by process analysts and generatable by LLMs without syntax repair.

The output is valid, copy-paste-ready bpmn-beta syntax inside a Mermaid code fence — not a description, not a flowchart approximation, not XML.

---

## DSL Reference

### Diagram Declaration

Every bpmn-beta diagram starts with:

```
bpmn-beta
```

Optional metadata on the following lines (before any pool or top-level elements):

```
accTitle: [Diagram title — used by screen readers and export tools]
accDescr: [Longer description — optional]
```

### Event Keywords

| Keyword | BPMN Element | Shape | Status |
|---|---|---|---|
| `start` | Start event (none) | Thin circle | Implemented |
| `end` | End event (none) | Thick circle | Implemented |

> **Note:** Intermediate event subtypes (`event:message`, `event:timer`, `event:error`) are specified in the DSL but not yet parsed in v0.1. Do not generate them — use a task or gateway to approximate until the parser supports them. See `references/known-limitations.md`.

Syntax:

```
start [id] "[label]"
end   [id] "[label]"
```

### Task Keywords

| Keyword | BPMN Element | Marker | Status |
|---|---|---|---|
| `task` | Abstract task | Rounded rectangle | Implemented |
| `task:user` | User task | Person icon | Implemented |
| `task:service` | Service task | Gear icon | Implemented |
| `task:script` | Script task | Scroll icon | Implemented |
| `task:receive` | Receive task | Envelope icon | Implemented |
| `task:send` | Send task | Filled envelope icon | Implemented |

Syntax:

```
task         [id] "[label]"
task:user    [id] "[label]"
task:service [id] "[label]"
task:script  [id] "[label]"
task:receive [id] "[label]"
task:send    [id] "[label]"
```

### Gateway Keywords

| Keyword | BPMN Element | Shape | Routing |
|---|---|---|---|
| `xor` | Exclusive gateway | Diamond + X | One path only |
| `and` | Parallel gateway | Diamond + + | All paths simultaneously |
| `or` | Inclusive gateway | Diamond + O | One or more paths |

Syntax:

```
xor [id] "[label]"
and [id] "[label]"
or  [id] "[label]"
```

### Sequence Flow

All sequence flows use `-->`. Edge labels go after a colon on the same line:

```
[source-id] --> [target-id]
[source-id] --> [target-id]: "[condition label]"
```

Default flows use `==>` (slash marker at source, no label):

```
[source-id] ==> [target-id]
```

Labels on gateway outgoing flows are the condition that selects that path.

### Pool and Lane Structure

Pools contain lanes. Lanes contain elements and flows. The pool keyword wraps everything.

```
pool [pool-id] "[Pool Label]" {

  lane [lane-id] "[Lane Label]" {
    [elements declared here]
  }

  lane [lane-id-2] "[Lane Label 2]" {
    [elements declared here]
  }

  [flows declared here — both within and crossing lanes]
}
```

Flow declarations inside the pool block but outside any lane block are legal. This is the preferred location for cross-lane flows since they are not owned by a single lane.

### Message Flow (Between Pools)

For diagrams with multiple pools:

```
pool [pool-a] "[Pool A]" { ... }
pool [pool-b] "[Pool B]" { ... }

[source-id] ~~> [target-id]
```

Message flows (`~~>`) **must** be declared at the top level, outside any pool or lane block. Declaring them inside a block is a parse error.

---

## Generation Workflow

Execute in order. Do not skip steps.

### Step 1 — Extract Process Information

From the user's input (natural language description, existing flowchart, table, bullet list, or prose):

- Identify the actors or systems involved (these become lanes or pools)
- Identify the trigger (start event — what initiates the process)
- Identify the end state(s) (end events — what conditions terminate the process)
- List all work steps (tasks — what each actor does)
- Identify all decision points (gateways — where the path branches)
- Identify all decision outcomes (gateway outgoing flows and their conditions)
- Identify any automated or system steps (service tasks)
- Identify any human approval or review steps (user tasks)
- Identify message exchanges between separate organizational units (message flows)

If any of these are ambiguous, state your assumptions explicitly before producing the diagram — do not ask clarifying questions that would stall output. Make a reasonable interpretation and label it.

### Step 2 — Determine Structural Model

Decide:

- **Single pool, multiple lanes:** One organization, multiple roles or departments. Use when all actors are inside one company or system boundary.
- **Multiple pools:** Two or more organizations. Use when message flows cross organizational boundaries (customer to vendor, company to partner, system to external service).
- **No pool/lane wrapper:** Use only for simple linear processes with one actor or when the user explicitly wants a flat model.

For business process documentation in professional contexts, default to single pool with multiple lanes unless the process is explicitly cross-organizational.

### Step 3 — Assign IDs

Assign short, lowercase IDs to all elements before writing the DSL. Convention:

- Start events: `s1`, `s2`
- End events: `e1`, `e2`
- Tasks: `t1`, `t2`, `t3` (or semantic IDs like `review`, `approve`)
- Gateways: `g1`, `g2` (or semantic IDs like `approved`, `threshold`)
- Pools: `p1`, `p2` (or semantic IDs like `buyer`, `supplier`)
- Lanes: `l1`, `l2` (or semantic IDs like `hr`, `manager`, `it`)

IDs must be unique within the diagram. Valid characters: `[A-Za-z][A-Za-z0-9_]*`. Do not use hyphens in IDs. Keep them short — they appear in flow declarations repeatedly.

Reserved words that must not be used as IDs: `pool`, `lane`, `start`, `end`, `task`, `xor`, `and`, `or`, `message`.

### Step 4 — Write the DSL

Apply all rules from the DSL Reference section above. Additional constraints:

- Every diagram must have at least one `start` event and at least one `end` event.
- Every `xor` gateway must have at least two outgoing flows, each with a condition label.
- Every `and` gateway (split) must have a corresponding `and` gateway (join) that re-merges the parallel paths, unless the parallel paths terminate in separate end events.
- No orphan elements — every element must appear in at least one flow declaration.
- No circular flows in the first pass. If the process has loops (retry, rework, repeat), model them with a second gateway that branches back to the rework start point.
- Declare all flows at the pool level (outside individual lane blocks) for cross-lane flows. Only declare flows inside a lane block if both source and target are definitively within that lane.

### Step 5 — Self-Validate

Before outputting, check:

- [ ] `bpmn-beta` on line 1
- [ ] All IDs referenced in flows are declared as elements
- [ ] All `xor` gateways have at least two outgoing labeled flows
- [ ] No element is an island (appears in no flow)
- [ ] Pool and lane brackets are properly nested and closed
- [ ] All string labels are in double quotes
- [ ] No reserved keywords used as IDs (`pool`, `lane`, `start`, `end`, `task`, `xor`, `and`, `or`)
- [ ] No hyphens in IDs
- [ ] Message flows (`~~>`) are at top level, not inside a pool or lane block
- [ ] No `event:message`, `event:timer`, or `event:error` keywords (not yet parsed in v0.1)

If any check fails, correct before outputting.

### Step 6 — Output

Produce the complete bpmn-beta diagram inside a fenced code block:

````
```mermaid
bpmn-beta
accTitle: [descriptive title]

pool [id] "[label]" {

  lane [id] "[label]" {
    [elements]
  }

  [cross-lane flows]
}
```
````

Follow the code block immediately with a compact element inventory:

**Elements:** [n] tasks, [n] events, [n] gateways, [n] lanes, [n] pools  
**Flows:** [n] sequence flows[, n message flows if applicable]

---

## Validation Workflow

When the user provides existing bpmn-beta code for validation:

1. Check every element declaration for correct keyword spelling
2. Check every flow for existence of both source and target IDs
3. Check gateway cardinality (xor: ≥2 outgoing; and: matching split/join unless deliberate)
4. Check bracket nesting (pool > lane, all closed)
5. Check that all labels are double-quoted
6. Check that no message flows appear inside pool or lane blocks
7. Report issues as a numbered list: `[Line N] [Issue description] — [Correction]`
8. Produce a corrected version if issues were found

---

## Explanation Workflow

When the user asks what a bpmn-beta element does, how to use a specific construct, or how the DSL maps to BPMN 2.0:

1. State the element name and its BPMN 2.0 equivalent
2. Show the syntax in a code block
3. Give a one-sentence usage rule
4. Show a minimal working example (3–5 elements, 2–3 flows) in a fenced code block

Do not reproduce the full DSL reference in an explanation response. Answer the specific question.

---

## Scope Boundaries

Always be honest about these constraints:

**In scope (v0.1):**
- BPMN 2.0 Descriptive Conformance subset: start/end events, user/service/script/receive/send tasks, XOR/AND/OR gateways, sequence flows (plain and conditional), default flows, pools, lanes
- Message flows between pools (`~~>`)

**Specified but not yet parsed — do not generate:**
- Intermediate event subtypes: `event:message`, `event:timer`, `event:error`
- Associations (`---`)

**Not in scope (do not generate):**
- Boundary events on tasks
- Transaction subprocesses
- Compensation events
- Data objects and data stores
- Choreography diagrams
- Conversation diagrams
- BPMN XML import or export
- Process engine semantics (bpmn-beta is descriptive, not executable)

If the user requests an out-of-scope element, state clearly that it is outside the current DSL scope and offer the closest available approximation with a note explaining the difference.

---

## Mermaid Theme Integration

bpmn-beta diagrams honor Mermaid themeVariables. If the user also has a theme palette (from the `mermaid-theme` skill or otherwise), prepend the `%%{init}%%` block before the `bpmn-beta` keyword:

````
```mermaid
%%{init: { 'theme': 'base', 'themeVariables': { ... } }}%%
bpmn-beta
accTitle: [title]
...
```
````

If no theme is specified, output the diagram without any init block. Do not default to a specific palette.

---

## Output Rules

- Always produce the complete, syntactically valid bpmn-beta diagram — never a partial sketch.
- Never produce bpmn-beta syntax from memory of BPMN XML or other tools. Use only the keywords and patterns defined in this skill.
- If you are uncertain about a process step's correct classification (task type or gateway type), use `task` or `xor` as the conservative default and note your assumption.
- Do not produce flowchart syntax as a substitute for bpmn-beta. They are different diagram types with different semantics.
- The output is the product. Keep explanation text minimal unless the user asks for explanation.

---

## Further Reference

Load on demand when more detail is needed:

- `references/dsl-spec.md` — formal BNF grammar and complete keyword table
- `references/bpmn-element-map.md` — two-way BPMN 2.0 ↔ bpmn-beta element mapping
- `references/known-limitations.md` — parser gaps, experimental features, honest scope
- `assets/element-vocabulary.json` — machine-readable element definitions
- `assets/validation-rules.json` — validation rules as structured data
- `examples/purchase-order.md` — annotated PO approval example
- `examples/incident-response.md` — IT incident handling with parallel gateway
- `examples/employee-onboarding.md` — HR process with three lanes
