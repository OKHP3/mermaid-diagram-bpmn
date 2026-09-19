# Returning external work to Replit

## Evidence boundary

Replit remains the planning, project-management, and design participant. The
external agent delivers architecture decisions, code, and technical evidence.
The return is acceptance and administrative reconciliation, not another build.

| Surface | What it establishes | What it does not establish |
|---|---|---|
| Root `replit.md` | Context and instructions for future Agent requests | A task database, stopped queue, or native completion |
| `.replit` | Project/run/deployment configuration; workflow tasks are commands | Agent Task Board card status |
| Git commits and task trailers | Source history and possible task provenance | Design acceptance, current board state, or fulfilled platform dependencies |
| Shell-created receipt | External delivery evidence, when verified | Authority to act or a board transition |
| Historical `markTaskComplete` / `mark_task_complete` | A native Agent action was observed in past execution | A public API, Shell executable, or safe action available to this executor |
| Internal Agent state/transcripts | Historical or internal records | A supported editable completion interface |

The September 19, 2026 inspection found native completion history while root
`replit.md` remained unchanged across later completed work. The inspected Shell
CLI did not list a task-completion command. These are bounded observations,
not proof that an external capability can never exist. Recheck supported UI,
declared tools, or official documentation when the capability decision changes.
Do not reverse-engineer private endpoints, edit internal state, forge Git
trailers, or replay a recorded action to force the board to agree.

## Return procedure

1. Prepare `assets/completion-receipt.md` in the agreed coordination location.
   Keep private plans and evidence out of public Git unless publication is
   authorized. Confirm the receiving operator can access the intended artifact;
   a local-only path is not a cross-machine handoff. Resolve links against the
   verified project, never a guessed or similarly named repository.
2. Bind the receipt to the stable task ID, original criteria, approved scope
   amendments, tested revision, merged revision, and observed Replit revision.
   Record the reason tests remain applicable to a merge revision with different
   ancestry. A passing test from another task or before a relevant code change
   is insufficient. Refresh affected checks, retaining still-valid evidence with
   an explicit applicability decision.
3. Return design evidence at that revision: preview or authorized screenshots,
   original visual/interaction criteria, deviations, and reviewer. Establish
   the rendered preview/build revision; Git parity does not prove a preview
   has refreshed. Stale or unknown preview provenance leaves design acceptance
   pending until the delivered revision is observed. Use
   `not-applicable` with a reason for non-design tasks. Pending or failed design
   acceptance remains visible even when technical gates pass.
4. Discover the current supported action and its full effects before proposing
   dispatch. Determine whether it commits source, applies isolated work, changes
   dependencies, starts queued coding, creates follow-ups, or consumes Agent
   usage. A label such as complete does not establish harmless administration.
   If effects or capability remain unknown, do not experiment on the backlog.
5. Reuse existing authority for this specific administrative or design review.
   Confirm it covers actual effects and usage; ask only for a missing
   consequential decision after the receipt and action are concrete. Do not add
   payment details, purchase usage, raise limits, or silently enable automation.
   Exhausted quota is not evidence that other writers cannot resume.
6. For a first supported trial, select one already-delivered task. Preserve its
   source/recovery point and dependent work. Resolve any queued-start or stale
   Apply effects before invoking completion. Never automatically apply an old
   Ready patch over an externally merged equivalent. A preference written in
   `replit.md` cannot enforce this gate. Recheck immediately before submission.
   If state can change concurrently, use supported expected-state protection
   or a verified serialized handoff covering relevant writers and automatic
   starts. A last-second read alone is not an atomic guard. Without such
   protection, leave the administrative action pending.
7. If a Replit Agent conversation is the only supported route, prepare a bounded
   request using the receipt's return instructions. Send it only when that
   route, usage, and effects are authorized and available. Exclude coding,
   architecture redesign, scope expansion, new follow-ups, publishing, and
   cancellation. Do not use a broad update-app prompt as a substitute.
8. Observe the resulting task identity, disposition, design decision,
   dependency states, source SHA/status, and any actual usage telemetry. Compare
   with the authorized before/after effects. A timeout is an uncertain write:
   inspect before retrying. Unexpected changes stop further reconciliation and
   require preservation and explicit recovery, not a reset or repeated dispatch.

If no supported route is available, retain `board-update-pending` with exactly
what is missing, the responsible operator, and an observable resumption event.
Do not poll, schedule, repeat prompts, or cancel the backlog merely to move
cards. A later user request or changed capability can resume that one action.
Other independently authorized work may proceed under its own ownership.

## Acceptance and revision

Record technical delivery, design acceptance, native board disposition,
source synchronization, and deployment separately. Native Done can mean
applied, archived, or canceled; capture the actual disposition rather than
treating the column as proof of implementation.

When Replit identifies an unmet original design criterion, return its evidence
and a scoped correction to the external executor. Keep the same task linkage
and refreshed ownership. If feedback adds new requirements, record a scope
amendment or later proposal through the owner's normal prioritization path.
Do not create a follow-up loop simply to keep the board populated.

## Evidence needed to strengthen the claim

A successful end-to-end pilot requires original criteria satisfied, real code
and checks, protected integration, source synchronization, applicable design
acceptance, verified native disposition and dependency behavior, and the
requested deployment/live evidence. A partial recovery proves only its
verified surfaces. Record actual cost and repeated-work telemetry when
available; unmeasured savings and cross-host support remain unknown.
