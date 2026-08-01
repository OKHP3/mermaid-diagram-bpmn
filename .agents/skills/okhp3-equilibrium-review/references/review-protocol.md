# Equilibrium Review Protocol

## Decision states

Use these states exactly:

- `approve`: evidence meets the stated release criteria within scope.
- `approve-with-limits`: usable only with explicit constraints, warnings, or
  human confirmation.
- `defer-for-evidence`: design may be sound, but a decisive test, source, or
  holdout is missing.
- `reject`: a material failure violates a criterion or safety boundary.

## Independence record

Record, for every reviewer:

- role;
- model or human identity when known;
- system and role prompt identifiers;
- source set and retrieval date;
- tools and permissions;
- shared-model, shared-source, or shared-context limitations;
- whether the result was live, analytical, historical, or not-run.

Independence is a confidence qualifier, not a binary badge. Three reviewers
using the same model and the same prompt may be useful, but their agreement is
correlated evidence.

## Materiality rule

A difference is material when it changes a release criterion, a high-consequence
claim, a safety or authorization control, a supported runtime, a data result, or
the scope of the recommendation. Wording preference, tone preference, and
non-consequential style differences are not material disagreement.

## Escalation

1. Run evidence, outcome, and safety-portability reviews independently.
2. Classify each material finding as supported, disputed, missing evidence,
   scope conflict, or preference.
3. If material disagreement exists, invoke the negotiator and record the
   decisive test, stronger evidence, or unresolved issue. Do not invoke a
   ceremonial disruptor.
4. If material agreement exists, invoke the disruptor. Require falsifiable
   counterexamples, hidden assumptions, regression ideas, and a failure test.
5. Give credible counterexamples to the negotiator. A surviving defect reopens
   development; a failed counterexample becomes an attempted falsification
   record.
6. Release only what the complete record supports.

## Human-readable review summary

The summary should answer five questions:

1. What was reviewed?
2. What decision was requested?
3. Where did the reviewers converge or diverge?
4. What was the strongest surviving objection?
5. What is approved, limited, deferred, or rejected, and why?

Do not use “perfect,” “guaranteed,” or “the agents agreed” as a conclusion.
