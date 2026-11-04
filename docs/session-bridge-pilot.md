# Phase 4B: bounded transcript bridge pilot

The `/sessions` workbench can preview a Notion transcript snapshot prepared by
the user's connected external agent. It retains page identity, reported edit
and fetch times, exact transcript bytes, and a content hash. Existing explicit
and keyword activations prepare the same six-skill task package. Returned
results can carry a reported execution receipt before evidence review.

This is an on-demand snapshot workflow. It does not join meetings, record audio,
poll providers, subscribe to updates, invoke an AI model, or authenticate agent
reports inside the browser. Teams and other capture tools still use the existing
text/VTT import. Real meeting capture and unattended feeds remain future work.

## Prepare one source snapshot

1. In an agent with the user's authenticated Notion connector, fetch the intended
   page with transcript inclusion enabled. Confirm the page and sharing scope.
   Save the complete structured fetch result to an approved private artifact
   location. Do not substitute a meeting summary or fabricate missing passages.
2. From the canonical repository with Node 24 or later, run:

   ```text
   node scripts/session-bridge.mjs notion --input FETCH.json --output ABSOLUTE-SNAPSHOT.json
   ```

   The helper uses the fetch response's reported `as of` timestamp. If the
   connector omits that header, supply `--fetched-at` with the observed UTC fetch
   time. File preparation time must not be substituted for fetch time.
3. The default accepts exactly one native meeting transcript section. For a
   manually maintained transcript page, use `--kind transcript-block` and put
   exactly one `txt` or `text` code block beneath `## Transcript`. Use
   `--kind synthetic` for invented test dialogue. Native meeting markup has
   fixture coverage; a real recorded Notion meeting has not been validated yet.
4. In Sources, expand **Notion snapshot pilot**, import the JSON, inspect its
   source and transcript, choose the capture state, then add the snapshot.
   A repeated identical transcript keeps the original attribution and activation
   history. A corrected transcript becomes a new revision. There is no automatic
   refresh. To correct attribution on identical text, preserve the old session
   and prepare a fresh session; the importer does not rewrite retained history.

The helper rejects incomplete responses, missing revision metadata, mismatched
page IDs/URLs, ambiguous transcript selections and unsupported content. The
browser accepts snapshots up to 1 MB containing at most 500 KB of transcript.
Other session limits remain unchanged. Source links open in a new tab. Downloaded
snapshots and sessions contain source metadata and dialogue; share them only
with the intended recipients.

## Run the task and return a candidate

1. Queue an explicit or keyword activation, review the source-sharing checkbox,
   and download the handoff. A download alone is not agent execution.
2. Run `SESSION-TASK.md` in the chosen external agent. Keep the original session,
   activation, source and base identifiers. Return every changed fact with its
   supporting passage IDs. Preserve disagreements, proposals and unknowns in
   open questions. An incomplete source can legitimately produce a partial
   intake without a diagram, final narrative or completeness claim.
3. After the actual run, optionally add a reported receipt:

   ```text
   node scripts/session-bridge.mjs receipt --input session-result.json --source session-source.json --agent NAME --run-id ID --started-at UTC --output ABSOLUTE-RESULT.json
   ```

   This command does not invoke an agent. It records the supplied agent/run/start
   information, completion time, source hash and canonical result hash. It
   refuses to replace an existing output or receipt. Never attach a receipt to
   an unexecuted template and claim the task ran.
4. Import the returned JSON into the original session. The browser checks the
   source/result binding and displays the report. A person must still review
   every changed fact before applying it. Later source or process changes require
   a fresh task. Imported reviewer names remain reported records.

Receipts detect mismatches and accidental edits. They are not cryptographic
signatures or proof of agent identity, execution, source authenticity, correctness
or approval. Source metadata is reported provenance, not provider attestation.
The optional `source` and `execution` fields extend version 1 contracts; older
files still open, and manual results display **Execution not reported**. Older
application builds with strict schemas may reject files containing these fields.

## Observed pilot and remaining acceptance

On November 4, 2026, Codex fetched an explicitly synthetic purchase workshop
through the authenticated Notion connector, imported it into the production
preview, queued its standalone checkpoint phrase, and downloaded the handoff.
Codex authored a partial intake with 19 cited changes and returned it with an
execution report. The browser retained the candidate and prevented applying
unreviewed changes. No accepted process or human review was manufactured.

The draft retained both disputed thresholds as an open question, kept automatic
approval as a future proposal, and left rejected-request ownership unresolved.
No complete diagram or narrative was claimed from the incomplete evidence.
This single synthetic trial is transport and review-boundary evidence, not a
general model-quality score or a real meeting study.

The trial exposed an initial timestamp-labeling defect: the helper recorded
preparation time as fetch time. The helper now uses the observed fetch time;
the original local trial records remain retained with that limitation, alongside
a corrected snapshot. They are not silently rewritten.

Automated coverage includes source parsing, incomplete/altered input rejection,
strict optional fields, duplicate activation protection, receipt binding,
saved-session recovery, stale-source protection and browser preview/review.
`pnpm run session:bridge:test` checks the Node helper; application tests and the
three-engine transcript browser suite check the shared contracts and UI.

Phase 3's five analyst sessions and actual assistive technology observations
remain open. Real meeting quality, provider-specific recorder formats, repeated
agent evaluations, and operational unattended triggers require separate evidence.

## Bounded follow-through

- Phase 5: harden the demonstrated workflow and evaluate additional agent outputs
  against cited evidence and explicit unknowns. Use verified existing backlog
  criteria; do not equate automated accessibility checks with participant work.
- Phase 6: reconcile documentation, eligible stable vendor updates, required CI,
  deployment evidence and GitHub/Replit/local synchronization. Keep external
  acceptance gaps visible.

Replit work must remain Free-only. Current Replit documentation says Routines
do not run in Free mode, so they are not the scheduler for this pilot. A bounded
Codex follow-through task can coordinate authorized work while respecting quota,
active task ownership and the finite backlog. See the owner's operations
checkpoint for live ownership; it is not a public source or a release claim.

Provider references: [Notion MCP](https://developers.notion.com/guides/mcp/overview)
and [Replit Free mode](https://docs.replit.com/chat/free-mode).
