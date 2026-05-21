# Parser Safety Checklist — bpmn-beta

**Version:** 0.1
**Owner:** OverKill Hill P³ / Jamie Hill

Use this checklist when modifying `bpmn-parser.ts` or adding new DSL constructs.

---

## Before modifying the parser

- [ ] Read the current `bpmn-beta-standard.md` — especially sections 3 (DSL standard) and 6 (testing standard)
- [ ] Understand the context stack — `pool` and `lane` blocks use a LIFO stack; closing `}` pops the stack
- [ ] Understand flow counter — `flowCounter` is module-scoped; ensure it resets via `db.clear()` before each parse
- [ ] Read the corpus test fixtures (`examples/*.mmd`) — changes must not break any existing example

---

## Adding a new node type

- [ ] The node type keyword is not a substring of an existing keyword (prevents regex ambiguity)
- [ ] The regex captures: `typeStr`, `nodeId`, `label`
- [ ] `nodeId` validates as `[a-zA-Z][a-zA-Z0-9_]*` — reject silently or throw descriptive error
- [ ] Duplicate `nodeId` within a diagram: define and test the correct behavior (currently: last wins)
- [ ] The new type is added to `BpmnNode['kind']` or `BpmnNode['subtype']` union in `bpmn-db.ts`
- [ ] The new type is rendered in `bpmn-renderer.tsx` (React component)
- [ ] The new type is rendered in `bpmn-plugin.ts` draw function (SVG string)
- [ ] The new type is dimensioned in `bpmn-layout.ts` `nodeDimensions()`
- [ ] At least one unit test covers the new syntax
- [ ] At least one corpus test covers the new type (add example or update existing)

---

## Adding a new flow type

- [ ] The flow operator is visually distinct from all existing operators (`-->`, `-->|...|`, `==>`, `~~>`)
- [ ] The regex does not partially match existing operators (test boundary conditions)
- [ ] The flow kind is added to `BpmnFlow['kind']` union in `bpmn-db.ts`
- [ ] The flow is rendered in `bpmn-renderer.tsx`
- [ ] The flow is rendered in `bpmn-plugin.ts` draw function
- [ ] Applicable constraints are documented (e.g., which flows are valid inside vs. outside pool blocks)
- [ ] A parser error is thrown when a constraint is violated (not a silent skip)

---

## Adding or changing block syntax (pool / lane / future)

- [ ] The block uses `{` and `}` delimiters on their own lines (not inline)
- [ ] The context stack correctly pushes on open `{` and pops on `}`
- [ ] Mismatched braces produce a descriptive error (e.g., `Line N: unexpected '}' — no open block`)
- [ ] Nested depth is validated — currently max 1 level (lane inside pool); deeper nesting throws an error
- [ ] Nodes declared inside a block carry the correct `poolId` / `laneId` on the `BpmnNode`
- [ ] Cross-block flows are valid only at the top level (message flows enforced; sequence flows allowed)
- [ ] Context stack is empty at end of parse — if not, throw `Line N: unclosed block '...'`

---

## Error message standards

All thrown errors must follow this format:
```
Line <N>: <clear, actionable message>
```

Good examples:
- `Line 7: message flows (~~>) must be declared at the top level, not inside a pool or lane block`
- `Line 12: lane must be inside a pool block`
- `Line 15: nested lanes are not supported`
- `Line 20: unknown node type 'subprocess' — supported types: start, end, task, xor, and, or`

Bad examples (do not use):
- `Parse error`
- `Unexpected token`
- `Invalid syntax at line 7`

---

## Regex safety

- [ ] No catastrophic backtracking — test all regex patterns against: empty string, very long string (1000+ chars), all-whitespace, deeply nested braces
- [ ] Every regex has a named capture group or positional group for each extracted value
- [ ] The catch-all at the bottom of the parse loop (unknown line) either throws or silently skips — document which and test both paths
- [ ] Regex patterns are defined as module-level constants (`const PATTERN = /regex/`), not inline in the parse loop

---

## Post-change verification

- [ ] `pnpm --filter @workspace/mermaid-diagram-bpmn run test` — all tests pass
- [ ] `pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck` — zero errors
- [ ] All 5 corpus examples still parse without error
- [ ] Manual playground test: load each example, verify SVG renders
- [ ] If the change affects error output: manually test the error path (type invalid syntax in playground)

---

## Regression risk by change type

| Change | Risk | Mitigation |
|---|---|---|
| Add new node type keyword | Low | Regex isolation; new tests |
| Add new flow operator | Medium | Operator boundary tests; corpus re-run |
| Modify context stack logic | High | All corpus tests + pool/lane manual test |
| Change flow counter reset behavior | High | All flow-related parser tests |
| Change directive parsing (accTitle/accDescr) | Medium | Accessibility tests |
| Modify closing `}` handling | High | Context stack leak test; all block examples |
