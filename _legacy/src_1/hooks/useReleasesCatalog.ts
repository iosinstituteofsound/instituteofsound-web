import { useCallback, useEffect, useState } from 'react'
import { fetchReleasesCatalog } from '@/lib/discovery/releasesCatalog'
import type { DiscoverPremiereCard } from '@/lib/discovery/premieres'

/** Full artist studio catalog — all tracks and albums (not hourly one-per-artist wire). */
export function useReleasesCatalog() {
  const [cards, setCards] = useState<DiscoverPremiereCard[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchReleasesCatalog()
      setCards(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load releases')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { cards, loading, error, refresh }
}
