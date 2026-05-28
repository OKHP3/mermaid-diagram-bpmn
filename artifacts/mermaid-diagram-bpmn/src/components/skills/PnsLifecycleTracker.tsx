import { PNS_LIFECYCLE, SKILLS } from "@/data/skills-registry";

interface PnsLifecycleTrackerProps {
  withAnchors?: boolean;
}

export function PnsLifecycleTracker({ withAnchors = false }: PnsLifecycleTrackerProps) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start gap-0">
        {PNS_LIFECYCLE.map((state, i) => {
          const skill = SKILLS.find((s) => s.id === state.setBy);
          const isLast = i === PNS_LIFECYCLE.length - 1;
          const isLinked = withAnchors && !!skill;

          const pill = (
            <div
              className={`px-2 py-1 rounded-full border text-[10px] font-mono font-semibold text-center whitespace-nowrap${isLinked ? " hover:opacity-80 transition-opacity" : ""}`}
              style={{
                background: skill
                  ? `hsl(var(--primary) / 0.12)`
                  : "hsl(var(--muted))",
                borderColor: skill
                  ? "hsl(var(--primary) / 0.4)"
                  : "hsl(var(--border))",
                color: skill
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground))",
              }}
            >
              {state.status}
            </div>
          );

          return (
            <div key={state.status} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                {/* Pill — wrapped in anchor when withAnchors and skill exists */}
                {isLinked ? (
                  <a
                    href={`#row-${state.setBy}`}
                    className="block w-full"
                    aria-label={`Jump to ${skill.displayName} row`}
                  >
                    {pill}
                  </a>
                ) : (
                  pill
                )}
                {/* Skill name below */}
                <p className="mt-1.5 text-[9px] text-muted-foreground text-center leading-tight px-0.5">
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

          return (
            <div key={state.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-2 h-2 rounded-full shrink-0 mt-1"
                  style={{
                    background: skill
                      ? "hsl(var(--primary))"
                      : "hsl(var(--border))",
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
                  <a
                    href={`#row-${state.setBy}`}
                    aria-label={`Jump to ${skill.displayName} row`}
                  >
                    <code
                      className="text-[10px] font-mono font-semibold hover:opacity-80 transition-opacity"
                      style={{ color: "hsl(var(--primary))" }}
                    >
                      {state.status}
                    </code>
                  </a>
                ) : (
                  <code
                    className="text-[10px] font-mono font-semibold"
                    style={{ color: skill ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                  >
                    {state.status}
                  </code>
                )}
                <p className="text-[9px] text-muted-foreground mt-0.5">
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
