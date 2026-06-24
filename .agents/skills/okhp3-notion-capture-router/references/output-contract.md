# Output Contract

Use this contract whenever `okhp3-notion-capture-router` reports or writes a capture.

## Capture report

```md
# Capture Report: [Thread Title]

## Boundary Gate
- Platform:
- Origin:
- Safe to write: Yes / No / Partial
- Reason:

## Thread Classification
- Dedupe status: duplicate / complementary / net-new / conflicted / unsafe-to-capture
- Primary Domain:
- Secondary Domain candidates:
- Project relation:
- GitHub repo candidate:

## Thread Summary
[One paragraph. Purpose, topics, decisions, deliverables, open loops.]

## Extract Plan
| Extract | Type | Confidence | Dedupe status | Destination | Next action |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

## GitHub Reconciliation
| Nugget | In Notion? | In GitHub? | Action |
|---|---:|---:|---|
| ... | Y/N | Y/N | ... |

## Write Log
- Created:
- Updated:
- Skipped:
- Pending:

## Archive Gate
- Topic / Domain retrievable: Yes / No
- Date retrievable: Yes / No
- Origin retrievable: Yes / No
- Canonical link present: Yes / No
- Recommended status:
```

## Chat Threads row

| Field | Value rule |
|---|---|
| Title | Specific, searchable title. Avoid generic "ChatGPT thread". |
| Platform | Source platform. Use Other for unknown. |
| Origin | JMH, OKH, WORK, or MIX. Run boundary gate first. |
| Date | Source date if known, otherwise capture date. |
| Domain | Primary domain relation. |
| Project | Project relation if clear. Leave blank if not clear. |
| Summary | One-line retrieval summary. |
| Link | Source URL if available. Otherwise `pending`. |
| Status | `Extracted` unless archive gate passes. |

## Extract row

| Field | Value rule |
|---|---|
| Title | One reusable idea, not a bundle. |
| Type | Use closest fit. Default to Research Finding. |
| Confidence | High when reusable and clear. Medium when likely useful. Low when uncertain but worth preserving. |
| Status | Captured by default. Canonical only if already validated or promoted. |
| Next action | Specific action: route, validate, convert, publish, compare, or leave parked. |
| Source thread | Relate to the thread row. |
| Domains | Relate to primary domain. |
| Projects | Relate when applicable. |

## Classification rules

| Class | Use when | Write behavior |
|---|---|---|
| duplicate | Existing record covers same substance | Update existing if useful, do not create duplicate |
| complementary | Existing record exists but this adds material | Append or create linked extract |
| net-new | No adequate representation exists | Create new rows |
| conflicted | Similar material disagrees or supersedes older material | Preserve both and flag review |
| unsafe-to-capture | Privacy, employer, or personal-data issue | Report only |

## Archive status rule

Use `Archived` only when the archive gate passes. Otherwise use `Extracted` and list the missing retrieval axis.
