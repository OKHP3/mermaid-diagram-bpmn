import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X, Github, ChevronDown } from "lucide-react";
import { usePageTracking } from "../hooks/usePageTracking";

// ── Nav structure (two-tier) ─────────────────────────────────────────────────
//
// Logo → Home (always)
// Flat: Playground · Agent Skills
// Plugin ▾: Plugin Setup · Host Demo · Syntax Comparison   (Use with Mermaid)
// Learn  ▾: Walkthrough · DSL Reference · Architecture · Roadmap · About

const PRODUCT_NAV = [
  { href: "/playground", label: "Playground"   },
  { href: "/skills",     label: "Agent Skills" },
] as const;

const PLUGIN_LINKS = [
  { href: "/plugin",            label: "Plugin Setup"      },
  { href: "/mermaid-host-demo", label: "Host Demo"         },
  { href: "/comparison",        label: "Syntax Comparison" },
] as const;

const LEARN_LINKS = [
  { href: "/walkthrough",  label: "Walkthrough"   },
  { href: "/dsl",          label: "DSL Reference" },
  { href: "/architecture", label: "Architecture"  },
  { href: "/roadmap",      label: "Roadmap"       },
  { href: "/about",        label: "About"         },
] as const;

const GITHUB_REPO = "https://github.com/OKHP3/mermaid-diagram-bpmn";

// ── Helpers ──────────────────────────────────────────────────────────────────

function isLinkActive(href: string, location: string) {
  return href === "/skills"
    ? location === "/skills" || location.startsWith("/skills/")
    : location === href;
}

// ── Dropdown component ────────────────────────────────────────────────────────

type DropdownLink = { readonly href: string; readonly label: string };

