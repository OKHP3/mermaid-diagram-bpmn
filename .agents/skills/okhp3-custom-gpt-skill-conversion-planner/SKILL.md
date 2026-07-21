---
name: okhp3-custom-gpt-skill-conversion-planner
description: >-
  Plan conversion of an existing Custom GPT into a portable Agent Skill. Use
  when a GPT already has instructions, knowledge files, actions, conversation
  starters, test prompts, or usage history and the user needs a capability map,
  semantic-loss analysis, reusable skill boundary, migration plan, or handoff
  to okhp3-skill-foundry.
license: MIT
metadata:
  version: "1.2.0"
  author: "OverKill Hill P³"
  category: universal
---

# Custom GPT to Agent Skill Conversion Planner

Convert a configured GPT into a durable, runtime-portable skill plan without
pretending that GPT configuration and Agent Skill instructions are equivalent.
This skill plans and audits the conversion; `okhp3-skill-foundry` authors and
benchmarks the final SKILL.md.

## Scope

| In scope | Out of scope |
|---|---|
| Asset inventory, capability mapping, boundary design, portability analysis, semantic-loss tracking, migration sequencing, and Foundry handoff | Exporting private platform data, bypassing permissions, writing production integrations, or claiming feature parity without verification |

## Conversion method

1. **Collect the source package.** Inventory GPT name and purpose, instructions, knowledge files, actions/apps, starters, examples, eval prompts, user feedback, platform assumptions, version history, and any prompt-chain stages with their outputs. Mark each item `available`, `partial`, `missing`, or `unverified` and label its claim class.
2. **Map semantics, not wording.** For each source behavior record its skill equivalent: trigger description, imperative procedure, reference, script, output contract, safety rule, or unresolved platform dependency. Convert a useful chain stage into a named procedure with inputs, observable exit criteria, and a recovery path. Preserve intent while removing UI-only language. Treat a claimed behavior as unproven until an example, preview result, or evaluation demonstrates it.
3. **Separate portable from platform-bound behavior.** Keep reasoning patterns, schemas, rubrics, and public references in the skill. Isolate Builder toggles, ChatGPT-only UI, proprietary connectors, credentials, and undocumented model behavior as adapters or explicit exclusions.
4. **Detect semantic loss.** Identify capabilities that cannot transfer cleanly: retrieval ranking, hidden system behavior, tool auth, connector permissions, conversation memory, model-specific formatting, and publishing controls. For each, state impact and a mitigation or acceptance test.
5. **Design the skill boundary.** Define trigger phrases, in-scope and out-of-scope work, required inputs, outputs, escalation rules, references, scripts, assets, and version ownership. Avoid cloning an entire GPT when a smaller composable skill is more reliable. Record how the source hierarchy, tool policy, and failure handling will survive the move.
6. **Create a migration backlog.** Order work as `preserve`, `rewrite`, `externalize`, `replace`, `verify`, or `drop`. Assign acceptance criteria and dependencies. Never carry secrets or private data into a public skill.
7. **Plan Foundry validation.** Propose exactly three distinct eval cases with four evidence-anchored expectations each. Include one semantic-preservation case, one platform-bound loss or adapter case, and one boundary or safety case when applicable. The Foundry should later run with-skill and without-skill comparisons, grade evidence, compute the delta, and iterate.
8. **Issue a disposition:** `ready_for_foundry`, `needs_source_artifacts`, `partial_port`, `not_a_skill`, or `blocked_by_permissions`. Explain what must happen next.

## Required output

Return these sections in order:

1. **Conversion verdict** with disposition, portability confidence, semantic-loss risk, and blockers.
2. **Source inventory** table with `asset`, `status`, `portable_value`, `destination`, and `evidence`.
3. **Capability map** linking each GPT behavior to a skill construct or adapter.
4. **Semantic-loss register** with impact, mitigation, and test.
5. **Skill architecture** covering trigger, scope, workflow, outputs, safety, references, scripts, and ownership.
6. **Migration backlog** with ordered actions and acceptance criteria.
7. **Foundry handoff** using `references/conversion-dossier-schema.md`.

Use public-safe or synthetic examples. Treat unknown platform behavior as
`unverified`; do not invent an export format or claim that hidden GPT behavior
can be reproduced in a SKILL.md.

## Quality gates

- Every source capability has a destination, an explicit drop decision, or a blocker.
- Every proposed portable behavior has evidence, an explicit theory label, or a validation task.
- Platform-bound features are isolated from portable method content.
- Semantic loss is explicit and paired with a mitigation or eval.
- The proposed skill is smaller and composable where possible.
- Prompt-chain control language is converted into modular procedures or explicitly dropped; it is never copied as irreversible runtime instruction.
- Eval expectations test facts supplied by the skill, not generic competence.
- The handoff tells `okhp3-skill-foundry` exactly what to build and measure.

## Handoff

Read `references/conversion-dossier-schema.md` before producing a machine-readable dossier. Use `evals/evals.json` to calibrate eval design. When the verdict is `ready_for_foundry`, load `okhp3-skill-foundry` for architecture, drafting, live evaluation, grading, benchmarking, and fix loops.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3) · MIT License.
