---
name: okhp3-source-backed-research
description: Produce research notes, comparisons, or recommendations with traceable sources, retrieval dates, and explicit uncertainty. Use when work depends on external facts, changing information, technical documentation, or claims that should be verified. Do not use when the needed evidence is already fully available in local files.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: knowledge-operations
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Source-traceable research and recommendations where freshness or external verification matters."
  out_of_scope: "Decorative browsing, unsupported claims, source-service scraping, or decisions that require specialist authority."
---

# okhp3-source-backed-research

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Output contract

Return the question, decision context, local evidence checked, source ledger,
claim-to-source mapping, uncertainty register, implications, and one next
action. For each external source record title, publisher, URL, retrieval date,
authority rationale, and the exact claim supported. If external access is not
available, return `BLOCKED` or use only the supplied local evidence.

1. State the research question and the decision or artifact it supports.
2. Inventory relevant local evidence before retrieving anything external.
3. Prefer primary and authoritative sources. Use current sources for changing
   facts and record retrieval dates.
4. Capture source title, publisher, URL or local path, and the exact claim it
   supports.
5. Apply `okhp3-evidence-standard` to separate source facts, interpretation,
recommendations, and unknowns.
6. Cite claims near their supporting sources. Quote only what is necessary and
   respect copyright and confidentiality boundaries.
7. End with implications, unresolved questions, and one recommended next
   action.

For technical work, prefer official documentation and original research. For
recommendations, state criteria and tradeoffs instead of presenting preference
as fact. Do not browse merely to decorate an answer that local evidence already
settles.

Do not send source content, private data, or credentials to an external service
without explicit authorization. Research output is not an authorization to act
on the recommendation.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
