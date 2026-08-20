/**
 * Starter pack public asset contract.
 *
 * The ZIP button fetches these exact URLs at download time. Serve them through
 * Vite's real static-file middleware so a missing or empty public asset fails
 * the normal `pnpm test` suite before a release can ship a placeholder file.
 *
 * @vitest-environment node
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer as createHttpServer, type Server } from "node:http";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createServer, type ViteDevServer } from "vite";

const appRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const starterPackPaths = [
  "skills/okhp3-process-intake-and-scope/SKILL.md",
  "context/organization-profile.md",
  "context/process-taxonomy.md",
] as const;

let vite: ViteDevServer;
let httpServer: Server;
let origin: string;

beforeAll(async () => {
  vite = await createServer({
    root: appRoot,
    configFile: resolve(appRoot, "vite.config.ts"),
    server: { middlewareMode: true },
  });
  httpServer = createHttpServer(vite.middlewares);

  await new Promise<void>((resolveServer, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(0, "127.0.0.1", resolveServer);
  });

  const address = httpServer.address();
  if (!address || typeof address === "string") {
    throw new Error("Starter pack test server did not expose a TCP address.");
  }
  origin = `http://127.0.0.1:${address.port}`;
}, 30_000);

afterAll(async () => {
  await new Promise<void>((resolveServer, reject) => {
    httpServer.close((error) => (error ? reject(error) : resolveServer()));
  });
  await vite.close();
});

describe("Starter pack public asset contract", () => {
  it.each(starterPackPaths)(
    "serves %s with HTTP 200 and a non-empty body",
    async (path) => {
      // Match StartHerePanel's `${import.meta.env.BASE_URL}${path}` construction.
      const response = await fetch(new URL(`${vite.config.base}${path}`, origin));
      const body = await response.text();

      expect(response.status, `${path} must resolve for the starter ZIP`).toBe(200);
      expect(body.trim(), `${path} must not be an empty starter ZIP entry`).not.toBe("");
    },
  );
});