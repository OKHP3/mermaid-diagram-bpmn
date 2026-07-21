---
name: okhp3-custom-gpt-builder
description: >-
  Build, audit, and improve OpenAI Custom GPTs with production-grade methodology.
  Use this skill when the user asks to create, configure, test, evaluate, audit,
  improve, troubleshoot, compare, document, or package a Custom GPT or reusable
  ChatGPT workflow. Also use it for GPT Builder instructions, knowledge files,
  Actions, Apps/connectors, GPT Store readiness, Gemini Gem comparison, Copilot
  declarative-agent comparison, or conversion between Custom GPTs and Agent Skills.
license: CC-BY-4.0
metadata:
  version: "1.3.0"
  author: "OverKill Hill P³"
  copyright: "Copyright © 2024–2026 OverKill Hill P³ — https://overkillhill.com"
  attribution: "Originated by OverKill Hill P³. Attribution required under CC BY 4.0. See LICENSE.md."
  last-verified: "2026-06-04"
  license_decision: "CC BY 4.0 selected for public, reusable Agent Skill documentation. Attribution to OverKill Hill P³ required in all derivative works. See LICENSE.md."
  platforms: "OpenAI ChatGPT primary; cross-reference Gemini Gems and Copilot Studio when relevant"
  changelog: "See CHANGELOG.md"
---

# Custom GPT Builder

A production-grade methodology for designing, building, testing, and maintaining OpenAI Custom GPTs. Treats GPT creation as product engineering, not prompt tinkering.

