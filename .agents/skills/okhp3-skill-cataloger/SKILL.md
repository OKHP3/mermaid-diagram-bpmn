---
name: okhp3-skill-cataloger
description: >
  OverKill Hill P³ skill cataloger. Discover, index, and catalog all Agent Skills
  in a repository's .agents/skills/ directory by scanning each SKILL.md file and
  generating a structured, maintained README.md that serves as a living table of
  contents for the skill ecosystem. Use when asked to catalog, list, inventory,
  or update skills; regenerate the skills readme or catalog; show what skills are
  installed; check skill versions; validate naming conventions; or refresh the
  skills list. Also activates on "what skills does this project have",
  "is the skills catalog current", or "run the skill cataloger".
  Use the full index mode when asked to catalog the distribution surface, index all
  available skills, rebuild README.md, run a full catalog, run a full index, index
  all skills in this repo, or show all skills available for distribution. Also
  generates a FAMILY.md inside each family directory with an auto-sourced summary
  and skill inventory; use --no-family-md to skip. Also generates a FAMILY.md
  inside each family directory with an auto-sourced summary and skill inventory;
  use --no-family-md to skip. On first FAMILY.md creation, absorbs and deletes
  any existing README.md in that family directory (use --no-absorb-readme to
  skip). Also auto-updates the Families table in root README.md when
  FAMILIES_TABLE_START/END markers are present.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.4.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-skill-cataloger

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

`okhp3-skill-cataloger` is an OverKill Hill P³–branded Agent Skill designed to
automatically discover, index, and catalog all Agent Skills contained within a
repository. Its primary function is to generate and maintain a clean, structured
file that serves as a living table of contents for the skill ecosystem.

**Two modes, one script:**

| Mode | Slash command | Scans | Writes | Use when |
|---|---|---|---|---|
| **Catalog** (default) | `/catalog-skills` | `.agents/skills/` | `.agents/skills/README.md` | Inventorying skills active in this project |
| **Full index** (`--full`) | `/index-skills` | Root family folders | `README.md` | Indexing the distribution surface of a skills library |

In an application repo, only catalog mode is meaningful.
In a distribution repo (skillz), both modes are useful.

---

## How to activate this skill

### Natural language (all compliant agents)

**Catalog mode** — any of these phrases:

```
catalog the skills
catalog all skills
catalog all agent skills
reindex the skills
index the skills
update the skills readme
update the skills catalog
refresh the skills list
refresh the skills catalog
show installed skills
show what skills are installed
what skills does this project have
are the skills up to date
run the skill cataloger
okhp3-skill-cataloger
```

**Full index mode** — any of these phrases:

```
full catalog
full index
index all skills
index all available skills
catalog the distribution surface
rebuild README.md
update README.md
show all skills available for distribution
```

These work in Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI,
and any other agent client that implements the Agent Skills standard.

### Slash commands in Claude Code

Two slash commands ship with this skill:

- **`/catalog-skills`** — catalog mode (`.agents/skills/` → `README.md`)
- **`/index-skills`** — full index mode (root family folders → `README.md`)

**Installation (one-time per project):**

```bash
mkdir -p .claude/commands
cp .agents/skills/okhp3-skill-cataloger/.claude/commands/catalog-skills.md \
   .claude/commands/catalog-skills.md
cp .agents/skills/okhp3-skill-cataloger/.claude/commands/index-skills.md \
   .claude/commands/index-skills.md
git add .claude/commands/
git commit -m "chore: install /catalog-skills and /index-skills commands"
```

Both files ship inside this skill package. They must be copied to the project
root's `.claude/commands/` to function — Claude Code looks there, not inside
the skill directory. This step is required once per project.

### Built-in listing command: `/skills`

In VS Code with GitHub Copilot, `/skills` lists available skills in the
current project. It does not run `okhp3-skill-cataloger` — it confirms the
cataloger is installed and visible to Copilot.

---

## When to use this skill

Activate when the user or context requires any of:

**Catalog mode:**
- Cataloging, listing, or inventorying the skills in this project
- Regenerating or updating `.agents/skills/README.md`
- Checking what skills are installed and their current versions
- Validating that every skill's `name` field matches its directory name
- Getting a machine-readable JSON summary of all installed skills

**Full index mode:**
- Indexing or cataloging the distribution surface of a skills library
- Regenerating or updating `README.md` in a distribution repo (skillz)
- Checking what skills are available for installation by others
- Auditing the full family/skill structure at root level

---

## Core instructions

### Step 1 — Confirm project root

This skill lives at `.agents/skills/okhp3-skill-cataloger/SKILL.md`. All
commands run from the project root, two directories up from this file.

```bash
ls .agents/skills/
```

### Step 2 — Locate the generator script

Use the first found:

1. `scripts/gen-skills-readme.py` — canonical project-level copy (preferred)
2. `.agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py` — bundled fallback

If neither exists, tell the user the script is missing. The bundled copy ships
inside this skill package.

