# Palette Contract — okhp3-mermaid-theme-builder

---

## Palette Schema

Each palette entry in `assets/palettes.json` follows this shape:

```json
{
  "name": "ocean-depth",
  "display": "Ocean Depth",
  "brand": null,
  "theme": "dark",
  "themeVariables": {
    "primaryColor": "#hex",
    "primaryTextColor": "#hex",
    "primaryBorderColor": "#hex",
    "secondaryColor": "#hex",
    "secondaryTextColor": "#hex",
    "secondaryBorderColor": "#hex",
    "tertiaryColor": "#hex",
    "tertiaryTextColor": "#hex",
    "tertiaryBorderColor": "#hex",
    "background": "#hex",
    "mainBkg": "#hex",
    "nodeBorder": "#hex",
    "clusterBkg": "#hex",
    "clusterBorder": "#hex",
    "lineColor": "#hex",
    "edgeLabelBackground": "#hex",
    "fontFamily": "string",
    "fontSize": "string",
    "labelBackground": "#hex",
    "labelTextColor": "#hex",
    "titleColor": "#hex"
  }
}
```

**Fields:**
- `name` — machine-readable slug (lowercase, hyphenated)
- `display` — human-readable label
- `brand` — brand owner slug or `null` for generic palettes
- `theme` — `"dark"` or `"light"`
- `themeVariables` — all 21 Mermaid themeVariables; no variable may be omitted

---

## Semantic Token Logic

| Token | Semantic Role |
|---|---|
| `primaryColor` | Primary node/task fill color |
| `primaryTextColor` | Text inside primary nodes |
| `primaryBorderColor` | Border of primary nodes |
| `secondaryColor` | Secondary node fill (gateways, alternate nodes) |
| `secondaryTextColor` | Text on secondary nodes |
| `secondaryBorderColor` | Border of secondary nodes |
| `tertiaryColor` | Accent or highlight fill |
| `tertiaryTextColor` | Text on tertiary elements |
| `tertiaryBorderColor` | Border of tertiary elements |
| `background` | Diagram canvas background |
| `mainBkg` | Primary node background (redundant with `primaryColor` in many renderers, but both required) |
| `nodeBorder` | Default border for all node types |
| `clusterBkg` | Subgraph / cluster background (flowchart, pool) |
| `clusterBorder` | Subgraph / cluster border |
| `lineColor` | Edge / flow arrow color |
| `edgeLabelBackground` | Background behind edge condition labels |
| `fontFamily` | Font stack for all text labels |
| `fontSize` | Base font size (include unit: `14px`) |
| `labelBackground` | Background behind floating labels |
| `labelTextColor` | Text color for floating labels |
| `titleColor` | Diagram title and accTitle text color |

---

## Built-in Palettes

### Thematic Palettes (4)

**Ocean Depth** (`ocean-depth`, dark)
- Deep navy/teal — technical documentation, engineering diagrams, data pipelines

**Forest Sage** (`forest-sage`, dark)
- Deep green — sustainability, process documentation, environmental contexts

**Slate Ember** (`slate-ember`, dark)
- Warm brown/amber — executive reports, internal ops, classic professional look

**Violet Mist** (`violet-mist`, dark)
- Deep violet/lavender — product design, creative workflows, UX process maps

### Brand Palettes (4)

**OKH P³** (`okh-p3`, dark)
- OverKill Hill P³ brand — forge rust accent on near-black background with teal secondary

**Glee-fully** (`glee-fully`, light)
- Warm coral/teal on off-white — approachable, consumer-facing diagrams

**AskJamie** (`askjamie`, light)
- Teal/sand on warm white — professional services, advisory, document-heavy workflows

**Neutral Enterprise** (`neutral-enterprise`, light)
- Navy/blue-grey on near-white — corporate, neutral, presentation-safe

---

## Custom Palette Derivation Rules

When the user provides custom colors, derive a full 21-variable palette using:

1. Treat user's primary as `primaryColor` and `mainBkg`
2. `primaryBorderColor` = primary darkened 15%
3. `primaryTextColor` = `#ffffff` if primary is dark (luminance < 0.4), `#1a1a1a` if light — verify ≥4.5:1 WCAG contrast ratio
4. `secondaryColor` = primary lightened 30% or hue-shifted ±30°
5. `secondaryTextColor` = `#ffffff` or `#1a1a1a` (same contrast rule)
6. `secondaryBorderColor` = secondary darkened 10%
7. `tertiaryColor` = complementary or analogous hue 60–120° away
8. `tertiaryTextColor` = `#ffffff` or `#1a1a1a`
9. `tertiaryBorderColor` = tertiary darkened 10%
10. `background` = primary darkened 40% and desaturated 30% (dark theme), or `#f8f8f8` (light theme)
11. `lineColor` = tertiary at +20% saturation and +10% lightness
12. `clusterBkg` = background darkened 10%
13. `clusterBorder` = primary at 60% opacity approximated as hex
14. `edgeLabelBackground` = background
15. `labelBackground` = background
16. `labelTextColor` = `primaryTextColor`
17. `titleColor` = `lineColor`
18. `fontFamily` = `'Segoe UI', sans-serif` (default unless user specifies)
19. `fontSize` = `14px` (default)

State all derivation assumptions explicitly before producing output.

---

## Contrast and Accessibility

- Minimum contrast ratio: 4.5:1 for normal text (WCAG AA)
- Apply to: `primaryTextColor` on `primaryColor`, `secondaryTextColor` on `secondaryColor`, `labelTextColor` on `labelBackground`
- If a derived contrast ratio falls below 4.5:1, adjust text color toward white or black until compliant and note the adjustment

---

## Scope Firewall

See `references/scope-firewall.md`. No employer-owned brand colors, no BFS identifiers, no private color systems not belonging to the OverKill Hill P³ product family.
