import { describe, it, expect } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import {
  encodeSource,
  decodeSource,
  isOverLimit,
  parseShareParams,
  SHARE_SOURCE_LIMIT,
} from '../url-share';

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ── encodeSource / decodeSource ───────────────────────────────────────────────

describe('encodeSource', () => {
  it('produces a string with no base64 special characters', async () => {
    const encoded = await encodeSource('bpmn-beta\nstart s1 "Hello"');
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('produces only URL-safe characters (alphanumeric, - and _)', async () => {
    const encoded = await encodeSource('bpmn-beta\nstart s1 "Hello"');
    expect(encoded).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('prefixes compressed payloads with version 1', async () => {
    const encoded = await encodeSource('bpmn-beta\nstart s1 "Hello"');
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const payload = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    expect(payload.charCodeAt(0)).toBe(0x01);
  });

  it('round-trips ASCII source', async () => {
    const source = 'bpmn-beta\nstart s1 "Start"\ntask t1 "Do work"\nend e1 "End"';
    expect(await decodeSource(await encodeSource(source))).toBe(source);
  });

  it('round-trips Unicode source (emoji, CJK, accented)', async () => {
    const source = 'bpmn-beta\nstart s1 "Démarrage 🚀"\ntask t1 "作業"\nend e1 "Fin"';
    expect(await decodeSource(await encodeSource(source))).toBe(source);
  });

  it('round-trips source with newlines and indentation', async () => {
    const source = 'bpmn-beta\n  start  s1  "Start"\n\ttask t1 "Task"\n  end e1 "End"\n';
    expect(await decodeSource(await encodeSource(source))).toBe(source);
  });

  it('compresses repeated BPMN DSL text substantially', async () => {
    const source = Array.from(
      { length: 300 },
      (_, index) => `task:user t${index} "Review purchase request ${index}"`,
    ).join('\n');
    const encoded = await encodeSource(source);
    expect(encoded.length).toBeLessThan(source.length / 2);
  });

  it('different sources produce different encoded strings', async () => {
    const a = await encodeSource('bpmn-beta\nstart s1 "A"');
    const b = await encodeSource('bpmn-beta\nstart s1 "B"');
    expect(a).not.toBe(b);
  });
});

describe('decodeSource', () => {
  it('returns null for an empty string', async () => {
    expect(await decodeSource('')).toBeNull();
  });

  it('returns null for clearly invalid base64url', async () => {
    expect(await decodeSource('!!!invalid!!!')).toBeNull();
  });

  it('returns null for truncated compressed input', async () => {
    const encoded = await encodeSource('bpmn-beta\nstart s1 "Hello"');
    expect(await decodeSource(encoded.slice(0, 3))).toBeNull();
    expect(await decodeSource('%&^$')).toBeNull();
  });

  it('is tolerant of missing base64 padding (base64url standard)', async () => {
    // All padding lengths must decode successfully
    const sources = [
      'a',        // length 1 → needs 3 padding chars
      'ab',       // length 2 → needs 2 padding chars
      'abc',      // length 3 → needs 1 padding char
      'abcd',     // length 4 → no padding needed
    ];
    for (const s of sources) {
      const encoded = await encodeSource(s);
      // Encoded form has no = padding; decoding must still work
      expect(await decodeSource(encoded)).toBe(s);
    }
  });

  it('decodes a version 0 uncompressed payload', async () => {
    const source = 'bpmn-beta\nstart s1 "Version zero"';
    const sourceBytes = new TextEncoder().encode(source);
    const payload = new Uint8Array(sourceBytes.length + 1);
    payload[0] = 0x00;
    payload.set(sourceBytes, 1);

    expect(await decodeSource(encodeBase64Url(payload))).toBe(source);
  });

  it('decodes a historical unversioned base64url payload', async () => {
    const source = 'bpmn-beta\nstart s1 "Older link"';
    const encoded = encodeBase64Url(new TextEncoder().encode(source));
    expect(await decodeSource(encoded)).toBe(source);
  });

  it('rejects a compressed payload that expands beyond the sharing limit', async () => {
    const source = 'x'.repeat(SHARE_SOURCE_LIMIT + 1);
    const compressed = deflateRawSync(Buffer.from(source, 'utf8'));
    const payload = new Uint8Array(compressed.length + 1);
    payload[0] = 0x01;
    payload.set(compressed, 1);

    expect(await decodeSource(encodeBase64Url(payload))).toBeNull();
  });
});

// ── isOverLimit ───────────────────────────────────────────────────────────────

describe('isOverLimit', () => {
  it('returns false for a short ASCII string', () => {
    expect(isOverLimit('bpmn-beta\nstart s1 "Start"')).toBe(false);
  });

  it('returns false for a string exactly at the limit (ASCII)', () => {
    const atLimit = 'x'.repeat(SHARE_SOURCE_LIMIT);
    expect(isOverLimit(atLimit)).toBe(false);
  });

  it('returns true for a string one byte over the limit (ASCII)', () => {
    const oneOver = 'x'.repeat(SHARE_SOURCE_LIMIT + 1);
    expect(isOverLimit(oneOver)).toBe(true);
  });

  it('accounts for multibyte UTF-8 characters', () => {
    // Each emoji is 4 bytes in UTF-8; 4 501 emojis = 18 004 bytes > 18 000 limit
    const emoji = '😀'.repeat(4_501);
    expect(isOverLimit(emoji)).toBe(true);
    // 4 499 emojis = 17 996 bytes < 18 000 limit
    const safeEmoji = '😀'.repeat(4_499);
    expect(isOverLimit(safeEmoji)).toBe(false);
  });
});

// ── parseShareParams ──────────────────────────────────────────────────────────

describe('parseShareParams', () => {
  it('returns null for an empty search string', async () => {
    expect(await parseShareParams('')).toBeNull();
  });

  it('returns null for search with no recognised params', async () => {
    expect(await parseShareParams('?foo=bar&baz=qux')).toBeNull();
  });

  it('parses ?example=<id> correctly', async () => {
    const result = await parseShareParams('?example=02-gateway');
    expect(result).toEqual({ kind: 'example', id: '02-gateway' });
  });

  it('parses ?src=<encoded> correctly', async () => {
    const source = 'bpmn-beta\nstart s1 "Loaded from URL"';
    const encoded = await encodeSource(source);
    const result = await parseShareParams(`?src=${encoded}`);
    expect(result).toEqual({ kind: 'source', source });
  });

  it('src takes precedence over example when both are present', async () => {
    const source = 'bpmn-beta\nstart s1 "Has src"';
    const encoded = await encodeSource(source);
    const result = await parseShareParams(`?src=${encoded}&example=02-gateway`);
    expect(result?.kind).toBe('source');
  });

  it('returns null for a malformed src param (invalid base64url)', async () => {
    expect(await parseShareParams('?src=%3Cgarbage%3E')).toBeNull();
  });

  it('round-trips a realistic diagram source', async () => {
    const source = [
      'bpmn-beta',
      'accTitle: Purchase Approval',
      'start s1 "Submit Request"',
      'task:user t1 "Review Request"',
      'gateway g1 "Approved?"',
      'task:system t2 "Create PO"',
      'task:user t3 "Notify Rejection"',
      'end e1 "Done"',
      's1 --> t1',
      't1 --> g1',
      'g1 -->|Yes| t2',
      'g1 -->|No| t3',
      't2 --> e1',
      't3 --> e1',
    ].join('\n');
    const params = `?src=${await encodeSource(source)}`;
    const result = await parseShareParams(params);
    expect(result).toEqual({ kind: 'source', source });
  });
});
