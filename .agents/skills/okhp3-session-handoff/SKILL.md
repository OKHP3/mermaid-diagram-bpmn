---
name: okhp3-session-handoff
description: Create a durable continuation record when work pauses, becomes blocked, crosses a machine, or crosses an agent host. Use after substantial work or when the owner asks for a handoff. Record changed files, reasoning, evidence tiers, validation, limitations, and the exact next action without relying on chat memory.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: context-extraction
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Portable continuation records for work that crosses sessions, machines, or agent hosts."
  out_of_scope: "Account access, claims that another copy applied the handoff, publication, or replacing source preservation."
---

# okhp3-session-handoff

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Inputs and output

Require a project root, handoff destination, objective, and current work
inventory. Return the handoff path, source boundary, status, next action,
evidence ledger, checks, limitations, and owner decisions. If the destination
is not identified, return `BLOCKED` rather than guessing.

Run `okhp3-artifact-validation` first when practical. Write a dated Markdown
record under the user-approved handoff destination, using a collision-safe
filename, containing:

- source host and date;
- objective and current status;
- changed files or artifact inventory;
- why non-obvious decisions were made;
- confirmed, inferred, proposed, and unknown conclusions where relevant;
- checks run, real results, and checks not run;
- known defects, limitations, and owner decisions needed;
- exact next action and the files needed to resume.

Keep paths relative. Do not claim that another copy has received or applied the
handoff unless that destination was directly inspected.

When new evidence changes an existing handoff, add a dated addendum if the same
handoff remains the natural continuity record. Preserve the earlier conclusion
and explain why it changed. Do not rewrite history to make the record look
consistently correct.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
