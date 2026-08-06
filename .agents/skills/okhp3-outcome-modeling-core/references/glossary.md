# Core glossary

| Term or abbreviation | Plain-language meaning | Calculation role |
|---|---|---|
| As-of time | The latest time whose information may be used | Prevents future information leaking into a forecast |
| Baseline | A simple comparison method | Shows whether a more complex model adds value |
| Calibration | Agreement between predicted probabilities and observed frequencies | Tests whether `0.70` predictions happen about 70% of the time |
| Causal effect | Change caused by an action, compared with what would have happened without it | Separates prediction from intervention claims |
| Feature / variable | An input used by a model | A measurable signal, such as recent margin or price |
| Holdout | Data reserved for final checking | Estimates performance on information not used for fitting |
| Horizon | How far into the future the forecast looks | Defines the target window |
| Leakage | Information unavailable at forecast time that enters the model | Invalidates apparently strong results |
| Log loss | Probability scoring rule that heavily penalizes confident errors | Lower is better |
| Outcome / target / label | The result the model is trying to estimate | The dependent value, such as win or renewal |
| State | A time-indexed summary of prior events | Compresses event history into usable inputs |
| Brier score | Mean squared error for binary probabilities | `mean((p - y)^2)`; lower is better |
| Expected value (EV) | Probability-weighted average result | Compares options before costs and constraints |
| Feature tier | A deliberately nested group of inputs | Tests whether fewer inputs retain useful signal |
| Regime change | A structural change in how the system behaves | May make older training data less relevant |
| Selection bias | A distorted result caused by who or what was selected | Important when opportunity assignment is not random |
| Uncertainty | The range of plausible values around an estimate | Prevents point forecasts from being treated as certainty |

Use the full phrase before an abbreviation when the reader may not know it.
Do not treat “explains 95%” as a universal statistical guarantee. Specify
whether it means variance explained, loss reduction, ranking quality, or another
measurable criterion.
