---
name: okhp3-notion-capture-router
description: Use this skill when converting ChatGPT, Claude, Perplexity, Copilot, Gemini, PDF exports, or pasted AI conversations into Jamie's Notion knowledge hub. Routes a thread through Notion anchors, classifies Origin, dedupes against Chat Threads and Extracts, splits reusable nuggets into rows, reconciles against OKHP3 GitHub repos, and reports whether the material is duplicate, complementary, or net new. Use for thread inventory, capture-and-route, ideation router, Notion ingestion, second-brain migration, archive readiness, cross-platform memory consolidation, and chat-to-Notion workflows.
license: MIT
compatibility: Requires access to Jamie's Notion workspace connector. GitHub reconciliation requires access to OKHP3 repositories. Do not commit private Notion URLs.
metadata:
  author: OKHP3
  version: "0.1.0"
  maturity: draftable
  family: notion
---

# OKHP3 Notion Capture Router

Turn a long AI conversation into durable Notion knowledge without dumping transcript sludge into the brain.

This skill is the ingestion layer for ChatGPT, Claude, Perplexity, Copilot, Gemini, PDF exports, and pasted thread summaries. It decides whether a thread is duplicate, complementary, or net new, then routes it into the Notion knowledge hub as two layers:

1. A **Chat Threads** record for the whole conversation.
2. One or more **Extracts** records for reusable nuggets.

## Use this skill when

Use this skill when the user asks to:

- capture, route, archive, centralize, ingest, inventory, migrate, audit, or dedupe AI conversations
- move a ChatGPT, Claude, Perplexity, Copilot, Gemini, PDF export, or pasted transcript into Notion
- determine whether a thread is already captured, complementary, or net new
- compare a thread against existing Notion pages, Chat Threads, Extracts, Domains, Projects, or OKHP3 GitHub repos
- create a reusable capture prompt, ingestion router, ideation router, or archive workflow
- reduce a large conversation into thread-level and nugget-level knowledge

Do not use this skill for generic note-taking, general Notion advice, or writing a single summary unless the user asks for routing, dedupe, extraction, archival, or cross-platform knowledge reuse.

## Private anchor rule

This public skill must not hard-code private Notion URLs, database IDs, collection IDs, workspace links, or connector-only resource IDs.

The runtime agent should obtain the private anchors from the user's project files, current prompt, connector context, or a non-committed file named:

```text
routing-anchors.private.md
```

Use `references/routing-anchors.md` for the public role contract and expected anchor types.

## Core workflow

### 1. Load the anchor map

Load the private anchor map before writing anything.

Minimum anchor roles:

- Brain hub
- Intake page
- Chat Threads database
- Extracts database
- Domains database
- Projects database
- Notion to GitHub routing hub
- Master Page Index
- Relationship Mindmap

If anchors are missing, continue with best effort in report-only mode. Do not fabricate page URLs, database IDs, or relations.

### 2. Run the boundary gate

Classify Origin before writing:

| Origin | Meaning | Default action |
|---|---|---|
| `JMH` | Jamie personal, family, identity, life, personal learning | May write to personal brain |
| `OKH` | OverKill Hill, Glee-fully, AskJamie, public portfolio, side-project IP | May write to personal or OKHP3 brain |
| `WORK` | Day job or employer-confidential material | Do not write to personal brain unless explicitly public-safe and sanitized |
| `MIX` | Blended or ambiguous material | Extract only public-safe and reusable thinking, then flag the boundary |

Stop or switch to report-only if the thread contains sensitive private material that should not be preserved outside the source platform.

### 3. Produce the thread summary

Create a thread-level summary that includes:

- platform
- date, if known
- working title
- purpose and user intent
- main topics
- decisions
- frameworks or prompts
- open loops
- deliverables created
- why the thread matters

The summary is not the archive. It is the index card.

### 4. Extract nuggets

Split the thread into one Extract per reusable idea. Do not merge unrelated insights.

Valid extract types:

- Decision
- Framework
- Prompt
- Checklist
- Definition
- Outline
- Draft
- Research Finding

