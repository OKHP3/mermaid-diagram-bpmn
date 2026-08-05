---
name: okhp3-brand-style-registry
description: >
  OverKill Hill P³ visual style registry and application workflow. Use when a user wants to extract a reusable brand, visual style, palette, typography system, layout language, or interface aura from a website, stylesheet, document, presentation, infographic, or set of visual assets. Also activate when a user wants an SPA, documentation, presentation, image brief, or other target artifact aligned to one or more named style profiles. This is the authoritative profile-driven workflow for capturing and applying visual style without blending unrelated brands or treating inferred cues as declared rules.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.2.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Evidence-backed extraction, registration, and application of named visual style profiles to approved artifacts."
  out_of_scope: "Inventing a brand identity, unauthorized source copying, or unrelated product redesign."
---

# okhp3-brand-style-registry

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Build a durable library of named visual profiles, then use it to create work that feels intentionally aligned instead of generically themed. Treat a profile as design evidence and reusable direction, not as permission to copy another organization’s identity.

This skill has two operating modes: capture a source into a named profile, or apply one or more existing profiles to a target. Keep those modes separate. A capture updates the library only after provenance and confidence are recorded; an application changes the target only after the profile roles and target boundaries are explicit.

---

## Cardinal rule: brand name integrity

A registered brand name string -- most notably **"OverKill Hill P³™"** -- must never break, wrap, or truncate across a line boundary in any target artifact (navigation bars, footers, headers, body copy, presentation slides, or exported documents). A mid-name line break (e.g. "OverKill Hill" wrapping away from "P³™") is a rendering defect, not a cosmetic nit, and must be fixed immediately wherever it is found -- including in artifacts this skill did not itself produce.

When applying or auditing a profile that carries a brand name:

- Join the name with non-breaking spaces (`&nbsp;` in HTML/JSX, `\u00A0` elsewhere) so the browser cannot insert a line break between words.
- Also set `white-space: nowrap` (or the equivalent for the target medium) on the element rendering the name, as a second, independent guard -- the non-breaking spaces protect the name if the element itself can still wrap onto a new line at narrow widths.
- Check the rendered result at narrow container widths (mobile nav, narrow sidebars, compressed columns) specifically, since that is where this defect surfaces first.
- If you find an existing broken instance while doing unrelated work in a target repository, flag and fix it as part of that work; do not leave a known brand break unresolved.

This rule applies to every registered brand name a profile declares, not only OverKill Hill P³™.

---

## Scope

| In scope | Out of scope |
|---|---|
| Websites, CSS, visual documents, presentations, infographics, and image assets | Logo recreation, trademark clearance, or identity theft |
| SPA styling, documentation direction, presentation direction, and image briefs | Applying styles with no target owner approval |
| One primary style with carefully bounded supporting styles | Silent palette, type, or layout averaging |

---

## Profile library model

Store each style in its own profile file and list it in a registry. There is no fixed profile limit. The separation preserves provenance, makes profiles independently reusable, and prevents a later capture from overwriting an established identity.

Use this layout unless the target repository already has a stronger convention:

```text
brand-styles/
  registry.yaml
  profiles/
    <style-id>.yaml
```

If the target repository already has a style-library convention, preserve it and map the same profile fields into that convention. Do not create a second registry merely because the directory name differs.

At capture time, ask the user for a human-readable style name and a stable slug. If the user provides several sources for one identity, confirm that they belong to one profile before combining their evidence. If sources represent different identities, create separate profiles.

Read `references/style-profile-schema.md` before creating or revising a profile. Use `assets/style-library.example.yaml` when a starter registry helps.

When a CSS file is available, run `scripts/extract_css_signals.py --input <path> --source <locator>` before interpreting it. The JSON output is an observation ledger, not a finished profile. Use the same principle for documents, screenshots, and rendered pages: preserve the raw locator or page or region reference before assigning semantic roles.

---

## Phase 1: capture and extract

1. Establish source authority. Ask whether each source is owned by the user, publicly referenceable, or only inspirational. Record that answer in the profile.
2. Prefer declared design sources over visual inference. CSS variables, token files, design-system documentation, and source artwork are `declared` evidence. Rendered pages and visual artifacts are `observed` evidence. Narrative interpretation is `inferred` evidence.
3. Extract only reusable cues. Capture color roles, typography roles, spacing, radii, borders, shadows, motion, grid and density, components, imagery direction, icon treatment, and language describing the intended emotional effect.
4. Preserve variants. A dark mode, campaign surface, application view, or section theme is a named variant, not a conflicting duplicate token.
5. Record uncertainty. Do not turn a visually estimated color or font into a declared token. Use a confidence value and source note.

