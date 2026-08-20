import { useEffect } from "react";
import { Shield, Eye, EyeOff, BarChart2, ExternalLink } from "lucide-react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Notice — BPMN for Mermaid";
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">

      {/* Page header */}
      <div className="mb-10">
        <p className="forge-eyebrow mb-3">Site Policies</p>
        <h1 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-3">
          <Shield size={22} className="text-primary shrink-0" />
          Privacy Notice
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This site collects the minimum signal needed to understand whether the
          tools are being used. No personal data is collected, stored, or shared.
        </p>
      </div>

      {/* What we measure */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
          <BarChart2 size={15} className="text-primary" />
          What we measure
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          When analytics is active, the following specific user actions are counted:
        </p>
        <ul className="space-y-3">
          {[
            {
              action: "Playground SVG export",
              detail: 'Counted when you click "Download SVG" and a diagram file is produced.',
            },
            {
              action: "Plugin install command copy",
              detail: "Counted when you click the copy button on the npm install command in Plugin Installation.",
            },
            {
              action: "Suite ZIP download",
              detail: "Counted when a successful download of the BP-SKILL agent skill suite ZIP completes.",
            },
            {
              action: "Starter-pack ZIP download",
              detail: "Counted when a successful download of the context/ variable layer template pack completes.",
            },
          ].map(({ action, detail }) => (
            <li key={action} className="forge-card flex items-start gap-3">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">{action}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* What we do NOT collect */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
          <EyeOff size={15} className="text-primary" />
          What we do not collect
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "No cookies — ever.",
            "No IP addresses stored by this site.",
            "No device fingerprinting.",
            "No user accounts or session IDs.",
            "No names, email addresses, or any other personal identifiers.",
            "No tracking across other websites.",
            "No data sold or shared with third parties.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <EyeOff size={12} className="shrink-0 mt-0.5 text-muted-foreground/50" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
          <Eye size={15} className="text-primary" />
          How it works
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          When one of the four actions above occurs, a small anonymous signal is
          sent to a privacy-respecting analytics endpoint via{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">navigator.sendBeacon</code>.
          The signal contains only:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 mb-3">
          <li className="flex items-start gap-2">
            <span className="shrink-0 font-mono text-xs text-primary mt-0.5">p</span>
            The page path (e.g. <code className="text-xs bg-muted px-1 rounded font-mono">/playground</code>)
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 font-mono text-xs text-primary mt-0.5">e</span>
            The event name (e.g. <code className="text-xs bg-muted px-1 rounded font-mono">playground-export-svg</code>)
          </li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No analytics is collected when the{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">VITE_ANALYTICS_ENDPOINT</code>{" "}
          build variable is not set. In local development and in deployments
          that have not configured an endpoint, every tracking call is a no-op.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          We also honour your browser&apos;s <strong>Do Not Track</strong> preference.
          When it reports that preference, this site sends no analytics beacon,
          even if an analytics endpoint is active.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          When active, we use{" "}
          <a
            href="https://www.goatcounter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            GoatCounter <ExternalLink size={10} />
          </a>
          , an open-source, cookie-free analytics tool that does not track
          individual visitors across sessions or store IP addresses.
        </p>
      </section>

      {/* Source */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
          Source code
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This site is fully open-source. The analytics implementation lives in{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">app/src/lib/analytics.ts</code>.
          You can review exactly what is sent at{" "}
          <a
            href="https://github.com/OKHP3/mermaid-diagram-bpmn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            github.com/OKHP3/mermaid-diagram-bpmn <ExternalLink size={10} />
          </a>
          .
        </p>
      </section>

    </div>
  );
}
