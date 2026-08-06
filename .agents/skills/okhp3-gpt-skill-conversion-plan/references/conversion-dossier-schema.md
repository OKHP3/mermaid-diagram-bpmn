# Conversion dossier schema

Use this shape for a machine-readable handoff to Skill Foundry. Keep source
references traceable and list loss rather than silently filling gaps.

```json
{
  "source": {"name": "", "version": "", "artifacts": []},
  "evidence_register": [
    {"claim": "", "class": "verified_platform_fact|source_derived_practice|theory|preference|inferred|unknown", "source": "", "verification": "evidenced|needs_eval|verify"}
  ],
  "verdict": {
    "disposition": "ready_for_foundry|needs_source_artifacts|partial_port|not_a_skill|blocked_by_permissions",
    "portability_confidence": "high|medium|low",
    "semantic_loss_risk": "low|medium|high",
    "blockers": []
  },
  "capability_map": [
    {"source_capability": "", "source_evidence": [], "verification": "evidenced|needs_eval|verify", "skill_construct": "trigger|procedure|reference|script|output_contract|adapter|drop", "notes": ""}
  ],
  "semantic_loss": [
    {"capability": "", "impact": "", "mitigation": "", "acceptance_test": ""}
  ],
  "skill_architecture": {
    "name": "",
    "trigger": "",
    "in_scope": [],
    "out_of_scope": [],
    "inputs": [],
    "outputs": [],
    "references": [],
    "scripts": [],
    "safety_rules": []
  },
  "migration_backlog": [
    {"id": "M1", "action": "preserve|rewrite|externalize|replace|verify|drop", "item": "", "acceptance": "", "dependency": ""}
  ],
  "foundry_handoff": {"evals": [], "next_skill": "okhp3-skill-foundry"}
}
```
