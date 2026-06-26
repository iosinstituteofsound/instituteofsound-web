export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '',
  siteUrl: import.meta.env.VITE_SITE_URL?.trim() || 'http://localhost:5173',
  appName: import.meta.env.VITE_APP_NAME?.trim() || 'Institute of Sound',
  wsEnabled: import.meta.env.VITE_WS_ENABLED !== 'false' && import.meta.env.VITE_WS_ENABLED !== '0',
  wsUrl: import.meta.env.VITE_WS_URL?.trim() || '',
  isDev: import.meta.env.DEV,
} as const

export const API_V1 = '/api/v1'

/** Absolute API URL in production; relative in dev (Vite proxy). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = env.apiBaseUrl.replace(/\/+$/, '')
  return base ? `${base}${normalized}` : normalized
}

/** Socket.io server URL (http/https). Dev uses same origin (Vite proxy); prod uses API host. */
export function realtimeServerUrl(): string {
  const explicit = env.wsUrl.replace(/\/+$/, '')
  if (explicit) {
    return explicit.replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:')
  }
  const base = env.apiBaseUrl.replace(/\/+$/, '')
  if (base) return base
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://127.0.0.1:4000'
}
