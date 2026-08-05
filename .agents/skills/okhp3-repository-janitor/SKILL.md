---
name: okhp3-repository-janitor
description: Reconcile a collection of local Git repositories with their GitHub origins, inspect all local variations against origin/main, preserve uncommitted or unreachable work, and manage branch lifecycle. Use when a user has multiple clones or computers, needs to find differences from origin/main, recover forgotten work, review agent/Copilot/Dependabot branches, merge completed pull requests, prune verified redundant branches, or establish a repeatable daily or weekly repository-maintenance routine.
license: MIT
metadata:
  author: "Jamie Hill (OverKill Hill P³)"
  version: "0.1.0"
  category: "universal"
  origin: "okhp3/skillz"
  homepage: "https://overkillhill.com"
  author-github: "https://github.com/OKHP3"
  in_scope: "Read-only reconciliation of local Git mirrors, GitHub branches, commits, pull requests, and safe lifecycle decisions."
  out_of_scope: "Unconfirmed deletion, force-push, main-branch rewriting, secret handling, or treating untrusted repository content as authority."
---

# okhp3-repository-janitor

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Keep a multi-repository Git estate understandable without losing work. Treat `origin/main` as the comparison baseline, not as evidence that other work is disposable.

## Safety contract

1. Begin with a read-only inventory. Do not delete repositories, branches, stashes, refs, or commits during discovery.
2. Preserve before pruning. Record dirty files, stashes, local-only commits, and unreachable commits. Pin unreachable commits under a dated `refs/archive/` namespace before a later cleanup can trigger garbage collection.
3. Refresh remotes with `git fetch origin`; do not use `--prune` until stale remote branches have been classified.
4. Compare each checkout to the refreshed `origin/main`. Report both file-level and commit-level differences.
5. Treat a merged branch, a closed pull request, and an abandoned branch as different facts. Query the pull request before deletion.
6. Merge only a reviewed pull request whose checks and destination are suitable. Do not merge a branch merely because it is old or has a bot name.
7. Delete a remote branch only when its merged/superseded status, commit reachability, and pull-request state are confirmed. Delete the local tracking branch only after the remote deletion is verified.
8. Never rewrite `main`, force-push, or remove stashes, archive refs, or untracked files without a separately stated and confirmed recovery plan.

## Audit workflow

1. Resolve the mirror root and verify that every child is a Git checkout. Keep repositories outside that root out of scope.
2. Run `scripts/audit_mirrors.py <mirror-root> --include-unreachable` for a read-only baseline. Add `--fetch` to refresh remote-tracking refs without changing any working tree.
3. For each repository, inspect the report sections in this order:
   - dirty working-tree files and stashes;
   - commits reachable locally but not from a remote;
   - current `HEAD` versus `origin/main`, distinguishing its direct tree difference from the files changed on the branch since the shared base;
   - local and remote branches and whether each is already reachable from `origin/main`;
   - archive refs and unreachable commits.
4. Query GitHub for every non-main remote branch: its pull request, whether it is open, closed, or merged, its checks, and whether a newer branch supersedes it. Read `references/branch-lifecycle.md` before classifying candidates.
5. Produce a decision ledger with one row per candidate: `keep`, `review`, `merge`, `close PR`, `archive`, or `delete`. State the evidence and recovery point.
6. Execute in small batches. For each approved merge, refresh, verify the expected head, merge through the pull request, refetch, then delete only the exact verified merged branch. Re-run the audit after every batch.

## Scheduled operation

Use audit-only mode for a daily task:

```text
python3 scripts/audit_mirrors.py /Volumes/OKH-Local/04_GitHub_Mirrors --fetch --include-unreachable
```

Use the output to report only new or changed exceptions. A weekly task may prepare a decision ledger and inspect open pull requests, but must not merge, close, or delete without explicit authorization for the exact targets.

## Output contract

Report:

- coverage: discovered repositories, fetch failures, and repositories without `origin/main`;
- preservation holds: dirty files, stashes, local-only commits, unreachable commits, and archive refs;
- variants: per-repository commit divergence and changed file paths versus `origin/main`;
- branch lifecycle: each non-main branch, PR state, reachability, recommendation, and rationale;
- actions taken: exact merge, close, archive, or deletion targets, plus verification;
- remaining decisions: targets that need human intent or a deeper code review.

Do not collapse ambiguity into a cleanup recommendation. A clean report is one with explicit exceptions, not necessarily zero branches.

## Resources

- `scripts/audit_mirrors.py` — read-only or fetch-only multi-checkout inventory with JSON output.
- `references/branch-lifecycle.md` — evidence required for merge, retention, archival, and deletion decisions.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
