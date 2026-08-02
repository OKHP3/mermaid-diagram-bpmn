# Equilibrium Review Protocol

**Purpose:** Turn agreement, disagreement, and attempted falsification into a
traceable release decision. This is an equilibrium-inspired control loop, not a
claim that language-model reviewers calculate a formal game-theoretic
equilibrium.

## When to use it

Use this protocol for a material skill redesign, a self-improvement claim, a
high-consequence safety or authorization change, or a release that relies on
new external evidence. Use ordinary review for low-risk wording and formatting
changes.

## Inputs

- A frozen change proposal, package hash, and explicit decision question.
- A source ledger that labels each source's authority, retrieval date, and
  applicability.
- A risk register, development evaluations, release criteria, and any known
  regressions.
- A structured claim ledger with claim, evidence identifier, confidence,
  expected consequence, and unresolved assumption.

## Roles and separation

| Role | Job | Must not do for independent release evidence |
|---|---|---|
| Evidence reviewer | Check claims against authoritative sources and local artifacts. | Edit the proposal it judges. |
| Outcome reviewer | Check task utility, boundaries, and regressions. | Grade its own output. |
| Portability and security reviewer | Check client assumptions, authorization, untrusted content, and side effects. | Treat host metadata as portable authority. |
| Disruptor | Generate plausible, falsifiable counterexamples to a concordant conclusion. | Declare a counterexample valid without evidence or a test. |
| Negotiator | Resolve material disagreement using the claim ledger and decisive tests. | Average votes or conceal a remaining disagreement. |
| Release reviewer | Decide approve, reject, or defer from the record. | Replace missing evidence with confidence. |

Separate contexts, prompts, source access, and, where practical, model families.
Record shared-model, shared-context, or shared-source limitations because they
make agreement less independent.

## Escalation

1. Run the first three reviews independently. Each produces a structured claim
   ledger, not prose praise.
2. Compare material claims, acceptance criteria, critical-risk findings, and
   evidence references.
3. **Material disagreement:** send the competing claims to the negotiator. It
   selects a decisive test, adopts the claim with stronger evidence, or declares
   the decision unresolved. Return unresolved or failed items to development.
4. **Material agreement:** trigger the disruptor. It must challenge the shared
   conclusion through counterexamples such as stale evidence, a broken trust
   boundary, correlated assumptions, a hidden regression, an unsafe sync, or a
   false uplift measurement.
5. Test each credible counterexample on the development set. A surviving defect
   reopens the change. A failed counterexample becomes an attempted
   falsification record, not a proof of perfection.
6. The release reviewer checks the complete record and decides one of:
   `approve`, `approve-with-limits`, `defer-for-evidence`, or `reject`.

## What counts as material disagreement

Disagreement is material when reviewers differ about a release criterion, a
critical safety or authorization control, the truth or applicability of a key
claim, a supported client, or whether evidence supports the release. Differences
in wording, style, or a preference with no outcome consequence are not material.

## Stop rule

Stop the loop only when the release decision is evidence-backed, known limits
are recorded, critical-risk tests pass, and no credible counterexample remains
untested. Do not repeat the same reviewers until they agree. A no-change result
means the current evidence does not justify further mutation, not that the
skill is perfect.

## Minimum record

Store the decision question, inputs and hashes, reviewer contexts and limits,
claim ledgers, concordance result, disruptor hypotheses and results when
triggered, negotiator result when triggered, final decision, and follow-up
conditions. Use `assets/equilibrium-review-record.json` as the starting shape.
