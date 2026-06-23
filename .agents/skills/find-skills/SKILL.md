---
name: find-skills
description: Helps agents discover, evaluate, and recommend installable agent skills when a task may be better handled by a specialized skill. Use when users ask how to do a specialized task, whether a skill exists, or how to extend agent capabilities.
enabled: true
---

# Find Skills

Use this skill when a user asks whether an agent skill exists for a task, wants to extend the repository with reusable capabilities, or needs help choosing between existing skills and custom FoundRy-local skills.

## Process

1. Identify the user intent and domain.
2. Check whether the task should use an external installable skill, a local `.agents/skills/` skill, or a new FoundRy child capability repo.
3. Prefer reputable sources and official skill packages when recommending external skills.
4. For OKHP3 work, consider whether the capability should instead become a reusable child repo under a FoundRy relay.

## Output

Return:

- recommended skill or skill family
- reason for recommendation
- install or copy guidance
- whether the capability should become a local FoundRy skill or child repository
