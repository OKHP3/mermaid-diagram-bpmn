# Mermaid Theme Variables

Reference for `themeVariables` supported by each diagram family, derived from `src/data/mermaid-capabilities.ts` and verified against Mermaid v11.15.0.

All values go inside `%%{init: {"theme": "base", "themeVariables": {...}}}%%`.

---

## Core Variables (All Families)

These variables apply broadly across most diagram families. Always include them when theming.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `primaryColor` | hex | All node-based families | Primary node fill |
| `primaryTextColor` | hex | All node-based families | Text on primary nodes |
| `primaryBorderColor` | hex | All node-based families | Primary node border |
| `lineColor` | hex | All families with edges | Arrows and connector lines |
| `secondaryColor` | hex | Flowchart, Class, State, Sequence | Secondary node fill |
| `tertiaryColor` | hex | Flowchart, Class, State | Tertiary / context node fill |
| `background` | hex | All families | Canvas background |
| `mainBkg` | hex | Flowchart, Sequence, Class, State, ER | Default node background |
| `nodeBorder` | hex | Flowchart, Class, State, ER, Requirement | Node border fallback |
| `clusterBkg` | hex | Flowchart, State, C4 | Subgraph / cluster background |
| `titleColor` | hex | Most families | Diagram and section titles |
| `edgeLabelBackground` | hex | Flowchart | Edge label box background |
| `fontFamily` | font-string | All families | CSS font stack — always quoted |
| `fontSize` | px | Flowchart, Sequence, Class, State, ER, Gantt | Global base font size |

---

## Flowchart

**Style strategy:** `full` — all themeVariables apply; classDef, linkStyle, and subgraph style also available.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `primaryColor` | hex | Node fill | Default fill for all nodes |
| `primaryTextColor` | hex | Node text | Text color on filled nodes |
| `primaryBorderColor` | hex | Node border | Default node border color |
| `lineColor` | hex | Edges | Arrow and connector color |
| `secondaryColor` | hex | Secondary nodes | Alt fill for styled nodes |
| `secondaryTextColor` | hex | Secondary nodes | Text on secondary-colored nodes |
| `secondaryBorderColor` | hex | Secondary nodes | Border for secondary nodes |
| `tertiaryColor` | hex | Tertiary nodes | Background/context node fill |
| `tertiaryTextColor` | hex | Tertiary nodes | Text on tertiary nodes |
| `tertiaryBorderColor` | hex | Tertiary nodes | Border for tertiary nodes |
| `background` | hex | Canvas | Diagram background |
| `mainBkg` | hex | Default nodes | Applied before primaryColor |
| `nodeBorder` | hex | All nodes | Fallback border color |
| `clusterBkg` | hex | Subgraphs | Subgraph fill |
| `titleColor` | hex | Titles | Diagram title and subgraph labels |
| `edgeLabelBackground` | hex | Edge labels | Box behind edge label text |
| `textColor` | hex | All text | Global text fallback |
| `fontFamily` | font-string | All text | CSS font stack |
| `fontSize` | px | All text | Base font size |

---

## Sequence Diagram

**Style strategy:** `partial` — backgrounds, actor boxes, and line colors apply. No classDef or linkStyle.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `primaryColor` | hex | Actor boxes | Actor fill |
| `primaryTextColor` | hex | Actor text | Text on actor boxes |
| `primaryBorderColor` | hex | Actor borders | Actor box border |
| `lineColor` | hex | Message arrows | Arrow color |
| `secondaryColor` | hex | Alt group backgrounds | `alt`/`else` block fill |
| `background` | hex | Canvas | Diagram background |
| `mainBkg` | hex | Actor backgrounds | Fallback actor fill |
| `nodeBorder` | hex | Boxes | Fallback border color |
| `titleColor` | hex | Title | Diagram title |
| `textColor` | hex | Labels | Global text fallback |
| `fontFamily` | font-string | All text | CSS font stack |
| `fontSize` | px | All text | Base font size |
| `actorBkg` | hex | Actor boxes | Explicit actor fill (overrides primaryColor) |
| `noteBkgColor` | hex | Note boxes | Note background fill |

---

## Class Diagram

**Style strategy:** `partial` — class box backgrounds, borders, and text apply; classDef supported.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `primaryColor` | hex | Class boxes | Class fill |
| `primaryTextColor` | hex | Class text | Text in class boxes |
| `primaryBorderColor` | hex | Class borders | Class box border |
| `lineColor` | hex | Relationships | Inheritance/association lines |
| `secondaryColor` | hex | Alt class boxes | Second-tier class fill |
| `tertiaryColor` | hex | Context classes | Background class fill |
| `background` | hex | Canvas | Diagram background |
| `mainBkg` | hex | Class boxes | Default class fill |
| `nodeBorder` | hex | Class borders | Fallback border |
| `titleColor` | hex | Title | Diagram title |
| `textColor` | hex | All text | Global text fallback |
| `fontFamily` | font-string | All text | CSS font stack |
| `fontSize` | px | All text | Base font size |

