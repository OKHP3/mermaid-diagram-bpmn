# Replit Platform Facts

These are the host-specific facts used by `okhp3-replit-free-mode-autonomy`.
They were checked against Replit documentation on 2026-09-02 and should be
rechecked if the platform UI or routine behavior changes.

## Current source-backed facts

| Topic | Fact | Source |
|---|---|---|
| Free Mode allowance | On Core and Pro plans, the Free Mode allowance resets every five hours and is subject to a weekly limit. The account Usage settings show the current limit and next reset time. | [Get the most out of Free Mode](https://docs.replit.com/chat/free-mode), [Agent Modes](https://docs.replit.com/chat/agent-modes) |
| Routines | Routines are scheduled recurring tasks that run within a Conversation. A failed run is not automatically retried, and a routine waits if another task is already running. | [Routines](https://docs.replit.com/chat/routines) |
| Human approval | Sensitive actions, including publishing, secret changes, and outbound network calls, require explicit human-in-the-loop approval. | [Replit Agent](https://docs.replit.com/features/agent/overview), [Shared responsibility model](https://docs.replit.com/features/security/shared-responsibility-model) |
| Mode escalation | If a request needs more capability than the current mode provides, Agent can pause and offer the user a choice about continuing in Free Mode or escalating for that request. | [Free Agent Mode](https://docs.replit.com/help/free-agent-mode), [Select the right Agent Mode](https://docs.replit.com/chat/agent-modes) |

## Interpretation rules

- These facts describe host behavior; they do not grant permission to change
  quotas, conceal notices, or bypass approval.
- A routine is a retry opportunity, not proof that a usage reset occurred.
- A failed routine run is not evidence that the user's project is broken; read
  the returned conversation result before deciding what to do next.
- Do not put account identifiers, credentials, connection IDs, or secrets in
  this reference or in a checkpoint.