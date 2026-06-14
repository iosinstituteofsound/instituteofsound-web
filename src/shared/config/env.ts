export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '',
  siteUrl: import.meta.env.VITE_SITE_URL?.trim() || 'http://localhost:5173',
  appName: import.meta.env.VITE_APP_NAME?.trim() || 'Institute of Sound',
  isDev: import.meta.env.DEV,
} as const

export const API_V1 = '/api/v1'

/** Absolute API URL in production; relative in dev (Vite proxy). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = env.apiBaseUrl.replace(/\/+$/, '')
  return base ? `${base}${normalized}` : normalized
}
