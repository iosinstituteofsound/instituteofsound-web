import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetSpinOfTheWeek, v1GetTribeRecentSpins } from '@/api/v1Phase5Client'
import { localApplyReactions, localListFeed } from '@/lib/community/localFeed'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import {
  fetchGenreWeeklyLeaderboard,
  type LeaderboardEntry,
} from '@/lib/community/service'

export interface SpinOfTheWeek extends CommunityFeedPost {
  reactionScore: number
}

function pickLocalSpinOfWeek(): SpinOfTheWeek | null {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const spins = localApplyReactions(localListFeed(50)).filter(
    (p) => p.kind === 'spin' && p.status === 'visible' && new Date(p.createdAt).getTime() >= weekAgo
  )
  if (spins.length === 0) return null

  const scored = spins.map((p) => {
    const r = p.reactions ?? { fire: 0, headphones: 0, bolt: 0 }
    return {
      post: p,
      score: r.fire + r.headphones + r.bolt,
    }
  })
  scored.sort((a, b) => b.score - a.score || b.post.createdAt.localeCompare(a.post.createdAt))
  const top = scored.find((s) => s.score > 0) ?? scored[0]
  if (!top) return null
  return { ...top.post, reactionScore: top.score }
}

export async function fetchSpinOfTheWeek(): Promise<SpinOfTheWeek | null> {
  if (!isSupabaseConfigured()) return pickLocalSpinOfWeek()

  const { spin } = await v1GetSpinOfTheWeek()
  return spin
}

export async function fetchTribeRecentSpins(
  genreSlug: string,
  limit = 3
): Promise<CommunityFeedPost[]> {
  if (!genreSlug) return []

  if (!isSupabaseConfigured()) {
    const weekPosts = localApplyReactions(localListFeed(40)).filter(
      (p) =>
        p.kind === 'spin' &&
        p.status === 'visible' &&
        p.primaryGenreSlug === genreSlug
    )
    return weekPosts.slice(0, limit)
  }

  const { posts } = await v1GetTribeRecentSpins(genreSlug, limit)
  return posts
}

export async function fetchTribeSpotlightWinner(
  genreSlug: string
): Promise<LeaderboardEntry | null> {
  const board = await fetchGenreWeeklyLeaderboard(genreSlug, 1)
  return board[0] ?? null
}
