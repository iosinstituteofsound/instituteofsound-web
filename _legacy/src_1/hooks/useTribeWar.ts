import { useCallback, useEffect, useState } from 'react'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import { fetchTribeWarMonthly, type TribeWarStanding } from '@/lib/community/wireEvents'

export function useTribeWar() {
  const [standings, setStandings] = useState<TribeWarStanding[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setStandings(await fetchTribeWarMonthly())
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

  const leader = standings[0] ?? null
  const seasonLabel = standings[0]?.seasonLabel ?? ''

  return { standings, leader, seasonLabel, loading, refresh }
}