function NavDropdown({
  label,
  links,
  location,
  testId,
  onNavigate,
}: {
  label: string;
  links: readonly DropdownLink[];
  location: string;
  testId: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Focus first item when panel opens
  useEffect(() => {
    if (open) {
      itemRefs.current[0]?.focus();
    }
  }, [open]);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape") {
      close(true);
    }
  }

  function handleItemKeyDown(e: React.KeyboardEvent<HTMLAnchorElement>, idx: number) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % links.length;
      itemRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + links.length) % links.length;
      itemRefs.current[prev]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      // Let Tab advance naturally; just close the panel without stealing focus
      close(false);
    }
  }

  const groupActive = links.some(l => isLinkActive(l.href, location));

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
        className={`relative flex items-center gap-1 px-3 py-1.5 rounded text-sm forge-nav-link${groupActive ? " forge-nav-link--active" : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        data-testid={testId}
      >
        {label}
        <ChevronDown
          size={11}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
        {groupActive && (
          <span className="forge-nav-active-indicator absolute bottom-0 left-3 right-3 h-0.5 rounded-full" />
        )}
      </button>

      {open && (
        <div
          className="forge-nav-dropdown absolute top-full left-0 mt-1 py-1 min-w-[168px] rounded-md z-50"
          role="menu"
        >
          {links.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              ref={(el: HTMLAnchorElement | null) => { itemRefs.current[idx] = el; }}
              onClick={() => { close(false); onNavigate(); }}
              onKeyDown={(e: React.KeyboardEvent<HTMLAnchorElement>) => handleItemKeyDown(e, idx)}
              className={`forge-nav-dropdown-item block px-4 py-2 text-sm${isLinkActive(link.href, location) ? " forge-nav-dropdown-item--active" : ""}`}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              role="menuitem"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dark-mode hook ────────────────────────────────────────────────────────────

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return [dark, setDark] as const;
}

// ── Layout ────────────────────────────────────────────────────────────────────

export function Layout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  usePageTracking();

  return (
    <div className="forge-shell">

      {/* Skip link — keyboard users jump past the header to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded focus:bg-background focus:text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      >
        Skip to main content
      </a>

      {/* OKH Forge header — always-dark, sticky */}
      <header className="forge-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

          {/* Logo — links to Home */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" data-testid="link-home-logo">
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="BPMN for Mermaid icon"
              className="w-7 h-7 rounded-md object-cover ring-1 ring-white/10"
            />
            <div className="hidden sm:flex flex-col leading-tight gap-px">
              <span className="font-semibold text-sm forge-brand-title">
                BPMN for Mermaid
              </span>
              <code className="text-[10px] font-mono forge-brand-badge self-start px-1 py-px rounded">
                bpmn-beta
              </code>
            </div>
          </Link>

          {/* Desktop nav — two-tier: flat links + two dropdowns */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">

            {/* Playground (flat) */}
            {PRODUCT_NAV.map(link => {
              const isActive = isLinkActive(link.href, location);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded text-sm forge-nav-link${isActive ? " forge-nav-link--active" : ""}`}
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                  {isActive && (
                    <span className="forge-nav-active-indicator absolute bottom-0 left-3 right-3 h-0.5 rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Plugin ▾ — Use with Mermaid */}
            <NavDropdown
              label="Plugin"
              links={PLUGIN_LINKS}
              location={location}
              testId="nav-plugin-dropdown"
              onNavigate={() => {}}
            />

            {/* Learn ▾ — shared context */}
            <NavDropdown
              label="Learn"
              links={LEARN_LINKS}
              location={location}
              testId="nav-learn-dropdown"
              onNavigate={() => {}}
            />

          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-1">
            {/* GitHub link */}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="forge-icon-btn p-2 rounded"
              aria-label="GitHub repository"
              data-testid="link-github-header"
            >
              <Github size={15} />
            </a>

            {/* Theme toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className="forge-icon-btn p-2 rounded"
              aria-label="Toggle dark mode"
              data-testid="button-toggle-theme"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden forge-icon-btn p-2 rounded"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              data-testid="button-toggle-menu"
            >
              {menuOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu — two-tier structure mirroring desktop */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            className="md:hidden px-4 pb-3 pt-2 flex flex-col gap-0.5"
            style={{ borderTop: "1px solid var(--okh-header-border)" }}
            aria-label="Mobile navigation"
          >
            {/* Product flat links: Playground · Agent Skills */}
            {PRODUCT_NAV.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded text-sm forge-mobile-nav-link${isLinkActive(link.href, location) ? " forge-mobile-nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Plugin section — Use with Mermaid */}
            <div
              className="mt-2 pt-2 flex flex-col gap-0.5"
              style={{ borderTop: "1px solid var(--okh-header-border)" }}
            >
              <span className="forge-mobile-nav-label px-3 pb-0.5">Plugin</span>
              {PLUGIN_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded text-sm forge-mobile-nav-link${isLinkActive(link.href, location) ? " forge-mobile-nav-link--active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Learn section — shared context */}
            <div
              className="mt-2 pt-2 flex flex-col gap-0.5"
              style={{ borderTop: "1px solid var(--okh-header-border)" }}
            >
              <span className="forge-mobile-nav-label px-3 pb-0.5">Learn</span>
              {LEARN_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded text-sm forge-mobile-nav-link${isLinkActive(link.href, location) ? " forge-mobile-nav-link--active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* GitHub */}
            <div
              className="mt-2 pt-2 flex items-center gap-3"
              style={{ borderTop: "1px solid var(--okh-header-border)" }}
            >
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="forge-footer-link flex items-center gap-1.5 px-3 py-1.5 rounded text-xs"
              >
                <Github size={12} />
                GitHub
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* Page body — forge blueprint grid texture */}
      <main id="main-content" className="forge-main forge-grid">
        {children}
      </main>

      {/* Forge footer */}
      <footer className="forge-footer py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">

          {/* Left — copyright */}
          <span className="forge-footer-slug">
            © {new Date().getFullYear()} OverKill Hill P³™. All rights reserved.
          </span>

          {/* Centre — disclaimer */}
          <span className="forge-footer-slug text-center">
            Not affiliated with Mermaid, Mermaid Chart, or{" "}
            <a
              href="https://mermaidchart.cello.so/UhVlNtC2MlS"
              target="_blank"
              rel="noopener noreferrer"
              className="forge-footer-mermaid"
              data-testid="link-mermaid-ai"
            >
              Mermaid.ai
            </a>
          </span>

          {/* Right — built-with + privacy */}
          <span className="forge-footer-slug flex items-center gap-3">
            Built with{" "}
            <a
              href="https://replit.com/refer/overkillhillp3/"
              target="_blank"
              rel="noopener noreferrer"
              className="forge-footer-replit"
              data-testid="link-built-with-replit"
            >
              Replit
            </a>
            <span className="text-muted-foreground/30" aria-hidden="true">·</span>
            <Link
              href="/privacy"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
              data-testid="link-privacy-notice"
            >
              Privacy
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
