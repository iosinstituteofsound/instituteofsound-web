import { useCallback, useEffect, useState } from 'react'
import { fetchCommunityFeed, type CommunityFeedPost } from '@/lib/community/feedService'
import { fetchCrewWeeklyLeaderboard } from '@/lib/community/crewService'
import type { CrewLeaderboardEntry } from '@/lib/community/crewTypes'
import { fetchTribeWarMonthly, type TribeWarStanding } from '@/lib/community/wireEvents'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'

function spinEngagement(post: CommunityFeedPost): number {
  const r = post.reactions
  return r.fire + r.headphones + r.bolt + (post.commentCount ?? 0) * 2
}

export function useDiscoverPulse() {
  const [tribes, setTribes] = useState<TribeWarStanding[]>([])
  const [spins, setSpins] = useState<CommunityFeedPost[]>([])
  const [crews, setCrews] = useState<CrewLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [war, feed, crewBoard] = await Promise.all([
        fetchTribeWarMonthly(),
        fetchCommunityFeed({ limit: 24, kind: 'spin' }),
        fetchCrewWeeklyLeaderboard(8),
      ])
      setTribes(war.slice(0, 6))
      setSpins(
        [...feed].sort((a, b) => spinEngagement(b) - spinEngagement(a)).slice(0, 8)
      )
      setCrews(crewBoard)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const onDb = () => void refresh()
    window.addEventListener(COMMUNITY_DB_EVENT, onDb)
    return () => window.removeEventListener(COMMUNITY_DB_EVENT, onDb)
  }, [refresh])

  return { tribes, spins, crews, loading, refresh }
}
