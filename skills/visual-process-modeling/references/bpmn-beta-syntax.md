# bpmn-beta DSL Syntax Reference

## Diagram Header

Every diagram must open with `bpmn-beta` on the first non-blank line:

```
bpmn-beta
  title <Process Name>
  direction LR | TB
```

`direction` defaults to `LR` (left-to-right).

## Node Types

| Syntax | BPMN element | Description |
|---|---|---|
| `(( label ))` | Start event | Filled circle |
| `([ label ])` | End event | Thick-bordered circle |
| `((! label ))` | Error/intermediate event | Circle with lightning bolt |
| `[[ label ]]` | Collapsed subprocess | Rectangle with + marker |
| `[ label ]` | Task | Plain rectangle |
| `{ label? }` | Exclusive gateway | Diamond with X |
| `{+ label }` | Parallel gateway | Diamond with + |
| `{{ label }}` | Inclusive gateway | Diamond with O |
| `>[ label ]` | Send task | Rectangle with envelope |
| `<[ label ]` | Receive task | Rectangle with filled envelope |

## Flow Operators

| Operator | Meaning |
|---|---|
| `-->` | Sequence flow (within pool/lane) |
| `-- label -->` | Labelled sequence flow |
| `~~>` | Message flow (must be at top level, between pools) |
| `-- label ~~>` | Labelled message flow |

## Pool and Lane Structure

```
pool <Pool Name> {
  lane <Lane Name> {
    (( start )) --> [ Task A ] --> { Decision? }
    { Decision? } -- yes --> [ Task B ] --> ([ end ])
    { Decision? } -- no  --> [ Task C ] --> ([ end ])
  }
  lane <Lane 2 Name> {
    ...
  }
}
```

**Rules:**
- `pool` groups lanes from one organisation or department
- `lane` defines a swimlane within a pool
- `}` closes the most recently opened block — pools and lanes must be properly nested
- Message flows `~~>` must be declared at the top level, outside any pool or lane block
- Flat (no pools) diagrams are valid for single-lane processes

## Directive Block

Optional metadata at the top of the diagram:

```
bpmn-beta
  title Purchase Order Approval
  direction LR
  theme default | dark | neutral | forest
```

## Syntax Rules

1. Indentation is for readability only — it is not semantically significant
2. Labels may contain spaces; they do not need quotes
3. Duplicate node labels are allowed (creates separate nodes); use IDs for traceability when needed
4. Empty lanes are allowed but will generate a lint warning
5. Gateway labels should end with `?` for exclusive gateways by convention
6. Node labels should be imperative verb phrases for tasks and question phrases for gateways
