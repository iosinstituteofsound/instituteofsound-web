import { useCallback, useEffect, useState } from 'react'
import { fetchDiscoverPremiereFeed, type DiscoverPremiereCard } from '@/lib/discovery/premieres'

const HOUR_MS = 60 * 60 * 1000

function msUntilNextUtcHour(): number {
  const now = Date.now()
  const d = new Date(now)
  const next = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours() + 1,
    0,
    0,
    0
  )
  return Math.max(1000, next - now)
}

/** Discover premieres — refetches when the UTC hour rolls (hourly rotation). */
export function useDiscoverPremieres(limit = 24) {
  const [cards, setCards] = useState<DiscoverPremiereCard[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hourTick, setHourTick] = useState(0)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDiscoverPremiereFeed(limit)
      setCards(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load premieres')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void refresh()
  }, [refresh, hourTick])

  useEffect(() => {
    let timeout = window.setTimeout(function tick() {
      setHourTick((n) => n + 1)
      timeout = window.setTimeout(tick, msUntilNextUtcHour())
    }, msUntilNextUtcHour())
    return () => window.clearTimeout(timeout)
  }, [hourTick])

  return { cards, loading, error, refresh }
}
