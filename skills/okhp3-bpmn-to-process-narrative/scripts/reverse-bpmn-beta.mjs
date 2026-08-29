/**
 * reverse-bpmn-beta.mjs
 * Parses a bpmn-beta diagram (.mmd) and reconstructs a pns.yaml-shaped object.
 * No external dependencies — runs with: node scripts/reverse-bpmn-beta.mjs <file.mmd>
 *
 * Grammar note: this parser targets the same bpmn-beta grammar that
 * ../../okhp3-visual-process-modeling/scripts/validate-bpmn-beta.mjs enforces
 * (and that every real .mmd fixture in this repository actually uses) —
 * keyword + ID + quoted-label declarations inside pool/lane blocks, not the
 * shorthand bracket notation shown in references/bpmn-beta-syntax.md. See
 * references/reversal-mapping.md for why the two diverge and which one this
 * script follows.
 */

// ─── Regex Patterns (mirrors validate-bpmn-beta.mjs so both scripts parse the
//     same grammar consistently) ─────────────────────────────────────────────

const INIT_BLOCK_RE = /%%\{[\s\S]*?\}%%/g;
const COMMENT_RE = /^%%/;
const TRACE_COMMENT_RE = /^#\s*pns:(\S+)\s*$/;
const ACC_TITLE_RE = /^accTitle:\s*(.+)$/;
const ACC_DESCR_RE = /^accDescr:\s*(.+)$/;
const TITLE_DIRECTIVE_RE = /^title\s+(.+)$/;
const POOL_RE = /^pool\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"\s*\{?$/;
const LANE_RE = /^lane\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"\s*\{?$/;
const NODE_RE = /^(start|end|event:(?:message|timer|error)|task(?::[a-zA-Z]+)?|xor|or|and)\s+([a-zA-Z][a-zA-Z0-9_]*)\s+"([^"]*)"$/;
const COND_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+-->\s+([a-zA-Z][a-zA-Z0-9_]*):\s+"([^"]*)"$/;
const SEQ_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+-->\s+([a-zA-Z][a-zA-Z0-9_]*)$/;
const DEF_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+==>\s+([a-zA-Z][a-zA-Z0-9_]*)$/;
const MSG_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_]*)\s+~~>\s+([a-zA-Z][a-zA-Z0-9_]*)(?::\s*"([^"]*)")?$/;

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Parse bpmn-beta source into a structural model. Kept intentionally close to
 * validate-bpmn-beta.mjs's parseBpmnBeta so the two never silently drift into
 * incompatible readings of the same file. Adds capture of `# pns:<id>` trace
 * comments (the convention okhp3-visual-process-modeling writes when it
 * generates a diagram from a PNS) so a round-tripped diagram can recover its
 * original PNS activity/gateway/event IDs instead of being assigned fresh ones.
 *
 * @param {string} source
 */
