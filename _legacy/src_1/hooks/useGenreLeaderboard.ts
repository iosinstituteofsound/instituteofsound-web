import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeCommunityDb } from '@/lib/community/events'
import {
  fetchGenreWeeklyLeaderboard,
  fetchGenreWeeklyRank,
  type LeaderboardEntry,
} from '@/lib/community/service'

export function useGenreLeaderboard(genreSlug: string | null, limit = 15) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [yourRank, setYourRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!genreSlug) {
      setEntries([])
      setYourRank(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [board, rank] = await Promise.all([
        fetchGenreWeeklyLeaderboard(genreSlug, limit),
        user?.id ? fetchGenreWeeklyRank(genreSlug, user.id) : Promise.resolve(null),
      ])
      setEntries(board)
      setYourRank(rank)
    } finally {
      setLoading(false)
    }
  }, [genreSlug, limit, user?.id])

  useEffect(() => {
    void refresh()
    return subscribeCommunityDb(() => void refresh())
  }, [refresh])

  return { entries, yourRank, loading, refresh }
}
