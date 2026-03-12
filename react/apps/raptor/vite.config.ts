import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@wordpress/element': 'react',
      '@wordpress/i18n': path.resolve(__dirname, 'src/lib/wp-i18n-stub.js'),
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
