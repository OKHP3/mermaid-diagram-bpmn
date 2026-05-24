# Prompt Scaffold Patterns — okhp3-mermaid-theme-builder

Reusable prompt-pack formats for enforcing visual governance in AI-generated Mermaid diagrams. These patterns work as session-level instructions in any LLM chat interface.

---

## What Prompt Scaffolds Are For

A prompt scaffold is a session-level instruction block you paste before making diagram requests. It governs all diagrams generated in that session:
- Forces the LLM to prepend the `%%{init}%%` block on every diagram
- Prevents the LLM from inventing colors or using default Mermaid themes
- Keeps all 21 themeVariables consistent across multiple diagrams in one document

**Use prompt scaffolds when:**
- Working in Claude, ChatGPT, Gemini, or any chat-based LLM on a diagram-heavy task
- Producing multiple diagrams that must share a visual identity
- Documenting a process or system where brand consistency matters
- Generating bpmn-beta diagrams that will also receive theming from `okhp3-mermaid-theme-builder`

**Do not use prompt scaffolds for:**
- Single one-off diagrams (just apply theming directly)
- Platforms with native Mermaid config support (use `mermaid.initialize()` instead)

---

## Pattern 1: Full Session Governance (all diagram types)

Paste at the start of a session before any diagram request.

```
When generating Mermaid diagrams for this conversation, always include the following theme initialization block at the top of every diagram, before the diagram type keyword:

%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '[value]', 'primaryTextColor': '[value]', 'primaryBorderColor': '[value]', 'secondaryColor': '[value]', 'secondaryTextColor': '[value]', 'secondaryBorderColor': '[value]', 'tertiaryColor': '[value]', 'tertiaryTextColor': '[value]', 'tertiaryBorderColor': '[value]', 'background': '[value]', 'mainBkg': '[value]', 'nodeBorder': '[value]', 'clusterBkg': '[value]', 'clusterBorder': '[value]', 'lineColor': '[value]', 'edgeLabelBackground': '[value]', 'fontFamily': 'Segoe UI, sans-serif', 'fontSize': '14px', 'labelBackground': '[value]', 'labelTextColor': '[value]', 'titleColor': '[value]' } }}%%

Rules:
- Always use 'theme': 'base'. Never use 'default', 'dark', 'forest', or 'neutral'.
- Preserve all themeVariables exactly. Do not substitute, approximate, or omit any variable.
- Place the %%{init}%% block on the first line, before the diagram type keyword.
- For flowchart diagrams, add classDef statements for nodes that need semantic color differentiation.
- Do not add inline style declarations that override themeVariables unless explicitly requested.
```

---

## Pattern 2: BPMN-Specific Governance (bpmn-beta sessions)

Use when the session will generate bpmn-beta diagrams using the `okhp3-bpmn-for-mermaid` skill.

```
When generating bpmn-beta diagrams for this conversation, always include the following theme initialization block before the bpmn-beta keyword:

%%{init: { 'theme': 'base', 'themeVariables': { [21 variables] } }}%%

bpmn-beta rules:
- The %%{init}%% block must appear before 'bpmn-beta', not after.
- Start every diagram with 'bpmn-beta' (no quotes in the diagram, this is the keyword).
- Follow all okhp3-bpmn-for-mermaid DSL rules: use stable IDs, double-quoted labels, sequence flows inside pool scope.
- Do not use invented bpmn-beta syntax such as task("Label")@{ type: "userTask" }.
- Include accTitle and accDescr when the subject is known.
```

---

## Pattern 3: Lightweight Single-Palette Reminder

Shorter version for mid-session reminders when the LLM has drifted from the palette.

```
Reminder: all Mermaid diagrams in this session must use this init block:

%%{init: { 'theme': 'base', 'themeVariables': { [21 variables] } }}%%

Do not use any other theme. Do not omit or change any variable.
```

---

## Pattern 4: Multi-Document Handoff

For passing the palette constraint from one session to a new one or to a different collaborator.

```
Visual governance specification for Mermaid diagrams — [Project Name]

Palette: [Display Name]
Source: https://okhp3.github.io/mermaid-theme-builder/

Apply this init block to every Mermaid diagram in this project:

%%{init: { 'theme': 'base', 'themeVariables': { [21 variables] } }}%%

Usage:
- Paste before each diagram code block in Markdown documents
- For site-wide application, pass the themeVariables object to mermaid.initialize()
- When asking an AI assistant to generate diagrams, paste this block at the start of the session

Renderer notes:
- GitHub and GitLab strip the %%{init}%% block. Diagrams will render with platform default theme.
- Notion does not support theming. Export as SVG image for branded Notion embeds.
- For supported renderers (Obsidian, VS Code, Docusaurus, VitePress, Mermaid Live), the full palette applies.
```

---

## Prompt Scaffold vs. Other Export Modes

| Mode | Best for | Format |
|---|---|---|
| `prompt-scaffold` | Session-level LLM governance | Plain text, paste into chat |
| `theme-bootstrap` | Document-level Markdown | HTML comment + `%%{init}%%` line |
| `theme-json` | Programmatic config | JSON for `mermaid.initialize()` |
| `styled-mermaid` | Single diagram | Fenced code block with init block |

---

## Platform Caveat

Prompt scaffold effectiveness varies by LLM:
- **Claude:** High compliance; maintains init block across many turns
- **ChatGPT (GPT-4o):** High compliance in the same session; may drift across very long sessions
- **Gemini:** Moderate compliance; may simplify the init block if the session is long
- **GitHub Copilot:** Best results when the scaffold is in a system prompt or `.github/copilot-instructions.md`
- **Cursor:** Best results when the scaffold is in `.cursorrules` or a system prompt file

For persistent enforcement, combine the prompt scaffold with `mermaid.initialize()` in your project configuration where supported.
