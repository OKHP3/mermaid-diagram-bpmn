# Custom GPT Builder Skill Manifest

## Package

- **Skill name:** `custom-gpt-builder`
- **Purpose:** Build, audit, improve, package, and govern OpenAI Custom GPTs as productized AI assistants.
- **Version:** `1.3.0`
- **Author:** OverKill Hill P³
- **Copyright:** Copyright © 2024–2026 OverKill Hill P³ — https://overkillhill.com
- **License:** CC BY 4.0 — Attribution required. See `LICENSE.md`.
- **Attribution required:** "Originated by OverKill Hill P³ (https://overkillhill.com) — Skill: custom-gpt-builder — License: CC BY 4.0"
- **Last verified:** 2026-07-20
- **Changelog:** See `CHANGELOG.md`

## License Summary

This skill is published under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.

- ✅ Free to use commercially and personally
- ✅ Free to adapt and redistribute
- ✅ Free to embed in other products and tools
- ⚠️ **Attribution to OverKill Hill P³ is required in all uses and derivatives**
- ⚠️ Any executable scripts are additionally licensed under Apache 2.0

Full license text: `LICENSE.md` or https://creativecommons.org/licenses/by/4.0/legalcode

## Current-platform verification rule

Platform details change frequently. Before stating limits, feature availability, pricing, model behavior, GPT Builder constraints, Actions/App compatibility, Gemini Gem capabilities, or Copilot agent behavior as definitive, verify against current official documentation or clearly label the statement as unverified.

## File inventory

| Path | Purpose | Authority |
|---|---|---:|
| `SKILL.md` | Main activation metadata, lifecycle workflow, audit checklist, examples, output contract, boundaries | Primary |
| `MANIFEST.md` | This package inventory and governance map | Primary |
| `LICENSE.md` | CC BY 4.0 license with OverKill Hill P³ attribution requirement | Primary |
| `CHANGELOG.md` | Version history and change tracking | Primary |
| `references/repo-overlay.md` | Repository-specific brand and output alignment | Primary |
| `references/instruction-architecture.md` | 8-layer instruction architecture, No-Contradictions Rule, anti-patterns, self-check | High |
| `references/knowledge-engineering.md` | Knowledge-file preparation, retrieval behavior, manifest strategy, testing | High |
| `references/actions-and-apps.md` | Actions, Apps/connectors, OpenAPI, auth, privacy, and verification guidance | High |
| `references/platform-comparison.md` | Custom GPT vs Gemini Gem vs Copilot declarative agent comparison | Medium; verify current platform facts |
| `references/quality-tiers.md` | Poor/acceptable/good/exemplary rubric and triage model | High |
| `references/taxonomy.md` | Mapping across GPTs, Projects, chats, prompts, RAG, MCP, agents, skills, etc. | Medium |
| `references/eval-and-redteam.md` | Test prompt strategy, adversarial cases, and test logging | High |
| `evals/evals.json` | Assertion-graded eval cases for regression testing | High |

## Governance notes

1. Keep `SKILL.md` concise and task-oriented. Move long detail into `references/`.
2. Do not hard-code volatile platform claims without a verification note.
3. Keep repo-specific concerns in `references/repo-overlay.md`, not in the shared core logic.
4. Preserve the `name: custom-gpt-builder` metadata and folder-name match.
5. Update `version` when behavioral logic changes.
6. Update `last-verified` when official platform documentation is checked.
7. Do not store API keys, credentials, customer data, private GPT instructions, or proprietary source files in this skill package.
8. Treat eval failures as regressions until intentionally accepted.
9. `LICENSE.md` must not be removed or modified without explicit owner decision by OverKill Hill P³.
10. Any fork or derivative must preserve the attribution notice per CC BY 4.0 terms.

## Recommended maintenance cadence

- **Monthly:** verify official GPT Builder, Actions, Apps/connectors, Gemini Gems, and Copilot agent constraints.
- **Per release:** run evals and red-team prompts; update CHANGELOG.md.
- **Per repo fork/copy:** update `references/repo-overlay.md`; preserve LICENSE.md and attribution.
- **Per major model/platform change:** retest knowledge retrieval, tool selection, and refusal behavior.
