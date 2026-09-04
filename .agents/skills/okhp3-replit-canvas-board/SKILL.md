---
name: okhp3-replit-canvas-board
description: >
  Plan and build a structured multi-frame Replit canvas presentation board —
  hero rows, labeled zones, iframe lifecycle (building→live), coordinate layouts,
  and focusCanvasShapes for audience navigation. Use when organising the canvas
  for a designathon, showcase, or any multi-frame review. Also activate for
  "arrange the frames", "set up the board", "label the zones", "focus the
  viewport", or any canvas layout that needs deliberate spatial planning rather
  than ad-hoc placement.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: developer-tooling
  origin: Glee-fully Chai Chasers Designathon — retrospective skill extraction
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  maturity: draftable
  in_scope:
    - Strategic planning of multi-frame canvas layouts (zones, gutters, hero rows)
    - iframe lifecycle management — building → modifying → live — for audience UX
    - Coordinate system quick reference and layout arithmetic
    - Section label shape conventions for zone navigation
    - focusCanvasShapes as the final step for judges or reviewers
    - Integration contract between the mockup-sandbox skill and the canvas
  out_of_scope:
    - Canvas API mechanics (schemas, callback signatures) — read the canvas skill for those
    - Building or editing the components themselves — read the mockup-sandbox skill
    - Extracting existing app components onto the canvas — read the mockup-extract skill
    - Graduating a canvas mockup to production — read the mockup-graduate skill
---

# okhp3-replit-canvas-board

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

A portable Replit Agent Skill for planning and organising the workspace canvas as a **structured presentation board** — not just placing shapes, but producing a layout that a judge, reviewer, or collaborator can scan in under 30 seconds.

This skill sits *above* the raw canvas skill API. It teaches layout strategy; the canvas skill (`read .local/skills/canvas/SKILL.md`) teaches the callbacks.

---

## Scope

| In scope | Out of scope |
|---|---|
| Zone planning, hero rows, gutter math | Canvas callback schemas — read the canvas skill |
| iframe building→live lifecycle for audience UX | Component authoring — read the mockup-sandbox skill |
| Section label shape conventions | Extracting existing components — read mockup-extract |
| focusCanvasShapes as a presentation close | Graduating mockups to production — read mockup-graduate |

---

## Coordinate system

- Origin `(0, 0)` is **top-left**.
- Positive `x` goes right, positive `y` goes down.
- Artifact frames are pre-placed by Replit and **cannot be resized or deleted** — they can be moved.
- Design/mockup iframe sizes are set by you and can be anything.

---

## The two board modes

**Building mode** — iframes scattered wherever the last task dropped them. The canvas is a work surface, not a presentation. This is fine while building.

**Presentation mode** — iframes in deliberate zones with section labels, consistent gutters, and a `focusCanvasShapes` call at the end that pans the audience to the finished layout. Switch to this before a demo, judge review, or designathon submission.

**Why this matters.** A canvas with 11 frames in random positions looks unfinished even when the work is excellent. A canvas where a judge can scan Hero → Spec → Gameplay → Mobile → Storybook in one sweep communicates craft.

---

## Layout planning — do this before touching the canvas

Before issuing any `applyCanvasActions` calls, write down:

1. **Zone list** — What named regions will exist? (e.g. Hero row, System Spec, Gameplay Direction, Mobile, Storybook)
2. **Frame inventory** — Which shape IDs go in which zone? What are their `w` and `h`?
3. **Gutter values** — Pick two: sibling gutter (between frames in the same zone) and zone gutter (between zones). Consistent values make the layout scannable. Recommended defaults: **80 px sibling, 160 px zone**.
4. **Y baseline** — Where does the first non-hero row start? Typically `hero_h + hero_top_margin + zone_gutter + label_h + label_gap`.
5. **Coordinate table** — Compute each frame's `x` before touching the canvas. A spreadsheet or quick arithmetic avoids the multi-round correction cycle.

**Why plan first?** Canvas moves are reversible, but computing coordinates in flight forces a read→compute→move→check loop that takes multiple turns. A written coordinate table turns this into a single `applyCanvasActions` batch.

---

## Hero row convention

The hero row is the top strip of the board. Use it for the artifact frames that represent the **primary deliverables** — the live game, the pitch deck, the showcase video.

```
y = 100  (leave room for a section label above at y = 20)
x positions = 0, (w1 + sibling_gutter), (w1 + sibling_gutter + w2 + sibling_gutter), ...
```

Section label for the hero row (create before the frames):

```json
{
  "type": "create",
  "shapeId": "label-hero",
  "shape": {
    "type": "text",
    "x": 0, "y": 20, "w": <total_hero_width>, "h": 60,
    "text": "SYSTEM ARTIFACTS — live game · portfolio deck · cinematic video",
    "color": "grey"
  }
}
```

---

## Section label convention

Every zone gets a `text` shape label placed **directly above** the zone's frames. Consistent sizing across all labels makes the board scannable.

| Property | Value |
|---|---|
| `type` | `"text"` |
| `color` | `"grey"` |
| `fill` | `"none"` (default) |
| `h` | 60 canvas units |
| Gap between label bottom and frame top | 40 canvas units |
| `y` | `frames_y_baseline - 40 - 60` |
| `w` | Span of all frames in the zone (last frame's right edge minus first frame's x) |

