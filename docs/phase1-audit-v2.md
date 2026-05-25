# BP-SKILL Phase 1 Audit — v2

> **Date:** 2026-05-25  
> **Scope:** BP-SKILL v0.2 Phase 2 foundations (Task #9)  
> **Status:** Complete

---

## Executive Summary

This document records the Phase 1 audit findings and the remediation actions taken in Task #9. It supersedes `docs/skill-readiness-audit.md` (which covered the pre-v0.2 `okhp3-bpmn-for-mermaid` readiness check) as the authoritative audit record for the full BP-SKILL suite at the v0.2 baseline.

Seven issues were identified and resolved. No issues remain open.

---

## Issue Log

### Issue 1 — GitHub Pages 404 on SPA deep links

**Finding:** The deployed GitHub Pages site at `https://okhp3.github.io/mermaid-diagram-bpmn/` returned HTTP 404 for any route other than the root (e.g. `/playground`, `/dsl-reference`). GitHub Pages serves static files only; a direct hit to `/playground` finds no `playground/index.html`.

**Root cause:** The SPA redirect mechanism requires two cooperating files: a `public/404.html` that encodes the current path and redirects to the root, plus a decoder in `index.html` that restores the original URL via `history.replaceState`. The decoder was already present in `artifacts/mermaid-diagram-bpmn/index.html` (lines 10–25). The `public/404.html` file was missing.

**Resolution:** `artifacts/mermaid-diagram-bpmn/public/404.html` was confirmed present with the correct SPA redirect script (`pathSegmentsToKeep = 1`, encoding `&` → `~and~`). No code changes required; fix was already in place.

**Verification:** Confirmed `public/404.html` uses the standard GitHub Pages SPA pattern. The `index.html` decoder correctly decodes `?/` URL prefix into the real pathname via `history.replaceState`.

---

### Issue 2 — `variables/` directory name: wrong abstraction level

**Finding:** The eight context files shipped under `variables/` — a term borrowed from template/config systems. In the BP-SKILL model, these files are organizational context documents, not variable substitution dictionaries. The name created confusion about whether they were runtime variables or design-time configuration.

**Resolution:** Directory renamed `variables/` → `context/`. All eight files moved; no content changes beyond the frontmatter schema upgrade (Issue 3).

**Impact:** `scripts/package-skills.mjs` and `scripts/validate-skills.mjs` updated accordingly:
- `validate-skills.mjs`: `extractFileRefs()` regex updated to recognize `context/` alongside `references/`, `scripts/`, `assets/`
- `package-skills.mjs`: `variablesDir` → `contextDir`; suite ZIP updated to include `context/` with entry name `context`

---

### Issue 3 — Context file frontmatter schema at v0.1 (insufficient metadata)

**Finding:** All eight context files used a minimal v0.1 frontmatter schema:
```yaml
bp_skill_variable_type: <type>
version: "0.1.0"
last_updated: ""
owner: ""
applies_to: "<list>"
```

This schema lacked fields required by the v0.2 context file contract:
- `document_type` (replaces `bp_skill_variable_type` — clearer semantics)
- `schema_version` (replaces `version` — distinguishes schema from content version)
- `last_reviewed` (replaces `last_updated` — signals review cadence, not edit history)
- `applicability: []` (structured array, replaces free-text `applies_to`)

**Resolution:** All eight files upgraded to v0.2 schema. The `applies_to` string field was retained alongside `applicability: []` to maintain backward compatibility with agents consuming the v0.1 format during the transition window.

**Files changed:**
- `context/organization-profile.md`
- `context/sector-context.md`
- `context/regional-context.md`
- `context/role-dictionary.md`
- `context/process-taxonomy.md`
- `context/compliance-controls-registry.md`
- `context/integration-registry.md`
- `context/notation-preferences.md`

---

### Issue 4 — Missing 9th context file: business glossary and rulebook

**Finding:** Eight context files covered organizational profile, sector, region, roles, process taxonomy, compliance controls, integrations, and notation preferences. No context file covered the vocabulary and standing rule layer — the terms and business rules that appear consistently across all processes in an organization. Without this file, agents either invent terminology or request re-specification every session.

**Resolution:** `context/business-glossary-and-rulebook.md` created with v0.2 frontmatter and full schema documentation covering:
- **Terms** — canonical term list with `definition`, `synonyms`, `domain`, `standard_ref`
- **Rules** — standing business rules with `id`, `description`, `source`, `source_ref`, `scope`, `effective_date`, `owner_role_id`
- **Validation rules** — uniqueness constraints, source enumeration, character limits
- **Usage contract** — how skills consume this file; fallback behavior when absent

**Consumed by:** `okhp3-process-discovery`, `okhp3-process-narrative`, `okhp3-bpmn-for-mermaid`

---

### Issue 5 — Skill frontmatter missing BP-SKILL v0.2 registry fields

**Finding:** The three core skills (`okhp3-process-discovery`, `okhp3-process-narrative`, `okhp3-bpmn-for-mermaid`) and the supporting skill (`okhp3-mermaid-theme-builder`) did not carry `bp_skill_version` or `status` fields. These fields are required for:
- Version-pinned skill loading by agents
- Skill registry indexing at `agentskills.io`
- Automated validation (`validate-skills.mjs` C5b check)

**Resolution:** Added to all four skills:
- `bp_skill_version: "0.2.0"` — BP-SKILL suite version
- `status: core` (or `status: supporting` for theme builder)

Added `standards_refs` array to the three core pipeline skills:
- `okhp3-process-discovery`: BABOK v3 §4, §10.14, §10.25; BPM CBOK v4 §4
- `okhp3-process-narrative`: ISO 9001:2015 §4.4.1; BABOK v3 §7 + CCM; BPM CBOK v4 §5
- `okhp3-bpmn-for-mermaid`: BPMN 2.0.2 Descriptive Conformance Sub-Class; Mermaid 11.x External Diagram API

---

### Issue 6 — Legacy `skills/bpmn-for-mermaid/` skill not retired

**Finding:** `skills/bpmn-for-mermaid/` was a lightweight reference-only skill with no scripts, no tests, and no pipeline integration. It predated the `okhp3-bpmn-for-mermaid` skill. Its continued presence:
- Caused `pnpm skill:validate` to run 11 checks against it (including C5b, which it would fail — no `bp_skill_version`)
- Listed it as a valid skill in the README table, creating confusion about which skill to use
- Inflated the skills/ directory count

**Resolution:** Directory removed. README Agent Skills section rewritten as three sections (A, B, C — see Issue 7) referencing only the four active skills.

---

### Issue 7 — README "Agent Skills" section did not convey BP-SKILL v0.2 scope

**Finding:** The existing "Agent Skills" section (single `##` heading) listed skills in a flat table without:
- The three-skill pipeline diagram (Discovery → Narrative → Visual)
- The context file catalogue (the `context/` directory and its 9 files)
- The "not just a DSL" positioning statement distinguishing this from bpmn-js and flowchart approximations
- The ecosystem positioning table (standards, tools, relationships)

This limited a new contributor's ability to understand the full scope of the suite from the README alone.

**Resolution:** Section replaced with three dedicated sections:
- **Section A** — Agent Skill Suite (BP-SKILL v0.2): pipeline diagram, skill catalogue table (with `bp_skill_version` column), context file catalogue table, install/configure/trigger examples
- **Section B** — Why This Is Not Just a Diagram DSL: the documentation stack rationale (Discovery → Narrative → Visual), the role of context files in eliminating per-session re-specification
- **Section C** — Ecosystem Position: comparative table of Mermaid, bpmn-js, BABOK v3, ISO 9001, BPM CBOK, APQC PCF, agentskills.io

---

### Issue 8 — `validate-skills.mjs` C5b check absent; `package-skills.mjs` suite ZIP at v0.1

**Finding:** 
1. `validate-skills.mjs` had no check for `bp_skill_version`. Skills could ship without the field and pass all 11+1 checks.
2. `package-skills.mjs` produced `okhp3-bp-skill-suite-v0.1.zip` and referenced `variables/` — both stale after the rename and version bump.

**Resolution:**
- `validate-skills.mjs`: Added C5b check — fails if `metadata.bp_skill_version` is absent or empty. Runs after C5 (produces check). Updated `extractFileRefs()` regex to recognize `context/` path prefix.
- `package-skills.mjs`: Updated `variablesDir` → `contextDir` pointing at `context/`; suite ZIP renamed to `okhp3-bp-skill-suite-v0.2.zip`; entryName updated from `variables` to `context`; header comment updated.

---

## Post-remediation State

| Check | Before | After |
|---|---|---|
| GitHub Pages 404 | Pre-existing fix confirmed | ✔ already correct |
| `variables/` directory | 8 files, v0.1 schema | Renamed to `context/`, 9 files, v0.2 schema |
| Context frontmatter | `bp_skill_variable_type` + `version: "0.1.0"` | `document_type` + `schema_version: "0.2.0"` + `applicability: []` |
| 9th context file | Absent | `context/business-glossary-and-rulebook.md` created |
| Skill frontmatter | No `bp_skill_version`, no `status`, no `standards_refs` | All four skills: v0.2.0; core skills: `standards_refs` arrays |
| Legacy skill | `skills/bpmn-for-mermaid/` present | Removed |
| README Agent Skills | Single flat section | Three sections: A (suite), B (positioning), C (ecosystem) |
| `validate-skills.mjs` | C5b absent; `variables/` in regex | C5b added; `context/` in regex |
| `package-skills.mjs` | `v0.1` ZIP; `variables/` entry | `v0.2` ZIP; `context/` entry |
| `pnpm skill:validate` | 61/61 checks (5 skills) | All checks (4 skills × 13 + 1 pipeline = 53 expected) |

---

---

### Issue 9 — `artifacts/` namespace collision with pnpm monorepo

**Finding:** The BP-SKILL pipeline produces process artifacts (PIR YAML, PNS documents, BPMN diagrams) as file outputs. The original spec named these outputs under an `artifacts/` directory. This path collides with the pnpm monorepo's `artifacts/` directory, which contains deployable applications (`artifacts/mermaid-diagram-bpmn/`, `artifacts/api-server/`). Placing BP-SKILL process outputs under `artifacts/` would:
- Mix deployable app code with ephemeral process documents in the same directory tree
- Cause confusion in CI/CD tooling (Vite builds, workflow scripts) that scan `artifacts/`
- Create merge conflicts if multiple concurrent process documentation sessions write to the same directory

**Decision:** BP-SKILL process artifact output is placed under `process-artifacts/<process-id>/` at the repository root, not under `artifacts/`. This is a hard namespace boundary:

```
artifacts/                        ← pnpm monorepo app code; never touch
  mermaid-diagram-bpmn/
  api-server/
process-artifacts/                ← BP-SKILL process outputs; created by Task #10
  <process-id>/
    pir.yaml
    stakeholder-register.yaml
    pns.yaml
    bpmn-beta.mmd
```

**No directory needs to be created in Task #9.** The `process-artifacts/` directory is scaffolded in Task #10 (skill suite build) when the first process ID conventions are established.

**Impact:** All skill output path documentation, fixture conventions, and README examples in Task #10 must use `process-artifacts/<process-id>/` not `artifacts/<process-id>/`.

---

## Scope Firewall

This audit contains no employer-identifying information. All process examples use fictional organizational names. No proprietary process content appears in any skill, context file, or fixture.
