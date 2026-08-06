# Output Contract

Use this contract whenever `okhp3-notion-capture-router` reports or writes a capture.

## Capture report

```md
# Notion Capture Report: [Source Title]

## Request
- Source platform/type:
- Destination type: page / database / data source / both
- Requested mode: preview / report-only / create / update / upsert
- Destination resolved from:

## Safety
- Safe to write: Yes / No / Partial
- Privacy or redaction notes:
- Confirmation needed:

## Classification
- Source-level status: duplicate / complementary / net-new / conflicted / unsafe-to-capture
- Extract count:
- Existing match or relation:

## Summary
[Purpose, topics, decisions, deliverables, and open loops.]

## Extract plan
| Extract | Type | Confidence | Status | Destination | Action |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

## Write log
- Created:
- Updated:
- Skipped:
- Redacted:
- Failed:
- Pending:

## Verification
- Destination fetched after write: Yes / No
- Content or properties verified: Yes / No
- Relations/source traceability verified: Yes / No
- Duplicate check completed: Yes / No
```

## Page export

Use a readable Markdown page with metadata, summary, extracts, open loops, and source content. Preserve the source when the user asks for a full export; label summaries and derived extracts so they are not mistaken for verbatim source material.

## Database row

Report the exact property map used, including the title property, status values, relations, and any long content placed in the page body. Do not report guessed fields as if they were written.

## Classification rules

| Class | Use when | Write behavior |
|---|---|---|
| duplicate | Existing item covers the same substance | Link or update only when useful; do not create another copy |
| complementary | Existing item exists but the new material adds value | Append, update, or create a linked extract |
| net-new | No adequate representation exists | Create the planned page or row |
| conflicted | Similar material disagrees or supersedes older content | Preserve both and flag review |
| unsafe-to-capture | Privacy, authority, or destination risk is unresolved | Report only |
