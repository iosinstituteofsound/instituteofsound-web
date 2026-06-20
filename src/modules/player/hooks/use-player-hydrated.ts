import { useEffect, useState } from 'react'
import { usePlayerStore } from '@/modules/player/stores/player-store'

export function usePlayerHydrated() {
  const [hydrated, setHydrated] = useState(() => usePlayerStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = usePlayerStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(usePlayerStore.persist.hasHydrated())
    return unsub
  }, [])

  return hydrated
}
