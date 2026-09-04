---
name: okhp3-replit-repl-janitor
description: >
  OverKill Hill P³ one-Repl repository cleanup workflow for safely auditing and
  tidying a single Replit workspace's Git checkout. Use when a user asks to
  clean up merged or abandoned branches and pull requests, purge stale
  subrepl-* or agent/* branches, normalize file and folder names, or remove
  repository detritus. Also activate for "decrapify this Repl", "tidy this
  repo", "prune dead branches", or "fix inconsistent filenames". This is the
  authoritative one-time cleanup workflow for one Replit checkout; use
  okhp3-repository-janitor for recurring maintenance and multiple local clones,
  and okhp3-repository-organizer for structural
  reorganization.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.1"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Auditing one Replit checkout's local branches against a verified base ref
    - Resolving pull-request state before classifying branches for keep, merge, delete, or review
    - Treating Replit-generated branch names as hints rather than deletion proof
    - Auditing kebab-case naming with documented structural exceptions
    - Finding nested detritus folders and preparing an owner-approved cleanup plan
    - Executing only the exact cleanup items the owner explicitly approves
  out_of_scope:
    - Recurring repository maintenance and worktree reconciliation
    - Multi-repository mirror estates across computers or clones
    - Deep repository classification, taxonomy design, or governance scaffolding
    - Autonomous merges, deletions, renames, force-pushes, or publication
    - Rewriting main or deleting stashes, archive refs, or unreviewed work
---

# okhp3-replit-repl-janitor

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Safely clean one Replit workspace's Git checkout without confusing generated
branch names with proof, a closed pull request with a merged one, or an untidy
filename with permission to rename it. The workflow is read-only first,
evidence-led, and destructive only after the owner approves exact line items.

---

## Scope

| In scope | Out of scope |
|---|---|
| One-time cleanup of one Replit checkout | Recurring maintenance; use `okhp3-repository-janitor` |
| Branch and PR classification against a verified base | Multi-clone reconciliation; use `okhp3-repository-janitor` |
| Naming and detritus audit | Structural redesign; use `okhp3-repository-organizer` |
| Exact, owner-approved cleanup execution | Autonomous deletion, merging, renaming, or publishing |

---

## Safety contract

1. **Start read-only.** Run the bundled audit without `--fetch`; it reads the
   current checkout and prints JSON. Fetch separately only when network access
   is appropriate. Never prune during discovery.
2. **Fail visibly.** A missing base ref, failed Git command, detached HEAD, or
   non-repository path is evidence, not an empty result. Stop and report it.
3. **Separate three facts.** "Merged into `origin/main`", "closed pull request",
   and "abandoned with no PR" are different states. Never substitute one for
   another.
4. **Names are hints, not verdicts.** `subrepl-*`, `replit-agent`, and `agent/*`
   suggest generated work but do not prove it is safe to delete. The current
   branch is never a deletion candidate.
5. **Plan before touching.** Return the exact `keep`, `merge`, `delete`, and
   `review` branch buckets plus file actions. Wait for explicit approval of
   individual destructive lines.
6. **Rename atomically.** A file rename must update every importer and link in
   the same change. A public URL needs a redirect or transition plan.
7. **Protect recovery paths.** Never rewrite `main`, force-push, or delete
   stashes or archive refs under this skill.

---

## Workflow

### 1. Establish a trustworthy baseline

Record the repository root, current branch, configured remotes, base ref, and
working-tree status before making recommendations:

```bash
git status --short --branch
git remote -v
git rev-parse --verify origin/main
```

If remote-tracking refs may be stale, run `git fetch --all` separately and
inspect its result. Do **not** add `--prune`: pruning before classification
destroys evidence about stale remote branches.

> **NON-NEGOTIABLE — NO EARLY PRUNING:** Never run `git fetch --all --prune`,
> `git fetch --prune`, or `git remote prune` until **every** stale remote branch
> has been classified. Refresh refs without pruning during discovery.

Run the deterministic local audit:

```bash
python3 .agents/skills/okhp3-replit-repl-janitor/scripts/audit-repo.py \
  --root . \
  --base origin/main
```

The script is read-only by default. `--fetch` is available only as an explicit
opt-in and still never prunes.

### 2. Resolve pull-request state

The audit reports Git facts; it does not infer hosted pull-request state. For
every unmerged branch, use the `git-remote` skill or GitHub CLI:

```bash
gh pr list --head '<branch>' --state all
gh pr view <number> --json state,mergeStateStatus,reviewDecision,statusCheckRollup,headRefOid
```

Do not infer "no PR" from a failed network call. Record the lookup as unknown
and place the branch in `review`.

### 3. Classify every branch

Every non-current, non-`main` branch belongs in exactly one bucket:

| Bucket | Evidence rule |
|---|---|
| `keep` | Active work, an open wanted PR, or deliberately retained history |
| `merge` | Approved PR, required checks passing, exact head verified |
| `delete` | Verified merged into the base, or owner-confirmed abandoned with no wanted PR |
| `review` | Unique commits, unknown PR state, failed lookup, or unclear intent |

Generated naming affects the explanation, never the bucket by itself.

### 4. Audit naming and detritus

Apply `references/naming-conventions.md`:

- default to kebab-case;
- preserve PascalCase `.tsx`/`.jsx` components;
- preserve camelCase `useFoo.ts` hooks;
- preserve root governance, tool-required, and web-standard filenames;
- flag spaces, mixed case, underscores, and uppercase extensions when no
  exception applies.

For detritus folders such as `attached_assets/`, `_unused/`, `_drafts/`,
`_scratch/`, `_old/`, `tmp/`, `temp/`, and `unused/`, inspect contents before
choosing delete or gitignore-and-untrack. A folder name is evidence for triage,
not permission to discard its contents.

### 5. Present the plan and stop

Use this exact report shape:

```markdown
## Branches & PRs
- KEEP: <branch> — <evidence>
- MERGE: <branch> — <PR and check evidence>
- DELETE: <branch> — <merged or owner-confirmed abandonment evidence>
- REVIEW: <branch> — <unknown fact and smallest next check>

## A. DELETE
- <path> — <why it is verified disposable>

## B. GITIGNORE-AND-UNTRACK
- <path> — <why it is generated but currently tracked>

## C. TRIAGE-THEN-DELETE
- <path> — <what must be inspected first>

## D. RENAME
- <old> → <new> — <rule, import/link impact, validation>
```

Stop. General approval of "the cleanup" is not approval of every destructive
line; obtain an exact go/no-go for each merge, delete, and rename.

### 6. Execute approved items in small batches

Before each branch operation, refresh and verify the expected head SHA.

For an approved merge:

1. Confirm PR approval and required checks.
2. Confirm the PR head SHA matches the reviewed branch head.
3. Squash-merge through the pull request.
4. Fetch and verify the merged result is reachable from the base.
5. Delete the exact remote branch first.
6. Delete its local tracking branch second.

For approved files, use `git rm` and `git mv` so the change is explicit. Plain
`rm` is acceptable only for an untracked or gitignored working file.

### 7. Verify and report

After every approved batch:

```bash
python3 .agents/skills/okhp3-replit-repl-janitor/scripts/audit-repo.py \
  --root . \
  --base origin/main
git status --short
```

If a tracked source file moved or was renamed, run the relevant validation and
restart the affected workflow, then inspect its logs and preview. Report what
changed, what remains, and which recovery path is still available.

---

## Output contract

Return:

- repository root, current branch, base ref, and whether refs were fetched;
- the four branch buckets with evidence for every item;
- the four file-action sections;
- unresolved unknowns and the smallest safe next check;
- exact writes performed, or an explicit statement that discovery was
  read-only;
- post-change audit, Git status, and workflow validation results when execution
  was authorized.

---

## Failure handling

| Condition | Result |
|---|---|
| Base ref missing | Stop; ask which verified base ref to use |
| Git command or fetch fails | Stop; show the failed command and stderr |
| Detached HEAD | Audit may continue, but no branch deletion may be recommended until the active work is identified |
| PR lookup unavailable | Put affected branches in `review`; never infer abandonment |
| Unique unmerged commits | Preserve in `review` unless the owner explicitly abandons them |
| Rename affects public URL | Require redirect or transition plan before execution |
| Approval is broad or ambiguous | Ask for exact approved line items |

---

## Resources

- `scripts/audit-repo.py` — deterministic, no-fetch-by-default JSON audit of
  branches, naming violations, and nested detritus.
- `references/naming-conventions.md` — portable kebab-case policy and structural
  exceptions.
- `references/foundry-architecture.md` — Phase 1 intent, scope, and brand
  decision for this renamed skill.
- `evals/evals.json` — three live-evaluation prompts with four anchored
  expectations each.
- `benchmarks/benchmark.json` — version-matched Foundry evidence after live
  execution.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
