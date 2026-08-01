---
name: okhp3-evidence-standard
description: Classify consequential claims as confirmed, inferred, proposal, or unknown and keep those tiers visible. Use for cross-machine or cross-agent comparisons, conflicting sources, handoffs, decision records, and recommendations from incomplete evidence. Do not substitute it for mechanical validation or source research.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: knowledge-operations
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Claim classification and evidence traceability for consequential comparisons, handoffs, and decisions."
  out_of_scope: "Mechanical testing, source retrieval, domain adjudication, or upgrading claims without direct evidence."
---

# okhp3-evidence-standard

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Output contract

Return one row per consequential claim with `claim`, `tier`, `evidence`,
`consequence_if_false`, and `next_check`. Use `UNKNOWN` when a check did not
run. Cite the exact local path, tool result, or source identifier when one is
available.

Use four tiers:

1. **Confirmed:** directly observed in a file, tool result, or primary source
   this session. Cite the supporting path, check, or source when useful.
2. **Inferred:** a reasonable conclusion from confirmed evidence. Mark it
   `INFERRED` or `ASSUMPTION` when the context does not already make that clear.
3. **Proposal:** a recommendation or design opinion, not an established fact.
4. **Unknown:** not verified, including another machine or agent's self-report.

When sources conflict, show both claims and their tiers before recommending a
resolution. Do not resolve by confidence, detail, timestamp, version label, or
majority vote alone.

Move tiers in both directions. Upgrade a claim when direct evidence arrives.
Downgrade it when the stated check did not run or the cited source does not
support it. Agreement among builds that have already read one another is a
consistency signal, not independent corroboration.

End reconciliations and handoffs with remaining unknowns and the next check
that could resolve them. Classification does not grant permission to edit,
publish, move, or delete the underlying material.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
