# Mode reference

The generator has two surfaces and three catalog interpretations. Select the
surface first: catalog mode reads `.agents/skills/`; full index mode reads root
family folders.

## Catalog mode

Catalog mode is the default when `--full` is absent.

| Mode | Layout scanned | README output |
|---|---|---|
| `project` | `.agents/skills/<skill>/SKILL.md` | One flat table |
| `library` | `.agents/skills/<category>/<skill>/SKILL.md` | Tables grouped by category |

Use `--mode project` or `--mode library` to make the interpretation explicit.
With `--mode auto` (the default), the script inspects the first non-hidden child
of the skills root: a direct `SKILL.md` means `project`; otherwise it means
`library`; an empty root defaults to `project`. Because this is a first-child
heuristic, mixed layouts can omit skills. Fix the layout or pass the intended
mode explicitly.

```bash
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills --check
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills --mode project --dry-run
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills --mode library --dry-run
```

Catalog mode requires the output README to already contain:

```text
<!-- SKILLS_CATALOG_START -->
<!-- SKILLS_CATALOG_END -->
```

The script replaces only the content between these markers. A successful
non-check, non-dry run also writes `.agents/skills/.catalog-meta.json`.

## Full index mode

Use `--full` only for a distribution repository with root-level family folders.
It always uses library grouping and ignores `--mode`.

```text
library-repo/
├── mermaid/<skill>/SKILL.md
├── universal/<skill>/SKILL.md
├── .agents/                 # excluded
└── README.md                # root catalog output
```

The run scans `<family>/<skill>/SKILL.md`, skips hidden/tool directories, and
produces:

- root `README.md` catalog section (created or updated between catalog markers);
- `FAMILY.md` inside every active family unless `--no-family-md` is passed;
- root `.catalog-meta.json` with `surface: distribution`; and
- a root Families table only when its `FAMILIES_TABLE_START` and
  `FAMILIES_TABLE_END` markers already exist.

`--output custom.md` changes only the root catalog file. It does not relocate
family files or metadata.

## Safe inspection and mutation rules

| Flag | Reads/discovers | Validates | Previews | Writes/deletes |
|---|---:|---:|---:|---:|
| `--check` | yes | yes | no | no |
| `--dry-run` | yes | yes | yes | no |
| `--json` | yes | discovery only | JSON stdout | no |
| no safety flag | yes | yes | no | yes, after validation |

In full mode, the normal write path may absorb a family `README.md` into a new
`FAMILY.md` and delete the original. Preview this with `--dry-run`; preserve the
source by passing `--no-absorb-readme`. `--no-family-md` skips all family-file
generation. Neither safety flag changes the discovered skill set.

## Choosing a mode

| Repository shape | Recommended command | Reason |
|---|---|---|
| LifeTrkr or another application repo | catalog, `--mode project` | Skills live directly under `.agents/skills/` |
| Categorized project skills | catalog, `--mode library` | Category folders are intentional |
| Distribution library | `--full` | Root families are the installable surface |

If a full index finds zero skills, it reports an empty distribution surface; it
does not imply that the project’s `.agents/skills/` catalog is empty.
