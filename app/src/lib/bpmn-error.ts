/**
 * bpmn-error.ts
 *
 * Typed error class for the bpmn-beta parser.
 *
 * ParseError extends the native Error class with structured fields so callers
 * can programmatically inspect parse failures rather than parsing the message
 * string. This satisfies TD-010: "Define ParseError type with line, column,
 * message, code fields."
 */

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

/** Structured error codes emitted by the bpmn-beta parser. */
export type ParseErrorCode =
  | 'UNEXPECTED_CLOSE_BRACE'    // } without a matching open block
  | 'NESTED_POOL'               // pool declared inside another pool
  | 'LANE_OUTSIDE_POOL'         // lane declared outside a pool block
  | 'NESTED_LANE'               // lane declared inside another lane
  | 'MESSAGE_FLOW_INSIDE_BLOCK'; // ~~> flow inside a pool or lane block

// ---------------------------------------------------------------------------
// ParseError class
// ---------------------------------------------------------------------------

/**
 * A structured parse error emitted by the bpmn-beta parser.
 *
 * Extends the native Error so it can be caught with a plain `catch` block
 * and used wherever an Error is expected, but also carries typed fields for
 * tooling that wants to display structured diagnostics (editor gutter markers,
 * inline error bars, LSP diagnostics, etc.).
 *
 * @example
 * ```typescript
 * import { parse } from './bpmn-parser';
 * import { ParseError } from './bpmn-error';
 *
 * try {
 *   const db = parse(source);
 * } catch (e) {
 *   if (e instanceof ParseError) {
 *     console.error(`Line ${e.line}: [${e.code}] ${e.message}`);
 *   }
 * }
 * ```
 */
export class ParseError extends Error {
  /** 1-based line number where the error was detected. */
  readonly line: number;

  /**
   * 1-based column number.
   * Currently always 1 — the parser is line-oriented and does not track
   * intra-line byte offsets. Reserved for future Langium migration (TD-007).
   */
  readonly column: number;

  /** Structured error code for programmatic handling. */
  readonly code: ParseErrorCode;

  constructor(message: string, line: number, code: ParseErrorCode, column = 1) {
    super(message);
    this.name = 'ParseError';
    this.line = line;
    this.column = column;
    this.code = code;
    // Maintain correct prototype chain in environments that patch Error.
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}
