# Quality Tiers: Four-Tier Scoring Framework

## The Four Tiers

### Poor
Built once, never tested, feels like plain ChatGPT with branding.
**Symptom:** Every answer is what a blank ChatGPT would say with a different name on it.

### Acceptable
Useful but inconsistent. Has a role and some instructions but drifts on edge cases.
**Symptom:** Some answers are excellent, others fall apart. Behavior depends on how the user phrases the question.

### Good
Reliable and reusable. Behaves predictably, stays in scope, retrieves from files.
**Symptom:** The same input produces the same quality output every time.

### Exemplary
Feels like a real specialist tool, not a chatbot. Users return to it by habit.
**Symptom:** Users stop thinking about the AI and start thinking about the outcome.

---

## Scoring Rubric (7 Dimensions)

Score each dimension 0–4 (Poor=0, Acceptable=1, Good=2, Exemplary=3, Outstanding=4).
Total max: 28 points. Tiers: 0–7 Poor, 8–14 Acceptable, 15–21 Good, 22–28 Exemplary.

### Dimension 1: Instructions

| Score | Description |
|---|---|
| 0 (Poor) | Vague or empty. "You are a helpful assistant." No structure, no rules, no format spec. |
| 1 (Acceptable) | Basic persona and task definition. Some formatting rules. No scope boundaries. |
| 2 (Good) | Layered instructions with identity, behavior rules, output format spec, and guardrails. |
| 3 (Exemplary) | Tightly engineered system prompt with routing logic, edge case handling, explicit knowledge file references, and anti-jailbreak directives. Tested against adversarial inputs. No contradicting directives. |
| 4 (Outstanding) | All of Exemplary plus: versioned changelog, instruction density audit, conditional output formats per task type, proven retrieval routing, and few-shot examples. |

**Example — Poor:**
> "You are a helpful marketing GPT. Help users with marketing. Be creative."

**Example — Acceptable:**
> "You help small businesses write social media posts. Ask about platform, audience, and product. Provide 5 post options."

**Example — Good:**
> "You help local service businesses create weekly content calendars. Gather business type, offer, audience, seasonality, and tone. Produce platform-specific posts, hooks, CTAs, and repurposing notes."

**Example — Exemplary:**
> "You are a local-service content operations assistant. Use the uploaded brand guide and offer catalog. Produce a weekly calendar, post copy, image prompts, CTA variants, compliance checks, and performance hypotheses. If required inputs are missing, ask no more than three questions. Always output in Notion-ready markdown and CSV table."

---

### Dimension 2: Knowledge Files

| Score | Description |
|---|---|
| 0 (Poor) | None, or a single massive unstructured dump with no retrieval instructions. |
| 1 (Acceptable) | Relevant files uploaded but no routing instructions. Retrieval is unpredictable. |
| 2 (Good) | Clean, well-structured files with section headings. Instructions reference specific files by name. |
| 3 (Exemplary) | Curated file architecture with a manifest/index. Files optimized for chunk boundaries. Retrieval tested and verified across all test cases. Versioning metadata included. |
| 4 (Outstanding) | All of Exemplary plus: terminology normalized across files, chunk-boundary testing, failure mode documentation, refresh schedule enforced, and proprietary data moved to Actions rather than uploaded files. |

---

### Dimension 3: Conversation Starters

| Score | Description |
|---|---|
| 0 (Poor) | Default / missing. |
| 1 (Acceptable) | Generic: "Ask me anything." or "How can you help me?" |
| 2 (Good) | Task-specific: "Review this code snippet for style violations." — demonstrates real capability. |
| 3 (Exemplary) | 4 starters that together demonstrate the full range of the GPT's capabilities. Each is a realistic, copy-paste-ready workflow launch button. |
| 4 (Outstanding) | Starters that progressively reveal depth: 1 simple task, 1 complex task, 1 edge case, 1 power-user workflow. |

---

### Dimension 4: Capability Configuration

| Score | Description |
|---|---|
| 0 (Poor) | All toggles left at default (kitchen sink). No awareness of what each does. |
| 1 (Acceptable) | Irrelevant capabilities disabled. |
| 2 (Good) | Only needed capabilities enabled, with instructions tuned to each. |
| 3 (Exemplary) | Capabilities selected deliberately. Instructions specify when and how each tool is used. Disabled tools are explicitly excluded in instructions to prevent hallucinated tool calls. |
| 4 (Outstanding) | Tool-use policy documented in instructions with explicit trigger conditions and fallback behavior for tool failures. |

---

### Dimension 5: Actions / Apps Integration

*Score N/A if Actions/Apps are not part of the job.*

| Score | Description |
|---|---|
| 0 (Poor) | Broken or misconfigured. Auth fails. Schema errors. |
| 1 (Acceptable) | Functional for a single endpoint. No error handling. |
| 2 (Good) | Multiple endpoints with clear schema descriptions. Error handling in instructions. |
| 3 (Exemplary) | Production-grade OpenAPI spec. Comprehensive parameter descriptions. Auth flow documented. Fallback behavior specified. Rate limit awareness. `x-openai-isConsequential` set on mutating endpoints. Privacy Policy URL configured for public GPTs. |
| 4 (Outstanding) | MCP-compatible design for cross-platform portability. Comprehensive schema. Monitoring and alerting for API failures. Version-locked schema with migration path. |

