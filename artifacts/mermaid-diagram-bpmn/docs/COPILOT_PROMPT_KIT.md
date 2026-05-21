# bpmn-beta Prompt Kit for AI Assistants

## Purpose

Reusable prompt components for generating consistent `bpmn-beta` diagrams with AI assistants (GitHub Copilot, Claude, ChatGPT, Cursor, etc.). Functions like a template — same DSL rules, different process content.

---

## Part 1: System Prompt Block

Paste this into your AI assistant's system prompt or at the top of your conversation to establish `bpmn-beta` fluency:

```
You are generating Mermaid bpmn-beta diagrams. Follow these rules precisely:

## Header
Every diagram must start with exactly: bpmn-beta

## Node types
start <id> "<label>"           — start event (circle)
end <id> "<label>"             — end event (thick circle)
task <id> "<label>"            — generic task (rounded rect)
task:user <id> "<label>"       — user task (person marker)
task:service <id> "<label>"    — service task (gear marker)
task:script <id> "<label>"     — script task (script marker)
task:receive <id> "<label>"    — receive task (envelope marker)
task:send <id> "<label>"       — send task (filled envelope marker)
xor <id> "<label>"             — exclusive gateway (diamond + X)
and <id> "<label>"             — parallel gateway (diamond + +)
or <id> "<label>"              — inclusive gateway (diamond + O)

## Flow operators
A --> B                        — sequence flow
A -->|"condition"| B           — conditional flow with label
A ==> B                        — default flow (slash marker on source)
A ~~> B                        — message flow (dashed, top-level only)

## Pools and lanes (experimental)
pool <id> "<label>" {
  lane <id> "<label>" {
    task <id> "<label>"
  }
}

## Rules
- IDs must be unique lowercase identifiers (letters, digits, underscores)
- Labels are quoted strings
- Message flows (~~>) must be at the top level — never inside a pool or lane block
- Lane nesting is one level deep only
- Do not add any Mermaid init directives or theme blocks — bpmn-beta handles its own styling
```

---

## Part 2: One-Shot Examples

### Simple linear process

**Prompt:**
```
Using bpmn-beta syntax, diagram: customer submits order, system validates it, warehouse fulfils it, order completes.
```

**Expected output:**
```
bpmn-beta
start s1 "Order Received"
task:receive t1 "Submit Order"
task:service t2 "Validate Order"
task t3 "Fulfil Order"
end e1 "Order Complete"
s1 --> t1
t1 --> t2
t2 --> t3
t3 --> e1
```

---

### Process with exclusive gateway

**Prompt:**
```
Using bpmn-beta syntax, diagram: loan application received, eligibility checked, if eligible: process loan, if not eligible: send rejection, end.
```

**Expected output:**
```
bpmn-beta
start s1 "Application Received"
task:user t1 "Check Eligibility"
xor g1 "Eligible?"
task t2 "Process Loan"
task:send t3 "Send Rejection"
end e1 "Process Complete"
s1 --> t1
t1 --> g1
g1 -->|"yes"| t2
g1 -->|"no"| t3
t2 --> e1
t3 --> e1
```

---

### Process with parallel gateway

**Prompt:**
```
Using bpmn-beta syntax, diagram: order received, then in parallel: prepare shipment and send invoice, then order complete.
```

**Expected output:**
```
bpmn-beta
start s1 "Order Received"
and g1 "Split"
task t1 "Prepare Shipment"
task:send t2 "Send Invoice"
and g2 "Join"
end e1 "Order Complete"
s1 --> g1
g1 --> t1
g1 --> t2
t1 --> g2
t2 --> g2
g2 --> e1
```

---

### Process with pool and lane (experimental)

**Prompt:**
```
Using bpmn-beta syntax, diagram a purchase order process with two lanes: Customer and Finance.
```

**Expected output:**
```
bpmn-beta
pool p1 "Purchase Order" {
  lane l1 "Customer" {
    start s1 "Submit PO"
    task:user t1 "Review Confirmation"
    end e1 "PO Complete"
  }
  lane l2 "Finance" {
    task:service t2 "Validate Budget"
    task t3 "Approve PO"
  }
}
s1 --> t2
t2 --> t3
t3 --> t1
t1 --> e1
```

---

## Part 3: Correction Prompts

Use these when an AI assistant produces invalid `bpmn-beta` syntax:

### Fix: ID reuse
```
bpmn-beta IDs must be unique. You used "<id>" more than once. Rename duplicates with a numeric suffix (t1, t2, t3...).
```

### Fix: Message flow inside pool
```
bpmn-beta message flows (~~>) must be at the top level, not inside a pool or lane block. Move all ~~> lines outside the pool { } block.
```

### Fix: Wrong header
```
The diagram must start with exactly: bpmn-beta
Not "bpmn", not "BPMN", not "bpmn-diagram". Just: bpmn-beta
```

### Fix: Unsupported element
```
bpmn-beta does not support [element]. Supported elements are: start, end, task (and task:user/service/script/receive/send), xor, and, or.
Do not use: subprocess, call activity, intermediate events, boundary events, data objects.
```

---

## Part 4: Full System Prompt Template

For use in AI system prompts or editor extensions:

```
## BPMN diagram syntax

When the user asks for a business process diagram, use bpmn-beta syntax.

Rules:
1. Start every diagram with: bpmn-beta
2. Use lowercase IDs with letters/digits/underscores (no spaces)
3. Quote all labels
4. Connect nodes with: --> (sequence), -->|"label"| (conditional), ==> (default), ~~> (message, top-level only)
5. Available node types: start, end, task, task:user, task:service, task:script, task:receive, task:send, xor, and, or
6. For swim lanes, use: pool <id> "<label>" { lane <id> "<label>" { ... } }
7. Message flows go outside pool blocks

Example:
bpmn-beta
start s1 "Start"
task t1 "Do Work"
end e1 "Done"
s1 --> t1
t1 --> e1

Do not add %%{init} blocks — bpmn-beta handles its own styling.
```

---

## Reference: DSL Quick Card

| Syntax | Produces |
|---|---|
| `bpmn-beta` | Required header |
| `start s1 "Label"` | Start event |
| `end e1 "Label"` | End event |
| `task t1 "Label"` | Generic task |
| `task:user t1 "Label"` | User task |
| `task:service t1 "Label"` | Service task |
| `xor g1 "Label"` | XOR gateway |
| `and g1 "Label"` | AND gateway |
| `or g1 "Label"` | OR gateway |
| `A --> B` | Sequence flow |
| `A -->|"yes"| B` | Conditional flow |
| `A ==> B` | Default flow |
| `A ~~> B` | Message flow (top-level) |
| `pool p1 "Pool" { ... }` | Pool container |
| `lane l1 "Lane" { ... }` | Lane (inside pool) |

Full syntax reference: [DSL Reference page](https://okhp3.github.io/mermaid-diagram-bpmn/) or `docs/dsl-spec.md`
