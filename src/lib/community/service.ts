import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import {
  v1GetCommunityGenres,
  v1GetGenreLeaderboard,
  v1GetGenreRank,
  v1GetMemberStats,
  v1GetUserBadges,
  v1GetWeeklyLeaderboard,
  v1SetPrimaryGenre,
} from '@/api/v1Phase4Client'
import {
  dbToNextRank,
  rankFromDb,
  rankProgressPercent,
  nextRankAfter,
} from '@/lib/community/ranks'
import { localGetTotalDb } from '@/lib/community/localDb'
import { localGetGenreSlug, localListBadges, localSetGenreSlug } from '@/lib/community/localCommunity'
import type { CommunityRank } from '@/types'
import type { CommunityBadgeSlug } from '@/lib/community/badges'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import { setCommunityGenreId } from '@/lib/community/genreContext'

export interface LeaderboardEntry {
  userId: string
  name: string
  handle: string
  avatarUrl?: string
  weeklyDb: number
  totalDb: number
  rank: CommunityRank
}

export interface CommunityMemberStats {
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

export interface CommunityGenre {
  id: string
  slug: string
  name: string
}

export interface EarnedBadge {
  slug: CommunityBadgeSlug
  name: string
  description: string
  earnedAt: string
}

function mapLeaderboardRow(row: {
  user_id: string
  display_name: string
  handle: string
  avatar_url: string | null
  weekly_db: number | string
  total_db: number
  community_rank: string
}): LeaderboardEntry {
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

async function directFetchWeeklyLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_weekly_leaderboard', { lim: limit })

  if (error) {
    console.warn('[community] leaderboard', error.message)
    return []
  }

  return (data ?? []).map(mapLeaderboardRow)
}

export async function fetchWeeklyLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) return []

  return viaV1Api(
    async () => {
      const { entries } = await v1GetWeeklyLeaderboard(limit)
      return entries
    },
    () => directFetchWeeklyLeaderboard(limit),
  )
}

export async function fetchMemberStats(userId: string): Promise<CommunityMemberStats | null> {
  if (!isSupabaseConfigured()) {
    const totalDb = localGetTotalDb()
    const rank = rankFromDb(totalDb)
    return {
      userId,
      name: 'You',
      handle: '@member',
      totalDb,
      weeklyDb: totalDb,
      rank,
      nextRank: nextRankAfter(rank),
      dbToNextRank: dbToNextRank(totalDb),
      rankProgressPct: rankProgressPercent(totalDb),
      primaryGenreSlug: localGetGenreSlug() ?? undefined,
    }
  }

  return viaV1Api(
    async () => {
      const { stats } = await v1GetMemberStats(userId)
      return stats
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('community_member_stats', {
        p_user_id: userId,
      })

      if (error) {
        console.warn('[community] member stats', error.message)
        return null
      }

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
    },
  )
}

export async function fetchCommunityGenres(): Promise<CommunityGenre[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_GENRES
  }

  return viaV1Api(
    async () => {
      const { genres } = await v1GetCommunityGenres()
      return genres.length ? genres : FALLBACK_GENRES
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('community_genres')
        .select('id, slug, name')
        .eq('active', true)
        .order('sort_order')

      if (error) {
        console.warn('[community] genres', error.message)
        return FALLBACK_GENRES
      }

      return (data ?? []).map((g) => ({
        id: g.id,
        slug: g.slug,
        name: g.name,
      }))
    },
  )
}

const FALLBACK_GENRES: CommunityGenre[] = [
  { id: 'rock', slug: 'rock', name: 'Rock' },
  { id: 'metal', slug: 'metal', name: 'Metal' },
  { id: 'industrial', slug: 'industrial', name: 'Industrial' },
  { id: 'techno', slug: 'techno', name: 'Techno' },
  { id: 'electronic', slug: 'electronic', name: 'Electronic' },
]

export async function syncCommunityGenreFromProfile(userId: string): Promise<void> {
  const stats = await fetchMemberStats(userId)
  if (!stats?.primaryGenreSlug) {
    setCommunityGenreId(null)
    return
  }
  const genres = await fetchCommunityGenres()
  const match = genres.find((g) => g.slug === stats.primaryGenreSlug)
  setCommunityGenreId(match?.id ?? null)
}

export async function fetchGenreWeeklyLeaderboard(
  genreSlug: string,
  limit = 15
): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    const slug = localGetGenreSlug()
    if (slug !== genreSlug) return []
    const totalDb = localGetTotalDb()
    if (totalDb <= 0) return []
    return [
      {
        userId: 'local-user',
        name: 'You',
        handle: '@member',
        weeklyDb: totalDb,
        totalDb,
        rank: rankFromDb(totalDb),
      },
    ]
  }

  return viaV1Api(
    async () => {
      const { entries } = await v1GetGenreLeaderboard(genreSlug, limit)
      return entries
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('community_genre_weekly_leaderboard', {
        p_genre_slug: genreSlug,
        lim: limit,
      })

      if (error) {
        console.warn('[community] genre leaderboard', genreSlug, error.message)
        return []
      }

      return (data ?? []).map(mapLeaderboardRow)
    },
  )
}

export async function fetchGenreWeeklyRank(
  genreSlug: string,
  userId: string
): Promise<number | null> {
  if (!isSupabaseConfigured()) {
    const slug = localGetGenreSlug()
    if (slug !== genreSlug) return null
    return localGetTotalDb() > 0 ? 1 : null
  }

  return viaV1Api(
    async () => {
      const { rank } = await v1GetGenreRank(genreSlug, userId)
      return rank
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('community_genre_weekly_rank', {
        p_genre_slug: genreSlug,
        p_user_id: userId,
      })

      if (error) {
        console.warn('[community] genre rank', error.message)
        return null
      }

      return typeof data === 'number' ? data : null
    },
  )
}

export async function setPrimaryGenre(userId: string, genreId: string, genreSlug: string): Promise<void> {
  localSetGenreSlug(genreSlug)
  setCommunityGenreId(genreId)

  if (!isSupabaseConfigured()) {
    window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
    return
  }

  await viaV1Api(
    () => v1SetPrimaryGenre(genreId),
    async () => {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('profiles')
        .update({ primary_genre_id: genreId })
        .eq('id', userId)

      if (error) throw new Error(error.message)
    },
  )
  window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
}

export async function fetchUserBadges(userId: string): Promise<EarnedBadge[]> {
  if (!isSupabaseConfigured()) {
    return localListBadges()
  }

  return viaV1Api(
    async () => {
      const { badges } = await v1GetUserBadges(userId)
      return badges
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('community_user_badges_list', {
        p_user_id: userId,
      })

      if (error) {
        console.warn('[community] badges', error.message)
        return []
      }

      return (data ?? []).map(
        (row: { slug: string; name: string; description: string; earned_at: string }) => ({
          slug: row.slug as CommunityBadgeSlug,
          name: row.name,
          description: row.description,
          earnedAt: row.earned_at,
        }),
      )
    },
  )
}

export function needsCommunityOnboarding(stats: CommunityMemberStats | null): boolean {
  return stats !== null && !stats.primaryGenreSlug
}
