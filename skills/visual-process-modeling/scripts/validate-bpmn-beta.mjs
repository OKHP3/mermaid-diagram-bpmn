/**
 * validate-bpmn-beta.mjs
 * Structural and syntax validation for bpmn-beta diagrams.
 * No external dependencies — runs with: node scripts/validate-bpmn-beta.mjs
 */

// ─── Regex Patterns (mirroring bpmn-parser.ts) ───────────────────────────────

const INIT_BLOCK_RE = /%%\{[\s\S]*?\}%%/g;
const COMMENT_RE = /^%%/;
const ACC_TITLE_RE = /^accTitle:\s*(.+)$/;
const ACC_DESCR_RE = /^accDescr:\s*(.+)$/;
const POOL_RE = /^pool\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"\s*\{?$/;
const LANE_RE = /^lane\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"\s*\{?$/;
const NODE_RE = /^(start|end|event:(?:message|timer|error)|task(?::[a-zA-Z]+)?|xor|or|and)\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"$/;
const COND_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+-->\s+([a-zA-Z][a-zA-Z0-9_]*):\s+"([^"]*)"$/;
const SEQ_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+-->\s+([a-zA-Z][a-zA-Z0-9_]*)$/;
const DEF_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+==>\s+([a-zA-Z][a-zA-Z0-9_]*)$/;
const MSG_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+~~>\s+([a-zA-Z][a-zA-Z0-9_]*)(?::\s*"([^"]*)")?$/;

const RESERVED = new Set(['pool', 'lane', 'start', 'end', 'task', 'xor', 'and', 'or', 'event', 'message']);
const EXPERIMENTAL_KEYWORDS = new Set(['event:message', 'event:timer', 'event:error']);

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Parse bpmn-beta source into a structural model.
 * @param {string} source
 * @returns {ParseResult}
 */
function parseBpmnBeta(source) {
  const elements = [];
  const flows = [];
  const pools = [];
  const lanes = [];
  const parseErrors = [];

  const stripped = source.replace(INIT_BLOCK_RE, '').trim();
  const rawLines = stripped.split('\n');

  const contextStack = [];

  const currentPool = () => [...contextStack].reverse().find(c => c.type === 'pool');
  const currentLane = () => [...contextStack].reverse().find(c => c.type === 'lane');

  let lineNum = 0;
  let hasBpmnBeta = false;

  for (const rawLine of rawLines) {
    lineNum++;
    const line = rawLine.trim();

    if (!line || COMMENT_RE.test(line)) continue;
    if (line === 'bpmn-beta') { hasBpmnBeta = true; continue; }
    if (line === '{') continue;
    if (ACC_TITLE_RE.test(line) || ACC_DESCR_RE.test(line)) continue;

    if (line === '}') {
      if (contextStack.length === 0) {
        parseErrors.push(`Line ${lineNum}: unexpected } — no open block`);
      } else {
        contextStack.pop();
      }
      continue;
    }

    const poolMatch = line.match(POOL_RE);
    if (poolMatch) {
      if (currentPool()) {
        parseErrors.push(`Line ${lineNum}: pools cannot be nested`);
      } else {
        pools.push(poolMatch[1]);
        contextStack.push({ type: 'pool', id: poolMatch[1] });
      }
      continue;
    }

    const laneMatch = line.match(LANE_RE);
    if (laneMatch) {
      if (!currentPool()) {
        parseErrors.push(`Line ${lineNum}: lane must be inside a pool block`);
      } else if (currentLane()) {
        parseErrors.push(`Line ${lineNum}: nested lanes are not supported`);
      } else {
        lanes.push(laneMatch[1]);
        contextStack.push({ type: 'lane', id: laneMatch[1] });
      }
      continue;
    }

    const nodeMatch = line.match(NODE_RE);
    if (nodeMatch) {
      const [, keyword, id] = nodeMatch;
      const pool = currentPool();
      const lane = currentLane();
      elements.push({
        id,
        keyword,
        kind: keyword.startsWith('task') ? 'task'
            : keyword === 'xor' || keyword === 'and' || keyword === 'or' ? 'gateway'
            : 'event',
        poolId: pool?.id,
        laneId: lane?.id,
        experimental: EXPERIMENTAL_KEYWORDS.has(keyword),
      });
      continue;
    }

    const condMatch = line.match(COND_FLOW_RE);
    if (condMatch) {
      const pool = currentPool();
      flows.push({ source: condMatch[1], target: condMatch[2], kind: 'conditional', label: condMatch[3], poolContext: pool?.id });
      continue;
    }

    const seqMatch = line.match(SEQ_FLOW_RE);
    if (seqMatch) {
      const pool = currentPool();
      flows.push({ source: seqMatch[1], target: seqMatch[2], kind: 'sequence', poolContext: pool?.id });
      continue;
    }

    const defMatch = line.match(DEF_FLOW_RE);
    if (defMatch) {
      const pool = currentPool();
      flows.push({ source: defMatch[1], target: defMatch[2], kind: 'default', poolContext: pool?.id });
      continue;
    }

    const msgMatch = line.match(MSG_FLOW_RE);
    if (msgMatch) {
      if (contextStack.length > 0) {
        parseErrors.push(`Line ${lineNum}: message flows (~~>) must be declared at the top level, not inside a pool or lane block`);
      } else {
        flows.push({ source: msgMatch[1], target: msgMatch[2], kind: 'message', label: msgMatch[3] });
      }
      continue;
    }
  }

  for (const ctx of contextStack) {
    parseErrors.push(`Unclosed ${ctx.type} block: '${ctx.id}' — add a closing '}'`);
  }

  return { elements, flows, pools, lanes, hasBpmnBeta, parseErrors };
}

