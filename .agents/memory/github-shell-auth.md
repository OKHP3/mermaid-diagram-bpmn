---
name: GitHub shell authentication
description: The separation between Replit's GitHub integration and interactive HTTPS Git credentials.
---

Replit's GitHub OAuth connection can be healthy and repository-writable while `git push` in the shell still rejects an old HTTPS credential.

**Why:** The integration authenticates connector/API calls; it does not necessarily replace credentials selected by the shell's Git credential and Askpass configuration.

**How to apply:** Keep the GitHub remote URL token-free. Check credential-helper and Askpass configuration without printing values, then use an environment-backed credential helper that references the workspace secret without embedding or displaying the token. Verify with the exact `git pull && git push` command.