---

## State Diagram

**Style strategy:** `partial` — state boxes, transitions, and composite state backgrounds apply; classDef supported.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `primaryColor` | hex | State boxes | State fill |
| `primaryTextColor` | hex | State text | Text in state boxes |
| `primaryBorderColor` | hex | State borders | State box border |
| `lineColor` | hex | Transitions | Transition arrow color |
| `secondaryColor` | hex | Alt states | Second-tier state fill |
| `tertiaryColor` | hex | Composite states | Nested state background |
| `background` | hex | Canvas | Diagram background |
| `mainBkg` | hex | State boxes | Default state fill |
| `nodeBorder` | hex | State borders | Fallback border |
| `clusterBkg` | hex | Composite states | Composite state background |
| `titleColor` | hex | Title | Diagram title |
| `textColor` | hex | All text | Global text fallback |
| `fontFamily` | font-string | All text | CSS font stack |
| `fontSize` | px | All text | Base font size |

---

## ER Diagram

**Style strategy:** `partial` — entity backgrounds, borders, and text apply. No classDef.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `primaryColor` | hex | Entity boxes | Entity fill |
| `primaryTextColor` | hex | Entity text | Text in entity boxes |
| `primaryBorderColor` | hex | Entity borders | Entity border |
| `lineColor` | hex | Relationships | Relationship line color |
| `background` | hex | Canvas | Diagram background |
| `mainBkg` | hex | Entity boxes | Default entity fill |
| `nodeBorder` | hex | Entity borders | Fallback border |
| `titleColor` | hex | Title | Diagram title |
| `fontFamily` | font-string | All text | CSS font stack |
| `fontSize` | px | All text | Base font size |

---

## Gantt Chart

**Style strategy:** `limited` — background and grid colors apply. Individual task bar colors are managed internally and cannot be overridden via themeVariables.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `background` | hex | Canvas | Diagram background |
| `titleColor` | hex | Title | Chart title |
| `textColor` | hex | All labels | Axis and task labels |
| `fontFamily` | font-string | All text | CSS font stack |
| `fontSize` | px | All text | Base font size |
| `gridColor` | hex | Grid lines | Grid line color (if supported) |

---

## Pie Chart

**Style strategy:** `limited` — background and title colors apply. Slice colors cycle through Mermaid's internal palette and cannot be overridden.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `background` | hex | Canvas | Chart background |
| `titleColor` | hex | Title | Chart title |
| `textColor` | hex | Labels | Slice labels |
| `fontFamily` | font-string | All text | CSS font stack |

---

## Git Graph

**Style strategy:** `limited` — background colors apply. Branch and commit colors are managed internally.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `background` | hex | Canvas | Diagram background |
| `titleColor` | hex | Title | Diagram title |
| `textColor` | hex | Labels | Commit and branch labels |
| `fontFamily` | font-string | All text | CSS font stack |

---

## Mindmap

**Style strategy:** `limited` — background colors apply. Node fills are managed by the mindmap renderer.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `background` | hex | Canvas | Diagram background |
| `primaryColor` | hex | Root node | Root node fill (partial) |
| `titleColor` | hex | Title | Diagram title |
| `textColor` | hex | Labels | Node text |
| `fontFamily` | font-string | All text | CSS font stack |

---

## Timeline

**Style strategy:** `limited` — background and title colors apply. Section and event colors respond partially.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `background` | hex | Canvas | Diagram background |
| `titleColor` | hex | Title | Timeline title |
| `textColor` | hex | Labels | Event and section labels |
| `fontFamily` | font-string | All text | CSS font stack |

---

## User Journey

**Style strategy:** `limited` — background and global text colors apply. Task bar and section colors managed internally.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `background` | hex | Canvas | Diagram background |
| `titleColor` | hex | Title | Diagram title |
| `textColor` | hex | Labels | Step and actor labels |
| `fontFamily` | font-string | All text | CSS font stack |

---

## Quadrant Chart

**Style strategy:** `partial` — background, axis labels, and grid lines apply. Quadrant fills partially respond to themeVariables.

| Variable | Format | Applies to | Notes |
|---|---|---|---|
| `background` | hex | Canvas | Diagram background |
| `primaryColor` | hex | Data points | Point fill (partial) |
| `titleColor` | hex | Title | Chart title |
| `textColor` | hex | Axis labels | Axis and quadrant labels |
| `fontFamily` | font-string | All text | CSS font stack |
