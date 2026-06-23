# Mermaid Chart MCP Publish Workflow

TOC for Phase 1 authoring (this is part of the differentiator — no community skill has this).

## Availability check
- [ ] How to check whether the Mermaid Chart MCP connector is active in the current session before attempting to use it
- [ ] Graceful fallback message if not connected: "publish locally instead, or connect Mermaid Chart for a shareable link"

## Publish sequence
- [ ] Validated `.mmd` content -> MCP save call -> returned share link
- [ ] Error handling — what if the MCP save fails after local validation already passed?

## Registry capture
- [ ] Write the returned share link into the diagram's `DIAGRAMS.md` row (per core's naming-conventions.md "Mermaid Chart link" column)
- [ ] Update `Status` from "validated" to "published" on successful MCP save

## Consent for shared/team diagrams
- [ ] If the Mermaid Chart account is a team/shared account, note this to the user before publishing — same principle as the persistent-storage "shared: true" warning pattern
