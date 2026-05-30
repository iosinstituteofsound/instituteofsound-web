import type { SupabaseClient } from '@supabase/supabase-js'
import { mapFeedRow, type FeedRow } from '../../../src/lib/community/feedRow.js'
import type { CommunityFeedPost } from '../../../src/lib/community/feedTypes.js'
import type { PostComment } from '../../../src/lib/community/commentTypes.js'
import type { CommunityNotification, NotificationKind } from '../../../src/lib/community/localNotifications.js'
import type { CommunityRank } from '../../../src/types/index.js'
import type { CommunityBadgeSlug } from '../../../src/lib/community/badges.js'

export type LeaderboardEntryDto = {
  userId: string
  name: string
  handle: string
  avatarUrl?: string
  weeklyDb: number
  totalDb: number
  rank: CommunityRank
}

export type CommunityMemberStatsDto = {
  userId: string
  name: string
  handle: string
  avatarUrl?: string
  totalDb: number
  weeklyDb: number
  rank: CommunityRank
  nextRank: CommunityRank | null
  dbToNextRank: number
  rankProgressPct: number
  primaryGenreSlug?: string
}

export type CommunityGenreDto = { id: string; slug: string; name: string }

export type EarnedBadgeDto = {
  slug: CommunityBadgeSlug
  name: string
  description: string
  earnedAt: string
}

type CommentRow = {
  id: string
  post_id: string
  user_id: string
  parent_id?: string | null
  body: string
  created_at: string
  display_name: string
  handle: string
  avatar_url: string | null
}

function mapComment(row: CommentRow): PostComment {
  const handle = row.handle.startsWith('@') ? row.handle : `@${row.handle}`
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    parentId: row.parent_id ?? undefined,
    body: row.body,
    createdAt: row.created_at,
    displayName: row.display_name,
    handle,
    avatarUrl: row.avatar_url ?? undefined,
  }
}

function mapLeaderboardRow(row: {
  user_id: string
  display_name: string
  handle: string
  avatar_url: string | null
  weekly_db: number | string
  total_db: number
  community_rank: string
}): LeaderboardEntryDto {
  return {
    userId: row.user_id,
    name: row.display_name,
    handle: row.handle.startsWith('@') ? row.handle : `@${row.handle}`,
    avatarUrl: row.avatar_url ?? undefined,
    weeklyDb: Number(row.weekly_db),
    totalDb: row.total_db,
    rank: row.community_rank as CommunityRank,
  }
}

type NotificationRow = {
  id: string
  kind: string
  title: string
  body: string | null
  href: string | null
  actor_id: string | null
  actor_name: string | null
  actor_handle: string | null
  actor_avatar_url: string | null
  read_at: string | null
  created_at: string
}

function mapNotification(row: NotificationRow): CommunityNotification {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body ?? undefined,
    href: row.href ?? undefined,
    actorId: row.actor_id ?? undefined,
    actorName: row.actor_name ?? undefined,
    actorHandle: row.actor_handle ?? undefined,
    actorAvatarUrl: row.actor_avatar_url ?? undefined,
    readAt: row.read_at ?? undefined,
    createdAt: row.created_at,
  }
}

export async function repoToggleFollow(
  supabase: SupabaseClient,
  targetUserId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('community_toggle_follow', {
    p_target_user_id: targetUserId,
  })
  if (error) throw new Error(error.message)
  return Boolean(data)
}

