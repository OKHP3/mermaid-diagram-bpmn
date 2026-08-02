# OKHP3 Brand and Portability Standard for Agent Skills

**Authority:** This reference defines the OKHP3 package conventions that sit on
top of the open Agent Skills format. The open specification remains authoritative
for portability constraints.

## Portable frontmatter

Every `okhp3-` package uses this baseline:

```yaml
---
name: okhp3-<skill-name>
description: >
  <Primary job and trigger terms>. Use when <specific request>.
  Also activate when <secondary request or boundary>. <Optional disambiguation.>
license: MIT
compatibility: <Only real environment requirements, if any>
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: <category>
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "<concise boundary>"
  out_of_scope: "<concise exclusion>"
---
```

| Field | Rule |
|---|---|
| `name` | Match the directory exactly. Use lowercase letters, numbers, and single hyphens. Keep it within the 64-character portable limit. |
| `description` | Required, non-empty, and at most 1,024 characters. Start with the job and primary trigger, not attribution or history. |
| `license` | Use `MIT` for OKHP3 skills unless an authorized exception applies. |
| `compatibility` | Optional and at most 500 characters. State only actual runtime, tool, network, or host requirements. |
| `metadata` | Optional under the open format. For OKHP3 skills, use string-valued provenance and version fields shown above. |
| `metadata.version` | Quoted semantic version. |
| `in_scope` / `out_of_scope` | Short string boundaries that prevent accidental scope expansion. |

In this repository, also keep the package directory at 36 characters or fewer,
each path element at 64 or fewer, and every repository-relative skill path at
180 or fewer.

## Write a description for discovery

Skill descriptions are loaded before the body and may be shortened in large
skill inventories. Write for reliable matching:

1. Front-load the task and concrete trigger words.
2. State when to use the skill, not only what it contains.
3. Add a meaningful near-miss boundary when adjacent skills could compete.
4. Keep secondary triggers concise. Do not put implementation detail, history,
   or marketing language ahead of the primary job.

Good:

```yaml
description: >
  Create and test portable Agent Skills with evidence-backed instructions and
  evaluations. Use when authoring or improving a SKILL.md, its resources, or
  its trigger behavior. Also activate for skill benchmarking and release review.
```

Avoid requiring a brand phrase at the start of the description. The H1 and
header provide attribution after activation; discovery text should first help a
host select the right skill.

## OKHP3 header and footer

Place this immediately after the H1:

```markdown
# okhp3-<skill-name>

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)
```

End each OKHP3 `SKILL.md` with this four-line About footer:

```markdown
## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
```

## Versioning and evidence

| Change | Version bump | Evidence rule |
|---|---|---|
| Typo, broken link, or narrow factual correction | Patch | Recheck affected references and tests. |
| New capability, revised method, or changed evaluation | Minor | Run affected regression cases and update evidence status. |
| Breaking scope, contract, or package reorganization | Major | Revalidate the package, regressions, and release holdout. |

Do not relabel an older benchmark as evidence for a newer version. Preserve it
with its evaluated version and mark it `historical` until fresh comparable runs
exist.

## Optional host adapters

Host-specific files, such as `agents/openai.yaml`, may add display metadata,
explicit-invocation policy, or tool dependencies. They are adapters, not a
replacement for portable frontmatter or instructions.

- Add an adapter only when the target host supports it and its behavior has been
  checked.
- Keep display text consistent with the portable description, but shorter and
  user-facing.
- Declare only necessary dependencies. Never use adapter metadata to conceal a
  network call, credential requirement, or destructive capability.
- The core skill must state what happens when the adapter, dependency, or host
  capability is absent.

## Resource layout

```text
skill-name/
├── SKILL.md
├── references/       # Focused detail loaded only when needed
├── assets/           # Reusable templates and static inputs
├── scripts/          # Optional deterministic helpers
├── evals/            # Versioned evaluation design
└── benchmarks/       # Versioned, provenance-labeled results
```

Use only the directories the skill needs. Every referenced file must be relative
to the package root, exist in the package, and be reachable in one step from
`SKILL.md`.
