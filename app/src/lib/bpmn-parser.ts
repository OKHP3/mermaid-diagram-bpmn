import { BpmnDb, BpmnNode } from './bpmn-db';
import { ParseError } from './bpmn-error';
export { BpmnDb } from './bpmn-db';
export { ParseError } from './bpmn-error';
export type { ParseErrorCode } from './bpmn-error';
export type { BpmnNode, BpmnFlow, BpmnPool, BpmnLane } from './bpmn-db';

type ContextEntry = { type: 'pool'; id: string } | { type: 'lane'; id: string };

const NODE_PATTERN = /^(start|end|task(?::[a-zA-Z]+)?|xor|or|and)\s+([a-zA-Z0-9_]+)\s+"([^"]*)"$/;
const POOL_PATTERN = /^pool\s+([a-zA-Z0-9_]+)\s+"([^"]*)"\s*\{?$/;
const LANE_PATTERN = /^lane\s+([a-zA-Z0-9_]+)\s+"([^"]*)"\s*\{?$/;
const COND_FLOW_PATTERN = /^([a-zA-Z0-9_]+)\s+-->\s+([a-zA-Z0-9_]+):\s+"([^"]*)"$/;
const SEQ_FLOW_PATTERN = /^([a-zA-Z0-9_]+)\s+-->\s+([a-zA-Z0-9_]+)$/;
const DEF_FLOW_PATTERN = /^([a-zA-Z0-9_]+)\s+==>\s+([a-zA-Z0-9_]+)$/;
const MSG_FLOW_PATTERN = /^([a-zA-Z0-9_]+)\s+~~>\s+([a-zA-Z0-9_]+)$/;

export function parse(source: string): BpmnDb {
  const db = new BpmnDb();
  const lines = source
    .split('\n')
    .map((raw, index) => ({ text: raw.trim(), sourceLine: index + 1 }))
    .filter(({ text }) => text.length > 0 && !text.startsWith('%%'));

  const contextStack: ContextEntry[] = [];
  let flowCounter = 0;
  // Keep direct references so context lookups stay O(1) per parsed line. These
  // are parser-local (rather than module-global) to keep concurrent parse calls
  // independent.
  let currentPoolRef: ContextEntry | undefined;
  let currentLaneRef: ContextEntry | undefined;

  for (const { text: line, sourceLine } of lines) {

    if (line === 'bpmn-beta' || line === '{') continue;

    if (line.startsWith('accTitle:')) {
      db.setAccTitle(line.slice('accTitle:'.length).trim());
      continue;
    }
    if (line.startsWith('accDescr:')) {
      db.setAccDescription(line.slice('accDescr:'.length).trim());
      continue;
    }

    if (line === '}') {
      if (contextStack.length === 0) {
        throw new ParseError(`Line ${sourceLine}: unexpected } — no open block`, sourceLine, 'UNEXPECTED_CLOSE_BRACE');
      }
      const closedContext = contextStack.pop();
      if (closedContext?.type === 'lane') {
        currentLaneRef = undefined;
      } else {
        currentPoolRef = undefined;
      }
      continue;
    }

    const poolMatch = line.match(POOL_PATTERN);
    if (poolMatch) {
      if (currentPoolRef) {
        throw new ParseError(`Line ${sourceLine}: pools cannot be nested`, sourceLine, 'NESTED_POOL');
      }
      const poolId = poolMatch[1];
      const poolLabel = poolMatch[2];
      db.addPool({ id: poolId, label: poolLabel, laneIds: [], sourceLine });
      currentPoolRef = { type: 'pool', id: poolId };
      contextStack.push(currentPoolRef);
      continue;
    }

    const laneMatch = line.match(LANE_PATTERN);
    if (laneMatch) {
      const pool = currentPoolRef;
      if (!pool) throw new ParseError(`Line ${sourceLine}: lane must be inside a pool block`, sourceLine, 'LANE_OUTSIDE_POOL');
      if (currentLaneRef) throw new ParseError(`Line ${sourceLine}: nested lanes are not supported`, sourceLine, 'NESTED_LANE');
      const laneId = laneMatch[1];
      const laneLabel = laneMatch[2];
      db.addLane({ id: laneId, label: laneLabel, poolId: pool.id });
      const poolObj = db.getPools().find(p => p.id === pool.id);
      if (poolObj) poolObj.laneIds.push(laneId);
      currentLaneRef = { type: 'lane', id: laneId };
      contextStack.push(currentLaneRef);
      continue;
    }

    const nodeMatch = line.match(NODE_PATTERN);
    if (nodeMatch) {
      const typeStr = nodeMatch[1];
      const nodeId = nodeMatch[2];
      const label = nodeMatch[3];
      const pool = currentPoolRef;
      const lane = currentLaneRef;

      let kind: BpmnNode['kind'];
      let subtype: string | undefined;
      let position: BpmnNode['position'];

      if (typeStr === 'start') {
        kind = 'event'; position = 'start';
      } else if (typeStr === 'end') {
        kind = 'event'; position = 'end';
      } else if (typeStr.startsWith('task')) {
        kind = 'task';
        subtype = typeStr.includes(':') ? typeStr.split(':')[1] : undefined;
      } else {
        kind = 'gateway'; subtype = typeStr;
      }

      db.addNode({
        id: nodeId, kind, subtype, position, label,
        laneId: lane?.id, poolId: pool?.id,
        sourceLine,
      });
      continue;
    }

    const condMatch = line.match(COND_FLOW_PATTERN);
    if (condMatch) {
      db.addFlow({ id: `f${++flowCounter}`, source: condMatch[1], target: condMatch[2], kind: 'conditional', label: condMatch[3], sourceLine });
      continue;
    }

    const seqMatch = line.match(SEQ_FLOW_PATTERN);
    if (seqMatch) {
      db.addFlow({ id: `f${++flowCounter}`, source: seqMatch[1], target: seqMatch[2], kind: 'sequence', sourceLine });
      continue;
    }

    const defMatch = line.match(DEF_FLOW_PATTERN);
    if (defMatch) {
      db.addFlow({ id: `f${++flowCounter}`, source: defMatch[1], target: defMatch[2], kind: 'default', sourceLine });
      continue;
    }

    const msgMatch = line.match(MSG_FLOW_PATTERN);
    if (msgMatch) {
      if (contextStack.length > 0) {
        throw new ParseError(`Line ${sourceLine}: message flows (~~>) must be declared at the top level, not inside a pool or lane block`, sourceLine, 'MESSAGE_FLOW_INSIDE_BLOCK');
      }
      db.addFlow({ id: `f${++flowCounter}`, source: msgMatch[1], target: msgMatch[2], kind: 'message', sourceLine });
      continue;
    }
  }

  return db;
}
