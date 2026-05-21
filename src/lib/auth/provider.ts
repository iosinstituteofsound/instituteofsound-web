import { getSupabaseConfigError, isSupabaseConfigured } from '@/lib/supabase/client'
import type { LoginInput, RegisterInput, User } from './types'
import * as local from './storage'
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

export async function login(input: LoginInput): Promise<User> {
  if (isSupabaseConfigured()) {
    return supabase.supabaseLogin(input)
  }
  return local.loginUser(input.email, input.password).user
}

export async function register(input: RegisterInput): Promise<User> {
  if (isSupabaseConfigured()) {
    return supabase.supabaseRegister(input)
  }
  local.registerUser(input)
  return local.loginUser(input.email, input.password).user
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.supabaseLogout()
    return
  }
  local.logoutUser()
}

export async function getCurrentUser(): Promise<User | null> {
  if (isSupabaseConfigured()) {
    return supabase.supabaseGetCurrentUser()
  }
  local.seedDemoAccounts()
  const session = local.getSession()
  if (!session || new Date(session.expiresAt) < new Date()) {
    local.logoutUser()
    return null
  }
  return local.getUserById(session.userId)
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  if (isSupabaseConfigured()) {
    return supabase.supabaseOnAuthChange(callback)
  }
  return () => {}
}
