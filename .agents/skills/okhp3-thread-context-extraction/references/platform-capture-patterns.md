# Cross-Platform Capture Patterns

Reviewed: 2026-07-21

This reference makes the generic skill useful when a pasted transcript comes
from an unknown or mixed platform. Product capabilities below are sourced from
current first-party documentation. Clipboard signatures are local parsing
heuristics because vendors do not guarantee a stable control-all copy format.

## Universal turn-boundary hierarchy

Apply these cues from strongest to weakest:

1. Explicit role labels such as `You`, `User`, `Human`, `Assistant`, `ChatGPT`,
   `Claude`, `Gemini`, `Copilot`, `Perplexity`, `Grok`, `Vibe`, or `Le Chat`.
2. Export or structured fields such as `role: user`, `role: assistant`, message
   node metadata, or clear speaker headings.
3. Repeated response controls such as Copy, Retry, Rewrite, Sources, feedback,
   or model details. These usually terminate an assistant response; record them
   as UI chrome, not semantic prose.
4. Composer or prompt markers followed by a long text block, then a response
   action row. Treat this as a probable user-to-assistant boundary.
5. Alternation based on discourse. Use only when stronger cues are absent and
   set `role_confidence: low`.

Never classify a turn by writing style alone. A user can paste polished prose,
and an assistant can quote the user. Preserve uncertain blocks as `role:
unknown` instead of forcing alternation.

## Universal content-element taxonomy

Catalog every non-plain-text element before summarizing:

| Type | Includes | Required capture |
|---|---|---|
| `image` | Uploaded, generated, edited, screenshot, chart image | owner turn, caption or alt text, locator, fidelity, availability |
| `file` | PDF, Markdown, document, spreadsheet, presentation, code, archive | filename, type, owner turn, supplied or referenced, availability |
| `canvas` | ChatGPT Canvas, Gemini Canvas, Copilot Page, Vibe Canvas | title, type, version state, supplied content or missing-content marker |
| `artifact` | Claude Artifact, interactive app, SVG, standalone document | artifact type, version, code/content availability, owner turn |
| `diagram` | Mermaid, SVG, flowchart, schematic, interactive visual | source syntax if supplied, rendered-only status otherwise |
| `citation` | Inline citation, source card, bibliography, linked claim | label, URL if supplied, owning claim or turn, verification status |
| `tool_event` | Search, research plan, connector call, code execution, progress | tool name, status, visible input/output, hidden-context warning |
| `generated_file` | Downloadable Markdown, PDF, DOCX, slides, CSV, code | filename, format, link or payload status, producing turn |
| `audio_video` | Voice input, audio overview, generated or uploaded media | type, transcript status, duration if supplied, availability |
| `ui_chrome` | Copy, Retry, Sources, feedback, menus, timestamps | boundary evidence only; exclude from semantic summary |

Use one fidelity value per element: `verbatim`, `text-extracted`,
`description-only`, `metadata-only`, `referenced-not-supplied`, or
`unavailable`. Never silently replace an unavailable element with an assistant's
description of it.

## Platform signature matrix

| Platform | Prompt-side signals | Response-side signals | Sidecar or detached elements |
|---|---|---|---|
| ChatGPT | composer, attachment/add menu, tools or source selection, uploaded/reused files | prose, code, tables, inline citations, Sources action, generated files/images | Canvas, Library files, deep-research reports, maps or image result groups |
| Claude | chat input, slider/connectors controls, file attachments, Project context | conversational answer, citations, search indicator, code | Artifacts, multiple artifact versions, Project knowledge, Research output |
| Gemini | bottom text box, Add files, Canvas or Deep Research selection, Gem context | response, source links/cards, plan and report states | Canvas docs/apps/slides/code, Deep Research report, charts/diagrams/simulators, Audio Overview |
| Perplexity | search query box, mode/model/source selectors, attachments, microphone | answer with sources, follow-ups, model/source metadata | source list, Research/Create outputs, exported PDF/Markdown/DOCX, Project context |
| Microsoft Copilot | `Message Copilot` compose box, Add and manage sources, referenced work content | answer, citations or grounded references, response actions | Copilot Pages, files/emails/meetings/people references, agents, generated Microsoft 365 content |
| Grok | message input, mode selection, attachments, voice | answer, web/X citations, agent or reasoning progress | generated images/video, Canvas, uploaded files, connector results |
| Mistral Vibe | Work/Chat/Code surface, prompt, files, connector context | answer, plan, progress, visible tool calls, approval requests | Canvas tabs, documents/slides/code/data, remote code session output, connector results |

