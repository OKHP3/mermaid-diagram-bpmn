---
name: Playwright system libraries
description: Local Playwright Chromium may be installed but unable to launch because the environment lacks a required shared library.
---

Do not interpret a local Playwright browser-launch failure as a failed browser assertion before checking for missing operating-system libraries.

**Why:** Chromium was present in the Playwright cache but could not start because `libglib-2.0.so.0` was unavailable. Test discovery, production builds, and Vitest validation still ran successfully.

**How to apply:** Record browser tests normally, but distinguish a missing-library launch error from an assertion failure. Verify test discovery and use an environment with the required browser libraries for the full end-to-end run.

For cross-engine runs, Playwright's WebKit Linux bundle may require Ubuntu-versioned
media sonames that the closest Nix packages do not provide. Use CI with Playwright's
official `install --with-deps` flow for WebKit evidence instead of committing a broad
Replit-only runtime-library list.