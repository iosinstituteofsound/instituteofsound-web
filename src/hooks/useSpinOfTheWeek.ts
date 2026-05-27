import { useCallback, useEffect, useState } from 'react'
import { COMMUNITY_FEED_EVENT } from '@/lib/community/feedService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import { fetchSpinOfTheWeek, type SpinOfTheWeek } from '@/lib/community/wireHighlights'

export function useSpinOfTheWeek() {
  const [spin, setSpin] = useState<SpinOfTheWeek | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setSpin(await fetchSpinOfTheWeek())
    } finally {
      setLoading(false)
    }
  }, [])

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

  return { spin, loading, refresh }
}
