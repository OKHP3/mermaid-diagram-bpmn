# Grok Capture Patterns

Reviewed: 2026-07-21

## Verified current structure

xAI documents natural multi-turn chat, a plus control beside the message input
for broad file/media uploads, web and X search with live citations, generated
images and video, multi-agent/tool progress, Canvas for writing, connectors, and
shareable conversations. Grok can analyze documents, images, audio, video, code,
and Markdown files.

Sources:

- https://docs.x.ai/grok/overview
- https://docs.x.ai/grok/faq
- https://x.ai/grok
- https://help.x.com/en/using-x/about-grok
- https://x.ai/news/grok-1212

## Paste-boundary heuristics

1. Prefer explicit `You`, `User`, `Grok`, or structured roles.
2. A prompt followed by response text, citations, media, and response actions is
   one pair. Mode labels and action controls are UI chrome or generation metadata.
3. Agent-thinking or tool-progress lines are `tool_event` elements, not hidden
   reasoning to be rewritten as facts.
4. X posts and web result cards are `citation` elements attached to the response.
5. Generated image/video groups and Canvas are separate sidecar elements attached
   to the creating assistant turn.

## Rich-element handling

- Uploaded files/media are user-owned. Record actual filename/type, payload
  fidelity, and whether embedded visuals or audio transcripts survived.
- Generated images/video are assistant-owned; capture prompt relation,
  watermark/provenance text if supplied, caption, and payload availability.
- X/web citations preserve author/title/URL/timestamp only when supplied. Treat
  live claims as `needs verification`.
- Canvas is a separate `canvas` element. Capture content/source only when pasted.
- Connector results remain `referenced-not-supplied` unless visible output or
  source data is included.
