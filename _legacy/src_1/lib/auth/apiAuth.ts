import { authApiUrl } from './authUrls'
import { ensureValidAccessToken } from './accessToken'
import { getMe } from '@/services/api/auth.service'

import type { User } from './types'
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from './sessionStore'

export type GoogleOAuthIntent = 'member' | 'artist' | 'desk' | 'editor_apply'

const OAUTH_INTENT_KEY = 'ios_oauth_intent'

export { ensureValidAccessToken } from './accessToken'

export function startGoogleSignIn(intent: GoogleOAuthIntent = 'member'): void {
  sessionStorage.setItem(OAUTH_INTENT_KEY, intent)
  const returnTo = encodeURIComponent(window.location.origin)
  window.location.href = authApiUrl(
    `/api/auth/google?intent=${encodeURIComponent(intent)}&return_to=${returnTo}`,
  )
}

function readOAuthIntentFromHash(hash: string): GoogleOAuthIntent | null {
  const fromHash = new URLSearchParams(hash.replace(/^#/, '')).get('intent')
  const fromStorage = sessionStorage.getItem(OAUTH_INTENT_KEY)
  sessionStorage.removeItem(OAUTH_INTENT_KEY)

  const raw = fromHash ?? fromStorage
  if (raw === 'desk' || raw === 'member' || raw === 'artist' || raw === 'editor_apply') {
    return raw
  }
  return null
}

export async function completeApiAuthCallback(): Promise<{
  user: User
  intent: GoogleOAuthIntent | null
}> {
  const queryError = new URLSearchParams(window.location.search).get('error')
  if (queryError) throw new Error(queryError)

  const hash = window.location.hash
  if (hash.includes('error=')) {
    const desc = new URLSearchParams(hash.slice(1)).get('error_description')
    throw new Error(desc?.replace(/\+/g, ' ') ?? 'Google sign-in was cancelled')
  }

  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const expiresIn = Number(params.get('expires_in') ?? '3600')

  if (accessToken && refreshToken) {
    setStoredSession({
      accessToken,
      refreshToken,
      expiresIn: Number.isFinite(expiresIn) ? expiresIn : 3600,
    })
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (!getStoredSession()) {
    throw new Error('No session after Google sign-in. Try signing in again.')
  }

  const intent = readOAuthIntentFromHash(hash)
  const { user } = await getMe()
  return { user, intent }
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch(authApiUrl('/api/auth/logout'), { method: 'POST' })
  } catch {
    /* optional */
  }
  clearStoredSession()
}

export async function apiGetCurrentUser(): Promise<User | null> {
  const token = await ensureValidAccessToken()
  if (!token) return null
  try {
    const { user } = await getMe()
    return user
  } catch {
    clearStoredSession()
    return null
  }
}

export function subscribeApiAuth(callback: (user: User | null) => void): () => void {
  const onChange = () => {
    void apiGetCurrentUser().then(callback).catch(() => callback(null))
  }
  window.addEventListener('ios-auth-session-change', onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener('ios-auth-session-change', onChange)
    window.removeEventListener('storage', onChange)
  }
}
