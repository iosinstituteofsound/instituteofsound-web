import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
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
    plugins: [
      react(),
      tailwindcss(),
      thumbnailApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'pwa/icon-master.svg',
          'pwa/apple-touch-icon.png',
          'pwa/apple-touch-icon-167.png',
          'pwa/apple-touch-icon-152.png',
          'pwa/apple-touch-icon-120.png',
          'pwa/icon-192.png',
          'pwa/icon-512.png',
          'pwa/icon-512-maskable.png',
        ],
        manifest: {
          id: '/',
          name: 'Institute of Sound',
          short_name: 'IOS',
          description:
            'Underground music magazine and network — reviews, community, artists, and culture.',
          theme_color: '#050505',
          background_color: '#050505',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          categories: ['music', 'entertainment', 'magazines'],
          icons: [
            {
              src: 'pwa/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'pwa/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
          shortcuts: [
            {
              name: 'Community Feed',
              short_name: 'Feed',
              url: '/community#feed',
              icons: [{ src: 'pwa/icon-192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Discover',
              short_name: 'Discover',
              url: '/discover',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false,
    },
    preview: {
      host: true,
      port: 4173,
    },
  }
})
