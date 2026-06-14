import { authApiUrl } from './authUrls'
import {
  clearStoredSession,
  getStoredSession,
  isSessionExpired,
  setStoredSession,
} from './sessionStore'

async function refreshStoredSession(): Promise<boolean> {
  const session = getStoredSession()
  if (!session) return false

  const res = await fetch(authApiUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  })

  if (!res.ok) {
    clearStoredSession()
    return false
  }

  const body = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  setStoredSession({
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresIn: body.expires_in,
  })
  return true
}

export async function ensureValidAccessToken(): Promise<string | null> {
  const session = getStoredSession()
  if (!session) return null
  if (!isSessionExpired(session)) return session.accessToken
  const ok = await refreshStoredSession()
  return ok ? getStoredSession()?.accessToken ?? null : null
}
