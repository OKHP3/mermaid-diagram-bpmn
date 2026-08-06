# Validation Summary

Reviewed: 2026-07-21

This Claude package contains three platform-specific extraction evals with
four evidence-anchored expectations each, plus ten positive and ten near-miss
activation queries. Its package structure passes the official Agent Skills
reference validator and the bundled package validator.

The deterministic template, contract, depth profiles, evidence map, writer, and
package validator are synchronized byte-for-byte with the generic 2.0.0 core.
That shared core passed 12 of 12 selected assertions after the rapid compactness
fix, compared with 8 of 12 for the pre-2.0.0 baseline. See the generic package's
`evals/benchmark.md` for the measured comparison.

The shared-core benchmark is not presented as a platform-specific live score.
The Claude parsing rules remain covered by this package's platform eval
scenarios and current first-party evidence reference.
