#!/usr/bin/env node
/**
 * generate-skill-files.mjs
 * Pre-build script: copies SKILL.md files and context templates into
 * public/skills/{id}/SKILL.md and public/context/ so that download
 * buttons in the React app have real static assets to fetch.
 *
 * Also generates public/pns-template.yaml.
 *
 * Run: node scripts/generate-skill-files.mjs
 * Wired into: pnpm build (runs first via "build" script in package.json)
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const artifactRoot = resolve(__dirname, '..');         // artifacts/mermaid-diagram-bpmn/
const repoRoot     = resolve(artifactRoot, '../..');   // workspace root
const skillsDir    = join(repoRoot, 'skills');         // workspace/skills/
const contextDir   = join(repoRoot, 'context');        // workspace/context/
const publicDir    = join(artifactRoot, 'public');

const publicSkillsDir  = join(publicDir, 'skills');
const publicContextDir = join(publicDir, 'context');

let copied = 0, skipped = 0;

// ─── 1. Copy SKILL.md files ─────────────────────────────────────────────────

if (!existsSync(skillsDir)) {
  console.warn(`[skill:generate] skills/ dir not found at ${skillsDir} — skipping SKILL.md copy`);
} else {
  const skillIds = readdirSync(skillsDir).filter((d) => {
    const p = join(skillsDir, d);
    try { return statSync(p).isDirectory(); } catch { return true; }
  });

  // Filter to only the 15 BP-SKILL pipeline skills (exclude okhp3-* prefixed)
  const BP_SKILL_IDS = [
    'process-intake-and-scope',
    'stakeholder-and-role-mapping',
    'elicitation-and-interview-facilitation',
    'as-is-process-capture',
    'process-narrative-authoring',
    'visual-process-modeling',
    'process-gap-and-exception-analysis',
    'future-state-and-change-strategy',
    'decision-model-authoring',
    'process-validation-and-quality-scoring',
    'process-measures-and-controls-definition',
    'sop-and-work-instruction-generation',
    'raci-and-governance-matrix-generation',
    'sipoc-generation',
    'publication-and-handoff-packaging',
  ];

  for (const id of BP_SKILL_IDS) {
    const srcFile = join(skillsDir, id, 'SKILL.md');
    const destDir = join(publicSkillsDir, id);
    const destFile = join(destDir, 'SKILL.md');

    if (!existsSync(srcFile)) {
      skipped++;
      console.warn(`  [skip] ${id}/SKILL.md — source not found`);
      continue;
    }

    mkdirSync(destDir, { recursive: true });
    copyFileSync(srcFile, destFile);
    copied++;
    console.log(`  [ok] skills/${id}/SKILL.md`);
  }
}

// ─── 2. Copy context/variable template files ────────────────────────────────

if (!existsSync(contextDir)) {
  console.warn(`[skill:generate] context/ dir not found at ${contextDir} — skipping context copy`);
} else {
  mkdirSync(publicContextDir, { recursive: true });

  const contextFiles = readdirSync(contextDir).filter((f) => f.endsWith('.md'));
  for (const filename of contextFiles) {
    const srcFile = join(contextDir, filename);
    const destFile = join(publicContextDir, filename);
    copyFileSync(srcFile, destFile);
    copied++;
    console.log(`  [ok] context/${filename}`);
  }
}

// ─── 3. Generate pns-template.yaml ──────────────────────────────────────────

const pnsTemplate = `---
# BP-SKILL v0.3 — Process Narrative Specification Template
# Source: github.com/OKHP3/mermaid-diagram-bpmn
# Built by OverKill Hill P³ — overkillhill.com
# Licensed: CC-BY-4.0

pns_schema_version: "0.3.0"
process_id: ""                    # e.g. "purchase-order-approval"
process_title: ""                 # Human-readable title
process_owner: ""                 # role_id from role-dictionary.md
version: "0.1.0"                  # Semantic version
status: "draft-intake"            # draft-intake | scoped | elicited | documented-as-is
                                  # | modeled | analyzed | validated | packaged | published | deprecated
classification: "internal"        # public | internal | confidential | restricted
apqc_id: ""                       # APQC PCF v7.4 element ID, e.g. "1.1.0"
created: ""                       # ISO 8601, e.g. "2026-01-15"
last_modified: ""                 # ISO 8601
review_due: ""                    # ISO 8601
approved_by: []                   # list of role_ids from role-dictionary.md

standards:
  primary: "ISO 9001:2015 §4.4.1"
  supporting:
    - "BABOK v3 Core Concept Model"
    - "BPM CBOK v4.0"
    - "IEEE/ISO/IEC 29148:2018"
    - "APQC PCF v7.4"
---

## 01 · Process Identification

<!-- Required. Cannot be marked N/A. -->
<!-- Document: process title, unique process ID, version, owner, classification, APQC PCF element ID. -->

process_id: ""
process_title: ""
owner_role_id: ""
apqc_pcf_element: ""

---

## 02 · Scope & Boundaries

<!-- Required. Cannot be marked N/A. -->
<!-- Document: in-scope activities, out-of-scope exclusions, trigger conditions, termination conditions, handoff points. -->

in_scope: []
out_of_scope: []
triggers: []
termination_conditions: []
handoff_points: []

---

## 03 · Stakeholder & RACI Register

<!-- Required. Cannot be marked N/A. -->
<!-- Document: all named stakeholders with role IDs, responsibilities, authority levels, RACI assignments. -->
<!-- Enforce exactly one Accountable (A) per activity. -->

stakeholders: []
# - role_id: ""
#   display_name: ""
#   raci_default: ""  # R | A | C | I

---

## 04 · Evidence & Sources

<!-- N/A allowed: only for processes documented entirely from formal SOPs with no elicitation required. -->
<!-- Document: interview participants, document references, observation sessions, confidence scores, open questions, contradiction log. -->

sources: []
confidence_score: null   # 0.0 – 1.0
open_questions: []
contradictions: []

---

## 05 · As-Is Activity Sequence

<!-- Required. Cannot be marked N/A. -->
<!-- Document: step-by-step current-state process with stable act-NNN identifiers, actor roles, system touchpoints, inputs, outputs, exception placeholders. -->

activity_sequence: []
# - step_id: "act-001"
#   actor_role_id: ""
#   action: ""
#   input: ""
#   output: ""
#   system_id: ""    # from integration-registry.md
#   exception: ""    # placeholder if undefined

---

## 06 · Business Rules & Decision Points

<!-- N/A allowed: only if the process contains zero conditional branches or policy-gated approvals. -->
<!-- Document: named decision points with stable rule-NNN IDs, decision logic, approval criteria, policy statements, gateway branch labels. -->

business_rules: []
# - rule_id: "rule-001"
#   description: ""
#   source_authority: ""
#   gateway_branch: ""

---

## 07 · System Touchpoints & Integrations

<!-- N/A allowed: for fully manual processes with no system interactions. -->
<!-- Document: all systems referenced with integration-registry IDs, interaction type, owner role, SLA. -->

system_touchpoints: []
# - system_id: ""    # from integration-registry.md
#   interaction_type: ""  # read | write | trigger
#   owner_role_id: ""
#   sla: ""

---

## 08 · Risks, Gaps & Exception Paths

<!-- N/A allowed: for new processes not yet in operation. -->
<!-- Document: failure modes, undocumented variants, bottlenecks, policy conflicts, control weaknesses. -->

risks: []
gaps: []
exceptions: []

---

## 09 · Key Performance Indicators

<!-- N/A allowed: for draft-stage processes where KPIs are deferred. -->
<!-- Document: KPI names, measurement units, baseline values, target thresholds, measurement frequency, responsible owner. -->

kpis: []
# - kpi_id: ""
#   name: ""
#   unit: ""
#   baseline: null
#   target: null
#   frequency: ""
#   owner_role_id: ""

---

## 10 · Controls & Compliance References

<!-- N/A allowed: for internal-use processes with no regulatory or audit obligations. -->
<!-- Document: control IDs, frameworks, mandatory approval gates, evidence retention requirements, audit frequencies. -->

controls: []
# - control_id: ""   # from compliance-controls-registry.md
#   source_framework: ""
#   mandatory_gate: false
#   evidence_required: ""
#   audit_frequency: ""

---

## 11 · Handoff Conditions & Approval Gates

<!-- Required. Cannot be marked N/A. -->
<!-- Document: criteria that must be met before process output is accepted, sign-off roles, approval mechanism, rejection path. -->

handoff_criteria: []
approval_roles: []
rejection_path: ""

---

## 12 · Future-State Notes

<!-- N/A allowed: for processes where no improvement or redesign is in scope. -->
<!-- Document: target-state assumptions, change strategy summary, transition path, implementation dependencies. -->
<!-- Populated by: future-state-and-change-strategy skill -->

future_state: null
change_strategy: null
transition_assumptions: []

---

## 13 · Document Control & Approvals

<!-- Required. Cannot be marked N/A. -->
<!-- Document: version history, approval signatures with timestamps, review schedule, retention policy. -->

version_history:
  - version: "0.1.0"
    date: ""
    author: ""
    summary: "Initial draft"

approval_log: []
# - role_id: ""
#   approved: false
#   timestamp: ""
#   notes: ""

next_review_due: ""
retention_policy: ""
`;

const pnsTemplatePath = join(publicDir, 'pns-template.yaml');
writeFileSync(pnsTemplatePath, pnsTemplate, 'utf8');
copied++;
console.log(`  [ok] pns-template.yaml`);

// ─── 4. Generate suite README ────────────────────────────────────────────────

const suiteReadme = `# BP-SKILL v0.3 — Business Process Agent Skill Suite

An open-standard domain extension to agentskills.io
Built by OverKill Hill P³™ — overkillhill.com
Source: github.com/OKHP3/mermaid-diagram-bpmn
Licensed MIT (code) / CC-BY-4.0 (documentation)

## What is BP-SKILL?

15 portable SKILL.md agent skills covering the full business process documentation lifecycle.
Aligned to BABOK v3, BPM CBOK v4.0, APQC PCF v7.4, BPMN 2.0.2, DMN 1.4, and ISO 9001:2015.

## Installation

Place each SKILL.md file in your agent platform's skills directory.
See agentskills.io for platform-specific install paths.

## Contents

skills/                 — 15 SKILL.md files in their respective subdirectories
context/                — 9 variable layer template files
pns-template.yaml       — Process Narrative Specification blank template

## Standards Alignment

- BABOK v3 (Business Analysis Body of Knowledge)
- BPM CBOK v4.0 (Business Process Management Common Body of Knowledge)
- APQC PCF v7.4 (Process Classification Framework)
- BPMN 2.0.2 / ISO 19510
- OMG DMN 1.4
- ISO 9001:2015

## License

Code: MIT
Documentation (SKILL.md content): CC-BY-4.0
`;

writeFileSync(join(publicDir, 'bp-skill-readme.md'), suiteReadme, 'utf8');

// ─── Done ────────────────────────────────────────────────────────────────────

console.log(`\n[skill:generate] Done — ${copied} files written, ${skipped} skipped`);
