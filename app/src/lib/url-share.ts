/**
 * url-share.ts
 *
 * Encode and decode Playground source for shareable, server-less URLs.
 *
 * URL scheme (mutually exclusive; `src` takes precedence):
 *   ?example=<id>          — canonical example by BPMN_EXAMPLES ID
 *   ?src=<base64url>       — versioned, compressed arbitrary source
 *
 * Encoding
 * ─────────
 * Source text → UTF-8 bytes → DEFLATE-raw → version byte → base64url
 *   + → -
 *   / → _
 *   = (padding) → omitted
 *
 * The reverse is applied on decode. Version 0 remains uncompressed for
 * compatibility, and payloads created before versioning are decoded as raw
 * UTF-8 bytes as well.
 *
 * Size limits
 * ───────────
 * SHARE_SOURCE_LIMIT is the maximum UTF-8 byte count we accept for URL encoding.
 * Typical BPMN DSL compresses by 50–70%, so an 18 000-byte source generally fits
 * within an 8 000-character parameter while retaining a safe raw-input ceiling.
 *
 * Sources larger than SHARE_SOURCE_LIMIT are not encoded; callers are expected to
 * display a visible notice and suggest downloading the .mmd file instead.
 */

/** Maximum UTF-8 byte length accepted for a compressed URL payload. */
export const SHARE_SOURCE_LIMIT = 18_000;

const LEGACY_VERSION = 0x00;
const DEFLATE_RAW_VERSION = 0x01;
const DEFLATE_RAW = 'deflate-raw' as CompressionFormat;

/**
 * Return `true` when the source exceeds the shareable size limit.
 * Uses `TextEncoder.encode().length` for accurate UTF-8 byte counting.
 */
export function isOverLimit(source: string): boolean {
  return new TextEncoder().encode(source).length > SHARE_SOURCE_LIMIT;
}

/**
 * Convert arbitrary bytes to an unpadded base64url string.
 */
function encodeBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode an unpadded base64url string into bytes, or return null on failure. */
function decodeBase64Url(encoded: string): Uint8Array | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (b64.length % 4)) % 4;
    const binary = atob(b64 + '='.repeat(pad));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Read a stream into bytes, rejecting as soon as the optional output cap is
 * exceeded. This is required when decoding untrusted compressed URL payloads.
 */
async function readStream(
  stream: ReadableStream<Uint8Array>,
  maxOutputBytes?: number,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalLength += value.byteLength;

      if (maxOutputBytes !== undefined && totalLength > maxOutputBytes) {
        await reader.cancel('Compressed URL exceeds the source sharing limit.');
        throw new Error('Decompressed source exceeds the sharing limit.');
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

/** Transform bytes through a browser-native compression or decompression stream. */
async function transformDeflateRaw(
  bytes: Uint8Array,
  Stream: typeof CompressionStream | typeof DecompressionStream,
  maxOutputBytes?: number,
): Promise<Uint8Array> {
  const stream = new Stream(DEFLATE_RAW);
  const writer = stream.writable.getWriter();
  // Attach the rejection handler immediately: Node's stream implementation can
  // reject while writer.close() is still pending for malformed DEFLATE input.
  const output = readStream(stream.readable, maxOutputBytes).then(
    bytes => ({ bytes }),
    error => ({ error }),
  );
  let writeError: unknown;
  try {
    // Own the backing buffer so the DOM stream's stricter BufferSource type is
    // satisfied even when the caller passed a subarray view.
    await writer.write(new Uint8Array(bytes));
    await writer.close();
  } catch (error) {
    writeError = error;
  }
  const result = await output;
  if ('error' in result) throw result.error;
  if (writeError) throw writeError;
  return result.bytes;
}

/**
 * Encode `source` as a versioned, DEFLATE-raw-compressed base64url string.
 *
 * Throws if `source` is over the limit — callers should guard with
 * `isOverLimit()` first, or catch the error and show a message.
 */
export async function encodeSource(source: string): Promise<string> {
  const bytes = new TextEncoder().encode(source);
  if (bytes.length > SHARE_SOURCE_LIMIT) {
    throw new Error(`Source exceeds the ${SHARE_SOURCE_LIMIT}-byte share limit.`);
  }

  const compressed = await transformDeflateRaw(bytes, CompressionStream);
  const payload = new Uint8Array(compressed.length + 1);
  payload[0] = DEFLATE_RAW_VERSION;
  payload.set(compressed, 1);
  return encodeBase64Url(payload);
}

/**
 * Decode a base64url string produced by `encodeSource`.
 *
 * Returns `null` on any error (malformed input, truncated URL, etc.) so callers
 * can degrade gracefully without crashing.
 */
export async function decodeSource(encoded: string): Promise<string | null> {
  if (!encoded) return null;
  const payload = decodeBase64Url(encoded);
  if (!payload) return null;

  try {
    if (payload[0] === DEFLATE_RAW_VERSION) {
      return new TextDecoder().decode(
        await transformDeflateRaw(
          payload.subarray(1),
          DecompressionStream,
          SHARE_SOURCE_LIMIT,
        ),
      );
    }

    // Version 0 was reserved for uncompressed payloads. Payloads generated
    // before versioning began have no prefix, so their first byte is ordinary
    // source text (normally `b` from the bpmn-beta header) and follow this path.
    const bytes = payload[0] === LEGACY_VERSION ? payload.subarray(1) : payload;
    if (bytes.length > SHARE_SOURCE_LIMIT) return null;
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
export async function parseShareParams(search: string): Promise<{
  kind: 'example';
  id: string;
} | {
  kind: 'source';
  source: string;
} | null> {
  const params = new URLSearchParams(search);
  const encoded = params.get('src');
  const exampleId = params.get('example');

  if (encoded) {
    const source = await decodeSource(encoded);
    if (source !== null) return { kind: 'source', source };
    // Malformed encoded param → ignore, fall back to defaults
    return null;
  }

  if (exampleId) {
    return { kind: 'example', id: exampleId };
  }

  return null;
}
