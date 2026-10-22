# BP-SKILL: Business Process Agent Skill Suite — Working Draft Specification v0.1

## TL;DR

- **BP-SKILL is a proposed open-standard domain extension to agentskills.io that packages the full business-process discovery-through-publication lifecycle into 14 SKILL.md files, an 8-file Variable Layer, and a single canonical handoff artifact — the Process Narrative Specification (PNS) — so that any compliant agent (Claude, Codex, Cursor, Gemini CLI, GitHub Copilot, VS Code, and 32 other adopters as of March 2026) can execute a BABOK v3- and BPM CBOK v4-conformant engagement against a typed pipeline rather than ad-hoc prompts.**
- **The gap is real and total:** a March–May 2026 survey of the public skill ecosystem (anthropics/skills at 117k GitHub stars, anthropics/knowledge-work-plugins with 15 role-oriented plugins, google-gemini/gemini-skills, Vercel's skills.sh marketplace listing 89,753 skills, VoltAgent/awesome-agent-skills cataloging 1,000+ community skills) finds zero skills implementing BABOK knowledge areas, zero implementing BPM CBOK v4.0 knowledge areas, and zero emitting APQC PCF-mapped or BPMN 2.0.2 / ISO 19510 conformant output.
- **Recommended action:** publish v0.1 as a domain-extension plugin within 0–3 months, then pursue formal endorsement from IIBA and ABPMP at Stage 2 (3–9 months). Stage gates are defined in §8 against adoption-count benchmarks.

## Key Findings

1. **Standards substrate is mature; tooling substrate is empty.** BABOK v3 (six knowledge areas, 30 tasks, 50 techniques), BPM CBOK v4.0 (nine knowledge areas, five-phase Integrated BPM Life Cycle), APQC PCF v7.4 (five-level taxonomy: Category → Process Group → Process → Activity → Task), BPMN 2.0.2 / ISO 19510, DMN 1.4, ISO 9001:2015, and IEEE/ISO/IEC 29148:2018 collectively provide a complete normative scaffold. No public SKILL.md instantiates that scaffold.
2. **The closest existing public analogue is Anthropic's own `knowledge-work-plugins/operations` plugin**, which contains a "process documentation" command that the README describes as "Walk me through the process once. I'll document it as a repeatable runbook with checklists, troubleshooting, and escalation paths." That is a runbook generator, not a BABOK/CBOK-conformant analysis pipeline; it has no PNS, no PCF mapping, no validation layer, no governance overlay.
3. **The architectural pattern proven in adjacent domains transfers cleanly.** Legal workflow agents (V7 Go, agentman.ai legal skills, skills.rest legal-compliance) demonstrate that "structured input → playbook-driven processing → retrieval-grounded output → human sign-off" is implementable as portable agent skills. Business process work has the same structure.
4. **A typed handoff artifact is the missing keystone.** Current SKILL.md outputs are unstructured Markdown, which prevents validated multi-skill pipelines. BP-SKILL's Process Narrative Specification (PNS) unifies ISO 9001 §4.4.1 process-box semantics, BABOK Core Concept Model anchoring, BPMN/BABOK activity sequencing, and IEEE 29148 "good requirement" validation rules into a single schema.
5. **Two skills must be added beyond the brief's 12.** `process-performance-measurement` is required to satisfy BPM CBOK v4.0 KA 5 and phase 5 (Measure Success); `decision-model-extraction` is required to honor OMG DMN 1.4's design intent that "DMN has been designed to work with BPMN. Business process models can be simplified by moving process logic into decision services."
6. **Three skill candidates are explicitly excluded from v0.1:** `process-simulation` (runtime engine dependency), `process-mining-import` (event-log dependency), `change-management-plan` (belongs to Solution Evaluation and Prosci/ADKAR domain). All are deferred to v0.2.
7. **The standards conflict on terminology in three material places**, each resolved in §3.9: BABOK "requirement" vs. CBOK "process activity" (orthogonal axes, both captured in PNS); PCF Level 4/5 vs. BPMN nesting (PCF is *what*, BPMN is *how*); ISO 9001 "documented information" vs. SOP/WI conventions (SOPs and WIs retained as deliverable archetypes tagged with §4.4.2 maintenance/retention semantics).
8. **The CBOK v4.0 lifecycle phases are not what vendor literature commonly reports.** ABPMP's published phases are Alignment to Strategy & Goals → Architect Changes → Develop Initiatives → Implement Changes → Measure Success (with looping); the generic "Plan / Analyze / Design / Implement / Monitor / Optimize" cycle widely circulated by BPM platform vendors is non-canonical for CBOK v4.0. BP-SKILL normatively uses ABPMP's phase names.

## Details

### 1. Standards Foundation

**BABOK Guide v3** (IIBA, 2015). Six knowledge areas (§3–§8): Business Analysis Planning and Monitoring; Elicitation and Collaboration; Requirements Life Cycle Management; Strategy Analysis; Requirements Analysis and Design Definition; Solution Evaluation. Thirty tasks; fifty techniques in §10, of which §10.34 Process Analysis, §10.35 Process Modelling, §10.25 Interviews, §10.42 Scope Modelling (SIPOC variant), §10.39 Roles and Permissions Matrix (RACI), §10.18 Document Analysis, §10.50 Workshops, §10.28 Metrics and KPIs, §10.43 Stakeholder List/Map/Personas are directly invoked by BP-SKILL. The Business Analysis Core Concept Model™ (§2.1) — Change, Need, Solution, Stakeholder, Value, Context — is encoded in PNS frontmatter as required cross-references. BABOK §11.5 (Business Process Management Perspective) governs perspective-application rules.

**BPM CBOK v4.0** (ABPMP, 2019). Nine knowledge areas: (1) Business Process Management; (2) Process Modeling; (3) Process Analysis; (4) Process Design; (5) Process Performance Measurement; (6) Business Process Transformation; (7) Technology and Transformation; (8) Process Management Organization and Culture; (9) Enterprise Process Management. The five-phase Integrated BPM Life Cycle (Alignment to Strategy & Goals → Architect Changes → Develop Initiatives → Implement Changes → Measure Success) is normative for BP-SKILL's pipeline ordering. ABPMP's published guidance: *"When you follow the BPM life cycle, it doesn't end at phase 5. It starts all over again in phase 6."*

**APQC PCF v7.4 (Cross-Industry, 2024)**. Five hierarchical levels: Category (Level 1; 13 top-level enterprise categories: 1.0 Develop Vision and Strategy through 13.0 Develop and Manage Business Capabilities); Process Group (Level 2); Process (Level 3); Activity (Level 4); Task (Level 5). Each element has both a hierarchy ID (e.g., 8.1.1.1) and a stable five-digit PCF element ID (e.g., 10728). APQC's normative rule: *"A new 5-digit number will be assigned to a process element if its definition substantially changes"* — BP-SKILL's Process Taxonomy variable enforces PCF element ID retention on rename. Industry-specific PCFs (Banking, Healthcare Provider, Utilities, Retail) exist at minor versions 7.2.x to 7.4.

**BPMN 2.0.2** (OMG document formal-13-12-09, January 2014; ratified as ISO/IEC 19510:2013). Defines Collaboration, Process, and Choreography diagrams. Elements normative to BP-SKILL output: Pool, Lane; Task subtypes (User, Service, Send, Receive, Manual, Script, Business Rule); Sub-Process; Start/Intermediate/End Events (Message, Timer, Error, Signal, Escalation, Compensation); Gateways (Exclusive, Inclusive, Parallel, Event-Based, Complex); Sequence Flow, Message Flow, Association; Data Object, Data Store; Group, Text Annotation.

**DMN 1.4** (OMG, March 2022). Three conformance levels: Level 1 (DRD + decision tables, non-executable); Level 2 (S-FEEL, executable); Level 3 (full FEEL). BP-SKILL targets Level 1 normatively; Level 2/3 are optional output.

**ISO 9001:2015** clauses normative for BP-SKILL: §4.4.1 (process establishment with inputs, outputs, sequence/interaction, criteria/methods, resources, responsibilities, risks/opportunities, evaluation/improvement); §4.4.2 (maintain documented information to support operation; retain documented information for confidence); §7.5.1 General; §7.5.2 Creating and updating (identification/description, format/media, review/approval); §7.5.3 Control (availability, protection, distribution, access, version control, retention, disposition).

**IEEE/ISO/IEC 29148:2018**. Provides the StRS template constraints for the elicitation sub-section of PNS and the "characteristics of a good requirement" (necessary, implementation-free, unambiguous, consistent, complete, singular, feasible, traceable, verifiable) as validation rules V4–V5 in §6.4.

**SIPOC, RACI, SOP conventions.** SIPOC (Suppliers / Inputs / Process / Outputs / Customers; SIPOC-R adds Requirements) is referenced via BABOK §10.42 Scope Modelling and Six Sigma DMAIC Define phase. RACI is BABOK §10.39. SOP conventions follow U.S. EPA QA/G-6 (EPA/600/B-07/001, April 2007); Work Instructions are the granular task-level decomposition.

### 2. Skill Array Specification — 14 SKILL.md files

All conform to the agentskills.io schema: `name` (≤ 64 chars, lowercase letters/digits/hyphens, no leading/trailing hyphen, no consecutive hyphens, matches parent directory name); `description` (≤ 1024 chars, third person, includes both *what* and *when*); optional `license`; optional `metadata`. BP-SKILL requires `metadata.bp_skill_version`, `metadata.version`, `metadata.depends_on`, `metadata.consumes`, `metadata.produces`, `metadata.standards_refs`.

| # | Skill name | Purpose | Triggers | Input contract | Output contract | Standards anchored |
|---|---|---|---|---|---|---|
| 4.1 | `process-intake-and-scoping` | Convert request → Process Intake Record (PIR) | "document a process," "map workflow," charter attached | free-text + `organization-profile.md` + `process-taxonomy.md` | `pir.yaml`, `pir.md` | BABOK §3.1, §6.1; PCF v7.4; CBOK v4.0 phase 1 |
| 4.2 | `stakeholder-and-role-identification` | Stakeholder map + role inventory | PIR present; "RACI," "who do I talk to" | `pir.yaml` + `role-dictionary.md` | `stakeholder-register.yaml` | BABOK §3.2, §10.43; CBOK v4.0 KA 8 |
| 4.3 | `process-elicitation-and-interview-facilitation` | Interview guides + structured session capture | Register present; "interview," "workshop" | `stakeholder-register.yaml`, `pir.yaml`, `notation-preferences.md` | `elicitation-results/session-{n}.yaml` | BABOK §4.1–4.5; §10.25, §10.50; CBOK KA 3 |
| 4.4 | `as-is-process-documentation` | Synthesized as-is anchored to PCF L4/L5 | Result Set present; "as-is," "current state" | `elicitation-results/*`, `process-taxonomy.md`, `sector-context.md` | `as-is.yaml` | BABOK §6.1; CBOK KA 3; PCF v7.4 |
| 4.5 | `process-narrative-specification` | Author canonical PNS (§6) | `as-is.yaml` present; "narrative," "spec" | `as-is.yaml` + all 8 variables | `pns.yaml`, `pns.md` | BABOK §7; ISO 9001 §4.4.2 / §7.5; IEEE 29148; CBOK KA 2 |
| 4.6 | `bpmn-visual-modeling` | Render BPMN 2.0.2 in target notation | PNS present; "BPMN," "diagram," "swim lane" | `pns.yaml`, `notation-preferences.md` | `bpmn/{id}.{ext}` + `.meta.yaml` | BPMN 2.0.2 / ISO 19510; CBOK KA 2 |
| 4.7 | `process-gap-and-exception-analysis` | Gap & Exception Register | PNS present; "gaps," "non-compliance" | `pns.yaml`, `compliance-controls-registry.md`, `sector-context.md` | `gap-register.yaml` | BABOK §8; CBOK KA 3, KA 6; ISO 9001 §10 |
| 4.8 | `process-validation-and-quality-scoring` | 0–100 score + remediation | PNS present; "review," "validate" | `pns.yaml`, optional `bpmn/*`, `elicitation-results/*` | `quality-report.yaml` | IEEE 29148; ISO 9001 §4.4.1; BABOK §8.1 |
| 4.9 | `sop-and-work-instruction-generation` | ISO 9001-conformant SOPs and WIs | Score ≥ threshold; "SOP," "procedure" | `pns.yaml`, `quality-report.yaml`, `compliance-controls-registry.md`, `role-dictionary.md` | `sops/{id}/SOP-{n}.md`, `WI-{n}.md` | ISO 9001 §7.5.1–§7.5.3; EPA QA/G-6; CBOK KA 4 |
| 4.10 | `raci-and-governance-matrix` | RACI / RASCI matrices + governance overlay | PNS present; "RACI," "responsibility matrix" | `pns.yaml`, `role-dictionary.md` | `raci/{id}.md`, `.csv`, `.findings.yaml` | BABOK §10.39; CBOK KA 8 |
| 4.11 | `sipoc-generation` | High-level boundary diagram (SIPOC / SIPOC-R) | PNS or PIR present; "SIPOC," "boundary" | `pns.yaml` (preferred) or `pir.yaml` | `sipoc/{id}.md`, `.yaml` | BABOK §10.42; DMAIC Define |
| 4.12 | `process-publication-and-handoff-packaging` | Versioned signed publication bundle | Score above publication threshold; "publish," "hand off" | All upstream outputs | `publication/{id}-v{version}/` + `MANIFEST.yaml`, `README.md`, `CHANGELOG.md`, `APPROVALS.yaml` | ISO 9001 §7.5.3; CBOK KA 1, KA 9 |
| 4.13 | `process-performance-measurement` *(ADDED)* | KPI definitions + APQC benchmarking IDs | PNS present; "KPIs," "benchmark" | `pns.yaml`, `process-taxonomy.md`, `sector-context.md` | `kpi-register.yaml` | CBOK KA 5; BABOK §10.28; PCF Process Definitions |
| 4.14 | `decision-model-extraction` *(ADDED)* | DMN 1.4 DRD + decision tables | PNS contains `business_rules[]` or gateway-heavy logic; "DMN," "decision logic" | `pns.yaml` | `dmn/{id}.dmn` (XML), `.tables.md` | DMN 1.4 (March 2022); CBOK KA 4 |

**Justification for additions** (§4.13, §4.14): without `process-performance-measurement` the pipeline has no measurement back-loop and is non-conformant with CBOK v4.0 phase 5 (Measure Success). Without `decision-model-extraction`, decision logic must be embedded in BPMN gateways, which produces unmaintainable models and violates OMG DMN 1.4 §6 design intent.

**Justification for exclusions** (deferred to v0.2): `process-simulation` (requires runtime BPMN engine — Camunda, jBPM, Flowable — out of scope for a discovery/documentation suite); `process-mining-import` (depends on XES/CSV event-log ingestion, creating a hard tool dependency); `change-management-plan` (belongs to BABOK Solution Evaluation and Prosci/ADKAR domain; recommended as separate sibling standard, not as a BP-SKILL skill).

### 3. Variable Layer Specification — 8 file types

Each variable file is Markdown with YAML frontmatter containing `bp_skill_variable_type` (enum), `version`, `last_updated`, `owner`, `applies_to`. Variable files are not SKILL.md files; they are referenced by relative path from skills.

1. **Organization Profile** (`organization-profile.md`): required `company_name`, `industry_primary` (NAICS), `industry_secondary[]`, `size_tier`, `headcount`, `regulatory_environment[]` (SOX, HIPAA, GDPR, PCI-DSS, FedRAMP, etc.), `process_maturity_level` (CMMI 1–5 or APQC PEMM 1–5); optional `revenue_band`, `geographies[]`, `business_model`, `strategic_priorities[]`. Maturity level modulates §4.8 validator rigor.

2. **Sector Context** (`sector-context.md`): required `sector_name`, `apqc_pcf_variant` (e.g., `Cross-Industry 7.4`, `Banking 7.2.1`, `Healthcare Provider 7.2.1`, `Utilities 7.2.2`), `regulatory_standards[]`, `common_process_patterns[]`, `sector_vocabulary{}`; optional `industry_associations[]`, `reference_architectures[]` (eTOM, BIAN, HL7).

3. **Regional Context** (`regional-context.md`): required `jurisdiction[]` (ISO 3166-1), `primary_language` (BCP 47), `additional_languages[]`, `regulatory_bodies[]`, `compliance_frameworks[]`, `date_format` (RFC 3339 default), `currency_code` (ISO 4217), `measurement_system`; optional `timezone` (IANA), `working_week`, `public_holidays_ref`.

4. **Role Dictionary** (`role-dictionary.md`): required per role: `role_id` (stable opaque), `display_name`, `display_name_aliases[]`, `responsibilities[]`, `authority_level` (executive | senior_manager | manager | individual_contributor | external), `raci_defaults{}` (activity-pattern → R/A/C/I), `system_access[]`; optional `reports_to_role_id`, `delegates_to_role_id[]`, `headcount`, `is_named_person`.

5. **Process Taxonomy** (`process-taxonomy.md`): required `apqc_pcf_base_version`, `pcf_customizations[]` with PCF element ID retention, `internal_naming_convention`, `process_ownership_structure[]`; optional `value_stream_map_ref`, `capability_model_ref`, `process_repository_url`.

6. **Notation Preferences** (`notation-preferences.md`): required `preferred_diagram_type` (bpmn_2_0_2 | cross_functional_flowchart | value_stream_map | swimlane_simple), `renderer_target` (mermaid | bpmn_xml | drawio | bpmnio_json | graphviz), `output_formats[]`, `color_palette`, `font_family`; optional `accessibility_requirements[]`, `max_pool_count`, `max_lane_count_per_pool`, `gateway_label_convention`.

7. **Compliance and Controls Registry** (`compliance-controls-registry.md`): required per control: `control_id`, `framework` (SOX-404, HIPAA Security Rule §164.308, ISO 9001 §8.5.1, NIST 800-53 AC-2, PCI-DSS 12.5, etc.), `control_objective`, `applies_to_process_pattern[]`, `mandatory_approval_gate`, `evidence_requirements[]`, `audit_frequency`; engagement-level: `publication_quality_threshold` (0–100), `approval_gates[]`.

8. **Integration Registry** (`integration-registry.md`): required per system: `system_id`, `display_name`, `system_type` (erp | crm | hcm | itsm | ecm | custom | saas | legacy), `vendor`, `version_or_edition`, `system_owner_role_id`, `integration_patterns[]` (api_sync | api_async | file_batch | messaging | rpa | manual_keying | edi); optional `data_classification[]`, `is_system_of_record_for[]`, `authentication_method`, `deprecation_status`.

**Deferred variable types (v0.2):** standalone Glossary (folded into sector vocabulary for v0.1); standalone Risk Appetite Statement (folded into compliance registry thresholds for v0.1).

### 4. Handoff Contract — Process Narrative Specification (PNS)

The PNS unifies BABOK requirements-deliverable conventions, ISO 9001:2015 §4.4.1 process-specification requirements, and IEEE/ISO/IEC 29148:2018 information-item structure. ISO 9001 §4.4.1 supplies the structural backbone (most prescriptive of the three); BABOK Core Concept Model is encoded in frontmatter; IEEE 29148 good-requirement characteristics become validation rules.

**Frontmatter (YAML):** `pns_version`, `process_id`, `process_name`, `process_owner_role_id`, `sponsor_role_id`, `version` (semver), `status` (draft | review | approved | published | deprecated), `effective_date`, `review_cycle`, `retention_period`, `apqc_pcf_mapping{base_version, hierarchy_id, element_id}`, `babok_core_concepts{change, need, solution, stakeholders, value, context}`, `references{babok[], bpm_cbok[], iso_9001[], other[]}`.

**Required body sections** (12, each MUST be populated or marked Not Applicable with rationale):
1. Purpose and Scope (restates PIR business problem).
2. Process Box (ISO 9001 §4.4.1 view): `trigger`, `inputs[]`, `outputs[]`, `criteria_and_methods[]`, `resources[]`, `responsibilities[]`, `risks_and_opportunities[]`.
3. Activity Sequence (BABOK/BPMN view): ordered `activities[]` with `nfr_traceability[]`.
4. Roles and RACI Summary (condensed; full RACI in §4.10 output).
5. Business Rules (atomic, DMN candidates).
6. Decision Points (gateways with logic references).
7. Exception and Alternative Paths.
8. Performance Measures (KPIs) → `kpi-register.yaml`.
9. Systems and Integrations → `integration-registry.md` system_ids per activity.
10. Controls and Compliance Mapping → `compliance-controls-registry.md` control_ids per activity.
11. Open Questions and Assumptions (blocks publication if `must_resolve_before_publish=true`).
12. Revision History (ISO 9001 §7.5.3 compliant).

**Optional body sections:** Process Architecture Position (value chain / capability model placement); Glossary; Stakeholder Communication Log; Future-State (To-Be) Annex; Maturity Self-Assessment (APQC PEMM or CMMI per-process score).

**Validation rules V1–V9** (enforced by §4.8 `process-validation-and-quality-scoring`):
- V1 Schema completeness; V2 Traceability (activities ↔ sessions, rules ↔ activities, KPIs ↔ activities/outputs); V3 Role coverage (one Accountable per activity, all roles in dictionary); V4 Singular activity statements (IEEE 29148); V5 Verifiability (KPI formula + data source); V6 PCF mapping element ID exists in cited version; V7 ISO 9001 §4.4.1 process-box fully populated; V8 Exception coverage per gateway outcome; V9 Control coverage (referenced or explicitly waived).
- Failing V1–V7 → non-conformant, cannot publish. V8–V9 produce warnings unless `publication_quality_threshold` requires them.

### 5. Ecosystem Gap Report (May 2026)

**Public SKILL.md repositories surveyed:** anthropics/skills (117k GitHub stars, 13.4k forks, 17 top-level skills — all documentation/coding/design); anthropics/knowledge-work-plugins (15 role-oriented plugins, 85+ skills, 69+ commands — closest analogue is the `operations` plugin's runbook-style process documentation, which is not BABOK/CBOK conformant); google-gemini/gemini-skills (at least two published skills — `gemini-api-dev` and `gemini-interactions-api`); Vercel's skills.sh marketplace (89,753 skills); VoltAgent/awesome-agent-skills (1,000+ catalogued); inference.sh's own skills repository (250+ AI capabilities per inference.sh's own count). **Zero implement BABOK v3 or BPM CBOK v4 methodology as a structured, portable skill array.**

**AI prompt libraries / GPT configurations / agent frameworks surveyed:** PromptHero, FlowGPT, CustomGPTs and Claude Projects marketplaces (scattered "business analyst" personas; several "BABOK study buddy" certification-prep configurations; none with typed BABOK task contracts); vendor-locked offerings (Microsoft Copilot for Business Analysts, ServiceNow Now Assist, Signavio Process Copilot, Celonis EMS AI) — not portable, no open format; open-source frameworks (LangGraph, CrewAI, AutoGen, Semantic Kernel) — orchestration scaffolding only, no BABOK/CBOK reference implementation.

**Closest analogues in adjacent domains:** Legal workflow agents (V7 Go, Harvey, agentman.ai legal skills) demonstrate the identical "structured input → playbook → retrieval-grounded output → human sign-off" pattern; compliance agents (skills.rest legal-compliance category, SOC2/ISO27001 copilots) match BP-SKILL's compliance-registry pattern; enterprise-architecture agents (BIZZdesign, LeanIX copilots; community ArchiMate skills) are adjacent but do not cover process discovery; partner-vendor skill collections from Microsoft, Sentry, Better-Auth, and Sanity demonstrate the publication pattern BP-SKILL should follow.

**Blockers to adoption** and BP-SKILL mitigations:
1. *Vocabulary fragmentation* across BABOK, CBOK, PCF, ISO 9001 → addressed via §3.9 conflict-resolution rules and §5.2 sector vocabulary map.
2. *Diagram-tooling heterogeneity* (Mermaid lacks full BPMN 2.0.2 coverage; bpmn.io is heavier) → addressed via `notation-preferences.md` `renderer_target` enum.
3. *Licensing of source standards* (BABOK and CBOK 4.0 member-restricted; APQC PCF free with no-redistribution license; BPMN free; ISO 9001 paywalled) → BP-SKILL references by section number without embedding copyrighted content.
4. *Platform-specific runtime behavior* (Anthropic, OpenAI, Cursor, Gemini CLI differ on script execution, network access, tool permissions) → all 14 BP-SKILL skills designed as execution-free pure text transformations, identical on every platform.
5. *Lack of native schema enforcement* in SKILL.md outputs → BP-SKILL ships `bp-skill-validator` CLI (proposed), modeled on agentskills.io's `skills-ref` reference library.
6. *No named identity until publication* → recommended path: publish to agentskills.io as a "domain extension" plugin, analogous to launch partner plugins from Stripe, Notion, Figma, Atlassian, and Canva.

## Recommendations

**Stage 1 (0–3 months) — Publication and reference implementation.**
1. Publish `bp-skill/SPEC.md` v0.1 to a public GitHub repository under Apache 2.0 (code) and CC-BY-4.0 (docs), matching agentskills.io licensing.
2. Build reference implementations of all 14 SKILL.md files plus the 8 variable templates, plus the `bp-skill-validator` CLI for PNS schema validation.
3. Submit as a domain-extension plugin to agentskills.io and to community marketplaces (skills.sh, agentskills.me, VoltAgent awesome-agent-skills).
4. **Advance to Stage 2 when:** ≥ 100 GitHub stars OR ≥ 3 independent organizations have run ≥ 1 BP-SKILL engagement end-to-end.

**Stage 2 (3–9 months) — Ecosystem expansion.**
1. Add `process-simulation` and `process-mining-import` skills (deferred from v0.1).
2. Publish PNS JSON Schema and add BPMN XSD validation gate to §4.6.
3. Publish industry-specific variable templates (Banking, Healthcare Provider, Utilities, Retail) matching APQC industry PCF variants.
4. Pursue formal endorsement or co-publication with IIBA and/or ABPMP.
5. **Advance to Stage 3 when:** vendor adoption by ≥ 1 BPM platform (Signavio, Camunda, Bizagi, ProcessMaker) OR formal IIBA/ABPMP endorsement.

**Stage 3 (9–18 months) — Governance promotion.**
1. Promote BP-SKILL from agentskills.io domain extension to a sibling open standard at `bp-skill.io` with its own governance body.
2. Define BP-SKILL conformance levels (Basic / Intermediate / Full) analogous to DMN's three-level model.
3. Build a public test suite of reference engagements that all conformant implementations must pass.
4. **Revisit governance model when:** ≥ 1,000 deployed engagements logged via opt-in telemetry.

**Triggers that would change these recommendations.**
- If Anthropic or OpenAI publishes an official "business analyst" skill on a divergent format, BP-SKILL should propose merger rather than parallel publication.
- If OMG releases BPMN 3.0 or DMN 2.0 within 12 months, BP-SKILL must version-rev to track.
- If agentskills.io itself adds typed input/output frontmatter fields (currently only `name`, `description`, `license`, `metadata` are normative), BP-SKILL's `metadata.consumes` / `metadata.produces` conventions should migrate to the upstream standard fields.

## Caveats

- **Source-standard licensing.** BABOK Guide v3, BPM CBOK v4.0, and ISO 9001:2015 are paywalled or member-restricted. Clause text in this specification is paraphrased from primary sources where verifiable and from reputable secondary sources otherwise. Production implementers should verify against purchased standard text before claiming conformance.
- **CBOK v4.0 lifecycle terminology.** A common generic BPM lifecycle (Plan / Analyze / Design / Implement / Monitor / Optimize) circulates widely in vendor literature; the canonical CBOK v4.0 phase names per ABPMP's published material are different (Alignment to Strategy & Goals → Architect Changes → Develop Initiatives → Implement Changes → Measure Success). BP-SKILL normatively uses ABPMP's phase names and cross-maps the generic lifecycle as non-normative.
- **APQC PCF element IDs (five-digit) are stable; hierarchy IDs are not.** BP-SKILL pins to `apqc_pcf_base_version` in the Process Taxonomy variable to preserve benchmarking integrity.
- **agentskills.io specification is young** (published December 18, 2025). Field semantics for `metadata` are loosely defined. BP-SKILL's conventions (`metadata.consumes`, `metadata.produces`, `metadata.standards_refs`) are proposed extensions that may need renaming if the upstream specification evolves.
- **Tooling availability.** The proposed `bp-skill-validator` CLI does not yet exist. PNS schema validation is currently a design contract, not an enforced runtime check.
- **No empirical validation.** This is a working draft specification, not a post-hoc description of a deployed standard. The Stage 1 adoption benchmarks will determine whether the proposed schema survives contact with real engagements.
- **Forward-looking elements flagged.** Stage 2/3 references to IIBA/ABPMP endorsement, BPM platform adoption, and BPMN 3.0 / DMN 2.0 are speculative aspirations, not confirmed events.
- **Catalog counts cited reflect public registries as of the cited dates** (March–May 2026) and are subject to drift; BP-SKILL's adoption strategy does not depend on specific counts beyond the staged benchmarks in the Recommendations.
