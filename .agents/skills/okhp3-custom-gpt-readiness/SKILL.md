---
name: okhp3-custom-gpt-readiness
description: >-
  Assess an incomplete or newly proposed Custom GPT concept for build readiness.
  Use when a user has a GPT idea, partial notes, pasted conversation, draft
  instructions, knowledge files, or an unfinished GPT and needs an evidence
  inventory, explicit gaps, targeted elicitation, a readiness score, or a
  structured handoff to okhp3-custom-gpt-builder.
license: MIT
metadata:
  version: "1.2.0"
  author: "OverKill Hill P³"
  category: universal
---

# Custom GPT Readiness

Turn scattered GPT ideas and partial artifacts into a buildable, testable brief.
This is an intake and gap-analysis skill, not the builder itself.

## Scope

| In scope | Out of scope |
|---|---|
| Concept triage, evidence inventory, requirement elicitation, readiness scoring, and builder handoff | Writing production integrations, managing credentials, publishing a GPT, or claiming volatile platform limits |

## Operating contract

1. **Inventory before asking.** Inspect the supplied conversation, notes, files, prior prompts, prompt-chain stages, and existing GPT export. Record each artifact as `present`, `partial`, `missing`, or `conflicting`; never ask for information already present.
2. **Classify every claim.** Quote or point to the source artifact for every `present` claim. Label it `verified_platform_fact`, `source_derived_practice`, `theory`, `preference`, `inferred`, or `unknown`. A source assertion does not become a platform fact by being repeated.
3. **Assess the eight readiness domains:** job and audience, outcomes, boundaries, conversation contract, instruction behavior, knowledge/data, tools and permissions, and evaluation/governance.
4. **Identify blockers.** A missing primary job, audience, safety boundary, allowed data source, or acceptance test is a build blocker. Do not declare a concept ready while a blocker remains unresolved.
5. **Ask only high-yield questions.** Return the smallest question set that closes the largest blockers. Group questions by domain and explain why each answer matters.
6. **Score transparently.** Score each domain 0 to 3: `0 missing`, `1 vague`, `2 usable with assumptions`, `3 explicit and evidenced`. Report the total, percentage, blockers, assumptions, and confidence. A score is not a substitute for blocker review.
7. **Choose a disposition:** `ready_for_builder`, `ready_with_questions`, `needs_artifact_recovery`, `not_a_custom_gpt`, or `blocked_by_authority`. Explain the decision.
8. **Plan maturity from the start.** For each acceptance test, state its evidence source, the failure it guards against, and how a future revision will be evaluated. For a multi-step build, produce an intake, contract, configuration, challenge, release, and recovery map. Each stage needs an input, observable exit gate, and recovery action. Treat untested claims as hypotheses, not release criteria.
9. **Produce a handoff.** When the user is ready to continue, emit a builder-ready brief containing confirmed requirements, open questions, source evidence, non-goals, acceptance tests, safety constraints, and unresolved platform facts marked `verify`.

## Required output

Return these sections in order:

1. **Readiness verdict** with disposition, score, confidence, and blockers.
2. **Evidence inventory** table with `domain`, `status`, `claim_class`, `evidence`, `source`, and `owner/action`.
3. **Gap register** separating blockers, important gaps, assumptions, conflicts, and unverified theories.
4. **Targeted questions** only for gaps that change the build decision or acceptance tests.
5. **Phase and recovery map** when the source contains a chain or multi-step process.
5. **Build handoff** when enough information exists, using the schema in `references/readiness-dossier-schema.md`.

Use synthetic or public-safe examples. Do not request secrets, tokens, private customer data, or employer-confidential material. If the concept is actually an Agent Skill, MCP server, fine-tuned model, or ordinary prompt, explain the mismatch and route to the appropriate workflow. Use `custom-gpts/consolidated/EVIDENCE-REGISTER.md` as the repository's interpretation standard when it is available.

## Quality gates

- Every score has evidence or is explicitly marked missing.
- Every consequential claim has a claim class and a traceable source.
- Every blocker maps to a concrete question or artifact request.
- No duplicate questions for information already supplied.
- Acceptance tests are observable and testable, not aspirations.
- Current platform behavior is labeled `verified`, `unverified`, or `needs verification`.
- The handoff is sufficient for `okhp3-custom-gpt-builder` to begin without repeating intake.
- A chain status or completion label is not treated as proof; each proposed phase has an observable gate and recovery path.

## Handoff

Read `references/readiness-dossier-schema.md` before producing JSON or a machine-readable dossier. Use `evals/evals.json` as calibration for expected behavior. After a `ready_for_builder` verdict, load `okhp3-custom-gpt-builder`.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3) · MIT License.