### Step 3 — Run the generator

**Catalog mode** (default — scans `.agents/skills/`):

```bash
python3 ${SCRIPT} --skills-dir .agents/skills
```

Mode is auto-detected by default. Pass `--mode project` or `--mode library`
only when you need to override. See `references/MODES.md` for guidance.

**Full index mode** (scans root family folders → `README.md`):

```bash
python3 ${SCRIPT} --full
```

Full index mode always uses library mode (family/skill/SKILL.md layout).
`README.md` is created automatically if it doesn't exist.

If the script exits with fatal errors (name mismatches, missing descriptions,
duplicate names): show the full output and stop. Resolve errors before
regenerating. Warnings may be shown and skipped.

### Step 4 — Report results

Tell the user:

- How many skills were found and cataloged
- Which mode was used (auto-detected or explicit) and what it resolved to
- Whether the output file was updated or already current
- Any validation warnings
- That `.catalog-meta.json` was written with machine-readable state

The generated section renders as:

```
*Catalog last updated: **June 23, 2026 at 16:36 UTC** · **5** skills indexed*
```

With an HTML comment for tooling:

```html
<!-- Generated: 2026-06-23 16:36 UTC | Skills: 5 | Mode: project | Surface: project-skills -->
```

---

## Available commands

```bash
# Catalog mode: auto-detect, catalog .agents/skills/, update README
python3 ${SCRIPT} --skills-dir .agents/skills

# Full index mode: scan root family folders, write README.md
python3 ${SCRIPT} --full

# Preview what would change without writing any files
python3 ${SCRIPT} --skills-dir .agents/skills --dry-run
python3 ${SCRIPT} --full --dry-run

# Validate only — report errors and warnings, do not write output
python3 ${SCRIPT} --skills-dir .agents/skills --check

# JSON output — machine-readable skill list to stdout
python3 ${SCRIPT} --skills-dir .agents/skills --json

# Explicit mode override (catalog mode)
python3 ${SCRIPT} --skills-dir .agents/skills --mode project
python3 ${SCRIPT} --skills-dir .agents/skills --mode library

# Override output file (both modes)
python3 ${SCRIPT} --full --output my-index.md

# Quiet — suppress output unless there are changes or errors
python3 ${SCRIPT} --skills-dir .agents/skills --quiet
python3 ${SCRIPT} --full --quiet

# Skip FAMILY.md generation during full index mode
python3 ${SCRIPT} --full --no-family-md
```

---

## Gotchas

- **Run from the project root.** The script resolves `.agents/skills/` as a
  relative path. Running from inside the skill directory will fail.

- **Catalog mode: README must exist with markers.** If `.agents/skills/README.md`
  does not exist, or is missing the `<!-- SKILLS_CATALOG_START -->` and
  `<!-- SKILLS_CATALOG_END -->` markers, the script exits with an error. Create
  the README with those markers before the first catalog run.

- **Full index mode: README.md is auto-created.** Unlike catalog mode, `--full`
  creates `README.md` if it doesn't exist. The markers are part of the generated
  content. No pre-existing file or markers needed.

- **This skill catalogs itself in catalog mode.** `okhp3-skill-cataloger`
  appears in the generated table. This is correct — a complete inventory includes
  the cataloger. In full index mode, `.agents/` is excluded from the root scan,
  so the cataloger does NOT include itself in the distribution index.

- **Python 3.9+ required. No external dependencies.** Standard library only.

- **Library mode on a flat structure produces an empty table.** Auto-detection
  handles this correctly in most cases. See `references/MODES.md` if it does not.

- **`/catalog-skills` and `/index-skills` require copying command files to the project root.**
  See the slash command installation step above.

- **`.catalog-meta.json` is written on every successful run.** Location depends
  on mode: `.agents/skills/.catalog-meta.json` for catalog mode, `.catalog-meta.json`
  at repo root for full index mode. Commit it for CI use; add to `.gitignore` if ephemeral.

- **`--full` always uses library mode.** There is no project-mode full index.
  The distribution surface is always organized into family/skill folders.

- **`--full` writes FAMILY.md in each discovered family directory.** On first
  run, the summary is auto-sourced from the family's `README.md` (first
  substantive paragraph) or aggregated from child skill descriptions when no
  README.md exists. On subsequent runs, any content you have edited between
  `<!-- FAMILY_SUMMARY_START -->` and `<!-- FAMILY_SUMMARY_END -->` is preserved.
  The inventory table is always regenerated. Use `--no-family-md` to skip.

- **Placeholder families with no skills get no FAMILY.md.** Only directories
  that contain at least one `SKILL.md` at depth 2 are treated as active families.
  A placeholder directory with only a README.md will not receive FAMILY.md until
  it contains at least one skill.

---

## References

- `references/MODES.md` — when to use `project` vs `library` mode, how
  auto-detection works, when to override, and how `--full` differs.

- `assets/catalog-meta-schema.json` — JSON Schema for `.catalog-meta.json`.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
