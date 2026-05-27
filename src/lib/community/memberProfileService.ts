import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { mapFeedRow, type FeedRow } from '@/lib/community/feedService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { CommunityRank } from '@/types'
import type { User } from '@/lib/auth/types'

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
  viewerIsFollowing: boolean
}

export interface MemberActivityItem {
  kind: 'db' | 'post'
  label: string
  detail: string
  amount?: number
  createdAt: string
}

export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, '').toLowerCase()
}

export async function fetchPublicMemberProfile(
  handle: string
): Promise<PublicMemberProfile | null> {
  const h = normalizeHandle(handle)
  if (!h) return null

  if (!isSupabaseConfigured()) return null

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_profile_public', { p_handle: h })

  if (error) {
    console.warn('[community] profile', error.message)
    return null
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null

  return {
    userId: row.user_id,
    displayName: row.display_name,
    handle: row.handle.startsWith('@') ? row.handle : `@${row.handle}`,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    totalDb: row.total_db,
    weeklyDb: Number(row.weekly_db),
    rank: row.community_rank as CommunityRank,
    primaryGenreSlug: row.primary_genre_slug ?? undefined,
    memberSince: row.member_since,
    postCount: Number(row.post_count),
    followerCount: Number(row.follower_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
    viewerIsFollowing: Boolean(row.viewer_is_following),
  }
}

export async function fetchMemberPosts(handle: string, limit = 30): Promise<CommunityFeedPost[]> {
  const h = normalizeHandle(handle)
  if (!h || !isSupabaseConfigured()) return []

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_posts_by_handle', {
    p_handle: h,
    lim: limit,
  })

  if (error) {
    console.warn('[community] member posts', error.message)
    return []
  }

  return (data ?? []).map((row: FeedRow) => mapFeedRow(row))
}

export async function fetchMemberActivity(
  handle: string,
  limit = 25
): Promise<MemberActivityItem[]> {
  const h = normalizeHandle(handle)
  if (!h || !isSupabaseConfigured()) return []

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_member_activity', {
    p_handle: h,
    lim: limit,
  })

  if (error) {
    console.warn('[community] member activity', error.message)
    return []
  }

  return (data ?? []).map(
    (row: { kind: string; label: string; detail: string; amount: number | null; created_at: string }) => ({
      kind: row.kind as MemberActivityItem['kind'],
      label: row.label,
      detail: row.detail,
      amount: row.amount ?? undefined,
      createdAt: row.created_at,
    })
  )
}
