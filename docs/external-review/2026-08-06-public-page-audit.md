# Public Page Accuracy Audit — overkillhill.com/projects/bpmn-for-mermaid/

Checked against the actual `mermaid-diagram-bpmn` repo state from the prior audit. Method: fetched the live page and its GitHub source, drove the live embed and every advertised link in-browser, and cross-checked the `OverKill-Hill` Replit workspace — where I found an agent session from ~3 days ago that already flagged one of these same issues. Verdict up front: the page is mostly honest, better-hedged than the repo's own README in one place, and has exactly one broken control and one stale-progress claim worth fixing.

---

## What's accurate

The "What it is / What it is not" section holds up against the actual repo — every scope boundary listed (no XML round-trip, no executable semantics, not full BPMN 2.0, not yet a production plugin) matches what I verified directly in the codebase. Notably, this page is **more conservative than the repo's own README**: the README's install snippet (`npm install @okhp3/mermaid-diagram-bpmn`) implies a package that doesn't exist on npm yet, while this page never claims npm installability at all. If you're looking for the more-honest artifact between the two, it's this page, not the README.

The embedded playground is a live iframe of the actual GitHub Pages app, not a screenshot or restated copy — so that section can't drift out of sync by construction. Standards alignment (BABOK, BPM CBOK, APQC, BPMN 2.0.2, DMN, ISO 9001), the 15-skill table, and the "9 variable layer templates" all match the repo exactly. The DSL example is a verbatim, correctly-formatted `bpmn-beta` snippet.

The 3-day-old Replit agent session I found also independently confirmed the skill-layer grouping (6 layers) matches the repo's README exactly, correcting an earlier assumption of drift — so that's settled, not just my read.

---

## What's stale

**The plugin-integration status undersells what's actually shipped.** The page's "Build Progress" section lists "port to Mermaid External Diagram API" as part of the still-`IN PROGRESS` v0.1 milestone. But the repo's own `README.md` and `AGENTS.md` — both dated 2026-08-04 — say the source-level integration is done and verified: `bpmn-plugin.ts` is a working `ExternalDiagramDefinition`, validated by a merge-blocking CI test against real `mermaid@11.4.1`, and I personally drove the live `/mermaid-host-demo` page, which calls real `mermaid.registerExternalDiagrams()` and renders correctly. The repo's own `version-checklist.md` marks this milestone (V0.6) `[DONE]`.

So there's a real, specific gap: what the public page calls "in progress," the repo's own most-authoritative docs call "shipped and CI-verified." The one part of that bullet that's still accurate is "packaging" — npm publish genuinely hasn't happened — but the page's phrasing implies the integration itself is unbuilt, which isn't true anymore. This makes the project look a full milestone further away from its stated goal (a real Mermaid plugin) than it actually is, to the one audience — Mermaid maintainers — who'd care most about that specific fact.

Minor, lower-confidence: "Created: May 2026" vs. the repo's own `CHANGELOG.md`, which puts the first scaffold commit at 2026-04-25. Not worth a special trip, but fix it if you're already in the file for the item above.

---

## What's broken

**The headline download command 404s.** The page's install instructions for the full BP-SKILL suite are:

```
curl -L https://okhp3.github.io/mermaid-diagram-bpmn/downloads/bp-skill-suite-v0.3.zip \
  -o bp-skill-suite-v0.3.zip && unzip bp-skill-suite-v0.3.zip -d skills/
```

I hit that URL directly: **404, Page Not Found.** This isn't a caching fluke — the actual download mechanism in the live app is a client-side ZIP built on the fly (`ZipDownloadButton.tsx`, using `fflate`, on the `/skills` page), not a pre-built static file at a fixed `/downloads/` path. That static path was apparently never generated, and the GitHub source itself contains a leftover comment admitting as much: "download URL active after React app deployment to GitHub Pages completes." It didn't.

This isn't new information — the Replit workspace's own agent history shows a session from ~3 days ago that checked this exact URL (plus `/v0.2`, `/v0.4`, `/v1.0` variants, all 404), correctly concluded the fix belongs to the `mermaid-diagram-bpmn` repo rather than the marketing page, and flagged it as "blocked-on-PRD-1." It's still broken three days later, so whatever PRD-1 was supposed to close this hasn't landed yet, or hasn't been prioritized.

---

## Content gaps

The same Replit agent session also confirmed: **every skill-related link on the page points to the generic `/skills` index, never to a per-skill detail URL.** That's a missed opportunity, not a defect — the app has real per-skill pages (`/skills/:skillId`, confirmed in the earlier code audit) with frontmatter previews, PNS lifecycle position, and cross-links to worked examples. The marketing page's 15-skill table lists names in plain text with no links at all when it could deep-link each row.

Minor internal inconsistency: the hero paragraph's platform-compatibility list ("Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, and Cursor") drops VS Code, while the "What it is" bullet list two sections down includes it. The repo's own `compatibleWith` list has six platforms including VS Code. Not misleading, just inconsistent within the same page.

---

## Recommended fixes, in order

1. **Fix the zip 404 — but in the right repo.** Either generate and commit the static `bp-skill-suite-v0.3.zip` at the advertised path as part of the `mermaid-diagram-bpmn` build/deploy pipeline, or change this page's install command to point at the real mechanism (link to `/skills` and instruct "click Download the Suite" instead of a `curl` one-liner). The second option is less brittle — a static filename with a version number baked in will 404 again the next time the suite version changes, exactly as it has now.
2. **Update the Build Progress bullet.** Change "port to Mermaid External Diagram API" from `IN PROGRESS` to reflect that source-level integration is CI-verified; keep "npm publication" as the honestly-still-open item. This is a copy fix only, no new work required — the evidence already exists in your own repo.
3. **Deep-link the skill table.** Each of the 15 rows should link to its `/skills/:skillId` page instead of nothing. Cheap change, makes the page do more of what the underlying app can already do.
4. **Reconcile the platform list** to consistently include VS Code in both spots.
5. **Fix the creation date** to April 2026 while you're in the file.

Items 1–2 are the only ones with real stakes — a dead CTA and an understated capability claim to the one audience (Mermaid maintainers) whose read of "how far along is this" actually matters. 3–5 are polish.
