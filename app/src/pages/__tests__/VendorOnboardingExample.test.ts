/**
 * Regression suite for the Vendor Onboarding worked example.
 *
 * Critical invariant: the supplier agreement must be drafted (t8) and signed (t9)
 * BEFORE the purchase order is issued (t7).  The diagram must enforce this through
 * the message-flow chain  t6 ~~> t8 ~~> t9 ~~> t7,  with NO direct sequence flow
 * from the approval step (t6) to the PO step (t7).
 */

import { describe, it, expect } from 'vitest';
import { parse } from '@/lib/bpmn-parser';
import { VENDOR_ONBOARDING_BPMN } from '../VendorOnboardingExample';

describe('VendorOnboardingExample — BPMN source', () => {
  const db = parse(VENDOR_ONBOARDING_BPMN);
  const flows = db.getFlows();
  const nodes = db.getNodes();

  // ── Parsing health ──────────────────────────────────────────────────────────

  it('parses without errors', () => {
    expect(db).toBeDefined();
    expect(flows.length).toBeGreaterThan(0);
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('declares the expected node IDs', () => {
    const ids = nodes.map((n) => n.id);
    for (const id of ['s1', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 'e1']) {
      expect(ids).toContain(id);
    }
  });

  // ── Pool membership ─────────────────────────────────────────────────────────

  it('places the PO task (t7) in the Procurement pool', () => {
    const t7 = nodes.find((n) => n.id === 't7');
    expect(t7?.poolId).toBe('procurement');
  });

  it('places the Sign Agreement task (t9) in the Vendor pool', () => {
    const t9 = nodes.find((n) => n.id === 't9');
    expect(t9?.poolId).toBe('vendor');
  });

  it('places the Draft Supplier Agreement task (t8) in the Legal pool', () => {
    const t8 = nodes.find((n) => n.id === 't8');
    expect(t8?.poolId).toBe('legal');
  });

  // ── Critical agreement-before-PO ordering ───────────────────────────────────

  it('has a message flow from Sign Agreement (t9) to Issue Purchase Order (t7)', () => {
    const flow = flows.find(
      (f) => f.source === 't9' && f.target === 't7' && f.kind === 'message',
    );
    expect(flow).toBeDefined();
  });

  it('has no direct sequence flow from Review & Approve (t6) to Issue PO (t7)', () => {
    // A sequence flow from t6 → t7 would allow the PO to be issued without
    // a signed agreement, recreating the prohibited agreement-bypass path.
    const bypass = flows.find(
      (f) => f.source === 't6' && f.target === 't7' && f.kind === 'sequence',
    );
    expect(bypass).toBeUndefined();
  });

  it('has a sequence flow from Issue PO (t7) to Vendor Active (e1)', () => {
    const flow = flows.find(
      (f) => f.source === 't7' && f.target === 'e1' && f.kind === 'sequence',
    );
    expect(flow).toBeDefined();
  });

  // ── Agreement drafting chain ─────────────────────────────────────────────────

  it('has a message flow from Review & Approve (t6) to Draft Agreement (t8)', () => {
    const flow = flows.find(
      (f) => f.source === 't6' && f.target === 't8' && f.kind === 'message',
    );
    expect(flow).toBeDefined();
  });

  it('has a message flow from Draft Agreement (t8) to Sign Agreement (t9)', () => {
    const flow = flows.find(
      (f) => f.source === 't8' && f.target === 't9' && f.kind === 'message',
    );
    expect(flow).toBeDefined();
  });

  // ── RFI exchange ─────────────────────────────────────────────────────────────

  it('has a message flow from Send RFI (t2) to Submit RFI Response (t5)', () => {
    const flow = flows.find(
      (f) => f.source === 't2' && f.target === 't5' && f.kind === 'message',
    );
    expect(flow).toBeDefined();
  });

  it('has a message flow from Submit RFI Response (t5) back to Score Vendor Response (t3)', () => {
    const flow = flows.find(
      (f) => f.source === 't5' && f.target === 't3' && f.kind === 'message',
    );
    expect(flow).toBeDefined();
  });

  // ── Procurement internal sequence ────────────────────────────────────────────

  it('follows the internal Procurement sequence s1→t1→t2→t3→t6', () => {
    const expected: [string, string][] = [
      ['s1', 't1'],
      ['t1', 't2'],
      ['t2', 't3'],
      ['t3', 't6'],
    ];
    for (const [src, tgt] of expected) {
      const flow = flows.find(
        (f) => f.source === src && f.target === tgt && f.kind === 'sequence',
      );
      expect(flow, `expected sequence flow ${src} → ${tgt}`).toBeDefined();
    }
  });
});
