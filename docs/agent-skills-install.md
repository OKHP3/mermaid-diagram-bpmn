# Installing BP-SKILL

Platform-specific installation instructions for the BP-SKILL v0.3 Business Process Agent Skill Suite.

---

## What the Agent Skills standard is

The [Agent Skills open standard](https://agentskills.io) defines a portable format for AI agent instruction sets. A skill is a `SKILL.md` file that declares its name, version, trigger conditions, input/output contract, and step-by-step instructions. Agent runtimes read these files at session start and activate the relevant skill when the conversation matches the declared triggers.

Skills live in a `skills/` directory within your project or in a global skills directory recognised by your agent runtime. The standard is platform-agnostic: the same SKILL.md file works in Claude Code, OpenAI Codex CLI, GitHub Copilot, Gemini CLI, Cursor, and VS Code extensions that implement the Agent Skills protocol.

BP-SKILL is a domain extension of the Agent Skills standard. The 15 skills conform to the base SKILL.md schema and add BP-SKILL-specific frontmatter fields (`bp_skill_version`, `standards_refs`, `metadata.consumes`, `metadata.produces`, `metadata.depends_on`).

---

## Installing the full suite

### Option A: Download from the browser (recommended for evaluation)

Visit [okhp3.github.io/mermaid-diagram-bpmn/skills](https://okhp3.github.io/mermaid-diagram-bpmn/skills) and use the "Download All Skills" button. This downloads a ZIP containing all 15 `SKILL.md` files and all 9 variable layer templates. Extract into your project's `skills/` and `context/` directories.

### Option B: Install individual skills via curl

```bash
# Create the target directory and download a single skill
mkdir -p skills/okhp3-process-narrative-authoring
curl -o skills/okhp3-process-narrative-authoring/SKILL.md \
  https://okhp3.github.io/mermaid-diagram-bpmn/skills/okhp3-process-narrative-authoring/SKILL.md
```

Replace `okhp3-process-narrative-authoring` with any of the 15 skill IDs listed on the [skills browser](https://okhp3.github.io/mermaid-diagram-bpmn/skills).

---

## Platform-specific installation

### Claude Code

Claude Code reads skills from the `skills/` directory of your current project, or from `~/.claude/skills/` for global installation.

**Project-level install:**

```bash
# From the root of your project
mkdir -p skills/okhp3-process-narrative-authoring
curl -o skills/okhp3-process-narrative-authoring/SKILL.md \
  https://okhp3.github.io/mermaid-diagram-bpmn/skills/okhp3-process-narrative-authoring/SKILL.md
```

**Global install (all 15 skills):**

Download the ZIP from the [skills browser](https://okhp3.github.io/mermaid-diagram-bpmn/skills), then:

```bash
unzip bp-skill-suite-v0.3.zip -d ~/.claude/skills/
```

**Verify:** Start a Claude Code session and type "I need to document a business process". Claude should respond by activating `okhp3-process-intake-and-scope` and beginning the PIR intake form.

---

### OpenAI Codex CLI

Codex CLI reads skills from the `skills/` directory of your current project or from `~/.codex/skills/` globally.

**Project-level install:**

```bash
mkdir -p skills/okhp3-process-narrative-authoring
curl -o skills/okhp3-process-narrative-authoring/SKILL.md \
  https://okhp3.github.io/mermaid-diagram-bpmn/skills/okhp3-process-narrative-authoring/SKILL.md
```

**Global install:**

```bash
mkdir -p ~/.codex/skills
# Download each skill or extract the ZIP into ~/.codex/skills/
```

**Verify:** Run `codex` in your project directory and ask it to "capture the as-is process for purchase order approval". It should activate `okhp3-as-is-process-capture` and ask structured elicitation questions.

---

### GitHub Copilot (VS Code)

Copilot reads skills from `.github/skills/` in your repository or from the VS Code settings directory.

**Repository install:**

```bash
mkdir -p .github/skills/okhp3-process-narrative-authoring
curl -o .github/skills/okhp3-process-narrative-authoring/SKILL.md \
  https://okhp3.github.io/mermaid-diagram-bpmn/skills/okhp3-process-narrative-authoring/SKILL.md
```

**Verify:** Open Copilot Chat and type "Help me document this process". Copilot should reference the skill name in its response and follow the structured intake procedure.

---

### Gemini CLI

Gemini CLI reads skills from the `skills/` directory of the current project.

```bash
mkdir -p skills/okhp3-visual-process-modeling
curl -o skills/okhp3-visual-process-modeling/SKILL.md \
  https://okhp3.github.io/mermaid-diagram-bpmn/skills/okhp3-visual-process-modeling/SKILL.md
```

**Verify:** Run `gemini` in your project and ask it to "generate a bpmn-beta diagram from this process narrative". It should activate `okhp3-visual-process-modeling` and follow the visual modeling procedure.

---

### Cursor

Cursor reads skills from `.cursorrules` or from a `skills/` directory depending on the Cursor version and Agent Skills extension installed. Check your Cursor Agent Skills extension documentation for the correct path.

```bash
# Most common path
mkdir -p skills/okhp3-stakeholder-and-role-mapping
curl -o skills/okhp3-stakeholder-and-role-mapping/SKILL.md \
  https://okhp3.github.io/mermaid-diagram-bpmn/skills/okhp3-stakeholder-and-role-mapping/SKILL.md
```

---

### Manual installation (any platform)

For any platform not listed above, or for testing:

1. Download a SKILL.md file from the [skills browser](https://okhp3.github.io/mermaid-diagram-bpmn/skills) or via curl.
2. Place it in whichever directory your agent runtime reads skills from.
3. Restart the agent session.
4. Verify by triggering a phrase that matches the skill's declared trigger conditions (listed on each skill's detail page).

---

## Verifying a skill installed correctly

A correctly installed skill activates automatically when the conversation matches its trigger conditions. You do not need to name the skill explicitly.

Signs a skill has activated:
- The agent's response references the skill name or the output artifact (e.g. "I'll start with the Process Intake Record")
- The agent follows the structured procedure described in the SKILL.md steps
- The agent produces output in the format declared in `metadata.produces`

If a skill does not activate, check:
- The `SKILL.md` file is in the correct directory for your platform
- The file is named exactly `SKILL.md` (not `skill.md` or `SKILL.MD`)
- The session was started fresh after placing the file (some runtimes cache the skills directory at session start)

---

## Installing the full suite vs individual skills

**Individual skills** are appropriate when you want to use one or two specific stages of the pipeline — for example, generating a bpmn-beta diagram from an existing process description (skill 06) or generating a SIPOC from an existing PNS.md (skill 14).

**The full suite** is appropriate when you want to run a complete process documentation engagement from intake to publication handoff. All 15 skills work together via PNS.md as the shared handoff artifact. Running the full suite in order produces a complete, validated process documentation package.

---

## Populating the variable layer

The 9 variable files in `context/` tailor the skill outputs to your organisation. Complete them in this order:

1. `organization-profile.md` — company name, industry, maturity level, process owner title, primary language
2. `role-dictionary.md` — named roles with stable IDs and RACI defaults
3. `process-taxonomy.md` — APQC PCF hierarchy mapped to your internal process names
4. `sector-context.md` — industry-specific vocabulary and regulatory standards
5. `regional-context.md` — jurisdiction, language variants, compliance frameworks
6. `compliance-controls-registry.md` — internal control IDs and GRC framework mappings
7. `integration-registry.md` — named systems with stable IDs referenced in process steps
8. `notation-preferences.md` — diagram notation, renderer target (bpmn-beta by default), palette
9. `business-glossary-and-rulebook.md` — controlled vocabulary and business rules

**Minimum viable configuration:** Files 1 and 2. The remaining 7 are optional until the skills that specifically consume them are triggered. See [docs/variable-layer-guide.md](./variable-layer-guide.md) for field-level documentation.

Download all 9 templates from the [skills browser](https://okhp3.github.io/mermaid-diagram-bpmn/skills) (Variable Layer tab).

---

## Troubleshooting

**Skill not triggering**

The trigger conditions are semantic, not keyword-matching. If the conversation does not match the trigger conditions declared in the SKILL.md `triggers` field, the skill will not activate. Try rephrasing your request to match the trigger descriptions listed on the [skill detail page](https://okhp3.github.io/mermaid-diagram-bpmn/skills). Alternatively, name the skill explicitly: "Use the okhp3-process-narrative-authoring skill to...".

**SKILL.md parse error**

If your agent runtime reports a parse error on a SKILL.md file, check that:
- The YAML frontmatter delimiters (`---`) are present and correctly formatted
- No tabs are used in the YAML block (spaces only)
- The `version` field is a string (`"0.3.0"`) not a bare number (`0.3`)
- All required frontmatter fields are present: `name`, `version`, `description`, `triggers`, `metadata`

**Missing variable file reference**

If a skill output contains placeholder text like `[see organization-profile.md]` or `[role not defined]`, the referenced variable file either does not exist or is incomplete. Check which file is referenced in the skill's `metadata.consumes` field (visible on the skill detail page) and populate the missing fields. The skill will produce generic output when variable files are absent — it will not fail.
