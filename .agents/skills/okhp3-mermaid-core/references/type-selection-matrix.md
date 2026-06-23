# Mermaid Type Selection Matrix

All 27 diagram types listed in the Mermaid Live Editor as of v11.15.0. Status column needs a verification pass against current mermaid-js release notes as part of Phase 1 authoring — entries marked "confirm" are based on conversation-time research and may have changed status by the time this is authored in full.

| Type | Mermaid status | OKHP3 disposition |
|---|---|---|
| Flowchart | Stable | Core. Default for fan-out/convergence/general process |
| Sequence | Stable | Core, also bpmn-relevant for interaction-heavy processes |
| Class | Stable | Routed → `okhp3-mermaid-data` |
| State | Stable | Core. State machines, lifecycle, also bpmn-relevant |
| ER (Entity Relationship) | Stable | Routed → `okhp3-mermaid-data` |
| Gantt | Stable | Core. NOT excluded — legitimate for process timelines despite some community skills excluding it |
| Pie | Stable | **Excluded.** No structural argument capability |
| Git Graph | Stable | **Excluded.** Out of scope for enterprise process work |
| User Journey | Stable | Core/bpmn. NOT excluded — has real enterprise service-design use cases |
| C4 | Stable (confirm exact version) | Routed → `okhp3-mermaid-architecture` |
| Mindmap | Stable | Core. Hierarchy/tree pattern |
| Timeline | Stable | Core. Ordered events |
| Quadrant | Stable (confirm) | Core. TBD — prioritization-matrix disposition needs review |
| Requirement | Stable (confirm) | TBD — likely `okhp3-mermaid-data`, needs review |
| Sankey | Beta (confirm current status) | Core. Flow volumes / resource allocation |
| XY Chart | Beta (`xychart-beta`) | **Excluded.** Quantitative charting, not structural diagramming |
| Block | Beta (`block-beta`) | Routed → `okhp3-mermaid-architecture` |
| Architecture | Beta (`architecture-beta`, v11.1.0+) | Routed → `okhp3-mermaid-architecture` |
| Packet | Beta (`packet-beta`, v11.0.0+) | Routed → `okhp3-mermaid-architecture`. Protocol/network detail |
| Kanban | Stable (confirm) | TBD — bpmn (workflow stages) vs core, needs review |
| ZenUML | Stable (separate package, confirm) | TBD — likely `okhp3-mermaid-architecture` |
| Treemap | Newer (confirm status) | TBD — likely `okhp3-mermaid-data` |
| Ishikawa | Beta (`ishikawa-beta`, v11.12.3+) | TBD — fishbone/root-cause is process-adjacent, candidate for `okhp3-mermaid-bpmn` |
| Venn | Beta (`venn-beta`, v11.13.0) | Core. General comparison/overlap |
| Radar | Newer (confirm status) | TBD — capability/skill comparison, likely core |
| TreeView | Newer (confirm status) | TBD — likely `okhp3-mermaid-data` |
| Wardley Maps | Newer (confirm status) | TBD — strategic/value-chain, candidate for `okhp3-mermaid-architecture` |

## Maintenance

This table is a living artifact. As Mermaid ships new versions, re-check this list. The original gap analysis found community skills covering 9-11 of the (then) 27 types, almost entirely the "Stable, pre-2025" rows. The beta/newer rows are the least-covered territory and the most likely source of future OKHP3 differentiation.
