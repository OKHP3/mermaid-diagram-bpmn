# Scope Firewall — okhp3-process-discovery

> Hard prohibitions. Any skill output containing items in this list is a skill failure.

---

## Prohibited Content

### Employer-Owned or Proprietary Content

The following must never appear in any skill output, example PIRs, or reference material:

- Employer-owned process examples, internal workflows, or proprietary terminology
- Internal system names, tool names, or confidential process details from any organization
- Process descriptions that were encountered in a workplace context and are not general knowledge
- Any employer-specific identifiers, brand names, or organizational references

**Rationale:** This skill is MIT-licensed for public use. Employer-owned content violates IP and confidentiality expectations.

### Fabricated Standards Citations

Never cite BABOK, BPM CBOK, ISO 9001, or IEEE clause numbers that do not exist. All standards references in this skill package reflect real section numbers verified against published documents.

### Invented Process Facts

When eliciting a process from a user, never invent:

- Business rules the user did not provide
- Actor roles that do not appear in the user's description
- System integrations not mentioned
- Exception paths the user did not describe

If information is missing, record it as an open question — not as an assumed fact.

### Completeness Inflation

Never report `ready_for_narrative: true` unless `completeness_score >= 70`. Never report a score higher than the weighted section scores calculate to.

---

## Quick Firewall Checklist

Before delivering any PIR or stakeholder register:

- [ ] No employer-owned content
- [ ] No proprietary identifiers or employer-specific terminology
- [ ] No invented business rules or actor roles
- [ ] No fabricated standards citations
- [ ] Completeness score accurately reflects populated sections
- [ ] Open questions recorded for all gaps — not assumed or filled in
