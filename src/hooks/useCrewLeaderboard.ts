import { useCallback, useEffect, useState } from 'react'
import { COMMUNITY_CREW_EVENT, fetchCrewWeeklyLeaderboard } from '@/lib/community/crewService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import type { CrewLeaderboardEntry } from '@/lib/community/crewTypes'

export function useCrewLeaderboard(limit = 15) {
  const [entries, setEntries] = useState<CrewLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setEntries(await fetchCrewWeeklyLeaderboard(limit))
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void refresh()
    const onChange = () => void refresh()
    window.addEventListener(COMMUNITY_CREW_EVENT, onChange)
    window.addEventListener(COMMUNITY_DB_EVENT, onChange)
    return () => {
      window.removeEventListener(COMMUNITY_CREW_EVENT, onChange)
      window.removeEventListener(COMMUNITY_DB_EVENT, onChange)
    }
  }, [refresh])

  return { entries, loading, refresh }
}
