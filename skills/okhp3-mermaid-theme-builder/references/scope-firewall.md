# Scope Firewall — okhp3-mermaid-theme-builder

This skill is scoped to the public OverKill Hill P³ Mermaid Theme Builder project. The following rules govern what may and may not appear in skill outputs, scripts, assets, and references.

---

## In Scope

- The eight named palettes belonging to the Mermaid Theme Builder public project:
  - Thematic: Ocean Depth, Forest Sage, Slate Ember, Violet Mist
  - Brand: OKH P³, Glee-fully, AskJamie, Neutral Enterprise
- Public OverKill Hill P³ brand colors and design tokens
- Mermaid.js theming standards and themeVariables specification
- Public Mermaid renderer compatibility data (community-documented or from official Mermaid docs)
- bpmn-beta DSL produced by the `okhp3-bpmn-for-mermaid` skill (as a theming target)
- Generic Mermaid diagram examples for testing and fixtures (flowchart, sequence, class, state, gantt)
- MIT-licensed content from the public `OKHP3/mermaid-theme-builder` GitHub repository

---

## Out of Scope — Hard Exclusions

The following must never appear in any file within this skill package:

| Category | Examples | Rule |
|---|---|---|
| Employer-owned brand colors | Any color system from a current or former employer | Never include |
| Employer-owned examples | Diagrams depicting real employer processes or infrastructure | Never include |
| Employer references | Company names, product names, internal project names | Never include |
| Private color systems | Any palette not derived from the eight public OKHP3 palettes | Never include without explicit user instruction |
| BFS content | Any text, color, diagram, or identifier associated with "Builders FirstSource" | Never include |
| Confidential process flows | Any diagram depicting private business processes from non-public sources | Never include |

---

## Custom Palette Handling

When a user provides custom colors outside the eight named palettes:
- Derive the palette using only the mathematical rules in `references/palette-contract.md`
- Do not name the derived palette after any employer, client, or private entity unless the user explicitly names it
- Do not store custom palettes in `assets/palettes.json` — that file contains only the eight canonical palettes
- Treat custom palette derivations as session-local; do not persist them

---

## User-Provided Content

When a user provides a Mermaid diagram to theme:
- Apply theming without inspecting or commenting on the diagram's semantic content
- If the diagram appears to contain confidential or sensitive business information, apply theming and do not reproduce the diagram in any non-theming context
- The skill's job is to apply visual governance — not to analyze, store, or transmit diagram content

---

## Palette Name Attribution

The four brand palettes have named associations:
- **OKH P³** — OverKill Hill P³ brand (public)
- **Glee-fully** — Glee-fully product brand (public)
- **AskJamie** — AskJamie product brand (public)
- **Neutral Enterprise** — generic enterprise palette, no brand association

If a user asks about the brand behind Glee-fully or AskJamie beyond what is publicly documented at `overkillhill.com`, redirect to the public project page and do not speculate.

---

## Verification

Any output from this skill must pass the following checks before delivery:

1. Contains no literal string "Builders FirstSource" or "BFS" (except in this firewall document)
2. Contains no hex color values from employer-owned design systems (non-OKHP3 brands)
3. Contains no diagram content depicting private employer processes
4. Contains no employer company names or internal project identifiers
5. All palette names are drawn from the eight canonical palette names or are clearly labeled as user-derived custom palettes
