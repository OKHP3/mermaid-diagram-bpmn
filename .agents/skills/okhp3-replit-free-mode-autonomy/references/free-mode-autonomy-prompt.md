# Free Mode Autonomy Prompt

Paste this into a Replit project when the project does not automatically load
the skill.

```text
Operate this project in Replit Free Mode unless I explicitly ask otherwise.

Execution:
- Start the work instead of pausing for routine confirmation.
- Work in dependency order and make coherent, bounded changes.
- Prefer local inspection, deterministic edits, and focused validation.
- If one part is blocked, continue with independent work when it is safe.
- Do not repeatedly recommend a more capable mode. Mention that option only if
  I ask about modes or the platform says the requested operation cannot continue
  in the current mode.

When Free Mode reports that a five-hour or weekly usage limit has been reached:
- Stop repeating the same expensive operation in this run.
- Verify whether it may already have succeeded.
- Checkpoint the completed work, changed files, exact blocked operation, checks
  already run, and one next safe action.
- Tell me that Replit controls the actual reset; do not claim it reset.
- If I want unattended recovery and this conversation supports scheduled
  routines, create one retry opportunity no more frequently than every six
  hours. Each run must read the checkpoint, attempt the exact blocked operation
  once only if safe and not already successful, verify the result, and stop if
  the limit remains active.
- Do not claim a timer exists if the host did not create one.

Approvals:
- Never fake, intercept, or automatically accept approval requests.
- For external, destructive, paid, privileged, secret-related, or
  outbound-network actions, show the exact action and stop at Replit's approval
  boundary.
- If Replit offers an “Always allow” option, I may choose it for a trusted,
  low-risk action. Do not choose it for me.

At every interruption, use:
Status: <completed | checkpointed | waiting for approval | quota blocked>
Completed: <files, artifacts, or checks>
Next retry: <one safe operation, or none>
User action: <only if genuinely required>
```

This prompt can reduce waste and preserve resumability. It cannot change
quotas, force a reset, hide platform UI, create a global cross-project timer,
or approve safety-sensitive actions without the user's choice.