# Known Limitations — bpmn-beta v0.1

> This document is intentionally honest. These limitations exist so that users and agents working with bpmn-beta can set accurate expectations and choose the right workarounds until the gaps close.

---

## 1. What bpmn-beta Is

bpmn-beta is a text-first BPMN DSL that targets the **BPMN 2.0 Descriptive Conformance Sub-Class** — the documentation-grade subset of BPMN 2.0.2 that covers events, tasks, gateways, sequence/message flows, pools, and lanes. It is intended for:

- Writing process diagrams as code in Git repositories
- Rendering BPMN-shaped SVG wherever Mermaid renders (GitHub, Notion, Obsidian, GitLab, VS Code, Mintlify, ReadMe)
- Generating diagrams via LLMs without syntax repair loops

bpmn-beta is **not** intended for:

- Executable BPMN (no expressions, no service task implementations, no boundary event compensation semantics in execution form)
- Round-tripping to or from BPMN 2.0 XML
- Governance, audit, or handoff to BPM execution engines (use bpmn-js, Camunda, or Signavio for that)

---

## 2. Parser Limitations (v0.1)

### 2.1 Hand-Written Stack-Based Parser

The v0.1 parser (`bpmn-parser.ts`) is a line-by-line regex-based parser with a block context stack. It is not a formal grammar (no JISON, no Langium). This means:

- **Unknown keywords are silently skipped.** A misspelled `task:user` written as `task:uses` produces no parse error — it simply creates no element. This can produce orphan flows that reference a non-existent ID. Run the validation workflow to catch this.
- **No syntax highlighting support.** Without a formal grammar, there is no language server protocol (LSP) integration for editor highlighting or autocompletion.
- **Error messages are minimal.** The parser throws on structural errors (nested pools, unclosed blocks, misplaced message flows) but not on element-level mistakes.

### 2.2 Intermediate Event Subtypes Not Yet Parsed

The following keywords are defined in the DSL specification but are **not** matched by the v0.1 parser:

| Keyword | Intended Element | Workaround |
|---|---|---|
| `event:message` | Message Intermediate Catch Event | Use `task:receive "[label]"` |
| `event:timer` | Timer Intermediate Catch Event | Use `task:service "Wait: [duration]"` |
| `event:error` | Error End Event | Use `end "[Error: reason]"` |

**Do not generate these keywords.** The parser will silently skip the element declaration, leaving the ID undefined. Any flow referencing that ID will produce an orphan in the rendered SVG.

### 2.3 Association Flow Not Yet Parsed

The `---` association operator is planned but not matched by the parser. Do not generate it.

---

## 3. Renderer Limitations (v0.1)

### 3.1 Pool and Lane Rendering is Experimental

Pool and lane layout uses a separate layout path in `bpmn-layout.ts`. Known issues:

- **Cross-lane flow routing is approximate.** Edge paths between nodes in different lanes may overlap label text or take non-ideal routes.
- **Message flow routing between pools is approximate.** The `~~>` dashed arrow may not follow the conventional BPMN convention of routing between pool boundaries.
- **Lane width is not automatically equalized.** Lanes with many elements may render wider than lanes with few elements; there is no automatic equalization in v0.1.
- **Nested pool/lane structures of more than 5 lanes** are not tested and may produce layout collisions.

### 3.2 Task Markers are SVG Approximations

Task type markers (person, gear, scroll, envelope) are hand-drawn SVG paths inside the task rectangle. They are visual approximations of the BPMN 2.0.2 specified markers. They may not match the exact icon proportions or positions of commercial BPMN tools (Camunda, Signavio, bpmn.io).

### 3.3 No Collision Detection

The flat auto-layout mode (`layoutGraph` in `bpmn-layout.ts`) uses a grid-based placement. Diagrams with branching gateways and many reconnecting paths may have edge crossings that a proper dagre/ELK layout would avoid. This will be addressed in the planned Langium grammar phase.

---

## 4. DSL Scope Limitations

### 4.1 BPMN Elements Not Representable in v0.1

The following BPMN 2.0 Descriptive Conformance elements have no bpmn-beta keyword yet:

| BPMN Element | Status |
|---|---|
| None Intermediate Catch/Throw Event | Unspecified |
| Message Start Event | Unspecified |
| Terminate End Event | Unspecified |
| Manual Task | Out of scope |
| Business Rule Task | Out of scope |
| Call Activity | Out of scope |
| Event-Based Gateway | Out of scope |
| Data Object | Out of scope |
| Data Store | Out of scope |
| Text Annotation / Association | Planned (`---`) |
| Group | Out of scope |
| Participant (Black-Box Pool) | Out of scope |

### 4.2 No BPMN XML Round-Trip

bpmn-beta does not import or export BPMN 2.0 XML. There is no converter between bpmn-beta syntax and the `.bpmn` file format used by Camunda, Flowable, or Signavio. This is a meaningful gap for users who need interchange with BPM execution engines. It is noted as a potential future commercial wedge in the project roadmap.

### 4.3 No Formal Conformance Testing

bpmn-beta has not been submitted to the OMG BPMN 2.0 conformance test suite. The "Descriptive Conformance" framing is aspirational — the project targets that subset but does not yet have formal certification.

---

## 5. Single-Maintainer Risk

bpmn-beta is a solo open-source project. The bus factor is 1. There are no production adoption metrics, no npm package yet, and no funded organization behind it. Users should treat v0.1 as a prototype and not build critical production workflows around it until the project reaches a more stable state (post-npm-publication milestone).

---

## 6. Parallel Proposal

A parallel BPMN proposal for Mermaid exists: [mermaid-js/mermaid#7699](https://github.com/mermaid-js/mermaid/issues/7699) (Andreas Emrich, DFKI Saarbrücken, filed May 2026). The Mermaid maintainers have not yet engaged with either proposal. The eventual upstream decision is the maintainers' to make. bpmn-beta's syntax and the DFKI #7699 syntax differ materially in verbosity and idiom — this is intentional, not accidental.

---

## 7. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1.0 | May 2026 | Initial prototype — flat layout + pool/lane experimental layout; hand-written SVG renderer |
