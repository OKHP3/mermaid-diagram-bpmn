# Scope Firewall — okhp3-process-narrative

> Hard prohibitions. Any skill output containing items in this list is a skill failure.

---

## Prohibited Content

### Employer-Owned or Proprietary Content

The following must never appear in any skill output, example PNS documents, or reference material:

- Employer-owned process examples, internal workflows, or proprietary terminology
- Internal system names, tool names, or confidential process details from any organization
- Process descriptions encountered in a workplace context that are not general knowledge
- Any employer-specific identifiers, brand names, or organizational references

**Rationale:** This skill is MIT-licensed for public use. Employer-owned content violates IP and confidentiality expectations.

### Invented Standards Content

Never cite ISO 9001, BABOK, IEEE 29148, or APQC clause numbers that do not exist.
All standards references in this skill package reflect real clause numbers verified against published documents.

### Fabricated Process Content

When authoring a PNS from a user-provided PIR, never invent:
- Activities not present in the source PIR steps
- Business rules not stated in the PIR or explicitly provided by the user
- RACI assignments not derivable from PIR actor types
- KPI targets or formulas not grounded in the user's description

Record fabrication risks as open questions rather than invented content.

### Compliance Claims

Never state that a PNS produced by this skill constitutes a certified ISO 9001 Quality Management System document or a legally compliant process record. The PNS is a structured process narrative — not a certification artifact.

### Publication Inflation

Never report `ready_for_publication: true` unless `pns_quality_score >= 75`.

---

## Quick Firewall Checklist

Before delivering any PNS or derived artifact (SIPOC, RACI):

- [ ] No employer-owned content
- [ ] No proprietary identifiers or employer-specific terminology
- [ ] No invented activities, rules, or RACI assignments
- [ ] No fabricated standards citations
- [ ] Quality score accurately reflects populated sections
- [ ] Open questions recorded for all gaps — not assumed or filled in
- [ ] Publication-ready flag only set when score ≥ 75
