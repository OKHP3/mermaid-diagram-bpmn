# Evaluation Patterns: Evidence, Risk, and Regression

**Authority:** Use this reference to design evaluations that measure the skill's
contribution rather than general model competence.

## Build a useful test set

Start with at least three realistic cases:

1. **Normal path:** The primary job under ordinary constraints.
2. **Edge or constraint:** An important exception, missing prerequisite, or
   difficult decision.
3. **Failure or safety boundary:** A tempting but out-of-scope action, unsafe
   input, or high-consequence error.

Add cases only for independently important behavior. Do not inflate a suite
with cosmetic paraphrases of the same task. Keep a development set for the fix
loop and a holdout set that is not repeatedly used to tune the skill.

## Evidence anchors

An expectation is evidence-anchored when a grader can point to a specific
response artifact and make a reproducible decision. Strong anchors include:

1. Exact required text, error, policy clause, or configuration value.
2. Function, class, field, or schema identifier supplied by the skill.
3. Endpoint, file path, command, or output contract supplied by the skill.
4. A concrete decision rule with the required inputs and exception behavior.
5. A deterministic artifact validated by a parser, schema, or test script.

Weak expectations score generic competence rather than skill value:

```text
Weak: "Response uses a caching strategy."
Strong: "Response names the sessionStorage key prefix `are_wiki_`."

Weak: "Response handles a missing tool safely."
Strong: "Response returns the documented `blocked` result without attempting a write."
```

Use three to five expectations per case by default. The right count follows the
output's risk and structure, not a universal magic number. Each expectation
must be observable, necessary, and distinct.

## Binary checks and qualitative rubrics

Use binary checks when the output has an exact contract: valid JSON, named
fields, a command, a policy clause, or a required refusal. Use a short rubric
when quality is genuinely qualitative, such as a process explanation or a
design review.

A qualitative rubric must still define observable evidence. For example:

| Criterion | Pass evidence | Fail evidence |
|---|---|---|
| Boundary handling | Names the out-of-scope action and asks for direction | Performs or silently assumes the action |
| Traceability | Links each recommendation to a source or observed failure | Makes unsupported recommendations |
| Actionability | Gives ordered steps and a verifiable output | Provides generic advice only |

Do not convert uncertain judgment into fake numerical precision.

## Test for uplift fairly

When the skill claims specialized knowledge or a repeatable method, compare
matched with-skill and without-skill runs. Keep model, prompt, tool access,
fixtures, time budget, and grader constant. The without-skill run cannot read
the target package or artifacts from the with-skill run.

Ask of each expectation: "Could a capable model pass this from general knowledge
alone?" If yes, it may still be a task-quality check, but it is not proof of
skill-specific uplift. Add anchors that identify the skill's actual advantage.

For stochastic tasks, repeat comparable runs when practical and report sample
size and variation. A single result is a useful observation, not a universal
performance claim.

## Capture regressions

Every distinct real failure should become a regression case with:

- the original user intent and safe fixture;
- the observed failure and consequence;
- the expected corrected behavior;
- the evaluated version and result;
- whether it belongs in development or holdout coverage.

Retire a case only when it is duplicate, unsafe to retain, or the underlying
contract has intentionally changed. Record that decision.

## Conditional dissent and reconciliation

Independent reviewers can converge because the evidence is strong or because
they share a blind spot. Record their model or reviewer identity, context,
tools, and source set so this distinction is visible. For a material release
decision, use the following escalation:

1. Obtain at least three independent evidence-led reviews when that capability
   is available.
2. If their material claims disagree, send the claim ledger to a negotiator or
   human reviewer. It may resolve only from cited evidence, request a decisive
   test, or leave the decision open. Do not take a vote or overwrite a minority
   claim merely to restore harmony.
3. If the material claims agree, ask a disruptor to formulate falsifiable
   counterexamples, hidden assumptions, and regression tests. The disruptor is
   required to challenge the conclusion, not to manufacture a false verdict.
4. If a counterexample survives testing, return it to the development set and
   reopen the decision. If it fails, record the attempted falsification and the
   limits of the test before release review.

This protocol is a practical check against correlated error. It is not evidence
that a consensus is universally correct, and it should be skipped for
low-consequence changes when its cost exceeds the risk.

## Evals file shape

`evals/evals.json` is a portable design record. Add the version, status, test
partition, and risk alongside prompts and expectations:

```json
{
  "skill_name": "okhp3-example",
  "skill_version": "1.2.0",
  "status": "design-ready",
  "evals": [
    {
      "id": "normal-path",
      "partition": "development",
      "risk": "medium",
      "prompt": "A realistic user request",
      "expectations": [
        { "id": "contract", "text": "Response includes the required `result` field." }
      ]
    }
  ]
}
```

Freeze expectation text before a live run. If the expectation changes, record
why and treat the changed evaluation as a new version of the evidence.
