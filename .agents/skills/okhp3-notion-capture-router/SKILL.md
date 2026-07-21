---
name: okhp3-notion-capture-router
description: Use this skill whenever an agent needs to export, capture, ingest, summarize, route, deduplicate, or reconcile a conversation or content artifact into Notion. It guides connector-enabled agents through choosing a Notion page versus database destination, resolving a workspace-specific URL or ID, inspecting page content or data-source schema before writing, mapping thread metadata and reusable extracts, creating or updating records safely, and verifying the result. Trigger for ChatGPT, Claude, Perplexity, Copilot, Gemini, PDF, Markdown, transcript, knowledge-base, Notion API, Notion connector, page, database, data source, or thread-export requests, even when the user does not name this skill.
license: MIT
compatibility: Requires a Notion connector or API-capable integration for writes. Read-only report mode works without write access. Do not commit account-specific Notion URLs, IDs, tokens, or workspace structure.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.3.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  maturity: draftable
---

# okhp3-notion-capture-router

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Turn conversations and other content artifacts into useful Notion pages or database records. The skill teaches an agent-enabled platform how to use Notion as a destination without assuming a particular user's account, workspace taxonomy, page hierarchy, or database schema.

The source may be a live conversation, an exported transcript, a PDF, Markdown, research notes, or another structured artifact. The destination may be:

1. A **page export** containing the complete source or a clearly labeled summary and extract set.
2. A **database export** containing one thread/content record, one record per reusable extract, or another schema requested by the user.

Use the user's requested destination and schema as the authority. Names such as “Chat Threads” or “Extracts” are examples, not required Notion structures.

## Use this skill when

Use it when the user asks to:

- export a conversation, transcript, research result, or file into Notion
- create or update a Notion page, database row, or data-source record
- design a reusable Notion capture or ingestion workflow
- turn a thread into a summary, outline, decision record, checklist, or reusable extracts
- deduplicate or reconcile new material against existing Notion content
- map an agent platform's output into a Notion API or connector schema
- move content between pages and databases while preserving traceability

Do not use it for generic Notion advice that does not involve capture, export, routing, schema mapping, or a Notion write.

## Scope

| In scope | Out of scope |
|---|---|
| Source normalization, destination resolution, schema inspection, deduplication, safe page or row writes, verification, and capture reporting | Guessing workspace structure, bypassing connector permissions, exporting private material publicly, or creating a new schema without explicit authorization |

## Operating principles

- **Destination-neutral:** Never assume the connected workspace belongs to a named person or has a particular page tree. Resolve the destination from the user's prompt, connector context, a project configuration file, or an explicit search result.
- **Schema-first:** Fetch a target database or data source before creating rows. Use the returned property names and types exactly; do not guess fields.
- **Page-safe:** Fetch a target page before replacing or appending content. Preserve child pages and databases unless the user explicitly authorizes their removal.
- **Idempotent:** Search or query before creating a record. Prefer updating a matching page or row over creating duplicates.
- **Traceable:** Preserve source title, platform, date, source link when available, export time, and the relationship between a full thread and its extracts.
- **Consent-aware:** Confirm the intended destination and visibility when they are ambiguous. Do not copy confidential, personal, or employer-restricted material into a broader destination without explicit authorization.
- **Connector-native:** Use the available Notion connector/API operations rather than inventing URLs, IDs, relation values, or unsupported Markdown.

## Workflow

### 1. Define the capture request

Identify:

- source content and source platform
- requested output: full export, summary, extracts, or a combination
- destination type: page, database/data source, or both
- requested destination URL, ID, name, or search criteria
- desired behavior: preview, report-only, create, update, or upsert
- privacy, audience, and retention constraints

If the user did not specify a destination, produce a capture plan and ask for a destination before writing. If the connector supports safe search, search for candidate destinations and present the candidates rather than choosing an unrelated page.

### 2. Resolve and inspect the destination

Use `references/destination-contract.md` for destination roles and the expected resolution process.

For a page destination:

1. Fetch the page by the supplied URL or ID.
2. Confirm its title, location, and intended purpose.
3. Inspect existing content and child pages before choosing append, targeted update, or replacement.

For a database or data-source destination:

1. Fetch the database/data source first.
2. Identify the actual data source and title property.
3. Read the schema, templates, and available select/status/relation options.
4. Map only fields supported by that schema.

If resolution or access fails, switch to report-only mode. Do not fabricate a fallback destination.

### Connector operation map

Map the platform's available tools to these logical operations. Different runtimes may use different names, but the sequence matters:

