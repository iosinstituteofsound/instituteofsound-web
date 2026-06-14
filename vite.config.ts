import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const webRoot = path.resolve(__dirname, '.')

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

  return {
    envDir: webRoot,
    plugins: [react(), tailwindcss()],
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
