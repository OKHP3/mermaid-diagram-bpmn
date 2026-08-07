/**
 * url-share.ts
 *
 * Encode and decode Playground source for shareable, server-less URLs.
 *
 * URL scheme (mutually exclusive; `src` takes precedence):
 *   ?example=<id>          — canonical example by BPMN_EXAMPLES ID
 *   ?src=<base64url>       — arbitrary source encoded as URL-safe base64
 *
 * Encoding
 * ─────────
 * Source text → UTF-8 bytes → base64 → URL-safe base64 (base64url, RFC 4648 §5)
 *   + → -
 *   / → _
 *   = (padding) → omitted
 *
 * The reverse is applied on decode.
 *
 * Size limits
 * ───────────
 * SHARE_SOURCE_LIMIT is the maximum UTF-8 byte count we accept for URL encoding.
 * At 6 000 bytes the base64url string is ~8 000 chars.  Combined with the rest of
 * a typical URL the total stays well below the de-facto safe cap of 65 536 chars
 * observed in modern browsers.
 *
 * Sources larger than SHARE_SOURCE_LIMIT are not encoded; callers are expected to
 * display a visible notice and suggest downloading the .mmd file instead.
 */

/** Maximum UTF-8 byte length we will encode into a URL parameter. */
export const SHARE_SOURCE_LIMIT = 6_000;

/**
 * Return `true` when the source exceeds the shareable size limit.
 * Uses `TextEncoder.encode().length` for accurate UTF-8 byte counting.
 */
export function isOverLimit(source: string): boolean {
  return new TextEncoder().encode(source).length > SHARE_SOURCE_LIMIT;
}

/**
 * Encode `source` as a URL-safe base64url string.
 *
 * Throws if `source` is over the limit — callers should guard with
 * `isOverLimit()` first, or catch the error and show a message.
 */
export function encodeSource(source: string): string {
  const bytes = new TextEncoder().encode(source);
  // btoa operates on binary strings (Latin-1), so convert bytes to chars first.
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  const b64 = btoa(binary);
  // Produce URL-safe base64url (RFC 4648 §5): replace + → - and / → _, drop padding.
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a base64url string produced by `encodeSource`.
 *
 * Returns `null` on any error (malformed input, truncated URL, etc.) so callers
 * can degrade gracefully without crashing.
 */
export function decodeSource(encoded: string): string | null {
  if (!encoded) return null;
  try {
    // Restore standard base64: - → + and _ → /, then add padding.
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (b64.length % 4)) % 4;
    const padded = b64 + '='.repeat(pad);
    const binary = atob(padded);
    // Convert binary string back to a Uint8Array and decode as UTF-8.
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Parse the Playground URL search params and return the intended initial state.
 *
 * Returns `null` when no URL-driven state is found (caller should use defaults).
 * Decoding errors degrade gracefully — returns `null` so the caller falls back.
 */
export function parseShareParams(search: string): {
  kind: 'example';
  id: string;
} | {
  kind: 'source';
  source: string;
} | null {
  const params = new URLSearchParams(search);
  const encoded = params.get('src');
  const exampleId = params.get('example');

  if (encoded) {
    const source = decodeSource(encoded);
    if (source !== null) return { kind: 'source', source };
    // Malformed encoded param → ignore, fall back to defaults
    return null;
  }

  if (exampleId) {
    return { kind: 'example', id: exampleId };
  }

  return null;
}
