# BP-SKILL v0.3 — Phase 1 Audit

**Date:** 2026-05-25  
**Spec:** `attached_assets/Pasted--BP-SKILL-v0-3-Replit-Revision-Prompt-Council-of-AIs-Be_1779731977489.txt`  
**Baseline:** v0.2 implementation as of commit `77e8baf`  
**Status:** Awaiting explicit owner approval before Phase 2 begins

---

## 1. Live Defect Triage

### 1a. GitHub Pages Playground 404

**URL under test:** `https://okhp3.github.io/mermaid-diagram-bpmn/playground`  
**Status:** Likely 404 (no CI ever deployed)

**Root cause (confirmed by code audit):**

- No `.github/workflows/` directory exists — the gh-pages branch has never been built with the correct `BASE_PATH`.
- `vite.config.ts` comment reads: *"GitHub Pages CI sets it to `/mermaid-diagram-bpmn/`"* — but that CI was never created.
- The Vite config correctly reads `BASE_PATH` env var: `const basePath = process.env.BASE_PATH || "/"`. Without CI, it defaults to `"/"` and every gh-pages asset resolves at the wrong path.
- The wouter router is already correctly wired: `<WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>` — no router fix needed.

**Exact fix (Phase 2):**

1. Create `.github/workflows/deploy-gh-pages.yml`:
   - Trigger: push to `main`, path filter `artifacts/mermaid-diagram-bpmn/**`
   - Build step: `BASE_PATH=/mermaid-diagram-bpmn/ pnpm --filter @workspace/mermaid-diagram-bpmn run build`
   - Deploy step: `peaceiris/actions-gh-pages` from `dist/`
   - Requires `GITHUB_PAT` secret (already in Replit environment)

### 1b. Other Broken Links / Stale References

| Surface | Issue | Severity |
|---------|-------|----------|
| README §Manual actions | GitHub repo description says `overkillhill/mermaid-diagram-bpmn` — actual remote is `OKHP3/mermaid-diagram-bpmn` (zero prefix) | Medium |
| All 19 SKILL.md `homepage:` | Points to per-skill GitHub tree URL (`/tree/main/skills/<name>`) — spec requires single project homepage | Low |
| All 19 SKILL.md `repository:` | `https://github.com/overkillhill/mermaid-diagram-bpmn` — should be `https://github.com/OKHP3/mermaid-diagram-bpmn` | Low |
| README §A | References `okhp3-process-discovery`, `okhp3-process-narrative`, `okhp3-bpmn-for-mermaid` as the skill suite — should present the 15 named BP-SKILL skills | Medium |
| README §A | `bp_skill_version: 0.2.0` throughout — needs update to 0.3.0 | Medium |
| README §A Excluded skills table | Lists BPMN XML, choreography, multi-instance — spec now names 3 different explicit excluded skills with rationale and deferral version | Medium |
| README | Section D (Adoption Blockers) entirely absent — required by v0.3 | High |
| `docs/phase1-audit-v2.md` | Prior audit doc present — no change needed, kept for history | None |

---

## 2. Surface Consistency Check

### Four-surface comparison

| Item | GitHub README | Playground UI | context/ files | skills/ SKILL.md |
|------|--------------|--------------|----------------|-----------------|
| Suite version | "BP-SKILL v0.2" | Not shown | `schema_version: "0.2.0"` | `bp_skill_version: "0.2.0"` |
| Skill count | Lists 4 okhp3-* skills | Not shown | References 3 okhp3-* | 15 named + 4 okhp3-* = 19 total |
| PNS lifecycle | Not mentioned | Not shown | `schema_version: "0.2.0"` | 9-state (v0.2) |
| Repository URL | `overkillhill/` (old) | N/A | N/A | `overkillhill/` (old) |
| Author | N/A | N/A | N/A | `OverKill Hill P³` (³ vs P3) |
| Project homepage | GitHub repo URL | N/A | N/A | Per-skill GitHub tree URL |

**Authoritative source for conflicts:** `attached_assets/Pasted--BP-SKILL-v0-3-…txt` (v0.3 spec) is the single source of truth.

### Section coverage gap

| README section | Current state | v0.3 required | Delta |
|---------------|--------------|--------------|-------|
| A — Agent Skill Suite | ✅ Present, v0.2 framing | Update to v0.3, show 15 skills | Rewrite |
| B — Why Not Just a DSL | ✅ Present | Mention `analyzed` state in 3-layer description | Minor update |
| C — Ecosystem Position | ✅ Present (tool table) | Replace with named competitor repos + evidence URLs | Rewrite |
| D — Adoption Blockers | ❌ ABSENT | All 5 blockers with mitigations | New section |

---

## 3. Asset Inventory

### Portable (non-UI) reusable assets — complete

