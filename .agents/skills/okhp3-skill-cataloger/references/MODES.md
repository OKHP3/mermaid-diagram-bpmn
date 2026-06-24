# okhp3-skill-cataloger — Mode Reference

The `gen-skills-readme.py` script operates in three modes. Choosing the
wrong mode produces an empty table or an incorrectly structured catalog.

---

## Mode overview

| Mode | Flag | Scans | Writes | Auto-detected? |
|---|---|---|---|---|
| `project` | (none) | `.agents/skills/` — flat layout | `.agents/skills/README.md` | Yes |
| `library` | (none) | `.agents/skills/` — categorized layout | `.agents/skills/README.md` | Yes |
| Full index | `--full` | Repo root family folders | `SKILLS.md` | N/A — explicit flag |

`project` and `library` are both "catalog" modes — they differ only in how they
interpret `.agents/skills/`. The `--full` flag is a distinct operation that scans
the repo root for the distribution surface.

---

## Auto-detection (catalog mode)

The script detects `project` vs `library` automatically when `--mode auto` is
used (the default) and `--full` is not passed.

**Algorithm:** Inspect the first non-hidden subdirectory of `.agents/skills/`.

| First subdirectory contains… | Detected mode |
|---|---|
| `SKILL.md` directly | `project` |
| More subdirectories (no `SKILL.md`) | `library` |

Auto-detection is correct in virtually all cases. Use `--mode project` or
`--mode library` only when you need to override — for example, when a category
folder happens to contain a stray `SKILL.md` that tricks the detector.

```bash
# Auto-detect (recommended)
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills

# Explicit override
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills --mode project
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills --mode library
```

---

## project mode

**Use when:** `.agents/skills/` contains skill folders directly (flat layout).

```
.agents/skills/
├── okhp3-skill-cataloger/
│   └── SKILL.md
├── celestial-data/
│   └── SKILL.md
└── gis-token-model/
    └── SKILL.md
```

**How to identify:** Every subdirectory inside `.agents/skills/` contains
a `SKILL.md` file directly.

**README output:** A single flat table with columns Skill, Description,
Version, Category.

---

## library mode

**Use when:** `.agents/skills/` contains category folders, each of which
contains skill folders (categorized layout).

```
.agents/skills/
├── universal/                  ← category folder
│   ├── vite-github-pages/
│   │   └── SKILL.md
│   └── gis-token-model/
│       └── SKILL.md
├── mermaid/                    ← category folder
│   ├── okhp3-mermaid-core/
│   │   └── SKILL.md
│   └── okhp3-mermaid-bpmn/
│       └── SKILL.md
└── glee-fully/                 ← category folder
    └── glee-recipe-planning/
        └── SKILL.md
```

**How to identify:** Subdirectories inside `.agents/skills/` do NOT contain
`SKILL.md` directly — they contain more subdirectories.

**README output:** Skills grouped into sections by category, with a skill
count per category.

---

## Full index mode (`--full`)

**Use when:** You want to catalog the **distribution surface** of a skills
library repo — the root-level family folders that contain skills available for
others to install (e.g., the `skillz` repo).

This is NOT a mode of catalog mode. It is a distinct operation triggered by the
`--full` flag. It always uses library-style grouping (family/skill).

```
skillz/                         ← repo root (scanned by --full)
├── mermaid/
│   ├── okhp3-mermaid-core/
│   │   └── SKILL.md            ← discovered
│   └── okhp3-mermaid-bpmn/
│       └── SKILL.md            ← discovered
├── linkedin/
│   └── okhp3-linkedin-post/
│       └── SKILL.md            ← discovered
├── universal/
│   └── vite-github-pages/
│       └── SKILL.md            ← discovered
├── .agents/                    ← SKIPPED (in exclusion list)
│   └── skills/
│       └── okhp3-skill-cataloger/
│           └── SKILL.md        ← NOT discovered (inside .agents/)
└── SKILLS.md                   ← OUTPUT written here
```

**Key differences from catalog mode:**

| | Catalog mode | Full index mode |
|---|---|---|
| Flag | (none) | `--full` |
| Scans | `.agents/skills/` | Repo root |
| Output | `.agents/skills/README.md` | `SKILLS.md` |
| Output must pre-exist | Yes (with markers) | No (auto-created) |
| `.catalog-meta.json` location | `.agents/skills/` | Repo root |
| Includes cataloger itself | Yes | No (`.agents/` excluded) |
| Mode | auto-detected or explicit | Always library |

```bash
# Full index mode
python3 scripts/gen-skills-readme.py --full

# Full index, preview only
python3 scripts/gen-skills-readme.py --full --dry-run

# Full index with custom output file
python3 scripts/gen-skills-readme.py --full --output my-index.md
```

**When to use `--full` vs catalog:**

| Repo | Typical command | Reason |
|---|---|---|
| `kierans-lifetrkr` | (none / default) | Application repo, catalogs `.agents/skills/` |
| `mermaid-diagram-bpmn` | (none / default) | Application repo, catalogs `.agents/skills/` |
| `skillz` | `--full` | Distribution repo, indexes root family folders |
| `skillz` | (none / default) | Also valid — catalogs skillz's own `.agents/skills/` |

---

## When repos use which mode

| Repo | Catalog mode | Notes |
|---|---|---|
| `kierans-lifetrkr` | project | Small focused set — flat is correct |
| `mermaid-diagram-bpmn` | project | Skills are flat in `.agents/skills/` |
| `mermaid-theme-builder` | project | Single skill — flat is correct |
| `skillz` | library (for `.agents/skills/`) | `.agents/skills/` may use category folders |
| `skillz` with `--full` | library (always) | Root family folders — the distribution surface |
| `Glee-fullyTools` | library | 50+ tools with sub-skills — category folders required |
| Any new project repo | project | Default until category folders are added |

---

## Switching from project to library

When a project outgrows a flat structure and you add category folders:

1. Create category subfolders inside `.agents/skills/`:
   ```bash
   mkdir -p .agents/skills/core
   mkdir -p .agents/skills/integrations
   ```
2. Move skill directories into the appropriate category:
   ```bash
   git mv .agents/skills/celestial-data .agents/skills/core/celestial-data
   ```
3. Run the cataloger — auto-detection will pick up library mode:
   ```bash
   python3 scripts/gen-skills-readme.py
   ```
4. Commit the restructured skills and updated README.

No flag or configuration change needed — auto-detection handles it.

---

## Edge cases

**Mixed structure (some categories, some flat skills):**
Auto-detection inspects only the first subdirectory. If the first subdirectory
is a category folder (no `SKILL.md`), mode resolves to `library`. Skills sitting
flat alongside category folders will be missed in library mode. Keep the
structure consistent: either all flat or all categorized.

**Empty `.agents/skills/` directory:**
Auto-detection defaults to `project`. The catalog will be empty but valid.

**Category folder with a stray `SKILL.md`:**
If a category folder (e.g., `mermaid/`) accidentally contains a `SKILL.md`
at its root, auto-detection will see it and choose `project` mode, missing
all the nested skills. Remove the stray `SKILL.md` or pass `--mode library`
explicitly until it is cleaned up.

**Full index finds nothing:**
If run in an application repo where no root-level family folders exist,
`--full` writes an empty `SKILLS.md` and reports 0 skills. This is correct
behavior — it signals that the repo has no distribution surface, not an error.
