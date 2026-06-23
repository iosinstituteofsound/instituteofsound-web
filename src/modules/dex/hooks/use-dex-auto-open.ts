import { useEffect, useRef } from 'react'
import { openDexForPlayback } from '@instituteofsound/dex'
import { useAuthStore } from '@/app/stores/auth-store'
import { usePlayerStore } from '@/modules/player/stores/player-store'

export function useDexAutoOpen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const openedForTrackIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      openedForTrackIdRef.current = null
      return
    }

    const trackId = currentTrack?.trackId
    if (!isPlaying || !trackId) return
    if (openedForTrackIdRef.current === trackId) return

    openedForTrackIdRef.current = trackId
    openDexForPlayback('now-playing')
  }, [isAuthenticated, currentTrack?.trackId, isPlaying])
}
