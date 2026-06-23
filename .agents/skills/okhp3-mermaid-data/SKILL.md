---
name: okhp3-mermaid-data
description: Data model and relationship diagrams in Mermaid — entity-relationship (ER) diagrams, class diagrams, schema documentation. Use when the user wants to diagram a database schema, data model, object structure, class hierarchy, or entity relationships with cardinality. Always load okhp3-mermaid-core first for audience/type/theming.
---

# OKHP3 Mermaid Data

Data modeling vocabulary, loaded after `okhp3-mermaid-core`.

## ER Diagrams

Entity-relationship modeling with cardinality notation. See `references/erd-syntax.md` for entity/attribute syntax and cardinality conventions (one-to-one, one-to-many, many-to-many — exact notation and when PK/FK annotations are included vs. omitted for Executive/Analyst audiences).

## Class Diagrams

Object structure, relationships, methods. See `references/class-diagram-syntax.md`.

## Schema Documentation Patterns

When a diagram is documenting an existing schema (vs. designing a new one), see `references/schema-documentation-patterns.md` for how much of the real schema to surface at each audience tier — Technical gets full field lists and types, Analyst gets entity names and relationships only, Executive rarely needs this diagram type at all (flag if an Executive-tier ER diagram is requested; it may be the wrong type per core's type matrix).

## Cardinality Conventions

Consistent notation across all OKHP3 ER diagrams — defined once in `references/erd-syntax.md`, referenced rather than re-decided per diagram.
