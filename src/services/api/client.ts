import { ensureValidAccessToken } from '@/lib/auth/accessToken'
import { isLiveApiMode } from '@/lib/api/liveMode'

export type ApiAuthMode = 'required' | 'optional' | 'none'

export type ApiFetchInit = RequestInit & { auth?: ApiAuthMode }

/** Express API root without trailing slash, e.g. http://localhost:4000 */
export function apiRootUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
  if (base) return base
  return ''
}

/** Full v1 prefix including /api/v1 */
export function apiV1BaseUrl(): string {
  const root = apiRootUrl()
  return root ? `${root}/api/v1` : '/api/v1'
}

export async function tryAccessToken(): Promise<string | null> {
  if (!isLiveApiMode()) return null
  return ensureValidAccessToken()
}

export async function apiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  const mode = init?.auth ?? 'required'
  const token = mode === 'none' ? null : await tryAccessToken()

  if (mode === 'required' && !token) {
    throw new Error('Sign in required')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const { auth: _auth, ...fetchInit } = init ?? {}
  const url = `${apiV1BaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...fetchInit,
    headers,
    signal: fetchInit.signal ?? AbortSignal.timeout(25_000),
  })
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }
  return body as T
}

/** Non-v1 utility routes on the same API host */
export function apiUtilityUrl(path: string): string {
  const root = apiRootUrl()
  const clean = path.startsWith('/') ? path : `/${path}`
  return root ? `${root}${clean}` : clean
}
