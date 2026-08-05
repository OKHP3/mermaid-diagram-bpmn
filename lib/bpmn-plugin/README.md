# @okhp3/mermaid-diagram-bpmn

**bpmn-beta** — a text-first BPMN diagram type for [Mermaid](https://mermaid.js.org/).

Write readable process models as a Markdown code fence. No XML. No bpmn-js runtime.

---

## Install

```bash
npm install @okhp3/mermaid-diagram-bpmn
# peer dependency
npm install mermaid
```

---

## Usage

```typescript
import mermaid from 'mermaid';
import { bpmnPlugin } from '@okhp3/mermaid-diagram-bpmn';

mermaid.initialize({ startOnLoad: false });
await mermaid.registerExternalDiagrams([bpmnPlugin]);
await mermaid.run();
```

Or render explicitly:

```typescript
const { svg } = await mermaid.render('my-diagram', `
bpmn-beta
accTitle: Purchase Approval
accDescr: A simple purchase approval flow.

start  s1  "Request Received"
task:user  t1  "Review Request"
xor    g1  "Approved?"
end    e1  "Approved"
end    e2  "Rejected"

s1 --> t1
t1 --> g1
g1 --> e1 : "yes"
g1 --> e2 : "no"
`);

document.getElementById('output').innerHTML = svg;
```

---

## bpmn-beta syntax quick reference

| Element | Syntax | Example |
|---|---|---|
| Start event | `start <id> "<label>"` | `start s1 "Begin"` |
| End event | `end <id> "<label>"` | `end e1 "Done"` |
| Task (plain) | `task <id> "<label>"` | `task t1 "Approve"` |
| Task (typed) | `task:<type> <id> "<label>"` | `task:user t1 "Review"` |
| XOR gateway | `xor <id> "<label>"` | `xor g1 "Decision?"` |
| AND gateway | `and <id> "<label>"` | `and g2 "Split"` |
| OR gateway | `or <id> "<label>"` | `or g3 "Branch"` |
| Sequence flow | `<from> --> <to>` | `s1 --> t1` |
| Labeled flow | `<from> --> <to> : "<label>"` | `g1 --> e1 : "yes"` |
| Pool | `pool <id> "<label>" { ... }` | see below |
| Lane | `lane <id> "<label>" { ... }` | inside a pool |

**Task types:** `user`, `service`, `script`, `receive`, `send`

**Pool/lane example:**

```
bpmn-beta
pool order "Order Process" {
  lane customer "Customer" {
    start s1 "Order Placed"
    task:user t1 "Review Cart"
  }
  lane warehouse "Warehouse" {
    task:service t2 "Pick Items"
    end e1 "Shipped"
  }
  s1 --> t1
  t1 --> t2
  t2 --> e1
}
```

---

## Mermaid version compatibility

| Plugin version | Mermaid target |
|---|---|
| 0.1.x | `mermaid@11.4.1` |

`MERMAID_VERSION_TARGET` is exported for version-pin assertions:

```typescript
import { MERMAID_VERSION_TARGET } from '@okhp3/mermaid-diagram-bpmn';
console.log(MERMAID_VERSION_TARGET); // '11.4.1'
```

---

## Licence

MIT © OverKill Hill P³