// ─── Validation Rules ─────────────────────────────────────────────────────────

/**
 * @param {string} bpmnBetaCode
 * @returns {{ valid: boolean, errors: Array<{ruleId: string, message: string, element?: string}>, warnings: Array<{message: string, element?: string}> }}
 */
export function validateBpmnBeta(bpmnBetaCode) {
  const errors = [];
  const warnings = [];

  const { elements, flows, pools, hasBpmnBeta, parseErrors } = parseBpmnBeta(bpmnBetaCode);

  for (const e of parseErrors) {
    errors.push({ ruleId: 'PARSE', message: e });
  }

  if (!hasBpmnBeta) {
    errors.push({ ruleId: 'HEADER', message: "Diagram does not start with 'bpmn-beta'. Add 'bpmn-beta' as the first non-comment line." });
  }

  const elementIds = new Set(elements.map(e => e.id));

  // VR-001: At least one start event
  const starts = elements.filter(e => e.kind === 'event' && e.keyword === 'start');
  if (starts.length === 0) {
    errors.push({ ruleId: 'VR-001', message: "No start event found. Add a 'start [id] \"[Label]\"' declaration." });
  }

  // VR-002: At least one end event
  const ends = elements.filter(e => e.kind === 'event' && e.keyword === 'end');
  if (ends.length === 0) {
    errors.push({ ruleId: 'VR-002', message: "No end event found. Add an 'end [id] \"[Label]\"' declaration." });
  }

  // VR-003 + VR-004: Reference integrity
  for (const flow of flows) {
    if (!elementIds.has(flow.source)) {
      errors.push({ ruleId: 'VR-003', message: `Flow source '${flow.source}' is not a declared element.`, element: flow.source });
    }
    if (!elementIds.has(flow.target)) {
      errors.push({ ruleId: 'VR-004', message: `Flow target '${flow.target}' is not a declared element.`, element: flow.target });
    }
  }

  // VR-005 + VR-006: XOR gateway cardinality and labeling
  const xorGateways = elements.filter(e => e.keyword === 'xor');
  for (const xor of xorGateways) {
    const outgoing = flows.filter(f => f.source === xor.id && f.kind !== 'message');
    if (outgoing.length < 2) {
      errors.push({ ruleId: 'VR-005', message: `XOR gateway '${xor.id}' has ${outgoing.length} outgoing flow(s); at least 2 required.`, element: xor.id });
    }
    const unlabeled = outgoing.filter(f => !f.label);
    if (unlabeled.length > 0) {
      errors.push({ ruleId: 'VR-006', message: `XOR gateway '${xor.id}' has ${unlabeled.length} outgoing flow(s) without a condition label. Add a label: 'source --> target: "condition"'.`, element: xor.id });
    }
  }

  // VR-007: No orphan elements
  const usedInFlows = new Set();
  for (const flow of flows) {
    usedInFlows.add(flow.source);
    usedInFlows.add(flow.target);
  }
  for (const el of elements) {
    if (!usedInFlows.has(el.id)) {
      errors.push({ ruleId: 'VR-007', message: `Element '${el.id}' (${el.keyword}) is an orphan — it does not appear in any flow.`, element: el.id });
    }
  }

  // VR-008: Sequence flows must not cross pool boundaries
  if (pools.length > 1) {
    const elementPoolMap = new Map(elements.map(e => [e.id, e.poolId]));
    for (const flow of flows) {
      if (flow.kind === 'message') continue;
      const sourcePool = elementPoolMap.get(flow.source);
      const targetPool = elementPoolMap.get(flow.target);
      if (sourcePool && targetPool && sourcePool !== targetPool) {
        errors.push({
          ruleId: 'VR-008',
          message: `Sequence flow from '${flow.source}' (pool: ${sourcePool}) to '${flow.target}' (pool: ${targetPool}) crosses a pool boundary. Use '~~>' message flow at top level.`,
          element: `${flow.source} --> ${flow.target}`,
        });
      }
    }
  }

  // VR-011: Reserved keywords as IDs
  for (const el of elements) {
    if (RESERVED.has(el.id)) {
      errors.push({ ruleId: 'VR-011', message: `Element ID '${el.id}' is a reserved keyword. Rename it to a non-reserved identifier.`, element: el.id });
    }
  }

  // VR-012: AND split/join pairing (warning only)
  const andGateways = elements.filter(e => e.keyword === 'and');
  for (const andGw of andGateways) {
    const outgoing = flows.filter(f => f.source === andGw.id);
    if (outgoing.length >= 2) {
      const andJoins = andGateways.filter(g => {
        const incoming = flows.filter(f => f.target === g.id);
        return incoming.length >= 2 && g.id !== andGw.id;
      });
      if (andJoins.length === 0) {
        const allPathsTerminate = outgoing.every(f => {
          const target = elements.find(e => e.id === f.target);
          return target && target.keyword === 'end';
        });
        if (!allPathsTerminate) {
          warnings.push({ message: `AND split gateway '${andGw.id}' may be missing a corresponding AND join. Verify parallel paths are properly rejoined.`, element: andGw.id });
        }
      }
    }
  }

  // Experimental keyword warnings
  const experimentalUsed = elements.filter(e => e.experimental);
  for (const el of experimentalUsed) {
    warnings.push({ message: `Element '${el.id}' uses experimental keyword '${el.keyword}' which is not yet parsed by the v0.1 renderer. It will be silently skipped in the playground.`, element: el.id });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('validate-bpmn-beta.mjs')) {
  import('node:fs').then(({ readFileSync }) => {
    import('node:path').then(({ resolve }) => {
      const file = process.argv[2];
      if (!file) {
        console.log('Usage: node scripts/validate-bpmn-beta.mjs <file.mmd>');
        console.log('Validates a bpmn-beta diagram file against all VR rules.');
        process.exit(0);
      }
      try {
        const code = readFileSync(resolve(file), 'utf8');
        const result = validateBpmnBeta(code);
        if (result.valid) {
          console.log('BPMN Compliance: PASS');
        } else {
          console.log(`BPMN Compliance: FAIL (${result.errors.length} issue(s) found)`);
          result.errors.forEach((e, i) => console.log(`  [Issue ${i + 1}] [${e.ruleId}] ${e.message}`));
        }
        if (result.warnings.length > 0) {
          console.log(`Warnings: ${result.warnings.length}`);
          result.warnings.forEach(w => console.log(`  [WARN] ${w.message}`));
        }
        process.exit(result.valid ? 0 : 1);
      } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        process.exit(1);
      }
    });
  });
}
