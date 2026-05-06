import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/dsl", label: "DSL Reference" },
  { href: "/architecture", label: "Architecture" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/about", label: "About" },
];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* OKH-style always-dark sticky header */}
      <header
        className="sticky top-0 z-50"
        style={{ background: "var(--okh-header-bg)", borderBottom: "1px solid var(--okh-header-border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" data-testid="link-home-logo">
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="BPMN for Mermaid icon"
              className="w-7 h-7 rounded-md object-cover ring-1 ring-white/10"
            />
            <span
              className="font-semibold text-sm hidden sm:inline"
              style={{ color: "var(--okh-header-text)" }}
            >
              BPMN for Mermaid
            </span>
            <code
              className="hidden md:inline text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                color: "var(--okh-header-muted)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              bpmn-beta
            </code>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map(link => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-1.5 rounded text-sm transition-all"
                  style={{
                    color: isActive ? "var(--okh-header-text)" : "var(--okh-header-muted)",
                    background: isActive ? "var(--okh-header-hover)" : "transparent",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--okh-header-hover)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: "var(--okh-header-active)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded transition-colors"
              style={{ color: "var(--okh-header-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--okh-header-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              aria-label="Toggle dark mode"
              data-testid="button-toggle-theme"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              className="md:hidden p-2 rounded transition-colors"
              style={{ color: "var(--okh-header-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--okh-header-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
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
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded text-sm"
                  style={{
                    color: isActive ? "var(--okh-header-active)" : "var(--okh-header-text)",
                    fontWeight: isActive ? 600 : 400,
                    background: isActive ? "rgba(194,77,30,0.12)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Page body — forge blueprint grid texture */}
      <main className="flex-1 flex flex-col forge-grid">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border py-6 px-4"
        style={{ background: "var(--okh-header-bg)", borderColor: "var(--okh-header-border)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span style={{ color: "var(--okh-header-muted)" }}>
            <code className="font-mono" style={{ color: "var(--okh-header-text)" }}>mermaid-diagram-bpmn</code>
            {" — "}contributor prototype · OverKill Hill P³
          </span>
          <span className="flex items-center gap-4" style={{ color: "var(--okh-header-muted)" }}>
            <a
              href="https://github.com/mermaid-js/mermaid/issues/7699"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              style={{ color: "var(--okh-header-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--okh-header-text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--okh-header-muted)")}
              data-testid="link-github-issue"
            >
              mermaid#7699
            </a>
            <a
              href="https://overkillhill.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: "var(--okh-header-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--okh-header-text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--okh-header-muted)")}
            >
              overkillhill.com
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
