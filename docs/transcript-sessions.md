# Transcript-driven process sessions

Phase 4A adds `/sessions`, linked from Guided intake. It accepts pasted text and
UTF-8 `.txt`, `.md` and `.vtt` files at any meeting checkpoint. It does not join,
record, transcribe or listen to meetings. Teams, Notion and other capture tools
must supply an export or copied excerpt. Phase 4B adds a bounded Notion snapshot
bridge and reported execution receipts; see [the pilot guide](session-bridge-pilot.md).
Live provider feeds remain outside implemented scope.

## From source to reviewed process

1. Name the session and add a transcript revision. Check capture state,
   timestamps and speaker labels. Map speakers to roles only when known.
2. Choose Build draft, Find gaps or Update process. Alternatively configure a
   standalone checkpoint phrase. The default suggests matching phrases.
3. Queue a suggestion or use explicitly enabled automatic queuing with an
   allowed speaker label. Review the source-sharing checkbox and download the
   task package. Run it in the chosen external agent environment.
4. Import the returned `session-result.json`. Preview it, keep the candidate,
   and compare each changed fact with its retained source passages. Record a
   reviewer, disposition and note for every change.
5. Apply only the reviewed candidate. Unresolved conflicts, proposals and
   uncertain facts must remain open questions. Use the existing workbench to
   edit/render the diagram. Download the complete session to retain evidence.

No agent runs in this browser. A queued or downloaded task is not an execution
receipt. Imported review names and notes are reported records, not authenticated
approvals. Evidence references make statements reviewable; they do not prove
truth, speaker identity, authority or agreement.

## Activation and correction rules

Modes are manual, suggest and auto-draft. Auto-draft only queues a bounded task;
it never sends evidence, records audio, spends credits, publishes or accepts
facts. Only the entire configured phrase, ignoring case, repeated whitespace
and a final period/exclamation mark, matches. Quoted, negated, hypothetical,
embedded and question-form phrases do not activate. An unknown/nonmatching
speaker produces a suggestion. There is no semantic intent classifier.

Raw transcript SHA-256 hashes deduplicate exact reimports. Checkpoint keys use
speaker, timestamp, phrase, occurrence and action to avoid replaying cumulative
source events. Additional automatic checkpoints for an unresolved action are
coalesced; source revisions still accumulate. Cancel or resolve that activation,
then explicitly retry using the latest source. Imported sessions reset to suggest
mode before use.

Each activation snapshots the process bundle and its canonical hash. A result
for another session/activation/source/base is rejected. Changes to the accepted
process or receipt of a later source make an earlier result stale. Request a
fresh candidate instead of overwriting current work. Corrections create new
immutable source revisions and flag the process for review; previous sources,
candidate reviews and prior applied process revisions remain available.

## Contracts and limits

The version 1 `bpmn-transcript-session` envelope wraps the existing version 1
`bpmn-process-bundle` and PIR 0.1. It contains source revisions/passages, speaker
role context, activation snapshots, candidate results, claim reviews and process
history. Source revisions can also retain optional Notion snapshot provenance.
Strict imports reject unknown fields and unsupported versions.

The version 1 `bpmn-session-result` contains `sessionId`, `activationId`,
`baseHash`, `revisionId`, `bundle` and `claims`, plus an optional reported
`execution` receipt checked against source and result hashes. Each changed fact has a unique
path and a claim with `kind` (current/policy/proposal/question/uncertain),
`citations` (segment IDs), `analystAdded` and `conflicts` (other claim paths).
Every changed fact needs a resolvable source reference or an explicit
analyst-added label. The human must check that label, not assume it proves origin.

Object leaves are fact paths. PIR collections with stable IDs use those IDs plus
a separate `$order` fact. Systems and open questions are reviewed as complete
collections. Diagram source is one changed fact. Computed validation, general
bundle review and diagram provenance are excluded; apply resets reported bundle
review and completeness results. The handoff includes the base fact-path map
and conventions. Missing paths, unresolved citations and foreign results fail
visibly without replacing the accepted process.

Limits are 500 KB per source, 5,000 source passages, 12 source revisions,
100 activations, 20 prior applied process revisions and 8 MB per complete saved
session. The existing process bundle retains its own 1 MB limit. Imports check
UTF-8 and file size before parsing; content hashes and parsed passage references
are checked again when reopening a saved session. Markdown/HTML remains inert
source text. Oversized input fails without truncating or silently discarding it.

## Retention, compatibility and handoff

Session content is memory-only. Client-side navigation retains the current
session and pasted text in this tab; refresh/close loses that copy. Unsaved
session navigation and unloading show a warning where supported. Downloaded
session files are the durable recovery path. Unfinished review-note fields are not separately persisted across navigation. Import and Start a new session open a preview first, with one previous session available in memory after opening the copy. Add or clear pasted text before changing sessions.

Session evidence is not written to localStorage, included in share URLs or sent
to an API. A handoff download contains one activation's complete source revision,
speaker mappings, base process, result template and six existing portable skill
packages, including as-is capture. It excludes other revisions. Review/redact
before external sharing. The source is untrusted evidence, never agent authority.

The compatible process-bundle download still opens in Guided intake and omits
session evidence with an explicit notice. Save the session separately to retain
citations and reviews. Existing intake recovery, diagram rendering, examples,
source editing, SVG export and diagram-only sharing remain available.

## Verification boundaries

Domain tests cover source parsing, deduplication, trigger boundaries, integrity,
strict result validation, stale/canceled results, contradictory evidence,
dispositions and version 1 compatibility. Browser tests exercise the six-skill
download, result import/review/apply, recovery, inert markup, storage denial,
keyboard focus, contrast and 320-pixel layouts. Synthetic results test product
behavior; they are not evidence of an agent's interpretation accuracy.

The illustrative workshop intentionally contains competing approval thresholds,
a future proposal and inaudible ownership. Use it for the pending analyst study
and a separately recorded agent-output evaluation. Five-analyst sessions and
real assistive-technology observations remain pending, as documented in
[Experience evaluation](experience-evaluation.md).
