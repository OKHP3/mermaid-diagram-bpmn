# bpmn-beta DSL Formal Specification

> **Stability:** Unstable — syntax subject to change before npm publication.  
> **Version:** 0.1.0  
> **Parser:** `artifacts/mermaid-diagram-bpmn/src/lib/bpmn-parser.ts`

---

## 1. Lexical Conventions

### 1.1 Encoding and Whitespace

- UTF-8 source files.
- Lines are split on `\n`; each line is trimmed of leading and trailing whitespace before parsing.
- Empty lines and lines containing only whitespace are ignored.
- Token order within a line is significant.

### 1.2 Comments

Lines beginning with `%%` (after trimming) are comments and are ignored by the parser:

```
%% This is a comment
```

Mermaid-standard directives use the same `%%` sigil:

```
%%{init: { 'theme': 'base', 'themeVariables': { ... } }}%%
```

### 1.3 Identifiers

IDs match the pattern: `[A-Za-z][A-Za-z0-9_]*`

- Must begin with a letter (upper or lower case).
- May contain letters, digits, and underscores.
- **No hyphens.**
- Must be unique within the diagram.
- Recommended convention: short (`s1`, `t1`, `g1`, `e1`) or semantic (`review`, `approve`, `hr`, `manager`).

### 1.4 Labels

String labels are **always** double-quoted: `"My Label Text"`

- May contain spaces, punctuation, and Unicode.
- Must not contain unescaped double-quote characters inside the string.
- Labels are optional for some constructs (noted below) but recommended for all visible elements.

### 1.5 Reserved Words

The following identifiers must not be used as element IDs:

`pool`, `lane`, `start`, `end`, `task`, `xor`, `and`, `or`

---

## 2. Diagram Header

The first non-comment, non-empty line of every bpmn-beta diagram must be the literal string:

```
bpmn-beta
```

BNF:

```
diagram       ::= "bpmn-beta" NEWLINE metadata* (statement | pool-block)*
metadata      ::= acc-title | acc-descr
acc-title     ::= "accTitle:" TEXT NEWLINE
acc-descr     ::= "accDescr:" TEXT NEWLINE
```

---

## 3. Element Declarations

### 3.1 Grammar

```
element-decl  ::= keyword ID QUOTED-STRING NEWLINE

keyword       ::= event-keyword | task-keyword | gateway-keyword
event-keyword ::= "start" | "end"
task-keyword  ::= "task" | "task:user" | "task:service" | "task:script"
               | "task:receive" | "task:send"
gateway-keyword ::= "xor" | "and" | "or"

ID            ::= [A-Za-z][A-Za-z0-9_]*
QUOTED-STRING ::= '"' [^"]* '"'
```

### 3.2 Event Elements

| Keyword | BPMN 2.0.2 Element | Shape Description | v0.1 Status |
|---|---|---|---|
| `start` | None Start Event | Thin circle | Implemented |
| `end` | None End Event | Thick circle | Implemented |

### 3.3 Task Elements

| Keyword | BPMN 2.0.2 Element | Marker | v0.1 Status |
|---|---|---|---|
| `task` | Abstract Task | None | Implemented |
| `task:user` | User Task | Person icon (top-left) | Implemented |
| `task:service` | Service Task | Gear icon (top-left) | Implemented |
| `task:script` | Script Task | Scroll icon (top-left) | Implemented |
| `task:receive` | Receive Task | Envelope icon (top-left) | Implemented |
| `task:send` | Send Task | Filled envelope (top-left) | Implemented |

### 3.4 Gateway Elements

| Keyword | BPMN 2.0.2 Element | Diamond Marker | Routing Semantics |
|---|---|---|---|
| `xor` | Exclusive (Data-Based) Gateway | X | Exactly one outgoing path is taken |
| `and` | Parallel Gateway | + | All outgoing paths are taken simultaneously |
| `or` | Inclusive Gateway | Circle | One or more outgoing paths are taken |

---

## 4. Flow Declarations

### 4.1 Grammar

