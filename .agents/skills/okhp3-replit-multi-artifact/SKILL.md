---
name: okhp3-replit-multi-artifact
description: >
  Navigate and build in a Replit pnpm multi-artifact monorepo without silent
  failures. Covers the non-obvious rules that cause blank previews, port
  conflicts, workflow naming errors, and broken cross-artifact imports: BASE_URL
  prefix discipline, PORT env var reading, managed workflow naming, pnpm catalog
  drift, and workspace:* shared library wiring. Activate for "add an artifact",
  "create a new app", "preview path", "port conflict", "blank preview",
  "shared package", "workflow naming", "pnpm catalog", "cross-artifact", or
  any time a second artifact is being added to an existing Replit project.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: developer-tooling
  origin: Glee-fully Chai Chasers Designathon — retrospective skill extraction
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  maturity: draftable
  in_scope:
    - Artifact kinds and their bootstrap skill pairings
    - BASE_URL prefix rule for routes and API calls
    - PORT env var discipline — reading vs. hard-coding
    - Managed workflow naming and the configureWorkflow prohibition
    - pnpm catalog drift and off-catalog pin consequences
    - workspace:* shared library wiring
    - Blank-preview debug checklist
  out_of_scope:
    - Creating artifacts (bootstrapping, toml) — read the artifacts skill
    - Workflow restart mechanics — read the workflows skill
    - pnpm package installation — read the package-management skill
    - Replit secrets and environment variables — read the environment-secrets skill
---

# okhp3-replit-multi-artifact

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Each of the following rules has caused a multi-turn debugging session in a real project. None of them is in the artifact creation walkthrough. This skill exists because knowing the rule *before* you hit the failure is worth four turns of debugging.

---

## Scope

| In scope | Out of scope |
|---|---|
| BASE_URL prefix rule | Artifact bootstrapping — read the artifacts skill |
| PORT env var discipline | Workflow restart mechanics — read the workflows skill |
| Managed workflow naming | Package installation — read the package-management skill |
| pnpm catalog drift | Secrets / env vars — read the environment-secrets skill |
| Cross-artifact shared libraries | |
| Blank-preview debug checklist | |

---

## Artifact kinds and their skills

| Kind | Bootstrap skill to read | Notes |
|---|---|---|
| `web` (React/Vite) | `react-vite` | OpenAPI-first for fullstack; skip codegen for frontend-only |
| `slides` | `slides` | Read BEFORE creating — it runs pre-generation questions |
| `video` | `video-js` | Delegate entire build to a DESIGN subagent |
| `mobile` | `expo` | AsyncStorage by default; no backend on first build |
| `design` | `design-system-creation` | Only on explicit ask; drives tokens.json |
| `api` | (none) | Pre-configured; do not re-create |
| `mockup-sandbox` | `mockup-sandbox` | Pre-installed; do not call `createArtifact` |

**Never call `createArtifact` twice for the same slug.** If `artifacts/<slug>/` already exists, the call fails.

---

## Rule 1: BASE_URL prefix — the most common silent failure

Every route and API call in an artifact must prepend `import.meta.env.BASE_URL` (Vite artifacts) or the equivalent base path helper.

**Why.** Replit uses path-based routing. Each artifact is mounted at a unique preview path (e.g. `/my-app`). A root-relative URL like `/api/users` escapes the artifact's path prefix and hits the wrong route — or a 404. The failure is silent: the URL looks correct in code, the app loads, but API calls return unexpected responses.

**Correct:**

```typescript
// artifacts/my-app/src/api/client.ts
const BASE = import.meta.env.BASE_URL; // includes trailing slash
const res = await fetch(`${BASE}api/users`);
```

**Incorrect (do not do):**

```typescript
const res = await fetch('/api/users'); // root-relative — escapes the artifact's mount path
```

**For Expo apps:** use the `getApiUrl()` helper from the Expo scaffold, which reads the dev domain environment variable.

---

## Rule 2: PORT env var — never hard-code a port

Every artifact's dev server must read the port from the `PORT` environment variable, not from a hard-coded number.

**Why.** The system assigns a unique port per artifact to avoid collisions. A hard-coded port in Vite config (e.g. `server: { port: 3000 }`) will either conflict with another artifact or be wrong for the proxy routing. The result is a blank preview pane with no error.

