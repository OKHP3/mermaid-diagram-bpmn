# First-Visit Outcome Evaluation

**Evaluation date:** 2026-08-24  
**Purpose:** Test whether a first-time visitor can identify and complete one of the
three promised product paths without maintainer guidance.  
**Evidence type:** Repeatable browser task walkthrough; not moderated user research.

## Tasks and holdout

The evaluator started from a fresh browser page at the home route and received
only these neutral prompts:

1. **Create a diagram:** “Create a usable BPMN diagram and take the result with you.”
2. **Use with Mermaid:** “Verify whether this works with Mermaid and find the path to use it.”
3. **Start a process workflow:** “Start documenting a process and take the starter materials with you.”

The evaluator was not given route names, test IDs, implementation details, or
maintainer instructions. The evaluation used desktop (1280×800) for all three
tasks, plus a small-screen (375×812) pass covering path selection, keyboard
activation, and invalid-source recovery.

## Observed results

The run used a production Vite build and a fresh Chromium browser context:

```text
pnpm --filter @workspace/mermaid-diagram-bpmn run build
pnpm --filter @workspace/mermaid-diagram-bpmn exec playwright test \
  e2e/first-visit-outcomes.spec.ts --project=chromium
```

| Path | Observed outcome | Time to outcome |
| --- | --- | ---: |
| Create a diagram | Home CTA opened Playground; valid preview appeared; source copy succeeded; `.mmd` and SVG downloads were produced. | 691 ms |
| Use with Mermaid | Home CTA opened Host Demo; four diagrams rendered; the install/npm guidance was visible; the status distinguished four rendered diagrams from one intentional error fixture. | 466 ms |
| Start a process workflow | Home CTA opened Skills → Start Here; first skill, environment boundary, first prompt, and starter ZIP were identifiable; ZIP download succeeded. | 610 ms |
| Mobile keyboard path | At 375×812, all three path cards were visible; focusing Create and pressing Enter opened Playground. | 366 ms |
| Invalid-source recovery | At 375×812, invalid text showed an adjacent parse error while preserving the text; replacing it with valid source restored the preview. | 86 ms |

**Observed acceptance result:** 5/5 browser task checks passed. The checks
demonstrate route reachability and completion in the tested browser context;
they do not establish the PRD’s moderated-evaluator percentages.

## Findings

### Resolved during evaluation

The first Host Demo assertion exposed a trust problem: the intentional invalid
fixture caused the aggregate badge to say **“some errors.”** A first-time
visitor could reasonably interpret that as Mermaid compatibility failure even
though the four valid diagrams rendered and the invalid fixture was expected to
fail.

The badge now reports the distinction directly:

> `4 rendered · 1 expected error`

This is a narrow trust/readability mitigation, not a claim that every visitor
will understand the integration path.

### Remaining limitations and questions

- This was one automated evaluator, not a sample of new people. No PRD success
  percentage is claimed.
- The run covered Chromium only. The existing Host Demo browser suite remains
  the evidence source for Chromium, Firefox, and WebKit compatibility; this
  evaluation does not replace it.
- The workflow outcome is a downloadable starter pack and a clear first prompt,
  not execution of a compatible agent. The site correctly states that skills do
  not run in the browser, but a human study should verify that visitors
  understand this boundary.
- The test proves download events and filenames, not that a person opens the
  files and successfully configures an agent platform.
- Mobile coverage checks the smallest supported layout and keyboard entry, but
  does not evaluate touch panning or a range of mobile browsers.

## Prioritized mitigation list

1. **High — run a moderated first-visit study.** Recruit first-time users
   representing diagram authors, Mermaid adopters, and workflow users. Measure
   intent identification, completion, time, assistance, takeaway
   understanding, and the PRD thresholds separately.
2. **Medium — add a CI-visible browser preflight before E2E.** The contributor
   preflight exists, but CI should run it as a named step so native browser
   setup failures are separated from product-task failures.
3. **Medium — validate downloaded artifacts with a human task.** Ask evaluators
   to open the `.mmd`, SVG, and starter ZIP in their intended tools and record
   compatibility or setup confusion.
4. **Low — extend the same task protocol to Firefox/WebKit and a real mobile
   device once supported test infrastructure is available.** Keep the result
   as evidence, not as a visual-preference score.

## Reproducibility

The executable task walkthrough is committed at
`app/e2e/first-visit-outcomes.spec.ts`. It deliberately avoids analytics,
accounts, server-side recording, diagram-source collection, and subjective
visual snapshots. Its timing output is diagnostic evidence for this run, not a
population statistic.