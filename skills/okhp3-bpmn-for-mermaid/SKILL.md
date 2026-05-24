---
name: okhp3-bpmn-for-mermaid
description: Generate, validate, normalize, and explain Mermaid-native bpmn-beta diagrams for BPMN-style process modeling. Use this skill when the user wants to convert process notes into a diagram; when they ask for BPMN, a process flow, a swimlane diagram, a workflow diagram, or bpmn-beta syntax; when they want to validate or repair existing bpmn-beta code; when they mention pools, lanes, gateways, tasks, events, or BPMN 2.0; when they want a Mermaid-native process model they can commit to a repo; when they ask about bpmn-beta keywords, DSL rules, or process modeling in Mermaid.
license: MIT
metadata:
  version: 0.1.0
  author: OverKill Hill P³
  homepage: https://okhp3.github.io/mermaid-diagram-bpmn/playground
  repository: https://github.com/OKHP3/mermaid-diagram-bpmn
  category: process-diagramming
  tags: bpmn, mermaid, bpmn-beta, business-process, process-modeling, dsl, workflow, lanes, pools, gateways, okhp3
  triggers:
    - create a BPMN diagram
    - draw a business process
    - convert process to mermaid
    - bpmn-beta
    - model this workflow
    - swimlane diagram
    - process flow with gateways
    - BPMN 2.0
    - validate BPMN
    - pools and lanes
    - process modeling
    - mermaid native BPMN
---

## Purpose

This skill generates and validates `bpmn-beta` Mermaid diagrams — the OverKill Hill P³ BPMN-native diagram type for Mermaid. It maps BPMN 2.0 Descriptive Conformance subset elements to a clean, text-first syntax that process analysts can read and LLMs can produce without syntax repair loops.

The output is valid, copy-paste-ready bpmn-beta syntax in a Mermaid code fence — not a flowchart approximation, not BPMN XML, not a description.

## Dual Compliance Requirement

Every output must satisfy two standards simultaneously:

**BPMN 2.0.2 Descriptive Conformance subset** — structural rules, element types, flow routing rules, pool/lane containment rules.

**Mermaid 11.15 bpmn-beta syntax** — keyword vocabulary, ID rules, label quoting, nesting syntax, flow operators.

When these standards conflict, flag the conflict explicitly and explain the limitation. Never silently violate either standard.

---

## When to use this skill

Use when the user asks for BPMN, process flows, bpmn-beta, swimlane diagrams, or process-to-diagram conversion.

## When NOT to use this skill

- Do not claim full BPMN 2.0 execution conformance or XML compatibility.
- Do not use for non-BPMN Mermaid diagrams. Use `okhp3-mermaid-theme-builder` for theming.
- Do not generate BPMN elements that are outside the Descriptive Conformance subset v1 scope.

---

## DSL Reference

### Diagram declaration

Every bpmn-beta diagram begins with:

```
bpmn-beta
```

This must be the first line, or the second line if a `%%{init}%%` theme block is present.

Optional accessibility metadata immediately after the declaration:

```
accTitle: [Diagram title — used by screen readers and Mermaid Chart export tools]
accDescr: [Extended description — optional]
```

### Event keywords

| Keyword | BPMN 2.0.2 Element | Shape | Usage |
|---|---|---|---|
| `start` | Start event (none trigger) | Thin circle | One per primary process path |
| `end` | End event (none) | Thick circle | One or more terminations |
| `event:message` | Message intermediate event | Circle + envelope | Message received or sent *(experimental — see known-limitations)* |
| `event:timer` | Timer intermediate event | Circle + clock | Time-triggered step *(experimental)* |
| `event:error` | Error end event | Thick circle + lightning bolt | Error termination path *(experimental)* |

Syntax:

```
start         [id]  "[Label]"
end           [id]  "[Label]"
event:message [id]  "[Label]"
event:timer   [id]  "[Label]"
event:error   [id]  "[Label]"
```

