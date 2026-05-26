import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  dbToNextRank,
  rankFromDb,
  rankProgressPercent,
  nextRankAfter,
} from '@/lib/community/ranks'
import { localGetTotalDb } from '@/lib/community/localDb'
import type { CommunityRank } from '@/types'

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

export async function fetchWeeklyLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_weekly_leaderboard', { lim: limit })

  if (error) {
    console.warn('[community] leaderboard', error.message)
    return []
  }

  return (data ?? []).map(mapLeaderboardRow)
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
    }
  }

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
}
