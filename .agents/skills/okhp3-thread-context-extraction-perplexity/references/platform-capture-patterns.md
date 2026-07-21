# Perplexity Capture Patterns

Reviewed: 2026-07-21

## Verified current structure

Perplexity documents a Search query box with Search Mode, model, Sources,
attachments, and microphone controls. A session contains the initial question,
follow-up queries, responses, and sources. Response controls can include Export,
Rewrite, Source information, feedback, Copy, and a menu for Sources or deletion.
Exports can be PDF, Markdown, or DOCX. Projects can add custom instructions,
files, connectors, and shared sessions.

Sources:

- https://www.perplexity.ai/help-center/en/articles/10354769-what-is-a-thread
- https://www.perplexity.ai/help-center/en/articles/10352961-what-are-spaces
- https://www.perplexity.ai/help-center/en/articles/10354939-what-s-the-difference-between-typing-a-question-and-uploading-a-file-or-image
- https://www.perplexity.ai/help-center/en/articles/10352914-what-is-internal-knowledge-search

## Paste-boundary heuristics

1. Prefer explicit query/answer headings, `You`, `Perplexity`, or structured roles.
2. Treat a question followed by an answer, inline citations, and source/control
   row as one pair. Copy, Rewrite, Source, feedback, and menu text are `ui_chrome`.
3. A numbered citation marker belongs to the surrounding answer claim; a source
   card/list is a separate `citation` element.
4. Search Mode/model/source metadata describes the answer generation context and
   is not part of either speaker's prose.
5. Project instructions, connector sources, and uploaded files remain missing
   context unless their contents are included.

## Rich-element handling

- Preserve the question, follow-up order, answer, and sources as distinct linked
  records. Do not merge the source list into the assistant prose.
- For Research/Create output, catalog the report/app/file separately from the
  answer that announces it.
- Exported PDF/Markdown/DOCX is a `generated_file`; record whether the payload or
  only the export control survived.
- Uploaded document/image is user-owned; internal knowledge or connector file is
  `referenced-not-supplied` unless its payload is pasted.
- Citations are `source traces` until independently verified.
