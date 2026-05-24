# bpmn-beta DSL Reference — Formal Grammar Specification

> **Version:** 0.1.0  
> **Stability:** Unstable — syntax may change before npm publication  
> **Parser source:** `artifacts/mermaid-diagram-bpmn/src/lib/bpmn-parser.ts`

---

## 1. Lexical Conventions

### 1.1 Encoding and Line Handling

- UTF-8 source files.
- Lines are split on `\n`. Each line is trimmed of leading/trailing whitespace before matching.
- Empty lines and whitespace-only lines are ignored.
- Token order within a line is significant.

### 1.2 Comments

Lines beginning with `%%` (after trimming) are comments and are ignored:

```
%% This is a comment and will not be parsed
```

Mermaid init directives use the same sigil and are also skipped by the BPMN parser body:

```
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#0d4f6c' } }}%%
```

### 1.3 Identifiers

**Pattern:** `[A-Za-z][A-Za-z0-9_]*`

Rules:
- Must begin with a letter (upper or lower case)
- May contain letters, digits, and underscores
- **No hyphens** — the parser regex does not match hyphens in IDs
- **No spaces**
- Must be unique within the entire diagram

Recommended conventions:

| Role | Convention | Examples |
|---|---|---|
| Start events | `s` + number, or semantic | `s1`, `start_request` |
| End events | `e` + number, or semantic | `e1`, `end_approved` |
| Tasks | `t` + number, or semantic verb | `t1`, `review`, `approve` |
| Gateways | `g` + number, or semantic condition | `g1`, `approved`, `threshold` |
| Intermediate events | `ev` + number | `ev1`, `ev2` |
| Pools | `p` + number, or semantic | `p1`, `buyer`, `vendor` |
| Lanes | `l` + number, or semantic role | `l1`, `hr`, `manager`, `it` |

### 1.4 Labels

All labels must be double-quoted strings:

```
"My Label Text"
```

- May contain spaces, punctuation, and Unicode
- Must not contain unescaped double-quote characters
- The parser regex captures everything between `"` and `"` on the same line

### 1.5 Reserved Words

The following words must not be used as element IDs:

`pool`, `lane`, `start`, `end`, `task`, `xor`, `and`, `or`, `event`

---

## 2. Diagram Header (BNF)

```bnf
diagram        ::= init-block? NEWLINE? "bpmn-beta" NEWLINE metadata* statement*

init-block     ::= "%%{" init-content "}%%"
metadata       ::= acc-title | acc-descr
acc-title      ::= "accTitle:" SP text NEWLINE
acc-descr      ::= "accDescr:" SP text NEWLINE
text           ::= [^\n]+
SP             ::= " "+
NEWLINE        ::= "\n"
```

The literal string `bpmn-beta` must be the first non-comment, non-empty, non-init-block line.

---

## 3. Element Declarations (BNF)

```bnf
statement      ::= element-decl | flow-decl | pool-block | COMMENT | NEWLINE

element-decl   ::= keyword SP id SP quoted-label NEWLINE

keyword        ::= event-kw | task-kw | gateway-kw
event-kw       ::= "start" | "end"
                 | "event:message" | "event:timer" | "event:error"   (* experimental *)
task-kw        ::= "task" | "task:user" | "task:service"
                 | "task:script" | "task:receive" | "task:send"
gateway-kw     ::= "xor" | "and" | "or"

id             ::= [A-Za-z][A-Za-z0-9_]*
quoted-label   ::= '"' [^"]* '"'
```

### 3.1 Event Elements

| Keyword | BPMN 2.0.2 Element | Visual Shape | v0.1 Parser |
|---|---|---|---|
| `start` | None Start Event | Thin circle | ✓ Implemented |
| `end` | None End Event | Thick circle | ✓ Implemented |
| `event:message` | Message Intermediate Catch Event | Circle + envelope | ⚠ Experimental |
| `event:timer` | Timer Intermediate Catch Event | Circle + clock | ⚠ Experimental |
| `event:error` | Error End Event | Thick circle + lightning | ⚠ Experimental |

### 3.2 Task Elements

| Keyword | BPMN 2.0.2 Element | Visual Marker | v0.1 Parser |
|---|---|---|---|
| `task` | Abstract Task | None | ✓ Implemented |
| `task:user` | User Task | Person (top-left) | ✓ Implemented |
| `task:service` | Service Task | Gear (top-left) | ✓ Implemented |
| `task:script` | Script Task | Scroll (top-left) | ✓ Implemented |
| `task:receive` | Receive Task | Envelope (top-left) | ✓ Implemented |
| `task:send` | Send Task | Filled envelope (top-left) | ✓ Implemented |

### 3.3 Gateway Elements

| Keyword | BPMN 2.0.2 Element | Diamond Marker | Routing |
|---|---|---|---|
| `xor` | Exclusive (Data-Based) Gateway | X | Exactly one path |
| `and` | Parallel Gateway | + | All paths simultaneously |
| `or` | Inclusive Gateway | Circle | One or more paths |

---

## 4. Flow Declarations (BNF)

```bnf
flow-decl      ::= seq-flow | cond-flow | default-flow | msg-flow

seq-flow       ::= id SP "-->" SP id NEWLINE
cond-flow      ::= id SP "-->" SP id ":" SP quoted-label NEWLINE
default-flow   ::= id SP "==>" SP id NEWLINE
msg-flow       ::= id SP "~~>" SP id NEWLINE
               |   id SP "~~>" SP id ":" SP quoted-label NEWLINE
```