export function parseBpmnBeta(source) {
  const elements = [];
  const flows = [];
  const pools = []; // [{id, name}]
  const lanes = []; // [{id, name, poolId}]
  const parseErrors = [];
  let title = null;
  let accTitle = null;
  let accDescr = null;

  const stripped = source.replace(INIT_BLOCK_RE, '').trim();
  const rawLines = stripped.split('\n');

  const contextStack = [];
  const currentPool = () => [...contextStack].reverse().find((c) => c.type === 'pool');
  const currentLane = () => [...contextStack].reverse().find((c) => c.type === 'lane');

  let lineNum = 0;
  let hasBpmnBeta = false;
  let pendingTrace = null;

  for (const rawLine of rawLines) {
    lineNum++;
    const line = rawLine.trim();

    if (!line) continue;

    const traceMatch = line.match(TRACE_COMMENT_RE);
    if (traceMatch) {
      pendingTrace = traceMatch[1];
      continue;
    }
    if (COMMENT_RE.test(line)) continue;

    if (line === 'bpmn-beta') { hasBpmnBeta = true; continue; }
    if (line === '{') continue;

    const titleMatch = line.match(TITLE_DIRECTIVE_RE);
    if (titleMatch && contextStack.length === 0) { title = titleMatch[1].trim(); continue; }

    const accTitleMatch = line.match(ACC_TITLE_RE);
    if (accTitleMatch) { accTitle = accTitleMatch[1].trim(); continue; }
    const accDescrMatch = line.match(ACC_DESCR_RE);
    if (accDescrMatch) { accDescr = accDescrMatch[1].trim(); continue; }

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
        pools.push({ id: poolMatch[1], name: poolMatch[2] });
        contextStack.push({ type: 'pool', id: poolMatch[1] });
      }
      pendingTrace = null;
      continue;
    }

    const laneMatch = line.match(LANE_RE);
    if (laneMatch) {
      if (!currentPool()) {
        parseErrors.push(`Line ${lineNum}: lane must be inside a pool block`);
      } else if (currentLane()) {
        parseErrors.push(`Line ${lineNum}: nested lanes are not supported`);
      } else {
        lanes.push({ id: laneMatch[1], name: laneMatch[2], poolId: currentPool().id });
        contextStack.push({ type: 'lane', id: laneMatch[1] });
      }
      pendingTrace = null;
      continue;
    }

    const nodeMatch = line.match(NODE_RE);
    if (nodeMatch) {
      const [, keyword, id, label] = nodeMatch;
      const pool = currentPool();
      const lane = currentLane();
      elements.push({
        id,
        keyword,
        label,
        order: elements.length,
        kind: keyword.startsWith('task') ? 'task'
          : keyword === 'xor' || keyword === 'and' || keyword === 'or' ? 'gateway'
            : 'event',
        gatewayType: keyword === 'xor' ? 'exclusive' : keyword === 'or' ? 'inclusive' : keyword === 'and' ? 'parallel' : null,
        taskType: keyword.includes(':') ? keyword.split(':')[1] : null,
        poolId: pool?.id ?? null,
        laneId: lane?.id ?? null,
        traceId: pendingTrace,
      });
      pendingTrace = null;
      continue;
    }

    const condMatch = line.match(COND_FLOW_RE);
    if (condMatch) {
      flows.push({ source: condMatch[1], target: condMatch[2], kind: 'conditional', label: condMatch[3] });
      continue;
    }
    const seqMatch = line.match(SEQ_FLOW_RE);
    if (seqMatch) {
      flows.push({ source: seqMatch[1], target: seqMatch[2], kind: 'sequence', label: null });
      continue;
    }
    const defMatch = line.match(DEF_FLOW_RE);
    if (defMatch) {
      flows.push({ source: defMatch[1], target: defMatch[2], kind: 'default', label: null });
      continue;
    }
    const msgMatch = line.match(MSG_FLOW_RE);
    if (msgMatch) {
      flows.push({ source: msgMatch[1], target: msgMatch[2], kind: 'message', label: msgMatch[3] ?? null });
      continue;
    }

    // Unrecognised line: neither structural nor an error worth failing the
    // whole parse over — record it so the caller can surface it as a warning.
    parseErrors.push(`Line ${lineNum}: unrecognised syntax — "${line}" was not mapped to any PNS field`);
  }

  for (const ctx of contextStack) {
    parseErrors.push(`Unclosed ${ctx.type} block: '${ctx.id}' — add a closing '}'`);
  }

  return { elements, flows, pools, lanes, hasBpmnBeta, title, accTitle, accDescr, parseErrors };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unnamed';
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Build a directed adjacency map from parsed flows (sequence/conditional/default only). */
function buildAdjacency(elements, flows) {
  const byId = new Map(elements.map((e) => [e.id, e]));
  const out = new Map();
  for (const f of flows) {
    if (f.kind === 'message') continue; // top-level, cross-pool — not a within-process order signal
    if (!out.has(f.source)) out.set(f.source, []);
    out.get(f.source).push(f);
  }
  return { byId, out };
}

