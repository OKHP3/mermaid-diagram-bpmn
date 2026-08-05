import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, '../../app/src/lib/bpmn-plugin.ts'),
      name: 'BpmnPlugin',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      // No external dependencies — all bpmn-* source files are bundled in.
      // mermaid is a peer dependency consumed by the host; the plugin itself
      // does not import mermaid (it is registered via registerExternalDiagrams).
      external: [],
      output: {
        // Suppress the mixed-exports warning: the plugin exports both named
        // exports (bpmnPlugin, MERMAID_VERSION_TARGET) and a default export.
        // Consumers should use the named import; default is provided for
        // convenience. "named" mode means CJS consumers use .bpmnPlugin etc.
        exports: 'named',
      },
    },
  },
});
