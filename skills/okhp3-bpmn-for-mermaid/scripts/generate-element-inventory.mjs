/**
 * generate-element-inventory.mjs
 * Element count and type summary for bpmn-beta diagrams.
 * No external dependencies — runs with: node scripts/generate-element-inventory.mjs
 */

const INIT_BLOCK_RE = /%%\{[\s\S]*?\}%%/g;
const NODE_RE = /^(start|end|event:(?:message|timer|error)|task(?::[a-zA-Z]+)?|xor|or|and)\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"[^"]*"\s*$/;
const SEQ_FLOW_RE = /^[a-zA-Z][a-zA-Z0-9_]*\s+-->\s+[a-zA-Z][a-zA-Z0-9_]*/;
const DEF_FLOW_RE = /^[a-zA-Z][a-zA-Z0-9_]*\s+==>\s+[a-zA-Z][a-zA-Z0-9_]*/;
const MSG_FLOW_RE = /^[a-zA-Z][a-zA-Z0-9_]*\s+~~>\s+[a-zA-Z][a-zA-Z0-9_]*/;
const POOL_RE = /^pool\s+/;
const LANE_RE = /^lane\s+/;

/**
 * Generate a structured element inventory from a bpmn-beta diagram.
 *
 * @param {string} bpmnBetaCode
 * @returns {{
 *   pools: number,
 *   lanes: number,
 *   tasks: { total: number, user: number, service: number, script: number, receive: number, send: number, abstract: number },
 *   events: { total: number, start: number, end: number, intermediate: number },
 *   gateways: { total: number, xor: number, and: number, or: number },
 *   flows: { sequence: number, message: number, default: number, total: number }
 * }}
 */
export function generateElementInventory(bpmnBetaCode) {
  const stripped = bpmnBetaCode.replace(INIT_BLOCK_RE, '').trim();
  const lines = stripped.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));

  const inventory = {
    pools: 0,
    lanes: 0,
    tasks: { total: 0, user: 0, service: 0, script: 0, receive: 0, send: 0, abstract: 0 },
    events: { total: 0, start: 0, end: 0, intermediate: 0 },
    gateways: { total: 0, xor: 0, and: 0, or: 0 },
    flows: { sequence: 0, message: 0, default: 0, total: 0 },
  };

  for (const line of lines) {
    if (line === 'bpmn-beta' || line === '{' || line === '}') continue;
    if (line.startsWith('accTitle:') || line.startsWith('accDescr:')) continue;

    if (POOL_RE.test(line)) { inventory.pools++; continue; }
    if (LANE_RE.test(line)) { inventory.lanes++; continue; }

    const nodeMatch = line.match(NODE_RE);
    if (nodeMatch) {
      const keyword = nodeMatch[1];
      if (keyword === 'start') {
        inventory.events.start++;
        inventory.events.total++;
      } else if (keyword === 'end') {
        inventory.events.end++;
        inventory.events.total++;
      } else if (keyword.startsWith('event:')) {
        inventory.events.intermediate++;
        inventory.events.total++;
      } else if (keyword.startsWith('task')) {
        inventory.tasks.total++;
        const subtype = keyword.includes(':') ? keyword.split(':')[1] : null;
        switch (subtype) {
          case 'user':    inventory.tasks.user++;    break;
          case 'service': inventory.tasks.service++; break;
          case 'script':  inventory.tasks.script++;  break;
          case 'receive': inventory.tasks.receive++; break;
          case 'send':    inventory.tasks.send++;    break;
          default:        inventory.tasks.abstract++; break;
        }
      } else if (keyword === 'xor') {
        inventory.gateways.xor++;
        inventory.gateways.total++;
      } else if (keyword === 'and') {
        inventory.gateways.and++;
        inventory.gateways.total++;
      } else if (keyword === 'or') {
        inventory.gateways.or++;
        inventory.gateways.total++;
      }
      continue;
    }

    if (MSG_FLOW_RE.test(line)) {
      inventory.flows.message++;
      inventory.flows.total++;
    } else if (DEF_FLOW_RE.test(line)) {
      inventory.flows.default++;
      inventory.flows.total++;
    } else if (SEQ_FLOW_RE.test(line)) {
      inventory.flows.sequence++;
      inventory.flows.total++;
    }
  }

  return inventory;
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('generate-element-inventory.mjs')) {
  import('node:fs').then(({ readFileSync }) => {
    import('node:path').then(({ resolve }) => {
      const file = process.argv[2];
      if (!file) {
        console.log('Usage: node scripts/generate-element-inventory.mjs <file.mmd>');
        process.exit(0);
      }
      try {
        const code = readFileSync(resolve(file), 'utf8');
        const inv = generateElementInventory(code);
        console.log('Element Inventory:');
        console.log(`  Pools:    ${inv.pools}`);
        console.log(`  Lanes:    ${inv.lanes}`);
        console.log(`  Tasks:    ${inv.tasks.total} (user: ${inv.tasks.user}, service: ${inv.tasks.service}, script: ${inv.tasks.script}, receive: ${inv.tasks.receive}, send: ${inv.tasks.send}, abstract: ${inv.tasks.abstract})`);
        console.log(`  Events:   ${inv.events.total} (start: ${inv.events.start}, end: ${inv.events.end}, intermediate: ${inv.events.intermediate})`);
        console.log(`  Gateways: ${inv.gateways.total} (xor: ${inv.gateways.xor}, and: ${inv.gateways.and}, or: ${inv.gateways.or})`);
        console.log(`  Flows:    ${inv.flows.total} (sequence: ${inv.flows.sequence}, message: ${inv.flows.message}, default: ${inv.flows.default})`);
        process.exit(0);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
  });
}
