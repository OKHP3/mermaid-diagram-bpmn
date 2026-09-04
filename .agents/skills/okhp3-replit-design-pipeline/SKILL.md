---
name: okhp3-replit-design-pipeline
description: >
  The complete Replit design iteration loop as a single coherent workflow —
  extract → sandbox → variant → graduate. Use when redesigning, improving, or
  creating variants of any UI component or page. Covers the "extract first,
  never approximate" rule, DESIGN subagent brief anatomy, variant labelling
  conventions on canvas, and the graduation decision gate. Activate for
  "redesign", "improve this component", "show me options", "create variants",
  "put on canvas", "graduate this mockup", "design alternatives", or any
  request that implies iterating on UI — whether the component exists already
  or is being built from scratch.
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
    - The decision tree — when to extract vs. build from scratch
    - The extract → sandbox → variant → graduate pipeline as a coherent workflow
    - DESIGN subagent brief anatomy for mockup sandbox tasks
    - Variant labelling and canvas layout conventions
    - The graduation decision gate and GENERAL vs DESIGN subagent distinction
    - Common mistakes that break the pipeline
  out_of_scope:
    - Canvas API mechanics — read the canvas skill
    - Mockup-sandbox setup and component URL patterns — read the mockup-sandbox skill
    - Import tracing and dependency stubbing during extraction — read the mockup-extract skill
    - Production wiring during graduation — read the mockup-graduate skill
    - Launching a DESIGN subagent — read the design skill
---

# okhp3-replit-design-pipeline

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Replit's design canvas exposes five interlocking skills: **mockup-sandbox**, **mockup-extract**, **mockup-graduate**, **design-exploration**, and the **design** (DESIGN subagent) skill. None of them explains the full loop as a decision tree. This skill does.

---

## Scope

| In scope | Out of scope |
|---|---|
| Decision tree: extract vs. build from scratch | Canvas callback schemas — read the canvas skill |
| Full pipeline narration: extract → sandbox → variant → graduate | Sandbox setup and URL patterns — read mockup-sandbox |
| DESIGN subagent brief anatomy | Import tracing during extraction — read mockup-extract |
| Variant labelling on canvas | Production wiring — read mockup-graduate |
| Graduation decision gate | Launching subagents — read the design skill |

---

## The decision tree: start here

```
User asks to improve / redesign / create variants / show options

          ↓
Does the component already exist in the main app codebase?
          │
   YES ───┤                         NO
          ↓                          ↓
    EXTRACT first               BUILD from scratch
    (mockup-extract)            (mockup-sandbox + DESIGN subagent)
    then iterate                    ↓
          │                  Is this a net-new component
          ↓                  the user described, or one
    Proceed to               the agent is inventing?
    VARIANT phase                   │
                              Both → Build from scratch,
                              then proceed to VARIANT phase
```

**The golden rule: if the component exists in the codebase, extract it.** Never rebuild from memory. You will get dimensions, colours, spacing, opacity values, and font sizes wrong. The real source code has the correct values.

---

## Phase 1 — Extract (when component already exists)

**Read the mockup-extract skill** (`read .local/skills/mockup-extract/SKILL.md`) for the full process. The high-level steps are:

1. Locate the target component file in the main app.
2. Trace its full import chain (component → hook → context → client). Classify each dependency as inline, copy, or stub.
3. Create `artifacts/mockup-sandbox/src/components/mockups/{group}/_group.css` with the app's `:root` CSS variables and font imports — this is what makes the extracted component look identical to the original.
4. Create `Current.tsx` in the same group folder, importing `_group.css`.
5. Embed it on the canvas labelled "Current" — this is your baseline.

**Do not call `getCanvasState` and then place the baseline blind.** Read state first, find empty space, then place.

---

## Phase 2 — Sandbox (when component does not yet exist)

**Read the mockup-sandbox skill** (`read .local/skills/mockup-sandbox/SKILL.md`) for setup. The key steps:

1. Start the mockup-sandbox workflow: `restartWorkflow({ workflowName: "artifacts/mockup-sandbox: Component Preview Server" })`.
2. Create the component in `artifacts/mockup-sandbox/src/components/mockups/{group}/`.
3. Place a `"building"` iframe on the canvas immediately — before the component is written — so the user sees instant feedback.
4. Flip to `"live"` once the URL resolves.

Preview URL pattern (no port number):

```
https://${REPLIT_DOMAINS}/__mockup/preview/{group}/{ComponentName}
```

---

## Phase 3 — Variant exploration

### When to use a DESIGN subagent

Use a DESIGN subagent for variant exploration when there are 2+ variants to generate. They run in parallel and each produces genuinely distinct output.

**DESIGN subagent brief anatomy for mockup sandbox variants:**

```
Product/brand identity: 1-2 vivid sentences — who it's for, what it feels like.
Goal: what component or page to build.
Vibe: one natural-language feeling (NOT a design style name).
Target location: the file path, shape ID, and dev server URL.
Variant hypothesis: what makes THIS variant distinct from the others (give each subagent a different brief).
```

