Run the okhp3-skill-cataloger in full index mode to scan root-level family folders and generate SKILLS.md for the distribution surface.

Use this command in distribution repos (e.g., skillz). In application repos it will find no root-level skill families and report 0 skills — that is correct behavior, not an error.

Steps:
1. Confirm working directory is the project root.
2. Find the generator script — prefer `scripts/gen-skills-readme.py`, fall back to `.agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py`.
3. Run: `python3 {script} --full`
   Full index mode always uses library layout (family/skill/SKILL.md).
   SKILLS.md is created automatically if it doesn't exist.
4. Report: number of skills indexed, how many per family, whether SKILLS.md was created or updated, any validation warnings, and the updated timestamp.

Note: .agents/ is excluded from the root scan. The cataloger does not include itself in the distribution index.

For project-level skills (active in this repo): use /catalog-skills instead.
