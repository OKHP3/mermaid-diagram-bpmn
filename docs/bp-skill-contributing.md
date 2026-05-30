# Contributing to BP-SKILL

Contribution guide for the BP-SKILL agent skill array. Read this before submitting a new skill, improving an existing skill, or adding eval fixtures.

---

## The Agent Skills spec requirements

Every SKILL.md must conform to the [Agent Skills open standard](https://agentskills.io). The base spec requires:

**File naming:** The file must be named exactly `SKILL.md`. The skill directory name becomes the skill's identifier (e.g., `skills/process-narrative-authoring/SKILL.md` has ID `process-narrative-authoring`). Use lowercase kebab-case.

**Required frontmatter fields:**

| Field | Type | Constraint |
|---|---|---|
| `name` | string | Human-readable name, title case, max 60 characters |
| `version` | string | Semver string: `"0.3.0"` — not a bare number |
| `description` | string | What the skill does, max 280 characters |
| `triggers` | array of strings | Semantic phrases that activate this skill |
| `metadata` | object | Must include `consumes`, `produces`, `status` |

**Description length limit:** 280 characters. This is enforced. Longer descriptions are truncated by some runtimes.

**Progressive disclosure principle:** The skill steps should front-load the most important actions. An agent that reads only the first three steps should still produce useful output. Do not bury required inputs in step 8.

---

## BP-SKILL additional requirements

Beyond the base Agent Skills spec, BP-SKILL requires the following:

**`bp_skill_version`** — Required. Declares the BP-SKILL suite version this skill targets (`"0.3"`). This field is checked by `pnpm skill:validate`.

**`metadata.consumes`** — Required. List of artifact types this skill reads as input. Valid values: `PIR`, `PNS.md`, `StakeholderRegister`, `ElicitationNotes`, `GapAnalysis`, `UserInput`, and the 9 variable file IDs (`organization-profile`, `role-dictionary`, etc.). If the skill reads nothing, declare `[]`.

**`metadata.produces`** — Required. List of artifact types this skill produces. Use the same vocabulary as `consumes`.

**`metadata.depends_on`** — Required. List of skill IDs that should complete before this skill runs. Allows tooling and documentation to enforce pipeline order. If the skill has no dependencies, declare `[]`.

**`standards_refs`** — Required. List of standard references that justify the skill's approach. Format: `"STANDARD vX.Y §Section.Number"`. Example: `"BABOK v3 §4.1"`, `"BPM CBOK v4.0 §3.2"`, `"APQC PCF v7.4 13107"`. Do not embed copyrighted text — cite section numbers only.

**`status`** — Required. One of: `core`, `extension`, `experimental`, `deprecated`.

**Pipeline position** — Required. An integer in the range 1-15 (or a future extension number beyond 15). This is the `pipeline_position` field. New skills that extend the pipeline beyond position 15 must open an issue first for discussion.

---

## How to propose a new skill

Open a GitHub issue with the following information before writing any code:

**Skill name and ID:** Lowercase kebab-case identifier and human-readable title.

**Trigger conditions:** At least 3 semantic phrases that should activate this skill. Be specific — vague triggers cause unintended activations.

**Input/output contract:** What does the skill consume? What does it produce? Use the `consumes`/`produces` vocabulary.

**Standards justification:** Which BABOK, BPM CBOK, APQC, or other standards section justifies this skill's existence in the pipeline? Skills without a standards anchor will not be accepted into the core suite.

**Pipeline position:** Where does this skill fit in the 15-skill pipeline? Which existing skill does it replace or supplement?

Issues without standards justification will not be accepted. This is not bureaucracy — it is how we prevent BP-SKILL from becoming a collection of loosely connected prompts.

---

## Writing a SKILL.md that passes pnpm skill:validate

The validator checks:

1. Frontmatter parses as valid YAML
2. All required base fields are present and non-empty
3. `version` is a valid semver string
4. `bp_skill_version` is present and matches the suite version
5. `description` is 280 characters or fewer
6. `metadata.consumes`, `metadata.produces`, `metadata.depends_on` are all arrays
7. `standards_refs` is a non-empty array (at least one reference)
8. `status` is one of the four valid values
9. All skill IDs listed in `metadata.depends_on` exist in the `skills/` directory
10. No copyrighted standards content appears in the file body (keyword match on known paywalled text fragments)

Run `pnpm --filter @workspace/mermaid-diagram-bpmn run skill:validate` locally before submitting a PR. The CI pipeline runs this check on every push.

---

## How to write eval fixtures

Every new skill and every substantive change to an existing skill requires eval fixtures. Evals live in `evals/` with the directory name matching the skill ID.

**Required fixture types:**

`pass/` — One or more input scenarios where the skill should produce high-quality output. Each fixture is a Markdown file with a YAML frontmatter block declaring the expected output characteristics and quality score threshold.

`fail/` — One or more input scenarios where the skill should identify deficiencies in the input, flag them clearly, and decline to produce incomplete output silently.

**Fixture format:**

```yaml
---
fixture_id: "pna-pass-001"
skill_id: "process-narrative-authoring"
input_description: "Complete elicitation notes for a 5-step approval process"
expected_quality_score_min: 85
expected_sections_present:
  - "process-identification"
  - "activity-sequence"
  - "decision-points"
  - "stakeholder-register"
expected_standards_cited:
  - "ISO 9001:2015"
  - "BABOK v3"
---
```

Follow the fixture body with the input text the agent would receive.

Both pass and fail fixtures are required. A new skill without both fixture types will not be merged.

---

## Standards licensing constraint

BABOK (IIBA), BPM CBOK (ABPMP), and APQC PCF are paywalled, copyrighted standards. This constraint is non-negotiable:

- Reference standards by section number and standard name only
- Do not quote, paraphrase, or reproduce standard text in any SKILL.md file or documentation
- Do not embed process classification codes from the APQC PCF beyond the ID numbers

The build-time check (`check-standards-licensing.mjs`, roadmap) will block commits that contain known fragments of copyrighted standards text.

---

## Scope firewall

This is an OverKill Hill P3 personal brand project. The following content is never acceptable in any contribution:

- Any reference to any employer, corporation, or third-party commercial entity
- Any reference to Builders FirstSource, BFS, or any related brand
- Any proprietary process content from any organisation
- Any client-specific or engagement-specific process data

If you are uncertain whether something is in scope, ask in the issue before writing it.

---

## PR checklist

Before submitting a pull request:

- [ ] `pnpm --filter @workspace/mermaid-diagram-bpmn run skill:validate` passes
- [ ] `pnpm --filter @workspace/mermaid-diagram-bpmn run test` passes with no regressions
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm build` passes
- [ ] Both pass and fail eval fixtures are present for new skills
- [ ] No standards copyrighted text is embedded anywhere in the contribution
- [ ] No employer or BFS references appear anywhere in the contribution
- [ ] `skills-registry.ts` updated if a new skill was added (the registry is the source of truth for the UI)
- [ ] `pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate` has been run to regenerate `public/skills/`
