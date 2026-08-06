# BPMN for Mermaid — Promotion Strategy

Status snapshot and decision memo. Written 2026-08-06. Supersede this file's "current state" section as items close; keep the rest as the living playbook.

---

## Current state (as of 2026-08-06)

- GitHub: [OKHP3/mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn) at 4 stars, 0 forks, 0 watchers. Normal for a three-month solo prototype, not itself a signal of a problem.
- Per `docs/version-checklist.md`, the prototype link was posted to [mermaid-js/mermaid#7699](https://github.com/mermaid-js/mermaid/issues/7699), [#2623](https://github.com/mermaid-js/mermaid/issues/2623), and #660 on 2026-08-05.
- **Open gap:** the README instructs `npm install @okhp3/mermaid-diagram-bpmn`. Verified against the npm registry on 2026-08-06: the package is not published (404). `V0.9` in `docs/version-checklist.md` already tracks this, blocked on adding `NPM_TOKEN` and running `publish-npm.yml` (workflow_dispatch or a GitHub Release).
- No maintainer reply confirmed yet on #7699/#2623/#660 as of this writing; needs a direct check, tooling in this session couldn't pull comment text.

## The real competitive landscape

Not bpmn-js (GUI toolkit, different category) or draw.io/PlantUML (already scoped correctly in `docs/strategy.md`). The live competitive signal is a parallel upstream proposal:

| Item | Detail |
|---|---|
| Issue | [mermaid-js/mermaid#7699](https://github.com/mermaid-js/mermaid/issues/7699) |
| Author | Andreas Emrich, DFKI |
| Opened | 2026-05-02 |
| Status | Approved, contributor needed |
| Backing | Academic paper: Emrich, A., Hollax, J. (2025). *Domain-Specific Languages for Business Process Modeling: Mermaid Diagrams for BPMN*, DFKI |
| Stated intent | "I will try and implement it myself" |
| Syntax approach | Metadata-heavy, type annotations on every node |

`bpmn-beta` targets the same upstream slot with a readability-first syntax. `docs/strategy.md` already has an engagement plan for this issue (don't publish a competing proposal before a working prototype exists; share the prototype once the plugin is wired at V0.6; frame as an alternative syntax, not a rejection). That trigger was met and executed on 2026-08-05.

## Options considered

| Option | What it means | Tradeoff |
|---|---|---|
| A. Fix, then wave | Publish to npm now, verify no dismissive maintainer reply on #7699, then sequence LinkedIn → one public-distribution push | Slight delay, but nobody hits a broken install in front of the audience that matters most |
| B. Go loud now, patch in parallel | Start LinkedIn/HN this week, publish npm in parallel | Faster visibility, risks a maintainer or early adopter hitting the 404 while credibility is still being formed |
| C. Go quiet, wait for Emrich | Hold all promotion until #7699 gets a maintainer response | Avoids looking like a race against a competing proposal, but cedes the "showed up first with something working" framing already earned |

**Recommendation: Option A.** The #7699 comment is already live and irreversible. A stranger who follows that link today and hits a 404 on the README's first command is the worst available first impression, worse than posting nothing. Publishing to npm is minutes of work (workflow already built) against a comment that's already public.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Emrich's proposal gets a maintainer green light before further engagement | Check #7699 for replies now. A second comment once npm + demo hold up is fair game; no need to wait for v1.0 grammar hardening |
| LinkedIn posts read as self-promotion to an enterprise-architecture professional network | Build-in-public narrative, not launch announcement. Link in a comment, not the opening line. Space posts out and mix with non-project content |
| BP-SKILL differentiation claim ("zero of 89,000+ agentskills.io skills implement a BABOK knowledge area," dated May 2026 in `docs/strategy.md`) ages or was never independently re-verified | Re-run the count against the current agentskills.io directory before reuse in any external post |
| npm 404 undermines trust with Mermaid maintainers and technical reviewers, the exact audience deciding between two proposals | Publish to npm before any further promotion push |
| Personal brand posting bleeds into BFS/enterprise-architecture day-job identity on LinkedIn | Keep examples generic, no BFS references, consistent with existing personal/work separation practice |

## Next actions

- [ ] Fire `publish-npm.yml` via `workflow_dispatch` (dry_run: false) or cut a GitHub Release to close the npm 404. Highest-leverage item; already blocking a live, public link.
- [ ] Check #7699, #2623, #660 for maintainer replies since 2026-08-05.
- [ ] Re-verify the "zero of 89k+ skills implement BABOK" figure against the current agentskills.io directory before reuse.
- [ ] Once npm is live, run `okhp3-linkedin-angles` against the repo plus the #7699 engagement to seed candidate post angles.
- [ ] Sequence the wider push: LinkedIn build-in-public post first (lower risk), then one public-distribution channel (HN, Reddit, or Product Hunt — pick one), only after a stranger's first click actually works end to end.
- [ ] Add 1-2 real-world example diagrams beyond purchase-approval (already flagged as a V0.9 gap). This is what a reviewer pastes their own use case against in the first five minutes.

## GitHub star-growth reference (2026 practice)

For a project this early, growth is a positioning and distribution problem, not a virality problem:

1. Clarify positioning above the fold in the README — what it is, who it's for, why it differs, what to click next.
2. Optimize the README for conversion — headline, visual proof, use-case bullets, quick start that actually works, community proof.
3. Launch in waves, not bursts — warm support, then one public-distribution push, then follow-up content.
4. Pick one primary channel per push, matched to intent (HN for technical novelty, Reddit for storytelling, Product Hunt for polish).
5. Reply fast in the first 12 hours of any public post.
6. Convert social proof to search proof — comparison pages, tutorials, FAQs, teardowns.
7. Keep the project visibly alive — recent commits, answered issues, updated roadmap and changelog.

Source: [GitHub Star Growth: 9 Levers That Compound in 2026](https://dev.to/iris1031/github-star-growth-9-levers-that-compound-in-2026-15d).
