# OKH Forge UI Contract for BPMN for Mermaid

## 1. Purpose

BPMN for Mermaid is the structural sibling to Mermaid Theme Builder. Both tools are
part of the OverKill Hill P³ studio and consume the same OKH Forge design language.
They share fonts, palette, radius scale, header surface, dark palette, and Mermaid
output colors. A user arriving at BPMN for Mermaid from Mermaid Theme Builder should
recognize the same studio hand without any visual discontinuity.

---

## 2. Authority Order

Token decisions resolve in this order. A lower-level definition overrides only when
a specific BPMN-product concern requires it — never for general divergence.

1. **OverKill-Hill canonical stylesheet**
   `https://github.com/OKHP3/OverKill-Hill/blob/main/assets/css/theme.css`
   Authoritative source for the raw OKH Forge palette and brand identity.

2. **Mermaid Theme Builder token file**
   `https://github.com/OKHP3/mermaid-theme-builder/blob/main/src/styles/forge-tokens.css`
   Shared Forge token layer consumed by both sibling Mermaid tools.

3. **BPMN local copy**
   `artifacts/mermaid-diagram-bpmn/src/styles/forge-tokens.css`
   Path-adopted local copy of the sibling token file. Do not invent BPMN-specific
   raw palette values here — keep in sync with the sibling.

4. **Local component styles**
   `artifacts/mermaid-diagram-bpmn/src/index.css` and component CSS.
   Maps Forge raw vars into Tailwind semantic tokens; contains BPMN-specific utility
   classes such as `.forge-eyebrow`, `.forge-code-panel`, `.forge-grid`.

---

## 3. Non-Negotiable Visual Contract

### Fonts

| Role    | Family            | Weights         |
|---------|-------------------|-----------------|
| Display | Alfa Slab One     | 400             |
| Body    | DM Sans           | 400 500 600 700 |
| Mono    | JetBrains Mono    | 400 500         |

Google Fonts href (exact):
```
https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap
```

### Raw Forge Palette

| Token                  | Value     |
|------------------------|-----------|
| `--okh-forge-bg`       | `#f0ebe5` |
| `--okh-forge-paper`    | `#f6f2ee` |
| `--okh-forge-ink`      | `#0f172a` |
| `--okh-forge-teal`     | `#1c3a34` |
| `--okh-forge-rust`     | `#c46a2c` |
| `--okh-forge-amber`    | `#e6a03c` |
| `--okh-forge-code-bg`  | `#0f1f1c` |
| `--okh-forge-code-fg`  | `#d4c9b5` |

### Light Semantic Tokens

| Token                | Value             |
|----------------------|-------------------|
| `--background`       | `33 18% 94%`      |
| `--foreground`       | `222 47% 11%`     |
| `--border`           | `30 20% 88%`      |
| `--card`             | `34 35% 95%`      |
| `--card-foreground`  | `222 47% 11%`     |
| `--card-border`      | `30 20% 88%`      |
| `--popover`          | `34 35% 97%`      |
| `--primary`          | `25 63% 47%`      |
| `--primary-foreground` | `0 0% 100%`     |
| `--secondary`        | `33 28% 92%`      |
| `--muted`            | `33 25% 91%`      |
| `--muted-foreground` | `220 9% 35%`      |
| `--accent`           | `25 40% 92%`      |
| `--accent-foreground`| `25 63% 35%`      |
| `--input`            | `30 20% 85%`      |
| `--ring`             | `25 63% 47%`      |
| `--radius`           | `0.75rem`         |

### Dark Semantic Tokens

| Token                | Value             |
|----------------------|-------------------|
| `--background`       | `224 30% 8%`      |
| `--foreground`       | `220 14% 92%`     |
| `--border`           | `224 20% 18%`     |
| `--card`             | `224 25% 11%`     |
| `--card-foreground`  | `220 14% 92%`     |
| `--card-border`      | `224 20% 18%`     |
| `--popover`          | `224 25% 11%`     |
| `--popover-foreground` | `220 14% 92%`   |
| `--primary`          | `25 63% 58%`      |
| `--primary-foreground` | `0 0% 100%`     |
| `--secondary`        | `224 20% 16%`     |
| `--muted`            | `224 20% 14%`     |
| `--muted-foreground` | `220 12% 56%`     |
| `--accent`           | `25 25% 18%`      |
| `--accent-foreground`| `25 50% 75%`      |
| `--input`            | `224 20% 18%`     |
| `--ring`             | `25 63% 58%`      |

