---
name: okhp3-skill-foundry
description: >
  OverKill Hill P³ Skill Foundry -- complete eight-phase methodology for creating,
  honing, and polishing production-quality Agent Skills. Activate when asked to
  create a new skill from scratch, hone or polish an existing skill, apply OKHP3
  brand attribution, design live evals, run executor subagents for benchmarking,
  grade responses with evidence-anchored expectations, compute benchmark deltas,
  or iterate based on eval failures. Also activate when someone wants to turn a
  workflow into a distributable skill, needs to benchmark a skill's with-skill vs
  without-skill gap, wants a professional quality bar for a SKILL.md, or asks
  about the OKHP3 skill authoring process. This is the authoritative Foundry
  methodology for any skill creation or honing work in this repo -- use it even
  when the user just says "make a new skill" or "improve this skill" without
  mentioning the Foundry by name.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: meta-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-skill-foundry

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

The Foundry is an eight-phase, repeatable methodology for taking a skill from blank page to production-ready: brand-attributed, live-eval-benchmarked, and fix-driven. It was developed across 30 live executor runs against five ARE skills and encodes what that process proved. It is not a fork of any prior skill-creation tool. It is a clean-room methodology derived from practice.

**The primary quality signal is the with/without gap.** A skill that scores 1.0 with skill access and 0.3 without is doing real work. A skill that scores 0.9 both ways is a placeholder. Everything the Foundry does points at that gap.

---

## The eight phases

| # | Phase | Product |
|---|-------|---------|
| 1 | **Architecture** | Intent statement, scope boundary, brand decision |
| 2 | **Draft** | SKILL.md with full YAML block, body, About footer |
| 3 | **Eval design** | 3 test cases, 4 evidence-anchored expectations each |
| 4 | **Live execution** | 6 executor runs (3 evals x with/without), parallel |
| 5 | **Grading** | 6 grading.json files with quoted evidence |
| 6 | **Benchmark** | benchmark.json with pass_rate means and delta |
| 7 | **Fix loop** | Failing expectation -> specific edit -> version bump |
| 8 | **Description optimization** | Trigger recall tuning (optional, run when body is stable) |

Work through phases 1-7 in order on first pass. Phase 8 is a separate session after the skill body has converged.

---

## Phase 1 -- Architecture

Before writing any SKILL.md, establish three things:

**Intent** -- One sentence. What does the skill enable an agent to do that it could not do reliably from training data alone? If you cannot write this sentence, the skill does not have a clear purpose yet.

**Scope boundary** -- What the skill covers and what it explicitly does not. This becomes the in_scope / out_of_scope pair in the YAML block (see `references/brand-standard.md`). Out-of-scope items prevent scope creep during the fix loop.

**Brand decision** -- Is this an OKHP3-attributed skill? If yes, the full YAML metadata block is required. If no, minimal YAML (name + description) is sufficient. All skills in this repo are OKHP3-attributed.

Do not proceed to Phase 2 until these three are written down.

---

## Phase 2 -- Draft

Write the SKILL.md. Follow the brand standard in `references/brand-standard.md` for the YAML block, header line, and About footer. Follow these body principles:

**Progressive disclosure.** The description field (always in context) does triggering. The SKILL.md body (loaded on trigger) does instruction. Reference files (loaded on demand) do depth. Never put reference depth in the body.

**Scope-first structure.** The first substantive section after the elevator pitch is the scope table. Agents need to know immediately what falls in and out before doing any work.

**Why before what.** For every major instruction, explain the reason. "Launch all runs in the same turn (parallel)" works better with: "...because sequential launching means the without-skill run sees the wall-clock time of a completed with-skill run and may behave differently."

**Bundled resources layout:**
```
skill-name/
├── SKILL.md
├── evals/evals.json          -- test cases (prompts + expectations)
├── benchmarks/benchmark.json -- aggregated results
├── references/               -- depth documents, loaded on demand
└── assets/                   -- templates, schemas, static files
```

**Under 500 lines.** When the SKILL.md body approaches 500 lines, move detail into a reference file and add a clear pointer: "Read `references/foo.md` for the full spec."

---

## Phase 3 -- Eval design

Design exactly 3 test cases. Each tests a distinct, concrete capability -- not a variation of the same thing.

**The 4-expectation pattern.** Each test case gets exactly 4 binary expectations. Four is the right number: enough to discriminate, not so many that a single run's noise dominates. Write them before any runs start.

**Evidence anchoring.** Every expectation must reference something specific that only the skill would provide: a function name, an API endpoint, an exact string, a data structure, a field name, a specific error class. Expectations that can pass from general LLM knowledge do not measure the skill's contribution -- they measure the baseline.

Bad: "Response mentions using a caching strategy."
Good: "Response references the sessionStorage cache using the key prefix `are_wiki_`."

Bad: "Response provides the correct API endpoint."
Good: "Response provides `GET https://en.wikipedia.org/api/rest_v1/page/summary/{article_title}`."

The without-skill baseline should fail most expectations. If the baseline consistently passes 3 of 4, the expectations are not discriminating -- rewrite them.

Save to `evals/evals.json`. See `references/eval-patterns.md` for the full schema and good/bad examples from the ARE eval set.

---

## Phase 4 -- Live execution

Launch all 6 runs in the same turn. This is non-negotiable.

Launching with-skill runs first and without-skill runs in a later turn creates a timing artifact: the without-skill subagent may observe state left by the with-skill run. Launch everything together.

**Executor task format -- with_skill:**
```
You are an AI coding assistant. Answer a developer question using a specialized skill.

INSTRUCTIONS:
1. Read the skill file at: <skill-path>/SKILL.md
2. Use the knowledge from that skill to answer the question below
3. Write your complete response to: <workspace>/eval-<N>/with_skill/outputs/response.md
4. Write execution metrics to: <workspace>/eval-<N>/with_skill/outputs/metrics.json

USER QUESTION:
<eval prompt>
```

