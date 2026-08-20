---
name: Post-merge install timeout
description: The repository post-merge hook runs pnpm install and needs a timeout above the 20-second default.
---

The post-merge setup hook performs a workspace-wide frozen pnpm install. Its duration can exceed the default 20-second limit even when installation is healthy.

**Why:** A merge once reported setup failure because the install completed just after the exact 20-second timeout; rerunning with a 120-second limit completed successfully.

**How to apply:** Keep the hook non-interactive and idempotent, and allow enough timeout headroom for workspace dependency installation rather than treating a near-20-second timeout as a package failure.