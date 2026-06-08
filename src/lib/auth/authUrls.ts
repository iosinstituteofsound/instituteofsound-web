/** Auth + utility routes on the API host (no import from services/api/client). */
export function authApiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
  const clean = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${clean}` : clean
}
