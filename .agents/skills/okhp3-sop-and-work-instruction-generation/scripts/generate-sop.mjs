#!/usr/bin/env node
/**
 * generate-sop.mjs
 * Generates sop.md from a validated PNS YAML.
 * Produces ISO 9001 §7.5-compliant Standard Operating Procedure Markdown.
 *
 * Usage: node generate-sop.mjs <pns.yaml>
 * Named exports: generateSop(pns) → { valid, errors, warnings, sop }
 */

function heading(level, text) {
  return `${'#'.repeat(level)} ${text}`;
}

function table(headers, rows) {
  const header = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
  return [header, sep, body].join('\n');
}

/**
 * @param {object} pns - Parsed pns.yaml object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], sop: string }}
 */
export function generateSop(pns) {
  const errors = [];
  const warnings = [];

  if (!pns || typeof pns !== 'object') {
    errors.push('pns must be a non-null object');
    return { valid: false, errors, warnings, sop: '' };
  }

  const processId = pns.process_id || '';
  const processName = pns.process_name || 'Unnamed Process';
  const processOwner = pns.process_owner || '';
  const department = pns.department || '';
  const status = pns.status || 'draft';

  if (!processId) warnings.push('pns.process_id is empty');
  if (status !== 'approved') warnings.push(`pns.status is "${status}" — SOP should be generated from an approved PNS`);

  const lines = [];

  // Header
  lines.push(heading(1, `Standard Operating Procedure — ${processName}`));
  lines.push('');
  lines.push(table(
    ['Field', 'Value'],
    [
      ['Document ID', `SOP-${processId}-v1.0`],
      ['Version', '1.0'],
      ['Status', status],
      ['Process Owner', processOwner],
      ['Department', department],
      ['Process ID', processId],
    ]
  ));
  lines.push('');

  // Purpose
  lines.push(heading(2, '1. Purpose'));
  const need = pns.babok_core_concepts?.need || '';
  const trigger = pns.process_box?.trigger || '';
  if (need) {
    lines.push(need);
  } else if (trigger) {
    lines.push(`This procedure governs the ${processName} process, triggered when: ${trigger}`);
  } else {
    lines.push(`This procedure governs the ${processName} process.`);
    warnings.push('No babok_core_concepts.need or process_box.trigger — purpose section is minimal');
  }
  lines.push('');

  // Scope
  lines.push(heading(2, '2. Scope'));
  const inputs = Array.isArray(pns.process_box?.inputs) ? pns.process_box.inputs : [];
  const outputs = Array.isArray(pns.process_box?.outputs) ? pns.process_box.outputs : [];
  if (inputs.length > 0) {
    lines.push(`**In scope — this procedure begins when:** ${inputs.map(i => i.name).join(', ')} are received.`);
  }
  if (outputs.length > 0) {
    lines.push(`**This procedure ends when:** ${outputs.map(o => o.name).join(', ')} are delivered.`);
  }
  lines.push('');

  // Responsibilities
  lines.push(heading(2, '3. Responsibilities (RACI Summary)'));
  const roles = (pns.roles_and_raci?.roles || []).map(r => r.role_name || r.role_id);
  const matrix = pns.roles_and_raci?.raci_matrix || [];
  const activities = pns.activity_sequence?.activities || [];

  if (roles.length > 0 && matrix.length > 0) {
    const headers = ['Activity', ...roles];
    const rows = matrix.map(entry => {
      const act = activities.find(a => a.id === entry.activity_id);
      const desc = act?.description || entry.activity_id;
      return [
        desc,
        ...roles.map(role => {
          const roleId = (pns.roles_and_raci?.roles || []).find(r => r.role_name === role)?.role_id || role;
          const r = (entry.responsible || []).includes(roleId) ? '**R**' : '';
          const a = entry.accountable === roleId ? '**A**' : '';
          const c = (entry.consulted || []).includes(roleId) ? 'C' : '';
          const i_ = (entry.informed || []).includes(roleId) ? 'I' : '';
          return [r, a, c, i_].filter(Boolean).join('/') || '—';
        }),
      ];
    });
    lines.push(table(headers, rows));
  } else {
    lines.push('_RACI matrix not available — complete roles_and_raci in the PNS._');
    warnings.push('roles_and_raci is empty — RACI table not generated');
  }
  lines.push('');

  // Procedure steps
  lines.push(heading(2, '4. Procedure'));
  if (activities.length === 0) {
    lines.push('_No activities defined in activity_sequence — procedure steps not generated._');
    warnings.push('activity_sequence.activities is empty');
  } else {
    for (let i = 0; i < activities.length; i++) {
      const act = activities[i];
      lines.push(heading(3, `Step ${i + 1}: ${act.description || act.id}`));
      lines.push(`**Actor:** ${act.actor_role_id || 'Unspecified'}`);
      if (Array.isArray(act.inputs) && act.inputs.length > 0) lines.push(`**Input:** ${act.inputs.join(', ')}`);
      if (Array.isArray(act.outputs) && act.outputs.length > 0) lines.push(`**Output:** ${act.outputs.join(', ')}`);
      if (Array.isArray(act.systems) && act.systems.length > 0) lines.push(`**System:** ${act.systems.join(', ')}`);
      lines.push('');
    }
  }

  // Exception handling
  lines.push(heading(2, '5. Exception Handling'));
  const exceptions = Array.isArray(pns.exception_paths) ? pns.exception_paths : [];
  if (exceptions.length > 0) {
    lines.push(table(
      ['Exception ID', 'Trigger', 'Handling', 'Owner'],
      exceptions.map(e => [e.id || '', e.trigger || '', e.handling || '', e.owner_role_id || ''])
    ));
  } else {
    lines.push('_No exception paths defined in PNS._');
    warnings.push('exception_paths is empty — exception table not generated');
  }
  lines.push('');

  // Business rules
  lines.push(heading(2, '6. Business Rules'));
  const rules = Array.isArray(pns.business_rules) ? pns.business_rules : [];
  if (rules.length > 0) {
    for (const r of rules) {
      lines.push(`- **${r.id || ''}**: ${r.description || ''} _(source: ${r.source || 'unknown'})_`);
    }
  } else {
    lines.push('_No business rules defined in PNS._');
    warnings.push('business_rules is empty — rules section minimal');
  }
  lines.push('');

  // Revision history
  lines.push(heading(2, '7. Revision History'));
  const history = Array.isArray(pns.revision_history) ? pns.revision_history : [];
  if (history.length > 0) {
    lines.push(table(
      ['Version', 'Date', 'Author', 'Summary'],
      history.map(h => [h.version || '', h.date || '', h.author_role || '', h.summary || ''])
    ));
  } else {
    lines.push('_No revision history recorded._');
    warnings.push('revision_history is empty');
  }
  lines.push('');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sop: lines.join('\n'),
  };
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const { readFileSync } = await import('node:fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node generate-sop.mjs <pns.yaml>');
    process.exit(1);
  }
  const raw = readFileSync(filePath, 'utf8');
  const pns = {
    process_id: raw.match(/process_id:\s*(\S+)/)?.[1] || '',
    process_name: raw.match(/process_name:\s*(.+)/)?.[1]?.trim().replace(/^"|"$/g, '') || '',
    status: raw.match(/^status:\s*(\S+)/m)?.[1] || 'draft',
  };
  const result = generateSop(pns);
  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
  for (const w of result.warnings) console.warn('WARN:', w);
  console.log(result.sop);
}
