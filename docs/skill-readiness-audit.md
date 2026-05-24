# Skill Readiness Audit — `okhp3-bpmn-for-mermaid`

> **Date:** May 2026  
> **Auditor:** Replit Agent (automated)  
> **Purpose:** Phase 0 audit before SKILL.md scaffold — maps codebase to skill requirements and identifies what to include, exclude, and extract.

---

## 1. Existing Parser Logic

**Location:** `artifacts/mermaid-diagram-bpmn/src/lib/bpmn-parser.ts`

**Mechanism:** Line-by-line regex parser with a block context stack (`ContextEntry[]`). Each line is trimmed and matched against a priority-ordered list of regex patterns.

**Parsing order:**
1. Skip `bpmn-beta` header and bare `{` lines
2. Strip `%%` comments and Mermaid init directives
3. `accTitle:` / `accDescr:` directives
4. `}` — pops the context stack (closes pool or lane)
5. `POOL_PATTERN` — `pool [id] "[label]" {?`
6. `LANE_PATTERN` — `lane [id] "[label]" {?`
7. `NODE_PATTERN` — `(start|end|task(?::[a-z]+)?|xor|or|and) [id] "[label]"`
8. `COND_FLOW_PATTERN` — `[id] --> [id]: "[label]"`
9. `SEQ_FLOW_PATTERN` — `[id] --> [id]`
10. `DEF_FLOW_PATTERN` — `[id] ==> [id]`
11. `MSG_FLOW_PATTERN` — `[id] ~~> [id]` (top-level only — errors inside pool/lane)

**Key constraint:** Unknown lines are silently skipped — no error for unrecognized keywords.

**Parser errors (thrown):**
- Unexpected `}` with no open block
- Nested pool inside pool
- Lane outside pool
- Nested lane inside lane
- `~~>` inside a pool or lane block

---

## 2. Existing DSL Vocabulary

**Canonical source:** `artifacts/mermaid-diagram-bpmn/docs/dsl-spec.md`  
**Also reflected in:** `artifacts/mermaid-diagram-bpmn/src/pages/DslReference.tsx`

**Implemented and parsed keywords (all verified against NODE_PATTERN regex):**

| Category | Keywords |
|---|---|
| Events | `start`, `end` |
| Tasks | `task`, `task:user`, `task:service`, `task:script`, `task:receive`, `task:send` |
| Gateways | `xor`, `and`, `or` |
| Flows | `-->`, `==>`, `~~>` |
| Structure | `pool`, `lane` |
| Accessibility | `accTitle:`, `accDescr:` |

**Specified but NOT yet parsed (NODE_PATTERN does not match):**
- `event:message`, `event:timer`, `event:error` — regex `(start|end|task(?::[a-zA-Z]+)?|xor|or|and)` does not include `event:*`
- `---` association operator — not in any pattern

**ID format supported by parser:** `[A-Za-z][A-Za-z0-9_]*` — NO HYPHENS. The parser regex is `[a-zA-Z0-9_]+`. Despite some documentation suggesting kebab IDs, the parser will not parse hyphenated IDs.

---

## 3. Existing Validation Rules

No standalone validation module exists in v0.1. Validation is implicit in the parser — structural errors throw, semantic issues (orphan elements, gateway cardinality) are not checked.

**Validation gaps that must be covered by skill scripts:**
- No start event check
- No end event check
- No orphan element check
- No XOR cardinality check (≥2 outgoing, labeled)
- No AND split/join pairing check
- No cross-pool sequence flow check

---

## 4. Existing Canonical Examples

**Location:** `artifacts/mermaid-diagram-bpmn/examples/`

| File | Content | Skill-ready? |
|---|---|---|
| `purchase-order-approval.mmd` | 3-lane PO approval, XOR gateway | Yes — clean, parseable |
| `support-ticket-triage.mmd` | Support triage with gateway | Yes — with substitution for unsupported keywords |
| `employee-onboarding.mmd` | HR/IT/HM 3-lane process | Yes — clean |
| `message-flow.mmd` | Cross-pool message flow (`~~>`) | Yes — demonstrates pool isolation |
| `flat-linear.mmd` | Simple linear flat diagram | Reference only |

**Recommendation:** Use all four as canonical examples, substituting `event:message`/`event:timer` with `task:receive`/`task:service` in examples until the parser supports those keywords.

---

## 5. Files That Should Become Skill References

| Source File | Skill Reference Target |
|---|---|
| `artifacts/mermaid-diagram-bpmn/docs/dsl-spec.md` | `references/bpmn-beta-dsl-reference.md` |
| `artifacts/mermaid-diagram-bpmn/docs/decisions.md` | Background for `references/unsupported-and-deferred-features.md` |
| `artifacts/mermaid-diagram-bpmn/docs/ROADMAP.md` | Background for deferred features list |
| `artifacts/mermaid-diagram-bpmn/docs/mermaid-compatibility.md` | Background for `references/compliance-matrix.md` |
| `artifacts/mermaid-diagram-bpmn/docs/competitive-landscape.md` | Background for `references/scope-firewall.md` |
| `standards/BPMN-SPEC-REFERENCE.md` (if exists) | Background for `references/bpmn-2-element-catalog.md` |

---

## 6. Files That Must NOT Enter the Skill

| File | Reason |
|---|---|
| `attached_assets/*.txt` | Research/strategy dumps — internal only |
| `docs/as-built-prd.md` | Internal PRD iteration — not public-facing |
| `docs/prototype-to-product-retrospective.md` | Internal retrospective |
| `docs/technical-debt-register.md` | Internal debt tracking |
| Any employer-branded workflow examples | Hard constraint per build prompt |
| `_unused/` | Deleted scaffolding remnants |

---

## 7. UI-Coupled Logic That Needs Extraction

| Logic | Current Location | Extraction Needed |
|---|---|---|
| Parser | `bpmn-parser.ts` | No UI coupling — can be imported or reimplemented in .mjs scripts |
| Renderer | `bpmn-renderer.tsx` | React/SVG — DO NOT extract; skill scripts operate on text only |
| Layout engine | `bpmn-layout.ts` | Not needed for text-level validation |
| Styles | `bpmn-styles.ts` | Not needed for skill |
| Examples | `bpmn-examples.ts` | Import `?raw` — use `.mmd` files directly instead |

**Scripts can reimplement the parser logic** (regex-based, ~100 lines) in pure `.mjs` without importing TypeScript source. This avoids any TypeScript compilation step.

---

## 8. Recommended Extraction Path

| Script | Approach |
|---|---|
| `validate-bpmn-beta.mjs` | Reimplement parser regexes in .mjs; run all VR rules against parsed model |
| `normalize-bpmn-beta.mjs` | Text manipulation + call validateBpmnBeta to confirm clean output |
| `lint-process-model.mjs` | Quality heuristics on parsed model (no BPMN spec required) |
| `generate-element-inventory.mjs` | Count elements from parsed model — straightforward |

---

## Audit Verdict: Ready to Scaffold

All required inputs exist or can be derived. No blocking gaps. Key caveats to carry forward:

1. **Parser does not support `event:message`, `event:timer`, `event:error`** — mark experimental in skill, use approximations in canonical examples, issue warnings (not errors) in validator
2. **Parser does not support hyphenated IDs** — canonical examples must use underscore IDs; normalizer converts hyphens to underscores
3. **Pool/lane rendering is experimental** — documented in `references/unsupported-and-deferred-features.md`
4. **Message flow syntax is `~~>`, not `message ... -->`** — use `~~>` throughout canonical examples and scripts
