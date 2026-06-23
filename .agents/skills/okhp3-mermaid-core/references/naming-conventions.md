# Naming Conventions & Diagram Registry

## File naming pattern

```
[domain]-[process]-[view]-[audience]-v[version].mmd
```

Examples:
- `procurement-po-approval-overview-exec-v1.mmd`
- `procurement-po-approval-detail-analyst-v2.mmd`
- `shoal-network-topology-context-tech-v1.mmd`

- **domain**: the subject area (procurement, onboarding, shoal, etc.)
- **process**: the specific process or system being diagrammed
- **view**: what slice this is (overview, detail, context, sequence, etc.)
- **audience**: exec / analyst / tech — must match the declared audience from core Step 1
- **version**: increments when the underlying process changes, not when the diagram is re-rendered

## Diagram registry — `DIAGRAMS.md`

Every diagram produced gets one row. The registry lives at the root of whatever project/repo the diagrams belong to (not in this skills repo — this repo defines the *pattern*, each consuming project maintains its own registry).

| Field | Description |
|---|---|
| ID | Sequential or domain-prefixed identifier |
| Filename | Per the naming pattern above |
| Audience | exec / analyst / tech |
| Family | Which OKHP3 mermaid domain skill produced it (core/bpmn/architecture/data) |
| Related diagrams | IDs of diagrams in the same family/process (cross-references) |
| Status | draft / validated / published |
| Mermaid Chart link | If published via `okhp3-mermaid-publish` MCP route, the share link |
| Last updated | Date |

```markdown
| ID | Filename | Audience | Family | Related | Status | MC Link | Updated |
|---|---|---|---|---|---|---|---|
| PROC-001 | procurement-po-approval-overview-exec-v1.mmd | exec | bpmn | PROC-002 | published | [link] | 2026-06-11 |
| PROC-002 | procurement-po-approval-detail-analyst-v2.mmd | analyst | bpmn | PROC-001 | validated | — | 2026-06-11 |
```

## Skill identifier naming (this repo)

Pattern: `okhp3-mermaid-<domain>`. Matches the directory name and the frontmatter `name:` field exactly — required for portability (`gh skill install OKHP3/skillz okhp3-mermaid-bpmn`).
