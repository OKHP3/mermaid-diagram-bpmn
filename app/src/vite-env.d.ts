/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Full git commit SHA injected at Vite build time.
   * Set by CI: `VITE_COMMIT_SHA=$(git rev-parse HEAD) pnpm run build`
   * Absent in local dev — falls back to "local" in ReleasePage.tsx.
   */
  readonly VITE_COMMIT_SHA?: string;

  /**
   * Analytics beacon endpoint URL.
   * When set, trackEvent() in app/src/lib/analytics.ts sends anonymous action
   * signals (no PII, no cookies) to this URL via navigator.sendBeacon.
   * When absent (the default), all tracking calls are no-ops.
   *
   * Compatible with GoatCounter's /count endpoint and any provider that
   * accepts POST JSON: { "p": "<path>", "e": "<event-name>" }.
   *
   * @example https://my-site.goatcounter.com/count
   */
  readonly VITE_ANALYTICS_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
