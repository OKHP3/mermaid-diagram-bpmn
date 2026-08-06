---
name: okhp3-graduation-gate
description: Decide whether an active exploratory effort is ready to become formal, should remain active, should archive, or is blocked. Use when an effort feels ready, the owner asks for a go or no-go, or a promotion package needs a readiness decision. Score evidence rather than enthusiasm and do not create the destination.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: knowledge-operations
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Evidence-based readiness decision for an exploratory effort before formalization or archival."
  out_of_scope: "Creating the destination, publishing, external movement, or substituting a score for owner authority."
---

# okhp3-graduation-gate

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Inputs and output

Require a named effort, evidence inventory, current artifact paths, owner or
decision authority, and the validation result. Return the criterion table,
evidence for every score, missing checks, verdict, confidence, and next action.

Run `okhp3-artifact-validation` first. Score each criterion from 0 to 2 and
show the table.

| Criterion | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Bounded | Scope keeps expanding | Boundary partly clear | Scope and non-goals written |
| Demonstrable | Idea only | Partial artifact | Useful result works end to end |
| Reusable | One instance only | Reusable with rework | Reusable by intended audience |
| Owned | No next action | Vague plan | Next three actions are concrete |
| Clean | Prohibited boundary fails | Scrub uncertain | Personal/work and secret checks pass |
| Distinct | Existing asset solves it | Overlap unresolved | Fills a documented gap |

Verdicts:

- **GO:** 10 to 12 with no zero. Prepare a promotion package.
- **HOLD:** 7 to 9. Name the lowest criterion as the next action.
- **ARCHIVE:** 0 to 6. Preserve provenance and a revival condition.
- **BLOCKED:** any zero on Clean, regardless of total.

If evidence is missing, score the criterion from what is known and state the
unknown. Do not award points for confident prose. A GO does not authorize a
repository, publication, push, external move, or message. The owner decides
graduation and destination.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
