# Executable delegation program

This program converts repository audit findings into 23 bounded agent duties. Each record in [program.json](./program.json) contains its source findings, inputs, steps, acceptance criteria, dependencies, output ownership, model, and token budget. The findings were selected provisionally at revision `205b565ed0e638d68669a1be3c4e460cec68c7a5`; candidate implementation remains gated until the owner identifies the intended results and scope.

## Run and assign a duty

From the repository root, using Node.js:

```powershell
node scripts/delegation-controller.mjs init
node scripts/delegation-controller.mjs validate
node scripts/delegation-controller.mjs ready
node scripts/delegation-controller.mjs prompt T01
```

Initialization creates an ignored runtime registry at `.local/delegation-2026-10-05/program.json` and refuses to overwrite an existing run. The committed manifest is a reusable template with no private thread IDs or machine paths. Existing runs retain their actual status, receipts, attempt history, and budget reservations. Use `--registry .local/PATH/program.json` to select another private registry; task output owners must be updated explicitly before running simultaneous programs.

Create one Codex task thread for an eligible duty using its printed prompt, the current repository project ID returned by `list_projects`, local execution, and the record's model and reasoning effort. Thread creation is an app action; this script does not spawn a process or reserve provider quota. Attach the returned thread before creating another:

```powershell
node scripts/delegation-controller.mjs attach T01 ACTUAL_THREAD_ID local
node scripts/delegation-controller.mjs accept T01 --reviewed
```

The superintendent reviews the worker's report and receipt before acceptance. The controller rejects wrong or stale identity, missing criteria, missing artifacts, incomplete outcomes, ownership escapes, dependency cycles, conflicting concurrent owners, and declared budget overruns. A report that accurately records a failed product check can complete a baseline duty; it cannot establish that the product check passed. Mechanical file checks supplement review of the evidence contents.

## Series

| Tasks | Bounded work | Dependency sequence |
|---|---|---|
| T01-T03 | Authority ledger, skills/generated baseline, plugin baseline | Independent preparation |
| T04 | Independent review of scheduler, receipts, and task contracts | T01-T03 |
| T05-T11 | Reproducibility, documentation, lifecycle, DSL, rendering, compatibility, release blockers | Named preparation and technical prerequisites |
| T12-T17 | Worked examples, accessibility, packaging, starter workflow, primary paths, bundle budgets | Named technical and workflow prerequisites |
| T18-T20 | PNS contracts, reverse reconstruction, recoverability evaluation | Named preparation and schema prerequisites |
| T21-T23 | Distribution decision, upstream contribution packet, final release recommendation | Named technical and evaluation prerequisites |

The manifest gives the exact dependencies and acceptance for every task. T05-T23 are candidate duties, not completed changes or an automatic authorization to implement their findings. A finding already resolved by newer source should close with current evidence and no change. Canonical writes require an explicit ownership update; workers initially prepare patches and reports under their task output directory. External publication and outreach require the applicable authorization.

## Models and budgets

The authorized ceiling is 30 delegates at no more than 2,000,000 tokens per duty, plus 20,000,000 for the superintendent: 80,000,000 total. Use the available fast, affordable Luna model at low reasoning first. The initial trial used `gpt-6-luna`, with `gpt-5.6-luna` for capacity fallback. This selection is practical, not a measured guarantee of the cheapest possible model. Escalate model capability only for an evidenced capability failure.

Working budgets in the manifest are substantially below the ceilings. Create a local goal for the assigned duty, checkpoint near 75%, and finish promptly. Goal accounting can overshoot within a turn. Thread creation has no budget parameter and these tools cannot enforce a provider spending cap. Unknown provider usage remains unknown, never zero; overlapping parent/child goal reports must not be summed into a provider total.

The original run used seven distinct delegates and eight launch attempts, including one capacity retry. Its 23 planned duties plus preparation and retry reserved 27 conservative slots and 74,000,000 ceiling tokens, leaving three slots for new duties. Those historical reservations stay in its private registry. A newly initialized template has 23 planned slots and 66,000,000 reserved ceiling tokens; it is a separate run and must not be counted as a continuation with reset usage. Across runs, the superintendent must carry the user's original aggregate limit forward.

At most three delegates are active alongside the superintendent. Do not launch both a collaboration agent and a visible task thread for the same duty. Retain retry usage and artifacts; a retry must fit its duty's combined ceiling or become a separately reviewed duty.

## New findings and verification

Submit a JSON proposal with `id`, `title`, `evidence`, `acceptance`, `ownerPaths`, and `goalBudgetTokens`:

```powershell
node scripts/delegation-controller.mjs propose PATH_TO_PROPOSAL_JSON
node scripts/test-delegation-controller.mjs
```

Proposals reserve remaining capacity and remain unadmitted until the superintendent checks duplication, source scope, dependencies, smallest suitable model, ownership, and total exposure. The regression script exercises scheduler and receipt rejection cases in an isolated temporary repository. It adds no dependencies.

The original T01-T03 baseline reports were accepted. The focused plugin baseline recorded 72 passing checks and one failure because installed Mermaid 11.4.1 differed from the declared 11.17.2 target; this was an environment finding, not proof of a rendering defect. The independent T04 review identified the raw-prefix collision comparison and recorded its sandbox exercise as not run. The superintendent repaired normalized collision detection and independently verified the portable controller. Private receipts, raw logs, and machine identifiers remain under `.local/`.

Completing and publishing this delegation deliverable does not complete the candidate roadmap or establish product release readiness.
