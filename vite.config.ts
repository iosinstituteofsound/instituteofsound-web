import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

const webRoot = path.resolve(__dirname, '.')
const dexRuntimeStub = path.resolve(__dirname, 'src/modules/dex/dex-runtime.ts')
const dexCssStub = path.resolve(__dirname, 'src/modules/dex/dex-runtime.css')
const siblingDexRoot = path.resolve(__dirname, '../instituteofsound-dex')
const packageDexRoot = path.resolve(__dirname, 'node_modules/@instituteofsound/dex')

function resolveDexRoot() {
  if (fs.existsSync(path.join(siblingDexRoot, 'package.json'))) return siblingDexRoot
  if (fs.existsSync(path.join(packageDexRoot, 'package.json'))) return packageDexRoot
  return null
}

const dexRoot = resolveDexRoot()
const dexSrc = dexRoot ? path.join(dexRoot, 'src') : null
const dexDist = dexRoot ? path.join(dexRoot, 'dist') : null

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

  const hasDexSrc = Boolean(dexSrc && fs.existsSync(path.join(dexSrc, 'index.ts')))
  const hasDexDist = Boolean(dexDist && fs.existsSync(path.join(dexDist, 'index.js')))
  const useDexDist = hasDexDist && (!hasDexSrc || mode === 'production')
  const hasDexPackage = hasDexSrc || hasDexDist

  const dexRuntimeAlias = hasDexPackage
    ? useDexDist
      ? path.join(dexDist!, 'index.js')
      : path.join(dexSrc!, 'index.ts')
    : dexRuntimeStub

  const dexCssAlias = hasDexPackage
    ? useDexDist
      ? path.join(dexDist!, 'index.css')
      : path.join(dexSrc!, 'styles/dex.css')
    : dexCssStub

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
          find: '@/modules/dex/dex-runtime.css',
          replacement: dexCssAlias,
        },
        {
          find: '@/modules/dex/dex-runtime',
          replacement: dexRuntimeAlias,
        },
        ...(hasDexSrc && dexRoot
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
      exclude: hasDexPackage ? ['@/modules/dex/dex-runtime'] : [],
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
