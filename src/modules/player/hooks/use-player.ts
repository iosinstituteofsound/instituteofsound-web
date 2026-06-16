import { useCallback } from 'react'
import type { PlayTrackOptions, PlayerTrack } from '@/modules/player/types/player.types'
import { usePlayerStore } from '@/modules/player/stores/player-store'

export function usePlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const close = usePlayerStore((s) => s.close)

  const play = useCallback(
    (track: PlayerTrack, options?: PlayTrackOptions) => {
      playTrack(track, options)
    },
    [playTrack],
  )

  const isCurrentTrack = useCallback(
    (trackId: string) => currentTrack?.id === trackId,
    [currentTrack?.id],
  )

  return {
    currentTrack,
    isPlaying,
    play,
    togglePlay,
    close,
    isCurrentTrack,
  }
}