/** Order elements by a breadth-first walk from start events; append any unreached elements in source order. */
function orderElements(elements, flows) {
  const { out } = buildAdjacency(elements, flows);
  const starts = elements.filter((e) => e.kind === 'event' && e.keyword === 'start');
  const visited = new Set();
  const ordered = [];
  const queue = [...starts.map((s) => s.id)];
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    const el = elements.find((e) => e.id === id);
    if (el) ordered.push(el);
    for (const f of out.get(id) || []) {
      if (!visited.has(f.target)) queue.push(f.target);
    }
  }
  for (const el of elements) {
    if (!visited.has(el.id)) ordered.push(el);
  }
  return ordered;
}

/** Find the nearest preceding task feeding into a gateway (its immediate upstream activity), if any. */
function nearestUpstreamTask(gatewayId, elements, flows) {
  const byId = new Map(elements.map((e) => [e.id, e]));
  const incoming = flows.filter((f) => f.target === gatewayId && f.kind !== 'message');
  for (const f of incoming) {
    const src = byId.get(f.source);
    if (src && src.kind === 'task') return src.id;
  }
  return null;
}

// ─── Reversal ────────────────────────────────────────────────────────────────

/**
 * Reconstruct a pns.yaml-shaped object from bpmn-beta source.
 *
 * Populates every section the diagram can support. Every section (or field
 * within a section) it cannot support is present but explicit: either an
 * empty array with an `_unrecoverable_from_diagram` note, or a value paired
 * with an inline `_note` — never a fabricated fact. See
 * references/reversal-mapping.md for the full field-by-field mapping table.
 *
 * @param {string} source - raw bpmn-beta .mmd file contents
 * @param {object} [opts]
 * @param {string} [opts.sourceFile] - path to the source file, recorded for traceability
 * @param {string} [opts.processId] - override the derived process_id
 * @param {string} [opts.date] - override today's ISO date (for reproducible tests/fixtures)
 * @returns {{ pns: object, warnings: string[], parseErrors: string[] }}
 */
