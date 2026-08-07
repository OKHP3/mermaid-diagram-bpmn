/**
 * analytics.test.ts
 *
 * Unit tests for the bpmn-beta analytics beacon utility.
 *
 * Scope:
 *   - trackEvent() is a no-op when VITE_ANALYTICS_ENDPOINT is absent or empty
 *   - trackEvent() calls navigator.sendBeacon with the correct endpoint
 *   - Beacon payload contains the event name (e) and page path (p)
 *   - All four tracked event names are accepted without TypeScript errors
 *   - trackEvent() never throws, even when sendBeacon is unavailable
 *
 * Strategy:
 *   - navigator.sendBeacon is stubbed via vi.stubGlobal so the real browser
 *     API is never called.
 *   - VITE_ANALYTICS_ENDPOINT is stubbed via vi.stubEnv; Vitest ensures
 *     import.meta.env reflects the stubbed value for lazy reads inside the
 *     function body (the module reads the env on each call, not at import time).
 *   - Each test group resets stubs in afterEach to avoid cross-test pollution.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent } from '../analytics';

const TEST_ENDPOINT = 'https://example.goatcounter.com/count';

// ── No-op when endpoint is absent ─────────────────────────────────────────────

describe('trackEvent — no-op when VITE_ANALYTICS_ENDPOINT is absent', () => {
  let sendBeaconSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendBeaconSpy = vi.fn();
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy });
    // Explicitly absent — no stubEnv call, so import.meta.env.VITE_ANALYTICS_ENDPOINT
    // is undefined (the default in local dev and in test environments).
    vi.stubEnv('VITE_ANALYTICS_ENDPOINT', '');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('does not call sendBeacon when endpoint env var is empty', () => {
    trackEvent('playground-export-svg');
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('does not call sendBeacon for any event when endpoint is absent', () => {
    trackEvent('plugin-copy');
    trackEvent('suite-download');
    trackEvent('starter-pack-download');
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('does not throw when endpoint is absent', () => {
    expect(() => trackEvent('playground-export-svg')).not.toThrow();
  });
});

// ── Fires when endpoint is configured ────────────────────────────────────────

describe('trackEvent — fires beacon when VITE_ANALYTICS_ENDPOINT is set', () => {
  let sendBeaconSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendBeaconSpy = vi.fn();
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy });
    vi.stubEnv('VITE_ANALYTICS_ENDPOINT', TEST_ENDPOINT);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    'playground-export-svg',
    'plugin-copy',
    'suite-download',
    'starter-pack-download',
  ] as const)(
    'calls sendBeacon once for the "%s" event',
    (eventName) => {
      trackEvent(eventName);
      expect(sendBeaconSpy).toHaveBeenCalledOnce();
    },
  );

  it('sends the beacon to the configured endpoint URL', () => {
    trackEvent('playground-export-svg');
    const [url] = sendBeaconSpy.mock.calls[0] as [string, Blob];
    expect(url).toBe(TEST_ENDPOINT);
  });

  it('beacon payload is a Blob with application/json type', () => {
    trackEvent('plugin-copy');
    const [, blob] = sendBeaconSpy.mock.calls[0] as [string, Blob];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');
  });

  it('beacon payload contains the event name as field "e"', async () => {
    trackEvent('suite-download');
    const [, blob] = sendBeaconSpy.mock.calls[0] as [string, Blob];
    const payload = JSON.parse(await blob.text());
    expect(payload.e).toBe('suite-download');
  });

  it('beacon payload contains the page path as field "p"', async () => {
    trackEvent('starter-pack-download');
    const [, blob] = sendBeaconSpy.mock.calls[0] as [string, Blob];
    const payload = JSON.parse(await blob.text());
    expect(typeof payload.p).toBe('string');
    expect(payload.p.length).toBeGreaterThan(0);
  });

  it('beacon payload contains only "p" and "e" fields — no PII', async () => {
    trackEvent('playground-export-svg');
    const [, blob] = sendBeaconSpy.mock.calls[0] as [string, Blob];
    const payload = JSON.parse(await blob.text());
    const keys = Object.keys(payload).sort();
    expect(keys).toEqual(['e', 'p']);
  });
});

// ── Robustness ────────────────────────────────────────────────────────────────

describe('trackEvent — never throws', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('does not throw when sendBeacon throws internally', () => {
    vi.stubEnv('VITE_ANALYTICS_ENDPOINT', TEST_ENDPOINT);
    vi.stubGlobal('navigator', {
      sendBeacon: vi.fn(() => { throw new Error('beacon blocked by CSP'); }),
    });
    expect(() => trackEvent('playground-export-svg')).not.toThrow();
  });

  it('does not throw when navigator is undefined', () => {
    vi.stubEnv('VITE_ANALYTICS_ENDPOINT', TEST_ENDPOINT);
    vi.stubGlobal('navigator', undefined as unknown as Navigator);
    expect(() => trackEvent('plugin-copy')).not.toThrow();
  });
});
