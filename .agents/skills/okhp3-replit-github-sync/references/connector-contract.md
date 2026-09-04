# Connected GitHub operation contract

This skill is portable. The caller supplies the connected GitHub integration
at runtime; do not hard-code a connector ID, token, cookie, repository owner,
or project name in this package.

Use the connector for hosted state and hosted mutations when it is available:

| Need | Minimum evidence to capture |
|---|---|
| Repository and default branch | Canonical repository identity, remote URL, base branch |
| Branch inspection | Branch name and exact head SHA |
| Pull-request inspection | PR number, source/target branches, head SHA, state, mergeability, reviews, required checks |
| Pull or fetch equivalent | Resulting remote SHA and whether the operation changed local state |
| Push | Target branch, pushed SHA, server acceptance, protection or rejection reason |
| Merge or squash | PR number, selected merge method, resulting base SHA, and server result |
| Branch deletion | Exact branch name, verified merged base SHA, and deletion result |

When connector output is incomplete, pair it with local Git evidence. A
connector message such as “success” without a resulting SHA is not enough to
claim convergence. If the connector cannot perform an operation, use the
smallest supported alternative or report UNKNOWN; do not fabricate an API call
or fall back to a force-push.

Never print or persist credentials. Redact access tokens, cookies, signed URLs,
and private connector metadata from reports and commits.
