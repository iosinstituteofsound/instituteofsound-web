import { isSupabaseConfigured } from '@/lib/supabase/client'
import { v1PatchMemberProfile } from '@/api/v1Phase4Client'
import { v1GetUserProfile } from '@/api/v1Phase5Client'
import type { User } from './types'

export const PROFILE_COLUMNS =
  'id, email, name, role, dashboard_persona, avatar_url, username, bio, created_at'

export interface UpdateProfileInput {
  name?: string
  username?: string
  avatarUrl?: string
  bio?: string
  dashboardPersona?: User['dashboardPersona'] | null
}

export async function updateUserProfile(
  _userId: string,
  input: UpdateProfileInput,
): Promise<User> {
  if (!isSupabaseConfigured()) {
    throw new Error('Profile updates require Supabase. Configure .env and sign in with Google.')
  }

  const { user } = await v1PatchMemberProfile(input)
  return user
}

export async function fetchUserProfile(userId: string): Promise<User> {
  if (!isSupabaseConfigured()) {
    throw new Error('Profile reads require Supabase.')
  }

  const { user } = await v1GetUserProfile(userId)
  return user
}