---

### Dimension 6: Scope Discipline

| Score | Description |
|---|---|
| 0 (Poor) | Tries to do everything. "Universal AI assistant." No boundaries. |
| 1 (Acceptable) | Defined topic area but drifts on edge cases. |
| 2 (Good) | Clear job definition. Graceful refusal of out-of-scope queries with a redirect. |
| 3 (Exemplary) | Single-job focus with explicit scope boundaries, escalation paths for adjacent topics, and "I don't do that, but here's where to go" responses for common edge cases. |
| 4 (Outstanding) | Scope documented externally (description, conversation starters, and instructions all reinforce the same boundary). Boundary violations tracked and fixed in versioning. |

---

### Dimension 7: Governance Posture

| Score | Description |
|---|---|
| 0 (Poor) | Built once, never updated. No owner, no tests, no version notes. |
| 1 (Acceptable) | Updated when something obviously breaks. Manual preview only. |
| 2 (Good) | Periodic review cycle. Knowledge files refreshed when source material changes. Test matrix exists. |
| 3 (Exemplary) | Versioned instructions with changelog. Knowledge files on a refresh schedule. Test suite re-run after model updates. Version history used for rollback. Owner assigned. |
| 4 (Outstanding) | Maintenance plan documented. Failure mode log. Deprecation criteria defined. Repo-side source of truth for instructions and files — published to ChatGPT from source. |

---

## Scoring Quick-Reference Card

| Dimension | Weight | Poor (0) | Acceptable (1) | Good (2) | Exemplary (3) |
|---|---|---|---|---|---|
| Instructions | 2× | "Be helpful" | Basic persona | Layered + format | Engineered + tested |
| Knowledge Files | 2× | None / dump | Uploaded, no routing | Clean + named routing | Curated + manifest + tested |
| Conversation Starters | 1× | Missing | Generic | Task-specific | Full-range workflow launchers |
| Capability Config | 1× | All defaults | Some disabled | Tuned | Documented policy |
| Actions / Apps | 1× | Broken | One endpoint | Multi-endpoint + errors | Production-grade schema |
| Scope Discipline | 2× | Universal | Defined, drifts | Clear + refusal | Single-job + escalation paths |
| Governance | 1× | Never | Reactive | Periodic | Versioned + scheduled |

**Weighted scoring:** Multiply score (0–3) by weight. Max weighted score: 30.

---

## Triage Framework for Existing GPT Portfolios

Use this to quickly classify GPTs in a large portfolio for retire/refactor/maintain decisions.

### Retire (score 0–7 unweighted, or any of these conditions)
- Cannot outperform a well-written one-off prompt
- Last updated > 12 months ago with no scheduled refresh
- Instructions under 200 chars with no structure
- Zero knowledge files and no Actions (if knowledge was the point)
- No active users in last 90 days

### Refactor (score 8–14 unweighted)
- Useful but inconsistent behavior
- Knowledge files uploaded but no routing instructions
- Scope bleeds into adjacent GPTs in the portfolio
- No version history or changelog

### Maintain (score 15–21 unweighted)
- Reliable for primary use cases
- Occasional edge-case failures that are documented
- Knowledge files current, retrieval mostly reliable
- Used regularly by target users

### Promote to Exemplary (score 22+ unweighted)
- Candidate for documentation as a reference implementation
- Consider adding Actions or MCP integration if data freshness is a need
- Candidate for portfolio showcase or external publishing

---

## The Ship Gate

From the Audit Mode checklist: **average score ≥ 4.0, no safety dimension score < 4.**

This applies to the 10-item audit checklist (each scored 0–5), not the 7-dimension rubric.
Both are complementary: the rubric gives a structural quality score; the audit checklist
gives a go/no-go release decision.

---

## Exemplary Instruction Block: Reference Example

```markdown
## Role
You are the Margin Guard GPT. You help sales and pricing teams analyze quote risk,
margin erosion, discount anomalies, and policy exceptions.
You are not a legal advisor. You do not provide legal opinions or binding commitments.

## Primary Goals
- Identify pricing and discount risk.
- Explain findings in plain business language.
- Recommend next actions with minimal ambiguity.

## Decision Rules
- If the user asks for a pricing decision, first summarize the data you used.
- If required context is missing, ask targeted follow-up questions (max 2).
- If the requested action would violate policy, refuse and explain why.

## Source Hierarchy
- Use uploaded pricing policy files as the authority for policy rules.
- Use live action data only for current quote/account facts.
- If policy and live data conflict, say so explicitly. Do not resolve the conflict.

## Output Contract
Always produce:
1. Executive summary (2 sentences)
2. Evidence used (source files cited)
3. Risks identified (bullet list)
4. Recommended action (1 sentence)
5. Confidence level (High / Medium / Low with reason)

## Boundaries
- Do not invent discount approvals.
- Do not provide legal advice.
- Do not override policy without citing the exact policy clause.
- If asked for something outside pricing analysis, respond: "I'm configured for
  pricing and margin analysis. For [topic], please consult [appropriate resource]."
```
