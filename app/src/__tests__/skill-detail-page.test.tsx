// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import SkillDetail from '@/pages/SkillDetail';
import { SKILLS } from '@/data/skills-registry';

// ── Wouter ────────────────────────────────────────────────────────────────────
// useParams is overridden per-test via the mock factory below.
const mockUseParams = vi.fn();

vi.mock('wouter', () => ({
  useParams: () => mockUseParams(),
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ['/', vi.fn()],
}));

// ── Heavy sub-components ──────────────────────────────────────────────────────
vi.mock('@/components/skills/PnsBadge',              () => ({ PnsBadge:              () => <div data-testid="pns-badge" /> }));
vi.mock('@/components/skills/SkillMiniCard',         () => ({ SkillMiniCard:         ({ skill }: { skill: { displayName: string } }) => <div data-testid="skill-mini-card">{skill.displayName}</div> }));
vi.mock('@/components/skills/SkillFrontmatterPreview', () => ({ SkillFrontmatterPreview: () => <div data-testid="frontmatter-preview" /> }));
vi.mock('@/components/skills/InstallTabs',           () => ({ InstallTabs:           () => <div data-testid="install-tabs" /> }));
vi.mock('@/components/skills/DownloadButton',        () => ({ DownloadButton:        ({ label }: { label: string }) => <button>{label}</button> }));

// ── Helpers ───────────────────────────────────────────────────────────────────
const INTAKE_ID = 'okhp3-process-intake-and-scope';
const INTAKE_SKILL = SKILLS.find((s) => s.id === INTAKE_ID)!;

function renderSkill(skillId: string) {
  mockUseParams.mockReturnValue({ skillId });
  return render(<SkillDetail />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SkillDetail page — process-intake-and-scope', () => {

  it('renders the correct skill display name as h1', () => {
    const { getByRole } = renderSkill(INTAKE_ID);
    const heading = getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe(INTAKE_SKILL.displayName);
  });

  it('shows the CORE badge', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText(/^CORE$/i)).not.toBeNull();
  });

  it('shows the Discovery layer badge', () => {
    const { getAllByText } = renderSkill(INTAKE_ID);
    // Layer label appears in the badges row
    const badges = getAllByText(/^Discovery$/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows the "Skill 01 of 15" pipeline-order badge', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText(/Skill 01 of 15/i)).not.toBeNull();
  });

  it('shows the skill description', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    // Description is truncated to 160 chars for meta but rendered in full on page
    expect(getByText(INTAKE_SKILL.description)).not.toBeNull();
  });

  it('shows the Purpose section', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText(/Purpose/i)).not.toBeNull();
    expect(getByText(INTAKE_SKILL.purpose)).not.toBeNull();
  });

  it('renders all trigger phrases', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    for (const phrase of INTAKE_SKILL.triggerPhrases) {
      expect(getByText(new RegExp(phrase, 'i'))).not.toBeNull();
    }
  });

  it('shows the Trigger Phrases section heading', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText(/Trigger Phrases/i)).not.toBeNull();
  });

  it('shows the Compatible With section', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText(/Compatible With/i)).not.toBeNull();
  });

  it('shows the Pipeline Position section', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText(/Pipeline Position/i)).not.toBeNull();
  });

  it('shows Consumes and Produces sections', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    expect(getByText(/Consumes/i)).not.toBeNull();
    expect(getByText(/Produces/i)).not.toBeNull();
  });

  it('shows the breadcrumb link back to /skills', () => {
    const { getByText } = renderSkill(INTAKE_ID);
    const breadcrumb = getByText(/Agent Skills/i).closest('a');
    expect(breadcrumb).not.toBeNull();
    expect(breadcrumb!.getAttribute('href')).toBe('/skills');
  });

  it('shows a next-skill link (skill 01 has no prev but has a next)', () => {
    const { getAllByText } = renderSkill(INTAKE_ID);
    const nextSkill = SKILLS.find((s) => s.pipelineOrder === 2)!;
    // The next skill name appears in the pipeline position link (and possibly the SkillMiniCard stub)
    const matches = getAllByText(new RegExp(nextSkill.displayName));
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe('SkillDetail page — a mid-pipeline skill (pipelineOrder > 1)', () => {

  it('shows both prev and next skill in the pipeline position widget', () => {
    // Use skill 5 which has both a predecessor and successor
    const midSkill = SKILLS.find((s) => s.pipelineOrder === 5)!;
    const prevSkill = SKILLS.find((s) => s.pipelineOrder === 4)!;
    const nextSkill = SKILLS.find((s) => s.pipelineOrder === 6)!;

    const { getAllByText } = renderSkill(midSkill.id);

    // Names may appear in both the pipeline position link and the SkillMiniCard stub
    expect(getAllByText(new RegExp(prevSkill.displayName)).length).toBeGreaterThan(0);
    expect(getAllByText(new RegExp(nextSkill.displayName)).length).toBeGreaterThan(0);
  });

  it('shows EXTENSION badge for a recommended-extension skill', () => {
    const extSkill = SKILLS.find((s) => s.status === 'recommended-extension')!;
    const { getByText } = renderSkill(extSkill.id);
    expect(getByText(/^EXTENSION$/i)).not.toBeNull();
  });
});

describe('SkillDetail page — 404 for unknown skill', () => {

  it('renders a 404 message for an unknown skill id', () => {
    const { getByText } = renderSkill('not-a-real-skill');
    expect(getByText(/404/i)).not.toBeNull();
    expect(getByText(/Skill not found/i)).not.toBeNull();
  });

  it('shows the unrecognised id in the 404 message', () => {
    const { getByText } = renderSkill('not-a-real-skill');
    expect(getByText(/not-a-real-skill/)).not.toBeNull();
  });

  it('shows a "Back to All Skills" link pointing to /skills on 404', () => {
    const { getByRole } = renderSkill('not-a-real-skill');
    const link = getByRole('link', { name: /Back to All Skills/i });
    expect(link.getAttribute('href')).toBe('/skills');
  });
});
