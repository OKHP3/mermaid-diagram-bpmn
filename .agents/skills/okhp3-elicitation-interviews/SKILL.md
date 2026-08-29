---
name: okhp3-elicitation-interviews
description: "Plan and facilitate structured elicitation sessions using BABOK v3 interview and workshop techniques. Use this skill when you need to gather process knowledge from subject matter experts; when the user wants a question plan before an interview or workshop; when elicitation is incomplete and gaps need targeted follow-up; when they say \\\"help me interview the process owner\\\", \\\"prepare questions for the workshop\\\", or \\\"what should I ask to fill in the missing steps\\\". Use only when a PIR already exists and has gaps — for first-pass process discovery from scratch, use okhp3-process-intake-and-scope instead. Produces a question plan and elicitation notes template."
license: "MIT"
compatibility: "Facilitation and note-taking need no special runtime. scripts/generate-question-plan.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, build the question plan by hand from the PIR gaps using the technique tables in references/babok-elicitation-techniques.md and say so in your output rather than presenting the result as machine-generated."
metadata:
  bp_skill_version: "0.3.0"
  status: "core"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-analysis"
  standards_refs: "BABOK v3 §4 (Elicitation and Collaboration); BABOK v3 §10.25 (Interviews); BABOK v3 §10.50 (Workshops); BABOK v3 §10.14 (Document Analysis); BPM CBOK v4 §4.3 (Process Discovery Techniques)"
  produces: "question-plan.yaml, elicitation-notes.md"
  consumes: "pir.yaml, scope-statement.md"
  depends_on: "okhp3-process-intake-and-scope"
  tags: "elicitation, interview-facilitation, question-plan, BABOK, workshop, subject-matter-expert, process-discovery"
  triggers: "prepare interview questions; help me run the workshop; question plan; what should I ask; elicitation session; interview the process owner; SME interview; workshop facilitation"
  homepage: "https://github.com/OKHP3/mermaid-diagram-bpmn/tree/main/skills/okhp3-elicitation-interviews"
  repository: "https://github.com/OKHP3/mermaid-diagram-bpmn"
---

# okhp3-elicitation-interviews

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Generate a structured elicitation question plan and facilitate evidence-based process interviews using BABOK v3 §10.25 and §10.50 techniques. The plan targets known gaps in the PIR and provides sequenced, open-ended questions mapped to each PIR section.

---

## When to use this skill

- PIR exists but has `completeness_score < 70` or open_questions that need targeted follow-up
- User needs to interview a subject matter expert and wants a prepared question set
- User is planning a process discovery workshop and needs a facilitator guide
- You need to fill elicitation gaps before proceeding to `okhp3-process-narrative-authoring`

## When NOT to use this skill

- PIR is already complete (score ≥ 70, no open_questions): proceed directly to `okhp3-process-narrative-authoring`
- User has no access to process owners: document the gap and proceed with assumptions flagged
- Do not fabricate answers from the question plan: only record what participants confirm

---

## Question Plan Generation

`scripts/generate-question-plan.mjs` reads the PIR and generates targeted questions for each incomplete section.

### Question categories

| PIR section | Question type | Sample opening |
|---|---|---|
| `trigger` | Context | "What makes you realise the process needs to start today?" |
| `actors` | Role | "Who else touches this beyond the people we've named?" |
| `inputs` | Artefact | "What document or data do you need before you can begin?" |
| `outputs` | Artefact | "What does the person receiving your output actually do with it?" |
| `steps` | Sequence | "Walk me through what you do on a typical day this runs." |
| `business_rules` | Constraint | "Is there a policy or procedure that forces you to do it this way?" |
| `exceptions` | Edge case | "Tell me about the last time this went wrong. What happened?" |
| `systems` | Tool | "Which systems do you open, update, or check during this process?" |
| `controls` | Governance | "How do you know when the process has been done correctly?" |

### Branching logic

- If `trigger.event_type` is absent: lead with Stage 1 trigger questions
- If `actors` has no `approver`: probe approval chain: *"Who has the authority to stop or reject this?"*
- If `exceptions` is empty: probe with historical incident: *"What was the hardest version of this you've dealt with?"*
- If `business_rules` is empty: probe obligation: *"Are there any rules you must follow that an outsider wouldn't know?"*

---

## Facilitation Guidelines

1. **Open with context**: read back the process name and one-sentence scope; confirm it is correct
2. **Use the question plan in order**: complete highest-gap sections first
3. **Probe with "tell me more"**: do not accept one-word answers for steps or rules
4. **Record verbatim**: capture exact wording of rules and exceptions; paraphrase only for clarity
5. **Flag uncertainty**: mark any answer prefaced with "I think" or "usually" as `confidence: low`
6. **Close with open invitation**: *"Is there anything else you think I should know to document this correctly?"*
7. **Write up within 24 hours**: update the PIR before memory fades

---

## Elicitation Notes Template

The `elicitation-notes.md` output contains:
- Session metadata (date, participants, facilitator, method)
- Answers mapped to PIR sections
- Verbatim quotes for business rules
- Confidence flags for uncertain answers
- Outstanding items that need follow-up

---

## Handoff Instruction

After elicitation, update `pir.yaml` and re-run `okhp3-process-intake-and-scope` scoring. When score ≥ 70, pass `pir.yaml` to `okhp3-stakeholder-and-role-mapping` and then `okhp3-process-narrative-authoring`.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/generate-question-plan.mjs` cannot run, build the plan by hand from the PIR's `open_questions[]` and low-scoring sections using `references/babok-elicitation-techniques.md`, and state in the output that automated generation was not run.

## References

Load on demand:
- `references/babok-elicitation-techniques.md`: BABOK v3 §4, §10.14, §10.25, §10.50 technique summaries and question frameworks

## Scripts

- `scripts/generate-question-plan.mjs`: generates elicitation question plan from PIR scope and open_questions

## Assets

- `assets/fixtures/question-plan-example.yaml`: canonical question plan for purchase-approval intake

## Evaluation and release status

No `evals/evals.json` exists for this skill yet, and none of the five root-level `evals/` categories cover elicitation output directly. The only current check is the maintainer-facing `tests/validate-skill.test.mjs` against `assets/fixtures/question-plan-example.yaml`. Evidence status: `not-run` for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, the script fallback instruction, and a discovery-time boundary against `okhp3-process-intake-and-scope` (the two skills' triggers overlap on "help me ask about this process"). Classified minor per the versioning table, not patch. No regression suite exists to run before this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn). MIT License.
