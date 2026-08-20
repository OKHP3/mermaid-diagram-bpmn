import { useEffect, useRef } from "react";
import { PNS_LIFECYCLE, SKILLS } from "@/data/skills-registry";

interface PnsLifecycleTrackerProps {
  withAnchors?: boolean;
  activeStatus?: string;
  /** Reduces pill and label font sizes for use in tighter spaces like page headers. */
  compact?: boolean;
}

/**
 * Scroll to the skill row that is currently visible in the DOM.
 * Desktop rows carry id="row-{skillId}-lg"; mobile cards carry id="row-{skillId}-sm".
 * We check which one has a non-null offsetParent (i.e. is visible) and
 * scroll to it. Falls back to the first found element if neither is visible.
 */
function scrollToSkillRow(skillId: string) {
  const lg = document.getElementById(`row-${skillId}-lg`);
  const sm = document.getElementById(`row-${skillId}-sm`);
  const target =
    lg && lg.offsetParent !== null
      ? lg
      : sm && sm.offsetParent !== null
      ? sm
      : lg ?? sm;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  target?.scrollIntoView({
    behavior: prefersReducedMotion ? "instant" : "smooth",
    block: "start",
  });
}

export function PnsLifecycleTracker({ withAnchors = false, activeStatus, compact = false }: PnsLifecycleTrackerProps) {
  const pillTextClass = compact ? "text-[9px]" : "text-[10px]";
  const nameTextClass = compact ? "text-[8px]" : "text-[9px]";

  // Mobile: scroll the active stage into view on mount so practitioners don't
  // have to hunt when the active stage is near the bottom of the vertical list.
  const activeMobileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!activeStatus || !activeMobileRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    activeMobileRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "nearest",
    });
  }, [activeStatus]);

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start gap-0">
        {PNS_LIFECYCLE.map((state, i) => {
          const skill = SKILLS.find((s) => s.id === state.setBy);
          const isLast = i === PNS_LIFECYCLE.length - 1;
          const isLinked = withAnchors && !!skill;
          const isActive = activeStatus === state.status;

          const pillContent = (
            <div
              className={`px-2 py-1 rounded-full border ${pillTextClass} font-mono font-semibold text-center whitespace-nowrap transition-all duration-300`}
              aria-current={isActive ? "step" : undefined}
              style={{
                background: isActive
                  ? `hsl(var(--primary) / 0.22)`
                  : skill
                  ? `hsl(var(--primary) / 0.12)`
                  : "hsl(var(--muted))",
                borderColor: isActive
                  ? "hsl(var(--primary) / 0.8)"
                  : skill
                  ? "hsl(var(--primary) / 0.4)"
                  : "hsl(var(--border))",
                borderWidth: isActive ? "1.5px" : "1px",
                color: skill
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground))",
                opacity: activeStatus && !isActive ? 0.45 : 1,
                boxShadow: isActive
                  ? "0 0 0 2px hsl(var(--primary) / 0.15)"
                  : "none",
              }}
            >
              {state.status}
            </div>
          );

          return (
            <div key={state.status} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                {/* Pill — button-driven scroll when withAnchors and skill exists */}
                {isLinked ? (
                  <button
                    type="button"
                    className="block w-full hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
                    aria-label={`Jump to ${skill.displayName} in the table`}
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => scrollToSkillRow(state.setBy)}
                  >
                    {pillContent}
                  </button>
                ) : (
                  pillContent
                )}
                {/* Skill name below */}
                <p
                  className={`mt-1.5 ${nameTextClass} text-center leading-tight px-0.5 transition-colors duration-300`}
                  style={{
                    color: isActive
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground))",
                    fontWeight: isActive ? 600 : undefined,
                    opacity: activeStatus && !isActive ? 0.55 : 1,
                  }}
                >
                  {skill ? skill.displayName : state.setBy}
                </p>
              </div>
              {/* Connector arrow */}
              {!isLast && (
                <div className="flex items-start pt-[7px] shrink-0">
                  <span className="text-muted-foreground/40 text-[10px] font-mono">→</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden flex flex-col gap-0">
        {PNS_LIFECYCLE.map((state, i) => {
          const skill = SKILLS.find((s) => s.id === state.setBy);
          const isLast = i === PNS_LIFECYCLE.length - 1;
          const isLinked = withAnchors && !!skill;
          const isActive = activeStatus === state.status;

          return (
            <div
              key={state.status}
              ref={isActive ? activeMobileRef : undefined}
              className="flex items-start gap-3 transition-opacity duration-300"
              style={{ opacity: activeStatus && !isActive ? 0.45 : 1 }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-2 h-2 rounded-full shrink-0 mt-1 transition-all duration-300"
                  style={{
                    background: isActive
                      ? "hsl(var(--primary))"
                      : skill
                      ? "hsl(var(--primary) / 0.5)"
                      : "hsl(var(--border))",
                    boxShadow: isActive
                      ? "0 0 0 3px hsl(var(--primary) / 0.2)"
                      : "none",
                    transform: isActive ? "scale(1.3)" : "scale(1)",
                  }}
                />
                {!isLast && (
                  <div
                    className="w-px flex-1 mt-0.5"
                    style={{ background: "hsl(var(--border))", minHeight: 20 }}
                  />
                )}
              </div>
              <div className="pb-4">
                {isLinked ? (
                  <button
                    type="button"
                    className="hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    aria-label={`Jump to ${skill.displayName} in the table`}
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => scrollToSkillRow(state.setBy)}
                  >
                    <code
                      className={`${pillTextClass} font-mono font-semibold transition-colors duration-300`}
                      style={{
                        color: isActive
                          ? "hsl(var(--primary))"
                          : "hsl(var(--primary) / 0.7)",
                      }}
                    >
                      {state.status}
                    </code>
                  </button>
                ) : (
                  <code
                    className={`${pillTextClass} font-mono font-semibold transition-colors duration-300`}
                    aria-current={isActive ? "step" : undefined}
                    style={{
                      color: skill
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {state.status}
                  </code>
                )}
                <p
                  className={`${nameTextClass} mt-0.5 transition-colors duration-300`}
                  style={{
                    color: isActive
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground))",
                    fontWeight: isActive ? 600 : undefined,
                  }}
                >
                  {skill ? skill.displayName : state.setBy}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
