// @vitest-environment happy-dom
// Tests for the "See it in Action" section on the SkillDetail page and the
// corresponding #step-{skillId} anchor IDs rendered by ExampleStepTimeline.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import SkillDetail from '@/pages/SkillDetail';
import { ExampleStepTimeline } from '@/components/skills/ExampleStepTimeline';
import { SKILLS } from '@/data/skills-registry';
import { PURCHASE_APPROVAL_STEPS } from '@/data/purchase-approval-steps';
import { EMPLOYEE_OFFBOARDING_STEPS } from '@/data/employee-offboarding-steps';
import type { WorkedExample } from '@/data/worked-examples';

// ── Mutable WORKED_EXAMPLES list ──────────────────────────────────────────────
// vi.hoisted ensures this array is created before any mock factory runs.
// Tests MUST use .splice() to change contents — never reassign the variable —
// so the ESM live binding in SkillDetail continues to point at this array.
const mockWorkedExamplesList = vi.hoisted(() => [] as WorkedExample[]);

vi.mock('@/data/worked-examples', () => ({
  WORKED_EXAMPLES: mockWorkedExamplesList,
}));

// ── Wouter ────────────────────────────────────────────────────────────────────
const mockUseParams = vi.fn();
vi.mock('wouter', () => ({
  useParams: () => mockUseParams(),
  Link: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ['/', vi.fn()],
}));

// ── Heavy SkillDetail sub-components ─────────────────────────────────────────
vi.mock('@/components/skills/PnsBadge',               () => ({ PnsBadge:               () => <div /> }));
vi.mock('@/components/skills/PnsLifecycleTracker',    () => ({ PnsLifecycleTracker:    () => <div /> }));
vi.mock('@/components/skills/SkillMiniCard',          () => ({ SkillMiniCard:          () => <div /> }));
vi.mock('@/components/skills/SkillFrontmatterPreview',() => ({ SkillFrontmatterPreview:() => <div /> }));
vi.mock('@/components/skills/InstallTabs',            () => ({ InstallTabs:            () => <div /> }));
vi.mock('@/components/skills/DownloadButton',         () => ({ DownloadButton:         () => <button /> }));

// ── BpmnRenderer (needed by ExampleStepTimeline) ─────────────────────────────
vi.mock('@/lib/bpmn-renderer', () => ({
  BpmnRenderer: () => <div data-testid="bpmn-renderer" />,
}));

// ── ExamplePnsBadgePair (needed by ExampleStepTimeline) ──────────────────────
vi.mock('@/components/skills/ExamplePnsBadgePair', () => ({
  ExamplePnsBadgePair: () => <span />,
}));

// ── Constants & fixtures ──────────────────────────────────────────────────────
const INTAKE_ID = 'okhp3-process-intake-and-scope';

const PURCHASE_EXAMPLE: WorkedExample = {
  slug: 'purchase-approval',
  title: 'Purchase Approval',
  path: '/walkthrough/purchase-approval',
  stepSkillIds: PURCHASE_APPROVAL_STEPS.map((s) => s.skillId),
};

const OFFBOARDING_EXAMPLE: WorkedExample = {
  slug: 'employee-offboarding',
  title: 'Employee Offboarding',
  path: '/walkthrough/employee-offboarding',
  stepSkillIds: EMPLOYEE_OFFBOARDING_STEPS.map((s) => s.skillId),
};

// ── Render helper ─────────────────────────────────────────────────────────────
function renderSkill(skillId: string) {
  mockUseParams.mockReturnValue({ skillId });
  return render(<SkillDetail />);
}

// ── Tests: section present ────────────────────────────────────────────────────

