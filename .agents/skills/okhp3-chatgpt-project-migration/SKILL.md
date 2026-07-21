---
name: okhp3-chatgpt-project-migration
description: >
  OverKill Hill P³ ChatGPT project migration. Use when migrating, preserving,
  extracting, inventorying, normalizing, reconciling, or incorporating ChatGPT
  project threads, conversation exports, or complete chat histories into a
  repository. Also activate when a user needs a lossless thread archive,
  project-to-export crosswalk, provenance ledger, or public-safe distillation
  workflow. This is the authoritative capture and reconciliation process for
  ChatGPT project material in this repo -- use it even when the user asks only
  to "save", "review", or "summarize" a large set of threads.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: meta-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - ChatGPT project inventory, export capture, normalization, and reconciliation
    - Source provenance, private staging, and public-safe repository routing
  out_of_scope:
    - Accessing unavailable, deleted, or unauthorized ChatGPT content
    - Committing unreviewed raw conversations or private data to the repository
---

# okhp3-chatgpt-project-migration

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Capture a ChatGPT project as evidence before transforming it. This skill keeps
the source corpus intact, proves which threads and turns were captured, and only
then routes reviewed material into durable repository artifacts.

---

## Scope

| In scope | Out of scope |
|---|---|
| Exporting and indexing accessible ChatGPT project threads | Recovering deleted or permission-restricted content |
| Preserving every exported message node and content part | Treating an LLM summary as source preservation |
| Reconciling source material with repository artifacts | Publishing raw chats, credentials, or third-party private data |
| Optional Notion status register | Making Notion the authoritative raw archive |

---

## Operating principle

Use a two-lane process:

1. **Source lane:** immutable export, project inventory, normalized transcripts,
   hashes, and exception records. Keep it local and out of Git.
2. **Artifact lane:** reviewed, classified, public-safe Markdown and structured
   artifacts committed to their proper repository locations.

Do not substitute artifact-lane summaries for source-lane records. A source
record may be distilled many times without changing the original evidence.

---

## Required inputs and first decision

Record the project URL, capture date, account/workspace type, intended archive
location, and publication sensitivity. Treat repository visibility as unknown
unless the owner has resolved it.

Use ChatGPT data export as the primary source when available. It is faster and
more complete than manually copying UI text. Use Browser to enumerate the target
project and verify it against the export. Use Computer only for UI actions that
Browser cannot complete, such as a download dialog or desktop-only control.

If the account cannot export data, proceed with Browser-based recovery but mark
the batch `ui_capture_only` and list its reduced-fidelity limitations.

---

## Capture procedure

### 1. Preserve the original

Store the downloaded export ZIP in an owner-controlled local archive outside the
repository. Do not rename, edit, or unpack the only copy. Calculate and record
`raw_sha256` before working with it.

Create a disposable working copy under `custom-gpts/ingestion/`. That location
is Git-ignored, but it is a staging area, not the permanent archive.

### 2. Inventory the project UI

Enumerate every accessible thread in the target project. For each thread record
the stable conversation ID from its URL, displayed title, project URL, observed
last activity, attachments or images, and UI-capture status. Do not use title
matching as the primary key.

Write `project_capture_manifest.json` following
`references/source-manifest-schema.md`. Assign each row one of: `inventoried`,
`captured`, `normalized`, `reconciled`, `routed`, `exception`.

### 3. Normalize without flattening

Parse every conversation record into a normalized transcript and retain the raw
JSON record. Preserve all nodes in the conversation `mapping`, including
regenerated alternatives and non-current branches. Do not serialize only the
`current_node` path.

For every message node retain: node ID, parent ID, child IDs, role, create and
update time, author metadata, content parts in order, attachments, tool or
citation metadata when present, and a source locator. Represent unavailable
fields as `null`; do not invent values.

### 4. Reconcile and recover exceptions

Match project inventory rows to normalized export records by conversation ID.
Record a one-to-one match, one-to-many ambiguity, or no match. Do not silently
drop unmatched rows.

For every `no_match` or missing asset, use Browser-based capture as the recovery
path. Preserve the URL, capture time, and reason for the exception. Keep the
exception open until it has a source record or the owner accepts the loss.

---

## Completion gates

Do not call a migration complete until all are true:

- Every inventoried thread has a `conversation_id` and a disposition.
- Every captured source has a `raw_sha256` and a normalized-record hash.
- The parser counted all conversation `mapping` nodes, not only visible turns.
- Every unmatched thread, branch, message, or asset appears in `exceptions`.
- Raw source material remains outside tracked repository paths.
- Every committed artifact links to a source reference, a review decision, or an
  explicit statement that it is an original new artifact.

Report coverage as counts: `threads inventoried/captured/reconciled`, `mapping
nodes retained`, `assets retained`, and `open exceptions`. Do not claim 100%
unless the exception count is zero and the owner accepts the inventory boundary.

---

## Integration and routing

Classify each candidate before writing to the repository:

| Class | Destination | Handling |
|---|---|---|
| Raw evidence | Local archive and ignored staging | Preserve verbatim; never commit by default |
| Historical reference | `custom-gpts/proto/` or a clearly marked archive | Retain provenance and version context |
| Durable method | `custom-gpts/consolidated/`, `docs/`, or a skill | Distill, deduplicate, and cite source IDs |
| Operational artifact | Relevant schema, example, skill, or child-repo material | Add acceptance checks and ownership |
| Private or unsafe material | Local quarantine record | Redact, omit, or obtain explicit owner approval |

Use Notion only as an optional private Corpus Register for batch status, hashes,
source locations, routing decisions, and review notes. Do not copy the entire
source corpus into Notion merely to make it searchable.

When processing already captured Custom GPT material, use the existing corpus
ledger and evidence-register conventions. Preserve disagreement and historical
versions rather than making repetition appear authoritative.

---

## Required handoff report

Return a concise report with:

```text
Batch: <project name and capture date>
Source: export | ui_capture_only
Threads: <inventoried> inventoried / <captured> captured / <reconciled> reconciled
Nodes: <retained> retained
Assets: <retained> retained / <unavailable> unavailable
Exceptions: <count>
Artifact routing: <destinations and counts>
Owner decisions needed: <list or none>
```

---

## References

- `references/source-manifest-schema.md` -- capture manifest, normalized
  transcript, and reconciliation record contracts.
- `custom-gpts/ingestion/README.md` -- local staging boundary for source files.
- `custom-gpts/consolidated/CORPUS-LEDGER.md` -- existing evidence-ledger model.
- `custom-gpts/consolidated/EVIDENCE-REGISTER.md` -- claim classification and
  source discipline.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
