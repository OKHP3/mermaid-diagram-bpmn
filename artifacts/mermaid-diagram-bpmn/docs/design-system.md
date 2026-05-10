# OKH Forge UI System v0.1.0

Design system shared across all OverKill Hill P³ companion apps.

## What it is

The Forge UI System is a thin, opinionated design layer built on top of Tailwind CSS v4.
It provides a canonical token set and a small collection of utility classes that make
every OKH P³ app — Mermaid BPMN, and any future tools — feel like they come from the
same workbench.

It is not a component library. It is a vocabulary of tokens and class names that sit
between raw Tailwind utilities and app-specific layouts.

---

## Files

| File | Role |
|------|------|
| `src/index.css` | Single source of truth for all design tokens and forge-* utility classes |
| `src/components/Layout.tsx` | Structural shell: forge-header, forge-main, forge-footer |
| `src/pages/*.tsx` | Consumers of forge-* classes; no one-off color values |

---

## Brand primitives

Defined in `:root` inside `src/index.css`. These are raw hex values that describe the
OKH Forge brand palette. Do not scatter these hex values across component files — always
reference via CSS variable.

```css
--okh-forge-bg:      #f0ebe5;   /* warm field — page background   */
--okh-forge-paper:   #f6f2ee;   /* warm paper — card surface      */
--okh-forge-ink:     #0f172a;   /* deep ink — body text           */
--okh-forge-teal:    #1c3a34;   /* forge teal — structural accent */
--okh-forge-rust:    #c46a2c;   /* rust-orange — primary action   */
--okh-forge-amber:   #e6a03c;   /* amber — secondary accent       */
--okh-forge-code-bg: #0f1f1c;   /* dark workbench — code panels   */
--okh-forge-code-fg: #d4c9b5;   /* warm parchment — code text     */
```

**Safe to change:** any `--okh-forge-*` value to retheme globally.
**Do not change:** the variable names themselves — other CSS rules reference them.

---

## Header tokens

The OKH header is always dark, regardless of light/dark page theme.

```css
--okh-header-bg:     #1c2118;
--okh-header-text:   #e6dfc9;
--okh-header-muted:  rgba(230, 223, 201, 0.52);
--okh-header-border: #2a3124;
--okh-header-active: var(--okh-forge-rust);
--okh-header-hover:  rgba(255, 255, 255, 0.07);
```

---

## Semantic tokens

Theme-responsive HSL values wired into Tailwind via `@theme inline`.
Defined for light mode in `:root` and overridden for dark mode in `.dark`.

| Token | Purpose |
|-------|---------|
| `--background` | Page body background |
| `--foreground` | Default body text |
| `--card` / `--card-foreground` | Card surface and text |
| `--border` | Default border color |
| `--muted` / `--muted-foreground` | Muted surfaces and text |
| `--primary` / `--primary-foreground` | Primary action (rust-orange) |
| `--accent` / `--accent-foreground` | Amber tint accent |
| `--ring` | Focus ring color |

---

## Canonical utility classes

### Layout

| Class | Use |
|-------|-----|
| `.forge-shell` | Top-level page wrapper (`min-h-screen flex flex-col`) |
| `.forge-header` | Sticky always-dark header surface |
| `.forge-main` | Flex-1 main content area |
| `.forge-footer` | Always-dark footer surface |
| `.forge-grid` | Blueprint grid background texture |
| `.diagram-grid` | Dot grid for diagram preview panels |

### Content

| Class | Use |
|-------|-----|
| `.forge-card` | Standard content card (border + rounded + padding + shadow) |
| `.forge-card-title` | Section title inside a card |
| `.forge-eyebrow` | Small-caps mono label above headings |
| `.forge-callout` | Rust left-border emphasis block |
| `.forge-status-pill` | Inline status badge base |

### Code surfaces

| Class | Use |
|-------|-----|
| `.forge-code-panel` | Dark code/editor textarea background |
| `.forge-code-panel-tab` | Dark tab bar above a code panel |

### Buttons

| Class | Use |
|-------|-----|
| `.forge-btn-primary` | Rust-orange filled pill — primary CTA |
| `.forge-btn-outline` | Warm-paper bordered pill — secondary action |
| `.forge-btn-accent` | Amber-tinted subtle button |

### Tabs

| Class | Use |
|-------|-----|
| `.forge-tabs` | Horizontal tab row container |
| `.forge-tab` | Inactive tab pill |
| `.forge-tab-active` | Active tab pill |

---

## Deprecated aliases

The following old class names still work via CSS aliases, but should not be used in new code.

| Old name | New canonical name |
|----------|--------------------|
| `.btn-forge` | `.forge-btn-primary` |
| `.btn-forge-outline` | `.forge-btn-outline` |
| `.code-panel` | `.forge-code-panel` |
| `.code-panel-tab` | `.forge-code-panel-tab` |

---

## Keeping sibling apps visually aligned

When building a new OKH P³ companion app:

1. Copy the `OKH FORGE UI SYSTEM v0.1.0` section from `src/index.css` into the new app's global CSS.
2. Do not change brand primitive values — change only app-specific accent layers on top.
3. Use `.forge-header` / `.forge-main` / `.forge-footer` for the shell.
4. Use `.forge-btn-primary` and `.forge-btn-outline` for all CTAs.
5. Use `.forge-code-panel` and `.forge-code-panel-tab` for any code/editor surfaces.
6. Use the same three fonts: Inter (sans), Fraunces (display), JetBrains Mono (mono).
7. Keep the header always-dark — do not make it theme-responsive.

The goal is that a user who switches between OKH apps should recognize the same
workbench aesthetic without the apps looking identical.
