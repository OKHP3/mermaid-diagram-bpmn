# AI Terminology Taxonomy

## The Stack Model (Most Useful Mental Model)

```
Prompt          → A request (single, ephemeral)
Chat            → A conversation (session, ephemeral unless saved)
Thread          → A conversation stored server-side (API construct)
Project         → An organized workspace (multiple chats + files + instructions)
Custom GPT      → A packaged product (identity + workflow + instructions + knowledge + tools + distribution)
Agent           → An autonomous actor (goals + memory + planning + tool use + execution without user per turn)
Multi-agent     → A network of agents composing and delegating to each other
```

Each level is a superset of capabilities of the level below.
A Custom GPT is not an Agent in the full sense. An Agent is not just a Custom GPT with more tools.
The distinction is **autonomy** — who decides what to do next, and when.

---

## 16-Term Taxonomy

### 1. Chat / Conversation
**What it is:** A single conversation thread with the AI. The atomic unit of interaction
on every platform.

**How it differs from Custom GPT:** A Chat is ephemeral and unstructured. A Custom GPT
wraps a Chat in persistent configuration. Every GPT conversation is a Chat, but not
every Chat happens inside a GPT.

**Layer:** Session

---

### 2. Thread (OpenAI Assistants API)
**What it is:** The API-side equivalent of a conversation. A Thread stores message
history for a specific user session with an Assistant.

**How it differs from Custom GPT:** Threads are a developer/API concept. Custom GPTs
are a consumer/UI concept. They solve the same state-management problem (remembering
what was said) at different stack layers. Developers manage Threads via API; users never
see them.

**Layer:** API / Infrastructure

---

### 3. Prompt / System Prompt / Custom Instructions
**What it is:** Text directives that shape AI behavior.
- "Prompt" = a single user message
- "System prompt" = hidden behind-the-scenes instruction set
- "Custom Instructions" (ChatGPT) = user-level personalization applied to ALL conversations

**How it differs from Custom GPT:** A prompt is a single message. Custom Instructions
apply globally to an account. A Custom GPT's Instructions apply only within that GPT.
The GPT is the packaging; the system prompt is one component inside it.

**Layer:** Configuration

---

### 4. Project (ChatGPT Projects, Claude Projects)
**What it is:** A persistent workspace grouping conversations, files, and instructions
around a shared context. In ChatGPT, a Project can have its own instructions and files.
In Claude, a Project bundles a system prompt, knowledge documents, and conversation threads.

**How it differs from Custom GPT:** Projects are workspaces **for the builder.**
Custom GPTs are products **for users.** A Project keeps your working context organized
across multiple conversations; a Custom GPT packages a finished experience for someone
else (or your future self). Projects are collaborative scratch space; GPTs are deployed tools.

**One-liner:** Projects are workspaces for builders. GPTs are products for users.

Note: Projects (not GPTs) get deep research, agent mode, and project-only memory.
GPTs remain capped at 20 knowledge files and have no persistent memory between conversations.

**Layer:** Workspace / Organization

---

### 5. Connector
**What it is:** A pre-built, managed integration that lets an AI system access external
data sources. Microsoft 365 Copilot connectors bridge to third-party systems
(Salesforce, ServiceNow, SAP, etc.) via the Microsoft Graph.

Note: OpenAI's "Connectors" were renamed "Apps" on December 17, 2025. When you see
"Connectors" in OpenAI documentation, it refers to what is now called "Apps."

**How it differs from Custom GPT:** Connectors are plumbing — they make data available.
A Custom GPT's Actions are the closest equivalent, but require the builder to create and
maintain the integration via OpenAPI schemas. Connectors are managed infrastructure;
Actions are DIY wiring.

**Layer:** Infrastructure / Integration

---

### 6. Plugin (ChatGPT Plugins, deprecated)
**What it is:** The predecessor to Custom GPTs and Actions. Launched March 2023,
deprecated late 2023/early 2024. Plugins were pre-approved, publicly listed integrations
that users could toggle on/off in any conversation.

**How it differs from Custom GPT:** Plugins were generic and user-installed. Custom GPTs
absorbed the plugin concept: the builder bakes integration into the GPT via Actions, so
the user never configures anything. Plugins were "app store add-ons." GPTs are
"pre-configured appliances." Consider Plugins fully deprecated for new builds.

