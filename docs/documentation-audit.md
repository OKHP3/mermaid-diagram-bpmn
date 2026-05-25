# Documentation Audit
**Audited:** 2026-05-25
**Trigger:** Repo Documentation Rewrite Prompt (Phase 1)

---

## 1. Existing README.md

**Location:** `/README.md`
**Lines:** ~220
**Status:** Replaced — content did not reflect BP-SKILL v0.3 or the 15-skill suite

**Previous structure:**
- Project title + prototype disclaimer
- Project thesis (bpmn-beta gap)
- Project surfaces table (no Agent Skills Browser entry)
- Current implementation status matrix
- Standards compliance table
- Related reading
- Quick example (flat syntax, no pools)
- Getting started commands
- Agent Skill Suite section (v0.2 okhp3-* skills only — 4 skills)
- Context files table

**Gaps:**
- No mention of BP-SKILL v0.3 or the 15-skill pipeline
- Agent Skills section still described v0.2 okhp3-* skills
- No installation commands for the 15-skill suite
- No /skills route in project surfaces table
- No variable layer guide link
- Development commands used `--filter` syntax (correct but inconsistent with spec)

---

## 2. docs/ folder (pre-rewrite)

| File | Purpose | Disposition |
|---|---|---|
| `phase1-audit-v2.md` | UI audit v2 | Retained (historical reference) |
| `phase1-audit-v3.md` | UI audit v3 | Retained (historical reference) |
| `skill-readiness-audit.md` | Skills v0.2 readiness audit | Retained (historical reference) |
| `ui-integration-audit.md` | Agent Skills page UI audit | Retained (active reference) |

**New files added by this rewrite:**
- `documentation-audit.md` (this file)
- `bp-skill-overview.md`
- `agent-skills-install.md`
- `pns-schema.md`
- `variable-layer-guide.md`
- `bp-skill-contributing.md`
- `adoption-blockers.md`

---

## 3. AGENTS.md (pre-rewrite)

**Location:** `/AGENTS.md`
**Lines:** 95
**Status:** Replaced — content did not reference the 15-skill suite, Agent Skills page, or `/skills` route

Previous content described:
- Project identity and brand firewall
- Monorepo structure (accurate, retained in new version)
- Critical conventions for bpmn-beta DSL
- No mention of `skills-registry.ts`, AgentSkills page, SkillDetail page, or variable layer

---

## 4. artifacts/mermaid-diagram-bpmn/AGENTS.md

**Status:** Not modified by this rewrite — contains artifact-specific parser/renderer rules

---

## 5. .github/

| File | Status |
|---|---|
| `.github/copilot-instructions.md` | Not modified — brand firewall and identity rules retained |
| `.github/dependabot.yml` | Not modified |
| `.github/FUNDING.yml` | Not modified |
| `.github/workflows/deploy-gh-pages.yml` | Created in previous session (Agent Skills build) |

---

## 6. CONTRIBUTING.md

**Status:** Exists, not replaced. The new `docs/bp-skill-contributing.md` covers BP-SKILL-specific contribution rules. CONTRIBUTING.md covers the broader project. No changes made in this rewrite pass.

---

## 7. LICENSE

**Status:** MIT License, copyright Jamie Hill 2026. Not modified.

---

## 8. skills/ directory

15 directories: one per BP-SKILL pipeline skill (process-intake-and-scope through publication-and-handoff-packaging). Each contains a `SKILL.md` file at v0.3.0 schema. See `docs/bp-skill-overview.md` for the complete skill list.

---

## 9. context/ directory

9 Markdown template files (schema v0.2.0): business-glossary-and-rulebook.md, compliance-controls-registry.md, integration-registry.md, notation-preferences.md, organization-profile.md, process-taxonomy.md, regional-context.md, role-dictionary.md, sector-context.md.
