import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  COMMUNITY_CHALLENGE_EVENT,
  fetchWeeklyChallenges,
  type WeeklyChallenge,
} from '@/lib/community/challengeService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import { COMMUNITY_CREW_EVENT } from '@/lib/community/crewService'
import { COMMUNITY_FEED_EVENT } from '@/lib/community/feedService'

export function useWeeklyChallenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setChallenges([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setChallenges(await fetchWeeklyChallenges())
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void refresh()
    const onChange = () => void refresh()
    window.addEventListener(COMMUNITY_CHALLENGE_EVENT, onChange)
    window.addEventListener(COMMUNITY_DB_EVENT, onChange)
    window.addEventListener(COMMUNITY_CREW_EVENT, onChange)
    window.addEventListener(COMMUNITY_FEED_EVENT, onChange)
    return () => {
      window.removeEventListener(COMMUNITY_CHALLENGE_EVENT, onChange)
      window.removeEventListener(COMMUNITY_DB_EVENT, onChange)
      window.removeEventListener(COMMUNITY_CREW_EVENT, onChange)
      window.removeEventListener(COMMUNITY_FEED_EVENT, onChange)
    }
  }, [refresh])

  return { challenges, loading, refresh, isLoggedIn: Boolean(user?.id) }
}
