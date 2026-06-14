import { useCallback, useEffect, useState } from 'react'
import { COMMUNITY_FEED_EVENT } from '@/lib/community/feedService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { LeaderboardEntry } from '@/lib/community/service'
import {
  fetchTribeRecentSpins,
  fetchTribeSpotlightWinner,
} from '@/lib/community/wireHighlights'

export function useTribeSpotlight(genreSlug: string | null) {
  const [winner, setWinner] = useState<LeaderboardEntry | null>(null)
  const [spins, setSpins] = useState<CommunityFeedPost[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!genreSlug) {
      setWinner(null)
      setSpins([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [w, recent] = await Promise.all([
        fetchTribeSpotlightWinner(genreSlug),
        fetchTribeRecentSpins(genreSlug, 3),
      ])
      setWinner(w)
      setSpins(recent)
    } finally {
      setLoading(false)
    }
  }, [genreSlug])

  useEffect(() => {
    void refresh()
    const onUpdate = () => void refresh()
    window.addEventListener(COMMUNITY_FEED_EVENT, onUpdate)
    window.addEventListener(COMMUNITY_DB_EVENT, onUpdate)
    return () => {
      window.removeEventListener(COMMUNITY_FEED_EVENT, onUpdate)
      window.removeEventListener(COMMUNITY_DB_EVENT, onUpdate)
    }
  }, [refresh])

  return { winner, spins, loading, refresh }
}
