---
name: okhp3-replit-build-in-public
description: >
  Full playbook for a Replit Designathon competition submission — canvas
  organisation for judges, artifact selection, dual deployment (Replit Publish
  + GitHub Pages), session-to-session narrative continuity, and
  building-in-public commit discipline. Activate for "designathon", "competition",
  "building in public", "judges", "showcase", "submission", "dual deploy",
  "GitHub Pages + Replit", or any request to prepare a Replit project for
  public or competitive review.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.1"
  category: developer-tooling
  origin: Glee-fully Chai Chasers Designathon — retrospective skill extraction
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  maturity: draftable
  in_scope:
    - Canvas organisation for judge review (hero row, labeled zones, focusCanvasShapes)
    - Artifact selection guide — which artifacts matter most to judges
    - Dual deployment — Replit Publish and GitHub Pages side-by-side
    - Session handoff conventions for multi-day builds
    - Building-in-public commit-message discipline
    - The distinction between "canvas for building" and "canvas for judging"
  out_of_scope:
    - Canvas callback mechanics — read the canvas skill
    - GitHub Pages deployment mechanics — read the okhp3-vite-github-pages skill
    - Replit deployment mechanics — read the deployment skill
    - Multi-artifact monorepo rules — read the okhp3-replit-multi-artifact skill
    - Individual artifact build instructions (slides, video, web, etc.)
---

# okhp3-replit-build-in-public

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Building in public on Replit is not just about shipping code — it is about making your process *visible*. This skill covers the full arc: how to organise what you have built so judges can evaluate it quickly, how to deploy it to two public surfaces, how to maintain narrative continuity across many build sessions, and how to make your commit history a readable story.

---

## Scope

| In scope | Out of scope |
|---|---|
| Canvas as a judge showcase board | Canvas callback mechanics — read the canvas skill |
| Artifact selection for judges | GitHub Pages mechanics — read okhp3-vite-github-pages |
| Dual deployment setup | Replit deployment mechanics — read the deployment skill |
| Session handoff conventions | Multi-artifact monorepo rules — read okhp3-replit-multi-artifact |
| Commit-message discipline | Individual artifact build instructions |

---

## The two modes of the canvas

**Building mode** — the canvas is a work surface. Iframes are scattered, some are building, labels are missing. This is fine during development; judges never see it.

**Judging mode** — the canvas is a showcase board. Every iframe is live, zones are labeled and numbered, a `focusCanvasShapes` call navigates judges to the layout automatically.

**Switch to judging mode before every public review.** The canvas is the first thing a judge sees in the Replit workspace.

---

## Canvas organisation for judges

### Hero row

The top strip of the board. Place your **three primary deliverables** here — the live interactive artifact (game, app, tool), the portfolio/pitch deck, and the showcase video. These are the artifacts judges interact with directly.

```
y = 100
x positions: 0, (w1 + 80), (w1 + 80 + w2 + 80), ...
```

Section label above the hero row:
```
y = 20, h = 60, color = grey
text = "SYSTEM ARTIFACTS — live app · portfolio deck · cinematic video"
```

### Zone rows

Below the hero row, create labeled zones for design artifacts — mockups, system specs, gameplay exploration, mobile previews, storybook components. Number them in reading order.

**Zone label convention:**
- `text` shape, `color: "grey"`, `h: 60`, placed 40 units above the zone's frame baseline
- Text pattern: `"01 — ZONE NAME"`, `"02 — ZONE NAME"`, etc.

**Standard gutters:** 80 px between sibling frames, 160 px between zones.

### Final step: focusCanvasShapes

Always call this after organising for judging. Include all frame IDs and label IDs. `animateMs: 500` produces a polished animated pan.

This is what judges see the moment they toggle on the canvas preview — make it count.

---

## Artifact selection guide

Judges interact with three artifact types directly. Build all three for a strong submission.

| Artifact | Kind | What judges evaluate |
|---|---|---|
| **Interactive app** | `web` or `mobile` | Does it work? Is it polished? Does the mechanic feel good? |
| **Pitch deck** | `slides` | Is the design story clear? Does it show process, not just output? |
| **Showcase video** | `video` | Does it communicate the experience to someone who hasn't played it? |

### What makes each artifact strong

**Interactive app:**
- Launches immediately with no blank state
- Every interaction the user tries in the first 30 seconds works
- Mobile-responsive if the competition has a mobile track
- Real data or seeded data — no lorem ipsum, no "coming soon" cards

**Pitch deck:**
- Tells the *process* story: what was hard, what decisions were made, what was measured
- Includes a simulation/measurement slide if you ran any quantitative analysis
- Visual language consistent with the app's brand
- 10-14 slides: opener, problem/opportunity, the build, the interesting decisions, the measurements, what's next, closer

