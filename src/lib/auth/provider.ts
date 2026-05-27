import { getSupabaseConfigError, isSupabaseConfigured } from '@/lib/supabase/client'
import type { User } from './types'
import * as supabase from './supabaseAuth'

export { isSupabaseConfigured }

export function authMode(): 'supabase' | 'local' {
  return isSupabaseConfigured() ? 'supabase' : 'local'
}

export function getAuthConfigHint(): string | null {
  if (import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return getSupabaseConfigError()
  }
  return null
}

export type SignInIntent = 'member' | 'artist' | 'desk' | 'editor_apply'

export async function signInWithGoogle(intent: SignInIntent = 'member'): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Google sign-in needs Supabase in .env. See SUPABASE_SETUP.md — enable Google provider in dashboard.'
    )
  }
  return supabase.supabaseSignInWithGoogle(intent)
}

export async function completeAuthCallback() {
  return supabase.supabaseHandleAuthCallback()
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.supabaseLogout()
    return
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (isSupabaseConfigured()) {
    return supabase.supabaseGetCurrentUser()
  }
  return null
}

export { updateUserProfile, fetchUserProfile } from './profile'
export type { UpdateProfileInput } from './profile'

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  if (isSupabaseConfigured()) {
    return supabase.supabaseOnAuthChange(callback)
  }
  return () => {}
}
