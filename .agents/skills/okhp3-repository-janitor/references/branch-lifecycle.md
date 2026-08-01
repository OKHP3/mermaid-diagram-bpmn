# Branch lifecycle rules

Use these categories after refreshing the remote and checking GitHub pull-request state.

| Evidence | Decision | Action |
|---|---|---|
| Dirty checkout, stash, local-only commit, or unreachable commit | Preserve | Do not merge or prune; create or retain a recovery ref and review the content. |
| Branch is not reachable from `origin/main` and has an open PR | Review | Keep the branch and PR. Merge only after its purpose, checks, and target are reviewed. |
| Branch is reachable from `origin/main` and its PR is merged | Prune candidate | Verify it is not a deployment branch, then delete the remote branch and local counterpart in the same recorded batch. |
| Branch has a closed, unmerged PR and a newer open/merged branch supersedes the same work | Archive then prune candidate | Preserve a dated local archive ref if needed, document the superseding PR, then remove only after confirmation. |
| Branch has a closed, unmerged PR without a clear successor | Keep for decision | Compare files and commits to `origin/main`; ask whether to revive, archive, or delete. |
| Dependabot branch with an open PR | Review as dependency work | Keep it until the update is merged, closed, or superseded. Never delete solely because it is bot-created. |
| `gh-pages`, deployment, release, or explicitly protected branch | Retain | Do not apply ordinary feature-branch cleanup rules. |

Before any deletion, record the full branch name, its tip SHA, PR number/state, reachability result, and recovery ref. Refresh after the merge or deletion and verify the expected remote state.