describe('See it in Action — section present', () => {
  beforeEach(() => {
    // Splice, not reassign — keeps the live ESM binding intact
    mockWorkedExamplesList.splice(0, Infinity, PURCHASE_EXAMPLE, OFFBOARDING_EXAMPLE);
  });

  afterEach(() => {
    mockWorkedExamplesList.splice(0, Infinity);
  });

  it('renders the "See it in Action" heading', () => {
    const { getByRole } = renderSkill(INTAKE_ID);
    expect(getByRole('heading', { name: /See it in Action/i })).not.toBeNull();
  });

  it('shows one link per worked example (2 total)', () => {
    const { getAllByRole } = renderSkill(INTAKE_ID);
    const stepLinks = (getAllByRole('link') as HTMLAnchorElement[]).filter((el) =>
      el.href.includes('#step-')
    );
    expect(stepLinks.length).toBe(2);
  });

  it('every #step- link href ends with #step-{skillId}', () => {
    const { getAllByRole } = renderSkill(INTAKE_ID);
    const stepLinks = (getAllByRole('link') as HTMLAnchorElement[]).filter((el) =>
      el.href.includes('#step-')
    );
    for (const link of stepLinks) {
      expect(link.href).toMatch(new RegExp(`#step-${INTAKE_ID}$`));
    }
  });

  it('shows the Purchase Approval example title', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText('Purchase Approval')).not.toBeNull();
  });

  it('shows the Employee Offboarding example title', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText('Employee Offboarding')).not.toBeNull();
  });

  it('Purchase Approval link href is /walkthrough/purchase-approval#step-{skillId}', () => {
    const { getAllByRole } = renderSkill(INTAKE_ID);
    const links = getAllByRole('link') as HTMLAnchorElement[];
    // Use getAttribute('href') — .href is resolved to an absolute URL by happy-dom
    const link = links.find(
      (el) => el.getAttribute('href')?.includes('purchase-approval') &&
               el.getAttribute('href')?.includes('#step-')
    );
    expect(link).not.toBeUndefined();
    expect(link!.getAttribute('href')).toBe(`/walkthrough/purchase-approval#step-${INTAKE_ID}`);
  });

  it('Employee Offboarding link href is /walkthrough/employee-offboarding#step-{skillId}', () => {
    const { getAllByRole } = renderSkill(INTAKE_ID);
    const links = getAllByRole('link') as HTMLAnchorElement[];
    const link = links.find(
      (el) => el.getAttribute('href')?.includes('employee-offboarding') &&
               el.getAttribute('href')?.includes('#step-')
    );
    expect(link).not.toBeUndefined();
    expect(link!.getAttribute('href')).toBe(`/walkthrough/employee-offboarding#step-${INTAKE_ID}`);
  });
});

// ── Tests: section absent ─────────────────────────────────────────────────────

describe('See it in Action — section absent', () => {
  beforeEach(() => {
    mockWorkedExamplesList.splice(0, Infinity); // empty
  });

  it('does not render the "See it in Action" heading when no worked examples exist', () => {
    const { queryByRole } = renderSkill(INTAKE_ID);
    expect(queryByRole('heading', { name: /See it in Action/i })).toBeNull();
  });

  it('does not render any #step- anchor links when no worked examples exist', () => {
    const { queryAllByRole } = renderSkill(INTAKE_ID);
    const stepLinks = (queryAllByRole('link') as HTMLAnchorElement[]).filter(
      (el) => el.href.includes('#step-')
    );
    expect(stepLinks.length).toBe(0);
  });
});

// ── Tests: anchor IDs in example pages ───────────────────────────────────────

describe('Anchor IDs — ExampleStepTimeline', () => {
  const MINIMAL_BPMN = 'bpmn-beta\nstart s1 "S"\nend e1 "E"\ns1 --> e1';

  it('renders id="step-{skillId}" for every step in the Purchase Approval example', () => {
    const { container } = render(
      <ExampleStepTimeline
        steps={PURCHASE_APPROVAL_STEPS}
        bpmnSource={MINIMAL_BPMN}
        endLabel="PROC-2024-042 published"
        endStatusCode="published"
      />
    );
    for (const step of PURCHASE_APPROVAL_STEPS) {
      const el = container.querySelector(`#step-${step.skillId}`);
      expect(el, `expected #step-${step.skillId} to exist in Purchase Approval`).not.toBeNull();
    }
  });

  it('renders id="step-{skillId}" for every step in the Employee Offboarding example', () => {
    const { container } = render(
      <ExampleStepTimeline
        steps={EMPLOYEE_OFFBOARDING_STEPS}
        bpmnSource={MINIMAL_BPMN}
        endLabel="PROC-2025-108 packaged"
        endStatusCode="packaged"
      />
    );
    for (const step of EMPLOYEE_OFFBOARDING_STEPS) {
      const el = container.querySelector(`#step-${step.skillId}`);
      expect(el, `expected #step-${step.skillId} to exist in Employee Offboarding`).not.toBeNull();
    }
  });

  it('every stepSkillId in WORKED_EXAMPLES resolves to a real SKILLS entry', () => {
    const allStepIds = [
      ...PURCHASE_APPROVAL_STEPS.map((s) => s.skillId),
      ...EMPLOYEE_OFFBOARDING_STEPS.map((s) => s.skillId),
    ];
    const uniqueIds = [...new Set(allStepIds)];
    for (const id of uniqueIds) {
      const skill = SKILLS.find((s) => s.id === id);
      expect(skill, `skill "${id}" listed in example steps not found in SKILLS registry`).not.toBeUndefined();
    }
  });
});
