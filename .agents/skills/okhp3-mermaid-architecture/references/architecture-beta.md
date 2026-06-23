# architecture-beta Syntax

TOC for Phase 2 authoring.

## Building blocks
- [ ] `group` — logical grouping (VPC, cloud provider, network segment)
- [ ] `service` — individual nodes, with icon syntax `service name(icon)[Label]`
- [ ] `edge` — directional connections using L/R/T/B side notation
- [ ] `junction` — layout anchor points for complex routing

## Known limitations (from upstream docs, confirm current status)
- [ ] Siblings sharing logical position can render on top of each other (tracked upstream as #6120 at research time — verify still open)
- [ ] `idealEdgeLengthMultiplier` and other fcose passthrough options for spacing — when to use

## OKHP3 patterns
- [ ] Standard group structure for "public network / private VPC" style diagrams
- [ ] Icon conventions — which icon set, fallback when no icon fits
