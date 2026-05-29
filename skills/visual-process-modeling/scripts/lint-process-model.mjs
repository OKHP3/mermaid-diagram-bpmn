/**
 * lint-process-model.mjs
 * Process modeling quality checks for bpmn-beta diagrams.
 * No external dependencies — runs with: node scripts/lint-process-model.mjs
 */

const INIT_BLOCK_RE = /%%\{[\s\S]*?\}%%/g;
const NODE_RE = /^(start|end|event:(?:message|timer|error)|task(?::[a-zA-Z]+)?|xor|or|and)\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"\s*$/;
const FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+(-->|==>|~~>)\s+([a-zA-Z][a-zA-Z0-9_]*)(.*)$/;
const POOL_RE = /^pool\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"/;
const LANE_RE = /^lane\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"/;
const ACC_TITLE_RE = /^accTitle:\s*(.+)$/;

const GENERIC_GATEWAY_LABELS = new Set(['gateway', 'g1', 'g2', 'g3', 'g4', 'g5', 'decision', 'choice', 'branch']);
const GENERIC_TASK_LABELS = new Set(['task', 't1', 't2', 't3', 't4', 't5', 'step', 'action', 'activity', 'process']);
const GENERIC_ACC_TITLES = new Set(['business process diagram', 'bpmn diagram', 'process', 'diagram', 'untitled', '']);

const MAX_LANE_ELEMENTS = 15;

/**
 * Lint a bpmn-beta diagram for process modeling quality.
 *
 * @param {string} bpmnBetaCode
 * @returns {{ score: number, issues: Array<{ type: 'quality'|'naming'|'accessibility', message: string, suggestion: string }> }}
 */
export function lintProcessModel(bpmnBetaCode) {
  const issues = [];
  const stripped = bpmnBetaCode.replace(INIT_BLOCK_RE, '').trim();
  const lines = stripped.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));

  const elements = [];
  const flows = [];
  let accTitle = '';
  let currentLane = null;
  const laneElementCounts = new Map();

  for (const line of lines) {
    if (line === 'bpmn-beta' || line === '{' || line === '}') continue;
    if (line.startsWith('accTitle:')) {
      const m = line.match(ACC_TITLE_RE);
      accTitle = m ? m[1].trim() : '';
      continue;
    }
    if (line.startsWith('accDescr:')) continue;

    const laneM = line.match(LANE_RE);
    if (laneM) { currentLane = laneM[1]; laneElementCounts.set(currentLane, 0); continue; }
    const poolM = line.match(POOL_RE);
    if (poolM) { currentLane = null; continue; }

    const nodeM = line.match(NODE_RE);
    if (nodeM) {
      const [, keyword, id, label] = nodeM;
      elements.push({ keyword, id, label, lane: currentLane });
      if (currentLane) {
        laneElementCounts.set(currentLane, (laneElementCounts.get(currentLane) || 0) + 1);
      }
      continue;
    }

    const flowM = line.match(FLOW_RE);
    if (flowM) {
      const label = flowM[4]?.replace(/^:\s*"?|"?\s*$/g, '').trim() || '';
      flows.push({ source: flowM[1], op: flowM[2], target: flowM[3], label });
    }
  }

  // ── Quality Checks ──────────────────────────────────────────────────────────

  if (!accTitle) {
    issues.push({
      type: 'accessibility',
      message: 'No accTitle found.',
      suggestion: "Add 'accTitle: [Descriptive Process Name]' after the bpmn-beta declaration.",
    });
  } else if (GENERIC_ACC_TITLES.has(accTitle.toLowerCase())) {
    issues.push({
      type: 'accessibility',
      message: `accTitle '${accTitle}' is too generic.`,
      suggestion: 'Use a specific, descriptive title that names the actual business process.',
    });
  }

  const gateways = elements.filter(e => ['xor', 'and', 'or'].includes(e.keyword));
  for (const gw of gateways) {
    if (GENERIC_GATEWAY_LABELS.has(gw.label.toLowerCase()) || gw.label.toLowerCase() === gw.id.toLowerCase()) {
      issues.push({
        type: 'naming',
        message: `Gateway '${gw.id}' has a generic or ID-matching label: "${gw.label}".`,
        suggestion: 'Use a question or condition label that describes the decision (e.g., "Approved?" or "Credit Check Passed?").',
      });
    }
  }

  const tasks = elements.filter(e => e.keyword.startsWith('task'));
  for (const task of tasks) {
    if (GENERIC_TASK_LABELS.has(task.label.toLowerCase()) || task.label.toLowerCase() === task.id.toLowerCase()) {
      issues.push({
        type: 'naming',
        message: `Task '${task.id}' has a generic or ID-matching label: "${task.label}".`,
        suggestion: 'Use a verb-noun label that describes the specific action (e.g., "Review Purchase Request" or "Send Confirmation Email").',
      });
    }
    if (task.label.length < 4) {
      issues.push({
        type: 'naming',
        message: `Task '${task.id}' has a very short label: "${task.label}" (${task.label.length} chars).`,
        suggestion: 'Use a descriptive label of at least 5 characters.',
      });
    }
  }

  for (const [laneId, count] of laneElementCounts) {
    if (count > MAX_LANE_ELEMENTS) {
      issues.push({
        type: 'quality',
        message: `Lane '${laneId}' contains ${count} elements (threshold: ${MAX_LANE_ELEMENTS}).`,
        suggestion: 'Consider splitting this lane into sub-processes or breaking the diagram into multiple diagrams for readability.',
      });
    }
  }

  const andGateways = elements.filter(e => e.keyword === 'and');
  const andSplits = andGateways.filter(g => flows.filter(f => f.source === g.id).length >= 2);
  const andJoins = andGateways.filter(g => flows.filter(f => f.target === g.id).length >= 2);
  if (andSplits.length > andJoins.length) {
    issues.push({
      type: 'quality',
      message: `Found ${andSplits.length} AND split gateway(s) but only ${andJoins.length} AND join gateway(s).`,
      suggestion: 'Add a parallel AND join gateway to re-merge the split branches, or route each branch to a separate end event.',
    });
  }

  const hasGateway = gateways.length > 0;
  if (!hasGateway && tasks.length >= 5) {
    issues.push({
      type: 'quality',
      message: 'Process has 5+ tasks but no gateways.',
      suggestion: 'Complex processes typically have decision points (XOR) or parallel paths (AND). If this is intentional, ignore this hint.',
    });
  }

  const deductions = issues.reduce((sum, issue) => {
    if (issue.type === 'accessibility') return sum + 15;
    if (issue.type === 'naming') return sum + 8;
    if (issue.type === 'quality') return sum + 5;
    return sum + 5;
  }, 0);

  const score = Math.max(0, 100 - deductions);

  return { score, issues };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('lint-process-model.mjs')) {
  import('node:fs').then(({ readFileSync }) => {
    import('node:path').then(({ resolve }) => {
      const file = process.argv[2];
      if (!file) {
        console.log('Usage: node scripts/lint-process-model.mjs <file.mmd>');
        process.exit(0);
      }
      try {
        const code = readFileSync(resolve(file), 'utf8');
        const { score, issues } = lintProcessModel(code);
        console.log(`Process Model Quality Score: ${score}/100`);
        if (issues.length === 0) {
          console.log('No quality issues found.');
        } else {
          console.log(`Issues (${issues.length}):`);
          issues.forEach((issue, i) => {
            console.log(`  [${i + 1}] [${issue.type.toUpperCase()}] ${issue.message}`);
            console.log(`       -> ${issue.suggestion}`);
          });
        }
        process.exit(0);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
  });
}