**Layer:** Integration (Legacy)

---

### 7. MCP (Model Context Protocol)
**What it is:** An open protocol (originated by Anthropic, adopted across platforms) that
standardizes how AI systems connect to external tools and data sources. A universal
adapter spec for AI-to-tool communication.

**How it differs from Custom GPT:** MCP is an interoperability standard. Custom GPT
Actions are a proprietary integration mechanism locked to OpenAI's platform. MCP lets
any AI system connect to any tool using the same protocol. Actions only work inside
ChatGPT GPTs.

**Analogy:** MCP is USB-C. Actions are a proprietary charging cable.

**Layer:** Protocol / Standard

**Implication for builders:** Design new integrations to be MCP-compatible where possible.
This future-proofs the integration for cross-platform use as MCP adoption grows.
OpenAI's "Apps" surface (renamed from Connectors in December 2025) is built on MCP.

---

### 8. RAG (Retrieval-Augmented Generation)
**What it is:** The architectural pattern of retrieving relevant documents from a knowledge
base and injecting them into the model's context before generating a response. The model
"looks things up" rather than relying solely on training data.

**How it differs from Custom GPT:** RAG is the underlying technique. Custom GPT Knowledge
files are one simplified RAG implementation. You can also build RAG systems independently
via the API with your own vector store, embedding model, and retrieval pipeline — giving
far more control over chunking strategy, relevance scoring, and re-ranking.

**Layer:** Architecture Pattern

---

### 9. Agent
**What it is:** An AI system that can take autonomous actions, make decisions, chain
multiple tool calls, and operate with varying degrees of independence. The term ranges
from "a chatbot that can call an API" to "a fully autonomous system that plans and
executes multi-step workflows without human involvement per step."

**How it differs from Custom GPT:** Custom GPTs are reactive — they respond to user turns.
They can call tools (Actions, Code Interpreter) but don't run autonomously. They don't
chain decisions across sessions. They don't have persistent memory between conversations.

**The autonomy spectrum:**
```
Custom GPT (reactive) → Tool-using GPT → Agent (planned steps) → Autonomous Agent → Multi-agent system
```

**Important nuance (2025–2026):** Modern ChatGPT increasingly contains tool orchestration,
MCP, connectors, and multi-step task execution. The boundary between "Custom GPT with
Actions" and "Agent" is blurring. Treat the distinction as a spectrum, not a binary.
Custom GPTs sit at the low-autonomy end of that spectrum.

**Layer:** Autonomy / Execution Model

---

### 10. Skill
**What it is:** A modular, reusable capability package.
- In Claude's environment: folders of instructions and tool configurations for specific tasks
- In Copilot Studio: discrete functional units an agent can invoke
- In agentskills.io standard: portable SKILL.md files defining agent capabilities

**How it differs from Custom GPT:** Skills are components. Custom GPTs are compositions.
A GPT might use multiple skills (Web Search, Code Interpreter, a custom Action) as part of
its configured toolset. The GPT is the orchestration layer; skills are the capabilities
being orchestrated.

**Layer:** Component / Module

---

### 11. Assistant (OpenAI Assistants API)
**What it is:** The API-level construct that mirrors Custom GPTs. An Assistant has
instructions, tools (code interpreter, file search, function calling), and a model.
Developers interact with Assistants programmatically via Threads and Runs.

**How it differs from Custom GPT:** Assistants are the developer-facing, API-accessible
version of what Custom GPTs are in the consumer UI. Same core architecture, different
access layer. Assistants offer more control (streaming, function calling schemas, file
search tuning) but require code to build and deploy.

Note: The Assistants API allows up to 256,000 characters for instructions. The Custom GPT
builder UI caps at ~8,000 characters.

**Layer:** API / Developer

---

### 12. Fine-Tuning
**What it is:** Training a model on your own dataset to permanently alter its weights
and behavior. The model itself changes, not just the prompt.

**How it differs from Custom GPT:** Custom GPTs don't touch the model. They configure
it at inference time. Fine-tuning changes what the model knows and how it responds at
the weight level. Fine-tuning is expensive, requires data preparation, and produces a
distinct model version.

