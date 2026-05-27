# Deployment — BPMN for Mermaid

**Project:** BPMN for Mermaid (`mermaid-diagram-bpmn`)
**Owner:** OverKill Hill P³ / Jamie Hill
**Architecture:** Fully static — no backend, no server-side logic, no runtime configuration

---

## Architecture overview

BPMN for Mermaid is a fully static single-page application. All parsing, layout, and SVG rendering happens in the browser. There is no backend, no API, no database, and no server-side rendering.

The application can be deployed to any static hosting service that supports:
- Single-page app (SPA) routing with a fallback to `index.html`
- HTTPS

---

## Build

```bash
# From repo root
pnpm --filter @workspace/mermaid-diagram-bpmn run build
```

Output is emitted to `artifacts/mermaid-diagram-bpmn/dist/`.

The build is fully static — no environment variables, no secrets, no runtime configuration.

To verify before deploy:

```bash
pnpm --filter @workspace/mermaid-diagram-bpmn run test
pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck
```

Both must pass before deploying.

---

## Deployment targets

### GitHub Pages (current public demo)

The app is deployed automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

**Live URL:** `https://okhp3.github.io/mermaid-diagram-bpmn`

The Vite build uses `base: '/mermaid-diagram-bpmn/'` to match the GitHub Pages subpath.

**Note:** The CI/CD pipeline does not currently run tests before deploying. This is a known gap (TD-007). Until fixed, broken code can deploy to the public URL.

### Replit Deployments (development)

The app runs on Replit via the `artifacts/mermaid-diagram-bpmn: web` workflow on the port assigned by the `PORT` environment variable.

Development workflow:
```bash
# Handled by Replit workflow — do not run manually
pnpm --filter @workspace/mermaid-diagram-bpmn run dev
```

### Manual / self-hosted

1. Run `pnpm --filter @workspace/mermaid-diagram-bpmn run build` to generate `dist/`
2. Upload the contents of `dist/` to your hosting provider
3. Configure your server to serve `index.html` for all paths (SPA fallback)

Example nginx config:
```nginx
location /mermaid-diagram-bpmn/ {
  try_files $uri $uri/ /mermaid-diagram-bpmn/index.html;
}
```

---

## GitHub Actions workflow

Current workflow: `.github/workflows/deploy.yml`

```yaml
# Triggered on: push to main
# Steps:
#   1. Install dependencies (pnpm)
#   2. Build (vite build)
#   3. Deploy to GitHub Pages
#
# Known gap: no test pre-gate before build step (TD-007)
```

To add the test pre-gate (TD-007), insert before the build step:

```yaml
- name: Test
  run: pnpm --filter @workspace/mermaid-diagram-bpmn run test
```

---

## npm package (not yet published)

The `bpmn-plugin.ts` module is designed to be published as `mermaid-diagram-bpmn` on npm. This is tracked as BL-013 in the backlog.

When publishing:
1. Update `package.json` with `name`, `exports`, `main`, `types`, `files`
2. Add `"publishConfig": { "access": "public" }`
3. Build and verify: `pnpm pack --dry-run`
4. Publish: `pnpm publish`

The plugin exports:
```ts
import { bpmnPlugin } from 'mermaid-diagram-bpmn';
await mermaid.registerExternalDiagrams([bpmnPlugin]);
```

---

## Environments

| Environment | URL | Trigger | Status |
|---|---|---|---|
| Development | Replit preview pane | Manual workflow start | Active |
| Public demo | `okhp3.github.io/mermaid-diagram-bpmn` | Push to main | Active |
| npm package | `npm install mermaid-diagram-bpmn` | Manual publish | Not yet published |
