# OKHP3 Mermaid Design System

Single source of truth for theming. Every diagram produced by this skill family uses these palettes via `classDef` — never raw Mermaid defaults.

## Source

Palette definitions originate in `OKHP3/mermaid-theme-builder` (the standalone visual theme builder). This file currently documents palette NAMES and the dark/light requirement. Extracting the actual hex values and converting them to `classDef` recipes is a Phase 1 task — see TODO below.

## Available palettes (from mermaid-theme-builder)

- **Ocean Depth**
- **Forest Sage**
- **Slate Ember**
- **Violet Mist**

Each needs a semantic mapping (trigger / success / error / ai / decision / primary / secondary — the semantic role names, not just raw colors) before it's usable as a `classDef` library here.

## Non-negotiable rule

Every `classDef` declaration sets `fill`, `stroke`, AND `color`. Omitting `color` is the single most common cause of dark-mode/light-mode rendering failures across the community skills reviewed during the gap analysis. No exceptions, no "it looks fine on my screen."

```
classDef primary fill:#5b21b6,stroke:#ddd6fe,stroke-width:2px,color:#fff
```//`color` here is mandatory, not optional.

## Subgraph styling

Set subgraph `fill:none` so subgraphs adapt to the viewer's background rather than fighting it.

## TODO (Phase 1)

1. Pull the 4 palette definitions (hex values) from `mermaid-theme-builder`'s `lib/` directory.
2. Map each palette to the semantic roles above.
3. Produce one `classDef` block per palette, validated in both light and dark GitHub rendering.
4. Decide: one default palette for all OKHP3 output, or palette-per-family (e.g., bpmn diagrams use one, architecture diagrams use another)?
