import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Virtual module that stubs @wordpress/i18n for non-WP builds.
// Using a plugin avoids any file-path resolution issues on Windows.
const wpI18nStub: Plugin = {
  name: 'wp-i18n-stub',
  resolveId(id) {
    if (id === '@wordpress/i18n') return '\0wp-i18n-stub'
  },
  load(id) {
    if (id === '\0wp-i18n-stub') return `
export const __ = (text) => text
export const _n = (single, plural, n) => n === 1 ? single : plural
export const _x = (text) => text
export const sprintf = (fmt, ...args) => fmt.replace(/%s/g, () => args.shift())
`
  },
}

export default defineConfig({
  plugins: [react(), wpI18nStub],
  resolve: {
    alias: {
      '@wordpress/element': 'react',
    },
  },
  build: {
    outDir: 'build',
    manifest: true,
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-table': ['@tanstack/react-table'],
          'vendor-charts': ['recharts'],
          'vendor-flow': ['@xyflow/react', '@dagrejs/dagre'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
