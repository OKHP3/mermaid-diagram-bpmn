# BPMN for Mermaid — Strategy

This document is the canonical strategy record for the project. It replaces any external planning documents as the source of truth for positioning, thesis, and engagement decisions.

---

## Thesis

Mermaid has no BPMN diagram type. Business analysts, developers, and architects who document processes in Markdown-native tools must either use PlantUML (verbose, XML-flavored), bpmn.io (GUI-only, not plain-text), or draw.io (not version-controllable). A readable, Mermaid-native `bpmn-beta` diagram type covers 80–90% of real-world process documentation use cases without requiring knowledge of BPMN's execution model.

---

## Strategic positioning

### What this project is not

- It is not a full BPMN 2.0 implementation. Execution semantics, XML interchange, and BPMN choreography are out of scope.
- It is not a replacement for bpmn.io. It targets plain-text workflow documentation, not graphical modeling.
- It is not a fork of or competitor to Mermaid. It is a proposed extension to Mermaid.

### What this project is

- A Mermaid-native DSL (`bpmn-beta`) that is readable as plain text and renderable as SVG
- A reference implementation (parser + renderer + layout) built as a Mermaid external diagram plugin
- A 15-skill BP-SKILL agent suite that packages the full business process documentation lifecycle as portable SKILL.md files
- A contributor prototype designed to support a formal upstream Mermaid PR at V1.0

---

## Related Mermaid upstream issues

| Issue | Title | Relevance |
|---|---|---|
| [#7699](https://github.com/mermaid-js/mermaid/issues/7699) | BPMN support (Andreas Emrich, DFKI, 2026-05-02) | Primary upstream reference. Proposes a metadata-heavy DSL. Our `bpmn-beta` is a deliberately readable alternative. |
| [#2623](https://github.com/mermaid-js/mermaid/issues/2623) | BPMN diagram type request | Earlier community request; useful as evidence of demand. |
| [#660](https://github.com/mermaid-js/mermaid/issues/660) | Swimlane / pool support | Broader pool/lane request; relevant to our pool/lane syntax decisions. |

### Engagement strategy for Issue #7699

Andreas Emrich's proposal (issue #7699) uses a metadata-heavy DSL with type annotations on every node. Our `bpmn-beta` takes the opposite position: readability first, with type inferred from context where possible.

Engagement approach:
1. Do not publish a competing proposal before demonstrating a working prototype
2. Share the prototype link on issue #7699 once the external diagram plugin is wired (V0.6)
3. Frame the proposal as an alternative readable syntax, not a rejection of #7699's approach
4. Seek common ground on the BPMN element subset before locking syntax

---

## BP-SKILL positioning

BP-SKILL is the first standards-conformant, lifecycle-complete business process agent skill suite in the SKILL.md ecosystem. As of May 2026, the agentskills.io directory contains 89,000+ skills. Zero implement a BABOK knowledge area.

BP-SKILL targets practitioners who use AI agents for business analysis work — BAs, process consultants, operations analysts — and want a portable, platform-agnostic instruction set that aligns to standards they already work with (BABOK v3, BPM CBOK v4.0, ISO 9001:2015).

---

## Key decisions

| Decision | Rationale |
|---|---|
| No bpmn-js dependency | Avoids coupling to a heavyweight library with different design goals and a non-plain-text rendering model |
| `bpmn-beta` keyword only | "beta" belongs only in the DSL header keyword, not in the project name or documentation |
| Plugin-first path | Target `registerExternalDiagrams()` first; upstream core proposal comes after syntax stabilizes |
| Client-side only | No backend routes for diagram rendering; parser, layout, and renderer all run in the browser |
| Descriptive subset | Explicitly not full BPMN 2.0; MVP scope documented and deferred features named |
| BP-SKILL as repo content | The skill suite lives in the same repository as the DSL prototype; they share a GitHub release |
| SKILL.md as the format | Targets the agentskills.io open standard for portability across Claude Code, Cursor, VS Code, etc. |

---

## Contribution path summary

See the Roadmap page and `docs/version-checklist.md` for the full progression. The high-level arc:

1. Validate DSL syntax and rendering model (V0.1 — done)
2. Prove the BP-SKILL pipeline concept (V0.2–V0.3 — done)
3. Add content quality, interactivity, and validation tooling (V0.4–V0.5)
4. Wire the Mermaid external diagram API (V0.6)
5. Harden with a formal grammar and quality gates (V0.7–V0.8)
6. Engage community and prepare upstream PR (V0.9–V1.0)
