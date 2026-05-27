import { useCallback, useEffect, useState } from 'react'
import { COMMUNITY_CREW_EVENT } from '@/lib/community/crewService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import { fetchCrewWarsV2, type CrewWarsEntry } from '@/lib/community/wireEvents'

export function useCrewWarsBoard(limit = 15) {
  const [entries, setEntries] = useState<CrewWarsEntry[]>([])
  const [loading, setLoading] = useState(true)
  const seasonLabel = entries[0]?.seasonLabel ?? ''

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await fetchCrewWarsV2(limit)
      setEntries(rows)
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

  return { entries, loading, seasonLabel, refresh }
}