```
flow-decl     ::= seq-flow | cond-flow | default-flow | msg-flow

seq-flow      ::= ID "-->" ID NEWLINE
cond-flow     ::= ID "-->" ID ":" QUOTED-STRING NEWLINE
default-flow  ::= ID "==>" ID NEWLINE
msg-flow      ::= ID "~~>" ID NEWLINE
```

### 4.2 Flow Types

| Operator | BPMN Flow Type | Label | Constraints |
|---|---|---|---|
| `-->` | Sequence flow | Optional (adds condition if present) | Within a pool |
| `-->` + `:` | Conditional sequence flow | Required after `:` | Within a pool; label is the condition |
| `==>` | Default sequence flow | None | Within a pool; slash marker at source |
| `~~>` | Message flow | None | **Top-level only** — must not appear inside any pool or lane block |

### 4.3 Flow Placement Rules

- Flows may be declared anywhere at the top level (outside all pool blocks).
- Flows declared inside a pool block but outside a lane block are associated with that pool; this is the preferred location for **cross-lane flows**.
- Flows declared inside a lane block are associated with that lane; use only when both source and target are within that lane.
- Message flows (`~~>`) **must** be declared at the top level. Placing them inside a pool or lane is a parse error.

---

## 5. Pool and Lane Blocks

### 5.1 Grammar

```
pool-block    ::= "pool" ID QUOTED-STRING "{" NEWLINE
                    lane-block*
                    (element-decl | flow-decl)*
                  "}" NEWLINE

lane-block    ::= "lane" ID QUOTED-STRING "{" NEWLINE
                    (element-decl | flow-decl)*
                  "}" NEWLINE
```

The opening `{` may appear on the same line as `pool` or `lane`, or on the following line.

### 5.2 Nesting Rules

- Pools cannot be nested inside other pools. This is a parse error.
- Lanes must be inside a pool block. A `lane` at the top level is a parse error.
- Lanes cannot be nested inside other lanes. This is a parse error.
- Nesting depth is therefore a maximum of two levels: pool → lane.

### 5.3 Structural Semantics

- Pools represent organizational units or swimlane participants.
- Lanes represent roles, departments, or systems within a pool.
- An element declared inside a lane is assigned `laneId` and `poolId` in the `BpmnDb`.
- An element declared inside a pool but outside a lane is assigned `poolId` only.
- Cross-lane flows should be declared in the pool block body (outside any lane), not inside a lane block.

---

## 6. Accessibility Directives

```
accTitle: Purchase Order Approval
accDescr: Manager reviews a purchase request and either approves or rejects it.
```

- `accTitle` becomes the SVG `<title>` element, referenced by `aria-labelledby`.
- `accDescr` becomes the SVG `<desc>` element.
- Both are optional but strongly recommended for accessibility compliance.
- Both must appear after `bpmn-beta` and before any element or pool declarations.

---

## 7. Complete Keyword Table

| Keyword | Category | v0.1 Status |
|---|---|---|
| `bpmn-beta` | Header | Required |
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
| `-->` | Sequence flow | Implemented |
| `-->:` | Conditional sequence flow | Implemented |
| `==>` | Default sequence flow | Implemented |
| `~~>` | Message flow | Experimental |
| `---` | Association | Planned — not parsed |
| `pool` | Structure | Experimental |
| `lane` | Structure | Experimental |
| `event:message` | Intermediate event | Specified — not yet parsed |
| `event:timer` | Intermediate event | Specified — not yet parsed |
| `event:error` | Error end event | Specified — not yet parsed |

---

## 8. Parser Error Conditions

The following conditions produce a thrown `Error` from `bpmn-parser.ts`:

| Condition | Error message pattern |
|---|---|
| Unexpected `}` with no open block | `unexpected } — no open block` |
| Nested pool inside a pool | `pools cannot be nested` |
| Lane declared outside a pool | `lane must be inside a pool block` |
| Nested lane inside a lane | `nested lanes are not supported` |
| Message flow inside a pool or lane block | `message flows (~~>) must be declared at the top level` |

Lines that do not match any known pattern are silently skipped by the current parser (no error thrown for unknown keywords). This means a misspelled keyword produces an orphan element — use the validation workflow to catch this.
