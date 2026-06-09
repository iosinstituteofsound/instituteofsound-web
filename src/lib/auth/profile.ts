import { isLiveApiMode } from '@/lib/api/liveMode'
import { v1PatchMemberProfile } from '@/api/v1Phase4Client'
import { v1GetUserProfile } from '@/api/v1Phase5Client'
import type { User } from './types'

export const PROFILE_COLUMNS =
  'id, email, name, role, dashboard_persona, avatar_url, cover_url, username, bio, created_at'

export interface UpdateProfileInput {
  name?: string
  username?: string
  avatarUrl?: string
  coverUrl?: string
  bio?: string
  dashboardPersona?: User['dashboardPersona'] | null
}

export async function updateUserProfile(
  _userId: string,
  input: UpdateProfileInput,
): Promise<User> {
  if (!isLiveApiMode()) {
    throw new Error('Profile updates require the API. Set VITE_USE_V1_API=true and sign in with Google.')
  }

  const { user } = await v1PatchMemberProfile(input)
  return user
}

export async function fetchUserProfile(userId: string): Promise<User> {
  if (!isLiveApiMode()) {
    throw new Error('Profile reads require the API.')
  }

  const { user } = await v1GetUserProfile(userId)
  return user
}
