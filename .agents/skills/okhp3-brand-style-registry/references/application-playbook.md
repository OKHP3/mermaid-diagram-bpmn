# Application playbook

Use this guide after the user selects one or more profiles. The goal is a traceable transformation that preserves the target's behavior and makes the visual decisions reviewable.

## Selection contract

Before editing, present the available profile IDs and ask for a selection when the user has not named one. Record the selection as:

```yaml
primary: <profile-id>
supporting:
  - profile: <profile-id>
    allowed_roles: [imagery, microcopy]
```

The primary owns palette hierarchy, typography, geometry, components, interaction treatment, and overall tone. Supporting profiles may contribute only the listed roles. If a requested supporting role would change the primary system, stop and ask whether to promote that profile to primary or create a new hybrid profile.

## Target preflight

1. Identify the target files, framework, token layer, and existing behavior that must remain unchanged.
2. Locate the narrowest shared styling seam: CSS custom properties, theme object, design tokens, or document master styles.
3. Note constraints such as existing font licensing, framework conventions, generated files, accessibility requirements, and deployment checks.
4. Create a short before-state inventory so the final handoff can distinguish visual changes from behavior changes.

## SPA sequence

1. Map profile foundation and semantic tokens to the target token layer.
2. Update shared primitives before page-specific components.
3. Apply type roles, surface hierarchy, spacing, radii, borders, shadows, controls, and imagery direction.
4. Preserve interaction semantics, routing, data flow, and responsive behavior.
5. Check representative desktop and narrow viewports, keyboard focus, reduced motion, font fallback, and contrast for every meaningful state.
6. Review the diff for accidental content, behavior, or asset changes before presenting the result.

## Non-web artifacts

Translate the profile into a brief appropriate to the medium. Preserve hierarchy, proportion, rhythm, texture, and emotional direction. Do not claim that CSS tokens were applied directly to a document, presentation, or generated image.

## Handoff contract

Report the selected profiles, role boundaries, changed files or artifact surfaces, applied and intentionally omitted cues, verification performed, unresolved conflicts, licensing or source limitations, and the remaining human decisions. If no files were changed, state why and provide the next safe action.
