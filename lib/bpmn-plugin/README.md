# @okhp3/mermaid-diagram-bpmn

[![npm version](https://img.shields.io/npm/v/@okhp3/mermaid-diagram-bpmn.svg)](https://www.npmjs.com/package/@okhp3/mermaid-diagram-bpmn)
[![npm downloads](https://img.shields.io/npm/dm/@okhp3/mermaid-diagram-bpmn.svg)](https://www.npmjs.com/package/@okhp3/mermaid-diagram-bpmn)
[![license](https://img.shields.io/npm/l/@okhp3/mermaid-diagram-bpmn.svg)](./README.md#licence)

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

### Browser CDN (native ESM)

For a no-bundler proof, use the exact tested pair below in a modern browser:

```html
<script type="module">
  const [{ default: mermaid }, { bpmnPlugin }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/mermaid@11.4.1/+esm'),
    import('https://cdn.jsdelivr.net/npm/@okhp3/mermaid-diagram-bpmn@0.1.1/dist/index.mjs'),
  ]);
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
  await mermaid.registerExternalDiagrams([bpmnPlugin]);
  const { svg } = await mermaid.render('my-diagram', 'bpmn-beta\nstart s1 "Begin"\nend e1 "Done"\ns1 --> e1');
  document.getElementById('output').innerHTML = svg;
</script>
```

This is a supported proof for `mermaid@11.4.1` with
`@okhp3/mermaid-diagram-bpmn@0.1.1`, using native browser ESM and the default
strict Mermaid security boundary. The plugin must load after Mermaid
registration is available; the example registers it explicitly before
rendering. Other Mermaid releases, CommonJS `<script>` tags, legacy browsers,
and arbitrary script-loader environments are outside this contract. A failed
network import or render should be surfaced to the page as an error rather than
silently treated as a successful diagram.

The repository contains the standalone proof at
`app/public/browser-cdn-example.html`. The repeatable
`pnpm run check:browser-cdn` gate verifies the exact URLs and their HTTP
responses.

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
