# Notion Destination Contract

This reference defines a generic contract for resolving and writing to Notion. It does not prescribe a workspace hierarchy, database naming convention, or account-specific anchor map.

## Destination selection

Resolve the destination in this order:

1. An explicit page, database, or data-source URL/ID supplied by the user.
2. A destination supplied by the active project configuration or connector context.
3. A connector search for the user's named destination, followed by confirmation when multiple results match.
4. Report-only mode when no safe destination can be identified.

Never invent a Notion URL, UUID, relation target, database name, or property value.

## Page destination

Before writing to a page, fetch it and record:

- page title and location
- existing content relevant to the requested update
- child pages or databases
- whether the page is intended as a container, a full export, or an index

Choose the least destructive operation:

| Need | Preferred operation |
|---|---|
| Add a new capture | Append or create a child page |
| Correct a known section | Targeted content update |
| Refresh generated content | Full replacement only after checking child content |
| Change title or metadata | Property update |

Preserve child pages and databases unless deletion is explicitly authorized.

## Database and data-source destination

Fetch the database first. Many Notion integrations expose one or more data sources beneath a database; select the data source that matches the requested view or schema.

Record:

- title property name
- property types and allowed values
- relation targets
- templates and default values
- whether long content belongs in a row's page body or in a separate child page

Create a page/row only with properties supported by the fetched schema. Use the exact title property name, and use relation IDs returned by Notion rather than display names when the API requires IDs.

## Recommended generic schemas

These are patterns, not requirements. Adapt them to the fetched schema.

### Thread index

| Field | Purpose |
|---|---|
| Title | Searchable source title |
| Source platform | ChatGPT, Claude, PDF, Markdown, or other |
| Source date | Date of the source, if known |
| Captured at | Date/time of export |
| Source link | Original URL or file reference |
| Summary | Retrieval-oriented synopsis |
| Status | Inbox, Captured, Reviewed, Archived, or equivalent |

### Extract index

| Field | Purpose |
|---|---|
| Title | One reusable idea |
| Type | Decision, Framework, Prompt, Checklist, Definition, Outline, Draft, or Finding |
| Confidence | High, Medium, or Low |
| Source relation | Link to the thread/page record |
| Domain/project | Optional relation when supported |
| Status | Captured, Needs review, Canonical, or equivalent |

## Idempotency key

Prefer a stable matching key composed from the source link or file identifier, normalized title, source date, and destination scope. If no stable key exists, search by title plus source date and show possible matches before updating.

## Write modes

- **Preview:** show the proposed page content or property map without writing.
- **Report-only:** explain the destination and exact actions needed when access or authority is missing.
- **Create:** write only when no matching item exists.
- **Update:** modify a confirmed matching item.
- **Upsert:** search, update a confirmed match, or create when no match exists.

Default to preview or report-only when the destination, schema, visibility, or overwrite behavior is ambiguous.