### Header Surface

| Role                 | Value                      |
|----------------------|----------------------------|
| Background           | `#1c3a34` (forge teal)     |
| Foreground           | `#e5e7eb`                  |
| Muted text           | `rgba(229, 231, 235, 0.55)`|
| Border               | `rgba(255, 255, 255, 0.07)`|
| Active accent        | `#c46a2c` (forge rust)     |

### Radius

Base radius: `0.75rem`. Pill buttons may use `rounded-full`.

### Mermaid Fallback Output Theme

```ts
export const MERMAID_FALLBACK_THEME: BpmnThemeOptions = {
  primaryColor: '#111827',
  lineColor:    '#c46a2c',
  mainBkg:      '#111827',
  nodeBorder:   '#c46a2c',
  clusterBkg:   '#0d1117',
  textColor:    '#e5e7eb',
};
```

---

## 4. What May Differ

BPMN for Mermaid may differ from Mermaid Theme Builder in:

- App icon and favicon
- `bpmn-beta` DSL badge in the header
- DSL syntax examples and diagram fixtures
- Process-modeling vocabulary and reference pages
- Spec pages, DSL reference, and roadmap content
- Agent Skills browser (if present)
- Playground-first workflow and dual-pane editor layout
- Deployment URL and domain

---

## 5. What May Not Differ

BPMN for Mermaid may not differ from Mermaid Theme Builder in:

- Base font families (Alfa Slab One / DM Sans / JetBrains Mono)
- Raw Forge palette values (`--okh-forge-*`)
- Base semantic token palette (light and dark)
- Header color (`#1c3a34` background, `#e5e7eb` foreground)
- Radius scale (`0.75rem` base)
- Dark-mode hue family (slate-blue 224, not olive 88)
- Primary accent (`#c46a2c` rust-orange)
- Blueprint grid motif
- Code panel treatment (`--okh-forge-code-bg` / `--okh-forge-code-fg`)
- Card treatment and shadow scale
- Footer treatment
- Default first-load mode (light when no stored preference)

---

## 6. Iframe Boundary

The parent OverKill Hill website (`overkillhill.com`) cannot style this app through the
iframe boundary. CSS variables, custom properties, and stylesheets do not cross iframe
origins. The app must carry its own complete local token copy in
`src/styles/forge-tokens.css` and apply all Forge styles independently. Do not rely on
the parent page for any visual contract item.

---

## 7. Drift Test

Run these checks before any release or after any token or layout change:

```bash
# Forbidden font remnants
grep -r 'Fraunces' artifacts/mermaid-diagram-bpmn/src/
grep -r "family=Inter" artifacts/mermaid-diagram-bpmn/index.html

# Forbidden color remnants
grep -r '#1890ff' artifacts/mermaid-diagram-bpmn/src/
grep -r '#1c2118' artifacts/mermaid-diagram-bpmn/src/

# Forbidden dark hue remnants
grep -r '88 18% 9%' artifacts/mermaid-diagram-bpmn/src/

# Forbidden radius remnant
grep -r '^  --radius: 0\.5rem' artifacts/mermaid-diagram-bpmn/src/

# Font load — must include Alfa Slab One, DM Sans, JetBrains Mono
grep 'Alfa+Slab+One' artifacts/mermaid-diagram-bpmn/index.html

# First-load theme behavior — must default to light
# Check: useDarkMode() or equivalent reads localStorage and uses dark only if stored
grep -n 'prefers-color-scheme\|matchMedia' artifacts/mermaid-diagram-bpmn/src/
```

Visual check: open BPMN for Mermaid and Mermaid Theme Builder side by side in a fresh
private window. The header, body background, card surfaces, fonts, and dark-mode palette
should be visually indistinguishable at the token level.

---

## 8. Brand Firewall

This project has no affiliation with any employer, client, or commercial organization.

- No BFS content
- No Builders FirstSource content
- No employer references, client names, or employer color examples
- No examples drawn from professional or client work
- All BPMN process examples are generic or openly published standards examples

Any contribution must pass this firewall before merging.