## Platform facts and first-party sources

### ChatGPT

OpenAI documents a composer attachment menu, uploaded and generated files,
search responses with inline citations and a Sources action, image results, and
Canvas as a separate right-side workspace that can export Markdown, Word, PDF,
or code files.

- https://help.openai.com/en/articles/20001052-file-storage-and-library-in-chatgpt/
- https://help.openai.com/en/articles/9237897-chatgpt-search
- https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt
- https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview

### Claude

Anthropic documents chat input controls, file uploads, Projects with knowledge
and instructions, web/research responses with citations, and Artifacts in a
separate pane. Artifacts can be Markdown/plain-text documents, code, HTML, SVG,
diagrams, flowcharts, or React components and can have multiple versions.

- https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- https://support.anthropic.com/en/articles/8241126-what-kinds-of-documents-can-i-upload-to-claude-ai
- https://support.anthropic.com/en/articles/10684626-enabling-and-using-web-search
- https://support.anthropic.com/en/articles/9517075-what-are-projects

### Gemini

Google documents a bottom text box with Add files, file and image uploads,
Canvas for docs/apps/slides/code, Deep Research with selectable sources and a
research plan, and reports that can include charts, diagrams, schematics, and
interactive simulators. Canvas/report content can be copied or exported.

- https://support.google.com/gemini/answer/14903178
- https://support.google.com/gemini/answer/16047321
- https://support.google.com/gemini/answer/15719111
- https://support.google.com/gemini/answer/15236321

### Perplexity

Perplexity documents a Search query box, Search Mode/model/source selectors,
attachments, sessions containing initial and follow-up questions, responses and
sources, plus Copy, Rewrite, Source, and export actions. Exports can be PDF,
Markdown, or DOCX.

- https://www.perplexity.ai/help-center/en/articles/10354769-what-is-a-thread
- https://www.perplexity.ai/help-center/en/articles/10352961-what-are-spaces
- https://www.perplexity.ai/help-center/en/articles/10354939-what-s-the-difference-between-typing-a-question-and-uploading-a-file-or-image

### Microsoft Copilot

Microsoft documents the `Message Copilot` compose box, Add and manage sources,
references to files, people, meetings, and email, work/web grounding, and
Copilot Pages as an editable canvas made from responses.

- https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-microsoft-365-copilot-chat
- https://support.microsoft.com/en-us/microsoft-365-copilot/add-content-to-microsoft-365-copilot-chat-prompts
- https://support.microsoft.com/en-us/microsoft-365-copilot/what-information-does-copilot-use-to-answer-my-prompt
- https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-microsoft-365-copilot-pages

### Grok

xAI documents natural multi-turn chat, a plus control for files, broad file and
media inputs, live web/X citations, generated images and video, Canvas, and
connector-backed results. Grok can surface tool or multi-agent progress.

- https://docs.x.ai/grok/overview
- https://docs.x.ai/grok/faq
- https://x.ai/grok
- https://help.x.com/en/using-x/about-grok

### Mistral Vibe

Mistral documents three surfaces: Work, Code, and turn-based Chat. Vibe can use
attached files, connected tools, web context, plans, visible tool calls,
approval prompts, and Canvas for text, data, code, and presentations. Multiple
Canvases can appear as tabs with version history.

- https://docs.mistral.ai/vibe/overview
- https://docs.mistral.ai/vibe/choose-chat-work-code
- https://docs.mistral.ai/vibe/work/files-and-canvas
- https://docs.mistral.ai/vibe/work/web-search-open-url

## Normalization exit gate

Do not start semantic extraction until all supplied blocks have a ledger entry,
every turn has a role and confidence, every non-text element has a type and
fidelity, UI chrome has been separated, and unresolved ownership conflicts are
listed. Passing this gate proves coverage of the supplied paste, not completeness
of the original source thread.
