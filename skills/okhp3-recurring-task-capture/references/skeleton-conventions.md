# Skill skeleton conventions

Conventions this skill follows when producing a `SKILL.md` skeleton (step 4 of
the process in `SKILL.md`), matched against how skills already exist in this
repository.

## Frontmatter

A skeleton's frontmatter carries every field the repository's validator
checks for, even before the body is fully authored:

- `name` — matches the target directory name exactly, `okhp3-` prefixed,
  under the 36-character directory limit.
- `description` — written "pushy" per skill-creator's triggering guidance:
  what the skill does, when to use it, named trigger phrases, and an explicit
  `Do not use for...` boundary. Draft-stage descriptions may be short; they
  still need the trigger-phrase and boundary shape so the skeleton is usable
  without a rewrite.
- `license` — `MIT` unless the user says otherwise.
- `metadata` — `author`, `version` (skeletons start at `"0.1.0"`), `category`,
  `origin`, `homepage`, `author-github`, `in_scope`, `out_of_scope`,
  `produces`. A BP-SKILL-family skeleton (one that consumes/produces a
  pipeline artifact such as `pns.yaml` or `pir.yaml`) also carries
  `bp_skill_version` and `consumes`/`depends_on`; a meta-tooling skeleton
  (like this skill's own family) does not need those two.

## Body shape

- **Core+domain pattern** — for a new top-level family with more than one
  skill planned (mirrors this repo's `okhp3-mermaid-*` split): a short
  `core` skill holding shared conventions, plus domain skills that reference
  it.
- **Single-skill pattern** — for a self-contained capability with no sibling
  skills planned (mirrors `okhp3-skill-promotion`, `okhp3-recurring-task-capture`
  itself): one `SKILL.md`, sectioned as `## Process` (numbered steps) and
  `## About` (brand-standard footer).

Either shape gets: a one-line role statement under the H1, a `## Process`
section as numbered steps with 1-2 sentence descriptions per step, explicit
pointers to reference files that still need authoring (`references/<name>.md
— TBD: <what it should cover>`), and the brand-standard `## About` footer
verbatim (see any existing `skills/okhp3-*/SKILL.md` for the exact four
lines).

## What a skeleton is not

A skeleton is not a working skill. It has no scripts, no tests, no evals,
and its reference files are named but not written. It exists so
`skill-creator` (or a human) has a structured starting point instead of a
blank page. Do not mark a skeleton `status: recommended-extension` or
otherwise imply it has been through foundry, equilibrium review, or
validation — those are later pipeline stages this skill does not perform.
