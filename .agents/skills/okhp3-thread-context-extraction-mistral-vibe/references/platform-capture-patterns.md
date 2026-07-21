# Mistral Vibe Capture Patterns

Reviewed: 2026-07-21

## Verified current structure

Mistral documents Vibe Work, Code, and turn-based Chat. A prompt can use files,
web content, connected tools, Projects, or Skills. Vibe can show a plan, progress,
tool calls, clarifying questions, and approval requests. Work Canvas produces
and edits text, data, code, and presentations; multiple Canvases can appear as
tabs with versions. Code can surface file edits, commands, tests, and pull-request
work across CLI, editor, and remote sessions.

Sources:

- https://docs.mistral.ai/vibe/overview
- https://docs.mistral.ai/vibe/choose-chat-work-code
- https://docs.mistral.ai/vibe/work/files-and-canvas
- https://docs.mistral.ai/vibe/work/web-search-open-url

## Paste-boundary heuristics

1. Prefer explicit `You`, `User`, `Vibe`, `Le Chat`, or structured roles.
2. Record Work, Chat, or Code as `surface` only when visible. Do not infer it
   from tone.
3. Plan, progress, tool call, approval, and command/test blocks are `tool_event`
   elements between the initiating prompt and final assistant response.
4. Canvas tabs are separate `canvas` elements. A short assistant announcement
   does not contain the Canvas payload.
5. Code diffs, terminal output, remote-session status, and PR links are distinct
   elements with their own evidence and verification state.

## Rich-element handling

- Uploaded document/image/spreadsheet/folder: user-owned; record payload fidelity.
- Canvas: record title, text/data/code/presentation type, version, source/preview
  state, export format, and relationship to the creating turn.
- Tool or connector result: preserve visible input/output, approval state, and
  hidden-context warning. Never reproduce inferred connector data.
- Code edit/diff/test/command: catalog separately and do not treat a reported
  success as verified without actual output.
- Deep Research or web sources: map citations to claims; source controls without
  URLs are `referenced-not-supplied`.
