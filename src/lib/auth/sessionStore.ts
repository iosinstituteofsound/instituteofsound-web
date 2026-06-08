const ACCESS_KEY = 'ios_access_token'
const REFRESH_KEY = 'ios_refresh_token'
const EXPIRES_AT_KEY = 'ios_token_expires_at'

export interface StoredSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export function getStoredSession(): StoredSession | null {
  const accessToken = sessionStorage.getItem(ACCESS_KEY)
  const refreshToken = sessionStorage.getItem(REFRESH_KEY)
  const expiresAtRaw = sessionStorage.getItem(EXPIRES_AT_KEY)
  if (!accessToken || !refreshToken || !expiresAtRaw) return null
  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt)) return null
  return { accessToken, refreshToken, expiresAt }
}

export function setStoredSession(input: {
  accessToken: string
  refreshToken: string
  expiresIn: number
}): void {
  const expiresAt = Date.now() + Math.max(60, input.expiresIn) * 1000
  sessionStorage.setItem(ACCESS_KEY, input.accessToken)
  sessionStorage.setItem(REFRESH_KEY, input.refreshToken)
  sessionStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
  window.dispatchEvent(new Event('ios-auth-session-change'))
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
  sessionStorage.removeItem(EXPIRES_AT_KEY)
  window.dispatchEvent(new Event('ios-auth-session-change'))
}

export function getAccessToken(): string | null {
  return getStoredSession()?.accessToken ?? null
}

export function isSessionExpired(session: StoredSession, skewMs = 60_000): boolean {
  return Date.now() >= session.expiresAt - skewMs
}
