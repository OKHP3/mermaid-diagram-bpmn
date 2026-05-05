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
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home-logo">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold font-mono shrink-0">
              B
            </div>
            <span className="font-semibold text-sm text-foreground hidden sm:inline">
              BPMN for Mermaid
            </span>
            <code className="hidden md:inline text-xs text-muted-foreground font-mono">bpmn-beta</code>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  location === link.href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle dark mode"
              data-testid="button-toggle-theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              data-testid="button-toggle-menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-border px-4 pb-3 pt-2 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  location === link.href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            <code className="font-mono">mermaid-diagram-bpmn</code> — contributor prototype workspace
          </span>
          <span className="flex items-center gap-3">
            <a
              href="https://github.com/mermaid-js/mermaid/issues/7699"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              data-testid="link-github-issue"
            >
              GitHub #7699
            </a>
            <a
              href="https://github.com/mermaid-js/mermaid"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              mermaid-js/mermaid
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
