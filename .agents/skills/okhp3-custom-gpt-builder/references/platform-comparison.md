# Platform Comparison: Custom GPT vs. Gemini Gem vs. Copilot Declarative Agent

## One-Line Summaries

- **Gem** = saved expert prompt (lightest weight, Google-native, fastest to create)
- **Custom GPT** = configurable assistant product (most flexible, best Actions support)
- **Declarative Agent** = enterprise-scoped Copilot extension (Microsoft Graph, A2A, governed)

---

## Three-Way Feature Matrix

| Dimension | Custom GPT (OpenAI) | Gemini Gem (Google) | Copilot Declarative Agent (Microsoft) |
|---|---|---|---|
| **Home platform** | ChatGPT | Gemini | Microsoft 365 Copilot / Copilot Studio |
| **Underlying model (mid-2026)** | GPT-5.3 Instant (default); GPT-5.4 Thinking/Pro (paid reasoning); GPT-5.5/5.5 Pro (rolled out Apr–May 2026) | Gemini 2.0 and 2.5 family | GPT-4o/GPT-4 family via Azure OpenAI |
| **Licensing to build** | ChatGPT Plus ($20/mo) or higher | Free (basic Gems); Advanced ($19.99/mo) for full features | M365 Copilot enterprise license |
| **Licensing to use** | Plus minimum for shared GPTs | Free on Gemini Basic | M365 Copilot seat |
| **Instructions** | Free-text system prompt; ~8,000 char hard limit in builder UI | Free-text + "magic wand" auto-rewrite assist | Free-text or auto-generated from natural-language description |
| **Configure tab fields** | Name, Description, Instructions, Conversation starters, Recommended model, Knowledge, Capabilities, Apps or Actions | Name, Instructions, Default Tool, Knowledge | Name, Description, Instructions, Knowledge sources, Capabilities, Plugins |
| **Recommended model field** | Yes (newer field — steers users toward the best fit) | N/A | N/A |
| **Context window** | 128K tokens (typical) | Up to 1M tokens (8× ChatGPT) | Varies; inherits Copilot's model limits |
| **Knowledge files** | Upload files → vector-indexed RAG retrieval; 20 files max, 512 MB each | Upload files + live Google Drive sync | SharePoint sites, OneDrive, M365 Graph, Copilot Connectors, uploaded files |
| **Knowledge architecture** | Personal file store (static upload) | Upload + live Drive sync | Microsoft Graph (org-wide search across M365 data) |
| **Tool/capability toggles** | Web Search (ON), Canvas (ON — deprecated in GPT-5.5 Instant/Thinking), Image Generation (ON), Code Interpreter & Data Analysis (OFF) | Single "Default Tool": None / Create Image / Canvas / Deep Research / Music / Guided Learning | Code interpreter, image generator, capabilities per Copilot plan |
| **API / external data** | Actions via custom OpenAPI schema (JSON/YAML) + OAuth; OR Apps (MCP-based, renamed from Connectors Dec 2025) — not both simultaneously | No custom API actions; Google ecosystem integrations only | API plugins, Power Automate connectors, custom engine agents for complex logic |
| **Multi-agent** | No native A2A | No native A2A | A2A protocol; agents can compose and delegate to other agents |
| **Sharing model** | Private / Link / GPT Store (public marketplace, 200K+ GPTs); workspace RBAC (Can chat / Can view settings / Can edit) | Private / Public (Gem Gallery) | Admin-governed via Integrated Apps; tenant-level controls |
| **Builder accessibility** | Low barrier, high ceiling | Lowest barrier, medium ceiling | Medium barrier, highest ceiling |
| **Customization ceiling** | High: instructions + knowledge + actions + capability toggles | Medium: instructions + knowledge + single tool selection | High: instructions + Graph + plugins + Power Automate + A2A |
| **Ecosystem lock-in** | OpenAI / ChatGPT only | Deep Google Workspace integration | Deep M365 integration: Teams, Outlook, SharePoint, OneDrive natively |
| **Computer use / automation** | Code Interpreter only (sandboxed Python) | Limited | Emerging computer use (web/desktop app interaction where APIs unavailable) |
| **Governance** | Builder controls visibility; version history with restore in ••• menu | Minimal governance controls | IT admin governed; tenant policies apply; audit trails |
| **Monetization** | GPT Store revenue sharing (US builders; formula undisclosed) | None | None (enterprise license) |
| **OpenAPI / Actions limits** | 300 chars/endpoint description, 700 chars/param, 100K char payloads | N/A | Plugin schemas; platform limits apply |

**Important notes on mid-2026 model lineup:**
- GPT-4o, GPT-4.1, GPT-4.1 mini, o4-mini, and original GPT-5 retired from ChatGPT February 13, 2026
- GPT-5.1 models retired March 11, 2026
- GPT-5.5 Instant became the free-tier default May 5, 2026
- Business/Enterprise/Edu tenants retained GPT-4 family access longer than consumer tiers
- Canvas is being deprecated in GPT-5.5 Instant/Thinking; writing/coding moving to in-chat blocks

---

## Deep Dive: Gemini Gems

Gems are Google's equivalent inside Gemini. They bundle Name, Description,
Instructions, an optional Default Tool selection, and optional Knowledge file
uploads into a reusable assistant.

