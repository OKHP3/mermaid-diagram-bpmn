# Style profile schema

Use YAML so a profile can be reviewed and edited without a runtime dependency. Fields marked required form the portable minimum. Keep frontmatter metadata portable: Agent Skills clients expect metadata values to be strings, so scope boundaries belong in the skill body or profile fields rather than YAML frontmatter arrays.

```yaml
schema_version: "1.0"
style:
  id: <stable-kebab-case-id>                 # required
  display_name: <human-readable name>        # required
  version: "1.0.0"                            # required for revisions
  status: seed | active | archived            # required
  purpose: <one-sentence visual intent>       # required
  owner_context: owned | public-reference | inspiration-only
  tags: [<short searchable tags>]
  created_on: <YYYY-MM-DD>
  updated_on: <YYYY-MM-DD>
  sources:                                    # required, one or more
    - type: css | website | document | infographic | image | style-guide
      locator: <public URL or repository path>
      authority: declared | observed | inferred
      sampled_on: <YYYY-MM-DD>
      locator_detail: <CSS variable, selector, page, frame, or image region>
      checksum: <optional content hash for a local source>
      notes: <what this source establishes>
  evidence_summary:
    declared: <brief statement>
    observed: <brief statement>
    inferred: <brief statement>
  evidence:
    - claim: <specific reusable claim>
      source: <source index or locator>
      authority: declared | observed | inferred
      confidence: high | medium | low
      notes: <limitations or interpretation boundary>
  tokens:
    color:
      foundation: { <token>: <value> }
      semantic: { <role>: <value or token reference> }
    typography:
      roles:
        heading: { family: <value>, fallback: [<value>], notes: <value> }
        body: { family: <value>, fallback: [<value>], notes: <value> }
    geometry:
      spacing: { <token>: <value> }
      radius: { <token>: <value> }
      shadow: { <token>: <value> }
      content_width: <value>
  direction:
    visual_narrative: <plain-language feel>
    components: [<reusable component cues>]
    imagery: [<image direction>]
    motion: [<timing or behavior direction>]
    avoid: [<anti-patterns>]
  variants:
    - id: <variant-id>
      applies_to: <surface or context>
      token_overrides: { <token>: <value> }
  application:
    suitable_targets: [spa, documentation, presentation, image-brief]
    accessibility_notes: [<verification notes>]
    target_constraints: [<framework, licensing, or artifact constraints>]
    acceptance_checks: [<checks required before handoff>]
  conflicts:
    - <named source conflict or "none recorded">
  confidence:
    overall: high | medium | low
    notes: <unresolved questions>
```

## Evidence levels

| Level | Meaning | Example |
|---|---|---|
| `declared` | Read directly from an authoritative source | CSS custom property or published type specification |
| `observed` | Consistently visible in the rendered source | Repeated card radius or image treatment |
| `inferred` | Interpretive direction useful for application | "quietly technical" or "retro-bright" |

Keep the levels distinct so a later maintainer can correct an inference without overwriting a declared rule.

## Registry entry

Keep a separate registry entry for every profile. The registry is an index, not a second copy of the profile:

```yaml
schema_version: "1.0"
library:
  name: <library name>
  profiles:
    - id: <style-id>
      display_name: <human-readable name>
      path: profiles/<style-id>.yaml
      status: seed | active | archived
      version: "1.0.0"
      tags: [<short searchable tags>]
```

The profile ID, registry ID, parent directory, and profile filename must agree. A duplicate ID is an error, not a merge opportunity.

## Multi-profile application

Select one `primary` profile. It owns system-level choices. Supporting profiles need explicit `allowed_roles`; common safe roles are `imagery`, `microcopy`, or `single-feature accent`. Do not allow a supporting profile to replace `palette`, `typography`, `layout`, `components`, or `interaction` unless the user explicitly promotes it to primary.
