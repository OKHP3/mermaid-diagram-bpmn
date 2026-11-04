# Analyst experience evaluation

Phase 3 refines the existing experience from observed evidence. It does not
authorize a larger canvas editor, in-browser agents, accounts or cloud storage.
Keep three evidence types separate: observed analyst sessions, assistive
technology sessions, and automated engineering checks. A successful download
or browser test does not demonstrate successful adoption by a person.

## Current evidence boundary

As of November 3, 2026, the five-analyst study and real assistive technology
sessions have not been conducted. The protocol below is ready to use. The
technical preflight covers page identity, keyboard focus, bundle round trips
and repeatable local performance measurements. It cannot close the human study.
The earlier [first-visit evaluation](first-visit-outcome-evaluation-2026-08-24.md)
also used automated browser tasks and must not be counted as participants.

## Five-person formative study

Recruit five people who own or analyze processes and have not built this
application. Include a mix of diagram experience and ordinary work devices.
Invite people who use assistive technology to use their usual setup; record
the tool and version without collecting disability or medical information.
Do not substitute five agent personas for five people.

Use the same released commit and starting URL for the initial five sessions.
Record the commit from the release page, browser/OS version, viewport or zoom,
and whether the person has seen the app before. Allow approximately 30 minutes.
Obtain agreement before recording. Use synthetic or redacted process details.
The participant can stop at any time. Do not collect names, organizational
secrets or recordings in this public repository.

Give these task cards one at a time without explaining the controls:

1. **Explain a decision.** "Open the purchase approval example. Explain who
   makes the decision, what the possible outcomes are, and what you would still
   need to ask before relying on this process."
2. **Adapt the process.** "Adapt this to a small equipment purchase process
   you know. Capture a different owner, one changed step, and one unresolved
   exception. Prepare what you would give an agent or colleague to continue."
3. **Take it with you and reopen it.** "Keep a copy you could use tomorrow.
   Open the result in a new tab or your intended tool. Show that your changes
   and unanswered questions survived. Explain what the files contain and what
   they cannot do on their own."

Start at the home page. Do not prescribe a route, file format or button name.
Ask the person to say what they expect before an action. Accept silence; do
not turn thinking aloud into additional task coaching. If stuck, first ask
"What are you looking for?" Record any hint that identifies an action as
assistance. Stop a task on request or after eight minutes without progress,
recording the reason. Do not count a facilitator-completed task as independent.

After all three tasks, ask what was confusing, what felt trustworthy, what
they would do next, and whether the exported files are useful in their actual
workflow. Ask them to demonstrate opening the files; distinguish a verbal
intention from observed reuse. Agent execution is optional and requires the
participant's own supported environment and available allowance. Never upgrade
Replit or another paid service to complete a session.

### Session record template

Copy this template into the project's private review home, one section per
participant. Use anonymous IDs P01 to P05. Empty cells mean not observed.

| Field | Observation |
| --- | --- |
| Participant ID; analyst role; prior diagram experience | |
| Date; facilitator; consent to notes/recording | |
| App commit; URL; browser/OS; screen/zoom; assistive tool/version | |
| Task 1: outcome, elapsed time, assistance, evidence reference | |
| Task 2: outcome, elapsed time, assistance, evidence reference | |
| Task 3: outcome, elapsed time, assistance, evidence reference | |
| Confusion: expected action, actual action, recovery, quotation if permitted | |
| Loss of work: none observed / recovered / unrecovered / not assessed | |
| File usefulness: observed reopen, intended tool, missing information | |
| Findings and severity; proposed next action | |

Use outcomes `independent`, `assisted`, `incomplete`, or `not attempted` for
each task. Preserve elapsed time separately; faster is not necessarily better.
Retain failed or stopped sessions in the denominator and explain exclusions.

### Decision rule

The initial target is at least four of five completing **all three tasks**
independently, with no unrecovered work loss. Report per-task counts as well.
A participant does not count as successful when files download but cannot be
reopened or their meaning is misunderstood. Record artifact usefulness as a
separate observed result. With fewer than five sessions, report the observed
count and leave the target unevaluated; do not project a success percentage.
This small study is formative, not statistical proof or market validation.

