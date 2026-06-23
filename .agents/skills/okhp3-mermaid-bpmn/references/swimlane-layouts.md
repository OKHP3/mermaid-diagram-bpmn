# Swim Lane Layouts

TOC for Phase 1 authoring.

## Encoding
- [ ] One `subgraph` per lane (department/role/system)
- [ ] `direction` per subgraph — when to use TB vs LR within a lane
- [ ] Lane ordering — does source order in the .mmd determine left-to-right or top-to-bottom lane placement?

## Multi-lane direction
- [ ] Horizontal lanes (lanes stacked top-to-bottom, flow left-to-right) vs vertical lanes (lanes side-by-side, flow top-to-bottom) — when each is appropriate
- [ ] How cross-lane edges (a task in lane A triggers a task in lane B) render without excessive crossings

## Crossing reduction specific to swim lanes
- [ ] Cross-lane edges are the primary crossing source in multi-lane diagrams — patterns for minimizing
- [ ] When to split a swim-lane diagram into multiple diagrams (one per lane-pair?) vs keep as one
