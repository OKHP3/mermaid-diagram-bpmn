# Theming Integration — bpmn-beta + okhp3-mermaid-theme-builder

---

## When to Add Theming

Add a theme to a bpmn-beta diagram when:
- The user explicitly requests colors, a palette, or visual styling
- The user mentions "on-brand", "company colors", or a named palette
- The `okhp3-mermaid-theme-builder` skill is also loaded and the user is creating a formal deliverable
- The diagram will be embedded in a presentation, docs site, or report

Do **not** add a default theme to every diagram. When no theme is requested, output the diagram without any init block.

---

## Exact Syntax for Theming bpmn-beta

The `%%{init}%%` block must appear **before** the `bpmn-beta` keyword:

```
%%{init: { 'theme': 'base', 'themeVariables': { ... } }}%%
bpmn-beta
accTitle: [Title]
...
```

The `theme: 'base'` value is required when using custom themeVariables. Without it, Mermaid's default theme overrides the variables.

**Full themed example:**

```
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#0d4f6c', 'primaryTextColor': '#e8f4f8', 'primaryBorderColor': '#1a7da8', 'secondaryColor': '#1a7da8', 'secondaryTextColor': '#ffffff', 'lineColor': '#5cc8e8', 'background': '#0a2535', 'mainBkg': '#0d4f6c', 'nodeBorder': '#1a7da8', 'fontFamily': 'Segoe UI, sans-serif', 'fontSize': '14px' } }}%%
bpmn-beta
accTitle: Purchase Order Approval (Ocean Depth)

start s1 "Request Submitted"
task:user t1 "Review Request"
xor g1 "Approved?"
task:service t2 "Issue PO"
end e1 "Done"

s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> e1: "no"
t2 --> e1
```

---

## Most Impactful themeVariables for BPMN Diagrams

| Variable | What it controls in BPMN diagrams |
|---|---|
| `primaryColor` | Task fill color |
| `primaryTextColor` | Text inside tasks |
| `primaryBorderColor` | Task border color |
| `secondaryColor` | Gateway diamond fill |
| `secondaryTextColor` | Text on secondary elements |
| `lineColor` | Sequence and message flow arrow color |
| `background` | Diagram background |
| `mainBkg` | Node background (same as primaryColor in many renderers) |
| `nodeBorder` | Border color for all nodes |
| `fontFamily` | Font for all labels |
| `fontSize` | Base font size for labels |
| `edgeLabelBackground` | Background behind edge (flow) condition labels |

Variables less relevant for BPMN: `clusterBkg`, `clusterBorder` (more relevant for flowchart subgraphs).

---

## Built-in Palettes (from okhp3-mermaid-theme-builder)

### Ocean Depth

```json
{
  "primaryColor": "#0d4f6c",
  "primaryTextColor": "#e8f4f8",
  "primaryBorderColor": "#1a7da8",
  "secondaryColor": "#1a7da8",
  "secondaryTextColor": "#ffffff",
  "lineColor": "#5cc8e8",
  "background": "#0a2535",
  "mainBkg": "#0d4f6c",
  "nodeBorder": "#1a7da8",
  "fontFamily": "Segoe UI, sans-serif",
  "fontSize": "14px"
}
```

### Forest Sage

```json
{
  "primaryColor": "#2d5016",
  "primaryTextColor": "#f0f7e6",
  "primaryBorderColor": "#4a8025",
  "secondaryColor": "#4a8025",
  "secondaryTextColor": "#ffffff",
  "lineColor": "#96cc55",
  "background": "#1a2e0a",
  "mainBkg": "#2d5016",
  "nodeBorder": "#4a8025",
  "fontFamily": "Segoe UI, sans-serif",
  "fontSize": "14px"
}
```

### Slate Ember

```json
{
  "primaryColor": "#3d2b1f",
  "primaryTextColor": "#f5ede8",
  "primaryBorderColor": "#7a4f3a",
  "secondaryColor": "#7a4f3a",
  "secondaryTextColor": "#ffffff",
  "lineColor": "#d4896a",
  "background": "#1a1210",
  "mainBkg": "#3d2b1f",
  "nodeBorder": "#7a4f3a",
  "fontFamily": "Segoe UI, sans-serif",
  "fontSize": "14px"
}
```

### Violet Mist

```json
{
  "primaryColor": "#2d1b4e",
  "primaryTextColor": "#ede8f5",
  "primaryBorderColor": "#6b3fa0",
  "secondaryColor": "#6b3fa0",
  "secondaryTextColor": "#ffffff",
  "lineColor": "#b39ddb",
  "background": "#150f22",
  "mainBkg": "#2d1b4e",
  "nodeBorder": "#6b3fa0",
  "fontFamily": "Segoe UI, sans-serif",
  "fontSize": "14px"
}
```

---

## How to Invoke okhp3-mermaid-theme-builder from BPMN Skill Context

If the `okhp3-mermaid-theme-builder` skill is also loaded:

1. Complete the bpmn-beta diagram generation (Steps 1–6 of the Generation Workflow).
2. After outputting the code block, offer: "Would you like to apply a color theme to this diagram? I have the okhp3-mermaid-theme-builder skill loaded."
3. If the user accepts or names a palette, apply the palette variables as the `%%{init}%%` block prefix.
4. If the user provides custom brand colors, build a `themeVariables` object from their values.
5. Output the themed version.

The two skills compose: the BPMN skill handles structure; the theme skill handles visual styling. Neither requires the other.

---

## Worked Example: Unthemed → Themed (Ocean Depth)

**Unthemed:**

```
bpmn-beta
accTitle: Incident Triage

pool it "IT Operations" {
  lane triage "Triage" {
    start s1 "Incident Reported"
    task:user t1 "Assess Severity"
    xor g1 "Severity?"
    end e2 "Closed: Low"
  }
  lane oncall "On-Call" {
    task:user t2 "Resolve Incident"
    end e1 "Closed: High"
  }

  s1 --> t1
  t1 --> g1
  g1 --> t2: "high"
  g1 --> e2: "low"
  t2 --> e1
}
```

**Themed with Ocean Depth:**

```
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#0d4f6c', 'primaryTextColor': '#e8f4f8', 'primaryBorderColor': '#1a7da8', 'secondaryColor': '#1a7da8', 'secondaryTextColor': '#ffffff', 'lineColor': '#5cc8e8', 'background': '#0a2535', 'mainBkg': '#0d4f6c', 'nodeBorder': '#1a7da8', 'fontFamily': 'Segoe UI, sans-serif', 'fontSize': '14px' } }}%%
bpmn-beta
accTitle: Incident Triage (Ocean Depth)

pool it "IT Operations" {
  lane triage "Triage" {
    start s1 "Incident Reported"
    task:user t1 "Assess Severity"
    xor g1 "Severity?"
    end e2 "Closed: Low"
  }
  lane oncall "On-Call" {
    task:user t2 "Resolve Incident"
    end e1 "Closed: High"
  }

  s1 --> t1
  t1 --> g1
  g1 --> t2: "high"
  g1 --> e2: "low"
  t2 --> e1
}
```

The only change is the `%%{init}%%` prefix. The bpmn-beta body is identical.
