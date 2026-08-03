# Source sampling guide

Use this guide during capture. Keep the source record and the design interpretation separate so a later maintainer can audit or correct the profile without losing the original evidence.

## Source order

1. Read local files supplied by the user before fetching a public URL. Local source is usually the most authoritative and avoids unnecessary network access.
2. Inspect declared systems first: CSS custom properties, theme files, design-system notes, font declarations, document master styles, and supplied artwork.
3. Inspect rendered output second: repeated surfaces, hierarchy, density, component anatomy, imagery, motion, and writing tone.
4. Use narrative or emotional language only as inferred direction. Never promote an interpretation to a declared token.
5. Record unavailable sources as unresolved. Do not fill a missing value from memory or silently substitute a familiar brand pattern.

## Evidence ledger

For every important claim, record:

| Field | Meaning |
|---|---|
| `claim` | The reusable design statement or token role |
| `source` | A relative path, public URL, or artifact identifier |
| `authority` | `declared`, `observed`, or `inferred` |
| `sampled_on` | ISO date of inspection |
| `locator` | CSS selector, variable name, page section, document page, or image region when available |
| `confidence` | `high`, `medium`, or `low` |
| `notes` | Conflict, limitation, or interpretation boundary |

Prefer several narrow claims over one broad claim. For example, record `--accent: #c46a2c` as declared and "orange process accents create heat" as inferred. Do not merge them into one unsupported statement.

## Sampling by source type

### Websites and SPAs

- Inspect the source stylesheet and the rendered hierarchy.
- Sample at least one primary, secondary, and error or status state when available.
- Note responsive changes, focus treatment, motion timing, and reduced-motion behavior.
- Treat computed values as observed unless the source declaration is available.

### Documents and infographics

- Record page or frame numbers for repeated visual evidence.
- Sample title, body, annotation, table, chart, and callout treatments when present.
- Separate the document's content structure from the visual treatment.
- Mark OCR or visual estimates as observed with lower confidence.

### Images and supplied artwork

- Record the image identifier and region when a cue is localized.
- Capture palette, contrast, texture, composition, edge treatment, and subject direction.
- Do not extract or recreate logos, protected marks, or character likenesses without permission.

## Conflict and confidence rules

- A later declared source can supersede an earlier observation, but preserve both records.
- Two declared sources with different values require a named variant or an explicit conflict note.
- A low-confidence estimate may guide exploration but must not become a hard token.
- If a font is unavailable, keep the declared family in the profile and specify a tested fallback stack in the application handoff.

## Safety and rights

Use public references and user-owned artifacts for analysis. A style profile describes reusable design behavior; it is not authorization to copy a logo, trademark, proprietary illustration, or confidential material. Keep private URLs out of public profiles and replace them with a public distillation when publication is intended.
