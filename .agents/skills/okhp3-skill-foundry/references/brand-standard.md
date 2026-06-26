# OKHP3 Brand Standard for Agent Skills

**Authority:** This document is the canonical OKHP3 brand specification for Agent Skills.
All skills bearing the `okhp3-` prefix must conform to this standard.

---

## YAML frontmatter block

Every OKHP3 skill requires a complete YAML block at the top of SKILL.md:

```yaml
---
name: okhp3-<skill-name>
description: >
  OverKill Hill P³ <short noun phrase -- what the skill does>.
  <Primary trigger sentence: "Use when...">
  <Secondary triggers: "Also activate when...">
  <Disambiguation if needed: "This is the authoritative... -- use it even when...">
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: <category>
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---
```

### Required fields

| Field | Rule |
|-------|------|
| `name` | Must match the directory name exactly. `okhp3-<slug>`. |
| `description` | Triggering text. See "Writing the description" below. |
| `license` | `MIT` for all OKHP3 skills. |
| `metadata.author` | `Jamie Hill (OverKill Hill P³)` -- exact string. |
| `metadata.version` | Quoted string. Semver. Start at `"1.0.0"`. |
| `metadata.category` | One of: `interfaith-reference`, `wellness-astrology`, `meta-tooling`, `universal`, `developer-tooling`. Add new categories as needed. |
| `metadata.origin` | `okhp3/skillz` -- always. |
| `metadata.homepage` | `https://overkillhill.com` -- always. |
| `metadata.author-github` | `https://github.com/OKHP3` -- always. |

### Optional fields (add when applicable)

```yaml
metadata:
  ...
  in_scope:
    - <explicit capability>
    - <explicit capability>
  out_of_scope:
    - <explicit exclusion>
    - <explicit exclusion>
```

The in_scope / out_of_scope pair prevents scope creep and is the first place an agent looks when it is unsure whether a request is within the skill's remit.

---

## Writing the description

The description field is the primary triggering mechanism. It is always in context. It must:

1. Open with `OverKill Hill P³ <skill noun phrase>` so the brand is visible in the skills list.
2. Include at least one "Use when..." sentence with specific trigger phrases.
3. Include at least one "Also activate when..." sentence for secondary triggers.
4. End with a disambiguation sentence if the skill competes with another for the same trigger territory.

**Length:** 4-8 sentences. The `>` block scalar removes newlines -- write it as flowing text.

**Tone:** Assertive. The description should cause the agent to load the skill slightly earlier rather than slightly later. Err toward triggering.

**DO NOT** include implementation details in the description. Those go in the body.

---

## Header line

Immediately after the H1 heading, before any other content:

```markdown
# okhp3-<skill-name>

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)
```

This must be a single line with the two middle dots (·) as separators. No line breaks within the line.

---

## Version naming convention

| Change type | Version bump | Example |
|-------------|-------------|---------|
| Bug fix / content correction | Patch | 1.0.0 -> 1.0.1 |
| New section / structural change | Minor | 1.0.0 -> 1.1.0 |
| Breaking reorganization / scope change | Major | 1.0.0 -> 2.0.0 |

Brand attribution applied to an existing 1.0.0 skill: bump to 1.1.0 (structural change).
Eval-driven content fix applied: bump patch (1.1.0 -> 1.1.1).
Fix causes structural reorganization: bump minor (1.1.0 -> 1.2.0).

---

## About footer

The last section of every OKHP3 SKILL.md:

```markdown
## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
```

Exact text. Three lines. No variation.

---

## Full SKILL.md skeleton

```markdown
---
name: okhp3-<slug>
description: >
  OverKill Hill P³ <noun phrase>. Use when <primary trigger>.
  Also activate when <secondary trigger>. This is the authoritative
  <noun phrase> -- use it even when the user does not mention it by name.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: <category>
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-<slug>

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

<Elevator pitch: 2-3 sentences. What does this skill do and why does it exist?>

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| <item> | <item> |

---

## <Main content sections>

...

---

## References

- `references/<file>.md` -- <one-line description>

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
```
