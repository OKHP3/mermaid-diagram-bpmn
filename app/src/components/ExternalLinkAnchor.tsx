import React from "react";
import { ExternalLink } from "lucide-react";

interface ExternalLinkAnchorProps {
  href: string;
  children: React.ReactNode;
  /** Extra Tailwind classes added to the <a> element (e.g. colour, weight). */
  className?: string;
}

/**
 * Inline external link that always enforces target="_blank",
 * rel="noopener noreferrer", and appends an ExternalLink icon.
 */
export function ExternalLinkAnchor({ href, children, className = "" }: ExternalLinkAnchorProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-0.5 ${className}`}
    >
      {children}
      <ExternalLink size={12} className="text-muted-foreground shrink-0" />
    </a>
  );
}

interface ExternalLinkRowProps {
  href: string;
  label: string;
  description: string;
}

/**
 * Reference-list row: left-side icon, link label, and a sub-description line.
 * Enforces target="_blank" and rel="noopener noreferrer" via ExternalLinkAnchor.
 */
export function ExternalLinkRow({ href, label, description }: ExternalLinkRowProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <ExternalLink size={12} className="text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <ExternalLinkAnchor
          href={href}
          className="text-xs font-medium text-primary hover:underline underline-offset-2"
        >
          {label}
        </ExternalLinkAnchor>
        <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
      </div>
    </li>
  );
}
