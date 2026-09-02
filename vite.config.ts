import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { copyFileSync } from 'node:fs'

/**
 * The site is served from a subpath on GitHub Pages (/CIRCA/), so `base` has to
 * match the repository name. Override it with BASE_PATH when deploying
 * elsewhere, for example BASE_PATH=/ for a custom domain.
 */
const base = process.env.BASE_PATH ?? '/CIRCA/'

/**
 * GitHub Pages has no SPA rewrite: a deep link like /CIRCA/people is a real 404.
 * Serving a copy of index.html as 404.html lets the app boot and let the router
 * resolve the path itself.
 */
function spaFallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const out = path.resolve(import.meta.dirname, 'dist')
      copyFileSync(path.join(out, 'index.html'), path.join(out, '404.html'))
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
