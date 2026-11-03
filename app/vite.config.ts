import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ command }) => {
  // PORT is only used for the dev server; fall back to 3000 if not set (e.g. during CI builds).
  const port = Number(process.env.PORT || "3000");

  // BASE_PATH defaults to "/" — GitHub Pages CI sets it to "/mermaid-diagram-bpmn/"
  const basePath = process.env.BASE_PATH || "/";

  const replitPlugins =
    command === "serve" &&
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : [];

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      ...(command === "serve" ? [runtimeErrorOverlay()] : []),
      ...replitPlugins,
      {
        name: "mermaid-bundled-license-notices",
        apply: "build",
        generateBundle() {
          const appRequire = createRequire(import.meta.url);
          const mermaidRequire = createRequire(appRequire.resolve("mermaid"));
          const notices = ["BPMN for Mermaid: bundled dependency notices", ""];
          for (const [name, file, source] of [
            ["khroma", "license", "https://github.com/fabiospampinato/khroma"],
            ["elkjs", "LICENSE.md", "https://github.com/kieler/elkjs"],
          ]) {
            let directory = path.dirname(mermaidRequire.resolve(name));
            while (!existsSync(path.join(directory, "package.json"))) {
              const parent = path.dirname(directory);
              if (parent === directory) throw new Error(`Missing ${name} license manifest`);
              directory = parent;
            }
            const manifest = JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8"));
            if (manifest.name !== name) throw new Error(`Unexpected ${name} license manifest`);
            notices.push(`${name}@${manifest.version}`, `Source: ${source}`, "Unmodified vendor dependency; source and license available at the link above.",
              readFileSync(path.join(directory, file), "utf8"), "");
          }
          this.emitFile({ type: "asset", fileName: "third-party-notices.txt", source: notices.join("\n") });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      manifest: true,
    },
    // Mermaid is intentionally lazy in production. Pre-optimizing it only for
    // the Vite dev server prevents the preview proxy from timing out while it
    // first transforms this large dependency after opening the Host Demo route.
    optimizeDeps: {
      include: ["mermaid"],
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
