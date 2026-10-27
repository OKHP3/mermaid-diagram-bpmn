import { rmSync } from "node:fs";

rmSync("package-lock.json", { force: true });
rmSync("yarn.lock", { force: true });

if (!process.env.npm_config_user_agent?.startsWith("pnpm/")) {
  console.error("This workspace requires pnpm. Run `corepack enable` once, then `pnpm install`.");
  process.exit(1);
}