**Executor task format -- without_skill:**
```
You are an AI coding assistant. Answer a developer question from general knowledge only.
Do NOT read any skill files or SKILL.md files.

INSTRUCTIONS:
1. Answer the question below from your training knowledge only
2. Write your complete response to: <workspace>/eval-<N>/without_skill/outputs/response.md
3. Write execution metrics to: <workspace>/eval-<N>/without_skill/outputs/metrics.json

USER QUESTION:
<eval prompt>
```

Use `startAsyncSubagent` for all 6 runs. Follow with a single `wait_for_background_tasks`.

Workspace layout:
```
<skill-name>-workspace/iteration-1/
  eval-1/with_skill/outputs/response.md
  eval-1/with_skill/outputs/metrics.json
  eval-1/with_skill/grading.json
  eval-1/without_skill/outputs/response.md
  eval-1/without_skill/outputs/metrics.json
  eval-1/without_skill/grading.json
```

---

## Phase 5 -- Grading

Read all 6 response.md files. Grade each one inline (do not spawn a grader subagent -- main agent grading is faster and produces better evidence quotes).

For each expectation, write a binary `passed: true/false` and an `evidence` string. The evidence string must be a verbatim quote or a precise description of what was or was not found in the response. Never write "response seems to address this" as evidence. Quote the text or state exactly what was missing.

Write one grading.json per run directory:
```json
{
  "expectations": [
    {
      "text": "Exact expectation text",
      "passed": true,
      "evidence": "Verbatim quote from response: '...'"
    }
  ],
  "summary": { "passed": 3, "failed": 1, "total": 4, "pass_rate": 0.75 },
  "execution_metrics": {},
  "timing": {},
  "claims": [],
  "user_notes_summary": {
    "uncertainties": [],
    "needs_review": [],
    "workarounds": []
  }
}
```

The `needs_review` array is where you flag consequences: "Without-skill said WEB lacks deuterocanon -- factually wrong, would cause Catholic users to get wrong translation." Put it there.

See `references/grading-schema.md` for the full schema.

---

## Phase 6 -- Benchmark

Aggregate after all 6 runs are graded.

Compute per-configuration pass_rate means across all 3 evals. Compute the delta (with_skill mean minus without_skill mean). Write `benchmarks/benchmark.json`:

```json
{
  "metadata": { "skill_name": "...", "skill_version": "...", "timestamp": "...", "evals_run": [1,2,3], "note": "All 3 evals: LIVE runs" },
  "runs": [ ... ],
  "run_summary": {
    "with_skill":    { "pass_rate": { "mean": 0.92, "stddev": 0.14, "min": 0.75, "max": 1.0 } },
    "without_skill": { "pass_rate": { "mean": 0.25, "stddev": 0.22, "min": 0.0,  "max": 0.5  } },
    "delta":         { "pass_rate": "+0.67" }
  },
  "notes": [ "Key findings from the run set" ]
}
```

**Acceptance bar:** with_skill mean >= 0.9, delta >= 0.5. If either fails, proceed to Phase 7.

A with_skill score below 0.9 means the skill is not delivering its own content reliably. A delta below 0.5 means the skill is not providing meaningful uplift over what the LLM already knows.

See `references/grading-schema.md` for the full benchmark.json schema.

---

## Phase 7 -- Fix loop

Every failing expectation is a direct signal about a gap in the skill body. Read the failure. Ask: what is missing from the SKILL.md that would have caused the executor to get this right?

Three fix types:

**Content gap** -- The skill does not include the specific fact, function name, endpoint, or string the expectation tests. Add it to the SKILL.md body or a reference file. This is the most common fix.

**Emphasis gap** -- The content is present but the executor missed it. Add a WARNING block, bold the key line, or restructure so the critical information is impossible to skip.

**Expectation error** -- The expectation tests something the skill genuinely does not teach and should not. Rewrite the expectation, not the skill.

After applying fixes, bump the patch version (1.0.0 -> 1.0.1 for content fixes, minor version 1.0.0 -> 1.1.0 for structural changes). Document the fix in the benchmark notes. Rerun only the failing evals (not all 6) unless the fix touches shared content.

Stop iterating when: with_skill mean >= 0.9 AND delta >= 0.5 AND all failing expectations have documented fixes.

---

## Phase 8 -- Description optimization

The `description` field controls when the skill triggers. Trigger accuracy is separate from skill quality -- a perfect skill that never triggers is useless.

Run description optimization only when the skill body has converged (no more Phase 7 iterations planned).

The optimization process:
1. Write 20 trigger eval queries -- 10 that should trigger the skill, 10 near-misses that should not.
2. The near-misses are the valuable ones. Make them genuinely tricky -- adjacent domain, shared keywords, different intent.
3. For each query, evaluate: would the description cause an agent to load this skill? Pass/fail.
4. Rewrite the description to improve precision. The description should be "pushy" -- it should trigger the skill slightly earlier than necessary rather than slightly later.
5. Repeat until recall >= 0.85 and precision >= 0.80 on the trigger eval set.

---

## References

Read these when you need depth. Do not read them all upfront.

- `references/brand-standard.md` -- Full OKHP3 YAML block spec, header format, About footer format, version naming convention.
- `references/eval-patterns.md` -- Good vs bad expectations from the ARE eval set. Evidence anchoring examples. 4-expectation pattern rationale.
- `references/grading-schema.md` -- Complete grading.json and benchmark.json JSON schemas with field definitions.
- `assets/skill-template.md` -- Blank SKILL.md with all sections pre-populated, ready to fill in.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
