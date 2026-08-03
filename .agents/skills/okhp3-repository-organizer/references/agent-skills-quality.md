# Agent Skills quality alignment

This package follows the portable Agent Skills shape and the local Skill Foundry contract. This file is an audit trail, not a runtime dependency.

## Conformance decisions

- `SKILL.md` contains the required lowercase hyphenated skill name, a trigger-oriented description, the license, and the operating contract.
- The main instructions remain compact and progressively disclose detail through focused references, a read-only inventory script, and a small evaluation manifest.
- The workflow states inputs, preconditions, tool fallbacks, decision gates, outputs, examples, safety boundaries, and verification behavior.
- The bundled script is deterministic and read-only. It emits structured JSON, validates positive numeric options, reports when file enumeration was truncated, handles UTF-8 output on Windows, and exposes portability diagnostics without renaming anything.
- Evaluation cases cover mixed-content profiling, proportional governance scaffolding, and safe cross-platform migration. The recorded benchmark includes both with-skill and without-skill baselines.
- The skill is client-neutral. It does not require a particular browser, computer-control implementation, agent runtime, or optional tool name. Tool availability changes the evidence level, not the safety rules.
- The package does not declare experimental `allowed-tools`; clients differ in tool names and enforcement, so the workflow expresses authorization and tool routing in portable instructions.

## Sources

- [Agent Skills specification](https://agentskills.io/specification)
- [agentskills reference repository](https://github.com/agentskills/agentskills)
- [Anthropic: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [GitHub Copilot: About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [ChatGPT Learn: Build skills](https://learn.chatgpt.com/docs/build-skills)
- [AgentSkill.sh directory](https://agentskill.sh/)
- [AgenticSkills directory](https://agenticskills.io/)
- [SkillsMP directory](https://skillsmp.com/)
- [skills.sh directory](https://www.skills.sh/)

The directories and marketplaces are treated as discovery and quality-signal surfaces, not as normative specifications. The portable contract is anchored in the specification, repository guidance, and local validation.