**Where Gems win over Custom GPTs:**
- Free to start (no Plus subscription required)
- 1M token context window — 8× ChatGPT's typical limit, critical for long-document work
- Live Google Drive sync — knowledge files update automatically when source docs change
- Faster to build — lighter configuration surface, fewer decisions

**Where Custom GPTs win over Gems:**
- Actions: full custom API integration via OpenAPI schemas (Gems have no equivalent)
- Capability control: binary toggles per tool (Gems have a single tool selector)
- Publishing: GPT Store with 200K+ listings (Gem Gallery is smaller)
- Instruction depth: more established builder patterns, larger community of templates

**When to use a Gem instead of a Custom GPT:**
- User is deeply embedded in Google Workspace (Docs, Sheets, Drive)
- Knowledge base lives in Google Drive and needs live sync
- Long-document tasks benefit from the 1M context window
- Budget constraint: no ChatGPT Plus subscription available

---

## Deep Dive: Copilot Declarative Agents

Microsoft's equivalent sits inside Microsoft 365 Copilot and Copilot Studio.
Declarative agents rely on Copilot's built-in orchestration, search, and reasoning.

**The fundamental architectural difference:**
A Custom GPT's knowledge layer is a personal file store — you upload PDFs and they
get vector-indexed. A Copilot declarative agent's knowledge layer is the
**Microsoft Graph** — it can search across your organization's actual SharePoint
documents, emails, Teams messages, and calendar data without you uploading anything.
This is a different class of enterprise knowledge access.

**Where Declarative Agents win:**
- Org-wide knowledge grounding via Microsoft Graph (no uploads needed)
- A2A (agent-to-agent) protocol: agents can compose and delegate to each other
- Power Automate integration: can trigger multi-step workflow automation
- Enterprise governance: IT admin controls, tenant-level policies, audit trails
- M365 surface integration: appears natively in Teams, Outlook, SharePoint

**Where Custom GPTs win:**
- Speed to prototype: minutes vs. days for enterprise deployment
- No IT admin dependency for personal or small-team tools
- Lower licensing cost for individual or small-team use
- More flexible Actions design outside Microsoft ecosystem
- Larger builder community and published examples

**When to use a Declarative Agent instead of a Custom GPT:**
- Organization runs M365 and wants agents grounded in corporate data
- Multi-agent orchestration (A2A) is required
- IT governance, audit trails, and tenant controls are non-negotiable
- Power Automate workflow integration is part of the use case

---

## Decision Framework

```
Start here:
├── Is the user in a Microsoft 365 enterprise environment?
│   └── YES → Does the agent need corporate SharePoint/Teams/email data?
│       ├── YES → Copilot Declarative Agent
│       └── NO → Custom GPT (faster to build, no IT dependency)
├── Is the user primarily in Google Workspace?
│   └── YES → Does the agent need live Google Drive sync?
│       ├── YES → Gemini Gem
│       └── NO → Custom GPT (better Actions, more customization)
└── General case / prosumer / indie builder → Custom GPT
```

**Hedging against lock-in:** Author canonical workflows as Agent Skills (portable, version-controlled, testable) and wrap a thin Custom GPT for ChatGPT reach. Both ecosystems are converging on MCP, so a clean MCP tool layer pays off in both paradigms.

**When to move from Custom GPT to Agent Skill:**
- You need the same capability on ≥2 agent platforms
- You need objective pass/fail QA (not just preview testing)
- Model updates are causing silent behavior regressions

---

## Evolution Timeline

| Period | Construct | Platform | Status |
|---|---|---|---|
| Late 2022 | ChatGPT launches | OpenAI | Active |
| Early 2023 | ChatGPT Plugins | OpenAI | Deprecated 2024 |
| Mid 2023 | Custom Instructions (account-level) | OpenAI | Active |
| Nov 2023 | Custom GPTs + GPT Store announced | OpenAI | Active |
| Jan 2024 | GPT Store public launch | OpenAI | Active |
| Mid 2024 | Gemini Gems launch | Google | Active |
| Late 2024 | Copilot Studio Agent Builder (declarative agents) | Microsoft | Active |
| 2024–2025 | MCP protocol emerges | Anthropic (broadly adopted) | Active, growing |
| Oct 2025 | Agent Skills standard launched | Anthropic (open standard) | Active |
| 2025 | Claude Projects launch | Anthropic | Active |
| Dec 2025 | OpenAI renames Connectors → Apps; Apps/MCP support added to GPTs | OpenAI | Active |
| Feb 2026 | GPT-4o and earlier models retired from ChatGPT; GPT-5 family default | OpenAI | Models sunset |
| Mar 2026 | OpenAI Codex Plugin Directory launches | OpenAI | Active |
| Apr–May 2026 | GPT-5.5/5.5 Pro rollout; GPT-5.5 Instant becomes free-tier default | OpenAI | Active |
| Mid 2026 | Multi-agent orchestration (A2A), computer use | Microsoft, Google, Anthropic | Emerging |

The trajectory: isolated chatbots → configurable assistants → tool-using agents →
composable multi-agent systems. Custom GPTs sit at "configurable assistant." The
industry is moving toward autonomous, multi-agent architectures, but Custom GPTs
remain the most accessible entry point for non-developers.
