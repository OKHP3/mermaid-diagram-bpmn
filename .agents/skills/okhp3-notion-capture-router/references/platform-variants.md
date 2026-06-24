# Platform Variants

Use this reference to tune the same capture workflow for different AI platforms.

## ChatGPT

Use a project-level skill file as the controlling artifact. Keep unrelated files out of scope during ingestion unless they are source material.

## Claude

Use a project or skill package. Preserve the same two-layer output model: Chat Threads plus Extracts.

## Perplexity

Use for research-heavy intake. Preserve source citations in the source artifact and store distilled nuggets in Notion.

## Copilot

Use exported or copied content as the source artifact, then ingest through the router.

## Gemini

Use exported summaries, notes, markdown, or PDF artifacts as the source material.

## PDF exports

Recover platform, title, date, source link, file name, and export date when available. Mark absent metadata as unknown or pending.

## Platform-neutral rule

The source platform is not the system of record. Notion is the knowledge hub. GitHub is the artifact layer. The AI platform is the quarry.
