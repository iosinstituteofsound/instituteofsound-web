import { env, apiUrl } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'

export type OAuthIntent = 'member' | 'artist' | 'desk' | 'editor_apply'

export interface DevLoginInput {
  email?: string
}

export interface DevLoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  email: string
  userId: string
  isNew?: boolean
}

export function buildGoogleAuthUrl(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : env.siteUrl
  const returnTo = `${origin}/auth/callback`
  const params = new URLSearchParams({ return_to: returnTo })
  return apiUrl(`/api/auth/google?${params.toString()}`)
}

export function redirectToGoogleAuth(): void {
  window.location.href = buildGoogleAuthUrl()
}

export function parseAuthHash(hash: string): { accessToken: string; refreshToken: string } | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(raw)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (!accessToken || !refreshToken) return null
  return { accessToken, refreshToken }
}

export async function refreshToken(refresh_token: string) {
  const { data } = await apiClient.post('/api/auth/refresh', { refresh_token })
  return data as { access_token: string; refresh_token: string; expires_in: number }
}

export async function logout(refresh_token?: string) {
  await apiClient.post('/api/auth/logout', refresh_token ? { refresh_token } : {})
}

export async function devLogin(input: DevLoginInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<DevLoginResponse>>(
    '/api/auth/dev/login',
    input,
  )
  return data.data
}