| Asset | Location | Status |
|-------|----------|--------|
| 19 × SKILL.md | `skills/*/SKILL.md` | Portable — needs version bumps |
| 9 × context templates | `context/*.md` | Portable — needs schema version bump |
| 12 eval fixtures | `evals/*/` | Portable |
| 3 eval rubrics | `evals/*/rubric.md` | Portable |
| `validate-pns.mjs` | `skills/okhp3-process-narrative/scripts/` + `skills/process-narrative-authoring/scripts/` | Portable — needs V8 + V9 rules |
| `validate-pir.mjs` | `skills/okhp3-process-discovery/scripts/` + `skills/process-intake-and-scope/scripts/` | Portable ✅ |
| `score-pns-quality.mjs` | `skills/okhp3-process-narrative/scripts/` + `skills/process-narrative-authoring/scripts/` | Portable ✅ |
| `score-intake-completeness.mjs` | `skills/okhp3-process-discovery/scripts/` + `skills/process-intake-and-scope/scripts/` | Portable ✅ |
| `generate-stakeholder-register.mjs` | `skills/okhp3-process-discovery/scripts/` + `skills/stakeholder-and-role-mapping/scripts/` | Portable ✅ |
| `generate-raci.mjs` | `skills/okhp3-process-narrative/scripts/` + `skills/raci-and-governance-matrix-generation/scripts/` | Portable ✅ |
| `generate-sipoc.mjs` | `skills/okhp3-process-narrative/scripts/` + `skills/sipoc-generation/scripts/` | Portable ✅ |
| `extract-business-rules.mjs` | `skills/okhp3-process-narrative/scripts/` | Portable ✅ |
| `validate-bpmn-beta.mjs` | `skills/okhp3-bpmn-for-mermaid/scripts/` + `skills/visual-process-modeling/scripts/` | Portable ✅ |
| `normalize-bpmn-beta.mjs` | both above | Portable ✅ |
| `lint-process-model.mjs` | both above | Portable ✅ |
| `generate-element-inventory.mjs` | `skills/okhp3-bpmn-for-mermaid/scripts/` | Portable ✅ |
| `repair-bpmn-beta.mjs` | both above | Portable ✅ |
| `validate-dmn-traceability.mjs` | `scripts/` | Portable ✅ |
| `check-pns-status-transition.mjs` | `scripts/` | Portable — needs `deprecated` state |
| `check-scope-firewall.mjs` | `scripts/` | Portable ✅ |
| `run-eval-suite.mjs` | `scripts/` | Portable — needs 3 new eval categories |
| `validate-skills.mjs` | `scripts/` | Portable — needs 3 new checks (C19–C21), schema bump |
| `package-skills.mjs` | `scripts/` | Portable — suite ZIP rename to v0.3 |
| `init-process-artifact.mjs` | `scripts/` | Portable ✅ (new this session, already v0.3 schema) |

### UI-coupled (not portable as-is)

| Asset | Location | Notes |
|-------|----------|-------|
| React pages | `artifacts/mermaid-diagram-bpmn/src/pages/` | React + Vite — playground only |
| `BpmnRenderer.tsx` | `src/lib/bpmn-renderer.tsx` | React SVG — not extractable as SKILL asset |

---

## 4. Ecosystem Fragment Survey

The v0.3 spec names four public repos as evidence for the "white-space" claim. Findings based on publicly available information at audit date:

| Repo / Product | Format | BABOK/CBOK conformant? | Lifecycle complete? | Notes |
|----------------|--------|----------------------|--------------------|----|
| `markdown-viewer/skills` — BPMN SKILL.md | SKILL.md | No | No | PlantUML diagram generation only; no elicitation, narrative, or governance outputs |
| ClaudSkills "Bpmn" skill | SKILL.md | No | No | PlantUML wrapper; single-output, no PNS equivalent |
| MCP Market "Process Modeling" | MCP tool | No | No | Single-skill BA assistant; no cross-skill pipeline |
| `45ck/business-analysis-skills` | SKILL.md format | No | No | Uses SKILL.md format; not BABOK-section-cited; no standards_refs fields; no PNS handoff artifact |
| IBM "Bob" skills (internal) | Proprietary | Unknown | Partial | BPMN-to-agent precedent; not open; not agentskills.io |

**Conclusion:** None of the identifiable public skills constitute a lifecycle-complete, standards-conformant (BABOK v3 + BPM CBOK v4 + APQC PCF + ISO 9001) suite with a typed cross-skill handoff artifact. BP-SKILL's white-space claim is evidence-supported.

**Caveat:** URL-level confirmation of the first four repos was not possible from within Replit (no live browser). The characterisations above match the v0.3 spec's own descriptions. Owner should confirm URLs and access before citing in README.

---

## 5. Scope Firewall Check

```
pnpm skill:validate  →  249/249 passed (C10: employer name firewall — all clean)
```