**Correct Vite config:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: '0.0.0.0',
    allowedHosts: true  // required — preview is proxied through an iframe
  }
});
```

**Correct Express config:**

```typescript
// server.ts
const port = parseInt(process.env.PORT || '3001', 10);
app.listen(port, '0.0.0.0');
```

**`allowedHosts: true` is required for Vite.** The preview is a proxied iframe; requests come from a different origin. Without this, Vite rejects them with a 403 and the preview is blank.

---

## Rule 3: Managed workflow naming — do not replace with configureWorkflow

Every registered artifact service already has a managed workflow:

```
artifacts/<slug>: <service-name>
```

Examples:
- `artifacts/api-server: API Server`
- `artifacts/chai-chasers: web`
- `artifacts/mockup-sandbox: Component Preview Server`

**Never call `configureWorkflow` to create a replacement workflow for an artifact service.** Managed workflows inject service configuration including `PORT`, `BASE_PATH`, and proxy routing. A replacement workflow omits this configuration and creates a conflicting preview path.

To start or restart an artifact service, use the `WorkflowsRestart` tool directly:

```javascript
// Correct — use WorkflowsRestart tool
// name: "artifacts/chai-chasers: web"
```

Or in CodeExecution:

```javascript
await restartWorkflow({ workflowName: "artifacts/chai-chasers: web" });
```

Only use `configureWorkflow` for long-running processes that are **not** represented by a registered artifact service.

---

## Rule 4: pnpm catalog drift — off-catalog pins break plugin typechecks

The workspace root `package.json` is an implicit pnpm workspace member. Off-catalog pins in any package's `package.json` — for packages like `vite` or `@types/node` — create duplicate store instances.

**Symptom:** Vite plugin typecheck passes in isolation but fails when the workspace resolves dependencies. TypeScript sees two copies of the same package with incompatible types.

**Fix:**

1. Check the root `pnpm-workspace.yaml` for a `catalog:` block.
2. Any package pinned with an exact version (e.g. `"vite": "5.4.19"`) that also appears in the catalog must use `"vite": "catalog:"` instead.
3. Run `pnpm install` from the workspace root after changing pins.
4. If a specific version is required (e.g. a CVE override), document it explicitly — do not silently pin.

**Why the root matters.** pnpm treats the root `package.json` as a workspace member. Off-catalog pins there affect every other member's dependency resolution.

---

## Rule 5: Cross-artifact shared libraries via workspace:*

To share code between artifacts (e.g. a shared utility library or API client):

1. Create the library as a package in `lib/<name>/` or `artifacts/<name>/` with its own `package.json` declaring `"name": "@workspace/<name>"`.
2. In the consuming artifact's `package.json`, add:
   ```json
   { "dependencies": { "@workspace/<name>": "workspace:*" } }
   ```
3. Run `pnpm install` from the workspace root so the symlink is created.
4. Import from the package name, not a relative path:
   ```typescript
   import { myUtil } from "@workspace/my-lib";
   ```

**Why `workspace:*` and not a relative path.** Relative paths across package boundaries break TypeScript project references and Vite's module resolution. `workspace:*` lets pnpm manage the symlink correctly.

**After adding a shared dependency:** restart the artifact's workflow so Vite picks up the new symlink.

---

## Blank-preview debug checklist

When the preview pane is blank or shows a connection error, work through this list in order:

| Check | Command / action |
|---|---|
| 1. Is the workflow running? | Check the workflow panel or `listWorkflows()` — state must be `running` |
| 2. Did it open a port? | `getWorkflowStatus({ name: "..." })` — look for `openPorts` |
| 3. Is `allowedHosts: true` in Vite config? | Read `vite.config.ts` — any host restriction causes 403 from proxy |
| 4. Is the server reading `PORT`? | Read server startup code — hard-coded port = wrong port |
| 5. Is `BASE_URL` prepended to every route/API call? | Grep `fetch(` for root-relative URLs starting with `/` |
| 6. After code changes, was the workflow restarted? | Restart the workflow — hot-reload does not catch all changes |
| 7. pnpm catalog drift? | `pnpm why <package>` — should show one version, not two |

If all seven are clean and the preview is still blank, read the `debug-workflow-ports-issues` skill.

---

## Artifact registration summary

When creating a new artifact, `createArtifact()` handles:
- Creating `artifacts/<slug>/` with scaffold files
- Writing `artifact.toml`
- Allocating a service port
- Registering the managed workflow

After `createArtifact()` returns, read the artifact kind's bootstrap skill (see the table above) before writing any code. The bootstrap skill tells you what to build and in what order.

---

## About

Built from retrospective analysis of the Glee-fully Chai Chasers Designathon project at [overkillhill.com](https://overkillhill.com).
By [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
