# Test corpus

The corpus fixture files live in `examples/` at the artifact root
(`artifacts/mermaid-diagram-bpmn/examples/`). The test runner reads them from
there at runtime.

## Two layers of corpus tests

`bpmn-parser-corpus.test.ts` (in the parent `__tests__/` directory) runs two
complementary layers for each example:

### 1. Snapshot tests (auto-discovered)

Every `.mmd` file in `examples/` is automatically picked up and run through the
parser. The full `BpmnDb` state (nodes, flows, pools, lanes, accTitle,
accDescription) is captured with `toMatchSnapshot()`. Snapshots live in
`__tests__/__snapshots__/bpmn-parser-corpus.test.ts.snap`.

**These are the parity tests.** When the Langium port lands, the same snapshots
assert behavioral equivalence between the two parsers.

### 2. Invariant tests (named, per-example)

Human-readable structural assertions — "this example must have exactly 2 pools",
"this example must have a conditional flow", etc. These document intent and catch
regressions that a snapshot diff might obscure.

## One-step process for adding a new corpus fixture

1. Drop a `.mmd` file into `examples/`
2. Wire it into `bpmn-examples.ts` so the Playground can render it
3. Run:
   ```
   pnpm --filter @workspace/mermaid-diagram-bpmn run test -- -u
   ```
   This generates the snapshot on the first run. Subsequent runs check against it.
4. Optionally add a named invariant `describe()` block in
   `bpmn-parser-corpus.test.ts` for any structural property worth asserting
   explicitly.

## Updating snapshots after intentional behavior changes

```
pnpm --filter @workspace/mermaid-diagram-bpmn run test -- -u
```

Always review the diff before committing updated snapshots. A snapshot change is
a behavior change.

## Current fixtures

| File | Key invariants |
|---|---|
| `01-linear-process.mmd` | 1 start, 1 end, ≥1 sequence flow, has accTitle |
| `02-gateway-decision.mmd` | ≥1 xor gateway, ≥1 conditional flow, ≥1 default flow |
| `03-pool-lane-collaboration.mmd` | 2 pools, ≥2 lanes, exactly 1 message flow |
| `04-multi-event.mmd` | >1 end event, >1 gateway |
| `05-parallel-split.mmd` | exactly 2 AND gateways, no pools/lanes |
