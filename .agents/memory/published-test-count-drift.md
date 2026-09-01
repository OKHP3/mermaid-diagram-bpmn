---
name: Published test-count drift
description: How concurrent merges can invalidate an otherwise verified published test total
---

When updating a published test total, validate the evidence against the current
branch tip rather than assuming a task snapshot's verified result still matches
the live suite. Concurrent merges can add tests or change the exercised
surface after the evidence was collected.

**Why:** The count checker runs the current Vitest suite, so it can correctly
reject an older verified total even when the requested documentation change is
accurate for the earlier result.

**How to apply:** Record the requested historical/current claim only when it is
supported by the intended release evidence, and keep any current-suite
regression or drift as a separate follow-up instead of silently changing
unrelated behavior.