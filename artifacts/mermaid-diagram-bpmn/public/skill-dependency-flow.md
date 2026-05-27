# BP-SKILL v0.3 — Skill Dependency Flow

Generated from `depends_on` metadata in each skill's `SKILL.md`.

Paste the code block below into a Notion code block (set language to **Mermaid**).
Or open [mermaid.live](https://mermaid.live), paste the code, and screenshot the result.

```mermaid
flowchart LR
  classDef discovery fill:#e0f2fe,stroke:#4A9EBF,color:#1e3a5f
  classDef narrative fill:#ede9fe,stroke:#7B68EE,color:#3b1f6b
  classDef visual fill:#dcfce7,stroke:#5BA08A,color:#1a3d2e
  classDef operational fill:#fef3c7,stroke:#CC8B30,color:#5c3d0a
  classDef governance fill:#fee2e2,stroke:#C0645A,color:#5c1d1d
  classDef publication fill:#f1f5f9,stroke:#777777,color:#2d3748

  process_intake_and_scope["01 - Process Intake & Scope"]:::discovery
  stakeholder_and_role_mapping["02 - Stakeholder & Role Mapping"]:::discovery
  elicitation_and_interview_facilitation["03 - Elicitation & Interview Facilitation"]:::discovery
  as_is_process_capture["04 - As-Is Process Capture"]:::narrative
  process_narrative_authoring["05 - Process Narrative Authoring"]:::narrative
  visual_process_modeling["06 - Visual Process Modeling"]:::visual
  process_gap_and_exception_analysis["07 - Gap & Exception Analysis"]:::narrative
  future_state_and_change_strategy["08 - Future State & Change Strategy"]:::narrative
  decision_model_authoring["09 - Decision Model Authoring"]:::visual
  process_validation_and_quality_scoring["10 - Process Validation & Quality Scoring"]:::narrative
  process_measures_and_controls_definition["11 - Process Measures & Controls"]:::operational
  sop_and_work_instruction_generation["12 - SOP & Work Instructions"]:::operational
  raci_and_governance_matrix_generation["13 - RACI Matrix Generation"]:::governance
  sipoc_generation["14 - SIPOC Generation"]:::governance
  publication_and_handoff_packaging["15 - Publication & Handoff"]:::publication

  process_intake_and_scope --> stakeholder_and_role_mapping
  process_intake_and_scope --> sipoc_generation
  stakeholder_and_role_mapping --> elicitation_and_interview_facilitation
  stakeholder_and_role_mapping --> raci_and_governance_matrix_generation
  elicitation_and_interview_facilitation --> as_is_process_capture
  as_is_process_capture --> process_narrative_authoring
  process_narrative_authoring --> visual_process_modeling
  process_narrative_authoring --> process_gap_and_exception_analysis
  process_narrative_authoring --> decision_model_authoring
  process_narrative_authoring --> process_validation_and_quality_scoring
  process_gap_and_exception_analysis --> future_state_and_change_strategy
  process_validation_and_quality_scoring --> process_measures_and_controls_definition
  process_validation_and_quality_scoring --> sop_and_work_instruction_generation
  process_validation_and_quality_scoring --> publication_and_handoff_packaging
```

## Layers

| Color | Layer | Skills |
|---|---|---|
| Blue | Discovery | Process Intake & Scope, Stakeholder & Role Mapping, Elicitation |
| Purple | Narrative | As-Is Capture, Narrative Authoring, Gap Analysis, Future State, Validation |
| Green | Visual Modeling | Visual Process Modeling, Decision Model Authoring |
| Amber | Operational | SOP & Work Instructions, Process Measures & Controls |
| Red | Governance | RACI Matrix, SIPOC |
| Gray | Publication | Publication & Handoff |
