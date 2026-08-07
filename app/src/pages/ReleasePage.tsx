import { ExternalLink, Package, ShieldCheck, GitCommit, Calendar, CheckCircle2, FlaskConical, Globe, AlertCircle } from "lucide-react";
// Vite resolves public-dir JSON imports at build time; no network request at runtime.
import releaseManifest from "../../public/release-manifest.json";

// ── Tier metadata ─────────────────────────────────────────────────────────────

const TIER_META = {
  confirmed: {
    label: "Confirmed",
    Icon: CheckCircle2,
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300/60",
    dot: "bg-emerald-500",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    description: "Independently verified — passes local and CI gates with no caveats.",
  },
  "source-verified": {
    label: "Source-verified",
    Icon: ShieldCheck,
    badge:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300/60",
    dot: "bg-blue-500",
    iconColor: "text-blue-600 dark:text-blue-400",
    description: "Verified by source-level tests; not yet confirmed in a production browser.",
  },
  "ci-gated": {
    label: "CI-gated",
    Icon: FlaskConical,
    badge:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 border-violet-300/60",
    dot: "bg-violet-500",
    iconColor: "text-violet-600 dark:text-violet-400",
    description: "Automatically checked on every push and pull request.",
  },
  "browser-verified": {
    label: "Browser-verified",
    Icon: Globe,
    badge:
      "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-300/60",
    dot: "bg-teal-500",
    iconColor: "text-teal-600 dark:text-teal-400",
    description: "Verified in a real browser environment, not only a test harness.",
  },
  "not-complete": {
    label: "Not complete",
    Icon: AlertCircle,
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300/60",
    dot: "bg-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    description: "Requirement identified but not yet satisfied.",
  },
} as const;

type TierKey = keyof typeof TIER_META;

function tierMeta(tier: string) {
  return TIER_META[(tier as TierKey) in TIER_META ? (tier as TierKey) : "not-complete"];
}

// ── Commit SHA ────────────────────────────────────────────────────────────────
// VITE_COMMIT_SHA is set in CI before vite build so it is baked into the
// bundle. In local dev it is absent and we fall back to "local".

const COMMIT_SHA: string = (import.meta.env.VITE_COMMIT_SHA as string | undefined) ?? "";
const SHORT_SHA = COMMIT_SHA.slice(0, 8) || "local";
const GITHUB_REPO = "https://github.com/OKHP3/mermaid-diagram-bpmn";

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-0.5 uppercase tracking-wide">
        <Icon size={11} aria-hidden="true" />
        {label}
      </dt>
      <dd className="font-mono text-sm text-foreground">{children}</dd>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ReleasePage() {
  const m = releaseManifest;

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8"
      data-testid="page-release"
    >

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <p className="forge-eyebrow mb-1">Release Reference</p>
        <h1
          className="text-2xl font-bold text-foreground"
          data-testid="heading-release"
        >
          Release Manifest
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Machine-generated reference for package versions, compatibility targets, source commit,
          and capability evidence tiers. Regenerated from canonical sources on every build; CI
          fails if this file diverges from{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            lib/bpmn-plugin/package.json
          </code>
          {" "}and{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            app/src/lib/bpmn-plugin.ts
          </code>
          .
        </p>
      </div>

      {/* ── Identity card ───────────────────────────────────────────────────── */}
      <section
        aria-labelledby="identity-heading"
        className="rounded-lg border border-border bg-card p-5"
        data-testid="section-identity"
      >
        <h2
          id="identity-heading"
          className="forge-eyebrow mb-4"
        >
          Package identity
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          <MetaField icon={Package} label="Package">
            {m.pluginPackage}
          </MetaField>

          <MetaField icon={Package} label="Plugin version">
            {m.pluginVersion}
          </MetaField>

          <MetaField icon={ShieldCheck} label="Mermaid target">
            mermaid@{m.mermaidVersionTarget}
          </MetaField>

          <MetaField icon={ShieldCheck} label="Mermaid compat range">
            {m.mermaidCompatRange}
          </MetaField>

          <MetaField icon={GitCommit} label="Source commit">
            {COMMIT_SHA ? (
              <a
                href={`${GITHUB_REPO}/commit/${COMMIT_SHA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
                data-testid="link-commit"
              >
                {SHORT_SHA}
                <ExternalLink size={10} aria-hidden="true" />
              </a>
            ) : (
              <span className="text-muted-foreground">local</span>
            )}
          </MetaField>

          <MetaField icon={Calendar} label="Manifest date">
            {m.generatedDate}
          </MetaField>
        </dl>
      </section>

      {/* ── Evidence tiers ──────────────────────────────────────────────────── */}
      <section aria-labelledby="evidence-heading" data-testid="section-evidence">
        <h2 id="evidence-heading" className="forge-eyebrow mb-4">
          Capability evidence
        </h2>

        {/* Legend */}
        <div
          className="flex flex-wrap gap-2 mb-5"
          role="list"
          aria-label="Evidence tier legend"
        >
          {(Object.entries(TIER_META) as [TierKey, (typeof TIER_META)[TierKey]][]).map(
            ([key, meta]) => (
              <span
                key={key}
                role="listitem"
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${meta.badge}`}
                title={meta.description}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                  aria-hidden="true"
                />
                {meta.label}
              </span>
            ),
          )}
        </div>

        {/* Claim rows */}
        <div className="space-y-2" role="list" aria-label="Capability evidence entries">
          {m.evidenceTiers.map((entry) => {
            const meta = tierMeta(entry.tier);
            const Icon = meta.Icon;
            return (
              <div
                key={entry.id}
                role="listitem"
                className="rounded-md border border-border bg-card px-4 py-3 flex items-start gap-3"
                data-testid={`evidence-${entry.id}`}
              >
                <Icon
                  size={14}
                  className={`mt-0.5 shrink-0 ${meta.iconColor}`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                      {entry.claim}
                    </p>
                    <span
                      className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wide ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {entry.evidence}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Machine-readable source ──────────────────────────────────────────── */}
      <section
        aria-labelledby="raw-heading"
        className="rounded-lg border border-border bg-muted/30 px-5 py-4"
        data-testid="section-raw"
      >
        <h2 id="raw-heading" className="forge-eyebrow mb-2">
          Machine-readable manifest
        </h2>
        <p className="text-xs text-muted-foreground mb-3 max-w-2xl leading-relaxed">
          The raw JSON is served as a static asset. Regenerate it with{" "}
          <code className="font-mono bg-muted px-1 py-0.5 rounded">
            node scripts/generate-manifest.mjs
          </code>{" "}
          and verify it with{" "}
          <code className="font-mono bg-muted px-1 py-0.5 rounded">
            pnpm run manifest:check
          </code>
          . The CI <em>checks</em> job fails if the committed file diverges from the
          canonical sources.
        </p>
        <a
          href={`${import.meta.env.BASE_URL}release-manifest.json`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
          data-testid="link-manifest-json"
        >
          release-manifest.json
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      </section>

      {/* ── Schema version note ──────────────────────────────────────────────── */}
      <p className="text-xs text-muted-foreground/60 text-right font-mono">
        manifest schema v{m.schemaVersion} · generated {m.generatedDate}
      </p>
    </div>
  );
}
