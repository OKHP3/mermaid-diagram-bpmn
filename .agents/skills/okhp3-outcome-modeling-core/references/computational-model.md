# Computational model

This reference turns the core workflow into a small, inspectable calculation
contract. It is a model specification, not a claim that any one algorithm fits
every domain.

## 1. Event-to-state aggregation

For entity `i` at time `t`, retain the observations available before the
forecast cutoff:

```text
state_i,t = aggregate(events_i, <= cutoff_t, weights, missingness, provenance)
```

A weighted mean is useful when events have different exposure:

```text
weighted_mean = sum(weight_j * value_j) / sum(weight_j)
```

For two interacting entities, construct differences or interactions only after
the two states have been built:

```text
delta_A_B = state_A,t - state_B,t
```

Aggregation reduces variance in many settings, but it does not make outcomes
independent, erase regime changes, or force the final outcome toward 50/50.

## 2. Probability layer

A transparent starting point for a binary outcome is logistic regression:

```text
logit(p) = b0 + b1*x1 + ... + bk*xk
p = 1 / (1 + exp(-logit(p)))
```

For multiclass outcomes, use one-vs-rest or a softmax model and verify that
class probabilities sum to one. The feature inventory must record each field's
definition, unit, time grain, source, polarity, missingness, and leakage risk.

## 3. Feature compression

Define nested feature sets `F10 ⊂ F30 ⊂ F60 ⊂ F120 ⊂ F200` only when the data
supports those tiers. Compare each tier with the same time-aware holdout and a
simple baseline. Report incremental metrics, not only the number of fields.

```text
relative_gain_k = (baseline_loss - tier_k_loss) / baseline_loss
```

For a descriptive contribution screen, sort non-negative importance values and
calculate:

```text
cumulative_share_k = sum(top_k_importance) / sum(all_importance)
```

Importance is not causality. Correlated variables can split or duplicate
importance, and a top-k result must be rechecked on later data.

## 4. Calibration and uncertainty

For binary predictions `p_j` and observed outcomes `y_j`:

```text
Brier = mean((p_j - y_j)^2)
log_loss = -mean(y_j*ln(p_j) + (1-y_j)*ln(1-p_j))
```

Lower is better for both. Calibration means that cases assigned probability
`0.70` occur roughly 70% of the time within an adequately sized comparable
group. Report sample size, interval method, drift, and subgroup behavior.

## 5. Decision layer

Prediction and action are separate. For option `a`:

```text
expected_value(a) = sum_s P(s | data) * payoff(a, s)
net_value(a) = expected_value(a) - monetary_cost(a) - capacity_cost(a)
```

Then apply hard constraints such as budget, roster, service capacity, exposure,
or risk tolerance. If the action changes future data, identify the
counterfactual and use an experiment, holdout, or clearly labeled observational
design.

## Worked example

Three events have values `1.0`, `0.0`, and `1.0` with weights `2`, `1`, and `3`.
The weighted mean is `(2*1 + 1*0 + 3*1) / 6 = 0.8333`. A model with logit
`0.4 + 0.8*0.5 - 0.3*0.2 = 0.74` produces `p = 0.6760`. If the observed
outcome is `1`, its Brier contribution is `(0.6760 - 1)^2 = 0.1053`.

Run the reproducible helper with:

```bash
python3 scripts/calculate-outcome-model.py examples/core-example.json
```

The helper accepts local JSON only, prints JSON to stdout, and never writes,
fetches, or modifies the input.
