# Scope Firewall — What Must Never Appear in Skill Output

> This document defines hard prohibitions. Any output from this skill that contains items in this list is a skill failure, not a usage edge case.

---

## 1. Prohibited Content

### 1.1 Employer-Owned or Proprietary Content

The following must never appear in any skill output, canonical examples, or reference material:

- Employer-owned process examples, terminology, internal workflows, or branding (no employer-specific content belongs in this open-source skill)
- Any employer-owned business process diagrams or workflow descriptions
- Internal system names, proprietary tool references, or confidential process details from any organization
- Descriptions of processes that were encountered in a workplace context

**Rationale:** This skill is MIT-licensed and intended for public, open-source use. Employer-owned content would violate intellectual property and confidentiality expectations.

### 1.2 False BPMN Conformance Claims

Never state or imply:

- "This diagram is fully BPMN 2.0 compliant"
- "This output conforms to BPMN 2.0 Analytic or Common Executable conformance"
- "This can be imported into Camunda/Flowable/Signavio/Zeebe"
- "This is executable BPMN"
- "This produces valid BPMN XML"

**Allowed:** "This diagram implements the BPMN 2.0 Descriptive Conformance subset using bpmn-beta syntax. It is not executable and does not produce BPMN XML."

### 1.3 BPMN XML Elements or Syntax

The following must never appear in any skill output:

BPMN XML tag patterns (these must not appear in output):
- Any tag beginning with `bpmn:` (e.g. bpmn colon-prefixed elements)
- Any tag beginning with `process` (XML process element)
- BPMN element tags: `startEvent`, `endEvent`, `sequenceFlow`, `userTask`, `exclusiveGateway`
- XML namespace declarations (the `xmlns` attribute family, e.g. namespace prefixes for bpmn, camunda, dc)

bpmn-beta is a Mermaid DSL, not an XML format. Any XML in skill output is a hallucination from another domain.

### 1.4 bpmn-js API References or Syntax

Never reference:

- `bpmn-js` library methods, APIs, or object models
- `BpmnModeler`, `BpmnViewer`, or `BpmnNavigatedViewer`
- BPMN moddle objects (`Shape`, `Connection`, `Label` from bpmn-js)
- The `*.bpmn` file format as a bpmn-beta output format

### 1.5 Hallucinated bpmn-beta Keywords

Never generate keywords that are not in the current DSL Reference. Known risk patterns:

| Hallucinated keyword | Correct keyword |
|---|---|
| `subprocess` | Not implemented — use a labeled task with a note |
| `callActivity` | Not implemented |
| `boundaryEvent` | Not implemented |
| `dataObject` | Not implemented |
| `annotation` | Not implemented (association `---` is planned) |
| `gateway` (bare) | Use `xor`, `and`, or `or` |
| `sequence` | Use `-->` operator |
| `message` (as element) | No element keyword; use `~~>` as flow operator |
| `participant` | No keyword; use `pool` |
| `event` (bare) | Use `start`, `end`, or `event:message`/`event:timer`/`event:error` |
| `task:manual` | Not implemented; use `task:user` |
| `task:businessRule` | Not implemented; use `task:service` |

### 1.6 Out-of-Scope Elements Presented as Supported

Never generate the following elements as if they were functional in bpmn-beta v0.1:

- Boundary events attached to tasks
- Compensation flows or compensation markers
- Data objects or data stores
- Choreography diagrams or choreography tasks
- Conversation diagrams
- Multi-instance markers
- Loop markers
- Transaction sub-processes

If a user requests one of these, explicitly state the limitation and offer the nearest valid approximation with a note explaining the difference.

---

## 2. Required Disclaimers

When generating diagrams that use experimental features, always include a brief note:

For `event:message`, `event:timer`, `event:error`:
> "Note: `[keyword]` is specified in the bpmn-beta DSL but not yet parsed by the v0.1 renderer. The diagram is valid DSL but may not render in the playground until a parser update. Substitute `[approximation]` for current rendering."

For pool/lane diagrams:
> "Note: Pool and lane rendering is experimental in bpmn-beta v0.1. Cross-lane flow routing may be approximate. Verify in the playground: https://okhp3.github.io/mermaid-diagram-bpmn/playground"

---

## 3. Quick Firewall Checklist

Before outputting any bpmn-beta diagram, verify:

- [ ] No employer-owned process content
- [ ] No BFS terminology or branding
- [ ] No BPMN XML (bpmn: tags, xml namespace declarations, process element tags)
- [ ] No bpmn-js API references
- [ ] No hallucinated keywords (only keywords from the DSL Reference)
- [ ] No claims of full BPMN 2.0 conformance or executability
- [ ] No out-of-scope elements presented as supported
