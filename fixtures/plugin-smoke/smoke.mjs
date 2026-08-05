#!/usr/bin/env node
/**
 * smoke.mjs — Plugin smoke test
 *
 * Verifies that @okhp3/mermaid-diagram-bpmn, installed from the packed .tgz
 * artifact, works end-to-end with a real mermaid.render() call.
 *
 * Run via: node scripts/run-plugin-smoke.mjs (from repo root)
 * Do NOT run this file directly — the package must be installed first.
 *
 * Test environment notes:
 *   - happy-dom provides DOMParser / document / window for mermaid.render().
 *   - securityLevel:'loose' is required in happy-dom: its HTML parser drops
 *     SVG children after <defs>; DOMPurify (mermaid's default) re-parses
 *     through the same parser and strips <g> nodes. With 'loose', mermaid
 *     skips DOMPurify and returns the SVG produced by DOMParser(image/svg+xml).
 *   - Dynamic import() is used so globals are set up before mermaid loads.
 */

import { Window } from 'happy-dom';

// ── 1. DOM polyfill ──────────────────────────────────────────────────────────
// Must be set up before dynamically importing mermaid, so mermaid picks
// up the global document / window on first load.

const happiWindow = new Window({ url: 'https://smoke.test.local/' });

// Set required DOM globals.  Some (navigator, location) are read-only getters
// on globalThis in Node.js 24+; use Object.defineProperty for those.
const safeSet = (key, value) => {
  const desc = Object.getOwnPropertyDescriptor(globalThis, key);
  if (desc && !desc.writable && !desc.set) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  } else {
    globalThis[key] = value;
  }
};

safeSet('window',       happiWindow);
safeSet('document',     happiWindow.document);
safeSet('DOMParser',    happiWindow.DOMParser);
safeSet('navigator',    happiWindow.navigator);
safeSet('location',     happiWindow.location);
safeSet('customElements', happiWindow.customElements);

// ── 2. Dynamic imports (after globals are set) ───────────────────────────────

const { default: mermaid } = await import('mermaid');
const { bpmnPlugin, MERMAID_VERSION_TARGET } = await import('@okhp3/mermaid-diagram-bpmn');

// ── 3. Setup ─────────────────────────────────────────────────────────────────

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
await mermaid.registerExternalDiagrams([bpmnPlugin]);

// ── 4. Corpus fixtures ───────────────────────────────────────────────────────

const LINEAR_PROCESS = `bpmn-beta
accTitle: Simple Linear Process
accDescr: A single user task between a start event and an end event.

start s1 "Start"
task:user t1 "Submit Request"
end e1 "Done"

s1 --> t1
t1 --> e1
`;

const PURCHASE_ORDER = `bpmn-beta
accTitle: Purchase Order Approval
accDescr: Requester submits a PO request. Manager reviews and approves or rejects.

pool po_process "Purchase Order Process" {

  lane requester "Requester" {
    start s1 "PO Request Submitted"
    task:user t1 "Submit PO Request"
    end e2 "Request Rejected"
  }

  lane manager "Manager" {
    task:user t2 "Review PO Request"
    xor g1 "Approved?"
    task:service t4 "Send Rejection Notice"
  }

  lane procurement "Procurement" {
    task:service t3 "Issue Purchase Order"
    end e1 "PO Issued"
  }

  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> t3: "yes"
  g1 --> t4: "no"
  t3 --> e1
  t4 --> e2
}
`;

// ── 5. Assertions ─────────────────────────────────────────────────────────────

let pass = 0;
let fail = 0;

function assert(label, value, expected) {
  if (value === expected || (expected === true && !!value)) {
    console.log(`  ✔  ${label}`);
    pass++;
  } else {
    console.error(`  ✖  ${label}`);
    console.error(`     expected: ${JSON.stringify(expected)}`);
    console.error(`     received: ${JSON.stringify(value)}`);
    fail++;
  }
}

function assertContains(label, haystack, needle) {
  const ok = typeof haystack === 'string' && haystack.includes(needle);
  if (ok) {
    console.log(`  ✔  ${label}`);
    pass++;
  } else {
    console.error(`  ✖  ${label}`);
    console.error(`     SVG did not contain: ${needle}`);
    fail++;
  }
}

// Version pin
console.log('\n── MERMAID_VERSION_TARGET ──');
assert('MERMAID_VERSION_TARGET is a semver string', /^\d+\.\d+\.\d+$/.test(MERMAID_VERSION_TARGET), true);

// Flat diagram
console.log('\n── Linear process (flat diagram) ──');
const { svg: svgLinear } = await mermaid.render('smoke-linear', LINEAR_PROCESS);
assert('svg is a non-empty string', typeof svgLinear === 'string' && svgLinear.length > 100, true);
assertContains('SVG contains bpmn-task', svgLinear, 'bpmn-task');
assertContains('SVG contains bpmn-event', svgLinear, 'bpmn-event');
assertContains('SVG contains bpmn-flow-sequence', svgLinear, 'bpmn-flow-sequence');
assertContains('SVG contains embedded <style>', svgLinear, '<style>');

// Pool/lane diagram
console.log('\n── Purchase order approval (pool/lane diagram) ──');
const { svg: svgPO } = await mermaid.render('smoke-purchase-order', PURCHASE_ORDER);
assert('svg is a non-empty string', typeof svgPO === 'string' && svgPO.length > 100, true);
assertContains('SVG contains bpmn-pool', svgPO, 'bpmn-pool');
assertContains('SVG contains bpmn-lane', svgPO, 'bpmn-lane');
assertContains('SVG contains bpmn-task', svgPO, 'bpmn-task');
assertContains('SVG contains bpmn-flow-conditional (yes/no branches)', svgPO, 'bpmn-flow-conditional');
assertContains('SVG contains bpmn-gateway', svgPO, 'bpmn-gateway');

// ── 6. Summary ───────────────────────────────────────────────────────────────

console.log(`\n  ${fail === 0 ? '✅ ALL PASS' : '❌ FAILURES'}  ${pass}/${pass + fail} assertions passed\n`);

if (fail > 0) process.exit(1);
