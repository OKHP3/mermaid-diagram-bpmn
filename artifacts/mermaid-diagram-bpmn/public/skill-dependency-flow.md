# BP-SKILL v0.3 — Skill Dependency Flow

Derived from `depends_on` in each skill's `SKILL.md` frontmatter via
`scripts/extract-skill-deps.mjs`. Re-run that script after editing any SKILL.md.

Paste the Mermaid block below into a Notion code block (language: Mermaid),
or open it at https://mermaid.live.

```mermaid
flowchart LR
  classDef discovery fill:#e0f2fe,stroke:#4A9EBF,color:#1e3a5f
  classDef narrative fill:#ede9fe,stroke:#7B68EE,color:#3b1f6b
  classDef visual fill:#dcfce7,stroke:#5BA08A,color:#1a3d2e
  classDef operational fill:#fef3c7,stroke:#CC8B30,color:#5c3d0a
  classDef governance fill:#fee2e2,stroke:#C0645A,color:#5c1d1d
  classDef publication fill:#f1f5f9,stroke:#777777,color:#2d3748

  process_intake_and_scope["01 - Intake & Scope"]:::discovery
  stakeholder_and_role_mapping["02 - Stakeholder & Role Mapping"]:::discovery
  elicitation_and_interview_facilitation["03 - Elicitation & Interview Facilitation"]:::discovery
  as_is_process_capture["04 - As-Is Process Capture"]:::narrative
  process_narrative_authoring["05 - Process Narrative Authoring"]:::narrative
  visual_process_modeling["06 - Visual Process Modeling"]:::visual
  process_gap_and_exception_analysis["07 - Gap & Exception Analysis"]:::narrative
  future_state_and_change_strategy["08 - Future-State & Change Strategy"]:::narrative
  decision_model_authoring["09 - Decision Model Authoring"]:::visual
  process_validation_and_quality_scoring["10 - Validation & Quality Scoring"]:::narrative
  process_measures_and_controls_definition["11 - Measures & Controls Definition"]:::operational
  sop_and_work_instruction_generation["12 - SOP & Work Instruction Generation"]:::operational
  raci_and_governance_matrix_generation["13 - RACI & Governance Matrix"]:::governance
  sipoc_generation["14 - SIPOC Generation"]:::governance
  publication_and_handoff_packaging["15 - Publication & Handoff Packaging"]:::publication

  process_intake_and_scope --> stakeholder_and_role_mapping
  process_intake_and_scope --> elicitation_and_interview_facilitation
  process_intake_and_scope --> as_is_process_capture
  process_intake_and_scope --> process_narrative_authoring
  stakeholder_and_role_mapping --> process_narrative_authoring
  as_is_process_capture --> process_gap_and_exception_analysis
  process_gap_and_exception_analysis --> future_state_and_change_strategy
  process_narrative_authoring --> visual_process_modeling
  process_narrative_authoring --> decision_model_authoring
  process_narrative_authoring --> process_validation_and_quality_scoring
  process_narrative_authoring --> process_measures_and_controls_definition
  process_narrative_authoring --> sop_and_work_instruction_generation
  process_narrative_authoring --> raci_and_governance_matrix_generation
  process_narrative_authoring --> sipoc_generation
  process_narrative_authoring --> publication_and_handoff_packaging
  visual_process_modeling --> publication_and_handoff_packaging
  sop_and_work_instruction_generation --> publication_and_handoff_packaging
```

## Layers

| Color | Layer | Skills |
|---|---|---|
| Blue | Discovery | Intake & Scope, Stakeholder Map, Elicitation |
| Purple | Narrative | As-Is Capture, Narrative Authoring, Gap Analysis, Future State, Validation |
| Green | Visual Modeling | Visual Process Modeling, Decision Model Authoring |
| Amber | Operational | Measures & Controls, SOP & Work Instructions |
| Red | Governance | RACI & Governance Matrix, SIPOC |
| Gray | Publication | Publication & Handoff Packaging |
