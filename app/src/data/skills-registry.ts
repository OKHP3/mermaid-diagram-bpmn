export interface PipelineLayer {
  id: number;
  label: string;
  color: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  displayName: string;
  status: "core" | "recommended-extension";
  layer: number;
  layerLabel: string;
  pipelineOrder: number;
  description: string;
  purpose: string;
  triggerPhrases: string[];
  consumes: string[];
  produces: string[];
  dependsOn: string[];
  standardsRefs: string[];
  tags: string[];
  compatibleWith: string[];
  skillMdPreview: string;
}

export interface VariableFile {
  id: string;
  filename: string;
  displayName: string;
  description: string;
  requiredFields: string[];
  usedBy: string[];
}

export interface PnsLifecycleState {
  status: string;
  setBy: string;
  order: number;
}

export interface PnsSection {
  number: number;
  title: string;
  documents: string;
  standard: string;
  naCondition: string | null;
}

export const PIPELINE_LAYERS: PipelineLayer[] = [
  { id: 1, label: "Discovery",       color: "#4A9EBF", description: "Intake, stakeholder mapping, elicitation" },
  { id: 2, label: "Narrative",       color: "#7B68EE", description: "As-is capture, PNS authoring, gap analysis, validation" },
  { id: 3, label: "Visual Modeling", color: "#5BA08A", description: "BPMN diagrams, DMN decision tables" },
  { id: 4, label: "Operational",     color: "#CC8B30", description: "SOPs, Work Instructions, measures" },
  { id: 5, label: "Governance",      color: "#C0645A", description: "RACI matrices, SIPOC" },
  { id: 6, label: "Publication",     color: "#777777", description: "Versioned bundled handoff" },
];

const COMPATIBLE_PLATFORMS = [
  "Claude Code", "OpenAI Codex", "GitHub Copilot",
  "Gemini CLI", "Cursor", "VS Code",
];

function installCmd(id: string): string {
  return `# In your agent's skills/ directory:\nmkdir -p skills/${id} && \\\ncurl -o skills/${id}/SKILL.md \\\n  https://raw.githubusercontent.com/OKHP3/mermaid-diagram-bpmn/main/skills/${id}/SKILL.md`;
}

function previewFrontmatter(id: string, displayName: string, status: string, layer: string, produces: string, consumes: string, dependsOn: string[]): string {
  return `---\nname: ${id}\ndescription: "<see registry for the full task and trigger description>"\nlicense: "MIT"\ncompatibility: "Requires a skills-compatible agent; bundled scripts run locally with Node.js and no network access."\nmetadata:\n  bp_skill_version: "0.3.0"\n  status: "${status}"\n  version: "0.1.0"\n  author: "OverKill Hill P³"\n  project: "BP-SKILL: Business Process Agent Skill Suite"\n  category: "${layer}"\n  produces: "${produces}"\n  consumes: "${consumes}"\n  depends_on: "${dependsOn.join(", ")}"\n  homepage: "https://github.com/OKHP3/mermaid-diagram-bpmn/tree/main/skills/${id}"\n  repository: "https://github.com/OKHP3/mermaid-diagram-bpmn"\n---\n\n## Purpose\n\n## When to Use\n\n## When NOT to Use\n\n## Trigger Conditions\n\n## Required Workflow\n\n## Input Contract\n\n## Output Contract\n\n## Standards References\n\n## Handoff`;
}

