// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import SkillDetail from '@/pages/SkillDetail';
import { SKILLS, PNS_LIFECYCLE } from '@/data/skills-registry';
import { PNS_TRANSITIONS } from '@/data/pns-transitions';
import { PnsLifecycleTracker } from '@/components/skills/PnsLifecycleTracker';
import { PURCHASE_APPROVAL_NODE_LINKS } from '@/pages/PurchaseApprovalExample';

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

// ─────────────────────────────────────────────────────────────────────────────
// PNS transition data integrity
// ─────────────────────────────────────────────────────────────────────────────
// Pure data tests — no rendering. A data-entry error or stale generated file
// would surface here without requiring a browser to open.

describe('PNS transition data — integrity against PNS_LIFECYCLE', () => {

  const validStatuses = new Set(PNS_LIFECYCLE.map(s => s.status));

  it('all 15 SKILLS have an entry in PNS_TRANSITIONS', () => {
    for (const skill of SKILLS) {
      expect(
        PNS_TRANSITIONS,
        `${skill.id} is missing from PNS_TRANSITIONS`
      ).toHaveProperty(skill.id);
    }
  });

  it.each(
    Object.entries(PNS_TRANSITIONS)
      .filter(([, t]) => t.after !== null)
      .map(([id, t]) => ({ id, after: t.after! }))
  )('$id — after="$after" is a recognised PNS_LIFECYCLE status', ({ id, after }) => {
    expect(
      validStatuses.has(after),
      `${id}: after="${after}" does not match any status in PNS_LIFECYCLE`
    ).toBe(true);
  });

  it.each(
    Object.entries(PNS_TRANSITIONS)
      .filter(([, t]) => t.before !== null)
      .map(([id, t]) => ({ id, before: t.before! }))
  )('$id — before="$before" is a recognised PNS_LIFECYCLE status', ({ id, before }) => {
    expect(
      validStatuses.has(before),
      `${id}: before="${before}" does not match any status in PNS_LIFECYCLE`
    ).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SkillDetail — PNS lifecycle stage highlighted for each skill
// ─────────────────────────────────────────────────────────────────────────────
// Renders the full SkillDetail page (PnsLifecycleTracker is NOT mocked, so the
// real component executes) and asserts the highlighted pill matches the skill's
// PNS_TRANSITIONS[id].after value.
//
// Discriminating signal: the active pill is the ONLY pill with
// `style="border-width: 1.5px"`. All inactive pills use `border-width: 1px`.
// Checking this inline style value avoids false positives from label presence
// alone (every status label renders in both desktop and mobile slots).

describe('SkillDetail — PNS lifecycle stage highlighted for each skill', () => {

  /**
   * Locate the pill div marked as active by the lifecycle tracker.
   * The active pill renders with aria-current="step"; inactive pills have no
   * aria-current attribute.  This is stable across CSS refactors that move
   * the visual active indicator (border-width, box-shadow, etc.).
   * Returns undefined when no stage is active.
   */
  function findActivePill(container: HTMLElement): HTMLElement | undefined {
    return container.querySelector('[aria-current="step"]') as HTMLElement | undefined ?? undefined;
  }

  it.each(
    SKILLS
      .filter((s) => {
        const t = PNS_TRANSITIONS[s.id];
        return t !== undefined && t.after !== null;
      })
      .map((s) => ({ id: s.id, displayName: s.displayName, after: PNS_TRANSITIONS[s.id].after! }))
  )('$displayName — active pill text is "$after"', ({ id, after }) => {
    const { container } = renderSkill(id);
    const activePill = findActivePill(container);
    expect(
      activePill,
      `SkillDetail for ${id}: expected an active pill (aria-current="step") for after="${after}"`
    ).not.toBeUndefined();
    expect(activePill!.textContent?.trim()).toBe(after);
  });

  it.each(
    SKILLS
      .filter((s) => PNS_TRANSITIONS[s.id]?.after === null)
      .map((s) => ({ id: s.id, displayName: s.displayName }))
  )('$displayName (after: null) — no active pill is rendered', ({ id }) => {
    const { container } = renderSkill(id);
    const activePill = findActivePill(container);
    expect(
      activePill,
      `SkillDetail for ${id}: expected no active pill when after=null`
    ).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PnsLifecycleTracker — mobile scroll on mount
// ─────────────────────────────────────────────────────────────────────────────
// Verifies the useEffect fires scrollIntoView on the active mobile row element
// when activeStatus is set, and does NOT fire when activeStatus is absent.
// Also verifies the prefers-reduced-motion branch switches to instant scrolling.
//
// scrollIntoView is not natively implemented in happy-dom, so it is replaced
// with a vi.fn() for the duration of each test and restored in afterEach.

describe('PnsLifecycleTracker — mobile scroll on mount', () => {

  let scrollIntoViewMock: ReturnType<typeof vi.fn>;
  let originalScrollIntoView: typeof HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    scrollIntoViewMock = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock as unknown as typeof HTMLElement.prototype.scrollIntoView;
  });

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    vi.restoreAllMocks();
  });

  it('calls scrollIntoView once with smooth scroll when activeStatus is set', () => {
    // happy-dom's matchMedia returns matches: false by default → smooth
    render(<PnsLifecycleTracker activeStatus="draft-intake" compact />);
    expect(scrollIntoViewMock).toHaveBeenCalledOnce();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });
  });

  it('does not call scrollIntoView when activeStatus is not provided', () => {
    render(<PnsLifecycleTracker compact />);
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('uses instant scroll behavior when prefers-reduced-motion is active', () => {
    // Override matchMedia to signal reduced-motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    render(<PnsLifecycleTracker activeStatus="modeled" compact />);
    expect(scrollIntoViewMock).toHaveBeenCalledOnce();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'instant', block: 'nearest' });
  });

  // ── aria-current="step" parity — mobile pill ───────────────────────────────
  // In happy-dom both the hidden sm:flex (desktop) and sm:hidden (mobile)
  // sections are present in the DOM simultaneously, so querySelectorAll finds
  // one element per layout. The test uses the CODE tag to target the mobile
  // element specifically (the non-linked path, withAnchors=false by default).

  it('active mobile code element carries aria-current="step" (non-linked path)', () => {
    const { container } = render(<PnsLifecycleTracker activeStatus="draft-intake" compact />);

    // Both layouts render in happy-dom → expect exactly two [aria-current="step"] elements
    const allActive = container.querySelectorAll('[aria-current="step"]');
    expect(
      allActive.length,
      'expected exactly 2 aria-current="step" elements (desktop pill + mobile code)',
    ).toBe(2);

    // Mobile non-linked path renders a <code> element with aria-current="step"
    const mobileCode = Array.from(allActive).find(el => el.tagName === 'CODE') as HTMLElement | undefined;
    expect(
      mobileCode,
      'expected a <code> element with aria-current="step" (mobile non-linked path)',
    ).not.toBeUndefined();
    expect(mobileCode!.textContent?.trim()).toBe('draft-intake');
  });

  it('no aria-current="step" elements when activeStatus is not set', () => {
    const { container } = render(<PnsLifecycleTracker compact />);
    const allActive = container.querySelectorAll('[aria-current="step"]');
    expect(allActive.length).toBe(0);
  });
});

// ── RACI & SIPOC PNS transition data ─────────────────────────────────────────
//
// These two skills consume PNS.md [modeled] but do not advance the lifecycle
// status (after: null). Pinning their transition values here ensures a future
// registry edit cannot silently drop the badges that appear on the skill
// detail page and on the walked-through examples.
describe('PNS transition data — RACI & SIPOC governance skills', () => {
  const RACI_ID  = 'okhp3-raci-governance-matrix';
  const SIPOC_ID = 'okhp3-sipoc-generation';

  it('RACI has an entry in PNS_TRANSITIONS', () => {
    expect(PNS_TRANSITIONS).toHaveProperty(RACI_ID);
  });

  it('SIPOC has an entry in PNS_TRANSITIONS', () => {
    expect(PNS_TRANSITIONS).toHaveProperty(SIPOC_ID);
  });

  it('RACI reads PNS.md [modeled] — before is "modeled"', () => {
    expect(PNS_TRANSITIONS[RACI_ID].before).toBe('modeled');
  });

  it('SIPOC reads PNS.md [modeled] — before is "modeled"', () => {
    expect(PNS_TRANSITIONS[SIPOC_ID].before).toBe('modeled');
  });

  it('RACI does not advance PNS lifecycle (after is null)', () => {
    expect(PNS_TRANSITIONS[RACI_ID].after).toBeNull();
  });

  it('SIPOC does not advance PNS lifecycle (after is null)', () => {
    expect(PNS_TRANSITIONS[SIPOC_ID].after).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Diagram node links — data integrity
// ─────────────────────────────────────────────────────────────────────────────
// Verifies that every /skills/<id> path in a node-link map resolves to a real
// skill in SKILLS. A typo or stale skill id produces a 404 that would otherwise
// ship silently — these tests catch it at the data level.

describe('PURCHASE_APPROVAL_NODE_LINKS — all paths point to real skill pages', () => {
  const skillIds = new Set(SKILLS.map(s => s.id));

  it('every node link value is a /skills/<id> path', () => {
    for (const [node, path] of Object.entries(PURCHASE_APPROVAL_NODE_LINKS)) {
      expect(
        path,
        `Node "${node}" has a malformed path: "${path}" (expected /skills/<id>)`,
      ).toMatch(/^\/skills\//);
    }
  });

  it('every node link target id matches a real skill in SKILLS', () => {
    for (const [node, path] of Object.entries(PURCHASE_APPROVAL_NODE_LINKS)) {
      const id = path.replace('/skills/', '');
      expect(
        skillIds.has(id),
        `Node "${node}" links to "/skills/${id}" but no skill with that id exists in SKILLS`,
      ).toBe(true);
    }
  });

  it('has at least one node link (map is not empty)', () => {
    expect(Object.keys(PURCHASE_APPROVAL_NODE_LINKS).length).toBeGreaterThan(0);
  });
});
