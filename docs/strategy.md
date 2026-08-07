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

## OKHP³ Visual Language Stack

BPMN for Mermaid is one component of the OKHP³ Visual Language Stack — a set of complementary tools that together take a raw process idea all the way to a styled, documented, published artifact.

```text
ReFolDec                   — recursive fold/unfold transformation theory
  └─ BPMN for Mermaid      — process-structure and notation layer  ◄ this project
       └─ Mermaid Theme Builder  — visual governance, renderer profiles, palette contracts
skillz / BP-SKILL          — executable agent workflows for the full process lifecycle
OverKill Hill              — public narrative and routing surface
```

### Role of BPMN for Mermaid in the stack

BPMN for Mermaid is the **process-structure and notation layer**. It formalizes process intent — captured through conversation, analysis, or AI elicitation — into a text-first, Git-native, Mermaid-compatible model. It does not own:

- Style decisions, color palettes, or renderer visual profiles (Mermaid Theme Builder)
- Executable agent instruction sets or reusable workflow prompts (skillz / BP-SKILL)
- The public narrative, routing, or cross-project story (OverKill Hill)

### Relationship to ReFolDec

ReFolDec is the recursive folding/unfolding transformation grammar that underpins the OKHP³ stack. BPMN for Mermaid is a concrete instance of this theory: process ideas are *folded* into structured `bpmn-beta` notation and *unfolded* into diagrams, documentation, and downstream artifacts. The DSL keyword, the `BpmnDb` data model, and the layout/renderer pipeline are all expressions of a fold-then-unfold transformation.

### Relationship to Mermaid Theme Builder

Mermaid Theme Builder handles the visual-governance contract that BPMN for Mermaid produces diagrams for. Responsibilities are strictly separated:

| This project | Mermaid Theme Builder |
|---|---|
| Process semantics — what the diagram means | Visual governance — how the diagram looks |
| BPMN notation correctness | Renderer profile, palette, and style tokens |
| `bpmn-beta` DSL and `BpmnDb` data model | Semantic color contracts and theme variables |
| Diagram structure output | Style-preserving update, syntax repair, export |

### Relationship to skillz / BP-SKILL

BP-SKILL is the skillz layer for this stack: 15 portable SKILL.md agent workflows covering the full business process documentation lifecycle. The skills do the human-in-the-loop work — elicitation, narrative authoring, gap analysis, governance, publication — and produce `PNS.md` (Process Narrative Specification) as the central handoff. `okhp3-visual-process-modeling` (skill 06) is the bridge that converts a completed PNS into `bpmn-beta` syntax.

### PathScrib-R / Flowpilot Scribbler lineage

Earlier experiments under the names PathScrib-R, Path Scribbler, and Flowpilot Scribbler explored conversational process discovery and Mermaid diagram generation. These custom declarative-agent-like instruction sets informed the process-to-Mermaid workflow that BPMN for Mermaid formalizes. Their public story lives on OverKill Hill; this repository contains only the formalized result.

### Process lifecycle

The end-to-end flow the stack is designed to support:

```text
1. Raw process idea
2. Guided capture (skillz elicitation)
3. Process narrative (PNS.md)
4. Structured model (BpmnDb)
5. bpmn-beta syntax
6. Mermaid diagram (SVG output)
7. Visual governance (Mermaid Theme Builder styling)
8. Publication and documentation (skillz packaging)
```

Each step is owned by a distinct layer. BPMN for Mermaid owns steps 4–6.

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

BP-SKILL is a lifecycle-complete, standards-conformant business process agent skill suite built on the SKILL.md format. It targets practitioners who use AI agents for business analysis work — BAs, process consultants, operations analysts — and want a portable, platform-agnostic instruction set that aligns to standards they already work with (BABOK v3, BPM CBOK v4.0, ISO 9001:2015).

**BABOK skill landscape — re-verified 2026-08-07:**

The SKILL.md ecosystem has grown significantly since the project's initial positioning memo. Cross-agent registries report 93,000–164,000+ SKILL.md-format files as of August 2026 (GuildSkills: 164,000+ total / 93,000+ quality-filtered; OpenAgentSkill: 20,876 curated). Note: `agentskills.io` is the open standard specification site, not a searchable skill directory — the 89,000+ figure in earlier strategy drafts referred to skills across GitHub-indexed registries, not an agentskills.io internal catalog.

At least two BABOK-implementing skill packages exist in public repositories as of 2026-08-07:

| Package | BABOK coverage | Created | Stars | Notes |
|---|---|---|---|---|
| `s1dd4rth/babok` | All 6 knowledge areas, 50 techniques, 5 perspectives | 2026-04-29 | 0 | MIT; single comprehensive skill file |
| `majiayu000/claude-skill-registry-data/business/ba-orchestration` | 14 techniques across strategic analysis, problem solving, planning, design | Unknown | N/A | Part of a multi-skill data repo |

The prior claim “Zero implement a BABOK knowledge area” is no longer accurate and must not appear in any external post or issue comment. Neither package has measurable adoption as of the check date.

**BP-SKILL’s defensible differentiation** is not uniqueness in the BABOK space but completeness and integration: 15 skills covering the full process lifecycle from elicitation through publication, the PNS handoff artifact as a structured interchange between lifecycle stages, and direct integration with the `bpmn-beta` diagram type via `okhp3-visual-process-modeling`. No comparable lifecycle-complete, BPMN-integrated business process skill suite has been identified in public registries as of 2026-08-07.

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