| Logical operation | Typical connector/API capability | Purpose |
|---|---|---|
| Search | `search` | Find candidate pages, databases, or data sources from a user-supplied name or topic |
| Fetch | `fetch` / retrieve page or schema | Read a page, database, data source, child structure, or current row before writing |
| Query | `query` / database search | Find matching rows using the actual schema and stable properties |
| Create | create page or data-source item | Create a page or database row with a valid title and supported properties |
| Update | update page properties/content | Apply the smallest targeted change to an existing page or row |
| Verify | fetch after write | Confirm the write, relations, content, and destination |

When a connector exposes operations such as `notion_search`, `notion_fetch`, `notion_create_pages`, or `notion_update_page`, treat them as implementations of these logical operations. Do not skip the fetch/schema step because a tool name suggests that it can write directly.

### 3. Normalize the source

Build a thread-level record with, when available:

- title
- source platform and source type
- source date and export date
- source URL or file name
- purpose and user intent
- concise summary
- decisions, frameworks, prompts, drafts, findings, and open loops
- privacy classification and any redaction applied

When the user asks for a full export, preserve the source in a readable Markdown structure and put the summary and extracts near the top. Do not silently replace a requested full export with a summary.

### 4. Extract reusable material

Split the source into separate extracts when they can be retrieved or reused independently. Suitable types include Decision, Framework, Prompt, Checklist, Definition, Outline, Draft, and Research Finding.

Each extract should include:

- a specific title
- the reusable content
- confidence or review status when useful
- a link or relation to the source thread/page
- the destination requested by the user

Keep uncertain but potentially useful material labeled as low confidence rather than presenting it as settled fact.

### 5. Check duplicates and relationships

Search or query the target before writing at two levels:

1. **Source level:** Is this thread, document, or page already represented?
2. **Extract level:** Is the proposed reusable idea already present, complementary, or contradictory?

Classify each item as `duplicate`, `complementary`, `net-new`, `conflicted`, or `unsafe-to-capture`. Update or link duplicates, append complementary material when appropriate, and flag conflicts for review instead of overwriting silently.

### 6. Build the write plan

For a page export, plan a structure such as:

```md
# [Source title]

## Capture metadata
- Platform:
- Source date:
- Exported at:
- Source link:

## Summary

## Decisions and findings

## Reusable extracts

## Open loops

## Source content
```

For a database export, prepare one property map per row using the fetched schema. Use relations only when the target schema exposes them and the related page IDs are known. Put long source text in page content when the database is intended for index metadata rather than transcript storage.

Keep API payloads small and explicit: send only the properties and content required for the requested operation, preserve unchanged content, and handle any asynchronous task or polling response returned by the connector before reporting success.

### 7. Execute the smallest safe write

Use the connector's equivalent of:

- create page or row for net-new content
- update page properties for metadata changes
- append or targeted content update for additions
- query/search plus update for an existing match

Do not replace an entire page when an append or targeted update is sufficient. Do not create a new database merely because a requested database was not found unless the user explicitly asked for database creation and supplied the intended schema.

If the request is report-only, write nothing and provide the exact Markdown and property mappings needed for manual execution.

### 8. Verify and report

After a successful write, fetch the created or updated page/row again when possible. Verify:

- title and key metadata
- content or property values
- relations and source traceability
- no duplicate was created
- requested visibility and destination were respected

Use `references/output-contract.md` for the capture report. Report what was created, updated, skipped, redacted, failed, and left pending.

## Privacy and public-repository boundary

This skill is generic and may be used with many Notion workspaces. Do not place a user's private page URLs, page IDs, database IDs, workspace links, access tokens, or copied private content into this public repository. Runtime configuration belongs in the user's environment, prompt, connector context, or an ignored local configuration file.

Privacy is about the destination and the user's authorization, not about making the skill exclusive to one account. The skill should explain how to use a connector effectively while leaving workspace-specific structure to runtime resolution.

If a user asks to export private Notion content into a public artifact, pause and identify the conflict. Offer a redacted/public-safe export or a private local artifact, and do not publish the private source by assumption.

## Reference loading

Load only what the request needs:

- `references/destination-contract.md`: resolve generic page, database, and data-source destinations.
- `references/output-contract.md`: capture report and row-level output shape.
- `references/platform-variants.md`: normalize source material from common AI platforms and files.
- `references/final-check.md`: verification checklist before reporting completion.
- `assets/report-template.md`: reusable report scaffold.
- `assets/trigger-eval-queries.json`: trigger and non-trigger examples for description testing.

## Output contract

Always report the mode (`write`, `append`, `update`, or `report_only`), resolved destination type, source coverage, created/updated/skipped/redacted items, verification result, and pending failures. If the connector cannot resolve or re-fetch the destination, do not claim completion.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
