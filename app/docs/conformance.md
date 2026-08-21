# bpmn-beta Element Coverage vs @knsv's MVP Scope

**Source:** @knsv (Mermaid creator, COLLABORATOR) comment on [issue #2623](https://github.com/mermaid-js/mermaid/issues/2623#issuecomment-4003175792), 2026-03-01.
**Checked:** 2026-08-21
**bpmn-beta revision checked against:** parser at `app/src/lib/bpmn-parser.ts`, renderer at `app/src/lib/bpmn-renderer.tsx`

---

## @knsv's stated MVP scope

On 2026-03-01, @knsv scoped the BPMN-for-Mermaid effort around the BPMN 2.0 Descriptive Conformance sub-class (Level 1). Community consensus in the following thread was overwhelmingly Level 1-first. The element list he cited verbatim:

> **Level 1: Descriptive** (the core set most people actually use day-to-day):
> - Events: start, end, intermediate (simple circle notation)
> - Activities: tasks, subprocesses (collapsed/expanded)
> - Gateways: XOR (exclusive), AND (parallel), OR (inclusive)
> - Connecting objects: sequence flows, message flows
> - Swimlanes: pools and lanes
> - Basic artifacts: data objects, annotations, groups

He also mentioned Level 2 elements (timer/message/signal/error events, event subprocesses, event-based gateways, more task types) and Level 3 (execution semantics) as explicitly out of scope for the MVP.

Note: @knsv mentioned swimlanes as a prerequisite and pointed to issue #2028 for parallel discussions.

---

## Coverage table

| @knsv MVP element | bpmn-beta status | DSL syntax | Notes |
|---|---|---|---|
| **EVENTS** | | | |
| Start event | ✅ Supported | `start id "label"` | Rendered as double circle (thin inner ring) |
| End event | ✅ Supported | `end id "label"` | Rendered as double circle (thick inner ring) |
| Intermediate event | ❌ Not yet | — | `BpmnDb` type has `position: 'intermediate'` but no parser keyword or renderer shape exists |
| **ACTIVITIES** | | | |
| Task (generic) | ✅ Supported | `task id "label"` | Plain rounded rectangle |
| Task: user | ✅ Supported | `task:user id "label"` | Person icon at top-left |
| Task: service | ✅ Supported | `task:service id "label"` | Gear icon at top-left |
| Task: script | ✅ Supported | `task:script id "label"` | Document icon at top-left |
| Task: send | ✅ Supported | `task:send id "label"` | Filled envelope icon at top-left |
| Task: receive | ✅ Supported | `task:receive id "label"` | Open envelope icon at top-left |
| Task: manual | 🟡 Parsed, no icon | `task:manual id "label"` | Parser accepts any `:subtype`; renderer has no manual-task icon (renders as plain task) |
| Task: business rule | 🟡 Parsed, no icon | `task:businessrule id "label"` | Same — parsed, no distinct icon |
| Subprocess (collapsed) | ❌ Not yet | — | `BpmnDb` kind `'subprocess'` defined but no parser keyword or renderer shape |
| Subprocess (expanded) | ❌ Not yet | — | No parser or renderer support; would require nested block syntax |
| Call activity | ❌ Not yet | — | `BpmnDb` kind `'call'` defined but no parser keyword or renderer shape |
| **GATEWAYS** | | | |
| XOR / Exclusive gateway | ✅ Supported | `xor id "label"` | Diamond with X marker |
| AND / Parallel gateway | ✅ Supported | `and id "label"` | Diamond with + marker |
| OR / Inclusive gateway | ✅ Supported | `or id "label"` | Diamond with circle+cross marker |
| Event-based gateway | ❌ Not yet | — | Level 2 in @knsv's framing; out of scope for MVP |
| Complex gateway | ❌ Not yet | — | Level 2+; out of scope |
| **CONNECTING OBJECTS** | | | |
| Sequence flow | ✅ Supported | `src --> tgt` | Solid arrow |
| Conditional sequence flow | ✅ Supported | `src --> tgt: "condition"` | Solid arrow with label |
| Default flow | ✅ Supported | `src ==> tgt` | Slash marker at source, solid arrow |
| Message flow | ✅ Supported | `src ~~> tgt` | Dashed line with open arrowhead; top-level only (error inside pool/lane block) |
| Association flow | ❌ Not yet | — | `BpmnFlow.kind` has `'association'` in the DB but no parser syntax; task #282 proposed |
| **SWIMLANES** | | | |
| Pool | ✅ Supported | `pool id "label" { … }` | Header sidebar with rotated label |
| Lane (one level) | ✅ Supported | `lane id "label" { … }` | Inside a pool block |
| Nested lanes (>1 level) | 🚫 Out of scope | — | Parser throws `NESTED_LANE` error; PRD non-goal |
| **BASIC ARTIFACTS** | | | |
| Data objects | 🚫 Out of scope | — | Explicitly in PRD v1 non-goals; no plans for v1 |
| Annotations / Notes | ❌ Not yet | — | `BpmnDb` kind `'note'` defined; no parser keyword or renderer; task #282 proposed |
| Groups | 🚫 Out of scope | — | Explicitly in PRD v1 non-goals |

**Legend:**
- ✅ Supported — parser accepts and renderer draws the correct BPMN shape
- 🟡 Parsed, no icon — parser accepts but renderer does not draw a subtype-specific marker
- ❌ Not yet — element is in-scope but not yet implemented
- 🚫 Out of scope — explicitly excluded from bpmn-beta v1; PRD non-goal

---

## Gap analysis against @knsv's MVP

### Gaps that are in-scope and easy to close

These gaps fall inside @knsv's MVP Level 1 list, have partial infrastructure in the codebase already, and are realistic additions before a Mermaid upstream PR.

| Gap | Effort estimate | Existing infrastructure | Recommended priority |
|---|---|---|---|
| **Intermediate event** | Medium | `BpmnNode.position = 'intermediate'` already in `BpmnDb`; needs parser keyword (`intermediate id "label"`) and renderer shape (double circle, no inner ring) | High — @knsv listed it as a Level 1 element; omitting it from a PR would be a notable gap |
| **Annotation / Note** | Medium | `BpmnNode.kind = 'note'` already in `BpmnDb`; task #282 proposes adding the DSL syntax | Medium — @knsv listed annotations in Level 1; task #282 already targets this |
| **Association flow** | Low–Medium | `BpmnFlow.kind = 'association'` already in `BpmnDb`; task #282 proposes DSL syntax; only renderer needs dashed-line-no-arrowhead treatment | Medium — needed to connect annotations to process elements; task #282 already targets this |
| **Subprocess (collapsed)** | High | Only DB type exists; needs parser keyword, renderer (rounded rectangle + `+` marker at bottom-center), and layout treatment | Low for MVP — @knsv listed it, but collapsed subprocesses are often used as a summary shape and the lack doesn't block core flow authoring |

### Gaps that are deliberately out of scope

These are not gaps — they are intentional scope limits documented in `prd.md`. They should be explicitly noted in any upstream PR description to set reviewer expectations:

- Data objects and stores
- Groups
- Nested lanes (>1 level)
- Boundary events
- Event subprocesses, transactions
- Multi-instance markers, compensation
- Event-based gateways, complex gateways
- BPMN XML import/export

### Beyond the MVP (Level 2 / Level 3)

bpmn-beta's `task:user`, `task:service`, `task:script`, `task:send`, `task:receive` subtypes are technically Level 2 elements in @knsv's framing (he listed them under "more task types" in Level 2). However, they are already implemented with distinct icons and represent high-value differentiation for documentation-grade diagrams. An upstream PR should frame them as the Level 2 additions the implementation already makes because of their low cost and high readability value.

---

## Summary verdict

bpmn-beta covers **6 of @knsv's 9 major Level 1 element categories** fully (start event, end event, all three gateways, sequence/message flows, pools and lanes) plus five task subtypes that are technically Level 2. The three meaningful gaps against the MVP definition are:

1. **Intermediate events** — needs a parser keyword and a distinct renderer shape (simple intermediate circle, no inner ring decoration for plain intermediate).
2. **Annotations / Notes with association flows** — DB types exist; task #282 covers the DSL syntax.
3. **Collapsed subprocesses** — DB type exists; parser and renderer not yet written.

Of these, intermediate events are the highest-priority gap: @knsv listed them explicitly in Level 1, they are the most visibly missing standard shape, and the DB infrastructure (`position: 'intermediate'`) already exists.

---

*Generated 2026-08-21. Recheck after each parser or renderer change. See `competitive-landscape.md` for the competitive context and upstream engagement strategy.*
