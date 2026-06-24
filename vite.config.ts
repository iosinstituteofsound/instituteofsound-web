import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

const webRoot = path.resolve(__dirname, '.')
const siblingDexRoot = path.resolve(__dirname, '../instituteofsound-dex')
const packageDexRoot = path.resolve(__dirname, 'node_modules/@instituteofsound/dex')
const dexRoot = fs.existsSync(path.join(siblingDexRoot, 'package.json'))
  ? siblingDexRoot
  : packageDexRoot
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

  const hasDexSrc = fs.existsSync(path.join(dexSrc, 'index.ts'))
  const hasDexDist = fs.existsSync(path.join(dexDist, 'index.js'))
  const useDexDist = hasDexDist && (!hasDexSrc || mode === 'production')

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
        'three',
        '@react-three/fiber',
        '@react-three/drei',
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
        ...(hasDexSrc
          ? [
              { find: '@dex', replacement: path.join(dexRoot, 'src') },
              { find: '@dex/', replacement: `${path.join(dexRoot, 'src')}/` },
            ]
          : []),
        { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, './src/$1') },
        { find: 'react', replacement: path.resolve(__dirname, './node_modules/react') },
        { find: 'react-dom', replacement: path.resolve(__dirname, './node_modules/react-dom') },
      ],
    },
    optimizeDeps: {
      exclude: ['@instituteofsound/dex'],
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
