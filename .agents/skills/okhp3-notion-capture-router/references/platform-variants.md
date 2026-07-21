# Source Platform Variants

Normalize the source into the same capture model regardless of where it originated.

| Source | Handling |
|---|---|
| ChatGPT, Claude, Copilot, or Gemini | Preserve the conversation title, platform, date, source link when available, user request, assistant outputs, decisions, and open loops. |
| Perplexity or other research tool | Preserve citations and distinguish sourced findings from synthesis. |
| PDF export | Recover title, platform, date, file name, export date, and source link when available; mark unknown metadata explicitly. |
| Markdown, text, or pasted transcript | Treat the supplied text as the source artifact and record its file name or conversation context. |
| Existing Notion page | Fetch it first, preserve the source page relation, and classify the operation as copy, move, update, or reconcile. |

The source platform is not automatically the system of record. The user may choose Notion as the durable destination, a page as the full export, a database as the index, or both.
