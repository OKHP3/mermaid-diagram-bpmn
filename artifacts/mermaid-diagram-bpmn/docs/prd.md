# PRD: bpmn-beta Diagram Type

| Field | Value |
|---|---|
| Doc owner | Jamie Hill (OverKill Hill P³) |
| Status | Draft v0.3 |
| Last reviewed | 2026-05-05 |

---

## 1. Background

Mermaid is a JavaScript-based diagramming library that renders Markdown-flavored text into SVG diagrams. BPMN 2.0 is an OMG standard (also published as ISO/IEC 19510) used to describe business processes.

Mermaid does not currently support BPMN. This document captures the formal product requirements for closing that gap with a Mermaid-native `bpmn-beta` diagram type.

---

## 2. Problem statement

Practitioners who need BPMN process diagrams currently choose between heavyweight tools (Visio, Signavio, Bizagi, Camunda Modeler, bpmn.io) and lightweight Mermaid flowcharts that resemble BPMN but lack semantic correctness.

Neither option is good for documentation that needs to live in version control, render in Markdown, sit alongside code in repositories, or get authored by AI agents.

---

## 3. Goals (v1)

- Provide a Mermaid-native `bpmn-beta` diagram type covering the BPMN 2.0 Descriptive Conformance subset.
- Maintain visual fidelity to standard BPMN notation.
- Author experience: readable to non-experts, writable without XML.
- Ship as External Diagram plugin first; upstream later.
- Pass Mermaid PR gates: tests, accessibility, theming, docs.

---

## 4. Non-goals (v1)

- Full BPMN 2.0 specification coverage.
- BPMN XML import/export.
- Executable BPMN semantics.
- Choreography / conversation diagrams.
- Boundary events, event subprocesses, transactions.
- Multi-instance markers, compensation.
- Data objects/stores/groups.
- Nested lanes deeper than one level.

---

## 5. Target personas

| Persona | Need | Success looks like |
|---|---|---|
| Enterprise architect | Document processes next to system designs in the same repo | Single `.mmd` file renders in GitHub/VS Code |
| Process analyst | Author BPMN without XML or heavyweight tools | Writes 20 lines of DSL, gets correct shapes |
| Developer | Embed process docs in code repos | Renders in README; no build step |
| AI prompt author | Generate process diagrams from natural language | Valid `bpmn-beta` on first try; clear errors |

---

## 6. Functional requirements summary

Element-level details are in the [DSL Specification](./dsl-spec.md).

**Core elements (v1 in scope):**
- Events: start, end
- Tasks: generic, user, service, script, receive, send
- Gateways: exclusive (XOR), parallel (AND), inclusive (OR)
- Flows: sequence, conditional sequence, default sequence, message
- Pools and one-level lanes
- Accessibility: `accTitle`, `accDescr`
- Directives: Mermaid-standard frontmatter

---

## 7. Non-functional requirements

| NFR | Target | Why |
|---|---|---|
| Plugin size | < 200 KB min+gzip | Maintainer acceptance bar |
| Accessibility | `accTitle`/`accDescr` + ARIA metadata | Mermaid contribution requirement |
| Theme integration | Honors Mermaid theme variables | Consistency |
| Test coverage | Parser + renderer + corpus tests | PR gate |
| No runtime deps | No bpmn-js, no heavy XML parsers | Bundle size and license hygiene |

---

## 8. Success metrics

- At least 5 canonical example diagrams render correctly without errors.
- Parser round-trips: all canonical examples produce the same AST on re-parse.
- Accessibility: each SVG output includes `role="img"`, `aria-labelledby`, `<title>`, `<desc>`.
- Theme: diagram respects `--primary-color`, `--line-color`, `--node-border` Mermaid theme variables.
- Test pass: `pnpm test` green on all corpus fixtures.
