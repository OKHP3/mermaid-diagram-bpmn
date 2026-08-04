export function ExamplePnsBadgePair({
  consumed,
  produced,
}: {
  consumed: string | null;
  produced: string | null;
}) {
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
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {consumed !== null ? (
        <span
          className="px-1.5 py-0.5 rounded-full border text-[9px] font-mono font-semibold whitespace-nowrap"
          style={readStyle}
        >
          {consumed}
        </span>
      ) : (
        produced && (
          <span
            className="px-1.5 py-0.5 rounded-full border text-[9px] font-mono whitespace-nowrap italic"
            style={readStyle}
          >
            (no PNS yet)
          </span>
        )
      )}
      {produced && (
        <>
          <span className="text-[9px] text-muted-foreground/40 font-mono">→</span>
          <span
            className="px-1.5 py-0.5 rounded-full border text-[9px] font-mono font-semibold whitespace-nowrap"
            style={setStyle}
          >
            {produced}
          </span>
        </>
      )}
    </div>
  );
}
