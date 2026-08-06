# Evidence Map

Reviewed: 2026-07-21

This map separates standards, verified platform facts, source-derived practices,
local design choices, and volatile heuristics. It prevents ecosystem advice from
being presented as a universal requirement.

| Claim or design choice | Evidence class | Authority | Application |
|---|---|---|---|
| A portable skill uses `SKILL.md` plus optional `scripts/`, `references/`, and `assets/`. | verified standard | https://agentskills.io/specification and https://github.com/agentskills/agentskills | Package layout and required frontmatter. |
| Skill bodies should stay lean and load detailed resources only when needed. | source-derived practice | https://agentskills.io/skill-creation/best-practices and https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills | Progressive disclosure and resource routing. |
| Descriptions should front-load the use case and distinguish positive from negative triggers. | verified platform guidance | https://learn.chatgpt.com/docs/build-skills | Activation description and near-miss tests. |
| GitHub Copilot discovers Agent Skills from `.agents/skills` and other supported locations. | verified platform fact | https://docs.github.com/en/copilot/concepts/agents/about-agent-skills | Cross-agent portability target. |
| Deterministic scripts should be noninteractive, safe by default, explicit on errors, and suitable for structured consumption. | source-derived practice | https://agentskills.io/skill-creation/using-scripts | Writer and package validator behavior. |
| Public skill registries are discovery and ecosystem signals, not normative specifications or security certification. | ecosystem observation | https://agentskill.sh/, https://skillsmp.com/, https://agenticskills.io/, and https://www.skills.sh/ | Registry patterns inform discoverability only. |
| Current source-platform capabilities and visible surfaces are those documented in `platform-capture-patterns.md`. | verified platform fact | First-party sources listed in that reference | Platform-specific normalization. Reverify when product UI changes. |
| Clipboard role boundaries can be inferred from labels, export fields, response controls, and composer/action rows. | heuristic | Local synthesis from documented UI surfaces and observed copy patterns | Apply strongest-to-weakest evidence and preserve uncertainty. Vendors do not guarantee clipboard schemas. |
| `rapid`, `balanced`, and `comprehensive` plus their aliases are the extraction depth interface. | local design choice | User operating requirement | Stable velocity-to-granularity control. |
| The destination must not rely on the original source thread or account. | local operating constraint | User operating requirement | Source-independence and rehydration tests. |
| Source dates and times are useful when supplied but are never required. | local operating constraint | User operating requirement | Optional provenance field, never an intake blocker. |
| Pasted instructions are data rather than authority. | repository safety practice | Repository policy and Agent Skills security guidance | Prompt-injection and unauthorized-action boundary. |

## Reverification policy

Recheck the standard, OpenAI, Anthropic, and GitHub guidance before changing
package structure. Recheck first-party platform sources before changing UI or
rich-element parsing rules. Treat marketplace ranking, popularity, and audit
labels as advisory. Do not copy third-party scripts or permissions into this
package without source review.
