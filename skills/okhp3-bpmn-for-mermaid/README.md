# okhp3-bpmn-for-mermaid — Agent Skill

Generate, validate, normalize, and explain Mermaid-native `bpmn-beta` diagrams. This skill packages the BPMN DSL generation and validation logic of [BPMN for Mermaid](https://okhp3.github.io/mermaid-diagram-bpmn/playground) for use in any SKILL.md-compatible agent platform.

> **Live Playground:** https://okhp3.github.io/mermaid-diagram-bpmn/playground  
> **GitHub Repo:** https://github.com/OKHP3/mermaid-diagram-bpmn

---

## Installation

### Claude Code

```bash
# Copy the skills folder into your project
cp -r skills/okhp3-bpmn-for-mermaid /path/to/your/project/.claude/skills/

# Or reference directly in CLAUDE.md:
# skills:
#   - path: ./skills/okhp3-bpmn-for-mermaid/SKILL.md
```

### GitHub Copilot (VS Code)

```jsonc
// .vscode/settings.json
{
  "github.copilot.chat.skills": [
    "./skills/okhp3-bpmn-for-mermaid/SKILL.md"
  ]
}
```

### Cursor

```
# .cursorrules or .cursor/rules/bpmn.md
Load skill: skills/okhp3-bpmn-for-mermaid/SKILL.md
```

### Gemini CLI

```bash
gemini chat --skill skills/okhp3-bpmn-for-mermaid/SKILL.md
```

### OpenAI Codex / Custom GPT

Upload `SKILL.md` as a knowledge file or system prompt attachment. The skill is self-contained and requires no additional setup.

---

## How to Trigger the Skill

Five example prompts that activate this skill:

1. `"Convert these process notes into a bpmn-beta diagram with pools and lanes, then validate it."`
2. `"Create a BPMN diagram for our customer onboarding workflow — it involves Sales, Legal, and IT."`
3. `"Here's my bpmn-beta code — validate it and fix any errors."`
4. `"Explain how XOR gateways work in bpmn-beta syntax with an example."`
5. `"Generate a swimlane process diagram for a purchase order approval process."`

---

## Example Output

**Input (natural language):**

> "A customer submits a support request. An agent reviews it. If it's urgent, the system pages the on-call engineer and the process ends with escalation. Otherwise, the agent resolves it and the system closes the ticket."

**Output (bpmn-beta diagram):**

```mermaid
bpmn-beta
accTitle: Support Request Handling
accDescr: Customer submits ticket; agent triages urgency; urgent tickets escalate, standard tickets are resolved.

pool support "Customer Support" {

  lane customer "Customer" {
    start s1 "Support Request Submitted"
    task:user t1 "Submit Support Ticket"
    end e2 "Ticket Escalated"
  }

  lane agent "Support Agent" {
    task:user t2 "Review Ticket"
    xor g1 "Urgent?"
    task:user t3 "Resolve Issue"
    task:service t4 "Close Ticket"
    end e1 "Ticket Closed"
  }

  lane system "System" {
    task:service t5 "Page On-Call Engineer"
  }

  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> t5: "yes"
  g1 --> t3: "no"
  t5 --> e2
  t3 --> t4
  t4 --> e1
}
```

**Elements:** 4 tasks (2 user, 2 service), 2 events (1 start, 2 end), 1 gateway, 3 lanes, 1 pool  
**Flows:** 8 sequence flows  
**Assumptions:** "Urgent" interpreted as the XOR condition; escalation ends the process (no resolution path from escalated tickets)

---

## Cross-Skill Integration

If you also have the `okhp3-mermaid-theme-builder` skill loaded, you can chain them:

1. Generate a bpmn-beta diagram with this skill
2. Apply a color theme with `okhp3-mermaid-theme-builder`

The theme builder prepends a `%%{init}%%` block to the bpmn-beta diagram. No structural changes are needed.

**Example:**

```
"Generate a bpmn-beta diagram for the purchase order approval process, then apply the Ocean Depth theme."
```

See `references/theming-integration.md` for the full palette reference and worked examples.

---

## Running the Scripts

All scripts are pure Node.js — no install required:

```bash
# Validate a bpmn-beta file
node skills/okhp3-bpmn-for-mermaid/scripts/validate-bpmn-beta.mjs path/to/diagram.mmd

# Normalize/clean a bpmn-beta file
node skills/okhp3-bpmn-for-mermaid/scripts/normalize-bpmn-beta.mjs path/to/diagram.mmd path/to/output.mmd

# Lint for process modeling quality
node skills/okhp3-bpmn-for-mermaid/scripts/lint-process-model.mjs path/to/diagram.mmd

# Count elements
node skills/okhp3-bpmn-for-mermaid/scripts/generate-element-inventory.mjs path/to/diagram.mmd
```

## Running the Tests

```bash
node --test skills/okhp3-bpmn-for-mermaid/tests/
```

---

## Structure

```
skills/okhp3-bpmn-for-mermaid/
├── SKILL.md                          — Primary skill file (load this)
├── README.md                         — This file
├── references/
│   ├── bpmn-beta-dsl-reference.md   — Formal grammar spec
│   ├── bpmn-2-element-catalog.md    — BPMN 2.0.2 Descriptive element catalog
│   ├── compliance-matrix.md         — Element support status matrix
│   ├── pool-lane-message-flow-rules.md — Containment and routing rules
│   ├── unsupported-and-deferred-features.md — Honest scope document
│   ├── theming-integration.md       — How to compose with theme builder
│   └── scope-firewall.md            — What must never appear in output
├── assets/
│   ├── element-vocabulary.json      — All bpmn-beta keywords with metadata
│   ├── validation-rules.json        — VR-001 through VR-012 rule definitions
│   └── canonical-examples/
│       ├── purchase-order-approval.bpmn-beta.mmd
│       ├── support-ticket-triage.bpmn-beta.mmd
│       ├── employee-onboarding.bpmn-beta.mmd
│       └── cross-pool-collaboration.bpmn-beta.mmd
├── scripts/
│   ├── validate-bpmn-beta.mjs       — Structural + syntax validation
│   ├── normalize-bpmn-beta.mjs      — Canonical formatting
│   ├── lint-process-model.mjs       — Quality checks
│   └── generate-element-inventory.mjs — Element count and type summary
└── tests/
    ├── validate-bpmn-beta.test.mjs
    ├── normalize-bpmn-beta.test.mjs
    └── validate-skill.test.mjs
```

---

## License

MIT — see [LICENSE](../../LICENSE) in the repository root.
