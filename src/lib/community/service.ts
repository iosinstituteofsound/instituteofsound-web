import { isSupabaseConfigured } from '@/lib/supabase/client'
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

const FALLBACK_GENRES: CommunityGenre[] = [
  { id: 'rock', slug: 'rock', name: 'Rock' },
  { id: 'metal', slug: 'metal', name: 'Metal' },
  { id: 'industrial', slug: 'industrial', name: 'Industrial' },
  { id: 'techno', slug: 'techno', name: 'Techno' },
  { id: 'electronic', slug: 'electronic', name: 'Electronic' },
]

export async function fetchWeeklyLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) return []

  const { entries } = await v1GetWeeklyLeaderboard(limit)
  return entries
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

  const { stats } = await v1GetMemberStats(userId)
  return stats
}

export async function fetchCommunityGenres(): Promise<CommunityGenre[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_GENRES
  }

  const { genres } = await v1GetCommunityGenres()
  return genres.length ? genres : FALLBACK_GENRES
}

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

  const { entries } = await v1GetGenreLeaderboard(genreSlug, limit)
  return entries
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

  const { rank } = await v1GetGenreRank(genreSlug, userId)
  return rank
}

export async function setPrimaryGenre(_userId: string, genreId: string, genreSlug: string): Promise<void> {
  localSetGenreSlug(genreSlug)
  setCommunityGenreId(genreId)

  if (!isSupabaseConfigured()) {
    window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
    return
  }

  await v1SetPrimaryGenre(genreId)
  window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
}

export async function fetchUserBadges(userId: string): Promise<EarnedBadge[]> {
  if (!isSupabaseConfigured()) {
    return localListBadges()
  }

  const { badges } = await v1GetUserBadges(userId)
  return badges
}

export function needsCommunityOnboarding(stats: CommunityMemberStats | null): boolean {
  return stats !== null && !stats.primaryGenreSlug
}
