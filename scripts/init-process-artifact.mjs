#!/usr/bin/env node
/**
 * init-process-artifact.mjs
 * Scaffolds the per-process artifact output tree under artifacts/<process-id>/
 * as defined in the BP-SKILL v0.2 directory specification.
 *
 * Usage: node scripts/init-process-artifact.mjs <process-id>
 * Example: node scripts/init-process-artifact.mjs proc-001
 *
 * Creates:
 *   artifacts/<process-id>/
 *     PNS.md           — blank PNS template with v0.2 frontmatter
 *     bpmn/            — bpmn-beta diagram output
 *     dmn/             — DMN decision model output
 *     sop/             — SOP and work instruction output
 *     governance/      — RACI and governance matrix output
 *     publication/     — final publication bundle
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE      = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');

const processId = process.argv[2];

if (!processId) {
  console.error('Usage: node scripts/init-process-artifact.mjs <process-id>');
  console.error('Example: node scripts/init-process-artifact.mjs proc-purchase-approval-001');
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(processId)) {
  console.error(`Error: process-id must be lowercase alphanumeric with hyphens — got "${processId}"`);
  process.exit(1);
}

const artifactRoot = join(REPO_ROOT, 'artifacts', processId);

if (existsSync(artifactRoot)) {
  console.error(`Error: artifacts/${processId}/ already exists — will not overwrite`);
  process.exit(1);
}

const subdirs = ['bpmn', 'dmn', 'sop', 'governance', 'publication'];
const today   = new Date().toISOString().slice(0, 10);

const pnsTemplate = `---
artifact_type: process-narrative-specification
schema_version: "0.2.0"
process_id: "${processId}"
title: ""
status: draft-intake
version: "0.1.0"
owner_role: ""
sponsor_role: ""
primary_taxonomy_refs:
  - standard: APQC-PCF
    version: "7.4"
    hierarchy_id: ""
    element_id: ""
    v80_id: ""
context_refs:
  - context/organization-profile.md
  - context/role-dictionary.md
source_evidence_refs: []
babok_core_concepts:
  change: ""
  need: ""
  solution: ""
  stakeholders: []
  value: ""
  context: ""
approval_state: draft
derived_artifacts: []
confidence_score: null
last_validated_at: null
jurisdiction: ""
language: ""
---

## 1. Purpose and Outcome

_Describe the business purpose of this process and the expected outcome._

## 2. Scope and Boundaries

_Define what is in-scope, out-of-scope, and deferred._

## 3. Trigger, Preconditions, and End State

**Trigger:** _What initiates this process?_
**Preconditions:** _What must be true before this process can start?_
**End state:** _What is true when the process successfully completes?_

## 4. Roles and Stakeholders

| Role ID | Display Name | R/A/C/I |
|---------|--------------|---------|
| | | |

## 5. Systems, Data, and Interfaces

| System | Purpose | Integration Pattern |
|--------|---------|-------------------|
| | | |

## 6. Inputs and Outputs

**Inputs:**
- _List inputs_

**Outputs:**
- _List outputs_

## 7. Main Flow

| Step ID | Activity | Actor Role | Notes |
|---------|----------|-----------|-------|
| act-001 | | | |

## 8. Decision Points and Rules

| ID | Decision | Rule | Outcome |
|----|----------|------|---------|
| dp-001 | | | |

## 9. Exceptions and Variants

| ID | Condition | Handling |
|----|-----------|---------|
| exc-001 | | |

## 10. Controls and Compliance Obligations

| Control ID | Source | Step(s) | Evidence Required |
|------------|--------|---------|------------------|
| | | | |

## 11. Performance Measures (KPIs)

| KPI | Formula | Data Source | Target |
|-----|---------|------------|--------|
| | | | |

## 12. Assumptions, Issues, and Open Questions

| ID | Type | Description | must_resolve |
|----|------|-------------|-------------|
| iss-001 | assumption | | false |

## 13. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1.0 | ${today} | | Initial draft |
`;

const gitkeepDirs = subdirs.map(d => join(artifactRoot, d));
const pnsPath     = join(artifactRoot, 'PNS.md');

mkdirSync(artifactRoot, { recursive: true });
for (const d of gitkeepDirs) {
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, '.gitkeep'), '');
}
writeFileSync(pnsPath, pnsTemplate, 'utf8');

console.log(`✔ Scaffolded artifacts/${processId}/`);
for (const d of subdirs) {
  console.log(`    ${d}/`);
}
console.log(`    PNS.md  (status: draft-intake, schema_version: 0.2.0)`);
console.log(`\nNext: fill in PNS.md, then run process-intake-and-scope skill.`);
