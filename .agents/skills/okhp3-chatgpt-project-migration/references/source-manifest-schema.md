# Source Manifest Contract

Use these contracts for a local, machine-readable capture batch. They are
provenance records, not public repository artifacts.

## `project_capture_manifest.json`

```json
{
  "schema_version": "1.0.0",
  "batch_id": "chatgpt-project-YYYY-MM-DD",
  "project": {
    "display_name": "string",
    "project_url": "string",
    "inventory_captured_at": "ISO-8601 timestamp"
  },
  "source": {
    "mode": "export | ui_capture_only",
    "archive_location": "local-only path or owner reference",
    "raw_sha256": "64-character hex string | null"
  },
  "threads": [
    {
      "conversation_id": "stable ID from source or URL",
      "title": "string | null",
      "project_url": "string",
      "ui_observed_at": "ISO-8601 timestamp",
      "has_attachments": false,
      "status": "inventoried | captured | normalized | reconciled | routed | exception",
      "export_match": "matched | ambiguous | no_match | not_applicable",
      "normalized_record": "local path | null",
      "normalized_sha256": "64-character hex string | null",
      "source_ref": "batch_id/conversation_id",
      "notes": []
    }
  ],
  "exceptions": [
    {
      "kind": "thread | branch | message | asset | parse",
      "conversation_id": "string | null",
      "reason": "string",
      "recovery_status": "open | recovered | accepted_loss",
      "evidence": "URL, path, or source locator"
    }
  ]
}
```

## Normalized transcript record

Keep the raw conversation object alongside this derived record. The `nodes`
array must contain every key in the source conversation `mapping` object.

```json
{
  "schema_version": "1.0.0",
  "source_ref": "batch_id/conversation_id",
  "conversation_id": "string",
  "title": "string | null",
  "raw_sha256": "64-character hex string",
  "nodes": [
    {
      "node_id": "string",
      "parent_id": "string | null",
      "child_ids": ["string"],
      "message_id": "string | null",
      "role": "user | assistant | system | tool | null",
      "create_time": "number | null",
      "update_time": "number | null",
      "author": {},
      "content_parts": [],
      "attachments": [],
      "metadata": {},
      "source_locator": "mapping.<node_id>"
    }
  ],
  "current_node": "string | null",
  "normalized_sha256": "64-character hex string"
}
```

## Reconciliation rules

- Use `conversation_id` as the join key whenever it exists in both sources.
- Treat a title match without an ID match as a review candidate, never proof.
- A record with an empty or absent message is still a retained mapping node.
- A regenerated response is a sibling branch and remains part of the source.
- Do not convert an unavailable asset into an absent asset; emit an exception.