> **Note:** `event:message`, `event:timer`, and `event:error` are specified in the DSL but not yet parsed by the v0.1 prototype renderer. Use them when targeting the DSL spec; substitute `task:receive`, `task:service "[time]"`, or `end "[Error: reason]"` when targeting the current playground renderer.

### Task keywords

| Keyword | BPMN 2.0.2 Element | BPMN Marker | Usage |
|---|---|---|---|
| `task` | Abstract task | Rounded rectangle (no marker) | Generic work step, type unspecified |
| `task:user` | User task | Person icon | Human-performed work |
| `task:service` | Service task | Gear icon | Automated or system-executed step |
| `task:script` | Script task | Scroll icon | Script execution step |
| `task:receive` | Receive task | Envelope icon | Waiting for a message |
| `task:send` | Send task | Filled envelope | Sending a message |

Syntax:

```
task         [id]  "[Label]"
task:user    [id]  "[Label]"
task:service [id]  "[Label]"
task:script  [id]  "[Label]"
task:receive [id]  "[Label]"
task:send    [id]  "[Label]"
```

### Gateway keywords

| Keyword | BPMN 2.0.2 Element | Shape | Routing logic |
|---|---|---|---|
| `xor` | Exclusive gateway (XOR) | Diamond + X | Exactly one outgoing path activates |
| `and` | Parallel gateway | Diamond + + | All outgoing paths activate simultaneously |
| `or` | Inclusive gateway | Diamond + O | One or more outgoing paths activate |

Syntax:

```
xor [id] "[Label]"
and [id] "[Label]"
or  [id] "[Label]"
```

### Sequence flow

All sequence flows use `-->`. Conditional labels follow a colon:

```
[source-id] --> [target-id]
[source-id] --> [target-id]: "[Condition label]"
```

Gateway outgoing flows must have condition labels unless routing is unconditional (join flows do not need labels).

Default flows (from XOR gateways) may use `==>`:

```
[gateway-id] ==> [default-target-id]
```

### Pool and lane structure

```
pool [pool-id] "[Pool Label]" {

  lane [lane-id] "[Lane Label]" {
    [elements declared here]
  }

  lane [lane-id-2] "[Lane Label 2]" {
    [elements declared here]
  }

  [cross-lane flows declared here — preferred location for inter-lane flows]
}
```

Elements must be declared inside a lane block if the diagram uses lanes. Cross-lane flows should be declared in the pool block body (outside any lane block).

### Message flow (between pools)

```
pool [pool-a] "[Pool A Label]" { ... }
pool [pool-b] "[Pool B Label]" { ... }

[source-id] ~~> [target-id]
```

Message flows (`~~>`) must be declared at the top level, outside any pool or lane block. Placing them inside a block is a parse error.

---

## Generation Workflow

Execute in order. Do not skip steps.

### Step 1 — Extract process information

From the user's input (natural language, existing flowchart, table, prose, bullet list):

- **Actors/participants** → these become lanes (single org) or pools (multiple orgs)
- **Process trigger** → start event (what initiates the process)
- **End states** → end events (success path, error path, rejection path — each gets an end event)
- **Work steps** → tasks (classify: user task for human, service task for automated, script task for scripted, abstract task when unspecified)
- **Decision points** → gateways (classify: XOR for exclusive choice, AND for parallel, OR for inclusive)
- **Decision outcomes** → gateway outgoing flows with condition labels
- **Inter-organizational messages** → message flows between pools

If ambiguous, state your assumption explicitly before producing the diagram. Do not stall with clarifying questions — interpret and label.

### Step 2 — Choose structural model

**Single pool, multiple lanes:** All actors are inside one organizational boundary. One company, multiple departments or roles. Default for most business process documentation.

**Multiple pools with message flows:** Two or more organizations with interactions across boundaries. Use when the process crosses an organizational or system ownership boundary.

**Flat (no pool/lane):** Simple linear processes with one actor, or when the user explicitly requests a flat model.

### Step 3 — Assign IDs

Assign short, consistent IDs before writing the DSL:

