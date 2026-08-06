# Readiness dossier schema

Use this shape for a machine-readable handoff. Keep evidence excerpts short and
traceable to a supplied artifact.

```json
{
  "concept": {"name": "", "summary": "", "source_artifacts": []},
  "evidence_register": [
    {"id": "E1", "claim": "", "class": "verified_platform_fact|source_derived_practice|theory|preference|inferred|unknown", "source": "", "status": "present|partial|conflicting|missing|verify", "consequence": ""}
  ],
  "verdict": {
    "disposition": "ready_for_builder|ready_with_questions|needs_artifact_recovery|not_a_custom_gpt|blocked_by_authority",
    "score": {"earned": 0, "possible": 24, "percentage": 0},
    "confidence": "high|medium|low",
    "blockers": []
  },
  "domains": [
    {"name": "job_and_audience", "status": "present|partial|missing|conflicting", "score": 0, "evidence": [], "gaps": []}
  ],
  "questions": [{"id": "Q1", "question": "", "why": "", "domain": ""}],
  "handoff": {
    "confirmed_requirements": [],
    "non_goals": [],
    "acceptance_tests": [],
    "safety_constraints": [],
    "platform_facts_to_verify": [],
    "maturity_hypotheses": [{"change": "", "expected_effect": "", "test": ""}],
    "next_skill": "okhp3-custom-gpt-builder"
  }
}
```

The eight domain names are fixed so dossiers can be compared across AskJamie,
Glee-fully, and OverKill Hill FoundRy work.
