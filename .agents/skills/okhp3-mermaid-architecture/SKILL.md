---
name: okhp3-mermaid-architecture
description: System and solution architecture diagrams in Mermaid for technical audiences — C4 model (Context/Container/Component/Code), architecture-beta cloud/infrastructure diagrams, block diagrams, packet/protocol diagrams, service topology, and integration flows. Use when the user wants to diagram software architecture, infrastructure, deployments, service relationships, or "how systems connect." Always load okhp3-mermaid-core first for audience/type/theming.
---

# OKHP3 Mermaid Architecture

System/solution architecture vocabulary, loaded after `okhp3-mermaid-core`.

## C4 Layering

Context → Container → Component → Code. Each layer is typically a separate diagram (per core's splitting guidance), cross-referenced in `DIAGRAMS.md`. The same system at multiple zoom levels is a feature, not duplication — see `references/c4-patterns.md` for layer-by-layer guidance and what belongs at each zoom level.

## Architecture-beta Diagrams

The newer Mermaid architecture syntax (`architecture-beta`) for cloud/infrastructure: groups, services, edges with directional sides (L/R/T/B), junctions for layout control. See `references/architecture-beta.md` for syntax and the known layout limitations (siblings sharing logical position, fcose layout tuning via `idealEdgeLengthMultiplier`).

## Solution Patterns

Integration flows, service topology, data flow diagrams. See `references/solution-patterns.md`.

## Block & Packet Diagrams

For high-level system overviews (`block-beta`) and protocol/network-level detail (`packet-beta`), routed here from core's type matrix. Patterns TBD — Phase 2.

## Cross-diagram zoom coherence

When the same system appears at multiple C4 layers, each diagram should be independently valid (passes all 3 gates on its own) AND collectively coherent (container names match between Context and Container layers, etc.). This is a Gate 2 (semantic) check that spans multiple files — flag inconsistencies even though each individual diagram might pass its own Gate 2.
