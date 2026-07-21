# Benchmark Summary

Reviewed: 2026-07-21

The generic skill was evaluated against its pre-2.0.0 snapshot in three clean
contexts: balanced rich-element extraction, rapid continuity, and comprehensive
adversarial export handling. Each eval used four evidence-anchored assertions.

| Configuration | Passed | Total | Pass rate |
|---|---:|---:|---:|
| Pre-2.0.0 baseline | 8 | 12 | 66.7% |
| 2.0.0 initial candidate | 11 | 12 | 91.7% |
| 2.0.0 after rapid compactness fix | 12 | 12 | 100% |

The initial candidate's only failure was rapid-mode compactness. Updated output
budget and information-density guidance reduced that artifact from 15,277 to
7,917 characters and from 1,806 to 898 measured words while preserving complete
coverage, the actionable handoff, and the rehydration result.

The final pass-rate delta over the baseline is +33.3 percentage points. This is
below the FoundRy aspirational +50 point target because the baseline already
contained strong depth, ledger, provenance, and source-independence behavior.
The remaining improvement is concentrated in auditable coverage, destination
references, action ownership, acceptance conditions, evidenced rehydration,
prompt-injection boundaries, and safer deterministic tooling.

Detailed outputs and grading evidence live in the sibling
`okhp3-thread-context-extraction-workspace/` evaluation workspace.
