# Test corpus

This directory is a metadata placeholder. The actual fixture files live in
`examples/` at the artifact root (`artifacts/mermaid-diagram-bpmn/examples/`).

## What the corpus tests do

`bpmn-parser-corpus.test.ts` (in the parent `__tests__/` directory) reads each
`.mmd` file from `examples/` using Node's `fs.readFileSync` and asserts
structural invariants against the parsed `BpmnDb`. It does not snapshot the full
AST — instead it checks properties that must hold for each example to be valid.

## Invariants checked per example

| File | Key invariants |
|---|---|
| 01-linear-process.mmd | 1 start, 1 end, ≥1 sequence flow, has accTitle |
| 02-gateway-decision.mmd | ≥1 xor gateway, ≥1 conditional flow, ≥1 default flow |
| 03-pool-lane-collaboration.mmd | 2 pools, ≥2 lanes, exactly 1 message flow |
| 04-multi-event.mmd | >1 end event, >1 gateway |
| 05-parallel-split.mmd | exactly 2 AND gateways, no pools/lanes |

## Adding a new corpus test

1. Add a `.mmd` file to `examples/`
2. Add a corresponding `describe()` block in `bpmn-parser-corpus.test.ts`
3. Assert at minimum: nodes > 0, flows > 0, accTitle defined
