# BP-SKILL Naming and Remaster Equilibrium Review

**Date:** 2026-08-29  
**Scope:** repository-local `skills/` packages in `mermaid-diagram-bpmn`  
**Decision:** approve local remaster with release limits

## Decision

The repository-local BP-SKILL set is structurally remastered for this working
tree. All 19 retained skill directories now use lowercase `okhp3-*` names,
match their `SKILL.md` frontmatter, and stay within the 36-character directory
limit. The 15 established process skills keep their stable names because they
already explain their purpose well enough to justify preserving their IDs.

Three adjacent names now describe the interchange path directly:

```text
okhp3-visual-process-modeling
  -> okhp3-bpmn-to-process-narrative
  -> okhp3-bpmn-recoverability-audit
  -> okhp3-elicitation-interviews
  -> okhp3-process-validation-scoring
```

`okhp3-bpmn-to-process-narrative` is the text-source reverse transformation.
`okhp3-bpmn-recoverability-audit` is the semantic boundary audit that prevents
diagram-derived text from being mistaken for elicited process truth. They are
complementary extensions, not renamed clones and not part of the 15-skill core
application catalog yet.

## Consolidations and remastering

- Retired the stale duplicate `okhp3-handoff-packaging`; the canonical terminal
  package is `okhp3-publication-handoff-packaging`.
- Renamed the ambiguous meta package `okhp3-process-capture` to
  `okhp3-recurring-task-capture`, matching its actual recurring-task and
  skill-skeleton purpose.
- Renamed the two extension packages to the more literal BPMN family names
  above and updated package metadata, references, fixtures, tests, and test
  orchestration.
- Added a validator naming gate for the `okhp3-` prefix and the 36-character
  repository directory limit.
- Made package-local frontmatter tests newline-tolerant on Windows.

## Maturation circuit evidence

The requested circuit was applied in order:

1. **Discovery:** repository-local discovery and foundry instructions were
   read first. Two discovery reference files named by the local discovery
   skill were not present in this checkout, so that gap remains disclosed.
2. **Foundry:** the two extension packages were brought to portable package
   shape with bounded descriptions, explicit scope, references, fixtures,
   tests, evaluation designs, provenance rules, and brand-standard footers.
3. **Equilibrium:** independent evidence, outcome, and safety/portability
   reviews examined naming, overlap, catalog scope, package identity, and
   release risk. The common decision was to preserve the strong existing names,
   resolve the duplicate handoff identity, use literal BPMN adjacency for the
   reverse pair, and defer public promotion until evidence and catalog scope
   are settled.
4. **Foundry remaster:** reviewer findings were applied, including the naming
   validator, newline portability fix, explicit extension status, and
   recoverability evaluation cases.
5. **Promotion:** local promotion tests pass, but no cross-repository copy,
   push, or GitHub publication was performed. The extension packages remain
   local candidates.
6. **Cataloger:** the `.agents/skills` catalog check passes for its current
   host-local inventory. The application registry and generated public catalog
   intentionally remain at the existing 15-skill core until an owner decision
   promotes the two extensions.

## Verification

- `pnpm run skill:validate`: **267/267 passed** across 19 local packages and 9 context files.
- `pnpm run skill:validate:test`: **16/16 passed**.
- `pnpm run skill:test`: **248/248 passed**.
- `pnpm run eval:run`: **14/14 fixtures, 100/100**.
- `pnpm run check:generated`: **passed**.
- `pnpm run skill:package -- --dry-run`: **19 archives, no writes**.
- Skill promotion unit tests: **5/5 passed**.
- `.agents/skills` catalog check: **passed**.

## Deferred release evidence

The two extensions have structural tests and evaluation designs, but no
independent protected holdout benchmark of paired bpmn-beta source and
elicited PNS records. They should not be described as proving lossless
round-trip fidelity, full BPMN conformance, or publication readiness. A future
promotion decision should also resolve whether the host-local `.agents/skills`
inventory is in scope for this repository's public catalog.