Prioritize unrecoverable data loss and task-blocking accessibility first, then
repeated confusion, then convenience. Link every product refinement to an
observed finding and a regression test where possible. Retest changed tasks
and disclose participant familiarity. Expand automation or editing features
only when findings support that decision and the owner authorizes the scope.

## Manual accessibility session

Use an actual screen reader with its normal browser, operated by someone
familiar with it. Record exact versions and spoken output or a permitted
transcript. An accessibility tree, axe result or scripted key press is not
screen reader evidence. Leave unobserved items pending.

- Page and stage identity: navigate from Process skills to Guided intake,
  then through each intake stage. Confirm the page title, heading order,
  current step, and reading position make sense.
- Keyboard: reach the skip link and main content, menus, form fields, stage
  controls, source tabs and exports. Check visible focus and no keyboard trap.
- Dynamic content: add/remove roles and steps; hear labels and relationships.
  Import valid and invalid files, inspect the preview, cancel, and apply.
  Confirm focus remains useful and errors/success messages are announced.
- Diagram meaning: understand the decision using accessible text/source;
  labels alone do not establish an equivalent description of every relationship.
- Recovery: change a brief, reopen a saved copy, encounter denied storage,
  and download/reimport the bundle without silently losing context.
- Magnification: test actual browser zoom at 200% and 400%, keyboard focus
  visibility, reflow, light/dark themes, and reduced motion. A narrow viewport
  test is supporting evidence, not a substitute for zoom or assistive tools.

Classify each item `observed pass`, `observed issue`, or `not assessed`, with
the setup and evidence. These checks are bounded task coverage, not a claim
of full WCAG conformance. References: [W3C preliminary checks](https://www.w3.org/WAI/test-evaluate/preliminary/),
[involving users](https://www.w3.org/WAI/test-evaluate/involving-users/) and
[Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md).

## Repeatable performance measurements

Build the exact candidate and start its production preview. From the repository
root, use the existing pnpm toolchain (in Replit, `corepack pnpm`):

```sh
pnpm --filter @workspace/mermaid-diagram-bpmn run build
pnpm --filter @workspace/mermaid-diagram-bpmn run serve --port 4174
node app/scripts/measure-experience.mjs --url http://localhost:4174/ --label before --output /absolute/approved/project/operations/experience-before.json
```

Supply an existing approved output directory. The command refuses to overwrite
a retained report. For a Pages-base build, include that base in the URL. Rebuild
after a refinement, repeat with `--label after` and a separate report path, and
compare matching viewport/route/metric rows. Do not compare across different
machines, browsers, font policies or preview builds without disclosing that
change. The build-manifest hash identifies the measured assets; source SHA
and working-tree changes distinguish committed from uncommitted candidates.

The runner measures seven fresh-context samples at desktop 1280x800 and mobile
390x844 for home, intake and the approval workbench. It records route readiness,
DOMContentLoaded, available first contentful paint, initial JavaScript body
bytes, stage/edit/view transitions and handoff download readiness. External
Google font requests are blocked consistently to remove that service's network
variability. All other local request and page failures fail the run.

Report medians and ranges with raw samples. Action timings include automation
and two animation frames; they are not INP or human task times. Local HTTP is
unthrottled and may not represent compressed production transfer sizes. No
field telemetry, analytics, device simulation or general speed score is added.
The existing initial JavaScript budget remains the CI performance gate. If an
apparent regression falls within run-to-run variability, repeat matched runs
before drawing a product conclusion.

## Completion evidence

Keep private session records, screenshots and raw laboratory reports in the
existing project review/operations home, not the public source repository.
Publish only a reviewed anonymous synthesis with permission. The source repo
holds this reusable protocol, measurement runner and regression tests.

Phase 3 is complete only when the five-person task outcomes, actual assistive
technology observations, before/after measurements, prioritized decisions,
retests, and normal source/CI/deployment verification are recorded. Engineering
preflight can be committed independently while the human sessions remain open.
