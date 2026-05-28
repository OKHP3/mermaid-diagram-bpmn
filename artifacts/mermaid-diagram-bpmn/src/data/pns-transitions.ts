import { PNS_LIFECYCLE } from "@/data/skills-registry";

export interface PnsTransition {
  before: string | null;
  after: string | null;
}

export const PNS_TRANSITIONS: Record<string, PnsTransition> = {
  "process-intake-and-scope":                 { before: null,                after: "draft-intake"     },
  "stakeholder-and-role-mapping":             { before: "draft-intake",      after: "scoped"           },
  "elicitation-and-interview-facilitation":   { before: "scoped",            after: "elicited"         },
  "as-is-process-capture":                    { before: "elicited",          after: "documented-as-is" },
  "process-narrative-authoring":              { before: "documented-as-is",  after: "modeled"          },
  "visual-process-modeling":                  { before: "modeled",           after: null               },
  "process-gap-and-exception-analysis":       { before: "modeled",           after: "analyzed"         },
  "future-state-and-change-strategy":         { before: "analyzed",          after: null               },
  "decision-model-authoring":                 { before: "modeled",           after: null               },
  "process-validation-and-quality-scoring":   { before: "modeled",           after: "validated"        },
  "process-measures-and-controls-definition": { before: "validated",         after: null               },
  "sop-and-work-instruction-generation":      { before: "validated",         after: null               },
  "raci-and-governance-matrix-generation":    { before: "modeled",           after: null               },
  "sipoc-generation":                         { before: "modeled",           after: null               },
  "publication-and-handoff-packaging":        { before: "validated",         after: "published"        },
};

// Backfill `after` values from PNS_LIFECYCLE so the two sources stay in sync.
PNS_LIFECYCLE.forEach((state) => {
  const entry = PNS_TRANSITIONS[state.setBy];
  if (entry && !entry.after) entry.after = state.status;
});