### 4.1 Flow Types

| Operator | BPMN 2.0.2 Type | Label | Constraints |
|---|---|---|---|
| `-->` | Sequence flow | Optional | Within a pool |
| `-->` + `:` + label | Conditional sequence flow | Required | Within a pool |
| `==>` | Default sequence flow | None | Source must be a gateway |
| `~~>` | Message flow | Optional | **Top-level only** |

### 4.2 Flow Placement Rules

| Placement | When to use |
|---|---|
| Top-level (outside all pools) | Flat diagrams; message flows between pools (always) |
| Pool body (inside pool, outside lane) | **Preferred for cross-lane flows** |
| Lane body | Only when both source and target are inside that lane |

**Critical rule:** Message flows (`~~>`) **must** be at the top level. Declaring `~~>` inside a pool or lane block throws a parse error.

---

## 5. Pool and Lane Blocks (BNF)

```bnf
pool-block     ::= "pool" SP id SP quoted-label SP? "{"? NEWLINE
                   lane-block*
                   (element-decl | flow-decl | COMMENT | NEWLINE)*
                   "}" NEWLINE

lane-block     ::= "lane" SP id SP quoted-label SP? "{"? NEWLINE
                   (element-decl | flow-decl | COMMENT | NEWLINE)*
                   "}" NEWLINE
```

The opening `{` may appear on the same line as `pool`/`lane` or on the next line.

### 5.1 Nesting Rules

| Rule | Enforced by parser |
|---|---|
| Pools cannot be nested inside pools | ✓ Error thrown |
| Lanes must be inside a pool | ✓ Error thrown |
| Lanes cannot be nested inside lanes | ✓ Error thrown |
| Maximum nesting depth: pool → lane | ✓ |

---

## 6. Complete Keyword Table

| Keyword | Category | Syntax | v0.1 Status |
|---|---|---|---|
| `bpmn-beta` | Header | First line | Required |
| `accTitle:` | Accessibility | `accTitle: text` | Implemented |
| `accDescr:` | Accessibility | `accDescr: text` | Implemented |
| `start` | Event | `start id "label"` | Implemented |
| `end` | Event | `end id "label"` | Implemented |
| `event:message` | Event | `event:message id "label"` | Experimental |
| `event:timer` | Event | `event:timer id "label"` | Experimental |
| `event:error` | Event | `event:error id "label"` | Experimental |
| `task` | Task | `task id "label"` | Implemented |
| `task:user` | Task | `task:user id "label"` | Implemented |
| `task:service` | Task | `task:service id "label"` | Implemented |
| `task:script` | Task | `task:script id "label"` | Implemented |
| `task:receive` | Task | `task:receive id "label"` | Implemented |
| `task:send` | Task | `task:send id "label"` | Implemented |
| `xor` | Gateway | `xor id "label"` | Implemented |
| `and` | Gateway | `and id "label"` | Implemented |
| `or` | Gateway | `or id "label"` | Implemented |
| `-->` | Sequence flow | `id --> id` or `id --> id: "label"` | Implemented |
| `==>` | Default flow | `id ==> id` | Implemented |
| `~~>` | Message flow | `id ~~> id` | Experimental |
| `---` | Association | `id --- id` | Planned |
| `pool` | Structure | `pool id "label" { ... }` | Experimental |
| `lane` | Structure | `lane id "label" { ... }` | Experimental |

---

## 7. Full Annotated Example

This example covers all supported implemented elements:

```
bpmn-beta
accTitle: Vendor Onboarding Process
accDescr: Procurement submits vendor request; Legal reviews; Finance approves and sets up payment; system notifies vendor.

pool onboard "Vendor Onboarding" {

  lane proc "Procurement" {
    start s1 "Vendor Request Submitted"
    task:user t1 "Complete Vendor Form"
    task:user t6 "Notify Requester: Rejected"
    end e2 "Request Rejected"
  }

  lane legal "Legal" {
    task:user t2 "Review Vendor Agreement"
    xor g1 "Approved?"
  }

  lane finance "Finance" {
    and g2 "Parallel Setup"
    task:service t3 "Create Vendor Account"
    task:script t4 "Configure Payment Terms"
    and g3 "Setup Complete"
    task:service t5 "Send Vendor Welcome Email"
    end e1 "Vendor Onboarded"
  }

  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> g2: "yes"
  g1 --> t6: "no"
  g2 --> t3
  g2 --> t4
  t3 --> g3
  t4 --> g3
  g3 --> t5
  t5 --> e1
  t6 --> e2
}
```

**What this demonstrates:**
- `accTitle` and `accDescr` accessibility directives
- Three lanes inside one pool
- XOR gateway with two labeled outgoing flows
- AND split → parallel tasks → AND join
- Cross-lane flows declared in pool body
- Two end events (approved path and rejection path)
- All cross-lane flows outside lane blocks

---

## 8. Parser Error Reference

| Error Condition | Message Pattern |
|---|---|
| Unexpected `}` with no open block | `unexpected } — no open block` |
| Pool inside pool | `pools cannot be nested` |
| Lane outside pool | `lane must be inside a pool block` |
| Lane inside lane | `nested lanes are not supported` |
| `~~>` inside pool/lane block | `message flows (~~>) must be declared at the top level` |