**Showcase video:**
- 60-120 seconds — under 30 s feels thin, over 180 s loses judges
- Announcer or narrated voice-over explaining the app's appeal in plain language
- Real in-game footage, not slide captures
- Synced sound effects and music bed
- Ends with a clear call to action (the URL, the repo, or the live app)

---

## Dual deployment: Replit Publish + GitHub Pages

Maintain two live public URLs — one Replit-hosted, one GitHub Pages. This demonstrates continuous deployment practice and gives judges two independent ways to reach the project.

### Replit Publish

1. Click **Publish** in the Replit Publishing pane after any significant milestone.
2. The published URL is at `<project-name>.replit.app` — get the exact URL from the deployment skill.
3. Every Publish is a production deploy — test the main artifact locally before clicking.

### GitHub Pages

For a Vite-based web artifact:

1. Read the `okhp3-vite-github-pages` skill for the full runbook.
2. The GitHub Actions deploy workflow triggers on every push to `main`.
3. Set `base` in `vite.config.ts` to `/<repo-name>/` for the Pages subdirectory.
4. The Pages URL is `https://<github-username>.github.io/<repo-name>/`.

**Keep both URLs in `README.md`.** Judges who browse the GitHub repo should be able to reach the live app in one click without going to Replit.

### Sync discipline

After any feature is merged:
1. Verify the GitHub Actions deploy completed successfully (green checkmark on the commit).
2. Click Publish in Replit if the change is significant enough to warrant a production deploy.
3. Update `README.md` if any measured figures (RTP, test count, decision count) changed.

---

## Session handoff conventions

A Designathon build runs across many sessions, potentially with different AI agents in each. Without handoff documents, narrative continuity breaks — the next session starts from scratch instead of where the last one left off.

### What goes in a session handoff

Write a handoff document (`<DATE>-HANDOFF.md` or append to an existing `HANDOFF.md`) that covers:

1. **What was accomplished** — features shipped, decisions made, measurements taken
2. **Current state** — which workflows are running, what the git status is, what URL is live
3. **Open items** — anything that wasn't finished, decisions that need a ruling
4. **Next action** — the single most important thing the next session should do first, stated as one sentence

**Keep handoffs short.** A handoff that is longer than one page will not be read. The full history is in git.

### Provenance discipline

Every measurement, figure, or claim that appears in the README, pitch deck, or overkillhill.com project page must be traceable to a source:

- Simulation results: cite the script, the seed range, and the spin count
- Test counts: cite the exact command that produced the number
- RTP figures: cite which fleet produced them and what player model was assumed
- Decision counts: cite the exact DECISION-LOG.md row range

**Why.** Judges who fact-check find discrepancies. Documentation that quotes a test run cannot drift. Documentation that quotes a previous document drifts every time it is copied.

---

## Building-in-public commit discipline

Your commit history is visible on GitHub. Judges and potential collaborators read it. Make it a readable story.

### Good commit messages

```
feat: add Phoebe's Lap Quest as UniGlee act 5
fix: restore showcase links to single-row icon labels on mobile
docs: update full-game RTP to 98.1% from external multi-agent validation
chore: prune 4 stale subrepl-* remotes from git remote
```

**Pattern:** `<type>: <present-tense description of what changed and why it matters>`

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`

### What to avoid

- `"update"` — update what?
- `"fix bug"` — which bug?
- `"WIP"` — staging area, not a public story
- Merge commits that reference task IDs with no other context

### Commit frequency

Commit after every meaningful milestone — not after every file save, not after every three days. A good rhythm is 2-5 commits per session. Each commit should be independently meaningful.

---

## Building-in-public checklist (pre-submission)

Use this before any public review or Designathon submission.

**Canvas:**
- [ ] All iframes are `"live"` (no `"building"` or `"modifying"` states)
- [ ] Hero row has the three primary deliverables
- [ ] Each zone has a numbered text label above it
- [ ] `focusCanvasShapes` called on all frames and labels

**Artifacts:**
- [ ] Interactive app launches with no blank states
- [ ] Pitch deck tells the process story, not just the output
- [ ] Showcase video runs end to end without error

**Deployment:**
- [ ] Replit Published URL is live
- [ ] GitHub Pages URL is live
- [ ] Both URLs are in `README.md`
- [ ] GitHub Actions deploy is green on the latest commit

**Documentation:**
- [ ] `README.md` figures (test count, RTP, decision count) match the latest measurements
- [ ] Session handoff written for continuity
- [ ] `DECISION-LOG.md` is current (no open items that should be settled)

---

## About

Built from retrospective analysis of the Glee-fully Chai Chasers Designathon project at [overkillhill.com](https://overkillhill.com).
By [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