export function reverseBpmnBeta(source, opts = {}) {
  const parsed = parseBpmnBeta(source);
  const { elements, flows, pools, lanes, hasBpmnBeta, title, accTitle, accDescr, parseErrors } = parsed;
  const warnings = [];
  const date = opts.date || todayIso();

  if (!hasBpmnBeta) {
    warnings.push("Source does not start with 'bpmn-beta' — reconstruction proceeded but the file may not be a valid bpmn-beta diagram.");
  }

  const orderedElements = orderElements(elements, flows);
  const tasks = orderedElements.filter((e) => e.kind === 'task');
  const gateways = orderedElements.filter((e) => e.kind === 'gateway');
  const startEvents = orderedElements.filter((e) => e.kind === 'event' && e.keyword === 'start');
  const endEvents = orderedElements.filter((e) => e.kind === 'event' && e.keyword === 'end');
  const errorEvents = orderedElements.filter((e) => e.kind === 'event' && e.keyword === 'event:error');

  if (startEvents.length === 0) warnings.push('No start event found in source — process_box.trigger is unrecoverable.');
  if (endEvents.length === 0) warnings.push('No end event found in source — process_box.outputs is empty.');
  if (tasks.length === 0) warnings.push('No task nodes found in source — activity_sequence is empty.');

  // ── roles_and_raci (lane-derivable ownership only) ──────────────────────
  const roleForElement = (el) => {
    if (el.laneId) return `role-${slugify(lanes.find((l) => l.id === el.laneId)?.name || el.laneId)}`;
    if (el.poolId) return `role-${slugify(pools.find((p) => p.id === el.poolId)?.name || el.poolId)}`;
    return 'role-unassigned-lane';
  };

  const rolesById = new Map();
  for (const lane of lanes) {
    const role_id = `role-${slugify(lane.name)}`;
    if (!rolesById.has(role_id)) rolesById.set(role_id, { role_id, role_name: lane.name });
  }
  if (lanes.length === 0 && tasks.length > 0) {
    rolesById.set('role-unassigned-lane', {
      role_id: 'role-unassigned-lane',
      role_name: 'Unassigned (flat diagram — no pool/lane structure to derive a role from)',
    });
    warnings.push('Diagram has no pool/lane structure — all activities assigned to a single placeholder role.');
  }

  const raci_matrix = tasks.map((t) => {
    const role_id = roleForElement(t);
    return {
      activity_id: t.traceId || t.id,
      responsible: [role_id],
      // accountable is a schema-required single value (V3). The diagram only
      // encodes *who performs* a task via lane assignment, not who is
      // accountable for the outcome — those are frequently the same person in
      // a flat org, but this is an inferred placeholder, not a confirmed
      // governance decision. Confirm with the process owner before treating
      // this as a real RACI.
      accountable: role_id,
      accountable_confidence: 'inferred_from_lane_placeholder',
      consulted: [],
      informed: [],
      unrecoverable_from_diagram: ['consulted', 'informed', 'accountable (confirmed)'],
    };
  });

  // ── process_box ──────────────────────────────────────────────────────────
  const trigger = startEvents[0]?.label ?? null;
  if (startEvents.length > 1) {
    warnings.push(`Diagram has ${startEvents.length} start events — only the first ("${trigger}") was used as process_box.trigger; the rest are recorded in open_questions.`);
  }
  const outputs = endEvents.map((e) => ({
    name: e.label,
    consumer: null,
    unrecoverable_from_diagram: ['consumer'],
  }));

  // ── activity_sequence ─────────────────────────────────────────────────────
  const activities = tasks.map((t) => ({
    id: t.traceId || t.id,
    description: t.label,
    actor_role_id: roleForElement(t),
    inputs: [],
    outputs: [],
    systems: t.taskType ? [`(diagram hint only, not a resolved system: task type "${t.taskType}")`] : [],
    preconditions: null,
    postconditions: null,
    unrecoverable_from_diagram: ['inputs', 'outputs', 'preconditions', 'postconditions'],
    source_element_id: t.id,
  }));

  // ── decision_points (exclusive/inclusive gateways only — see references/reversal-mapping.md
  //    for why parallel "and" gateways are not treated as PNS decision points) ─
  const decision_points = gateways
    .filter((g) => g.gatewayType === 'exclusive' || g.gatewayType === 'inclusive')
    .map((g) => {
      const outgoing = flows.filter((f) => f.source === g.id && f.kind !== 'message');
      const outcomes = outgoing.map((f) => ({
        label: f.label || '(unlabeled branch)',
        next_activity: f.target,
      }));
      const activity_id = nearestUpstreamTask(g.id, elements, flows);
      return {
        id: g.traceId || g.id,
        description: g.label,
        activity_id,
        criteria: null,
        outcomes: outcomes.length ? outcomes : [{ label: '(no outgoing flows found)', next_activity: null }],
        gateway_type: g.gatewayType,
        unrecoverable_from_diagram: ['criteria'],
      };
    });

  const parallelGateways = gateways.filter((g) => g.gatewayType === 'parallel');
  if (parallelGateways.length) {
    warnings.push(`${parallelGateways.length} parallel ("and") gateway(s) found — these represent concurrent splits/joins, not business decisions, so they are not emitted as decision_points. See references/reversal-mapping.md.`);
  }

  // ── exception_paths (from event:error nodes) ─────────────────────────────
  const exception_paths = errorEvents.map((e) => ({
    id: e.traceId || e.id,
    description: e.label,
    trigger: null,
    handling: null,
    owner_role_id: roleForElement(e),
    escalation_path: null,
    unrecoverable_from_diagram: ['trigger', 'handling', 'escalation_path'],
  }));

  // ── open_questions: an explicit ledger of what this reconstruction cannot answer ─
  const open_questions = [
    {
      id: 'oq-diagram-001',
      question: 'What is the business rationale, policy source, and approval authority behind each business rule implied by this process? None is encoded in bpmn-beta source.',
      owner_role_id: null,
      target_resolution_date: null,
    },
    {
      id: 'oq-diagram-002',
      question: 'What are the true RACI accountable/consulted/informed assignments for each activity? The diagram only encodes lane-based task ownership (used here as a placeholder "responsible"/"accountable"), not full governance RACI.',
      owner_role_id: null,
      target_resolution_date: null,
    },
    {
      id: 'oq-diagram-003',
      question: 'What KPIs, formulas, data sources, and targets apply to this process? None is encoded in bpmn-beta source.',
      owner_role_id: null,
      target_resolution_date: null,
    },
    {
      id: 'oq-diagram-004',
      question: 'What controls, compliance standards, and systems/integrations govern this process? None is encoded in bpmn-beta source beyond an optional, unresolved task-type hint (e.g. "task:service").',
      owner_role_id: null,
      target_resolution_date: null,
    },
    {
      id: 'oq-diagram-005',
      question: `What is the business criteria behind each decision point's branches? The diagram only encodes the outcome labels (${decision_points.map((d) => `"${d.description}"`).join(', ') || 'none present'}), not the underlying rule.`,
      owner_role_id: null,
      target_resolution_date: null,
    },
  ];
  if (startEvents.length > 1) {
    open_questions.push({
      id: 'oq-diagram-006',
      question: `Diagram declares ${startEvents.length} start events. Only "${trigger}" was used as process_box.trigger. Are the others alternate triggers, or a modeling error?`,
      owner_role_id: null,
      target_resolution_date: null,
    });
  }

  // ── babok_core_concepts: not encoded in a diagram at all ─────────────────
  const babok_core_concepts = {
    change: null,
    need: null,
    solution: null,
    stakeholders: null,
    value: null,
    context: null,
    unrecoverable_from_diagram: ['change', 'need', 'solution', 'stakeholders', 'value', 'context'],
  };

  // ── revision_history ──────────────────────────────────────────────────────
  const revision_history = [
    {
      version: '0.1',
      date,
      author_role: 'okhp3-bpmn-to-process-narrative (automated)',
      summary: `Reconstructed from bpmn-beta source${opts.sourceFile ? ` (${opts.sourceFile})` : ''} by parsing the diagram's own DSL text. Not human-authored; not elicited. Treat as a first-draft skeleton requiring SME review before narrative-authored status.`,
    },
  ];

  const processId = opts.processId
    || (title && `proc-${slugify(title)}`)
    || (accTitle && `proc-${slugify(accTitle)}`)
    || (pools[0] && `proc-${slugify(pools[0].name)}`)
    || 'proc-unknown-diagram-derived';

  const pns = {
    pns_version: '0.1',
    process_id: processId,
    process_name: title || accTitle || pools[0]?.name || null,
    process_owner: null,
    department: null,
    status: 'draft',
    created_date: date,
    last_modified_date: date,
    pir_ref: null,
    apqc_pcf_mapping: null,
    // Provenance tag — see references/reversal-mapping.md and the SKILL.md
    // "Provenance tagging, not schema-breaking" section. This is an OPTIONAL
    // frontmatter-style field, not a new required section or lifecycle value;
    // its implicit default for any PNS produced the normal way (intake +
    // narrative-authoring) is "elicitation-derived".
    narrative_provenance: 'diagram-derived',
    source_diagram: {
      file: opts.sourceFile || null,
      parsed_date: date,
      element_count: elements.length,
      flow_count: flows.length,
      pool_count: pools.length,
      lane_count: lanes.length,
      parse_errors: parseErrors,
    },

    process_box: {
      trigger,
      inputs: [],
      outputs,
      criteria: null,
      resources: null,
      responsibilities: null,
      risks: null,
      unrecoverable_from_diagram: ['inputs', 'criteria', 'resources', 'responsibilities', 'risks'],
    },

    activity_sequence: { activities },

    roles_and_raci: {
      roles: [...rolesById.values()],
      raci_matrix,
    },

    business_rules: [],
    business_rules_unrecoverable_from_diagram: true,

    decision_points,

    exception_paths,

    kpis: [],
    kpis_unrecoverable_from_diagram: true,

    systems_and_integrations: [],
    systems_and_integrations_unrecoverable_from_diagram: true,

    controls_and_compliance: [],
    controls_and_compliance_unrecoverable_from_diagram: true,

    open_questions,

    babok_core_concepts,

    revision_history,

    validation: {
      pns_quality_score: null,
      ready_for_publication: false,
      ready_for_bpmn_modeling: false,
      // A diagram-derived PNS has no pir.yaml, so the V8 gate in
      // okhp3-process-validation-scoring (error severity: PIR
      // completeness_score >= 70; ready_for_narrative = true) will fail by
      // construction, not by defect. See SKILL.md "Known limitations".
      note: 'diagram-derived: not eligible for the standard okhp3-process-validation-scoring V8 gate (no pir.yaml exists). Route to okhp3-bpmn-recoverability-audit for a diagram-appropriate completeness assessment instead.',
    },
  };

  return { pns, warnings, parseErrors };
}

