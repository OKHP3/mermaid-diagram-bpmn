# Gateway Patterns

TOC for Phase 1 authoring.

## Gateway types
- [ ] Exclusive (XOR) — diamond shape, single outgoing path
- [ ] Parallel (AND) — diamond with +, all paths taken
- [ ] Inclusive (OR) — diamond with circle, conditional multi-path
- [ ] Event-based — diamond with pentagon, race-condition semantics

## Branch labeling (Analyst tier)
- [ ] Convention for condition labels on edges leaving a gateway (e.g., "approved", "amount > $10k")
- [ ] How to keep labels under audience-profile edge-label limits (Executive: unlabeled or ≤3 words)

## Convergence
- [ ] How parallel/inclusive branches re-converge — matching gateway type required at convergence?

## Crossing reduction for gateway-heavy diagrams
- [ ] Gateway fan-out is a common source of line crossings (core's general guidance applies, but gateways have specific patterns — document them here)
