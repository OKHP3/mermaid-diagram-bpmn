# Example: SKILL.md skeleton (ready case)

Produced when a pattern has stabilized enough to write down — see
`../references/skeleton-conventions.md`.

```markdown
---
name: okhp3-cross-session-reconciliation
description: >
  Reconcile two AI sessions' uncommitted edits to the same working tree
  before reporting state to the user. Use when git status shows untracked
  or modified files whose mtimes fall inside this session's own active
  window but that this session did not write, or when a review/verification
  doc appears that this session did not create. Do not use for a single
  session's own multi-turn edits, or for merge conflicts already surfaced
  by git itself.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: meta-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Detecting concurrent uncommitted edits, verifying claimed results independently, reporting findings transparently."
  out_of_scope: "Resolving the conflict unilaterally, git operations that discard either session's work."
  produces: "reconciliation report (verified vs. claimed state)"
---

# okhp3-cross-session-reconciliation

Independently verifies what another process claims to have done to a
shared working tree before passing that claim on to the user.

## Process

1. **Detect.** [TBD — author from the two observed occurrences: git status/mtime signal, review-doc signal]
2. **Verify independently.** [TBD — reference: references/verification-checklist.md — not yet authored]
3. **Report.** [TBD — decision-memo format, cite verified numbers not claimed ones]

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
```

This is a skeleton, not a finished skill: two `[TBD]` steps, one unauthored
reference file named but not written, `version: "0.1.0"`, no `status` field
claiming any review stage. Handoff target: `skill-creator`, per
`../SKILL.md`'s Handoff section.
