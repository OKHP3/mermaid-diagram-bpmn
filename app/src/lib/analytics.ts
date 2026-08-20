/**
 * analytics.ts
 *
 * Minimal, privacy-respecting event tracking for static hosting.
 *
 * Design principles
 * ─────────────────
 * - No cookies, no localStorage, no device fingerprinting.
 * - No user accounts or session IDs.
 * - Collects only: the event name and the current page path.
 * - IP addresses are never stored by this library; whether the endpoint
 *   receiving the beacon stores them is controlled by the operator's choice
 *   of analytics provider (see VITE_ANALYTICS_ENDPOINT below).
 * - All tracking is opt-in for operators: if VITE_ANALYTICS_ENDPOINT is not
 *   set, every call is a no-op and nothing leaves the browser.
 * - Browser Do Not Track preferences are honoured: `navigator.doNotTrack === '1'`
 *   disables analytics even when an operator has configured an endpoint.
 * - Never throws — analytics must never crash the application.
 *
 * Configuration
 * ─────────────
 * Set the build-time environment variable in your CI / GitHub Actions workflow:
 *
 *   VITE_ANALYTICS_ENDPOINT=https://my-goatcounter.goatcounter.com/count
 *
 * Compatible providers (cookieless, no PII):
 *   - GoatCounter  https://www.goatcounter.com/  (free tier available)
 *   - Plausible    https://plausible.io/
 *   - Any endpoint that accepts a POST/beacon with the JSON payload below.
 *
 * Beacon payload format
 * ─────────────────────
 * { "p": "/playground", "e": "playground-export-svg" }
 *
 * Where:
 *   p  — the current pathname (no query string, no hash; no PII)
 *   e  — the event name from EventName below
 *
 * This format is accepted directly by GoatCounter's hit endpoint.
 * For other providers, adapt the ENDPOINT or body in the `trackEvent`
 * implementation below.
 *
 * Privacy notice
 * ──────────────
 * A privacy notice must be shown on the site whenever analytics is active.
 * See app/src/pages/Privacy.tsx and the footer link in Layout.tsx.
 */

// ── Event names ───────────────────────────────────────────────────────────────

/**
 * Tracked action names.  Each name maps to exactly one user action in the UI.
 * Extend this union when adding new tracked actions.
 */
export type EventName =
  /** User clicked "Download SVG" in the Playground and a file was produced. */
  | 'playground-export-svg'
  /** User clicked "copy" on the npm install command block in Plugin Installation. */
  | 'plugin-copy'
  /** User successfully downloaded the BP-SKILL agent skill suite ZIP. */
  | 'suite-download'
  /** User successfully downloaded the context/ variable layer starter-pack ZIP. */
  | 'starter-pack-download';

// ── Beacon implementation ─────────────────────────────────────────────────────

/**
 * Record an anonymous user action.
 *
 * Fires a `navigator.sendBeacon` POST to the configured analytics endpoint.
 * The beacon is fire-and-forget — it does not block the action that triggered
 * it and does not wait for a response.
 *
 * **No-op conditions** (call is silently skipped):
 * - `VITE_ANALYTICS_ENDPOINT` is not set (the default in local dev and in
 *   deployments that have not configured analytics).
 * - `navigator.sendBeacon` is not available (server-side render, old browser).
 * - The browser reports a Do Not Track preference (`navigator.doNotTrack === '1'`).
 * - Any unexpected error (e.g. Content-Security-Policy blocking the beacon).
 *
 * @param name - One of the `EventName` values defined above.
 */
export function trackEvent(name: EventName): void {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint) return;

  try {
    if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return;
    if (navigator.doNotTrack === '1') return;

    const path =
      typeof window !== 'undefined' ? window.location.pathname : '/';

    const payload = JSON.stringify({ p: path, e: name });

    // sendBeacon is non-blocking and survives page navigation — ideal for
    // tracking download actions where the user may navigate away immediately.
    navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
  } catch {
    // Analytics must never crash the application.
  }
}
