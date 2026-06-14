import { getLiveApiConfigHint, isLiveApiMode } from '@/lib/api/liveMode'
import type { User } from './types'
import * as apiAuth from './apiAuth'

export { isLiveApiMode, isLiveApiMode as isSupabaseConfigured } from '@/lib/api/liveMode'

export function authMode(): 'api' | 'local' {
  return isLiveApiMode() ? 'api' : 'local'
}

export function getAuthConfigHint(): string | null {
  return getLiveApiConfigHint()
}

export type SignInIntent = apiAuth.GoogleOAuthIntent

export async function signInWithGoogle(intent: SignInIntent = 'member'): Promise<void> {
  if (!isLiveApiMode()) {
    throw new Error(
      'Google sign-in requires VITE_USE_V1_API=true and instituteofsound-api running. See repo README.',
    )
  }
  apiAuth.startGoogleSignIn(intent)
}

export async function completeAuthCallback() {
  return apiAuth.completeApiAuthCallback()
}

export async function logout(): Promise<void> {
  if (isLiveApiMode()) {
    await apiAuth.apiLogout()
    return
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (isLiveApiMode()) {
    return apiAuth.apiGetCurrentUser()
  }
  return null
}

export { updateUserProfile, fetchUserProfile } from './profile'
export type { UpdateProfileInput } from './profile'

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  if (isLiveApiMode()) {
    return apiAuth.subscribeApiAuth(callback)
  }
  return () => {}
}
