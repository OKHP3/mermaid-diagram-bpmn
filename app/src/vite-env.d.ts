/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Full git commit SHA injected at Vite build time.
   * Set by CI: `VITE_COMMIT_SHA=$(git rev-parse HEAD) pnpm run build`
   * Absent in local dev — falls back to "local" in ReleasePage.tsx.
   */
  readonly VITE_COMMIT_SHA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
