import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X, Github } from "lucide-react";
import { SKILLS } from "../data/skills-registry";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/dsl", label: "DSL Reference" },
  { href: "/architecture", label: "Architecture" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Agent Skills" },
  { href: "/walkthrough", label: "Walkthrough" },
] as const;

const GITHUB_REPO = "https://github.com/OKHP3/mermaid-diagram-bpmn";
const GITHUB_PAGES = "https://okhp3.github.io/mermaid-diagram-bpmn/";
const DOCS_URL     = "https://github.com/OKHP3/mermaid-diagram-bpmn/tree/main/artifacts/mermaid-diagram-bpmn/docs";
const OKH_SITE     = "https://overkillhill.com";

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

export function Layout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="forge-shell">

      {/* OKH Forge header — always-dark, sticky */}
      <header className="forge-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" data-testid="link-home-logo">
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="BPMN for Mermaid icon"
              className="w-7 h-7 rounded-md object-cover ring-1 ring-white/10"
            />
            <span className="font-semibold text-sm hidden sm:inline forge-brand-title">
              BPMN for Mermaid
            </span>
            <code className="hidden md:inline text-xs font-mono px-1.5 py-0.5 rounded forge-brand-badge">
              bpmn-beta
            </code>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map(link => {
              const isActive = link.href === "/skills"
                ? location === "/skills" || location.startsWith("/skills/")
                : location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded text-sm forge-nav-link${isActive ? " forge-nav-link--active" : ""}`}
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.label}
                    {"badge" in link && (
                      <span
                        className="font-mono text-[10px] leading-none px-1.5 py-0.5 rounded-full forge-skill-badge"
                        data-testid="nav-skills-badge"
                      >
                        {link.badge}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="forge-nav-active-indicator absolute bottom-0 left-3 right-3 h-0.5 rounded-full" />
                  )}
                </Link>
              );
            })}
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
              data-testid="button-toggle-menu"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            className="md:hidden px-4 pb-3 pt-2 flex flex-col gap-0.5"
            style={{ borderTop: "1px solid var(--okh-header-border)" }}
          >
            {NAV_LINKS.map(link => {
              const isActive = link.href === "/skills"
                ? location === "/skills" || location.startsWith("/skills/")
                : location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded text-sm forge-mobile-nav-link${isActive ? " forge-mobile-nav-link--active" : ""}`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.label}
                    {"badge" in link && (
                      <span className="font-mono text-[10px] leading-none px-1.5 py-0.5 rounded-full forge-skill-badge">
                        {link.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
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
      <main className="forge-main forge-grid">
        {children}
      </main>

      {/* Forge footer */}
      <footer className="forge-footer py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">

          {/* Left — identity */}
          <span className="forge-footer-slug">
            <code className="font-mono">mermaid-diagram-bpmn</code>
            {" — "}contributor prototype · OverKill Hill P³
          </span>

          {/* Right — links */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="forge-footer-link flex items-center gap-1"
              data-testid="link-github-footer"
            >
              <Github size={11} />
              GitHub repo
            </a>
            <a
              href={GITHUB_PAGES}
              target="_blank"
              rel="noopener noreferrer"
              className="forge-footer-link"
              data-testid="link-github-pages"
            >
              GitHub Pages
            </a>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="forge-footer-link"
              data-testid="link-spec-docs"
            >
              Spec docs
            </a>
            <a
              href="https://github.com/mermaid-js/mermaid/issues/7699"
              target="_blank"
              rel="noopener noreferrer"
              className="forge-footer-link"
              data-testid="link-github-issue"
            >
              mermaid#7699
            </a>
            <a
              href={OKH_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="forge-footer-link"
            >
              overkillhill.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
