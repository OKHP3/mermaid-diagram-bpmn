# Schema Documentation Patterns

TOC for Phase 2 authoring.

## Documenting vs. designing
- [ ] When the diagram documents an EXISTING schema (research required — actual field names/types, per core's research step for technical diagrams) vs. designing a NEW one (more abstract acceptable)

## Drift management
- [ ] Schema diagrams are high-drift-risk (the schema changes, the diagram doesn't). DIAGRAMS.md registry entry should note "source of truth" — is this diagram generated from the schema, or hand-maintained? If hand-maintained, what's the re-validation cadence?

## Large schema splitting
- [ ] When a schema has 20+ entities — split by domain/bounded-context, one diagram per context, with a single "context map" diagram showing how the contexts relate