Label text pattern: `"01 — ZONE NAME"` — numbered zones in reading order so judges can orient themselves.

---

## iframe lifecycle: building → live

This is the most important audience UX rule. **Never leave iframes in `"building"` state when presenting.**

| State | When to use | Audience sees |
|---|---|---|
| `"building"` | Frame placeholder created but component/server not ready | Animated building indicator — reassures user work is in progress |
| `"modifying"` | Frame exists and live, but you are actively editing its component | Modifying indicator — prevents flickering |
| `"live"` | Component is rendered and URL resolves | The actual component |

**For a presentation board:** all frames must be `"live"` before calling `focusCanvasShapes`. A mix of building and live states signals an incomplete build.

To flip a building placeholder to live:

```javascript
await applyCanvasActions({ actions: [
  {
    type: "update",
    shapeId: "my-frame",
    updates: {
      shapeType: "iframe",
      state: "live",
      url: "https://<domain>/__mockup/preview/folder/Component"
    }
  }
] });
```

---

## Reading state before placing

Call `getCanvasState` with a wide `focusArea` **before** computing coordinates for a reorganisation:

```javascript
const state = await getCanvasState({
  focusArea: { x: -5000, y: -5000, w: 20000, h: 20000 }
});
console.log(JSON.stringify(state.focusedShapes.map(s => ({
  id: s.shapeId, type: s.shapeType, x: s.x, y: s.y, w: s.w, h: s.h
})), null, 2));
```

Cross-reference the returned IDs against your coordinate table. **Abort and investigate** if an expected shape ID is missing before issuing any move commands.

When do you NOT need to read first?

- Placing brand-new frames on an empty canvas (`create-auto` handles placement automatically)
- Placing new frames in a region you know is empty

---

## Moving frames: artifact vs. design

| Frame type | Can move? | Can resize? | Can delete? |
|---|---|---|---|
| Artifact frame (`artifact:v3:artifacts/<slug>`) | ✅ Yes | ❌ No | ❌ No |
| Design/mockup iframe | ✅ Yes | ✅ Yes | ✅ Yes |
| Text/geo label shape | ✅ Yes | ✅ Yes | ✅ Yes |

Move an artifact frame:

```json
{ "type": "move", "shapeId": "artifact:v3:artifacts/chai-chasers", "x": 2000, "y": 100 }
```

---

## Mockup-sandbox URL pattern

Design/mockup iframes served by the mockup-sandbox use path-based routing — **no port number**:

```
https://${REPLIT_DOMAINS}/__mockup/preview/{folder}/{ComponentName}
```

Get `REPLIT_DOMAINS` at runtime:

```bash
echo $REPLIT_DOMAINS
```

Use the full `https://` URL in the `url` field.

---

## focusCanvasShapes — the presentation close

Always call this as the **last action** of a canvas layout session. It pans the user's (or judge's) viewport to show the finished layout.

```javascript
await focusCanvasShapes({
  shapeIds: [
    "label-hero", "artifact:v3:artifacts/chai-chasers-video",
    "artifact:v3:artifacts/chai-chasers",
    "label-zone-1", "design-system", "progress-feedback",
    // ... all frame and label IDs
  ],
  animateMs: 500
});
```

**Why 500 ms?** A short animated pan feels polished. Instant jumps feel like a glitch. 500 ms is the sweet spot.

---

## Complete layout workflow

1. **Inventory frames** — `getCanvasState` with a wide focus area; capture all shape IDs, positions, and sizes.
2. **Plan the layout** — write the coordinate table (zone list, gutter values, x/y for every frame and label).
3. **Delete orphaned labels** — remove any text shapes that no longer label a frame (find them by ID from the inventory).
4. **Create new labels** — one `text` shape per zone, placed above the Y baseline.
5. **Move frames** — one `move` action per frame, batched in a single `applyCanvasActions` call.
6. **Verify** — `getCanvasState` again to confirm positions, or `focusCanvasShapes` to visually inspect.
7. **Flip any building iframes** — update each to `"live"` with its resolved URL.
8. **Focus the viewport** — `focusCanvasShapes` with all frame and label IDs, `animateMs: 500`.

---

## Common mistakes

| Mistake | Why it hurts | Fix |
|---|---|---|
| Computing coordinates during the move loop | Multi-turn correction cycle | Plan the full coordinate table first |
| Forgetting to read state before reorganising | Move commands target wrong IDs | `getCanvasState` with wide focusArea first |
| Leaving frames in `"building"` when presenting | Signals incomplete work | Flip all to `"live"` before `focusCanvasShapes` |
| Trying to resize or delete an artifact frame | Silent failure or error | Artifact frames can only be moved |
| Using the main app dev URL in a mockup iframe | Shows entire app, not the component | Use `/__mockup/preview/{folder}/{ComponentName}` |
| Calling `focusCanvasShapes` mid-build | Disrupts the build flow | Call it only at the very end |

---

## About

Built from retrospective analysis of the Glee-fully Chai Chasers Designathon project at [overkillhill.com](https://overkillhill.com).
By [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