// ─── YAML / Markdown serialisation (hand-rolled — no external dependencies) ──

function yamlScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  const s = String(v);
  if (s === '') return '""';
  if (/^[\w.\-]+$/.test(s) && !/^(true|false|null|~)$/i.test(s)) return s;
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function toYamlNode(value, indent) {
  const pad = '  '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return ' []\n';
    let out = '\n';
    for (const item of value) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const entries = Object.entries(item);
        entries.forEach(([k, v], i) => {
          const prefix = i === 0 ? `${pad}- ` : `${pad}  `;
          out += `${prefix}${k}:${toYamlNode(v, indent + 2).replace(/^\n/, v && typeof v === 'object' ? '\n' : ' ')}`;
          if (typeof v !== 'object' || v === null) out = out.replace(/\n$/, '') + '\n';
        });
      } else {
        out += `${pad}- ${yamlScalar(item)}\n`;
      }
    }
    return out;
  }
  if (value && typeof value === 'object') {
    let out = '\n';
    for (const [k, v] of Object.entries(value)) {
      if (v && typeof v === 'object') {
        out += `${pad}${k}:${toYamlNode(v, indent + 1)}`;
      } else {
        out += `${pad}${k}: ${yamlScalar(v)}\n`;
      }
    }
    return out;
  }
  return ` ${yamlScalar(value)}\n`;
}

