import { BpmnDb, BpmnNode } from './bpmn-db';
export { BpmnDb } from './bpmn-db';
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
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('%%'));

  const contextStack: ContextEntry[] = [];
  let flowCounter = 0;

  const currentPool = (): ContextEntry | undefined =>
    [...contextStack].reverse().find(c => c.type === 'pool');

  const currentLane = (): ContextEntry | undefined =>
    [...contextStack].reverse().find(c => c.type === 'lane');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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
        throw new Error(`Line ${i + 1}: unexpected } — no open block`);
      }
      contextStack.pop();
      continue;
    }

    const poolMatch = line.match(POOL_PATTERN);
    if (poolMatch) {
      if (currentPool()) {
        throw new Error(`Line ${i + 1}: pools cannot be nested`);
      }
      const poolId = poolMatch[1];
      const poolLabel = poolMatch[2];
      db.addPool({ id: poolId, label: poolLabel, laneIds: [] });
      contextStack.push({ type: 'pool', id: poolId });
      continue;
    }

    const laneMatch = line.match(LANE_PATTERN);
    if (laneMatch) {
      const pool = currentPool();
      if (!pool) throw new Error(`Line ${i + 1}: lane must be inside a pool block`);
      if (currentLane()) throw new Error(`Line ${i + 1}: nested lanes are not supported`);
      const laneId = laneMatch[1];
      const laneLabel = laneMatch[2];
      db.addLane({ id: laneId, label: laneLabel, poolId: pool.id });
      const poolObj = db.getPools().find(p => p.id === pool.id);
      if (poolObj) poolObj.laneIds.push(laneId);
      contextStack.push({ type: 'lane', id: laneId });
      continue;
    }

    const nodeMatch = line.match(NODE_PATTERN);
    if (nodeMatch) {
      const typeStr = nodeMatch[1];
      const nodeId = nodeMatch[2];
      const label = nodeMatch[3];
      const pool = currentPool();
      const lane = currentLane();

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
      });
      continue;
    }

    const condMatch = line.match(COND_FLOW_PATTERN);
    if (condMatch) {
      db.addFlow({ id: `f${++flowCounter}`, source: condMatch[1], target: condMatch[2], kind: 'conditional', label: condMatch[3] });
      continue;
    }

    const seqMatch = line.match(SEQ_FLOW_PATTERN);
    if (seqMatch) {
      db.addFlow({ id: `f${++flowCounter}`, source: seqMatch[1], target: seqMatch[2], kind: 'sequence' });
      continue;
    }

    const defMatch = line.match(DEF_FLOW_PATTERN);
    if (defMatch) {
      db.addFlow({ id: `f${++flowCounter}`, source: defMatch[1], target: defMatch[2], kind: 'default' });
      continue;
    }

    const msgMatch = line.match(MSG_FLOW_PATTERN);
    if (msgMatch) {
      if (contextStack.length > 0) {
        throw new Error(`Line ${i + 1}: message flows (~~>) must be declared at the top level, not inside a pool or lane block`);
      }
      db.addFlow({ id: `f${++flowCounter}`, source: msgMatch[1], target: msgMatch[2], kind: 'message' });
      continue;
    }
  }

  return db;
}
