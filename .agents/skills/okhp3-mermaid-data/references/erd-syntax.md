# ER Diagram Syntax & Cardinality Conventions

TOC for Phase 2 authoring.

## Entity/attribute syntax
- [ ] Mermaid `erDiagram` entity block syntax, attribute typing
- [ ] PK/FK annotation conventions — included for Technical, omitted for Analyst

## Cardinality notation
- [ ] One-to-one, one-to-many, many-to-many — exact Mermaid notation (`||--o{` etc.), pick OKHP3-standard and document so it's not re-decided per diagram
- [ ] Optional vs. mandatory relationships — notation for each

## Audience scaling
- [ ] Executive: when is an ER diagram even the right type? (Often it isn't — flag and suggest C4 Context or a simple flowchart instead)
- [ ] Analyst: entity names + relationships, no attribute lists
- [ ] Technical: full attribute lists with types
