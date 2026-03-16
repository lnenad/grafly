import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Inject contents of analytics.html (gitignored) into <head> at build time.
// Copy analytics.html.example → analytics.html and fill in your snippet.
function injectAnalytics() {
  return {
    name: 'inject-analytics',
    transformIndexHtml(html) {
      const file = path.resolve(__dirname, 'analytics.html')
      if (!fs.existsSync(file)) return html
      const snippet = fs.readFileSync(file, 'utf-8').trim()
      if (!snippet) return html
      return html.replace('</head>', `${snippet}\n</head>`)
    },
  }
}

export default defineConfig({
  plugins: [react(), injectAnalytics()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'flow-vendor': ['@xyflow/react'],
        },
      },
    },
  },
})
