---
name: okhp3-replit-free-mode-autonomy
description: >
  Keep Replit project work autonomous and Free Mode-first with bounded execution,
  checkpointed quota recovery, and quiet upgrade handling. Use when the user asks
  to maximize Free Mode, avoid repeated upgrade nudges, retry after a five-hour
  or weekly limit, preserve work across interruptions, or keep routine work
  moving without unnecessary approval pauses. Does not bypass quotas or human
  approval.
license: MIT
compatibility: >
  Any Agent Skills-compatible client with filesystem access. Replit Routines are
  optional host support for scheduled retry opportunities and are conversation-bound.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  maturity: draftable
  in_scope: "Free Mode-first execution, interruption checkpoints, safe quota retry opportunities, and concise status reporting."
  out_of_scope: "Changing quotas, hiding platform UI, auto-accepting approvals, paid escalation, or unattended cross-project scheduling."
---

# okhp3-replit-free-mode-autonomy

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Use this skill when the user wants to get as much useful, recoverable work as
possible from Replit Free Mode without repeated upgrade suggestions or
unnecessary pauses. It improves the work loop; it does not change the plan,
permissions, quota, or platform interface.

## Scope

| In scope | Out of scope |
|---|---|
| Bounded, dependency-ordered project execution | Changing Free Mode quotas or reset times |
| Checkpointing work interrupted by usage limits | Hiding Replit notices or billing UI |
| One safe retry opportunity after a possible reset | Auto-accepting or intercepting approvals |
| Concise interruption and completion reports | Paid-mode escalation or payment actions |
| A portable copy-paste operating prompt | One global timer that controls every Repl |

## Operating contract

1. **Stay Free Mode-first.** Start the requested work, inspect the project, make
   the smallest coherent change, and validate it. Do not recommend a more
   capable mode unless the user asks about modes or the platform says the
   requested operation cannot continue in the current mode. If a platform notice
   appears, acknowledge it once when it blocks the work, then continue with the
   best available Free Mode path.

2. **Preserve momentum safely.** Work in dependency order. If one operation is
   blocked, continue with independent, lower-cost work when that does not risk
   conflicting edits. Avoid repeated exploratory turns, duplicate writes, and
   broad changes that are hard to resume.

3. **Treat reset timing as unknown.** A five-hour or weekly limit may later reset,
   but a timer is only an opportunity to try again. Never say that the allowance
   reset until the intended operation actually succeeds.

4. **Keep the checkpoint useful.** When work is interrupted, record the completed
   work, the exact blocked operation, changed files or artifacts, validation
   already run, and the next safe action. Prefer the project's existing task,
   handoff, or checkpoint mechanism. Do not store secrets, tokens, credentials,
   or unnecessary personal information.

5. **Respect approval boundaries.** Never fake, intercept, click, or
   automatically accept an approval request. For an external, destructive, paid,
   privileged, secret-related, or outbound-network action, show what would
   happen and stop at the platform's approval boundary. If the host offers an
   “Always allow” setting, the user may select it for a trusted low-risk action;
   the agent must not select it on the user's behalf.

6. **Do not simulate success.** A scheduled retry, checkpoint, or permission
   request is not evidence that the work completed. Verify the actual result and
   report uncertainty plainly.

## Quota-blocked recovery

Use this sequence when the platform reports that the five-hour or weekly Free
Mode allowance has been reached:

1. Stop retrying the same expensive operation in the current run.
2. Check whether the operation might already have succeeded before attempting
   anything again. Prefer an idempotent verification or read-only check.
3. Write the checkpoint before ending the run.
4. Tell the user the work is checkpointed and that Replit controls the actual
   reset. Do not invent a reset time.
5. If the user wants unattended recovery and the host supports a routine,
   schedule a routine no more frequently than every six hours. Keep the routine
   inside the conversation that owns the work; do not imply it is a global
   scheduler for other Repls.
6. On one routine run, read the checkpoint, attempt the exact blocked operation
   at most once if it is safe and has not already succeeded, verify the outcome,
   update the checkpoint, and stop. If the limit remains active, leave the
   checkpoint intact and do not loop.
7. If the retry reaches an approval card, stop and report that human approval is
   required. Do not schedule another attempt merely to bypass that boundary.

Use this routine message when appropriate:

> Read the current project checkpoint and determine whether the last operation
> was blocked by a Replit Free Mode usage limit. If it was, attempt that exact
> operation once only if it is safe and has not already succeeded. Verify the
> result, update the checkpoint, and report a concise outcome. If the limit is
> still active, do not retry again in this run. Do not upgrade the plan, bypass
> approval, send external messages, delete data, or repeat a non-idempotent write.

If the host does not support routines, provide the same message as a
copy-paste prompt for a later session. Do not claim that a background timer was
created.

## Cross-project installation

This package is designed for distribution from the Replit family. To activate
it in another project, copy the package directory into:

```text
.agents/skills/okhp3-replit-free-mode-autonomy/
```

If the target project does not load local skills, use the prompt in
`references/free-mode-autonomy-prompt.md` once at the beginning of the
conversation. A prompt is project- and conversation-scoped; it is not a global
policy across all Repls.

## Output contract

At every interruption, return exactly this compact structure:

```text
Status: <completed | checkpointed | waiting for approval | quota blocked>
Completed: <files, artifacts, or validations finished>
Next retry: <one safe operation, or none>
User action: <only if approval, missing input, or a platform limitation genuinely requires it>
```

For ordinary progress, state the current bounded unit, what was verified, and
the next unit. Do not bury an approval requirement or a quota limitation in a
long status report.

## Host facts and change policy

Read `references/platform-facts.md` when the task depends on current Replit
behavior. These facts are source-backed but host-controlled and may change.
Prefer the platform's current UI and documentation over an old copy of this
skill. When a host behavior changes, update the reference and the affected
instructions together; do not weaken the approval boundary to preserve an old
workflow.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.