Zero occurrences of BFS, "Builders FirstSource," employer colors, or employer-owned examples found in any skill package. ✅

The new `check-standards-licensing.mjs` script (Phase 2 deliverable) will add C14 to enforce that BABOK/CBOK/APQC content is only cited by section reference, never embedded.

---

## 6. Gap List — Prioritised for Phase 2

### P0 — Structural (blocks eval run or package)

| ID | Gap | Files affected | v0.3 spec ref |
|----|-----|---------------|--------------|
| G01 | `deprecated` 10th lifecycle state missing | `check-pns-status-transition.mjs`, `validate-pns.mjs` VALID_STATUSES | §PNS Status Lifecycle |
| G02 | `validate-raci.mjs` absent — RACI-V01 through V04 not enforced | `skills/raci-and-governance-matrix-generation/scripts/validate-raci.mjs` (new file) | §SKILL 13, §Scripts |
| G03 | `validate-sop.mjs` absent — SOP→PNS traceability not enforced | `skills/sop-and-work-instruction-generation/scripts/validate-sop.mjs` (new file) | §SKILL 12, §Scripts |
| G04 | `validate-wi.mjs` absent — WI→SOP→PNS chain not enforced | `skills/sop-and-work-instruction-generation/scripts/validate-wi.mjs` (new file) | §SKILL 12, §Scripts |
| G05 | `check-standards-licensing.mjs` absent — C14 check fails | `scripts/check-standards-licensing.mjs` (new file) | §Scripts, §Validation check 13 |
| G06 | 3 new eval categories absent — eval suite has 5/8 categories | `evals/sipoc-contract/`, `evals/raci-one-a-per-task/`, `evals/sop-wi-traceability/` (new dirs + fixtures) | §Eval Suite |
| G07 | `validate-pns.mjs` only has V1–V7; V8 (BPMN traceability) and V9 (open must_resolve) absent | `skills/okhp3-process-narrative/scripts/validate-pns.mjs`, `skills/process-narrative-authoring/scripts/validate-pns.mjs` | §SKILL 10 |

### P1 — Versioning (blocks correct packaging and validation)

| ID | Gap | Files affected |
|----|-----|---------------|
| G08 | `bp_skill_version: "0.2.0"` in all 19 SKILL.md — needs "0.3.0" | All 19 `skills/*/SKILL.md` |
| G09 | `homepage:` per-skill GitHub tree URL — needs `https://overkillhill.com/projects/bpmn-for-mermaid/` | All 19 `skills/*/SKILL.md` |
| G10 | `repository:` wrong username (`overkillhill` → `OKHP3`) | All 19 `skills/*/SKILL.md` |
| G11 | `author: OverKill Hill P³` — spec uses `OverKill Hill P3` (plain 3, no superscript) | All 19 `skills/*/SKILL.md` |
| G12 | `schema_version: "0.2.0"` in all 9 context files — needs "0.3.0" | All 9 `context/*.md` |
| G13 | `validate-skills.mjs` C13 hardcodes `"0.2.0"` — needs "0.3.0"; C12 pipeline missing `analyzed` state; C19–C21 absent | `scripts/validate-skills.mjs` |
| G14 | Suite ZIP still named `bp-skill-suite-complete-v0.2.zip` — needs "v0.3" | `scripts/package-skills.mjs` |

### P2 — Content (accuracy and completeness)

| ID | Gap | Files affected |
|----|-----|---------------|
| G15 | `process-taxonomy.md` — no `apqc_v74_id` / `apqc_v80_id` dual-tag fields in schema | `context/process-taxonomy.md` |
| G16 | `compliance-controls-registry.md` — no `publication_quality_threshold`, `sop_required`, `wi_required` fields | `context/compliance-controls-registry.md` |
| G17 | `organization-profile.md` — v0.3 spec uses `company_name` (not `org_name`) and adds `size_tier` and `process_maturity_level` | `context/organization-profile.md` |
| G18 | `role-dictionary.md` — no default RACI patterns by process type (adoption blocker mitigation) | `context/role-dictionary.md` |
| G19 | README §A: okhp3-* framing, v0.2, wrong excluded-skill list | `README.md` |
| G20 | README §C: generic tool table — needs named ecosystem repo evidence | `README.md` |
| G21 | README §D: entirely absent | `README.md` |
| G22 | README excluded skills table: lists 3 wrong items; v0.3 names process-mining, automation-code-gen, change-mgmt-training | `README.md` |
| G23 | GitHub Pages playground 404 — no `.github/workflows/deploy-gh-pages.yml` | new file |

---

## 7. File List for Phase 2

### New files to create

