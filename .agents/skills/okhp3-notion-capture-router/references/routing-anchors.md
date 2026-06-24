# Routing Anchors Contract

This reference defines the anchor roles required by `okhp3-notion-capture-router`.

Do not commit real private Notion URLs, database IDs, collection IDs, or connector-only resource IDs into this public repository.

At runtime, the agent should receive a private anchor map from the user's prompt, project files, connector context, or a non-committed file named:

```text
routing-anchors.private.md
```

## Required anchor roles

| Anchor role | Purpose | Required use |
|---|---|---|
| Brain hub | User intent, system doctrine, top-level knowledge architecture | Read first for operating context |
| Intake page | Front door for raw, unsorted incoming AI threads | Use only when no better route is known |
| Chat Threads database | Thread-level source record | Dedupe and create or update one row per source thread |
| Extracts database | Nugget-level durable knowledge | Create or update one row per reusable idea |
| Domains database | Routing authority | Match by rules, boundaries, routing notes, hub URL, and parent domain |
| Projects database | Active project relation | Attach thread and extracts when a specific project exists |
| Notion to GitHub routing hub | Repo to Notion anchor index | Resolve the matching OKHP3 repo and its canonical Notion anchor |
| Master Page Index | Physical and public-surface page index | Confirm structural root, visibility, and surface role |
| Relationship Mindmap | High-level map of domain tree and existing captures | Use for orientation and routing sanity checks |

## Private anchor map shape

A private map may use this shape:

```md
# routing-anchors.private.md

- Brain hub: [private Notion page URL]
- Intake page: [private Notion page URL]
- Chat Threads database: [private Notion database or data source URL]
- Extracts database: [private Notion database or data source URL]
- Domains database: [private Notion database or data source URL]
- Projects database: [private Notion database or data source URL]
- Notion to GitHub routing hub: [private Notion page URL]
- Master Page Index: [private Notion database URL]
- Relationship Mindmap: [private Notion page URL]
```

## Field expectations

### Chat Threads

Expected properties:

| Property | Purpose |
|---|---|
| Title | Thread title |
| Platform | ChatGPT, Claude, Perplexity, Copilot, Gemini, or Other |
| Origin | JMH, OKH, WORK, or MIX |
| Date | Source conversation date, if known |
| Domain | Relation to Domains |
| Project | Relation to Projects, if applicable |
| Summary | One-line or short summary for retrieval |
| Link | Source thread URL, or pending if unavailable |
| Status | Inbox, Triaged, Active, Extracting, Extracted, Archived |

### Extracts

Expected properties:

| Property | Purpose |
|---|---|
| Title | Nugget title |
| Type | Decision, Framework, Prompt, Checklist, Definition, Outline, Draft, or Research Finding |
| Confidence | High, Medium, or Low |
| Status | Captured, Needs review, In use, Canonical, or Archived |
| Next action | Concrete next step or review note |
| Source thread | Relation back to Chat Threads |
| Domains | Relation to Domains |
| Projects | Relation to Projects, if applicable |

### Domains

Expected properties:

| Property | Purpose |
|---|---|
| Domain | Domain name |
| Category | Recommended domain or core existing area |
| Status | Planned, Active, or Retired |
| Hub Page URL | Canonical destination |
| Description | Domain summary |
| Rules / boundaries | What belongs or does not belong here |
| Routing Notes | Practical routing guidance |
| Parent domain | Optional domain hierarchy |

## Missing anchors

If an anchor is missing:

1. Continue report-only.
2. State which anchor was missing.
3. Do not fabricate URLs or relation IDs.
4. Produce rows in copyable form for manual entry.
