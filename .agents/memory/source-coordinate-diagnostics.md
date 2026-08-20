---
name: Source-coordinate diagnostics
description: Keep parser error locations aligned with the text authors see in the Playground editor.
---

Parser diagnostics and editor highlights must use physical, one-based source line
coordinates. Blank lines and `%%` comments are ignorable syntax but still occupy
author-visible rows. The editor must keep one visual row per physical source line.

**Why:** A diagnostic that counts only parsed lines, or an editor that soft-wraps
lines while using fixed-row highlighting, points authors at the wrong text and
undermines error recovery.

**How to apply:** Preserve original positions when filtering source for parsing.
When adding editor diagnostics, keep line geometry stable with non-wrapping
source text or use a measured/mirrored layout that accounts for every visual row.