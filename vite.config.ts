import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const webRoot = path.resolve(__dirname, '.')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, webRoot, '')
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) process.env[key] = value
  }

  const rawApiTarget = env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:4000'
  // Avoid Windows dev resolving localhost → ::1 while API listens on IPv4 only
  const apiTarget = rawApiTarget.replace(/\/\/localhost\b/i, '//127.0.0.1')

  /** Express-only paths — do not proxy /api/*.json (served from public/api/). */
  const expressApiProxy = {
    target: apiTarget,
    changeOrigin: true,
  }

  return {
    envDir: webRoot,
    plugins: [
      react(),
      tailwindcss(),
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
      proxy: {
        '/api/auth': expressApiProxy,
        '/api/v1': expressApiProxy,
        '/api/link-preview': expressApiProxy,
        '/api/thumbnail': expressApiProxy,
        '/api/import-catalog': expressApiProxy,
        '/api/share': expressApiProxy,
      },
    },
    preview: {
      host: true,
      port: 4173,
      proxy: {
        '/api/auth': expressApiProxy,
        '/api/v1': expressApiProxy,
        '/api/link-preview': expressApiProxy,
        '/api/thumbnail': expressApiProxy,
        '/api/import-catalog': expressApiProxy,
        '/api/share': expressApiProxy,
      },
    },
  }
})