- Start events: `s1`, `s2`
- End events: `e1`, `e2`
- Tasks: `t1`, `t2` (or semantic: `review`, `approve`)
- Gateways: `g1`, `g2` (or semantic: `approved`, `threshold`)
- Intermediate events: `ev1`, `ev2`
- Pools: `p1` (or semantic: `buyer`, `vendor`)
- Lanes: `l1` (or semantic: `hr`, `manager`, `it`)

IDs must be unique within the diagram. Valid characters: letters, digits, underscores — no spaces, no hyphens. Do not use reserved keywords as IDs: `pool`, `lane`, `start`, `end`, `task`, `xor`, `and`, `or`, `event`.

### Step 4 — Write the DSL

Apply all DSL Reference rules above plus:

**Structural constraints (BPMN 2.0.2 — always enforce):**
- Every diagram must have at least one `start` event and at least one `end` event
- Sequence flows must not cross pool boundaries — use `~~>` message flows for cross-pool
- XOR gateway: every outgoing flow must have a condition label; at least two outgoing flows
- AND gateway (split): must have a corresponding AND gateway (join) that reunites the paths, unless each parallel path terminates in a separate end event
- Every element must appear in at least one flow declaration — no orphans
- End events must not have outgoing sequence flows
- Start events must not have incoming sequence flows

**Syntax constraints (Mermaid 11.15 — always enforce):**
- All labels must be in double quotes
- IDs must be valid — no spaces, no hyphens, no reserved keywords
- Pool and lane brackets must be properly opened and closed
- `bpmn-beta` must appear as the diagram type keyword

### Step 5 — Self-validate

Before outputting, check every item:

- [ ] `bpmn-beta` on line 1 (or line 2 if `%%{init}%%` is present)
- [ ] At least one `start` event exists
- [ ] At least one `end` event exists
- [ ] All IDs referenced in flows are declared as elements
- [ ] All `xor` gateways have at least two outgoing labeled flows
- [ ] No orphan elements (every element appears in at least one flow)
- [ ] Pool and lane brackets are properly nested and closed
- [ ] All string labels are in double quotes
- [ ] No reserved keywords used as IDs
- [ ] Sequence flows do not cross pool boundaries
- [ ] Cross-pool flows use `~~>` syntax at the top level

If any check fails, fix before outputting.

### Step 6 — Output

Produce the complete bpmn-beta diagram in a fenced Mermaid code block:

````
```mermaid
bpmn-beta
accTitle: [Descriptive title]

pool [id] "[Pool Label]" {

  lane [id] "[Lane Label]" {
    [element declarations]
  }

  [cross-lane flows]
}
```
````

Immediately after the code block, provide a compact element inventory:

**Elements:** [n] tasks ([n] user, [n] service, [n] script, [n] abstract), [n] events ([n] start, [n] end), [n] gateways, [n] lanes, [n] pools  
**Flows:** [n] sequence flows[, [n] message flows if applicable]  
**Assumptions:** [List any interpretive decisions made in Steps 1–3]

---

## Validation Workflow

When the user provides existing bpmn-beta code for validation:

1. Parse the structural model: identify all declared elements, their types, and all flows
2. Check every element declaration for correct keyword spelling
3. Check every flow for declared source and target IDs
4. Check XOR gateway cardinality (minimum 2 outgoing labeled flows)
5. Check AND gateway split/join pairing
6. Check bracket nesting (pool ⊃ lane ⊃ elements, all properly closed)
7. Check all labels are double-quoted
8. Check no reserved keywords used as IDs
9. Check sequence flows do not cross pool boundaries
10. Check all elements appear in at least one flow

Report format:
- First line: `BPMN Compliance: PASS` or `BPMN Compliance: FAIL ([n] issues found)`
- Numbered list of issues: `[Issue N] ~Line [N]: [Description] — [Correction]`
- Corrected diagram as final output if issues were found

---

## Normalization Workflow

When the user asks to normalize or clean existing bpmn-beta code:

