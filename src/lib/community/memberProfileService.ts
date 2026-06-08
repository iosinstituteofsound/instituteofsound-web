import { isSupabaseConfigured } from '@/lib/api/liveMode'
import {
  v1GetNetworkProfile,
  v1GetNetworkProfileActivity,
  v1GetNetworkProfileFollowers,
  v1GetNetworkProfileFollowing,
  v1GetNetworkProfilePosts,
} from '@/api/v1Client'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { CommunityRank } from '@/types'
import type { ViewerConnectionStatus } from '@/lib/network/connectionTypes'
import type { UserRole, DashboardPersona, User } from '@/lib/auth/types'

export function memberHandleFromUser(user: Pick<User, 'username' | 'email'>): string {
  if (user.username?.trim()) return normalizeHandle(user.username)
  const local = user.email?.split('@')[0] ?? 'member'
  return local.replace(/[^a-z0-9_]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase() || 'member'
}

export interface PublicMemberProfile {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  bio?: string
  totalDb: number
  weeklyDb: number
  rank: CommunityRank
  primaryGenreSlug?: string
  memberSince: string
  postCount: number
  followerCount: number
  followingCount: number
  connectionCount: number
  viewerIsFollowing: boolean
  viewerConnectionStatus: ViewerConnectionStatus
  profileRole: UserRole
  dashboardPersona?: DashboardPersona
}

export interface MemberActivityItem {
  kind: 'db' | 'post'
  label: string
  detail: string
  amount?: number
  createdAt: string
}

export interface MemberConnectionProfile {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  followedAt: string
}

export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, '').toLowerCase()
}

export async function fetchPublicMemberProfile(
  handle: string,
): Promise<PublicMemberProfile | null> {
  if (!isSupabaseConfigured()) return null
  const { profile } = await v1GetNetworkProfile(handle)
  return profile
}

export async function fetchMemberPosts(handle: string, limit = 30): Promise<CommunityFeedPost[]> {
  if (!isSupabaseConfigured()) return []
  const { posts } = await v1GetNetworkProfilePosts(handle, limit)
  return posts
}

export async function fetchMemberActivity(
  handle: string,
  limit = 25,
): Promise<MemberActivityItem[]> {
  if (!isSupabaseConfigured()) return []
  const { activity } = await v1GetNetworkProfileActivity(handle, limit)
  return activity
}

type ConnectionMode = 'followers' | 'following'

export async function fetchMemberConnections(
  handle: string,
  mode: ConnectionMode,
  limit = 80,
): Promise<MemberConnectionProfile[]> {
  if (!isSupabaseConfigured()) return []
  const { connections } =
    mode === 'followers'
      ? await v1GetNetworkProfileFollowers(handle, limit)
      : await v1GetNetworkProfileFollowing(handle, limit)
  return connections
}
