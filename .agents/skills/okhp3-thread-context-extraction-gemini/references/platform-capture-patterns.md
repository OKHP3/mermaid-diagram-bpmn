# Gemini Capture Patterns

Reviewed: 2026-07-21

## Verified current structure

Google documents a bottom text box with Add files, file/image/Drive/code inputs,
Gems with reusable instructions, Canvas for docs/apps/slides/code, and Deep
Research with source selection, an editable research plan, a report, and optional
visuals such as charts, diagrams, schematics, and interactive simulators. Canvas
and reports can be copied or exported to Google formats.

Sources:

- https://support.google.com/gemini/answer/14903178
- https://support.google.com/gemini/answer/16047321
- https://support.google.com/gemini/answer/15719111
- https://support.google.com/gemini/answer/15236321

## Paste-boundary heuristics

1. Prefer explicit `You`, `User`, `Gemini`, or structured role metadata.
2. A prompt block followed by a Gemini response and action/source row is one
   user-to-assistant pair; action labels are `ui_chrome`.
3. Research plan, research progress, report, and report visuals are separate
   `tool_event`, `canvas`, and visual elements attached to the initiating turn.
4. A Canvas title/card is not its payload. Record content only when the Canvas
   text, code, slides, or app source is actually supplied.
5. Gem instructions, Workspace sources, Drive files, and NotebookLM notebooks
   remain `referenced-not-supplied` unless pasted or uploaded.

## Rich-element handling

- Uploaded image/file/code folder/repository: owner `user`; capture name/type,
  source location class, and payload fidelity.
- Canvas: type as doc, app, slides, code, report, quiz, infographic, or web page
  when supplied; record version and copy/export state.
- Deep Research: keep source-selection card, plan, report, citations, and each
  chart/diagram/simulator as distinct elements.
- Audio Overview or other derivative: record as `audio_video` with transcript
  state; never infer audio content from the source report.
- Rendered visual without source syntax is `description-only`, not a recovered
  diagram or app.
