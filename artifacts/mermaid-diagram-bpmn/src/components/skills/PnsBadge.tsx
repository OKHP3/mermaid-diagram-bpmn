import { PNS_TRANSITIONS } from "@/data/pns-transitions";

interface PnsBadgeProps {
  skillId: string;
  /** When true, stacks vertically with label text between badges (detail page style). */
  verbose?: boolean;
}

const setStyle = {
  background: "hsl(var(--primary) / 0.12)",
  borderColor: "hsl(var(--primary) / 0.4)",
  color: "hsl(var(--primary))",
};
const readStyle = {
  background: "hsl(var(--muted))",
  borderColor: "hsl(var(--border))",
  color: "hsl(var(--muted-foreground))",
};

export function PnsBadge({ skillId, verbose = false }: PnsBadgeProps) {
  const tx = PNS_TRANSITIONS[skillId];
  if (!tx) return null;
  const { before, after } = tx;

  if (!verbose) {
    return (
      <div className="flex flex-col gap-0.5 items-start">
        {before !== null ? (
          <span
            className="inline-block px-1.5 py-0.5 rounded-full border text-[9px] font-mono font-semibold whitespace-nowrap"
            style={readStyle}
            title="PNS.md status consumed by this skill"
          >
            {before}
          </span>
        ) : (
          after && (
            <span
              className="inline-block px-1.5 py-0.5 rounded-full border text-[9px] font-mono whitespace-nowrap italic"
              style={readStyle}
              title="PNS.md does not yet exist at this stage"
            >
              (none yet)
            </span>
          )
        )}
        {after && (
          <>
            <span className="text-[8px] text-muted-foreground/40 font-mono pl-1.5 leading-none">
              ↓ sets
            </span>
            <span
              className="inline-block px-1.5 py-0.5 rounded-full border text-[9px] font-mono font-semibold whitespace-nowrap"
              style={setStyle}
              title="PNS.md status set by this skill"
            >
              {after}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground font-medium w-16 shrink-0">
          {before !== null ? "reads" : "starts"}
        </span>
        {before !== null ? (
          <span
            className="inline-block px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold whitespace-nowrap"
            style={readStyle}
            title="PNS.md status consumed by this skill"
          >
            {before}
          </span>
        ) : (
          <span
            className="inline-block px-2 py-0.5 rounded-full border text-[10px] font-mono whitespace-nowrap italic"
            style={readStyle}
            title="PNS.md does not yet exist at this stage"
          >
            (none yet)
          </span>
        )}
      </div>
      {after && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-medium w-16 shrink-0">
            sets
          </span>
          <span
            className="inline-block px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold whitespace-nowrap"
            style={setStyle}
            title="PNS.md status set by this skill"
          >
            {after}
          </span>
        </div>
      )}
    </div>
  );
}
