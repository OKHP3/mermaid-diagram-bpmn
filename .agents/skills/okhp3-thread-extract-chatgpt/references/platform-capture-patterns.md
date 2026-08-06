# ChatGPT Capture Patterns

Reviewed: 2026-07-21

## Verified current structure

OpenAI documents a composer with an attachment/add menu and tools or source
selection. A response can contain prose, Markdown, code, tables, generated or
uploaded files, images, inline citations, and a Sources action. Canvas opens as
a separate right-side workspace and can contain editable writing, code, rendered
HTML/React, version history, and downloadable Markdown, Word, PDF, or code files.
Deep Research can produce cited reports with tables and images.

Sources:

- https://help.openai.com/en/articles/20001052-file-storage-and-library-in-chatgpt/
- https://help.openai.com/en/articles/9237897-chatgpt-search
- https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt
- https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview
- https://help.openai.com/en/articles/7260999-how-do-i-export-my-data

## Paste-boundary heuristics

Clipboard structure is not guaranteed. Apply these cues in order:

1. Explicit `You`, `User`, `ChatGPT`, or structured `role` fields.
2. User bubble or prompt block followed by a ChatGPT response and its action row.
3. `Sources`, Copy, Retry/Regenerate, feedback, or model/action controls as the
   likely end of an assistant turn. Catalog these as `ui_chrome`.
4. Canvas title or file chip adjacent to a response attaches to that assistant
   turn unless explicit evidence says the user uploaded it.
5. If only alternating prose remains, use low confidence and record the conflict.

Do not treat text quoted inside a response as a new user turn. Do not treat the
composer placeholder, suggested prompts, model name, or action labels as content.

## Rich-element handling

- Uploaded file or image: owner is `user`; record filename/type and whether the
  payload, OCR, description, or only a chip survived the paste.
- Generated image or file: owner is `assistant`; retain prompt relationship,
  caption/alt text, file name, link state, and `unavailable` when payload is absent.
- Canvas: create one `canvas` element per title/version supplied. Capture content
  separately from the assistant message that announced or summarized it.
- Search or Deep Research: attach each citation/source card to the owning claim
  or response. A Sources button alone means `referenced-not-supplied`.
- Code, table, Mermaid, SVG, or chart: preserve source syntax when present;
  otherwise catalog the rendered element as `description-only`.
