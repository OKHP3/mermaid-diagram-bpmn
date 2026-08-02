Run the okhp3-skill-cataloger to scan .agents/skills/ and regenerate the skills catalog README.

Steps:
1. Confirm working directory is the project root (not inside .agents/skills/).
2. Find the generator script — prefer `scripts/gen-skills-readme.py`, fall back to `.agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py`.
3. Run: `python3 {script} --skills-dir .agents/skills`
   Mode is auto-detected. No --mode flag needed unless auto-detection is wrong (see .agents/skills/okhp3-skill-cataloger/references/MODES.md).
4. Report: number of skills cataloged, detected mode, whether README changed or was already current, any validation warnings, and the updated timestamp shown in the README.

For distribution repos: use /index-skills to catalog root-level family folders into SKILLS.md.
