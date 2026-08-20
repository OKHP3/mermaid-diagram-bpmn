/**
 * Shared lazy-route loaders.
 *
 * Reusing the same promise lets navigation intent warm a route chunk before
 * React.lazy needs it, without adding that route's dependencies to the initial
 * bundle.
 */

type MermaidHostDemoModule = typeof import("@/pages/MermaidHostDemo");

let mermaidHostDemoPromise: Promise<MermaidHostDemoModule> | undefined;

export function loadMermaidHostDemo() {
  mermaidHostDemoPromise ??= import("@/pages/MermaidHostDemo");
  return mermaidHostDemoPromise;
}