**When fine-tuning wins over Custom GPTs:**
- Extremely consistent output format is required (e.g., structured JSON every time)
- Domain-specific vocabulary that the base model doesn't have
- Latency is critical and the system prompt is very long

**For 95% of use cases:** A well-constructed Custom GPT with good knowledge files
outperforms a lazily fine-tuned model.

**Layer:** Model

---

### 13. Gem (Google Gemini)
**What it is:** Google's equivalent of a Custom GPT inside Gemini. Bundles Name,
Instructions, optional Default Tool, and optional Knowledge files into a reusable assistant.

**Key differences from Custom GPT:**
- Free to create (no paid plan required for basic Gems)
- 1M token context window (vs. ~128K for ChatGPT)
- Live Google Drive sync for knowledge files
- No custom API Actions
- Single tool selector (vs. multiple binary toggles)

**Layer:** Product (Competitor Construct)

---

### 14. Declarative Agent (Microsoft Copilot)
**What it is:** Microsoft's Custom GPT equivalent inside Microsoft 365 Copilot and
Copilot Studio. Defined via structured manifest (declarative config) rather than
free-text instructions only.

**Key differences from Custom GPT:**
- Knowledge layer is the Microsoft Graph (org-wide SharePoint, Teams, email, OneDrive)
- A2A (agent-to-agent) protocol for multi-agent composition
- Power Automate integration for workflow automation
- IT admin governed; tenant-level controls
- Higher licensing cost; enterprise target

**Layer:** Product (Competitor Construct)

---

### 15. Knowledge File
**What it is:** An uploaded reference document inside a Custom GPT that the model can
retrieve from during conversation (via RAG).

**Distinct from:** The model's training data (permanent), fine-tuning datasets (permanent),
and Actions data (live/dynamic). Knowledge files are static at upload time. For live data,
use Actions.

**Layer:** Data / Content

---

### 16. Custom Instructions (ChatGPT account-level)
**What it is:** A user-level personalization layer in ChatGPT that applies to ALL
conversations (unless inside a Custom GPT that overrides it). Set in Settings →
Personalization → Custom Instructions.

**How it differs from Custom GPT Instructions:** Account-level Custom Instructions apply
globally and are set by the user. Custom GPT Instructions are set by the builder and
apply only within that GPT. When a user opens a Custom GPT, the GPT's instructions
take precedence.

**Layer:** Configuration (User-level)

---

## Summary Taxonomy Table

| Concept | Layer | Persistence | Who Configures | Closest GPT Equivalent |
|---|---|---|---|---|
| Chat / Conversation | Session | Ephemeral | N/A | A single GPT conversation |
| Thread | API / Infrastructure | Per-session, server-stored | Developer | Conversation state |
| Prompt / System Prompt | Configuration | Per-message or per-session | Developer / Builder | GPT Instructions |
| Custom Instructions | Configuration | Account-wide | User | Global layer under all GPTs |
| Custom GPT | Product | Persistent, versioned | Builder | (itself) |
| Project | Workspace | Persistent | Builder | No direct equivalent |
| Connector / App | Infrastructure | Admin-managed | IT Admin / User | Actions (managed equivalent) |
| Plugin | Integration (Legacy) | User-installed | Deprecated | Absorbed into Actions |
| MCP | Protocol / Standard | Platform-independent | Platform | Actions (proprietary equivalent) |
| RAG | Architecture Pattern | Varies | Developer | Knowledge file retrieval |
| Agent | Autonomy Model | Varies | Developer | GPT = low-autonomy end of spectrum |
| Skill | Component / Module | Reusable | Developer / Builder | Individual Capability or Action |
| Assistant (API) | API / Developer | Persistent | Developer | API-side mirror of Custom GPT |
| Fine-Tuning | Model | Permanent (new model version) | ML Engineer | No equivalent; different approach |
| Knowledge File | Data / Content | Static at upload | Builder | (itself) |
| Gem | Product (Google) | Persistent | Builder | Direct competitor construct |
| Declarative Agent | Product (Microsoft) | Persistent, governed | Builder + IT Admin | Direct competitor construct |
| Custom Instructions | Configuration (User) | Account-wide | User | Global prompt layer |
