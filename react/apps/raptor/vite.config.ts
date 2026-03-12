import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@wordpress/element': 'react',
      '@wordpress/i18n': new URL('./src/lib/wp-i18n-stub.js', import.meta.url).pathname,
    },
  },
  build: {
    outDir: 'build',
    manifest: true,
    rollupOptions: {
      input: 'src/main.tsx',
    },
  },
})
