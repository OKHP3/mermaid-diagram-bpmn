---
name: happy-dom SVG innerHTML parsing bug
description: happy-dom drops all SVG sibling elements after a <defs> block when using HTML mode; fix pattern for any SVG injection + DOMPurify integration tests.
---

# happy-dom SVG innerHTML Parsing Bug

## The Rule
Never inject SVG content with `<defs>` before `<g>` elements using HTML-mode innerHTML in happy-dom. Every sibling after the closing `</defs>` tag is silently dropped.

**Why:** happy-dom's HTML5 foreign-content parser (used when setting `div.innerHTML` or `svgEl.innerHTML` with SVG content) drops all elements that follow `</defs>` inside the SVG context. This is a happy-dom bug (confirmed in v20.x). DOMPurify internally re-parses the SVG output string through the same happy-dom HTML parser, so the bug fires twice.

**How to apply:** Any code that injects SVG strings into a DOM element in happy-dom vitest tests must avoid this pattern:
- `el.innerHTML = '...defs...g...'` (g after defs → g dropped in DOM/DOMPurify)
- Fix: `DOMParser('image/svg+xml') + document.importNode(child, true)` (XML parser, no drop)

## Test Environment Fix
When testing Mermaid-rendered SVGs in vitest/happy-dom, use `securityLevel: 'loose'` in `mermaid.initialize()`. DOMPurify runs its own innerHTML parse on the SVG string, which triggers the same happy-dom bug and strips all `<g>` elements. With `securityLevel: 'loose'`, mermaid skips DOMPurify and returns the correctly-injected content from `draw()`. This is a test-only accommodation; real browsers are unaffected.

## Diagnostic evidence
- `div.innerHTML = '<svg><defs>...</defs><g class="bpmn-task"/></svg>'` → g NOT present
- `DOMParser('image/svg+xml')` + importNode → g present, style content preserved
- `div.innerHTML = '<svg><g/><defs>...</defs></svg>'` (g before defs) → g present, style empty
