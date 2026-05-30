import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1GetSpinOfTheWeek, v1GetTribeRecentSpins } from '@/api/v1Phase5Client'
import { mapFeedRow, type FeedRow } from '@/lib/community/feedService'
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

  return viaV1Api(
    async () => {
      const { spin } = await v1GetSpinOfTheWeek()
      return spin
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('community_spin_of_the_week')

      if (error) {
        console.warn('[community] spin of week', error.message)
        return null
      }

      const row = (data ?? [])[0] as (FeedRow & { reaction_score?: number }) | undefined
      if (!row) return null

      const post = mapFeedRow(row)
      return {
        ...post,
        reactionScore: Number(row.reaction_score ?? 0),
      }
    },
  )
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

  return viaV1Api(
    async () => {
      const { posts } = await v1GetTribeRecentSpins(genreSlug, limit)
      return posts
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('community_tribe_recent_spins', {
        p_genre_slug: genreSlug,
        lim: limit,
      })

      if (error) {
        console.warn('[community] tribe spins', error.message)
        return []
      }

      return (data ?? []).map(mapFeedRow)
    },
  )
}

export async function fetchTribeSpotlightWinner(
  genreSlug: string
): Promise<LeaderboardEntry | null> {
  const board = await fetchGenreWeeklyLeaderboard(genreSlug, 1)
  return board[0] ?? null
}
