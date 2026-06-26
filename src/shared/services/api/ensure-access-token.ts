import axios from 'axios'
import { apiUrl } from '@/shared/config/env'
import type { RefreshTokenResponse } from '@/shared/types/api.types'
import { tokenStorage } from './token-storage'

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<RefreshTokenResponse>(apiUrl('/api/auth/refresh'), {
      refresh_token: refreshToken,
    })
    tokenStorage.setTokens(data.access_token, data.refresh_token)
    return data.access_token
  } catch {
    tokenStorage.clear()
    return null
  }
}

/** Returns a valid access token, refreshing from the refresh token when needed. */
export async function ensureAccessToken(): Promise<string | null> {
  const existing = tokenStorage.getAccessToken()
  if (existing) return existing

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export function getRefreshPromise(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