Capture rejected options and rationale when they explain why the final decision matters.

When uncertain, keep the nugget with `Confidence = Low` rather than dropping it.

### 5. Route through Domains

Use the Domains anchor as the routing authority. Match against:

- Domain name
- Description
- Rules / boundaries
- Routing Notes
- Hub Page URL
- Parent domain

If one domain clearly fits, assign it.

If two domains plausibly fit, report both and choose the higher-confidence primary route. Do not invent a new Domain unless the current taxonomy has no defensible home.

### 6. Dedupe at two layers

Run dedupe separately:

1. **Thread-level dedupe** against Chat Threads.
2. **Nugget-level dedupe** against Extracts.

Classify each item:

| Classification | Meaning | Action |
|---|---|---|
| `duplicate` | Already captured with same substance | Link or update existing record, do not create another |
| `complementary` | Extends an existing page or extract | Update or append to the existing canonical item |
| `net-new` | Not represented elsewhere | Create a new thread row or extract row |
| `conflicted` | Similar material exists but disagrees | Flag for human review, preserve both until resolved |
| `unsafe-to-capture` | Private or unsuitable for Notion | Report only, do not write |

### 7. Write the Notion records

If writing is available and safe:

- Create or update one Chat Threads row.
- Create or update one Extracts row per reusable nugget.
- Relate Extracts back to the Source thread.
- Relate both layers to Domain and Project when available.
- Set Status deliberately:
  - Chat Threads: Inbox, Triaged, Active, Extracting, Extracted, Archived
  - Extracts: Captured, Needs review, In use, Canonical, Archived

Do not mark a thread `Archived` unless the archive gate passes.

### 8. Reconcile GitHub

Use the Notion to GitHub routing hub to identify whether a matching OKHP3 repository exists.

For each high-value nugget, check whether it already exists in the matching repo as code, markdown, README content, docs, skill files, or backlog items.

Output a gap table:

| Nugget | In Notion? | In GitHub? | Action |
|---|---:|---:|---|
| [title] | Y/N | Y/N | create, update, link, or ignore |

Do not create or update GitHub files unless the user asked for execution.

### 9. Apply the archive gate

A thread is archive-eligible only when all of these are true:

- Thread row has Title, Origin, Platform, Date if known, Domain, Summary, and Status.
- Extracts exist for all reusable nuggets worth keeping.
- Duplicate and complementary items were handled.
- At least one real backlink exists: source thread URL, domain hub, or repo anchor.
- Retrieval works on four axes:
  - Topic / Domain
  - Date
  - Origin
  - Canonical destination link

If any gate fails, set or recommend `Extracted`, not `Archived`.

## Output format

Use `assets/report-template.md` as the default report structure.

If the user asked for the actual Notion write, end with:

- what was created
- what was updated
- what was skipped
- what remains unresolved

If write access is unavailable, produce the exact rows that should be created and label the answer `report-only`.

## Gotchas

- The source thread URL is usually not available through the connector. Ask the user to paste it or mark Link as pending. Never fabricate it.
- ChatGPT Projects can contain unrelated files. During ingestion, the routing skill file should be the controlling artifact. Extra files may distract the model unless they are direct source material.
- PDF exports flatten metadata. Recover platform, title, date, and source URL manually when possible.
- Notion is the knowledge hub. GitHub is the installable artifact layer. Do not confuse them.
- A whole transcript is not knowledge. The extract layer is the durable value layer.
- Do not promote employer-specific material into public OKHP3 repos. Generalize it or leave it private.

## Reference loading

Load these only when needed:

- `references/routing-anchors.md`: anchor role contract and private URL handling.
- `references/output-contract.md`: exact field mapping and capture report rules.
- `references/platform-variants.md`: ChatGPT, Claude, Perplexity, Copilot, Gemini, and PDF handling.
- `references/final-check.md`: final self-check before writing or reporting.
- `assets/trigger-eval-queries.json`: trigger and non-trigger examples for description testing.