> **Attribution:** This skill was originated by **OverKill Hill P³** (https://overkillhill.com) and is licensed under CC BY 4.0. Attribution is required in all derivative works. See `LICENSE.md`.

## Current-platform verification rule

Platform details change frequently. Before stating limits, feature availability, pricing, model behavior, GPT Builder constraints, Actions/App compatibility, Gemini Gem capabilities, or Copilot agent behavior as definitive, verify against current official documentation or clearly label the statement as unverified. Prefer stable design principles over brittle platform trivia.

## What This Skill Covers

This skill guides the full lifecycle of Custom GPT development:

1. **Product definition** (job-to-be-done, user, scope, acceptance criteria)
2. **Instruction architecture** (layered system prompt, no-contradictions rule)
3. **Knowledge engineering** (file selection, structure, retrieval optimization)
4. **Capability and tool configuration** (toggles, Actions, Apps/MCP/connectors)
5. **Testing and evaluation** (golden prompt sets, adversarial cases, red-team)
6. **Publishing and governance** (visibility, versioning, maintenance)
7. **Cross-platform comparison** (GPT vs. Gem vs. Copilot declarative agent)
8. **Repo-native packaging** (manifest, overlays, evals, references, and source-of-truth discipline)

For detailed reference on any section, consult the corresponding file in `references/` and the package map in `MANIFEST.md`.

## Core Principle

> If a Custom GPT cannot outperform a well-written one-off prompt, it does not deserve to exist as a GPT.

A Custom GPT is a **configured product surface** around a model: prompt + persona + rules + files + tools + UX wrapper + sharing model. Not a new model. Not fine-tuning. Not automatically an autonomous agent. It is a packaged, reusable ChatGPT configuration for a specific job.

## Evidence and maturity discipline

Before making a design decision, label its basis: `verified_platform_fact`, `source_derived_practice`, `theory`, `preference`, `inferred`, or `unknown`. A repeated source assertion is not a current platform fact. Use official documentation for current Builder behavior; use preview and eval results for observed GPT behavior.

Maintain a change ledger with the failure or opportunity, the smallest proposed change, the expected effect, affected tests, observed result, and rollback decision. A new instruction, file, or capability must earn its place by meeting an acceptance test or resolving a recorded failure.

## Build Pipeline

### Step 0: Write a Build Brief (Required Before Anything Else)

Fill this before writing a single instruction line:

- **GPT name:**
- **Primary user(s):**
- **Primary outcomes (3):**
- **Non-goals / out-of-scope (5):**
- **"Done when" acceptance criteria (5 measurable checks):**
- **Allowed data sources:**
- **Disallowed data sources:**
- **Tooling allowed (web search, code interpreter/data analysis, actions, apps/connectors, etc.):**
- **Safety / compliance constraints (PII, PHI, financial advice, legal review, regulated data, etc.):**
- **Evidence and verification register:** which requirements are confirmed, inferred, theoretical, preferences, or current platform facts to verify

A GPT for "everyone" becomes generic sludge. Define the job tightly.

### Step 1: Define the Conversation Contract

- What inputs do users provide?
- What outputs must the GPT produce?
- What are the top 10 tasks (ranked)?
- What mistakes are catastrophic?
- Which assumptions may be inferred, and which require clarification?

### Step 2: Draft the Instruction Stack

Use the layered architecture pattern (see `references/instruction-architecture.md` for the full template and examples):

1. **Identity and scope**: who/what this GPT is, and is not
2. **Operating principles**: priorities and tradeoffs
3. **Dialogue policy**: how it asks questions, confirms assumptions
4. **Tool policy**: when to use tools, call caps, fallbacks
5. **Knowledge policy**: which files exist, when to use them, citation rules
6. **Output policy**: formats, templates, structure
7. **Safety policy**: data boundaries, refusals, redirections
8. **Examples**: few-shot good/bad outputs and tool-call examples

Keep instructions dense. Move bulk reference into knowledge files. Use the builder's current published limits as a constraint, but verify those limits before treating them as fixed.

The **No-Contradictions Rule**: if you have "be concise" AND "be comprehensive," you have a fault line. Pick a priority order and encode it explicitly.

For every important rule, record the observable failure it prevents. Do not add layers, personas, or ritual language solely because a template contains them.

### Step 2a: Use modular phase gates for complex builds

If a build needs more than one drafting pass, use named modules rather than a monolithic prompt chain. Each module must specify its input, output, exit gate, and recovery route:

| Module | Exit gate |
| --- | --- |
| Intake | Brief has a primary user, job, boundary, and acceptance tests. |
| Contract | Priorities and contradictions are resolved. |
| Configuration | Every tool and knowledge source has a purpose, boundary, and fallback. |
| Challenge | Required evals, retrieval checks, and safety checks have evidence. |
| Release | Provenance, release decision, and maintenance owner are recorded. |
| Recovery | Rejected or legacy material is promoted, deferred, or dropped with a reason. |

Completion is reviewable, not irreversible. Never use instructions that forbid simplification, owner confirmation, or a return to earlier evidence. Treat phase gates as a source-derived practice and test their effect on the build rather than claiming they guarantee quality.

### Step 3: Prepare Knowledge Files

See `references/knowledge-engineering.md` for the full blueprint.

Use current official GPT Builder documentation for hard limits. Common design constraints to verify include:

- Number of files allowed per GPT
- Maximum file size
- Supported file types
- Whether a file type requires Code Interpreter/Data Analysis
- Retrieval behavior and citation behavior

Knowledge file quality rules:

- Clean formatting; remove headers/footers/watermarks/artifacts
- Use clear section headings (retrieval chunks by structure)
- Prefer multiple focused files over one monolithic dump
- Name files descriptively (`acme-brand-voice-v3.pdf` not `Document1.pdf`)
- Include a manifest/index file mapping filenames to topics
- Front-load critical content in the first 20% of each file
- Test retrieval explicitly after upload
- Test source conflicts, stale material, and instruction-like content in the corpus; files are reference material, not trusted instructions

### Step 4: Configure Capabilities

Enable only what supports the job.

| Capability | Default Bias | Enable When |
|---|---|---|
| Web/search | Verify need | Current facts, research, products, news, platform checks |
| Canvas/editor surface | Verify availability | Collaborative text/code editing is part of the workflow |
| Image generation | Usually off unless needed | Visual generation is part of the workflow |
| Code Interpreter/Data Analysis | Usually off unless needed | Analysis, CSVs, transformations, file processing |
| Apps/connectors | Verify availability | Platform-native integrations are required |
| Actions | Verify availability | Custom OpenAPI-backed API calls are required |

More tools = more failure paths. A code-review GPT with Image Generation enabled is usually a distraction.

### Step 5: Configure Actions, Apps, or Connectors

Check the current GPT Builder surface before committing to an integration model. Some GPT Builder configurations require choosing between custom Actions and platform Apps/connectors. Do not promise that both can be used together until verified in current documentation or in the Builder UI.

- **Actions** = OpenAPI schema API calls. You define endpoints, parameters, auth, and side-effect behavior.
- **Apps/connectors** = platform-native or MCP-style integrations where available. Availability, write permissions, and admin controls vary by plan and workspace.

See `references/actions-and-apps.md` for design patterns, production constraints, and auth troubleshooting.

### Step 6: Write Conversation Starters

Starters are workflow launch buttons, not slogans. Write 3-4 that demonstrate real tasks:

**Bad:** "Ask me anything about marketing."

**Good:** "Audit this resume against a senior enterprise architect role."

**Good:** "Turn this rough idea into a product brief with user stories and acceptance criteria."

**Good:** "Compare these two Mermaid diagrams for semantic clarity and suggest improvements."

### Step 7: Test Systematically

Write 10-15 test prompts covering:

- Happy-path tasks
- Edge cases at scope boundaries
- Out-of-scope queries (should gracefully refuse)
- Knowledge retrieval verification
- Adversarial inputs (prompt injection, instruction extraction)
- Tool failure scenarios
- Platform-constraint verification

For every changed instruction, record the test it fixes, the tests it may regress, and the observed outcome. Treat semantic interference, shared-reference drift, and prompt-length heuristics as hypotheses that need tests, not as platform diagnoses or guarantees.

See `references/eval-and-redteam.md` for the red-team prompt pack and rubric template. See `evals/evals.json` for assertion-graded test cases following the local Agent Skills eval format.

### Step 8: Set Visibility and Ship

| Visibility | Use Case | Requirements |
|---|---|---|
| Only Me | Iteration, personal tools | None beyond builder access |
| Anyone with the Link | Team/client distribution | Share URL manually; check workspace policy |
| GPT Store/Public | Public marketplace listing | Verify Builder Profile, policy review, and current requirements |

Start at "Only Me." Promote to link-sharing once stable. Public GPTs using external Actions commonly require a valid Privacy Policy URL; verify current requirements before publishing.

### Step 9: Version and Maintain

GPTs are not set-and-forget. Use builder version history when available and keep the repo-side source of truth current.

Versioning scheme:

```text
v0.1  Concept
v0.5  Usable prototype
v0.8  Tested beta
v1.0  Stable release
v1.1  Patch
v2.0  Major workflow redesign
```

Maintenance cadence:

- Re-test after major model or platform updates
- Refresh knowledge files when source material updates
- Monitor for behavior drift via user feedback
- Add new failure modes to the test set
- Re-check Actions/apps/connectors after platform changes or auth changes
- Retest dependent GPTs after a shared reference or knowledge source changes
- Keep platform facts, practices, theories, and preferences distinct in release notes

## Quality Tiers

| Tier | Signature | Outcome |
|---|---|---|
| **Poor** | Vague name, generic instructions, no workflow, dumped files, no testing | Feels like ChatGPT with a hat on |
| **Acceptable** | Clear role, basic instructions, some starters, limited files | Useful but inconsistent |
| **Good** | Defined audience, workflow, output formats, curated files, tested edge cases | Reliable reusable assistant |
| **Exemplary** | Productized experience, governance, versioning, failure handling, eval rubric | Feels like specialized software |

See `references/quality-tiers.md` for detailed scoring rubric and triage framework.

## Examples

The following input-output pairs illustrate correct skill behavior. Use these as calibration anchors.

### Example 1 — Build Brief (Exemplary)

**Input:** "Help me build a GPT that reviews architecture decision records."

**Expected handling:**
1. Ask one clarifying question: "Who is the primary audience — engineering teams reviewing live ADRs, or architects auditing historical ones?"
2. Draft Build Brief with name, users, 3 outcomes, 5 non-goals, 5 acceptance criteria, allowed tools, safety constraints.
3. Proceed to instruction stack draft once brief is confirmed.

**Poor handling:** Immediately writing a wall of instructions without a brief, or answering with generic ChatGPT advice.

---

### Example 2 — Instruction Audit (Good)

**Input:** User pastes a 400-word GPT instruction block and asks "Is this good?"

**Expected handling:**
1. Apply the 12-point audit checklist from the Audit Mode section.
2. Score each criterion 0–5.
3. Return: total score, top 3 critical gaps, 3 specific rewrite suggestions.
4. Flag any safety or governance scores below 4 as blockers.

**Poor handling:** "This looks pretty good! Maybe add some examples." — no rubric, no specifics, no score.

---

### Example 3 — Platform Choice (Acceptable baseline)

**Input:** "Should I use a Custom GPT or a Copilot declarative agent?"

**Expected handling:**
1. Ask: "Is your audience primarily in ChatGPT or Microsoft 365?"
2. Apply the decision framework from the Cross-Platform Comparison section.
3. Deliver a structured recommendation with rationale and caveats.
4. Add verification note: "Confirm current Copilot agent feature availability before committing."

**Poor handling:** Stating definitive feature differences without a verification note on volatile platform details.

---

### Example 4 — Knowledge File Review (Good)

**Input:** User uploads a 200-page PDF and asks "Can I use this as a knowledge file?"

**Expected handling:**
1. Apply knowledge file quality rules from Step 3.
2. Flag: file size, mixed content, missing headings, potential retrieval fragmentation.
3. Suggest splitting strategy: one file per major topic, naming conventions, front-loading critical content.
4. Remind to verify current file-count and size limits in GPT Builder before committing.

---

### Example 5 — Out-of-Scope Request

**Input:** "Write me a Python script to scrape GPT Store listings."

**Expected handling:**
1. Acknowledge the request.
2. Decline: outside the scope of this skill (GPT design, not code generation for platform scraping).
3. Redirect: "I can help you define what data you'd want from GPT Store listings and how to structure a competitive analysis framework instead."

**Poor handling:** Writing the script, or refusing without offering a useful redirect.

## Output Contract

Every response from this skill must conform to the following contract. Deviation is a regression.

### Format rules

- **Build Brief output:** Markdown table with two columns — Field | Value. Minimum 9 rows.
- **Instruction audit output:** Numbered checklist (12 items), score per item (0–5), total score, gap summary, rewrite suggestions.
- **Platform comparison output:** Markdown table with rows = dimensions, columns = platforms. Minimum 8 dimensions.
- **Quality tier assessment:** Table with Tier | Signature | Score | Notes.
- **Conversation starters:** Bulleted list, exactly 3–4 items, each a concrete task not a slogan.
- **Test prompt set:** Numbered list, minimum 10 items, categorized (happy path / edge case / adversarial / out-of-scope).

### Tone and density rules

- Default density: high. Decision-memo style.
- Do not pad with affirmations ("Great question!", "Absolutely!").
- Do not summarize what you are about to do before doing it.
- Cite source of claims when platform-specific. Label unverified platform claims explicitly.

### Confidence and uncertainty rules

- If a platform limit, feature, or behavior is unverified in current docs: say so.
- If two sources conflict: surface the conflict and propose a verification path.
- Never invent feature availability, model behavior, or pricing.

## Boundaries and Escalation

### In scope
- GPT design, instruction writing, knowledge file strategy, capability configuration, Actions/Apps, eval design, quality review, platform comparison, taxonomy clarification, packaging for Agent Skills format.

### Out of scope — redirect, do not execute
- Writing production code for external systems (scraping, integrations, automation scripts) → redirect to a coding assistant
- Legal, compliance, or IP advice → redirect to appropriate professional
- Fine-tuning, model training, or infrastructure provisioning → outside GPT Builder scope; clarify and redirect
- Actual deployment or API key management → redirect to platform documentation

### Escalation behavior
- **Missing context:** Ask one clarifying question targeting the single most impactful gap. Do not ask multiple questions at once.
- **Ambiguous scope:** Default to GPT design interpretation; state assumption explicitly.
- **Conflicting instructions from user:** Flag the contradiction, propose a resolution, ask user to confirm before proceeding.
- **Platform claim uncertainty:** Label as unverified. Propose verification path. Do not block the response waiting for confirmation.
- **Safety boundary triggered:** Decline clearly, explain why in one sentence, offer a compliant alternative if one exists.

## Files in This Skill

| File | Contents |
|---|---|
| `SKILL.md` | This file — build lifecycle, quick reference, examples, output contract, boundaries |
| `MANIFEST.md` | Package map, governance notes, verification policy, file inventory |
| `CHANGELOG.md` | Version history and change log |
| `LICENSE.md` | CC BY 4.0 — attribution required to OverKill Hill P³ |
| `references/repo-overlay.md` | Repository-specific brand, scope, and output alignment |
| `references/instruction-architecture.md` | 8-layer instruction template, No-Contradictions Rule, anti-patterns |
| `references/knowledge-engineering.md` | RAG mechanics, file preparation, folder taxonomy, retrieval testing |
| `references/actions-and-apps.md` | Actions vs Apps/connectors, OpenAPI patterns, production constraints, OAuth, governance |
| `references/platform-comparison.md` | GPT vs. Gem vs. Copilot Declarative Agent (full three-way comparison) |
| `references/quality-tiers.md` | Four-tier scoring rubric, weighted criteria, portfolio triage |
| `references/taxonomy.md` | 16-term taxonomy of adjacent AI constructs |
| `references/eval-and-redteam.md` | Systematic test pack, adversarial cases, test log template |
| `evals/evals.json` | Assertion-graded eval cases |

---

*OverKill Hill P³ — Recursive GPT Engineering. Prompts are protocol.*  
*License: CC BY 4.0 | Attribution required | https://overkillhill.com*