Keep the original source file or a public locator available for review. When a source cannot be accessed, say so in the profile and continue only with user-supplied material. Never fabricate an extraction from a URL that was not inspected.

For a website, inspect both its declared styling and its rendered hierarchy. For a document or infographic, sample visible visual patterns and mark values as observed unless a style guide establishes them. Do not add private URLs as a required dependency for a public profile.

---

## Phase 2: store

Create one `<style-id>.yaml` file using the schema. Include at minimum:

- profile identity and use boundary
- source provenance and evidence level
- foundation and semantic color tokens
- typography roles and fallbacks
- layout, surface, interaction, and imagery guidance
- accessible-use notes and target constraints
- variants, conflicts, and confidence notes

Add the profile to `registry.yaml` with its display name, path, status, and tags. Never replace an existing profile just because its palette shares colors with a new one. Version a changed profile and explain whether it reflects a source update or a corrected extraction.

Use a transaction-like update: write the profile to a new or temporary path, validate its identity and required fields, then update the registry entry. If validation fails, leave the existing profile untouched. Preserve old profiles as `archived` when a new identity supersedes them.

---

## Phase 3: select and apply

Before changing a target, show the named profiles available to the user and ask which to use. For multiple profiles, require this selection model:

```yaml
primary: <style-id>
supporting:
  - profile: <style-id>
    allowed_roles: [imagery, microcopy]
```

The primary profile controls the target’s overall visual grammar: palette hierarchy, typography, surfaces, spacing, component anatomy, and interaction tone. A supporting profile may contribute only the explicitly allowed roles. It cannot silently replace the primary palette, fonts, or layout. If the user wants a true hybrid, create a new named profile with its own evidence and rationale rather than mutating either parent profile.

If the user names a specialized wrapper such as `okhp3-overkill-hill-brand`, treat that wrapper’s bundled profile as the default primary. Still inspect the target’s existing tokens and report any source conflict before editing.

For an SPA, work in this order:

1. Map profile tokens to the application’s token layer or theme variables.
2. Update shared primitives before one-off components.
3. Apply typography, surfaces, spacing, controls, and imagery direction to the relevant views.
4. Inspect the rendered result at representative viewport sizes.
5. Check contrast, focus visibility, font fallbacks, density, and any target-framework constraints.

Do not rewrite generated files, dependency lockfiles, or unrelated components merely to make the target look consistent. Prefer a small token-layer change that can be reverted and reviewed.

For documentation, presentations, and image briefs, translate the profile into target-appropriate direction. Preserve hierarchy, tone, proportion, and texture without pretending that CSS can be applied directly to a non-web artifact.

---

## Required handoff

Report four things at the end of a capture or application run:

1. The profile or profiles used, including evidence level and confidence.
2. The tokens and cues applied or intentionally not applied.
3. Any unresolved source conflict, missing asset, or font-licensing concern.
4. The target-specific verification completed and the remaining human review decisions.
5. Confirmation that every registered brand name renders intact (no mid-name wrap) at the narrowest reviewed viewport -- see the cardinal rule above.

---

## Included seed material

- `assets/profile-seeds/overkill-hill.yaml` - example independent profile from declared OverKill Hill theme sources.
- `assets/profile-seeds/glee-fully.yaml` - example independent profile from declared Glee-fully theme sources.
- `assets/profile-seeds/askjamie.yaml` - example independent profile from declared AskJamie theme sources.
- `assets/specialization-seeds/` - copy-ready narrow skills for the repositories that own those three profiles.

These are examples and specialization seeds, not a universal default visual identity.

---

## References

- `references/style-profile-schema.md` - profile structure, evidence levels, and multi-profile conflict rules.
- `references/source-sampling.md` - source-specific sampling, evidence ledger, rights, and confidence rules.
- `references/application-playbook.md` - selection, target preflight, application sequence, and handoff contract.
- `assets/style-library.example.yaml` - starter registry with separate profile entries.
- `scripts/extract_css_signals.py` - deterministic CSS signal extraction for the capture phase.
- `evals/evals.json` - three draft evaluation cases for the public workflow.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
