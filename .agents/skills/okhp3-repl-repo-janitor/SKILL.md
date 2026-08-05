---
name: okhp3-repl-repo-janitor
description: Clean up a single Replit-hosted Git repository — squash-merge and delete old, merged, or abandoned branches and pull requests (including Replit-generated subrepl-*, replit-agent, and agent/* branches), and normalize file/folder names against a kebab-case default with documented exceptions. Use when a user asks to purge dead/stale branches, clean up merged PRs, decrapify or tidy the repo, fix inconsistent file naming, or wants a repeatable Replit-repo hygiene routine across multiple Repls.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: universal
  origin: adapted from okhp3/skillz `okhp3-repository-janitor` and `okhp3-repository-organizer` for the single-checkout Replit workspace model
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  maturity: draftable
  in_scope:
    - Auditing local branches in a single Replit workspace against origin/main and each branch's pull-request state
    - Recognizing Replit-specific branch patterns (subrepl-*, replit-agent, agent/*) as a hint, not a verdict
    - Squash-merging an approved, checks-passing pull request, then deleting the exact verified branch (remote first, then local)
    - Auditing file/folder names against a kebab-case default with the standard structural exceptions (React components/hooks, root governance files, tool-required filenames, web-standard filenames)
    - Identifying common repo detritus (paste-buffer/attachment dirs, stale build zips, leftover temp files, orphaned one-time handoff docs) and proposing a triage plan
  out_of_scope:
    - Multi-repository mirror estates (that is `okhp3-repository-janitor`'s job on a machine with several local clones)
    - Deep repository classification, purpose discovery, or governance scaffolding for content-first knowledge repos (that is `okhp3-repository-organizer`'s job)
    - Merging, closing, deleting, or renaming anything without an explicit "go" from the user
    - Rewriting `main`, force-pushing, or deleting stashes/archive refs
---

# okhp3-repl-repo-janitor

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

A portable, transferable Agent Skill for one specific and common situation: **a single Replit workspace's Git checkout has accumulated stale branches, merged/abandoned pull requests, and inconsistently named files**, and the user wants it cleaned up safely. Copy this skill's folder into `.agents/skills/` in any Repl to reuse it there.

This is a condensed, Replit-shaped descendant of two broader OverKill Hill P³ skills:
- `okhp3-repository-janitor` (multi-repo branch/PR lifecycle across local mirrors)
- `okhp3-repository-organizer` (deep content-first repository classification and scaffolding)

Use this skill instead of those two when the scope is "one Repl, tidy the branches and the names," not a fleet of local clones or a full repository re-architecture.

## Safety contract

1. Start read-only. Run the bundled audit script or equivalent `git`/`gh` inspection before proposing any change. Never delete a branch, PR, file, or folder during discovery.
2. `git fetch --all` to refresh remote-tracking refs. Never pass `--prune` until every stale remote branch has been classified.
3. Treat "merged into origin/main," "closed pull request," and "abandoned with no PR" as three different facts. Check the actual PR state (via the `git-remote` skill or `gh pr view`) before recommending deletion — an old branch can still have an open, wanted PR.
4. A Replit-generated name (`subrepl-*`, `replit-agent`, `agent/*`) is a hint that the branch may be an ephemeral task-agent artifact, not proof it is safe to delete. Confirm it is merged or explicitly abandoned before including it in the delete list. The current/active branch (checked out, or the one the live agent session is using) is never a deletion candidate.
5. For naming cleanup, apply the kebab-case default (`references/naming-conventions.md`) but respect the documented exceptions: PascalCase React components, camelCase hooks, ALL-CAPS root governance files (`README.md`, `LICENSE`, `CHANGELOG.md`, `AGENTS.md`, etc.), and files whose name is dictated by a tool or a web standard (`package.json`, `.replit`, `robots.txt`, `CNAME`, ...).
6. Renaming a file changes import paths and, if it is web content, deployed URLs. Update every importer in the same change, and never rename a file that is live-linked without a redirect or transition plan.
7. Always produce a written plan before touching anything. Wait for the user to say "go" (or otherwise explicitly approve the exact items) before executing.
8. Never rewrite `main`, force-push, or delete stashes/archive refs without a separately stated and confirmed recovery plan.

## Workflow

### 1. Inventory branches and PRs

```bash
git fetch --all
python3 .agents/skills/okhp3-repl-repo-janitor/scripts/audit-repo.py --root . --base origin/main
```

This prints a JSON report: every local branch with its last-commit metadata, whether it's merged into the base branch, and whether its name matches a known Replit-generated pattern. It never mutates anything.

For each **unmerged** branch, resolve its pull-request state before deciding: use the `git-remote` skill (or `gh pr list --head <branch>` / `gh pr view` if the `gh` CLI and a token are available) to check open/closed/merged status and CI checks. Do not assume a branch is dead just because it's old — check for an open PR first.

### 2. Classify each branch

Bucket every non-current, non-`main` branch into one of:
- **keep** — active work, open PR still under review, or too recent/ambiguous to judge
- **merge** — has an approved, checks-passing PR ready to land; squash-merge it
- **delete** — already merged into `origin/main`, or confirmed abandoned with no open PR and no unique unmerged value
- **review** — needs the user's judgment (e.g., unmerged commits with unclear intent)

### 3. Inventory naming and detritus

The same script also reports naming violations (mixed/camel/Pascal case outside the documented exceptions, spaces in filenames) and known detritus folder names present in the tree (`attached_assets/`, `_unused/`, `tmp/`, `temp/`, etc., and their hyphen variants). Treat this as a starting point, not the full picture — also scan manually for:
- one-time handoff/plan documents at the repo root whose referenced work has already shipped and merged
- stale dated build/export archives (zips, tarballs) that duplicate what the build process would regenerate
- leftover temp files from interrupted shell commands (e.g. a `sed`/`mktemp` scratch file committed under a random name instead of the real target file — check content, not just the name, before judging)

### 4. Produce the plan, wait for "go"

Present findings in this exact shape (mirrors the OverKill Hill P³ "Decrapify" format so the user gets a consistent report across every Repl):

```
## Branches & PRs
- MERGE: <branch> — PR #<n>, checks green, approved → squash-merge then delete
- DELETE: <branch> — merged into origin/main on <date>, safe to remove
- KEEP: <branch> — <reason>
- REVIEW: <branch> — <what's unclear, what you need from the user>

## A. DELETE
- <file/folder> — <why it's dead>

## B. GITIGNORE-AND-UNTRACK
- <path> — currently tracked but matches a build/working-artifact pattern

## C. TRIAGE-THEN-DELETE
- <path> — read first to confirm nothing is stranded, then remove

## D. RENAME
- <old-name> → <new-name> — <which naming rule it violates>, <what else must change in the same commit>
```

Stop here. Do not execute until the user approves specific items — approving "the plan" in general is not the same as approving each destructive line.

### 5. Execute in small batches, then verify

For each approved branch merge: refresh, verify the expected head, merge via the pull request (squash), refetch, then delete only that exact verified-merged branch — remote first, then the local tracking branch. For each approved file/folder action: use `git rm`/`git mv` (not raw `rm`) so history and diffs stay clean, unless the target was never tracked (e.g. a gitignored working file), in which case a plain `rm` is fine.

After executing: re-run the audit script, run `git status --short`, and confirm the workflow/app still starts cleanly if any tracked source file moved or was renamed.

## Resources

- `scripts/audit-repo.py` — read-only branch + naming + detritus audit for a single local checkout. Safe to run anytime; makes no changes.
- `references/naming-conventions.md` — the kebab-case default and its structural exceptions, condensed for reuse across any Repl (not tied to a specific brand's folder taxonomy).

## About

Adapted from [okhp3-repository-janitor](https://github.com/OKHP3/skillz/blob/main/universal/okhp3-repository-janitor/SKILL.md) and [okhp3-repository-organizer](https://github.com/OKHP3/skillz/blob/main/universal/okhp3-repository-organizer/SKILL.md), narrowed for the one-Repl-one-checkout case.
Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
MIT License — free to use, fork, and adapt.
