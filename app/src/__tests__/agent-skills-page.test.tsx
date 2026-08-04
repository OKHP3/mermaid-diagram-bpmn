// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import AgentSkills from '@/pages/AgentSkills';
import { SkillCard } from '@/components/skills/SkillCard';
import { SKILLS, PIPELINE_LAYERS, PNS_SECTIONS } from '@/data/skills-registry';

// ── Wouter ────────────────────────────────────────────────────────────────────
vi.mock('wouter', () => ({
  Link: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  useLocation: () => ['/', vi.fn()],
  useParams:   () => ({}),
}));

// ── Heavy sub-components ──────────────────────────────────────────────────────
vi.mock('@/components/skills/PipelineDiagram',       () => ({ PipelineDiagram:       () => <div data-testid="pipeline-diagram" /> }));
vi.mock('@/components/skills/DependencyFlowDiagram', () => ({ DependencyFlowDiagram: () => <div data-testid="dep-flow-diagram" /> }));
vi.mock('@/components/skills/PnsLifecycleTracker',   () => ({ PnsLifecycleTracker:   () => <div data-testid="pns-lifecycle" /> }));
vi.mock('@/components/skills/ZipDownloadButton',     () => ({ ZipDownloadButton:     ({ label }: { label: string }) => <button>{label}</button> }));
vi.mock('@/components/skills/DownloadButton',        () => ({ DownloadButton:        ({ label }: { label: string }) => <button>{label}</button> }));
vi.mock('@/components/skills/VariableFileCard',      () => ({ VariableFileCard:      () => <div data-testid="variable-file-card" /> }));
vi.mock('@/components/skills/SkillFrontmatterPreview', () => ({ SkillFrontmatterPreview: () => <div data-testid="frontmatter-preview" /> }));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to the Skills browser section so the grid is visible. */
function renderAndOpenBrowser() {
  const result = render(<AgentSkills />);
  // Click the "Skills" section tab to scroll to the browser section
  fireEvent.click(result.getByRole('button', { name: /^Skills$/ }));
  return result;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AgentSkills page — Skill Browser', () => {

  it('renders all 15 skill cards in the browser section', () => {
    const { getAllByText } = renderAndOpenBrowser();
    // Each SkillCard renders its pipeline-order badge as "XX/15"
    const orderBadges = getAllByText(/^\d{2}\/15$/);
    expect(orderBadges).toHaveLength(15);
  });

  it('shows the search input and accepts text', () => {
    const { getByPlaceholderText } = renderAndOpenBrowser();
    const input = getByPlaceholderText(/search skills/i);
    expect(input).not.toBeNull();
    fireEvent.change(input, { target: { value: 'intake' } });
    expect((input as HTMLInputElement).value).toBe('intake');
  });

  it('search "intake" narrows grid to the Process Intake & Scope card only', () => {
    const { getByPlaceholderText, getAllByText, queryAllByText } = renderAndOpenBrowser();
    const input = getByPlaceholderText(/search skills/i);
    fireEvent.change(input, { target: { value: 'intake' } });

    // Only one pipeline-order badge should be visible
    const remaining = getAllByText(/^\d{2}\/15$/);
    expect(remaining).toHaveLength(1);

    // It's the correct card
    expect(queryAllByText(/Process Intake & Scope/)).not.toHaveLength(0);
  });

  it('search with no matches shows "No skills match" message', () => {
    const { getByPlaceholderText, getByText } = renderAndOpenBrowser();
    const input = getByPlaceholderText(/search skills/i);
    fireEvent.change(input, { target: { value: 'zzz_no_match_zzz' } });
    expect(getByText(/No skills match your filters/i)).not.toBeNull();
  });

  it('clearing search restores all 15 cards', () => {
    const { getByPlaceholderText, getAllByText } = renderAndOpenBrowser();
    const input = getByPlaceholderText(/search skills/i);

    fireEvent.change(input, { target: { value: 'intake' } });
    expect(getAllByText(/^\d{2}\/15$/).length).toBeLessThan(15);

    fireEvent.change(input, { target: { value: '' } });
    expect(getAllByText(/^\d{2}\/15$/)).toHaveLength(15);
  });

  it('"Core Only" filter shows only core skills', () => {
    const { getByRole, getAllByText } = renderAndOpenBrowser();
    const coreCount = SKILLS.filter((s) => s.status === 'core').length;

    fireEvent.click(getByRole('button', { name: /^Core \(/ }));

    const badges = getAllByText(/^\d{2}\/15$/);
    expect(badges).toHaveLength(coreCount);
  });

  it('"Extensions Only" filter shows only extension skills', () => {
    const { getByRole, getAllByText } = renderAndOpenBrowser();
    const extCount = SKILLS.filter((s) => s.status === 'recommended-extension').length;

    fireEvent.click(getByRole('button', { name: /^Extensions \(/ }));

    const badges = getAllByText(/^\d{2}\/15$/);
    expect(badges).toHaveLength(extCount);
  });

  it('"All Skills" filter restores full set after a status filter', () => {
    const { getByRole, getAllByText } = renderAndOpenBrowser();

    fireEvent.click(getByRole('button', { name: /^Core \(/ }));
    fireEvent.click(getByRole('button', { name: /^All Skills \(/ }));

    expect(getAllByText(/^\d{2}\/15$/)).toHaveLength(15);
  });

  it('Discovery layer filter shows only Discovery skills', () => {
    const { getByRole, getAllByText } = renderAndOpenBrowser();
    const discoveryCount = SKILLS.filter((s) => s.layer === 1).length;

    fireEvent.click(getByRole('button', { name: /^Discovery$/ }));

    const badges = getAllByText(/^\d{2}\/15$/);
    expect(badges).toHaveLength(discoveryCount);
  });

  it('clicking the same layer button twice clears the layer filter', () => {
    const { getByRole, getAllByText } = renderAndOpenBrowser();

    fireEvent.click(getByRole('button', { name: /^Discovery$/ }));
    fireEvent.click(getByRole('button', { name: /^Discovery$/ }));

    expect(getAllByText(/^\d{2}\/15$/)).toHaveLength(15);
  });

  it('"All Layers" button clears a layer filter', () => {
    const { getByRole, getAllByText } = renderAndOpenBrowser();

    fireEvent.click(getByRole('button', { name: /^Discovery$/ }));
    fireEvent.click(getByRole('button', { name: /All Layers/i }));

    expect(getAllByText(/^\d{2}\/15$/)).toHaveLength(15);
  });

  it('status + layer filters combine correctly', () => {
    const { getByRole, getAllByText, queryAllByText } = renderAndOpenBrowser();

    const layer = PIPELINE_LAYERS[0]; // Discovery
    const combined = SKILLS.filter(
      (s) => s.status === 'core' && s.layer === layer.id
    );

    fireEvent.click(getByRole('button', { name: /^Core \(/ }));
    fireEvent.click(getByRole('button', { name: new RegExp(`^${layer.label}$`) }));

    if (combined.length === 0) {
      expect(queryAllByText(/^\d{2}\/15$/)).toHaveLength(0);
    } else {
      expect(getAllByText(/^\d{2}\/15$/)).toHaveLength(combined.length);
    }
  });

  it('results count line appears when a filter is active', () => {
    const { getByRole, getByText } = renderAndOpenBrowser();
    fireEvent.click(getByRole('button', { name: /^Core \(/ }));
    expect(getByText(/Showing \d+ of 15 skills/)).not.toBeNull();
  });

  it('"Clear filters" button inside empty state resets everything', () => {
    const { getByPlaceholderText, getAllByText, getByRole } = renderAndOpenBrowser();
    const input = getByPlaceholderText(/search skills/i);

    fireEvent.change(input, { target: { value: 'zzz_no_match_zzz' } });

    const clearBtn = getByRole('button', { name: /Clear filters/i });
    fireEvent.click(clearBtn);

    expect(getAllByText(/^\d{2}\/15$/)).toHaveLength(15);
  });
});

describe('AgentSkills page — PNS Schema accordion', () => {

  it('PNS section is collapsed by default — "Expand PNS schema viewer" hint is visible', () => {
    const { getByText } = render(<AgentSkills />);
    expect(getByText(/Expand PNS schema viewer/i)).not.toBeNull();
  });

  it('clicking the PNS toggle expands the section', () => {
    const { getByRole, queryByText } = render(<AgentSkills />);

    // The content should not be visible before expanding
    expect(
      queryByText(/Every skill in BP-SKILL either reads or writes/i)
    ).toBeNull();

    // Find the toggle via the h2 heading inside it
    const h2 = getByRole('heading', { level: 2, name: /The Process Narrative Specification — The Handoff Artifact/i });
    const toggle = h2.closest('button')!;
    expect(toggle).not.toBeNull();
    fireEvent.click(toggle);

    expect(
      queryByText(/Every skill in BP-SKILL either reads or writes/i)
    ).not.toBeNull();
  });

  it('"Expand PNS schema viewer" hint disappears after expanding', () => {
    const { getByRole, queryByText } = render(<AgentSkills />);

    const h2 = getByRole('heading', { level: 2, name: /The Process Narrative Specification — The Handoff Artifact/i });
    fireEvent.click(h2.closest('button')!);

    expect(queryByText(/Expand PNS schema viewer/i)).toBeNull();
  });

  it('"Expand PNS schema viewer ↓" button also expands the section', () => {
    const { getByText, queryByText } = render(<AgentSkills />);

    fireEvent.click(getByText(/Expand PNS schema viewer/i));

    expect(
      queryByText(/Every skill in BP-SKILL either reads or writes/i)
    ).not.toBeNull();
  });

  it('clicking the PNS toggle again collapses the section', () => {
    const { getByRole, queryByText } = render(<AgentSkills />);

    const h2 = getByRole('heading', { level: 2, name: /The Process Narrative Specification — The Handoff Artifact/i });
    const toggle = h2.closest('button')!;
    fireEvent.click(toggle); // expand
    fireEvent.click(toggle); // collapse

    expect(
      queryByText(/Every skill in BP-SKILL either reads or writes/i)
    ).toBeNull();
  });
});

describe('AgentSkills page — section tab navigation', () => {

  it('renders all five section tab buttons', () => {
    const { getAllByRole } = render(<AgentSkills />);
    // Tab labels that are unique in the nav strip; use getAllByRole since some
    // labels ("PNS Schema", "Skills") also appear on other page elements.
    const hasButton = (name: RegExp) =>
      getAllByRole('button', { name }).length >= 1;

    expect(hasButton(/The Standard/i)).toBe(true);
    expect(hasButton(/^Pipeline$/i)).toBe(true);
    expect(hasButton(/^Skills$/i)).toBe(true);
    expect(hasButton(/Variable Layer/i)).toBe(true);
    expect(hasButton(/PNS Schema/i)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SkillCard — description expand / collapse
// ─────────────────────────────────────────────────────────────────────────────
// These tests render SkillCard in isolation so they remain fast and focused.
// DownloadButton and wouter Link are already mocked above.

describe('SkillCard — description expand/collapse', () => {

  // Use the first skill whose description exceeds the 120-char threshold.
  const longSkill = SKILLS.find(s => s.description.length > 120);
  if (!longSkill) throw new Error('Test setup: no skill with description > 120 chars found in SKILLS');

  const shortSkill = {
    ...SKILLS[0],
    id: '_test_short',
    description: 'Short description that fits within the 120-character limit easily.',
  };

  it('shows a truncated description (ending with "…") and a "More" button when description exceeds 120 chars', () => {
    const { container, getByRole } = render(<SkillCard skill={longSkill} />);
    const descPara = container.querySelector('p.text-xs');
    expect(descPara?.textContent).toMatch(/…/);
    expect(getByRole('button', { name: 'More' })).not.toBeNull();
  });

  it('clicking "More" reveals the full description and changes the button to "Less"', () => {
    const { container, getByRole } = render(<SkillCard skill={longSkill} />);
    fireEvent.click(getByRole('button', { name: 'More' }));

    // Button label flips to "Less"
    expect(getByRole('button', { name: 'Less' })).not.toBeNull();

    // Paragraph now contains text beyond the first 120 chars (no truncation marker)
    const descPara = container.querySelector('p.text-xs');
    const fullText = longSkill.description;
    expect(descPara?.textContent).toContain(fullText.slice(120));
  });

  it('clicking "Less" after expand re-truncates the description', () => {
    const { container, getByRole } = render(<SkillCard skill={longSkill} />);
    fireEvent.click(getByRole('button', { name: 'More' }));
    fireEvent.click(getByRole('button', { name: 'Less' }));

    // Back to truncated state
    expect(getByRole('button', { name: 'More' })).not.toBeNull();
    const descPara = container.querySelector('p.text-xs');
    expect(descPara?.textContent).toMatch(/…/);
    // Full text beyond 120 chars is no longer in the paragraph
    expect(descPara?.textContent).not.toContain(longSkill.description.slice(121));
  });

  it('does not render a "More" or "Less" button when the description fits within 120 chars', () => {
    const { queryByRole } = render(<SkillCard skill={shortSkill} />);
    expect(queryByRole('button', { name: 'More' })).toBeNull();
    expect(queryByRole('button', { name: 'Less' })).toBeNull();
  });

  it('shows the full short description without truncation', () => {
    const { container } = render(<SkillCard skill={shortSkill} />);
    const descPara = container.querySelector('p.text-xs');
    expect(descPara?.textContent).toContain(shortSkill.description);
    expect(descPara?.textContent).not.toMatch(/…/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS registry — Core/Extension status integrity
// ─────────────────────────────────────────────────────────────────────────────
// Pure data tests — no rendering. If a new skill is added with a wrong or
// missing status field these fail immediately, before any UI test runs.

describe('SKILLS registry — Core/Extension status counts', () => {

  it('has exactly 12 skills with status "core"', () => {
    const coreSkills = SKILLS.filter((s) => s.status === 'core');
    expect(
      coreSkills,
      `Expected 12 core skills but got ${coreSkills.length}: ${coreSkills.map(s => s.id).join(', ')}`
    ).toHaveLength(12);
  });

  it('has exactly 3 skills with status "recommended-extension"', () => {
    const extSkills = SKILLS.filter((s) => s.status === 'recommended-extension');
    expect(
      extSkills,
      `Expected 3 extension skills but got ${extSkills.length}: ${extSkills.map(s => s.id).join(', ')}`
    ).toHaveLength(3);
  });

  it('every skill status is either "core" or "recommended-extension"', () => {
    const valid = new Set<string>(['core', 'recommended-extension']);
    for (const skill of SKILLS) {
      expect(
        valid.has(skill.status),
        `${skill.id} has unexpected status "${skill.status}"`
      ).toBe(true);
    }
  });

  it('"Core Only" filter shows exactly the 12 core skills — no extension skills visible', () => {
    const { getByRole, queryByText } = renderAndOpenBrowser();
    fireEvent.click(getByRole('button', { name: /^Core \(/ }));

    // No extension skill name should appear in the filtered grid
    const extSkills = SKILLS.filter((s) => s.status === 'recommended-extension');
    for (const ext of extSkills) {
      expect(
        queryByText(ext.displayName),
        `Extension skill "${ext.displayName}" was visible after Core Only filter`
      ).toBeNull();
    }
  });

  it('"Extensions Only" filter shows exactly the 3 extension skills — no core skills visible', () => {
    const { getByRole, queryByText } = renderAndOpenBrowser();
    fireEvent.click(getByRole('button', { name: /^Extensions \(/ }));

    // No core skill name should appear in the filtered grid
    const coreSkills = SKILLS.filter((s) => s.status === 'core');
    for (const core of coreSkills) {
      expect(
        queryByText(core.displayName),
        `Core skill "${core.displayName}" was visible after Extensions Only filter`
      ).toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AgentSkills page — PNS section rows (inner accordion)
// ─────────────────────────────────────────────────────────────────────────────

describe('AgentSkills page — PNS section rows', () => {

  /** Render the page and open the outer PNS toggle so the inner accordion is mounted. */
  function renderAndOpenPns() {
    const result = render(<AgentSkills />);
    const h2 = result.getByRole('heading', {
      level: 2,
      name: /The Process Narrative Specification — The Handoff Artifact/i,
    });
    fireEvent.click(h2.closest('button')!);
    return result;
  }

  it('renders all 13 section row buttons once the PNS panel is open', () => {
    const { getAllByRole } = renderAndOpenPns();
    // Every section title is unique — verify each one has a clickable button.
    const sectionButtons = PNS_SECTIONS.map(sec =>
      getAllByRole('button', { name: new RegExp(sec.title, 'i') })
    );
    expect(sectionButtons).toHaveLength(PNS_SECTIONS.length); // 13
    sectionButtons.forEach(btns => expect(btns.length).toBeGreaterThanOrEqual(1));
  });

  it('clicking a section row reveals the Documents, Standard, and Not Applicable? column headings', () => {
    const { getByRole, getByText } = renderAndOpenPns();
    fireEvent.click(getByRole('button', { name: /Process Identification/i }));

    expect(getByText('Documents')).not.toBeNull();
    expect(getByText('Standard')).not.toBeNull();
    expect(getByText('Not Applicable?')).not.toBeNull();
  });

  it('clicking a section row shows that section\'s actual content', () => {
    const { getByRole, getByText } = renderAndOpenPns();
    const sec = PNS_SECTIONS[0]; // Process Identification
    fireEvent.click(getByRole('button', { name: new RegExp(sec.title, 'i') }));

    // The documents text is rendered verbatim in a <p> inside the expanded panel.
    expect(getByText(sec.documents)).not.toBeNull();
  });

  it('clicking the same row again collapses it and hides its content', () => {
    const { getByRole, queryByText } = renderAndOpenPns();
    const sec = PNS_SECTIONS[0];
    const rowBtn = getByRole('button', { name: new RegExp(sec.title, 'i') });

    fireEvent.click(rowBtn); // open
    expect(queryByText(sec.documents)).not.toBeNull();

    fireEvent.click(rowBtn); // close
    expect(queryByText(sec.documents)).toBeNull();
  });

  it('opening a second row closes the first — only one row is open at a time', () => {
    const { getByRole, queryByText } = renderAndOpenPns();
    const first  = PNS_SECTIONS[0]; // Process Identification
    const second = PNS_SECTIONS[1]; // Scope & Boundaries

    fireEvent.click(getByRole('button', { name: new RegExp(first.title,  'i') }));
    expect(queryByText(first.documents)).not.toBeNull();

    fireEvent.click(getByRole('button', { name: new RegExp(second.title, 'i') }));

    // First row content gone, second row content visible
    expect(queryByText(first.documents)).toBeNull();
    expect(queryByText(second.documents)).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SkillCard — 'View Details' link href
// ─────────────────────────────────────────────────────────────────────────────
// Verifies that the "View Details" anchor href matches the skill's id.
// Wouter's <Link> is already mocked as a plain <a> at the top of this file,
// so getAttribute('href') returns the raw value passed to href={...}.

describe('SkillCard — "View Details" link routes to the correct skill page', () => {

  it('renders a "View Details" anchor with href="/skills/<skill.id>"', () => {
    const skill = SKILLS[0];
    const { getByRole } = render(<SkillCard skill={skill} />);
    const link = getByRole('link', { name: /View Details/i });
    expect(link.getAttribute('href')).toBe(`/skills/${skill.id}`);
  });

  it('every skill in SKILLS produces a "View Details" link with the matching href', () => {
    for (const skill of SKILLS) {
      const { getByRole, unmount } = render(<SkillCard skill={skill} />);
      const link = getByRole('link', { name: /View Details/i });
      expect(
        link.getAttribute('href'),
        `SkillCard for "${skill.id}" had wrong View Details href`,
      ).toBe(`/skills/${skill.id}`);
      unmount();
    }
  });

  it('the browser grid renders a "View Details" link for every skill id', () => {
    const { getAllByRole } = renderAndOpenBrowser();
    const links = getAllByRole('link', { name: /View Details/i });
    const hrefs = links.map(l => l.getAttribute('href'));

    for (const skill of SKILLS) {
      expect(
        hrefs,
        `No "View Details" link found for skill "${skill.id}"`,
      ).toContain(`/skills/${skill.id}`);
    }
  });

  it('no two skill cards share the same "View Details" href', () => {
    const { getAllByRole } = renderAndOpenBrowser();
    const hrefs = getAllByRole('link', { name: /View Details/i })
      .map(l => l.getAttribute('href'));
    const unique = new Set(hrefs);
    expect(unique.size).toBe(hrefs.length);
  });
});