/**
 * Serialise a pns.yaml-shaped object (as returned by reverseBpmnBeta) to a
 * YAML string. Deliberately minimal — no external YAML library dependency,
 * matching the "no external dependencies" pattern used across this repo's
 * other scripts/*.mjs. Sufficient for this fixed, known object shape; not a
 * general-purpose YAML dumper.
 * @param {object} pns
 */
export function toYaml(pns) {
  let out = '';
  for (const [k, v] of Object.entries(pns)) {
    if (v && typeof v === 'object') {
      out += `${k}:${toYamlNode(v, 1)}`;
    } else {
      out += `${k}: ${yamlScalar(v)}\n`;
    }
  }
  return out;
}

/**
 * Render a pns.yaml-shaped object as PNS.md. Section headings match the
 * pns.yaml field names (process_box, activity_sequence, ...) because those
 * are the names this repository's actual downstream skills and fixtures use
 * (see references/reversal-mapping.md) — not the prose section titles in
 * docs/pns-schema.md, which describe a differently shaped artifact.
 * @param {object} pns
 */
export function toMarkdown(pns) {
  const lines = [];
  lines.push(`# PNS: ${pns.process_name || pns.process_id}`);
  lines.push('');
  lines.push(`- **process_id**: ${pns.process_id}`);
  lines.push(`- **status**: ${pns.status}`);
  lines.push(`- **narrative_provenance**: ${pns.narrative_provenance}`);
  lines.push(`- **created_date**: ${pns.created_date}`);
  lines.push('');
  lines.push('> Diagram-derived reconstruction. Sections below marked `unrecoverable_from_diagram` were not encoded in the source `bpmn-beta` file and were left explicitly empty rather than invented. See `open_questions` for what still needs elicitation.');
  lines.push('');

  lines.push('## process_box');
  lines.push(`- trigger: ${pns.process_box.trigger ?? '_null (unrecoverable_from_diagram)_'}`);
  lines.push(`- outputs: ${pns.process_box.outputs.length ? pns.process_box.outputs.map((o) => o.name).join('; ') : '_none found_'}`);
  lines.push('');

  lines.push('## activity_sequence');
  for (const a of pns.activity_sequence.activities) {
    lines.push(`1. \`${a.id}\` — ${a.description} (actor_role_id: ${a.actor_role_id})`);
  }
  if (!pns.activity_sequence.activities.length) lines.push('_none found_');
  lines.push('');

  lines.push('## decision_points');
  for (const d of pns.decision_points) {
    lines.push(`- \`${d.id}\` — ${d.description}`);
    for (const o of d.outcomes) lines.push(`  - ${o.label} → ${o.next_activity ?? '(unresolved)'}`);
  }
  if (!pns.decision_points.length) lines.push('_none found_');
  lines.push('');

  lines.push('## roles_and_raci');
  for (const r of pns.roles_and_raci.roles) lines.push(`- ${r.role_id}: ${r.role_name}`);
  lines.push('');

  lines.push('## open_questions');
  for (const q of pns.open_questions) lines.push(`- \`${q.id}\`: ${q.question}`);
  lines.push('');

  lines.push('## Sections not recoverable from a bpmn-beta diagram');
  lines.push('business_rules, kpis, systems_and_integrations, controls_and_compliance, and babok_core_concepts are present in `pns.yaml` but empty/null, each flagged `unrecoverable_from_diagram: true`. Do not populate them from inference — elicit from a process owner via okhp3-elicitation-interviews.');
  lines.push('');

  return lines.join('\n');
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('reverse-bpmn-beta.mjs')) {
  const { readFileSync, writeFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');

  const args = process.argv.slice(2);
  const file = args[0];
  if (!file || file.startsWith('--')) {
    console.log('Usage: node scripts/reverse-bpmn-beta.mjs <file.mmd> [--out-yaml pns.yaml] [--out-md PNS.md]');
    console.log('Reconstructs a pns.yaml-shaped object from bpmn-beta DSL source and prints a summary.');
    process.exit(0);
  }
  const outYamlIdx = args.indexOf('--out-yaml');
  const outMdIdx = args.indexOf('--out-md');
  const outYaml = outYamlIdx !== -1 ? args[outYamlIdx + 1] : null;
  const outMd = outMdIdx !== -1 ? args[outMdIdx + 1] : null;

  try {
    const code = readFileSync(resolve(file), 'utf8');
    const { pns, warnings, parseErrors } = reverseBpmnBeta(code, { sourceFile: file });

    console.log(`Reversed ${file} -> process_id: ${pns.process_id}`);
    console.log(`  activities: ${pns.activity_sequence.activities.length}`);
    console.log(`  decision_points: ${pns.decision_points.length}`);
    console.log(`  roles: ${pns.roles_and_raci.roles.length}`);
    console.log(`  open_questions: ${pns.open_questions.length}`);
    if (parseErrors.length) {
      console.log(`Parse issues: ${parseErrors.length}`);
      parseErrors.forEach((e) => console.log(`  [PARSE] ${e}`));
    }
    if (warnings.length) {
      console.log(`Warnings: ${warnings.length}`);
      warnings.forEach((w) => console.log(`  [WARN] ${w}`));
    }

    if (outYaml) {
      writeFileSync(resolve(outYaml), toYaml(pns), 'utf8');
      console.log(`Wrote ${outYaml}`);
    }
    if (outMd) {
      writeFileSync(resolve(outMd), toMarkdown(pns), 'utf8');
      console.log(`Wrote ${outMd}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }
}
