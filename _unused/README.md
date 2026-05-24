# _unused — Template scaffolding

This directory documents Replit template scaffolding that is **not used** by the `bpmn-beta` prototype.

## What is here

The pnpm monorepo template provisioned several packages that the BPMN frontend does not use:

| Package | Path | Status |
|---|---|---|
| Express 5 api-server | `artifacts/api-server/` | Running as a Replit workflow but **not called by the BPMN frontend** — all rendering is client-side |
| Mockup sandbox | `artifacts/mockup-sandbox/` | Replit canvas scaffolding, not part of the BPMN prototype |
| `lib/api-spec` | Removed | OpenAPI health-only spec — deleted from workspace |
| `lib/api-client-react` | Removed | Generated React Query hooks — deleted from workspace |
| `lib/api-zod` | Removed | Generated Zod schemas — deleted from workspace |
| `lib/db` | Removed | Drizzle ORM provisioning — deleted from workspace |

## Why they are retained

- `artifacts/api-server/` and `artifacts/mockup-sandbox/` are kept as active Replit workflows. Moving or deleting them would break the Replit environment configuration. They are safe to ignore for BPMN development purposes.
- The removed `lib/` packages were deleted rather than moved here because they contained only auto-generated scaffolding with no project-specific content.

## Safe to delete?

The removed `lib/` entries are already gone. `artifacts/api-server/` and `artifacts/mockup-sandbox/` may be deleted from the Replit artifact registry in a future cleanup pass, once the prototype graduates to a standalone GitHub repository.
