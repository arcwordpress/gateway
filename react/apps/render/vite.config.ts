import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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
          'vendor-flow': ['@xyflow/react', '@dagrejs/dagre'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
