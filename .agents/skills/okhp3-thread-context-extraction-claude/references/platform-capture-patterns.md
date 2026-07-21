# Claude Capture Patterns

Reviewed: 2026-07-21

## Verified current structure

Anthropic documents a chat input with connector/search controls, uploaded files,
Projects with instructions and knowledge, web or Research responses with
citations, and Artifacts displayed in a separate pane. Artifacts can be Markdown
or plain-text documents, code, single-page HTML, SVG images, diagrams,
flowcharts, or React components. Multiple Artifacts and versions can exist in a
single conversation.

Sources:

- https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- https://support.anthropic.com/en/articles/8241126-what-kinds-of-documents-can-i-upload-to-claude-ai
- https://support.anthropic.com/en/articles/10684626-enabling-and-using-web-search
- https://support.anthropic.com/en/articles/11088861-using-research-on-claude-ai
- https://support.anthropic.com/en/articles/9517075-what-are-projects

## Paste-boundary heuristics

1. Prefer explicit `Human`, `User`, `You`, `Assistant`, `Claude`, or export role
   metadata.
2. Treat the chat response plus its citations/action controls as one assistant
   turn. Search indicators and controls are `ui_chrome` or `tool_event`.
3. An Artifact title/card beside a response is a separate `artifact` element,
   not the full assistant message. Attach it to the creating assistant turn.
4. A later request to revise an Artifact is a user turn; the resulting Artifact
   version is a new element version, even if the chat prose is short.
5. If Project instructions, knowledge, or connector context are not pasted,
   record them as `referenced-not-supplied`, not as reconstructed system turns.

## Rich-element handling

- Uploaded file/image: owner `user`; record whether Claude saw text, PDF visuals,
  or only metadata. Non-PDF embedded visuals may not have been analyzed.
- Artifact: capture title, artifact type, version, code/content availability,
  rendered preview status, and relation to prior versions.
- Citation: map direct citations and source links to the response or claim. A
  search indicator alone does not preserve the sources.
- Diagram/flowchart/SVG/React: retain source syntax if copied; otherwise record
  the rendered item as `description-only` or `unavailable`.
- Generated download: record format and locator independently from the Artifact.
