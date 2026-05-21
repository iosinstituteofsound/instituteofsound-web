import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { buildArtistCatalogFromUrl } from './api/import-catalog'
import { resolveThumbnailFromUrl } from './src/lib/media/resolveThumbnail'

function thumbnailApiPlugin(): Plugin {
  return {
    name: 'ios-thumbnail-api',
    configureServer(server) {
      server.middlewares.use('/api/import-catalog', async (req, res) => {
        try {
          const requestUrl = new URL(req.url ?? '', 'http://localhost')
          const target = requestUrl.searchParams.get('url')?.trim()
          if (!target) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing url' }))
            return
          }
          const catalog = await buildArtistCatalogFromUrl(target)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(catalog))
        } catch (err) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Catalog import failed',
            })
          )
        }
      })

      server.middlewares.use('/api/thumbnail', async (req, res) => {
        try {
          const requestUrl = new URL(req.url ?? '', 'http://localhost')
          const target = requestUrl.searchParams.get('url')?.trim()
          if (!target) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing url' }))
            return
          }
          const thumbnailUrl = await resolveThumbnailFromUrl(target)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ thumbnailUrl }))
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ thumbnailUrl: null }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) process.env[key] = value
  }

  return {
  plugins: [react(), tailwindcss(), thumbnailApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  }
})
