# DSL Specification: bpmn-beta

> **Stability:** Unstable — syntax may change before npm publication.

---

## 1. Lexical conventions

- **First line:** must be `bpmn-beta` (the detector key; `beta` belongs only here)
- **IDs:** `[A-Za-z_][A-Za-z0-9_]*` — recommend short IDs (`s1`, `t1`, `g1`, `e1`)
- **Labels:** double-quoted strings — `"My Label"`
- **Comments:** `%% ...` (Mermaid standard)
- **Directives:** Mermaid-standard frontmatter (`%%{ init: { ... } }%%`)
- **Accessibility:** `accTitle: ...` and `accDescr: ...` on their own lines after the header

---

## 2. Node declarations

```
<keyword> <id> "<label>"
```

### Event keywords

| Keyword | BPMN shape | Notes |
|---|---|---|
| `start` | Start event (thin ring) | Filled inner circle |
| `end` | End event (thick ring) | Filled shape |

### Task keywords

| Keyword | BPMN shape | Marker |
|---|---|---|
| `task` | Generic task (rounded rect) | None |
| `task:user` | User task | Person icon |
| `task:service` | Service task | Gear icon |
| `task:script` | Script task | Script icon |
| `task:receive` | Receive task | Envelope icon |
| `task:send` | Send task | Filled envelope icon |

### Gateway keywords

| Keyword | BPMN shape | Marker |
|---|---|---|
| `xor` | Exclusive gateway | X marker |
| `and` | Parallel gateway | + marker |
| `or` | Inclusive gateway | O + marker |

---

## 3. Flow operators

```
<source-id> <operator> <target-id>
<source-id> <operator> <target-id>: "<label>"
```

| Operator | BPMN meaning | Notes |
|---|---|---|
| `-->` | Sequence flow | Standard arrow |
| `--> : "condition"` | Conditional sequence flow | Label rendered mid-edge |
| `==>` | Default sequence flow | Slash marker at source |
| `~~>` | Message flow | Dashed open-arrow; cross-pool only |
| `---` | Association | Planned — not yet rendered |

---

## 4. Accessibility directives

```
bpmn-beta
accTitle: Purchase Order Approval
accDescr: Manager reviews a purchase request and either approves or rejects it.
```

Both become `<title>` and `<desc>` inside the SVG and are referenced by `aria-labelledby`.

---

## 5. Pool and lane blocks

```
pool <pool-id> "<Pool Label>" {
  lane <lane-id> "<Lane Label>" {
    <node declarations>
    <sequence flows within lane>
  }
  <sequence flows within pool, crossing lanes>
}
```

**Rules:**
- Pools and lanes are optional. Diagrams without pools use flat auto-layout.
- Lanes are one level deep only — nested lanes are not supported in v1.
- Sequence flows that cross lanes must be declared inside the pool block (after the lane blocks).
- Message flows (`~~>`) are cross-pool by definition and **must** be declared at the top level, outside any pool block.
- Sequence flows must not cross pool boundaries — use message flows for that.

---

## 6. Canonical examples

### 6.1 Linear process (flat)

```
bpmn-beta
accTitle: Document Approval
accDescr: A simple linear approval process.

start s1 "Request Received"
task:user t1 "Review Document"
task:service t2 "Send Notification"
end e1 "Approved"

s1 --> t1
t1 --> t2
t2 --> e1
```

### 6.2 Gateway decision (flat)

```
bpmn-beta
accTitle: Purchase Request Approval
accDescr: Manager reviews and either approves or rejects.

start s1 "Request Raised"
task:user t1 "Review Request"
xor g1 "Approved?"
task:service t2 "Issue Purchase Order"
task:user t3 "Notify Rejection"
end e1 "Order Issued"
end e2 "Rejected"

s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> t3: "no"
t2 --> e1
t3 ==> e2
```

### 6.3 Pool/lane collaboration (experimental rendering)

```
bpmn-beta
accTitle: Purchase Order Collaboration
accDescr: Buyer and supplier pools exchange a purchase order via cross-pool message flow.

pool buyer "Buyer" {
  lane req "Requester" {
    start s1 "Need Identified"
    task:user t1 "Submit PO Request"
  }
  lane mgr "Manager" {
    task:user t2 "Review Request"
    xor g1 "Approved?"
    end e2 "Rejected"
  }
  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> e2: "no"
}

pool supplier "Supplier" {
  task:receive t3 "Receive PO"
  task t4 "Acknowledge PO"
  end e1 "PO Acknowledged"
  t3 --> t4
  t4 --> e1
}

g1 ~~> t3
```

> **Note:** Pool/lane rendering is experimental. Cross-lane flow ordering and message flow routing are approximate in the current prototype.

---

## 7. Complete keyword reference

| Keyword | Category | v1 status |
|---|---|---|
| `bpmn-beta` | Header | Required (first line) |
| `accTitle:` | Accessibility | Implemented |
| `accDescr:` | Accessibility | Implemented |
| `start` | Event | Implemented |
| `end` | Event | Implemented |
| `task` | Task | Implemented |
| `task:user` | Task | Implemented |
| `task:service` | Task | Implemented |
| `task:script` | Task | Implemented |
| `task:receive` | Task | Implemented |
| `task:send` | Task | Implemented |
| `xor` | Gateway | Implemented |
| `and` | Gateway | Implemented |
| `or` | Gateway | Implemented |
| `-->` | Flow | Implemented |
| `==>` | Flow | Implemented |
| `~~>` | Flow | Experimental |
| `---` | Association | Planned |
| `pool` | Structure | Experimental |
| `lane` | Structure | Experimental |
