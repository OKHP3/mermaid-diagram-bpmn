---
name: okhp3-project-promotion
description: Prepare an exploratory effort that cleared the graduation gate for owner-approved formalization. Use to assemble the destination brief, provenance, decisions, risks, artifact inventory, and first formal-project action. Do not create repositories, publish, push, or move work externally without separate authorization.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: knowledge-operations
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Owner-approved formalization package for an effort that passed a documented readiness gate."
  out_of_scope: "Creating repositories, publishing, pushing, external moves, or deciding graduation without authority."
---

# okhp3-project-promotion

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Inputs and output

Require the cleared gate result, effort root, artifact inventory, provenance,
decision log, and proposed destination. Return a draft promotion packet with
scope, non-goals, evidence, risks, unresolved owner choices, destination
tradeoffs, first action, and validation status.

Use this skill after a GO from `okhp3-graduation-gate`, or to assemble the
draft package needed for the owner's final decision.

Prepare:

- problem or opportunity;
- desired outcome and success signal;
- scope and explicit non-goals;
- evidence and source trail;
- decisions and rationale;
- assumptions, risks, and unresolved owner choices;
- recommended formal destination and tradeoffs;
- first three actions, with the first one immediately executable;
- inventory of reusable artifacts and relative paths;
- scrub and validation results.

Before owner approval, keep the draft with the active effort. After approval,
assemble a transit package under the owner-approved graduated root. Once the
formal destination owns the content, leave a stub with destination, date,
provenance pointer, and next follow-up.

Run `okhp3-artifact-validation` before calling the package ready. Stop at the
owner decision unless the same current request separately authorizes creation,
publication, external movement, or communication.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
