# BPMN for Mermaid

A Mermaid-native diagram type for business process modeling using a readable, text-first DSL. Write BPMN the way you write flowcharts — then commit it.

## Project thesis

Mermaid has a material diagram-type gap: BPMN 2.0 is not represented as a native syntax. The credible path is not to force BPMN through `flowchart`, but to create a dedicated `bpmn-beta` plugin implementing a documented descriptive subset — and later propose upstream inclusion once the syntax stabilizes.

**Status: Prototype. DSL is unstable and subject to change.**

## Live demo

[https://okhp3.github.io/mermaid-diagram-bpmn](https://okhp3.github.io/mermaid-diagram-bpmn)

## Related reading

- [Notion proposal](https://www.notion.so/overkillhill/BPMN-for-Mermaid-bpmn-beta-Diagram-Type-Proposal-357812e0ced481c88b20d2eb493dc775) — full design spec, decisions, and engagement strategy
- [Mermaid issue #7699](https://github.com/mermaid-js/mermaid/issues/7699) — existing BPMN support request

## Quick example

```
bpmn-beta
accTitle: Purchase Request Approval

start s1 "Request Raised"
task:user t1 "Review Request"
xor g1 "Approved?"
task:service t2 "Issue PO"
end e1 "Done"

s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> e1: "no"
t2 --> e1
```

## Getting started

```bash
pnpm install
pnpm --filter @workspace/mermaid-diagram-bpmn run dev
```

Then open the preview at `/`.

## License

MIT — see [LICENSE](./LICENSE).
