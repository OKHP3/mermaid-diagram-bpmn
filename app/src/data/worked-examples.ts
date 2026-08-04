import { PURCHASE_APPROVAL_STEPS } from "./purchase-approval-steps";
import { EMPLOYEE_OFFBOARDING_STEPS } from "./employee-offboarding-steps";

export interface WorkedExample {
  slug: string;
  title: string;
  /** Route path used for navigation, e.g. "/walkthrough/purchase-approval" */
  path: string;
  /** Ordered list of skill IDs traced in this example (one per step). */
  stepSkillIds: string[];
}

/**
 * Registry of all worked examples.  Each entry knows which skills it
 * features so skill detail pages can reverse-link to the example.
 *
 * Step cards on the example pages carry `id="step-{skillId}"` so the
 * anchor in the URL scrolls directly to the relevant step.
 */
export const WORKED_EXAMPLES: WorkedExample[] = [
  {
    slug: "purchase-approval",
    title: "Purchase Approval",
    path: "/walkthrough/purchase-approval",
    stepSkillIds: PURCHASE_APPROVAL_STEPS.map((s) => s.skillId),
  },
  {
    slug: "employee-offboarding",
    title: "Employee Offboarding",
    path: "/walkthrough/employee-offboarding",
    stepSkillIds: EMPLOYEE_OFFBOARDING_STEPS.map((s) => s.skillId),
  },
];
