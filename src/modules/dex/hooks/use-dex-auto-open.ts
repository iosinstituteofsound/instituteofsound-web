import { useEffect, useRef } from 'react'
import { openDexForPlayback } from '@instituteofsound/dex'
import { usePlayerStore } from '@/modules/player/stores/player-store'

export function useDexAutoOpen() {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const openedForTrackIdRef = useRef<string | null>(null)

  useEffect(() => {
    const trackId = currentTrack?.trackId
    if (!isPlaying || !trackId) return
    if (openedForTrackIdRef.current === trackId) return

    openedForTrackIdRef.current = trackId
    openDexForPlayback('now-playing')
  }, [currentTrack?.trackId, isPlaying])
}
