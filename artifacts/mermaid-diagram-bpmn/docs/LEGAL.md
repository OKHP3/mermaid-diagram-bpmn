# Legal Notes — BPMN for Mermaid

**Owner:** OverKill Hill P³ / Jamie Hill
**Status:** Internal reference — plain-language summary, not legal advice

This document explains the legal and standards context for the `bpmn-beta` DSL, the BPMN 2.0 descriptive subset claim, and the relationship to the OMG specification.

---

## Disclaimer

This document is a plain-language summary for internal project governance. It is not legal advice. If you need legal advice, consult a licensed attorney.

---

## 1. Relationship to the OMG BPMN 2.0.2 specification

BPMN 2.0.2 is a standard published by the Object Management Group (OMG) (document formal/2013-12-09) and also published as ISO/IEC 19510:2013.

**Official specification links:**
- Standard home: https://www.bpmn.org/
- OMG specification page: https://www.omg.org/spec/BPMN/
- BPMN 2.0.2 PDF: https://www.omg.org/spec/BPMN/2.0.2/PDF
- Original OMG document: http://www.omg.org/cgi-bin/doc?dtc/10-06-02

A copy of the specification PDF is included in this repository at `standards/OMG-BPMN-2.0.2-formal-specification.pdf`. OMG publishes its specifications for free public use; including a copy here is consistent with their standard distribution policy and provides an offline reference for contributors and AI agents working in this codebase.

**BPMN for Mermaid targets the Descriptive Conformance Sub-Class** defined in BPMN 2.0.2 Section 2.1. This is the subset intended for human-readable process documentation. It does not implement BPMN execution semantics, choreography, or conversation diagrams.

Rendered elements (shapes, markers, flow lines) are required to conform to the notation defined in the specification. See `standards/BPMN-SPEC-REFERENCE.md` for the section-by-section compliance map.

Use of BPMN element names and notation (start event, end event, gateway, task, lane, pool, sequence flow, message flow) does not require a license from OMG. These are standardized vocabulary terms describing a shared diagramming notation. Their use in a diagram rendering tool does not constitute publication of the standard itself.

---

## 2. "bpmn-beta" keyword and name

The DSL keyword `bpmn-beta` is original to this project. "BPMN" as a term is widely used in technical literature and is not a trademark owned by OMG or any single company. The name "BPMN for Mermaid" describes the tool's purpose and relationship to the Mermaid ecosystem; it is not a claim of official affiliation.

---

## 3. Relationship to Mermaid

This project uses Mermaid's public `registerExternalDiagrams()` API to register the `bpmn-beta` diagram type as a third-party plugin. It does not fork, copy, or redistribute Mermaid source code.

The Mermaid library is published under the MIT License. Use of its public API does not require affiliation with or approval from the Mermaid maintainers.

---

## 4. No affiliation disclaimer

The canonical disclaimer for this project:

> BPMN for Mermaid is a personal OverKill Hill P³ project by Jamie Hill. It is not affiliated with the mermaid-js maintainers, Mermaid Chart, Mermaid.ai, the Object Management Group (OMG), ISO, or any standards body. It implements a documented descriptive subset of BPMN 2.0 and does not claim full BPMN 2.0 compliance.

This disclaimer must appear in the README and all major public-facing documentation.

---

## 5. MIT License

BPMN for Mermaid is published under the MIT License. See `LICENSE`.

Contributions are accepted under the same license. By submitting a pull request, contributors agree that their contribution is licensed under MIT.

---

## 6. Third-party dependencies

All direct dependencies are listed in `package.json`. Each is used under its respective open-source license. Key licenses:

| Package | License | Notes |
|---|---|---|
| React | MIT | Browser rendering |
| Vite | MIT | Build tooling |
| Tailwind CSS | MIT | Styling |
| Vitest | MIT | Test runner |

No GPL, LGPL, or copyleft dependencies are introduced. This preserves compatibility with downstream users who may need permissive licensing.
