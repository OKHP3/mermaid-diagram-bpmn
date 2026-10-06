---
name: Origin-only Git fetches
description: Safe Git synchronization when ephemeral Replit subrepl remotes have unknown SSH host keys
---

When synchronizing the primary repository, refresh `origin` directly instead of fetching every configured remote unless the ephemeral SSH hosts are already trusted and explicitly in scope.

**Why:** This workspace contains many `subrepl-*` remotes. A broad `git fetch --all` can stop for an interactive SSH host-key confirmation, leaving the intended GitHub synchronization incomplete. Automatically accepting an unknown host key would weaken the repository's trust boundary. Task-result merges can also fast-forward both the local default branch and its remote-tracking ref while a session is active, so divergence observed earlier may already be resolved.

**How to apply:** Use the configured HTTPS `origin` for pull/fetch/push. Treat `subrepl-*` fetch failures as an audit limitation, not as permission to accept a new host key. Immediately before branching or merging, recheck the current branch, `HEAD`, base ref, and `git rev-list --left-right --count HEAD...origin/main`; if the count is `0 0`, no integration is needed. Inspect local branch refs separately and preserve unique commits before pruning. Recheck current refs after merge and stop if state changes.
