import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { COMMUNITY_CREW_EVENT, fetchMyCrew, fetchCrewRoster } from '@/lib/community/crewService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import type { CrewRosterMember, MyCrew } from '@/lib/community/crewTypes'

export function useMyCrew() {
  const { user } = useAuth()
  const [crew, setCrew] = useState<MyCrew | null>(null)
  const [roster, setRoster] = useState<CrewRosterMember[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setCrew(null)
      setRoster([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const mine = await fetchMyCrew()
      setCrew(mine)
      if (mine) {
        setRoster(await fetchCrewRoster(mine.crewId))
      } else {
        setRoster([])
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

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

  return { crew, roster, loading, refresh, isLoggedIn: Boolean(user?.id) }
}