```
.github/workflows/deploy-gh-pages.yml
scripts/check-standards-licensing.mjs
skills/raci-and-governance-matrix-generation/scripts/validate-raci.mjs
skills/sop-and-work-instruction-generation/scripts/validate-sop.mjs
skills/sop-and-work-instruction-generation/scripts/validate-wi.mjs
evals/sipoc-contract/rubric.md
evals/sipoc-contract/sipoc-five-columns-correct.yaml
evals/sipoc-contract/sipoc-derives-from-pns.yaml
evals/sipoc-contract/sipoc-too-many-steps.yaml        [should fail]
evals/sipoc-contract/sipoc-missing-customers.yaml     [should fail]
evals/raci-one-a-per-task/rubric.md
evals/raci-one-a-per-task/raci-one-a-per-task-correct.yaml
evals/raci-one-a-per-task/raci-two-accountables.yaml  [RACI-V01 — should fail]
evals/raci-one-a-per-task/raci-zero-accountables.yaml [RACI-V01 — should fail]
evals/raci-one-a-per-task/raci-rasci-valid.yaml
evals/sop-wi-traceability/rubric.md
evals/sop-wi-traceability/sop-wi-fully-traced.yaml
evals/sop-wi-traceability/wi-missing-parent-sop-id.yaml   [should fail]
evals/sop-wi-traceability/wi-missing-source-step-ids.yaml [should fail]
evals/sop-wi-traceability/sop-missing-process-id.yaml     [should fail]
```

### Files to edit

```
scripts/check-pns-status-transition.mjs   [G01 — add deprecated state]
scripts/validate-skills.mjs               [G13 — schema bump, C19–C21, pipeline fix]
scripts/package-skills.mjs               [G14 — suite ZIP rename to v0.3]
scripts/run-eval-suite.mjs               [G06 — register 3 new eval categories]
skills/okhp3-process-narrative/scripts/validate-pns.mjs  [G01 + G07 — deprecated + V8 + V9]
skills/process-narrative-authoring/scripts/validate-pns.mjs  [same]
All 19 skills/*/SKILL.md                  [G08–G11 — version, homepage, repo, author]
All 9 context/*.md                        [G12 — schema_version bump]
context/process-taxonomy.md              [G15 — dual-tag fields]
context/compliance-controls-registry.md  [G16 — threshold + SOP/WI fields]
context/organization-profile.md          [G17 — field renames + additions]
context/role-dictionary.md               [G18 — default RACI patterns]
README.md                                [G19–G22 — sections A, C, D, excluded skills]
```

### No changes (already correct at v0.3)

```
scripts/check-scope-firewall.mjs          ✅
scripts/validate-dmn-traceability.mjs     ✅
scripts/init-process-artifact.mjs         ✅ (PNS template uses schema_version: "0.3.0")
All eval existing fixtures (12)           ✅ (status: modeled already set)
artifacts/mermaid-diagram-bpmn/           ✅ (React app unaffected per universal constraints)
```

---

## 8. Acceptance Delta vs v0.3 Spec

| v0.3 Acceptance Criterion | Current state | Phase 2 action |
|--------------------------|--------------|----------------|
| pnpm build passes | ✅ | No change |
| pnpm test passes | ✅ 525/525 | No change |
| skill:validate — 21 checks, 15 skills | ⚠ 249/249 (v0.2, 13 checks) | G13 + G05 |
| eval:run — 8 categories, ≥4 pass + ≥3 fail each | ⚠ 5/8 categories | G06 |
| GitHub Pages playground resolves | ❌ 404 (no CI) | G23 |
| All 15 skill packages zip cleanly | ✅ (but v0.2 name) | G14 |
| bp-skill-suite-complete-v0.3.zip | ❌ (currently v0.2) | G14 |
| Pipeline: PIR → analyzed → validated → bundle | ⚠ (missing `analyzed` in C12 label) | G13 |
| RACI-V01 enforced with named diagnostic | ❌ (validate-raci.mjs absent) | G02 |
| SIPOC 5-col + 3–7 step ceiling enforced | ⚠ (generate-sipoc exists; validation check absent) | G20, G13 |
| WI→SOP→PNS chain validated | ❌ (validate-wi.mjs absent) | G03 + G04 |
| check-standards-licensing.mjs passes | ❌ (script absent) | G05 |
| Zero employer/BFS refs | ✅ | No change |
| README all 4 sections incl. adoption blockers | ⚠ (§D absent; §A/C need rewrite) | G19–G22 |
| PNS 10-state lifecycle | ⚠ (9 states; `deprecated` missing) | G01 |
| APQC dual-tagging in process-taxonomy.md | ❌ (fields absent) | G15 |
| Excluded skills documented in README | ⚠ (wrong 3 items listed) | G22 |
| Minimal viable defaults in context/ | ⚠ (partial — org-profile missing size_tier etc.) | G17 + G18 |

---

*Phase 2 may begin once this audit is explicitly approved by the project owner.*
