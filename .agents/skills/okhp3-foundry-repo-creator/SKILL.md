---
name: okhp3-foundry-repo-creator
description: Create governed FoundRy child repositories from Custom GPTs, Gemini Gems, Copilot agents, prompt bundles, Notion concepts, research notes, or prototype ideas. Use whenever the user wants to migrate an AI capability into GitHub, standardize a repo, create a child repo scaffold, or convert platform-specific AI work into a reusable capability package.
enabled: true
---

# FoundRy Repo Creator

Create a governed child repository package from an AI capability, prompt artifact, research concept, or product idea.

## Trigger When

Use this skill when the user wants to:

- migrate a Custom GPT, Gem, Copilot agent, or prompt bundle into GitHub
- create a new FoundRy child repository
- standardize a repository against FoundRy governance
- convert a platform-specific AI artifact into a reusable capability package
- generate scaffold files for `AGENTS.md`, `README.md`, `CHANGELOG.md`, `manifest.yaml`, `docs/`, `origin/`, `skill/`, `research/`, `tests/`, `schemas/`, `assets/`, `exports/`, and `archive/`

## Required Output

Produce a repo package containing:

```text
AGENTS.md
README.md
CHANGELOG.md
LICENSE.md
manifest.yaml
docs/
origin/
skill/
prompts/
research/
tests/
schemas/
assets/
exports/
archive/
```

## Process

1. Identify the parent FoundRy.
2. Select the correct naming pattern.
3. Preserve original platform artifacts in `origin/`.
4. Convert refined deployable behavior into `skill/`.
5. Put rationale and architecture in `docs/` and `research/`.
6. Generate `manifest.yaml` from the repo manifest schema.
7. Add the repo to the FoundRy registry.
8. Flag private, client, employer, or public-source-only constraints.

## Parent FoundRy Decision

- Use `OverKill-Hill-FoundRy` for systems, promptcraft, research, writing, local AI, apps, Mermaid, and FoundRy prototypes.
- Use `AskJamie-FoundRy` for AskJamie, BrandGuard, Enterprise Sleuth, RAG, identity, and conversation behavior.
- Use `Glee-fullyTools-FoundRy` for Glee-fully Tools, Tool-ettes, consumer utilities, tone systems, and life/productivity tools.

## Graduation Gate

Do not mark a repository as public-ready until PII, employer references, licensed material, source rights, and manifest visibility fields have been reviewed.
