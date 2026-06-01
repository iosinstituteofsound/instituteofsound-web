import type { SupabaseClient } from '@supabase/supabase-js'
import { memberHandleFromUser } from '../../../src/lib/community/memberProfileService.js'
import { mapFeedRow, type FeedRow } from '../../../src/lib/community/feedRow.js'
import type { CommunityFeedPost } from '../../../src/lib/community/feedTypes.js'
import type { CommunityRank } from '../../../src/types/index.js'
import type { ViewerConnectionStatus } from '../../../src/lib/network/connectionTypes.js'
import type { UserRole, DashboardPersona } from '../../../src/lib/auth/types.js'
import type { PublicUserCrew } from '../../../src/lib/community/crewTypes.js'
import type { CrewRosterMember } from '../../../src/lib/community/crewTypes.js'

export type PublicMemberProfileDto = {
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

export type MemberActivityItemDto = {
  kind: 'db' | 'post'
  label: string
  detail: string
  amount?: number
  createdAt: string
}

export type MemberConnectionProfileDto = {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  followedAt: string
}

function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, '').toLowerCase()
}

export async function repoFetchPublicMemberProfile(
  supabase: SupabaseClient,
  handle: string,
): Promise<PublicMemberProfileDto | null> {
  const h = normalizeHandle(handle)
  if (!h) return null

  const { data, error } = await supabase.rpc('community_profile_public', { p_handle: h })
  if (error) throw new Error(error.message)

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
    connectionCount: Number(row.connection_count ?? 0),
    viewerIsFollowing: Boolean(row.viewer_is_following),
    viewerConnectionStatus: (row.viewer_connection_status as ViewerConnectionStatus) ?? 'none',
    profileRole: (row.profile_role as UserRole) ?? 'member',
    dashboardPersona: row.dashboard_persona
      ? (row.dashboard_persona as DashboardPersona)
      : undefined,
  }
}

export async function repoFetchMemberPosts(
  supabase: SupabaseClient,
  handle: string,
  limit: number,
): Promise<CommunityFeedPost[]> {
  const h = normalizeHandle(handle)
  if (!h) return []

  const { data, error } = await supabase.rpc('community_posts_by_handle', {
    p_handle: h,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: FeedRow) => mapFeedRow(row))
}

export async function repoFetchMemberActivity(
  supabase: SupabaseClient,
  handle: string,
  limit: number,
): Promise<MemberActivityItemDto[]> {
  const h = normalizeHandle(handle)
  if (!h) return []

  const { data, error } = await supabase.rpc('community_member_activity', {
    p_handle: h,
    lim: limit,
  })
  if (error) throw new Error(error.message)

  return (data ?? []).map(
    (row: {
      kind: string
      label: string
      detail: string
      amount: number | null
      created_at: string
    }) => ({
      kind: row.kind as MemberActivityItemDto['kind'],
      label: row.label,
      detail: row.detail,
      amount: row.amount ?? undefined,
      createdAt: row.created_at,
    }),
  )
}

async function resolveProfileIdByHandle(
  supabase: SupabaseClient,
  handle: string,
): Promise<string | null> {
  const h = normalizeHandle(handle)
  if (!h) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', h)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.id ?? null
}

export async function repoFetchMemberConnections(
  supabase: SupabaseClient,
  handle: string,
  mode: 'followers' | 'following',
  limit: number,
): Promise<MemberConnectionProfileDto[]> {
  const profileId = await resolveProfileIdByHandle(supabase, handle)
  if (!profileId) return []

  const selectKey = mode === 'followers' ? 'follower_id' : 'following_id'
  const matchKey = mode === 'followers' ? 'following_id' : 'follower_id'
  const { data: edges, error: edgeError } = await supabase
    .from('community_follows')
    .select(`${selectKey}, created_at`)
    .eq(matchKey, profileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (edgeError) throw new Error(edgeError.message)

  const ids = (edges ?? [])
    .map((row) => row[selectKey as keyof typeof row])
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
  if (ids.length === 0) return []

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url')
    .in('id', ids)

  if (profileError) throw new Error(profileError.message)

  const profileById = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      {
        userId: p.id,
        displayName: p.name ?? 'Member',
        handle: normalizeHandle(p.username ?? ''),
        avatarUrl: p.avatar_url ?? undefined,
      },
    ]),
  )

  const result: MemberConnectionProfileDto[] = []
  for (const edge of edges ?? []) {
    const id = edge[selectKey as keyof typeof edge]
    if (typeof id !== 'string') continue
    const p = profileById.get(id)
    if (!p || !p.handle) continue
    result.push({
      ...p,
      followedAt: String(edge.created_at ?? new Date().toISOString()),
    })
  }
  return result
}

export async function repoFetchPublishedArtistMeta(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ id: string; slug: string } | null> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('id, slug')
    .eq('user_id', userId)
    .eq('published', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  const slug = data?.slug?.trim()
  if (!data?.id || !slug) return null
  return { id: String(data.id), slug }
}

export async function repoFetchCrewForUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<PublicUserCrew | null> {
  const { data, error } = await supabase
    .from('community_crew_members')
    .select(
      `
      role,
      community_crews (
        id,
        name,
        slug,
        tagline,
        genre_slug,
        member_count,
        weekly_db
      )
    `,
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)

  const crew = data?.community_crews as
    | {
        id: string
        name: string
        slug: string
        tagline: string | null
        genre_slug: string | null
        member_count: number
        weekly_db: number | string
      }
    | null
    | undefined

  if (!crew || !data) return null

  return {
    crewId: String(crew.id),
    name: crew.name,
    slug: crew.slug,
    tagline: crew.tagline ?? undefined,
    genreSlug: crew.genre_slug ?? undefined,
    memberCount: crew.member_count,
    weeklyDb: Number(crew.weekly_db),
    role: (data.role === 'founder' ? 'founder' : 'member') as PublicUserCrew['role'],
  }
}

export async function repoFetchCrewRoster(
  supabase: SupabaseClient,
  crewId: string,
): Promise<CrewRosterMember[]> {
  const { data, error } = await supabase.rpc('community_crew_roster', { p_crew_id: crewId })
  if (error) throw new Error(error.message)

  return (data ?? []).map(
    (row: {
      user_id: string
      display_name: string
      handle: string
      avatar_url: string | null
      community_rank: string
      role: string
      weekly_db: number | string
    }) => ({
      userId: row.user_id,
      name: row.display_name,
      handle: row.handle.startsWith('@') ? row.handle : `@${row.handle}`,
      avatarUrl: row.avatar_url ?? undefined,
      rank: row.community_rank,
      role: row.role as CrewRosterMember['role'],
      weeklyDb: Number(row.weekly_db),
    }),
  )
}

export type OnlineConnectionDto = {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  lastSeenAt: string
}

export async function repoNetworkPingPresence(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc('network_ping_presence')
  if (error) throw new Error(error.message)
}

export async function repoNetworkOnlineConnections(
  supabase: SupabaseClient,
  windowMinutes: number,
): Promise<OnlineConnectionDto[]> {
  const { data, error } = await supabase.rpc('network_online_connections', {
    p_window_minutes: windowMinutes,
  })
  if (error) throw new Error(error.message)

  return (data ?? []).map((row: Record<string, unknown>) => ({
    userId: String(row.user_id),
    displayName: String(row.display_name),
    handle: String(row.handle).replace(/^@/, ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    lastSeenAt: String(row.last_seen_at),
  }))
}

export async function repoFetchNetworkHandleForUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, email')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return memberHandleFromUser({
    username: data.username ?? undefined,
    email: data.email ?? '',
  })
}
