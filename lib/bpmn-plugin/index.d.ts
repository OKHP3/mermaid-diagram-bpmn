/**
 * @okhp3/mermaid-diagram-bpmn
 *
 * bpmn-beta diagram type plugin for Mermaid.
 *
 * @example
 * ```typescript
 * import mermaid from 'mermaid';
 * import { bpmnPlugin } from '@okhp3/mermaid-diagram-bpmn';
 *
 * await mermaid.registerExternalDiagrams([bpmnPlugin]);
 * await mermaid.run();
 * ```
 */

/**
 * The mermaid package version this plugin is validated against.
 * Install mermaid at exactly this version (or a compatible minor) to
 * match the tested integration contract.
 */
export declare const MERMAID_VERSION_TARGET: string;

/**
 * Mermaid ExternalDiagramDefinition for the `bpmn-beta` diagram type.
 *
 * Pass this to `mermaid.registerExternalDiagrams([bpmnPlugin])` before
 * calling `mermaid.run()` or `mermaid.render()`.
 */
export declare const bpmnPlugin: {
  /** Diagram type identifier — the string `'bpmn-beta'`. */
  readonly id: string;
  /**
   * DiagramDetector — returns true when the source text starts with
   * `bpmn-beta` (case-insensitive, allowing leading whitespace).
   */
  detector: (text: string, config?: unknown) => boolean;
  /**
   * DiagramLoader — lazy-loads the full DiagramDefinition.
   * Mermaid calls this only when a bpmn-beta diagram is first encountered.
   */
  loader: () => Promise<{
    id: string;
    diagram: {
      /** In-memory diagram state populated by the parser. */
      db: object;
      /** SVG renderer — injects content into the DOM element created by Mermaid. */
      renderer: {
        draw: (
          text: string,
          id: string,
          version: string,
          diagramObject?: unknown,
        ) => Promise<void>;
      };
      /**
       * Mermaid ParserDefinition.
       * `parse(text)` populates `yy` with the parsed BpmnDb state.
       */
      parser: {
        parse: (text: string) => void;
        yy: object;
      };
      /**
       * DiagramStylesProvider — called by Mermaid with resolved themeVariables
       * before each render. Returns a CSS string embedded in the output SVG.
       */
      styles: (options?: Record<string, string>) => string;
    };
  }>;
};

export default bpmnPlugin;