export async function repoIsFollowingUser(
  supabase: SupabaseClient,
  uid: string,
  targetUserId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('community_follows')
    .select('follower_id')
    .eq('follower_id', uid)
    .eq('following_id', targetUserId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return Boolean(data)
}

export async function repoListPostComments(
  supabase: SupabaseClient,
  postId: string,
  limit: number,
): Promise<PostComment[]> {
  const { data, error } = await supabase.rpc('community_post_comments_list', {
    p_post_id: postId,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: CommentRow) => mapComment(row))
}

export async function repoAddPostComment(
  supabase: SupabaseClient,
  postId: string,
  body: string,
  parentId?: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('community_post_comments_add', {
    p_post_id: postId,
    p_body: body,
    p_parent_id: parentId ?? null,
  })
  if (error) throw new Error(error.message)
  return String(data)
}

export async function repoDeletePostComment(
  supabase: SupabaseClient,
  commentId: string,
): Promise<void> {
  const { error } = await supabase.rpc('community_post_comments_delete', {
    p_comment_id: commentId,
  })
  if (error) throw new Error(error.message)
}

export async function repoFetchNotifications(
  supabase: SupabaseClient,
  limit: number,
): Promise<CommunityNotification[]> {
  const { data, error } = await supabase.rpc('community_notifications_list', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapNotification)
}

export async function repoFetchUnreadNotificationCount(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.rpc('community_notifications_unread_count')
  if (error) throw new Error(error.message)
  return Number(data ?? 0)
}

export async function repoMarkNotificationsRead(
  supabase: SupabaseClient,
  ids?: string[],
): Promise<void> {
  const { error } = await supabase.rpc('community_notifications_mark_read', {
    p_ids: ids?.length ? ids : null,
  })
  if (error) throw new Error(error.message)
}

export async function repoFetchWeeklyLeaderboard(
  supabase: SupabaseClient,
  limit: number,
): Promise<LeaderboardEntryDto[]> {
  const { data, error } = await supabase.rpc('community_weekly_leaderboard', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapLeaderboardRow)
}

export async function repoFetchMemberStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<CommunityMemberStatsDto | null> {
  const { data, error } = await supabase.rpc('community_member_stats', { p_user_id: userId })
  if (error) throw new Error(error.message)
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  return {
    userId: row.user_id,
    name: row.display_name,
    handle: row.handle.startsWith('@') ? row.handle : `@${row.handle}`,
    avatarUrl: row.avatar_url ?? undefined,
    totalDb: row.total_db,
    weeklyDb: Number(row.weekly_db),
    rank: row.community_rank as CommunityRank,
    nextRank: (row.next_rank as CommunityRank | null) ?? null,
    dbToNextRank: row.db_to_next_rank,
    rankProgressPct: row.rank_progress_pct,
    primaryGenreSlug: row.primary_genre_slug ?? undefined,
  }
}

export async function repoFetchCommunityGenres(supabase: SupabaseClient): Promise<CommunityGenreDto[]> {
  const { data, error } = await supabase
    .from('community_genres')
    .select('id, slug, name')
    .eq('active', true)
    .order('sort_order')
  if (error) throw new Error(error.message)
  return (data ?? []).map((g) => ({ id: g.id, slug: g.slug, name: g.name }))
}

export async function repoSetPrimaryGenre(
  supabase: SupabaseClient,
  userId: string,
  genreId: string,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ primary_genre_id: genreId })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}

export async function repoFetchUserBadges(
  supabase: SupabaseClient,
  userId: string,
): Promise<EarnedBadgeDto[]> {
  const { data, error } = await supabase.rpc('community_user_badges_list', {
    p_user_id: userId,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map(
    (row: { slug: string; name: string; description: string; earned_at: string }) => ({
      slug: row.slug as CommunityBadgeSlug,
      name: row.name,
      description: row.description,
      earnedAt: row.earned_at,
    }),
  )
}

export async function repoFetchGenreWeeklyLeaderboard(
  supabase: SupabaseClient,
  genreSlug: string,
  limit: number,
): Promise<LeaderboardEntryDto[]> {
  const { data, error } = await supabase.rpc('community_genre_weekly_leaderboard', {
    p_genre_slug: genreSlug,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapLeaderboardRow)
}

export async function repoFetchGenreWeeklyRank(
  supabase: SupabaseClient,
  genreSlug: string,
  userId: string,
): Promise<number | null> {
  const { data, error } = await supabase.rpc('community_genre_weekly_rank', {
    p_genre_slug: genreSlug,
    p_user_id: userId,
  })
  if (error) throw new Error(error.message)
  return typeof data === 'number' ? data : null
}

export async function repoFetchMemberPostsByHandle(
  supabase: SupabaseClient,
  handle: string,
  limit: number,
): Promise<CommunityFeedPost[]> {
  const h = handle.trim().replace(/^@/, '').toLowerCase()
  const { data, error } = await supabase.rpc('community_posts_by_handle', {
    p_handle: h,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: FeedRow) => mapFeedRow(row))
}
