---
name: okhp3-skill-discovery
description: Find, verify, compare, and route to project-local, installed, runtime, or plugin-provided agent skills. Use when the user asks what skills exist, how to invoke one, or when the correct reusable workflow is unclear. Do not use it to install unavailable capabilities without an explicit request.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Evidence-backed discovery and routing across project-local, installed, runtime, and plugin skill sources."
  out_of_scope: "Installing unavailable capabilities, granting permissions, or treating historical inventories as current availability."
---

# okhp3-skill-discovery

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Discovery sources and output

Inspect only sources available in the current environment. If a named index or
skill root is absent, record it as `NOT FOUND` and continue with the other
sources. Return candidates with source, availability, evidence path, fit,
near-miss risk, invocation, prerequisites, and fallback. Do not imply a skill
is callable until the current host confirms it.

1. Read the repository's documented skill index and `.agents/skills/README.md`
   when present. Do not assume a fixed index path.
2. Inspect the current host's available-skills or plugin listing. Treat another
   machine's inventory as historical evidence, not current availability.
3. If needed, search only likely skill roots for `SKILL.md`. Inspect discovery
   metadata before loading full bodies.
4. Classify each candidate as project-local, installed, runtime-provided,
   recommended but unavailable, or unrelated.
5. Read the best candidate's `SKILL.md` completely. Verify dependencies,
   authorization boundaries, and near-miss scope.
6. Return the best match, why it fits, how to invoke it, prerequisites, and a
   fallback when it is unavailable.

Do not load every skill by default. Do not imply that a named skill, plugin,
app, or tool is callable until the current host confirms it. If no skill fits,
proceed under `AGENTS.md` and propose a new skill only after the workflow proves
repeatable.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
