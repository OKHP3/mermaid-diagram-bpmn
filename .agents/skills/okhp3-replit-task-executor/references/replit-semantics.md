# Replit semantics and source ledger

Reviewed 2026-09-19. These are vendor-controlled behaviors. Recheck the current
official page and visible control before a consequential action. The workflow's
ownership and evidence rules are package policy, not Replit features.

| Source | Finding that changes the workflow |
|---|---|
| [Task board](https://docs.replit.com/features/agent/task-board) | Drafts contain plans. Start initiates Replit execution. Ready work has not yet entered the main version. Review its diff, logs, tests, and preview before applying. Documentation lists per-task auto-approve and auto-apply actions, not an external-agent assignment control. |
| [Task lifecycle](https://docs.replit.com/features/agent/task-lifecycle) | Queued work starts when prerequisites and capacity permit. Applying integrates isolated work. Done groups applied, archived, and canceled tasks. Archive preserves an unstarted planning session; cancellation of building-stage tasks discards work and cannot be restored. |
| [Plan mode](https://docs.replit.com/features/agent/plan-mode) | Planning avoids code/data implementation until approval. Build here and Build in background begin execution. Planning, questions, and task generation still consume billable Agent work. |
| [replit.md](https://docs.replit.com/features/project-setup/replit-dot-md) | Root `replit.md` supplies Agent context and project preferences. It is not documented as a Task Board status database. Manual changes inform future conversations. |
| [Agent customization](https://docs.replit.com/features/agent/agent-customization) | Project context and workspace-wide instructions have different scopes. Instructions guide Agent behavior; they do not guarantee strict enforcement or stop existing queued work. |
| [Shell](https://docs.replit.com/features/workspace-tools/shell) | Ordinary terminal access supports files, scripts, and Git. The reviewed documentation did not establish an external task-completion command. |
| [Follow-up tasks](https://docs.replit.com/features/agent/follow-up-tasks) | Applied tasks can generate new suggestions. View plan inspects; Start dispatches. Bulk selection can start or cancel many tasks. The suggested-next-tasks dialog has dismissal behavior that can cancel suggestions, so do not assume every Close is harmless. |
| [Replit MCP server](https://docs.replit.com/platforms/mcp-server) | The documented tools find, inspect, create, update, and publish apps. The tool list reviewed does not document board claims, external assignees, or marking an externally completed task Done. Discover available capabilities each session rather than guessing endpoints. |
| [Replit in ChatGPT](https://docs.replit.com/features/platforms/chatgpt) | Work delegated through this integration is billed to Replit Agent usage. An external chat surface does not by itself move implementation out of Replit. |
| [Replit in Claude](https://docs.replit.com/features/platforms/claude) | The connector delegates app work to Replit. This is a different route from Claude Code implementing a repository change with its own tools. |
| [Using the Git pane](https://docs.replit.com/features/workspace-tools/git-interface) | Replit provides visual Git operations. Inspect actual repository state and hosted checks as separate evidence when coordinating another checkout. |
| [Version control](https://docs.replit.com/replit-workspace/workspace-features/version-control) | Git CLI and the Git pane access the underlying repository; Git commits support external collaboration. Checkpoints also include development context beyond ordinary Git history. |
| [Checkpoints and rollbacks](https://docs.replit.com/features/version-control/checkpoints-and-rollbacks) | Rollback can restore project/context state and optionally development database state. Production database recovery is separate. Do not use rollback as a substitute for Git reconciliation. |
| [Publishing](https://docs.replit.com/features/publishing/overview) | Publishing has its own access, hosting, configuration, database, and security choices. Inspect the actual target and configuration before authorizing it. |
| [After you publish](https://docs.replit.com/features/publishing/after-you-publish) | Publishing includes every artifact in the project. Review that complete scope before publishing; approval for one selected task is insufficient for unrelated artifacts. Verify the release and live outcome independently of task or preview state. |

## Observed interface differences

A live task-board inspection on the review date exposed View parent task,
Rename, and Cancel on a suggested draft. An Active card exposed Rename,
Review changes, and Cancel. The observed menus did not expose every option
listed by the current documentation. This is a sampled interface observation,
not a promise about all accounts or plans. Do not treat the word Cancel on a
draft as proof of reversible Archive behavior.

These observations came from the author's authenticated inspection. Raw board
captures are not distributed because they may contain private project context;
the independent source review did not reproduce the UI inspection.

The reviewed ChatGPT integration page also contains conflicting app-access limits
that differ from the currently exposed discovery/update tool contracts.
Use the runtime's declared schema and verified result for capability claims;
do not copy conflicting limits into a permanent host guarantee.

## Capability and cost boundary

Browser reading and ordinary repository tools can support an external
executor. Replit natural-language Agent prompts run a different executor.
No supported external-task completion or claim API was established in this
review. That absence is an evidence limit, not proof no such API can exist.
When a host lacks a non-executing board write, use the agreed receipt and an
explicit pending board disposition. A bounded Replit administrative return may
be assessed under `references/completion-return.md`; existing authorization must
cover its actual effects and usage. This does not authorize a coding prompt,
hidden API, additional purchase, or automatic task cancellation.

Do not hardcode a subscription tier, concurrency limit, reset interval, or
price. Record the live account notice when it blocks a task. A displayed Free
label is not evidence that all planning or connector activity costs nothing.

## Post-creation observations, September 19, 2026

Authority: authenticated owner-session observations, summarized without private
plans, task links, transcripts, or machine paths. These observations informed
the method; they are not public API documentation or current-version benchmarks.

- Root `replit.md` stayed byte-identical across sampled native completions.
  Completed task history exposed `markTaskComplete(...)`; an internal transcript
  also recorded `mark_task_complete`. No supported external invocation was
  established. Git task/merge trailers supplied provenance, not board control.
- The inspected Shell CLI exposed no task-completion command. `.replit`
  workflow tasks were run commands. Internal state files were inspected
  read-only; no supported editable status ledger was established.
- The v0.1.0 live exercise preserved a finite backlog and recovered completed
  but unpublished source. It did not move unfinished work through an external
  implementation and native completion cycle. Retain this as historical partial
  evidence, not proof of v1.2.0 completion, cost savings, or cross-host behavior.

Accepted implication: supply a verified receipt and investigate a supported
bounded return. Rejected implication: changing a file, forging provenance,
cancellation, or a Git merge can stand in for native completion. Capability
availability and the exact backend storage remain unknown beyond the inspected
surfaces. Recheck when the UI, tools, documentation, or account state changes.
