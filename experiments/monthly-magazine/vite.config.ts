import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const labRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(labRoot, '../..')

/** Isolated demo — not part of main `npm run build`. */
export default defineConfig({
  root: labRoot,
  plugins: [react()],
  server: {
    port: 5200,
    strictPort: true,
    fs: { allow: [labRoot, repoRoot] },
  },
  preview: {
    port: 5200,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
