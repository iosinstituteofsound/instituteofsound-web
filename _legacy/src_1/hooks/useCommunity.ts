import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeCommunityDb } from '@/lib/community/events'
import {
  fetchMemberStats,
  fetchWeeklyLeaderboard,
  type CommunityMemberStats,
  type LeaderboardEntry,
} from '@/lib/community/service'

export function useCommunityLeaderboard(limit = 20) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setEntries(await fetchWeeklyLeaderboard(limit))
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void refresh()
    return subscribeCommunityDb(() => void refresh())
  }, [refresh])

  return { entries, loading, refresh }
}

export function useCommunityMemberStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<CommunityMemberStats | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setStats(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setStats(await fetchMemberStats(user.id))
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void refresh()
    return subscribeCommunityDb(() => void refresh())
  }, [refresh])

  return { stats, loading, refresh, isLoggedIn: Boolean(user?.id) }
}