**What NOT to include in the brief:**
- Specific CSS values, colours, font names, pixel spacing
- Layout prescriptions ("put the CTA on the right")
- Section names or content order
- Design style names ("minimalist", "material design")

**Why?** The DESIGN subagent is the creative director. Your job is to describe the *feeling* and the *goal*. Over-specification produces constrained, predictable output. Under-specification produces generic output. The sweet spot is vivid product identity + distinct vibe.

### Variant labelling on canvas

Place a `text` shape label above each variant iframe — not below, not beside. Use the same label height (60 canvas units) and gap (40 canvas units) as the zone labels in the board layout.

Label naming convention:
- `"Current"` — the extracted or pre-existing component
- `"A — Minimal"` / `"B — Editorial"` / `"C — Bold"` — name by design hypothesis, not by letter alone

**Why named variants matter.** When the user says "I prefer B," they mean the design hypothesis, not the letter. A label like "B — Editorial" makes the conversation precise.

### Distinct variation axes

Each variant should represent a meaningfully different answer to "how should this component work?" Choose from:

| Axis | Examples |
|---|---|
| **Structural** | List vs. grid vs. timeline; sidebar vs. top nav |
| **Content/semantic** | Feature-led vs. social-proof-led vs. price-led |
| **Conceptual** | Dashboard-as-cockpit vs. dashboard-as-feed |
| **Behavioural** | Validate on blur vs. on submit vs. inline |
| **Aesthetic** | Minimal vs. bold editorial vs. warm textured |

Default to ≥2 of 3 variants being net-new big swings, not incremental refinements.

---

## Phase 4 — Graduate

**Trigger:** the user says "use this one", "ship it", "I like B, integrate it", "graduate this", or any approval of a specific variant.

**Read the mockup-graduate skill** (`read .local/skills/mockup-graduate/SKILL.md`) for the full process.

### The graduation decision gate

Before graduating, answer:

1. **Which variant exactly?** If multiple are live, confirm with the user.
2. **Is the main app's component library different from shadcn/ui?** If yes, every `@/components/ui/*` import needs translation.
3. **Does the mockup have real data or mock data?** All mock data → real API calls during graduation.

### GENERAL vs DESIGN subagent for graduation

- **GENERAL subagent** — for graduation. Graduation is engineering: import graph, routing, state wiring, API integration. GENERAL subagents navigate codebases.
- **DESIGN subagent** — never for graduation. They don't wire APIs or understand routing.

### What to preserve exactly

Colours, gradients, shadows, border radius, spacing, typography (family/weight/size/line-height), layout structure, animations, hover states, and icons.

### What to transform

Mock data → real API calls; no-op navigation handlers → real router links; local constants → app state; stubbed auth → real auth context.

---

## Phase 5 — Iterate

After graduation, if the user wants further changes:

- **Small visual edits** → edit the main app component directly.
- **Major redesign** → extract the newly graduated component back into the sandbox, create new variants, graduate again.

This loop is the full pipeline. Each cycle produces tighter, more informed output than the last.

---

## Common mistakes

| Mistake | Why it hurts | Fix |
|---|---|---|
| Rebuilding an existing component from scratch | Wrong colours, spacing, opacity — visual fidelity lost | Always extract first |
| Giving all DESIGN subagents the same vibe | Three nearly identical variants | Each subagent gets a distinct brief |
| Naming variants A/B/C with no hypothesis | User confusion when approving | Name by design hypothesis ("Editorial", "Minimal") |
| Using a DESIGN subagent for graduation | They don't wire APIs or understand routing | Use a GENERAL subagent |
| Editing `index.css` instead of `_group.css` | Tokens leak into every other mockup | Use group-level CSS |
| Forgetting `import './_group.css'` | Component renders with wrong tokens — no error, just wrong | Always import it |
| Improving the design during graduation | Ships something the user did not approve | Graduate exactly what was approved |

---

## Skill reading order

When activating this pipeline, read skills in this order — only what you need for the current phase:

1. **This skill** — pipeline decision tree and brief anatomy (always read first)
2. **`.local/skills/mockup-sandbox/SKILL.md`** — if setting up the sandbox or creating new components
3. **`.local/skills/mockup-extract/SKILL.md`** — if extracting an existing component
4. **`.local/skills/design/SKILL.md`** — if launching a DESIGN subagent
5. **`.local/skills/design-exploration/SKILL.md`** — if the user asks for divergent exploration ("what else could this be?")
6. **`.local/skills/mockup-graduate/SKILL.md`** — when the user approves a variant
7. **`.local/skills/canvas/SKILL.md`** — for canvas callback mechanics at any stage

---

## About

Built from retrospective analysis of the Glee-fully Chai Chasers Designathon project at [overkillhill.com](https://overkillhill.com).
By [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
