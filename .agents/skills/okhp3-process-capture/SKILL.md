---
name: okhp3-process-capture
description: Capture a recurring task as either a backlog entry or a new skill skeleton. Use when the user says "I keep doing X", "this is the third time", "make this a skill", "let's capture this", or at the natural end of a work session when a repeatable pattern just occurred. Extracts the pattern from conversation context (tools used, sequence of steps, input/output formats, corrections made) and produces either a BACKLOG.md line or a SKILL.md skeleton following this repo's conventions — not full skill authoring (that's skill-creator's job once a skeleton exists).
---

# OKHP3 Process Capture

The intake mechanism. Turns "I just did this for the third time" into a structured artifact, not a lost observation.

## Process

1. **Extract the pattern.** From the current conversation (or a description the user gives), identify: what was the task, what tools/skills were used, what was the input, what was the output, were there corrections or judgment calls along the way that would need to be encoded as instructions.

2. **Assess readiness.** Has this pattern stabilized enough to write down, or is this still "developing taste" (per the original delegation-contract framing — genuinely novel judgment calls each time means it's not a skill yet)?
   - **Not ready** -> write a `BACKLOG.md` entry (date, task, times observed, candidate family, status: captured). Stop here.
   - **Ready** -> continue to step 3.

3. **Determine target family.** Does this fit an existing family (`mermaid/`, `linkedin/`, or this repo's own `process-capture/`), or does it need a new top-level family? If new, note this explicitly — adding a new family directory is a bigger decision than adding a skill within one, and the user should confirm.

4. **Produce the skeleton.** Frontmatter (`name`, "pushy" `description` per skill-creator's triggering guidance) + section-header outline matching the body's intended structure, with 1-2 sentence descriptions per section and pointers to reference files that will need authoring. Match the structure of existing skills in this repo (core+domain pattern for multi-skill families, single-skill pattern for self-contained ones).

5. **Update the index.** Add the new skill's trigger row to root `AGENTS.md`, even though the skeleton isn't fully authored yet — mark it in the "Planned" section if the body is still mostly TOC, move to "Active" once authored.

## Handoff

A skeleton from this skill is a starting point for `skill-creator` (the Anthropic example skill, if available) for full authoring, testing, and description-optimization — this skill does intake and structure, not iteration and evals.
