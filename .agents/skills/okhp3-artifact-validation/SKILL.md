---
name: okhp3-artifact-validation
description: Validate a project change, draft, research packet, skill, promotion package, or handoff before it is treated as complete. Use after meaningful work and before handoff, graduation, publication review, or reliance on an artifact. Run the identified project validator when one exists, then add judgment checks the script cannot prove.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: knowledge-operations
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only mechanical and judgment validation of a named artifact before handoff or reliance."
  out_of_scope: "Inventing a validator, making an artifact complete by assumption, publication, or destructive repair."
---

# okhp3-artifact-validation

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Output contract

Return the artifact path and scope, checks run, status for each check, evidence,
blockers, warnings, checks not run, and the next action. A missing validator is
`NOT RUN` or `BLOCKED`, never `PASS`. Keep validation read-only unless a
separate repair request authorizes a specific change.

Choose checks proportionate to the artifact and consequence.

## Mechanical floor

For project-wide or structural work, first identify the project-declared
validator and confirm that it exists. Run it from the project root or the
location its own instructions require. Do not assume a particular filename,
operating system command, or repository layout.

For a skill, also run the host's available skill validator when one is
available and confirm its
description matches its actual trigger boundary. For code or generated files,
run the targeted parser, test, linter, build, or render check appropriate to
that format.

## Judgment checks

Confirm:

- the real path and changed scope;
- unrelated owner work remains intact;
- factual claims and citations are supportable;
- evidence tiers are visible where they affect future decisions;
- no secret, confidential, employer, client, or accidental generated material
  entered scope;
- links, names, metadata, and referenced resources exist;
- the artifact satisfies the current request rather than only its format;
- remaining uncertainty and the next action are explicit.

Report each meaningful check as `PASS`, `FAIL`, `WARN`, `BLOCKED`, or
`NOT RUN`. Never convert an unavailable check into a pass. A script pass is a
mechanical floor, not a quality or publication verdict.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
