import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1PatchMemberProfile } from '@/api/v1Phase4Client'
import { mapProfile, type ProfileRow } from '@/lib/supabase/mappers'
import type { User } from './types'
import { normalizeUsername, validateUsername } from './username'

export const PROFILE_COLUMNS =
  'id, email, name, role, dashboard_persona, avatar_url, username, bio, created_at'

export interface UpdateProfileInput {
  name?: string
  username?: string
  avatarUrl?: string
  bio?: string
  dashboardPersona?: User['dashboardPersona'] | null
}

async function directUpdateUserProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<User> {
  if (!isSupabaseConfigured()) {
    throw new Error('Profile updates require Supabase. Configure .env and sign in with Google.')
  }

  const current = await fetchUserProfile(userId)
  const patch: Record<string, string | null> = {}

  if (input.name !== undefined) {
    const name = input.name.trim()
    if (name.length < 2) throw new Error('Display name must be at least 2 characters.')
    patch.name = name
  }

  if (input.username !== undefined) {
    const username = normalizeUsername(input.username)
    const err = validateUsername(username, { role: current.role })
    if (err) throw new Error(err)
    patch.username = username
  }

  if (input.avatarUrl !== undefined) {
    patch.avatar_url = input.avatarUrl.trim() || null
  }

  if (input.bio !== undefined) {
    patch.bio = input.bio.trim().slice(0, 280) || null
  }

  if (input.dashboardPersona !== undefined) {
    patch.dashboard_persona = input.dashboardPersona
  }

  if (Object.keys(patch).length === 0) {
    return current
  }

  if (patch.username) {
    const supabase = getSupabase()
    const { data: conflict } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', patch.username)
      .neq('id', userId)
      .maybeSingle()
    if (conflict) throw new Error('This username is already taken. Try another.')
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  const updated = mapProfile(data as ProfileRow)

  if (patch.name) {
    await supabase
      .from('editorial_drafts')
      .update({ editor_name: patch.name })
      .eq('editor_id', userId)
  }

  return updated
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<User> {
  if (!isSupabaseConfigured()) {
    throw new Error('Profile updates require Supabase. Configure .env and sign in with Google.')
  }

  return viaV1Api(
    async () => {
      const { user } = await v1PatchMemberProfile(input)
      return user
    },
    () => directUpdateUserProfile(userId, input),
  )
}

export async function fetchUserProfile(userId: string): Promise<User> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return mapProfile(data as ProfileRow)
}
