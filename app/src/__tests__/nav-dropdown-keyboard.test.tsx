// @vitest-environment happy-dom
/**
 * Nav dropdown keyboard navigation
 *
 * Covers: open → first-item focus, arrow keys, Escape (return focus), Tab (close only).
 * The Layout component is rendered in isolation; wouter and usePageTracking are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { Layout } from '@/components/Layout';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRoute = vi.hoisted(() => ({ location: '/' }));
const mockLoadMermaidHostDemo = vi.hoisted(() => vi.fn(() => Promise.resolve({ default: () => null })));

vi.mock('wouter', () => ({
  Link: ({
    href,
    children,
    ref: _ref,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; ref?: unknown }) => (
    <a href={href} {...rest} ref={_ref as React.Ref<HTMLAnchorElement>}>
      {children}
    </a>
  ),
  useLocation: () => [mockRoute.location, vi.fn()],
}));

vi.mock('@/hooks/usePageTracking', () => ({ usePageTracking: () => {} }));
vi.mock('@/lib/route-loaders', () => ({ loadMermaidHostDemo: mockLoadMermaidHostDemo }));

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderLayout() {
  return render(<Layout><div>content</div></Layout>);
}

function getDropdownTrigger(
  container: HTMLElement,
  testId: 'nav-plugin-dropdown' | 'nav-learn-dropdown',
) {
  const el = container.querySelector(`[data-testid="${testId}"]`);
  if (!el) throw new Error(`Trigger "${testId}" not found`);
  return el as HTMLButtonElement;
}

function getDropdownItems(container: HTMLElement) {
  const menu = container.querySelector('[role="menu"]');
  if (!menu) throw new Error('role="menu" panel not found — is the dropdown open?');
  return Array.from(menu.querySelectorAll('[role="menuitem"]')) as HTMLAnchorElement[];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NavDropdown — keyboard navigation', () => {
  beforeEach(() => {
    mockRoute.location = '/';
    vi.clearAllMocks();
  });

  describe('Home logo keyboard access', () => {
    it('is a focusable Home link with a visible-focus style hook', () => {
      const { container } = renderLayout();
      const logo = container.querySelector('[data-testid="link-home-logo"]') as HTMLAnchorElement;

      expect(logo.getAttribute('href')).toBe('/');
      expect(logo.tabIndex).toBeGreaterThanOrEqual(0);
      expect(logo.classList.contains('forge-home-logo')).toBe(true);

      act(() => { logo.focus(); });
      expect(document.activeElement).toBe(logo);
    });

    it('appears before the Playground link in the header tab order', () => {
      const { container } = renderLayout();
      const logo = container.querySelector('[data-testid="link-home-logo"]') as HTMLAnchorElement;
      const playground = container.querySelector('[data-testid="nav-playground"]') as HTMLAnchorElement;

      expect(logo.compareDocumentPosition(playground) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    });
  });

  describe('Plugin ▾ dropdown', () => {

    it.each([
      '/plugin',
      '/mermaid-host-demo',
      '/comparison',
    ])('shows Plugin as active on %s', (route) => {
      mockRoute.location = route;

      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      expect(trigger.classList.contains('forge-nav-link--active')).toBe(true);
    });

    it('opens the panel and moves focus to the first item on click', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });

      const items = getDropdownItems(container);
      expect(items.length).toBeGreaterThan(0);
      expect(document.activeElement).toBe(items[0]);
    });

    it('ArrowDown moves focus from first to second item', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);

      act(() => { fireEvent.keyDown(items[0], { key: 'ArrowDown' }); });
      expect(document.activeElement).toBe(items[1]);
    });

    it('ArrowDown wraps from last item back to first', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);
      const last = items[items.length - 1];

      act(() => { fireEvent.keyDown(last, { key: 'ArrowDown' }); });
      expect(document.activeElement).toBe(items[0]);
    });

    it('ArrowUp moves focus from second to first item', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);

      // Manually focus second item
      act(() => { items[1].focus(); });
      act(() => { fireEvent.keyDown(items[1], { key: 'ArrowUp' }); });
      expect(document.activeElement).toBe(items[0]);
    });

    it('ArrowUp wraps from first item to last', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);

      act(() => { fireEvent.keyDown(items[0], { key: 'ArrowUp' }); });
      expect(document.activeElement).toBe(items[items.length - 1]);
    });

    it('Escape closes the panel and returns focus to the trigger', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);

      act(() => { fireEvent.keyDown(items[0], { key: 'Escape' }); });

      // Panel should be gone
      expect(container.querySelector('[role="menu"]')).toBeNull();
      // Focus should be back on the trigger
      expect(document.activeElement).toBe(trigger);
    });

    it('Tab closes the panel without forcing focus back to trigger', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);

      act(() => { fireEvent.keyDown(items[0], { key: 'Tab' }); });

      expect(container.querySelector('[role="menu"]')).toBeNull();
      // Focus is NOT forced back to trigger (Tab lets browser advance naturally)
      expect(document.activeElement).not.toBe(trigger);
    });

    it('open → ArrowDown → select via Enter navigates correctly', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);

      // Move to second item
      act(() => { fireEvent.keyDown(items[0], { key: 'ArrowDown' }); });
      expect(document.activeElement).toBe(items[1]);

      // Activate via click (simulates Enter on a link)
      act(() => { fireEvent.click(items[1]); });

      // Panel closes after selection
      expect(container.querySelector('[role="menu"]')).toBeNull();
    });

    it('prefetches the Host Demo chunk when its link is hovered or focused', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const hostDemoLink = container.querySelector('a[href="/mermaid-host-demo"]') as HTMLAnchorElement;
      expect(hostDemoLink).toBeTruthy();

      act(() => { fireEvent.mouseEnter(hostDemoLink); });
      expect(mockLoadMermaidHostDemo).toHaveBeenCalledTimes(1);

      act(() => { fireEvent.focus(hostDemoLink); });
      expect(mockLoadMermaidHostDemo).toHaveBeenCalledTimes(2);
    });
  });

  describe('Learn ▾ dropdown', () => {

    it.each([
      '/walkthrough',
      '/walkthrough/purchase-approval',
      '/walkthrough/employee-offboarding',
      '/dsl',
      '/architecture',
      '/roadmap',
      '/about',
    ])('shows Learn as active on %s', (route) => {
      mockRoute.location = route;

      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-learn-dropdown');

      expect(trigger.classList.contains('forge-nav-link--active')).toBe(true);
    });

    it('opens the panel and moves focus to the first item', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-learn-dropdown');

      act(() => { fireEvent.click(trigger); });

      const items = getDropdownItems(container);
      expect(items.length).toBeGreaterThan(0);
      expect(document.activeElement).toBe(items[0]);
    });

    it('Escape closes the Learn panel and returns focus to its trigger', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-learn-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);

      act(() => { fireEvent.keyDown(items[0], { key: 'Escape' }); });

      expect(container.querySelector('[role="menu"]')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('Trigger button keyboard shortcuts', () => {

    it('ArrowDown on the trigger opens the dropdown and focuses the first item', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { trigger.focus(); });
      act(() => { fireEvent.keyDown(trigger, { key: 'ArrowDown' }); });

      const items = getDropdownItems(container);
      expect(items.length).toBeGreaterThan(0);
      expect(document.activeElement).toBe(items[0]);
    });

    it('Escape on a closed trigger does nothing visible', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { trigger.focus(); });
      act(() => { fireEvent.keyDown(trigger, { key: 'Escape' }); });

      expect(container.querySelector('[role="menu"]')).toBeNull();
    });
  });

  describe('Mobile menu keyboard dismissal', () => {
    it('prefetches the Host Demo chunk when its mobile menu item is tapped', () => {
      const { container } = renderLayout();
      const toggle = container.querySelector('[data-testid="button-toggle-menu"]') as HTMLButtonElement;

      act(() => { fireEvent.click(toggle); });
      const hostDemoLink = container.querySelector('#mobile-nav a[href="/mermaid-host-demo"]') as HTMLAnchorElement;
      expect(hostDemoLink).toBeTruthy();

      act(() => { fireEvent.click(hostDemoLink); });
      expect(mockLoadMermaidHostDemo).toHaveBeenCalledTimes(1);
    });

    it('Escape closes the mobile menu and returns focus to its toggle', () => {
      const { container } = renderLayout();
      const toggle = container.querySelector('[data-testid="button-toggle-menu"]') as HTMLButtonElement;

      act(() => { fireEvent.click(toggle); });
      const mobileNav = container.querySelector('#mobile-nav');
      expect(mobileNav).not.toBeNull();

      const firstMobileLink = mobileNav!.querySelector('a') as HTMLAnchorElement;
      act(() => { firstMobileLink.focus(); });
      act(() => { fireEvent.keyDown(firstMobileLink, { key: 'Escape' }); });

      expect(container.querySelector('#mobile-nav')).toBeNull();
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(toggle);
    });
  });

  describe('ARIA attributes', () => {

    it('trigger has aria-expanded="false" when closed', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('trigger has aria-expanded="true" when open', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('trigger has aria-haspopup="true"', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');
      expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    });

    it('open panel has role="menu"', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      expect(container.querySelector('[role="menu"]')).not.toBeNull();
    });

    it('each item in the open panel has role="menuitem"', () => {
      const { container } = renderLayout();
      const trigger = getDropdownTrigger(container, 'nav-plugin-dropdown');

      act(() => { fireEvent.click(trigger); });
      const items = getDropdownItems(container);
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => expect(item.getAttribute('role')).toBe('menuitem'));
    });
  });
});
