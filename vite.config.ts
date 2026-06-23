import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

const webRoot = path.resolve(__dirname, '.')
const dexRoot = path.resolve(__dirname, '../instituteofsound-dex')
const dexSrc = path.join(dexRoot, 'src')
const dexDist = path.join(dexRoot, 'dist')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, webRoot, '')
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) process.env[key] = value
  }

  const rawApiTarget = env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:4000'
  const apiTarget = rawApiTarget.replace(/\/\/localhost\b/i, '//127.0.0.1')

  const expressApiProxy = {
    target: apiTarget,
    changeOrigin: true,
  }

  const useDexDist = mode === 'production' && fs.existsSync(path.join(dexDist, 'index.js'))

  return {
    envDir: webRoot,
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      dedupe: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tanstack/react-query',
        'zustand',
        'framer-motion',
      ],
      alias: [
        {
          find: '@instituteofsound/dex/styles/dex.css',
          replacement: useDexDist ? path.join(dexDist, 'index.css') : path.join(dexSrc, 'styles/dex.css'),
        },
        {
          find: '@instituteofsound/dex',
          replacement: useDexDist ? path.join(dexDist, 'index.js') : path.join(dexSrc, 'index.ts'),
        },
        { find: '@dex', replacement: path.join(dexSrc) },
        { find: '@dex/', replacement: `${path.join(dexSrc)}/` },
        { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, './src/$1') },
        { find: 'react', replacement: path.resolve(__dirname, './node_modules/react') },
        { find: 'react-dom', replacement: path.resolve(__dirname, './node_modules/react-dom') },
      ],
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false,
      proxy: {
        '/api/auth': expressApiProxy,
        '/api/share': expressApiProxy,
        '/api/v1': expressApiProxy,
        '/api/v2': expressApiProxy,
        '/uploads': expressApiProxy,
      },
    },
    preview: {
      host: true,
      port: 4173,
      proxy: {
        '/api/auth': expressApiProxy,
        '/api/share': expressApiProxy,
        '/api/v1': expressApiProxy,
        '/api/v2': expressApiProxy,
        '/uploads': expressApiProxy,
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    },
  }
})
