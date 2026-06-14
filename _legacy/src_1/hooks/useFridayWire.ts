import { useCallback, useEffect, useState } from 'react'
import { COMMUNITY_FEED_EVENT } from '@/lib/community/feedService'
import { fetchFridayWire, msUntilNextFridayWire, type FridayWire } from '@/lib/community/wireEvents'

export function useFridayWire() {
  const [wire, setWire] = useState<FridayWire | null>(null)
  const [loading, setLoading] = useState(true)
  const [countdownMs, setCountdownMs] = useState(0)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchFridayWire()
      setWire(data)
      setCountdownMs(msUntilNextFridayWire(data?.nextWireAt))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const onFeed = () => void refresh()
    window.addEventListener(COMMUNITY_FEED_EVENT, onFeed)
    return () => window.removeEventListener(COMMUNITY_FEED_EVENT, onFeed)
  }, [refresh])

  useEffect(() => {
    if (!wire) return
    const tick = () => setCountdownMs(msUntilNextFridayWire(wire.nextWireAt))
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [wire])

  return { wire, loading, countdownMs, refresh }
}
