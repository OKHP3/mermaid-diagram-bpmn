---
name: okhp3-outcome-modeling-core
description: >
  Design and operationalize outcome models that compress noisy event histories
  into calibrated forecasts and constrained decisions. Use when a user asks
  about feature reduction, probability, expected value, aggregation, or moving
  a prediction method between sports, business, sales, advertising, finance,
  or prediction markets. Load a domain adapter when one fits.
license: MIT
compatibility: >
  Any Agent Skills-compatible client with access to user-supplied data or
  approved public sources. Computation may require a spreadsheet, notebook, or
  statistical runtime, but the method does not assume one.
metadata:
  author: "Jamie Hill (OverKill Hill P³)"
  version: "1.1.0"
  category: "universal"
  origin: "okhp3/skillz"
  homepage: "https://overkillhill.com"
  author-github: "https://github.com/OKHP3"
  in_scope: "Multi-scale event aggregation and entity-state modeling; Feature inventory, compression, leakage control, and validation design; Objective functions, constraints, uncertainty, and decision outputs; Routing to sports, NFL fantasy, sales, and prediction-market adapters"
  out_of_scope: "Inventing data, current facts, probabilities, or benchmark results; Treating correlation as causal evidence without a causal design; Executing trades, bets, political persuasion, or external side effects; Replacing a domain adapter with generic advice when domain rules matter"
  status: enhanced-computational-payload
  tags: outcome modeling, forecasting, calibration, feature compression, expected value, constrained allocation
  triggers: probability model, many variables, noisy events, top features, 95 percent signal, forecast, allocation
  inputs: target, horizon, as-of time, event history, feature inventory, costs, constraints, and decision objective
  outputs: event-to-state ladder, feature tiers, calibrated forecast, uncertainty, objective function, and decision contract
  runtimes: Portable prose by default; optional Python 3.9+ standard library helper for local JSON arithmetic
---

# okhp3-outcome-modeling-core

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Build a defensible model for systems where many noisy events contribute to a measurable outcome. The core separates the shared world model from the decision objective, so the same evidence can support forecasting, ranking, budgeting, or market comparison without confusing prediction with optimization.

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| Repeated event histories, state vectors, and aggregate outcomes | A universal algorithm that fits every dataset |
| Feature reduction and diminishing-returns testing | Claims that a fixed feature count always explains 95% of outcomes |
| Calibrated forecasts and decision-ready uncertainty | Presenting a forecast as certainty or advice without constraints |
| Domain-adapter routing and handoff contracts | Live trading, betting, or political targeting |

---

## Core mental model

Treat a complex system as a noisy, time-indexed process:

```text
events -> entity state -> outcome estimate -> objective and constraints -> decision
```

Aggregation can reduce the relative influence of idiosyncratic noise, but it does not erase causal structure, dependencies, or meaningful rare events. The goal is to expose persistent signal while preserving uncertainty and time order.

## Computational payload

Use the formulas, glossary, synthetic fixture, and deterministic helper supplied
with this package. Read `references/computational-model.md` for the event-to-state,
logistic, feature-tier, calibration, and decision equations. Read
`references/glossary.md` before using unfamiliar terms. Run
`scripts/calculate-outcome-model.py examples/core-example.json` to reproduce the
small arithmetic example. The helper reads local JSON, prints JSON, and performs
no network access or writes.

## Operating procedure

### 1. Define the decision before the model

Record:

- target outcome and unit of analysis;
- forecast horizon and as-of timestamp;
- decision owner and action window;
- utility, cost, budget, risk tolerance, and hard constraints;
- whether the task is descriptive, predictive, causal, or allocative.

Do not optimize accuracy by default. A probability forecast, expected value estimate, ranking, and budget allocation are different products.

### 2. Build the event-to-state representation

Identify the entity, event, relationship, and time grain. Preserve raw observations, sample sizes, missingness, and provenance. Derive an entity state only from information available at the as-of time.

Use a state vector when many observations describe the same entity:

```text
state(entity, t) = transformed features available at t
```

Use an interaction or delta representation when two entities jointly determine an outcome:

```text
delta(A, B, t) = state(A, t) - state(B, t)
```

### 3. Aggregate at multiple scales

Inspect the smallest meaningful events, then roll them up through the operational hierarchy. Name each aggregation because different scales answer different questions.

```text
event -> session or possession -> period -> case or game -> season or cohort
```

Do not assume aggregation makes outcomes 50/50. It generally stabilizes estimates of persistent effects. Strong asymmetries can remain.

### 4. Compress features without hiding structure

Create a feature inventory with source, definition, unit, grain, polarity, cadence, missingness, and leakage risk. Group correlated variables under interpretable factors, but retain the raw fields for auditability.

Test nested feature tiers such as 10, 30, 60, 120, and 200 only when the dataset supports them. Compare each tier to a simple baseline using time-aware out-of-sample metrics. Stop adding variables when incremental value is negligible, unstable, or caused by leakage.

### 5. Validate in time and across entities

- Split by time, not random rows, when future prediction is involved.
- Use as-of joins and lagged rolling features.
- Hold out later periods or entities when generalization matters.
- Compare calibration, log loss, Brier score, ranking quality, and decision value as appropriate.
- Inspect subgroup and segment performance.
- Recheck drift after structural changes, interventions, or regime shifts.

Accuracy alone is insufficient. A model can rank well but be poorly calibrated, or forecast well while producing a bad allocation under costs and constraints.

### 6. Add causal and intervention checks

If the recommendation changes the system, separate prediction from treatment effect. Ask what would have happened without the action. Use experiments, holdouts, natural experiments, or a clearly labeled observational design when appropriate.

Never infer that a high-performing entity caused its outcome merely because it was associated with it. Check selection bias, confounding, reverse causation, and opportunity assignment.

### 7. Produce the decision layer

Choose an explicit objective such as:

```text
expected outcome
- monetary cost
- capacity cost
- downside risk
+ retention, option, or spillover value
```

State the optimization rule, constraints, assumptions, and what would change the recommendation. When a market price or benchmark exists, compare independent estimate, implied probability, uncertainty, and transaction or implementation cost.

## Output contract

Return, as applicable:

1. objective, target, horizon, and as-of boundary;
2. data and provenance inventory;
3. event-to-state and aggregation ladder;
4. feature groups and excluded or leaky fields;
5. baseline and candidate model comparison;
6. calibration, uncertainty, drift, and subgroup checks;
7. objective function and constraints;
8. ranked options or allocation with rationale;
9. unresolved assumptions and the next validation step.

If required data is absent, produce a model specification and data request rather than invented numbers.

## Family routing

Load this skill first, then add the narrowest adapter:

- `okhp3-outcome-modeling-sports` for team, game, or player outcomes;
- `okhp3-nfl-fantasy-picks` for NFL fantasy rosters and salary-constrained picks;
- `okhp3-outcome-modeling-sales` for pipeline, rep, account, and commercial value;
- `okhp3-outcome-modeling-markets` for prediction-market prices and expected value.

## References

- `references/computational-model.md` -- shared equations and worked example.
- `references/glossary.md` -- plain-language definitions and abbreviations.
- `examples/core-example.json` -- synthetic input fixture.
- `scripts/calculate-outcome-model.py` -- dependency-free local calculator.
- `okhp3-outcome-modeling-sports/SKILL.md` -- sports state and matchup adapter.
- `okhp3-nfl-fantasy-picks/SKILL.md` -- NFL fantasy decision adapter.
- `okhp3-outcome-modeling-sales/SKILL.md` -- commercial value and sales adapter.
- `okhp3-outcome-modeling-markets/SKILL.md` -- market-price and risk adapter.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