1. Ensure `bpmn-beta` keyword on line 1 (or 2 after init block)
2. Ensure `accTitle` is present; generate "Business Process Diagram" if missing
3. Normalize all IDs to lowercase underscore format (hyphens → underscores; no spaces)
4. Ensure all labels are double-quoted
5. Move cross-lane flows to pool body level (outside lane blocks)
6. Validate after normalization
7. Output normalized code and a summary of changes made

---

## Explanation Workflow

When the user asks about a specific element, construct, or DSL concept:

1. State the element name and its BPMN 2.0.2 equivalent
2. Show the exact bpmn-beta syntax in a code block
3. Give one usage rule
4. Show a minimal working example (3–5 elements, 2–3 flows)

Do not reproduce the full DSL reference in an explanation response. Answer the specific question.

---

## Scope Boundaries

**In scope — generate these:**
- `start`, `end` events (none trigger)
- `task`, `task:user`, `task:service`, `task:script`, `task:receive`, `task:send`
- `xor`, `and`, `or` gateways
- Sequence flows (standard `-->`, conditional `-->:`, default `==>`)
- Message flows between pools (`~~>`)
- Pools and lanes
- `accTitle` and `accDescr`

**Specified but experimental — use with caution:**
- `event:message`, `event:timer`, `event:error` — DSL-specified; not yet parsed by v0.1 renderer

**Out of scope — do not generate:**
- Boundary events on tasks
- Event sub-processes
- Transaction sub-processes
- Compensation events
- Data objects and data stores
- Choreography diagrams
- Conversation diagrams
- BPMN XML import or export
- Process engine execution semantics
- Multi-instance markers
- Call activities

When the user requests an out-of-scope element, state clearly that it is outside the current DSL scope and offer the closest available approximation with an explicit note about the difference.

---

## Theming Integration

bpmn-beta diagrams honor Mermaid themeVariables. If the user also has the `okhp3-mermaid-theme-builder` skill loaded and requests theming, prepend the `%%{init}%%` block:

````
```mermaid
%%{init: { 'theme': 'base', 'themeVariables': { ... } }}%%
bpmn-beta
accTitle: [title]
...
```
````

If no theme is requested, output the diagram without any init block. Do not default to a specific palette.

At the end of diagram generation, if both skills are loaded, offer: "Would you like to apply a color theme to this diagram? I have the okhp3-mermaid-theme-builder skill loaded."

---

## Output Rules

- Always produce the complete, syntactically valid bpmn-beta diagram — never a partial sketch
- Never produce bpmn-beta from memory of BPMN XML syntax or bpmn-js notation
- When uncertain about element classification, use `task` or `xor` as the conservative default and state the assumption
- Do not produce Mermaid flowchart syntax as a substitute for bpmn-beta
- The output is the product. Keep explanation text minimal unless the user asks for explanation.
- Never claim the output can be run by a BPMN process engine, or that it is BPMN 2.0 XML-compatible

---

## References

Load on demand when the body instructions reference them:
- `references/bpmn-beta-dsl-reference.md` — formal grammar spec, BNF notation, complete keyword table
- `references/bpmn-2-element-catalog.md` — full BPMN 2.0.2 element catalog for compliance decisions
- `references/compliance-matrix.md` — BPMN element vs. Mermaid 11.15 bpmn-beta support status matrix
- `references/pool-lane-message-flow-rules.md` — detailed containment and routing rules
- `references/unsupported-and-deferred-features.md` — what is out of scope for v1 and why
- `references/theming-integration.md` — how to compose with okhp3-mermaid-theme-builder
- `references/scope-firewall.md` — what must never appear in skill output

## Scripts

Load when deterministic processing is needed:
- `scripts/validate-bpmn-beta.mjs` — structural + syntax validation
- `scripts/normalize-bpmn-beta.mjs` — canonical formatting
- `scripts/lint-process-model.mjs` — process modeling quality checks
- `scripts/generate-element-inventory.mjs` — element count and type summary
