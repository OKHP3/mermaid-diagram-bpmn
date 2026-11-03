#!/usr/bin/env node
/**
 * Probe the external sources linked by the public Roadmap.
 *
 * Network failures are reported as UNVERIFIED (exit code 2), not as a clean
 * check. HTTP error responses are UNAVAILABLE (exit code 1).
 */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { REQUIRED_EVIDENCE } from "./check-roadmap-evidence.mjs";

export const DEFAULT_TIMEOUT_MS = 8_000;

export const LIVE_EXTERNAL_EVIDENCE = REQUIRED_EVIDENCE
  .filter(({ marker }) => marker.startsWith("https://"))
  .map(({ id, label, marker }) => ({ id, label, url: marker }));

export async function checkRoadmapLiveEvidence({
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A Fetch-compatible function is required.");
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError("timeoutMs must be a positive finite number.");
  }

  return Promise.all(LIVE_EXTERNAL_EVIDENCE.map(async (source) => {
    try {
      const response = await fetchImpl(source.url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.status >= 200 && response.status < 300) {
        return {
          ...source,
          status: "reachable",
          httpStatus: response.status,
          finalUrl: response.url || source.url,
          redirected: response.redirected === true,
        };
      }

      if (response.status === 404 || response.status === 410) {
        return {
          ...source,
          status: "unavailable",
          httpStatus: response.status,
          reason: `HTTP ${response.status}`,
        };
      }

      return {
        ...source,
        status: "unverified",
        httpStatus: response.status,
        reason: `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ...source,
        status: "unverified",
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }));
}

export function roadmapLiveEvidenceExitCode(results) {
  if (results.some(({ status }) => status === "unavailable")) return 1;
  if (results.some(({ status }) => status === "unverified")) return 2;
  return 0;
}

function main() {
  void checkRoadmapLiveEvidence().then((results) => {
    for (const result of results) {
      const detail = result.status === "reachable"
        ? `HTTP ${result.httpStatus}${result.redirected ? `; redirected to ${result.finalUrl}` : ""}`
        : result.status === "unavailable"
          ? `${result.reason}; ${result.url}`
          : `${result.reason}${result.httpStatus ? "; availability not confirmed" : "; not confirmed reachable"}`;
      console.log(`[check-roadmap-live-evidence] ${result.status.toUpperCase()}: ${result.label} — ${detail}`);
    }

    const exitCode = roadmapLiveEvidenceExitCode(results);
    const summary = exitCode === 0
      ? "All external evidence sources are reachable."
      : exitCode === 1
        ? "One or more external evidence sources are unavailable."
        : "One or more external evidence sources could not be verified; review before release.";
    console.log(`[check-roadmap-live-evidence] ${summary}`);
    process.exitCode = exitCode;
  }).catch((error) => {
    console.error(`[check-roadmap-live-evidence] FAIL: ${error.message}`);
    process.exitCode = 1;
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
