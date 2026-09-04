---
name: okhp3-replit-github-sync
description: >
  Recover and maintain safe GitHub synchronization for a Replit project. Use
  when Replit reports PUSH_REJECTED, cannot commit through its UI, or a project
  needs to pull, commit, reconcile, merge, or push changes to its GitHub
  default branch. Also activate for "Replit GitHub out of sync", "push rejected",
  "sync Replit to origin/main", or a safe branch-to-main squash merge. Do not
  use to force-push, discard unreviewed work, or bypass branch protection.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  maturity: draftable
  in_scope: "One Replit checkout's GitHub sync diagnosis, safe pull/commit/push recovery, branch handoff, and approved PR merge verification."
  out_of_scope: "Force-pushes, secret handling, automatic conflict resolution, deletion, bypassing protections, or unrelated repository cleanup."
---

# okhp3-replit-github-sync

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Replit's Git UI can be a useful surface, but it is not the source of truth when
the workspace and GitHub disagree. This skill establishes the actual Git state,
preserves local work, and uses an explicit integration path instead of retrying
a rejected push until it happens to work.

It requires a Git checkout with an `origin` remote. A connected GitHub
capability is optional for hosted compare, pull-request, and merge actions;
local Git remains authoritative for the Replit working tree.

## Scope

| In scope | Out of scope |
|---|---|
| Diagnose one Replit checkout against `origin` | Multi-clone maintenance or branch cleanup |
| Commit reviewed local work, pull, and normally push | Force-push, history rewriting, or deleting refs |
| Prepare a branch PR and an approved squash merge | Bypassing required review or status checks |
| Verify GitHub and local branch alignment after sync | Solving merge conflicts without owner input |

## Operating contract

1. Treat the Replit UI error as a symptom, not a diagnosis. Record the
   repository root, current branch, remotes, current status, and the default
   base ref before changing anything:

   ```bash
   git status --short --branch
   git remote -v
   git symbolic-ref --quiet --short refs/remotes/origin/HEAD || true
   git log --oneline --decorate -8
   ```

   Default to `origin/main` only when that is the verified default branch; do
   not silently substitute `main` for a repository with another default.

2. Inspect local changes before staging. Check for merge/rebase state,
   conflict markers, credentials, `.env` files, or generated output that is not
   clearly meant to be committed. Run `git diff --check` and show the intended
   commit scope. If the user has not authorized a commit, produce the review
   and proposed commit message, then stop.

3. Fetch without pruning, then measure the relationship explicitly:

   ```bash
   git fetch origin
   git rev-list --left-right --count HEAD...<base-ref>
   git log --oneline --left-right HEAD...<base-ref>
   ```

   The left count is local-only commits; the right count is remote-only
   commits. A `PUSH_REJECTED` normally means the right side is non-zero. Do not
   retry `git push`, use `--force`, or discard local files to make the error
   disappear.

4. Choose the least-risk path from the actual state:

   | State | Safe action |
   |---|---|
   | Working tree clean; behind only | `git pull --ff-only origin <base>` and verify. |
   | Local changes only; no remote-only commits | Review, stage only the approved paths, commit, then `git push origin <branch>`. |
   | Local and remote have both advanced on the default branch | Stop for an explicit integration decision. Prefer moving the local work to a feature branch and using a PR; never force-push shared history. |
   | Feature branch needs current base | Fetch, then merge the base into the feature branch for a normal push, or rebase only with explicit authorization and a `--force-with-lease` plan. |
   | Conflicts, detached HEAD, missing remote, or protection failure | Do not guess a resolution. Report the exact state and smallest next action. |

   Do not use a bare `git pull` because its merge/rebase behavior is host
   configuration-dependent. Use `--ff-only` for a pure update and an explicit
   merge or rebase decision for divergence.

5. For work that belongs on a non-default branch, push that branch and create
   or update a pull request targeting the verified base. A squash merge is a
   pull-request action, not a substitute for reconciling a rejected push.
   Immediately before an approved merge, verify the PR head SHA, target branch,
   approvals, and required checks. Merge only when the user authorizes that
   exact PR and strategy.

6. After every successful integration, fetch again and prove the result:

   ```bash
   git fetch origin
   git status --short --branch
   git rev-list --left-right --count HEAD...<base-ref>
   git log -1 --oneline <base-ref>
   ```

   A clean status alone is insufficient: report the pushed or merged commit
   SHA, the verified target ref, and whether local `HEAD` matches the intended
   remote ref. Run the project's relevant validation before claiming an app
   change is ready.

## GitHub capability adapter

When the host exposes a connected GitHub capability, use the connection the
user has made available to inspect repository metadata, compare commits, read
PR/check state, create or update a PR, and perform an explicitly approved
merge. Confirm that the connector's repository and account match the local
`origin` before any write.

Do not embed a connector ID, token, or account name in this portable package.
Those are host- and user-specific. If the connector is unavailable, perform
local Git inspection and hand back the exact PR or merge action that requires a
connected GitHub surface.

## PUSH_REJECTED recovery

For the common error "the remote has commits that are not in the local
repository":

1. Preserve the working tree; do not reset, stash-drop, or force-push.
2. Fetch `origin` and show the ahead/behind counts and commit subjects.
3. If the checkout is merely behind and clean, fast-forward it.
4. If the checkout has local commits as well, identify whether they are on the
   default branch or a feature branch and use the decision table above.
5. Resolve only user-approved conflicts. If this workflow started the merge or
   rebase and no subsequent user edits occurred, aborting that operation is a
   safe recovery option; otherwise stop and preserve the state for review.
6. Push normally, then re-fetch and verify the remote contains the expected
   commit. A second rejection means stop and re-inspect rather than escalating
   to a force push.

## Output contract

Return:

- verified repository root, `origin` URL, current branch, and base ref;
- working-tree and ahead/behind state before any write;
- reviewed commit scope and every commit, push, PR, or merge actually made;
- the connector state used, or why hosted actions were not available;
- conflict/protection/authorization blockers and the smallest safe next step;
- post-action `git status`, target-ref comparison, commit SHA, and relevant
  validation result.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