export const SKILLS: Skill[] = [
  {
    id: "okhp3-process-intake-and-scope",
    name: "okhp3-process-intake-and-scope",
    displayName: "Process Intake & Scope",
    status: "core",
    layer: 1,
    layerLabel: "Discovery",
    pipelineOrder: 1,
    description: "Establish the process candidate, request type, sponsor, business objective, in-scope and out-of-scope boundaries, urgency, target audience, and initial APQC PCF taxonomy placement. Use this skill when a user makes any request to discover, document, improve, audit, hand off, or publish a business process.",
    purpose: "Every BP-SKILL pipeline run begins here. This skill transforms an unstructured process request into a structured Process Intake Record (PIR) that downstream skills can consume without ambiguity. It also sets PNS.md to status: draft-intake, opening the lifecycle.",
    triggerPhrases: ["document a process", "map a workflow", "define process scope", "what processes do we have", "I need to capture how we do X"],
    consumes: ["request brief", "organization-profile.md", "process-taxonomy.md (optional)"],
    produces: ["PNS.md [draft-intake]", "pir.yaml"],
    dependsOn: [],
    standardsRefs: ["BABOK v3 §3.1–3.4", "BABOK v3 §6.1", "BPM CBOK v4.0 Phase 1 (Alignment to Strategy and Goals)", "APQC PCF v7.4"],
    tags: ["discovery", "intake", "scope", "babok", "apqc", "pir", "process-boundary"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-process-intake-and-scope", "Process Intake & Scope", "core", "Discovery", "pir.yaml, scope-statement.md", "request-brief.md, organization-profile.md, process-taxonomy.md (optional)", []),
  },
  {
    id: "okhp3-stakeholder-and-role-mapping",
    name: "okhp3-stakeholder-and-role-mapping",
    displayName: "Stakeholder & Role Mapping",
    status: "core",
    layer: 1,
    layerLabel: "Discovery",
    pipelineOrder: 2,
    description: "Identify named stakeholders, operational roles, decision authorities, handoff owners, and separation-of-duties implications. Use this skill when a scoped process involves more than one role or crosses a functional boundary.",
    purpose: "Stakeholder and role clarity is a prerequisite for every downstream skill that references RACI, approval gates, or system ownership. This skill produces a structured stakeholder register aligned to BABOK §3.2 and populates the stakeholder_register section of PNS.md.",
    triggerPhrases: ["who owns this process", "identify stakeholders", "RACI for this process", "who do I talk to", "map roles and responsibilities"],
    consumes: ["PNS.md [draft-intake]", "role-dictionary.md", "organization-profile.md"],
    produces: ["PNS.md [scoped] with stakeholder register"],
    dependsOn: ["okhp3-process-intake-and-scope"],
    standardsRefs: ["BABOK v3 §3.2", "BABOK v3 Technique §10.39", "BABOK v3 Technique §10.43", "BPM CBOK v4.0 KA 8", "BPMN 2.0.2 Clause 10.8"],
    tags: ["stakeholder", "raci", "roles", "discovery", "babok", "governance", "separation-of-duties"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-stakeholder-and-role-mapping", "Stakeholder & Role Mapping", "core", "Discovery", "stakeholder-register.yaml", "pir.yaml, role-dictionary.md, organization-profile.md", ["okhp3-process-intake-and-scope"]),
  },
  {
    id: "okhp3-elicitation-interviews",
    name: "okhp3-elicitation-interviews",
    displayName: "Elicitation & Interview Facilitation",
    status: "core",
    layer: 1,
    layerLabel: "Discovery",
    pipelineOrder: 3,
    description: "Run structured discovery interviews, workshops, or observation-guided sessions that surface the actual process, not the idealised one. Use this skill when a scoped process has incomplete factual evidence or when interviews or workshops are requested.",
    purpose: "Raw process knowledge lives in stakeholders' heads. This skill provides a structured protocol for extracting it — question plans, confidence scoring, contradiction logging, and open-question tracking — so that the as-is capture that follows rests on attributed evidence rather than assumptions.",
    triggerPhrases: ["interview the stakeholders", "facilitate a workshop", "what questions should I ask", "help me run discovery", "elicit the requirements"],
    consumes: ["PNS.md [scoped]", "stakeholder register", "sector-context.md"],
    produces: ["PNS.md [elicited] with source-attributed evidence, contradiction log, confidence scores, open questions"],
    dependsOn: ["okhp3-process-intake-and-scope"],
    standardsRefs: ["BABOK v3 §4", "BABOK v3 Technique §10.25", "BABOK v3 Technique §10.50", "BABOK v3 Technique §10.18", "BPM CBOK v4.0 KA 3"],
    tags: ["elicitation", "interview", "workshop", "discovery", "babok", "facilitation", "sme"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-elicitation-interviews", "Elicitation & Interview Facilitation", "core", "Discovery", "question-plan.yaml, elicitation-notes.md", "pir.yaml, scope-statement.md, sector-context.md", ["okhp3-process-intake-and-scope"]),
  },
  {
    id: "okhp3-as-is-process-capture",
    name: "okhp3-as-is-process-capture",
    displayName: "As-Is Process Capture",
    status: "core",
    layer: 2,
    layerLabel: "Narrative",
    pipelineOrder: 4,
    description: "Transform elicited evidence into a normalised current-state process representation with stable step IDs. Use this skill when sufficient evidence exists to describe the current process steps, actors, triggers, and outputs.",
    purpose: "Before improvement or redesign is possible, the current state must be documented with precision. This skill normalises evidence into a canonical activity sequence with stable act-NNN step identifiers, exception placeholders, and system touchpoints that all downstream skills can reference unambiguously.",
    triggerPhrases: ["document the current state", "as-is process", "capture the existing workflow", "map how it works today", "baseline the process"],
    consumes: ["PNS.md [elicited]", "optional SOPs/screenshots/BPMN files"],
    produces: ["PNS.md [documented-as-is] with act-NNN step IDs, exception placeholders, system touchpoints"],
    dependsOn: ["okhp3-process-intake-and-scope"],
    standardsRefs: ["BABOK v3 §7.1–7.3", "BPM CBOK v4.0 KA 2 (Process Modeling)", "BPM CBOK v4.0 KA 3 (Process Analysis)"],
    tags: ["as-is", "current-state", "baseline", "capture", "process-documentation", "step-ids"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-as-is-process-capture", "As-Is Process Capture", "core", "Narrative", "as-is-process.yaml", "pir.yaml", ["okhp3-process-intake-and-scope"]),
  },
  {
    id: "okhp3-process-narrative-authoring",
    name: "okhp3-process-narrative-authoring",
    displayName: "Process Narrative Authoring",
    status: "core",
    layer: 2,
    layerLabel: "Narrative",
    pipelineOrder: 5,
    description: "Author the canonical Process Narrative Specification (PNS.md) — the expository prose document that drives the entire suite. Use this skill when as-is process capture is materially complete and a formally structured narrative document is needed.",
    purpose: "PNS.md is the single handoff artifact that every downstream skill reads. This skill produces it in full: ISO 9001 §4.4.1 conformant, 13 required sections complete, versioned, and aligned to BABOK Core Concept Model, SIPOC, RACI, business rules, decision points, KPIs, and controls. Nothing runs downstream without a modeled PNS.",
    triggerPhrases: ["write the process narrative", "author the PNS", "document this formally", "write the process specification", "create the process document"],
    consumes: ["PNS.md [documented-as-is]", "business-glossary-and-rulebook.md"],
    produces: ["PNS.md [modeled] — versioned, ISO 9001 §4.4.1 conformant, 13 required sections complete"],
    dependsOn: ["okhp3-process-intake-and-scope", "okhp3-stakeholder-and-role-mapping"],
    standardsRefs: ["BABOK v3 §7.1–7.6", "ISO 9001:2015 §4.4.1", "ISO 9001:2015 §7.5", "IEEE/ISO/IEC 29148:2018", "BPM CBOK v4.0 KA 2"],
    tags: ["pns", "narrative", "iso9001", "babok", "raci", "sipoc", "business-rules", "kpis", "process-documentation"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-process-narrative-authoring", "Process Narrative Authoring", "core", "Narrative", "pns.yaml, pns.md", "pir.yaml, stakeholder-register.yaml, business-glossary-and-rulebook.md", ["okhp3-process-intake-and-scope", "okhp3-stakeholder-and-role-mapping"]),
  },
  {
    id: "okhp3-visual-process-modeling",
    name: "okhp3-visual-process-modeling",
    displayName: "Visual Process Modeling",
    status: "core",
    layer: 3,
    layerLabel: "Visual Modeling",
    pipelineOrder: 6,
    description: "Generate conforming visual models from the Process Narrative Specification. Use this skill when a complete PNS.md exists and a BPMN diagram, bpmn-beta rendering, or other visual representation is requested.",
    purpose: "A modeled PNS contains all the semantic information needed for a visual process model. This skill reads PNS.md and generates a bpmn-beta diagram conforming to BPMN 2.0.2 descriptive subset, with swim lanes, gateways, sequence flows, and message flows derived directly from the narrative — not improvised.",
    triggerPhrases: ["create a BPMN diagram", "visualise this process", "draw the swim lanes", "generate the bpmn-beta", "make a process diagram"],
    consumes: ["PNS.md [modeled]", "notation-preferences.md", "role-dictionary.md", "integration-registry.md"],
    produces: ["BPMN 2.0.2 canonical artifact", "bpmn-beta source (when renderer_target = mermaid_bpmn_beta)", "optional DMN if ≥ 3 policy-logic gateway branches detected"],
    dependsOn: ["okhp3-process-narrative-authoring"],
    standardsRefs: ["BPMN 2.0.2 / ISO 19510 Clauses 2, 7, 9, 10", "BPM CBOK v4.0 KA 2", "Mermaid 11.x External Diagram API"],
    tags: ["bpmn", "mermaid", "bpmn-beta", "visual-modeling", "swimlane", "gateways", "pools", "lanes", "workflow"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-visual-process-modeling", "Visual Process Modeling", "core", "Visual Modeling", "bpmn-beta.mmd, process-model.svg", "pns.yaml, notation-preferences.md, role-dictionary.md", ["okhp3-process-narrative-authoring"]),
  },
  {
    id: "okhp3-process-gap-exception-analysis",
    name: "okhp3-process-gap-exception-analysis",
    displayName: "Gap & Exception Analysis",
    status: "core",
    layer: 2,
    layerLabel: "Narrative",
    pipelineOrder: 7,
    description: "Identify failure modes, undocumented variants, bottlenecks, policy conflicts, control weaknesses, and divergence between intended and actual practice. Use this skill when a modeled process requires quality analysis, improvement prioritisation, or risk review.",
    purpose: "A modeled process shows what should happen; this skill surfaces what can go wrong and where it already diverges. It produces a structured issue log, gap register, and exception catalog aligned to ISO 9001 §10 nonconformity requirements — providing the evidence base that change strategy skills need.",
    triggerPhrases: ["find the gaps", "analyse exceptions", "what could go wrong", "process risk review", "identify improvement opportunities"],
    consumes: ["PNS.md [modeled]", "compliance-controls-registry.md", "organization-profile.md"],
    produces: ["PNS.md [analyzed] with issue log, gap register, exception catalog, remediation candidates"],
    dependsOn: ["okhp3-as-is-process-capture"],
    standardsRefs: ["BABOK v3 §8 (Solution Evaluation)", "BPM CBOK v4.0 KA 3", "BPM CBOK v4.0 KA 6", "ISO 9001:2015 §10"],
    tags: ["gap-analysis", "exception-analysis", "risk", "improvement", "nonconformity", "six-sigma", "bpm-cbok"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-process-gap-exception-analysis", "Gap & Exception Analysis", "core", "Narrative", "gap-analysis.yaml, exception-catalog.yaml", "pns.yaml, compliance-controls-registry.md, organization-profile.md", ["okhp3-as-is-process-capture"]),
  },
  {
    id: "okhp3-future-state-change-strategy",
    name: "okhp3-future-state-change-strategy",
    displayName: "Future-State & Change Strategy",
    status: "recommended-extension",
    layer: 2,
    layerLabel: "Narrative",
    pipelineOrder: 8,
    description: "Define the target-state process and change approach. Use this skill when gap analysis is complete and process improvement, redesign, or transformation is in scope. SCOPE LIMIT: covers process redesign only — not organisational change management, Prosci/ADKAR, training design, or communications planning.",
    purpose: "Gap analysis identifies problems; this skill translates them into a structured target-state design and a realistic change strategy. It updates PNS.md with future-state sections and transition assumptions, giving validation and publication skills the complete before/after picture required for conformance review.",
    triggerPhrases: ["design the future state", "to-be process", "process improvement plan", "what should the process become", "redesign this workflow"],
    consumes: ["PNS.md [analyzed]", "gap analysis output", "organization-profile.md", "process-taxonomy.md", "integration-registry.md"],
    produces: ["PNS.md updated with future-state sections, transition assumptions, change-strategy notes"],
    dependsOn: ["okhp3-process-gap-exception-analysis"],
    standardsRefs: ["BABOK v3 §6.2–6.4", "BPM CBOK v4.0 Phase 2 (Architect Changes)", "BPM CBOK v4.0 Phase 3 (Develop Initiatives)"],
    tags: ["future-state", "to-be", "change-strategy", "redesign", "transformation", "bpm-cbok", "babok"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-future-state-change-strategy", "Future-State & Change Strategy", "recommended-extension", "Narrative", "future-state.yaml, change-strategy.md", "pns.yaml, gap-analysis.yaml, organization-profile.md", ["okhp3-process-gap-exception-analysis"]),
  },
  {
    id: "okhp3-decision-model-authoring",
    name: "okhp3-decision-model-authoring",
    displayName: "Decision Model Authoring",
    status: "recommended-extension",
    layer: 3,
    layerLabel: "Visual Modeling",
    pipelineOrder: 9,
    description: "Externalise decision logic from prose and BPMN gateways into formal DMN 1.4 structures. Use this skill when a PNS contains three or more gateway branches carrying policy logic, approval criteria, or scoring thresholds (MUST trigger), or when decision tables are explicitly requested (optional trigger).",
    purpose: "Complex gateway logic embedded in prose or BPMN diagrams is opaque to auditors and difficult to change. This skill externalises it into formal DMN 1.4 decision requirement diagrams and rule tables, with stable decision IDs that trace back to PNS rule set identifiers for full audit traceability.",
    triggerPhrases: ["create decision tables", "model the decision logic", "DMN for this process", "externalise the business rules", "decision model"],
    consumes: ["PNS.md [modeled or analyzed]", "business-glossary-and-rulebook.md", "compliance-controls-registry.md", "notation-preferences.md"],
    produces: ["DMN 1.4 DRD (Level 1 normatively)", "decision tables in Markdown", "stable decision IDs tracing to PNS rule set IDs"],
    dependsOn: ["okhp3-process-narrative-authoring"],
    standardsRefs: ["OMG DMN 1.4 (April 2023)", "BPM CBOK v4.0 KA 4 (Process Design)"],
    tags: ["dmn", "decision-model", "business-rules", "decision-table", "gateways", "rule-table", "process-logic"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-decision-model-authoring", "Decision Model Authoring", "recommended-extension", "Visual Modeling", "decision-model.yaml, dmn-table.md", "pns.yaml, business-glossary-and-rulebook.md, notation-preferences.md", ["okhp3-process-narrative-authoring"]),
  },
  {
    id: "okhp3-process-validation-scoring",
    name: "okhp3-process-validation-scoring",
    displayName: "Validation & Quality Scoring",
    status: "core",
    layer: 2,
    layerLabel: "Narrative",
    pipelineOrder: 10,
    description: "Test internal consistency, stakeholder alignment, standards conformance, completeness, and evidence strength. Produces a 0–100 quality score and a defect list. Use this skill whenever a narrative and any derived models exist and a quality gate is needed.",
    purpose: "Publication without validation produces undocumented debt. This skill runs 9 validation suites (V1–V9) across all BP-SKILL artifacts, scores them 0–100, classifies the result as Band A–D, and issues a publication gate recommendation — turning quality into a measurable, auditable decision rather than an opinion.",
    triggerPhrases: ["validate this process", "score the PNS", "quality check", "is this ready to publish", "review the process document"],
    consumes: ["PNS.md [modeled or analyzed]", "BPMN/DMN artifacts (if present)", "all context files"],
    produces: ["Quality scorecard (0–100)", "Defect list with V1–V9 validation results", "Publication approval recommendation", "PNS.md [validated] status update"],
    dependsOn: ["okhp3-process-narrative-authoring"],
    standardsRefs: ["BABOK v3 §5 (Requirements Life Cycle Management)", "ISO 9001:2015 §4.4.1", "IEEE/ISO/IEC 29148:2018"],
    tags: ["validation", "quality-scoring", "v1-v9", "publication-gate", "iso9001", "babok", "conformance"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-process-validation-scoring", "Validation & Quality Scoring", "core", "Narrative", "validation-report.yaml", "pns.yaml, pir.yaml", ["okhp3-process-narrative-authoring"]),
  },
  {
    id: "okhp3-process-measures-controls",
    name: "okhp3-process-measures-controls",
    displayName: "Measures & Controls Definition",
    status: "recommended-extension",
    layer: 4,
    layerLabel: "Operational",
    pipelineOrder: 11,
    description: "Define KPIs, SLAs, control points, approvals, and retained evidence requirements so the process can be governed after publication. Required for BPM CBOK v4.0 Phase 5 (Measure Success) conformance. Use this skill when a validated process is intended for operation, audit, or transformation tracking.",
    purpose: "A published process without measurable controls cannot be governed, improved, or audited. This skill adds a metrics-and-controls section to PNS.md with KPIs, SLA thresholds, mandatory approval gates, and evidence retention requirements aligned to ISO 9001 §4.4 and BPM CBOK Phase 5.",
    triggerPhrases: ["define the KPIs", "add controls to this process", "what metrics should we track", "governance requirements", "SLA definition"],
    consumes: ["PNS.md [validated]", "compliance-controls-registry.md", "organization-profile.md"],
    produces: ["Metrics-and-controls section in PNS.md", "Optional control matrix artifact"],
    dependsOn: ["okhp3-process-narrative-authoring"],
    standardsRefs: ["BPM CBOK v4.0 KA 5 (Process Performance Management)", "BPM CBOK v4.0 Phase 5 (Measure Success)", "ISO 9001:2015 §4.4 and §7.5", "BABOK v3 Technique §10.28 (Metrics and KPIs)"],
    tags: ["kpis", "measures", "controls", "governance", "iso9001", "sla", "performance-management", "compliance"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-process-measures-controls", "Measures & Controls Definition", "recommended-extension", "Operational", "measures-register.yaml, controls-register.yaml", "pns.yaml, compliance-controls-registry.md, organization-profile.md", ["okhp3-process-narrative-authoring"]),
  },
  {
    id: "okhp3-sop-work-instructions",
    name: "okhp3-sop-work-instructions",
    displayName: "SOP & Work Instruction Generation",
    status: "core",
    layer: 4,
    layerLabel: "Operational",
    pipelineOrder: 12,
    description: "Generate ISO 9001-conformant SOPs and role-specific Work Instructions from the validated process narrative. SOPs define what happens, who does it, and in what sequence. Work Instructions define step-by-step how to perform a specific task. All WIs trace back to their parent SOP and PNS step IDs. Use this skill when a validated narrative is intended for operational use.",
    purpose: "Validated narratives are authoritative but not operational. This skill converts PNS.md into two tiers of document: a Tier 2 SOP (governance-oriented, what and who) and Tier 3 Work Instructions (execution-oriented, step-by-step how) — all carrying parent_sop_id and source_step_ids for traceability to the ISO 9001 §7.5 documented information requirement.",
    triggerPhrases: ["write the SOP", "create work instructions", "generate the procedure", "document the steps", "operational documentation"],
    consumes: ["PNS.md [validated]", "organization-profile.md", "regional-context.md", "compliance-controls-registry.md", "role-dictionary.md"],
    produces: ["sop/<process-id>/SOP-<n>.md (Tier 2: governance-oriented)", "sop/<process-id>/WI-<role>-<step>.md (Tier 3: execution-oriented)", "All WIs carry parent_sop_id and source_step_ids[] traceability"],
    dependsOn: ["okhp3-process-narrative-authoring"],
    standardsRefs: ["ISO 9001:2015 §7.5.1–§7.5.3", "BPM CBOK v4.0 KA 4 (Process Design)"],
    tags: ["sop", "work-instructions", "documented-information", "iso9001", "procedure", "traceability", "operational"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-sop-work-instructions", "SOP & Work Instruction Generation", "core", "Operational", "sop.md, work-instructions.md", "pns.yaml, organization-profile.md, regional-context.md, role-dictionary.md", ["okhp3-process-narrative-authoring"]),
  },
  {
    id: "okhp3-raci-governance-matrix",
    name: "okhp3-raci-governance-matrix",
    displayName: "RACI & Governance Matrix",
    status: "core",
    layer: 5,
    layerLabel: "Governance",
    pipelineOrder: 13,
    description: "Generate accountability structures for execution, approval, consultation, and information flows. Enforces exactly one Accountable role per task (RACI-V01). Supports RASCI variant. Use this skill when a multi-role process has shared ownership, approval requirements, or governance ambiguity.",
    purpose: "Accountability ambiguity is the most common cause of process breakdown. This skill generates a validated RACI matrix from PNS.md role and activity data, enforces the one-Accountable-per-task rule (RACI-V01), and produces both a human-readable Markdown table and a machine-readable CSV for integration with governance tooling.",
    triggerPhrases: ["build the RACI", "who is accountable", "responsibility matrix", "governance matrix", "accountability chart"],
    consumes: ["PNS.md", "role-dictionary.md", "organization-profile.md"],
    produces: ["governance/<process-id>/RACI.md", "governance/<process-id>/RACI.csv", "RACI-V01 diagnostic if one-A-per-task rule violated"],
    dependsOn: ["okhp3-process-narrative-authoring"],
    standardsRefs: ["BABOK v3 Technique §10.39 (Roles and Permissions Matrix)", "BPM CBOK v4.0 KA 8 (Process Management Organisation)"],
    tags: ["raci", "governance-matrix", "responsibility", "accountability", "roles", "pmbok", "iso9001"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-raci-governance-matrix", "RACI & Governance Matrix", "core", "Governance", "raci.md, governance-matrix.md", "pns.yaml, role-dictionary.md, organization-profile.md", ["okhp3-process-narrative-authoring"]),
  },
  {
    id: "okhp3-sipoc-generation",
    name: "okhp3-sipoc-generation",
    displayName: "SIPOC Generation",
    status: "core",
    layer: 5,
    layerLabel: "Governance",
    pipelineOrder: 14,
    description: "Produce a high-level Supplier-Input-Process-Output-Customer view for executive communication and process chartering. Uses Six Sigma DMAIC completion sequence (Outputs first, then Customers, then backfill Inputs and Suppliers). Process column limited to 3–7 steps. Use this skill when a process boundary summary is needed for stakeholder communication or portfolio classification.",
    purpose: "Detailed process narratives are not suitable for executive briefings or portfolio governance. This skill generates a SIPOC table capped at 3–7 process steps, with APQC PCF identifiers attached, suitable for kickoff documents, project charters, and portfolio classification presentations.",
    triggerPhrases: ["create a SIPOC", "high-level process view", "executive process summary", "process boundary diagram", "SIPOC chart"],
    consumes: ["PNS.md (preferred)", "pir.yaml (early-stage use)"],
    produces: ["governance/<process-id>/SIPOC.md", "governance/<process-id>/SIPOC.yaml", "Five columns: S–I–P–O–C, 3–7 process steps, APQC IDs attached"],
    dependsOn: ["okhp3-process-narrative-authoring"],
    standardsRefs: ["BABOK v3 Technique §10.42 (Scope Modelling)", "Six Sigma DMAIC Define phase", "ISO 9001:2015 §4.4"],
    tags: ["sipoc", "process-summary", "executive", "six-sigma", "dmaic", "apqc", "process-boundary"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-sipoc-generation", "SIPOC Generation", "core", "Governance", "sipoc.md", "pns.yaml, pir.yaml", ["okhp3-process-narrative-authoring"]),
  },
  {
    id: "okhp3-publication-handoff-packaging",
    name: "okhp3-publication-handoff-packaging",
    displayName: "Publication & Handoff Packaging",
    status: "core",
    layer: 6,
    layerLabel: "Publication",
    pipelineOrder: 15,
    description: "Package the approved process artifact set for reuse, review, audit, and downstream implementation. Compiles a versioned, signed publication bundle with manifest, approvals, changelog, and all derived artifacts. Use this skill when a validated process is ready for formal handoff, publication, or archiving.",
    purpose: "A validated process documentation set must be packaged for handoff with an auditable manifest, approval signatures, and a changelog before it can be considered published. This skill assembles all BP-SKILL outputs into a versioned, signed bundle conforming to ISO 9001 §7.5.3 control of documented information.",
    triggerPhrases: ["publish this process", "package for handoff", "create the publication bundle", "finalise and archive", "sign off the process"],
    consumes: ["PNS.md [validated]", "all derived artifacts", "all context references", "approval metadata"],
    produces: ["artifacts/<process-id>/publication/", "MANIFEST.yaml", "APPROVALS.yaml", "CHANGELOG.md", "Complete bundle: PNS + BPMN/DMN + SOPs + WIs + RACI + SIPOC"],
    dependsOn: ["okhp3-process-narrative-authoring", "okhp3-visual-process-modeling", "okhp3-sop-work-instructions"],
    standardsRefs: ["ISO 9001:2015 §7.5.3 (Control of documented information)", "BPM CBOK v4.0 KA 1 and KA 9", "agentskills.io packaging conventions"],
    tags: ["publication", "handoff", "bundle", "manifest", "approvals", "changelog", "iso9001", "archive"],
    compatibleWith: COMPATIBLE_PLATFORMS,
    skillMdPreview: previewFrontmatter("okhp3-publication-handoff-packaging", "Publication & Handoff Packaging", "core", "Publication", "MANIFEST.yaml, APPROVALS.yaml, CHANGELOG.md", "pns.yaml, bpmn-beta.mmd, sop.md", ["okhp3-process-narrative-authoring", "okhp3-visual-process-modeling", "okhp3-sop-work-instructions"]),
  },
];

export const VARIABLE_FILES: VariableFile[] = [
  {
    id: "organization-profile",
    filename: "organization-profile.md",
    displayName: "Organization Profile",
    description: "Company name, industry (NAICS), size tier, regulatory environment, process maturity level. Read by intake, validation, controls, and publication skills.",
    requiredFields: ["company_name", "industry", "size_tier", "operating_regions", "regulatory_environment", "process_maturity_level"],
    usedBy: ["okhp3-process-intake-and-scope", "okhp3-process-validation-scoring", "okhp3-process-measures-controls", "okhp3-sop-work-instructions", "okhp3-publication-handoff-packaging"],
  },
  {
    id: "sector-context",
    filename: "sector-context.md",
    displayName: "Sector Context",
    description: "Industry-specific vocabulary, regulatory standards, common process patterns, APQC PCF sector mapping. Normalises terminology for elicitation and narrative skills.",
    requiredFields: ["sector_name", "domain_vocabulary", "applicable_standards", "common_process_patterns", "sector_apqc_mapping"],
    usedBy: ["okhp3-elicitation-interviews", "okhp3-process-narrative-authoring", "okhp3-process-validation-scoring"],
  },
  {
    id: "regional-context",
    filename: "regional-context.md",
    displayName: "Regional Context",
    description: "Jurisdiction, language, regulatory bodies, compliance frameworks, date/currency/measurement conventions. Required for any cross-border or regulated process.",
    requiredFields: ["jurisdictions", "primary_language", "regulatory_bodies", "compliance_frameworks", "date_format", "currency_code", "measurement_system"],
    usedBy: ["okhp3-sop-work-instructions", "okhp3-publication-handoff-packaging"],
  },
  {
    id: "role-dictionary",
    filename: "role-dictionary.md",
    displayName: "Role Dictionary",
    description: "Named roles with stable IDs, responsibilities, authority levels, RACI defaults, and system access profiles. The canonical source of truth for every role referenced across the suite.",
    requiredFields: ["role_id", "display_name", "responsibilities", "authority_level", "raci_default", "system_access_profile"],
    usedBy: ["okhp3-stakeholder-and-role-mapping", "okhp3-visual-process-modeling", "okhp3-sop-work-instructions", "okhp3-raci-governance-matrix", "okhp3-process-validation-scoring"],
  },
  {
    id: "process-taxonomy",
    filename: "process-taxonomy.md",
    displayName: "Process Taxonomy",
    description: "APQC PCF hierarchy mapping with dual v7.4/v8.0 element IDs, internal naming conventions, process ownership structure. Enables benchmarking and cross-process reporting.",
    requiredFields: ["taxonomy_name", "apqc_version", "hierarchy", "internal_naming_rules", "ownership_structure"],
    usedBy: ["okhp3-process-intake-and-scope", "okhp3-sipoc-generation", "okhp3-publication-handoff-packaging"],
  },
  {
    id: "notation-preferences",
    filename: "notation-preferences.md",
    displayName: "Notation Preferences",
    description: "Preferred diagram notation, renderer targets (bpmn-beta, bpmn.io, DrawIO), output formats, theme and palette defaults. Visual modeling and decision skills read this first.",
    requiredFields: ["primary_notation", "renderer_targets", "output_formats", "theme_defaults"],
    usedBy: ["okhp3-visual-process-modeling", "okhp3-decision-model-authoring"],
  },
  {
    id: "compliance-controls-registry",
    filename: "compliance-controls-registry.md",
    displayName: "Compliance & Controls Registry",
    description: "Control IDs, source frameworks (SOX, HIPAA, ISO 9001, GDPR, NIST), mandatory approval gates, evidence requirements, audit frequencies, and the publication quality threshold.",
    requiredFields: ["control_id", "source_framework", "control_objective", "mandatory_approval_gate", "evidence_requirements", "audit_frequency", "publication_quality_threshold"],
    usedBy: ["okhp3-process-gap-exception-analysis", "okhp3-process-measures-controls", "okhp3-sop-work-instructions", "okhp3-process-validation-scoring", "okhp3-publication-handoff-packaging"],
  },
  {
    id: "integration-registry",
    filename: "integration-registry.md",
    displayName: "Integration Registry",
    description: "Named systems with stable IDs, system types, vendors, owners, integration patterns (API sync/async, file batch, RPA, EDI). Keeps system references consistent across all skills.",
    requiredFields: ["system_id", "display_name", "system_type", "vendor", "system_owner_role_id", "integration_patterns"],
    usedBy: ["okhp3-as-is-process-capture", "okhp3-visual-process-modeling", "okhp3-future-state-change-strategy", "okhp3-publication-handoff-packaging"],
  },
  {
    id: "business-glossary-and-rulebook",
    filename: "business-glossary-and-rulebook.md",
    displayName: "Business Glossary & Rulebook",
    description: "Controlled vocabulary (term IDs, definitions, sources, synonyms, prohibited terms) plus business rules (rule IDs, statements, authority, affected process areas). Prevents vocabulary drift across all skills.",
    requiredFields: ["term_id", "term", "definition", "source", "rule_id", "statement", "source_authority", "affected_process_areas"],
    usedBy: ["okhp3-process-narrative-authoring", "okhp3-decision-model-authoring", "okhp3-process-validation-scoring", "okhp3-publication-handoff-packaging"],
  },
];

export const PNS_LIFECYCLE: PnsLifecycleState[] = [
  { status: "draft-intake",      setBy: "okhp3-process-intake-and-scope",                order: 1 },
  { status: "scoped",            setBy: "okhp3-stakeholder-and-role-mapping",             order: 2 },
  { status: "elicited",          setBy: "okhp3-elicitation-interviews",   order: 3 },
  { status: "documented-as-is",  setBy: "okhp3-as-is-process-capture",                   order: 4 },
  { status: "modeled",           setBy: "okhp3-process-narrative-authoring",              order: 5 },
  { status: "analyzed",          setBy: "okhp3-process-gap-exception-analysis",       order: 6 },
  { status: "validated",         setBy: "okhp3-process-validation-scoring",   order: 7 },
  { status: "packaged",          setBy: "okhp3-publication-handoff-packaging",        order: 8 },
  { status: "published",         setBy: "okhp3-publication-handoff-packaging",        order: 9 },
  { status: "deprecated",        setBy: "authorized role post-publication",         order: 10 },
];

export const PNS_SECTIONS: PnsSection[] = [
  {
    number: 1,
    title: "Process Identification",
    documents: "Process title, unique process ID, version, owner, classification (public/internal/confidential/restricted), APQC PCF element ID.",
    standard: "ISO 9001:2015 §4.4.1 — process identification and ownership; APQC PCF v7.4 taxonomy alignment.",
    naCondition: null,
  },
  {
    number: 2,
    title: "Scope & Boundaries",
    documents: "In-scope activities, out-of-scope exclusions, trigger conditions, termination conditions, handoff points.",
    standard: "BABOK v3 §6.1 — Scope Modelling; IEEE/ISO/IEC 29148:2018 §6.4 — system boundary definition.",
    naCondition: null,
  },
  {
    number: 3,
    title: "Stakeholder & RACI Register",
    documents: "All named stakeholders with role IDs, responsibilities, authority levels, and RACI assignments per process step.",
    standard: "BABOK v3 §3.2 — Stakeholder Analysis; BPM CBOK v4.0 KA 8 — Process Management Organisation.",
    naCondition: null,
  },
  {
    number: 4,
    title: "Evidence & Sources",
    documents: "Interview participants, document references, observation sessions, confidence scores, open questions, and contradiction log.",
    standard: "BABOK v3 §4 — Elicitation and Collaboration; IEEE/ISO/IEC 29148:2018 §6.2 — stakeholder requirements sourcing.",
    naCondition: "May be marked N/A only for processes documented entirely from pre-existing formal SOPs with no elicitation required.",
  },
  {
    number: 5,
    title: "As-Is Activity Sequence",
    documents: "Step-by-step current-state process with stable act-NNN identifiers, actor roles, system touchpoints, inputs, outputs, and exception placeholders.",
    standard: "BPM CBOK v4.0 KA 2 — Process Modelling; BPMN 2.0.2 §7.3 — activity sequence semantics.",
    naCondition: null,
  },
  {
    number: 6,
    title: "Business Rules & Decision Points",
    documents: "Named decision points with stable rule-NNN IDs, decision logic, approval criteria, policy statements, and gateway branch labels.",
    standard: "BABOK v3 Technique §10.9 — Business Rules Analysis; OMG DMN 1.4 — Decision Model and Notation.",
    naCondition: "May be marked N/A only if the process contains zero conditional branches or policy-gated approvals.",
  },
  {
    number: 7,
    title: "System Touchpoints & Integrations",
    documents: "All systems referenced with integration-registry IDs, interaction type (read/write/trigger), owner role, and SLA if applicable.",
    standard: "BPM CBOK v4.0 KA 4 — Process Design; integration-registry.md schema alignment.",
    naCondition: "May be marked N/A for fully manual processes with no system interactions.",
  },
  {
    number: 8,
    title: "Risks, Gaps & Exception Paths",
    documents: "Failure modes, undocumented variants, bottlenecks, policy conflicts, control weaknesses, and divergence between intended and actual practice.",
    standard: "ISO 9001:2015 §10 — Nonconformity and corrective action; BPM CBOK v4.0 KA 6 — Process Risk Management.",
    naCondition: "May be marked N/A for new processes not yet in operation (no as-is baseline to analyse).",
  },
  {
    number: 9,
    title: "Key Performance Indicators",
    documents: "KPI names, measurement units, baseline values, target thresholds, measurement frequency, and responsible owner.",
    standard: "ISO 9001:2015 §9.1 — Monitoring, measurement, analysis and evaluation; BPM CBOK v4.0 KA 5.",
    naCondition: "May be marked N/A for draft-stage processes where KPIs are deferred to a later lifecycle phase.",
  },
  {
    number: 10,
    title: "Controls & Compliance References",
    documents: "Control IDs from compliance-controls-registry.md, mandatory approval gates, evidence retention requirements, audit frequencies.",
    standard: "ISO 9001:2015 §4.4 and §7.5; COSO Internal Control Integrated Framework 2013.",
    naCondition: "May be marked N/A only for internal-use processes with no regulatory or audit obligations.",
  },
  {
    number: 11,
    title: "Handoff Conditions & Approval Gates",
    documents: "Criteria that must be met before the process output is accepted, sign-off roles, approval mechanism, and rejection path.",
    standard: "ISO 9001:2015 §7.5.3 — Control of documented information; agentskills.io packaging conventions.",
    naCondition: null,
  },
  {
    number: 12,
    title: "Future-State Notes",
    documents: "Target-state assumptions, change strategy summary, transition path, implementation dependencies. Populated by okhp3-future-state-change-strategy skill.",
    standard: "BABOK v3 §6.2–6.4 — Solution Options and Future State; BPM CBOK v4.0 Phase 2.",
    naCondition: "May be marked N/A for processes where no improvement or redesign is in scope.",
  },
  {
    number: 13,
    title: "Document Control & Approvals",
    documents: "Version history, approval signatures with timestamps, review schedule, next-review-due date, and retention policy.",
    standard: "ISO 9001:2015 §7.5.2 — Creating and updating documented information; ISO 9001:2015 §7.5.3.",
    naCondition: null,
  },
];

export const PNS_FRONTMATTER_SCHEMA = `---
pns_schema_version: "0.3.0"
process_id: ""
process_title: ""
process_owner: ""
version: "0.1.0"
status: "draft-intake"
  # Valid values:
  # draft-intake | scoped | elicited | documented-as-is
  # modeled | analyzed | validated | packaged | published | deprecated
classification: ""    # public | internal | confidential | restricted
apqc_id: ""          # e.g. "1.1.0" (PCF v7.4 element)
created: ""          # ISO 8601 date
last_modified: ""    # ISO 8601 date
review_due: ""       # ISO 8601 date
approved_by: []      # list of role_ids from role-dictionary.md
standards:
  primary: "ISO 9001:2015 §4.4.1"
  supporting:
    - "BABOK v3 Core Concept Model"
    - "BPM CBOK v4.0"
    - "IEEE/ISO/IEC 29148:2018"
    - "APQC PCF v7.4"
---`;

export const BP_SKILL_VERSION = "0.3.0";
export const SUITE_DOWNLOAD_FILENAME = "bp-skill-suite-v0.3.zip";
export const CONTEXT_PACK_FILENAME = "bp-skill-context-templates-v0.3.zip";
export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/OKHP3/mermaid-diagram-bpmn/main/skills";
export const CONTEXT_RAW_BASE = "https://raw.githubusercontent.com/OKHP3/mermaid-diagram-bpmn/main/context";
