import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getReleaseDetail } from '@/modules/music/api/music.api'
import {
  getActiveSyncedLyricText,
  hasAnyLyrics,
  hasSyncedLyricsForPlayback,
} from '@/modules/music/lib/lyrics-sync-utils'
import type { SyncedLyricLineDto, SyncedLyricsStatus } from '@/modules/music/types/lyrics-sync.types'
import type { PlayerTrack } from '@/modules/player/types/player.types'

function resolveTrackId(track: PlayerTrack | null): string | undefined {
  if (!track) return undefined
  const candidate = track.trackId ?? track.id
  return candidate && /^[a-f0-9]{24}$/i.test(candidate) ? candidate : undefined
}

export interface TrackLyricsData {
  lyrics?: string
  syncedLyrics?: SyncedLyricLineDto[]
  syncedLyricsStatus?: SyncedLyricsStatus
  hasLyrics: boolean
  hasSyncedPlayback: boolean
  isLoading: boolean
}

export function useTrackLyrics(currentTrack: PlayerTrack | null): TrackLyricsData {
  const trackId = resolveTrackId(currentTrack)
  const releaseId = currentTrack?.releaseId

  const embeddedHasLyrics = hasAnyLyrics(currentTrack?.lyrics, currentTrack?.syncedLyrics)
  const needsFetch = Boolean(currentTrack && !embeddedHasLyrics && releaseId && trackId)

  const { data: releaseDetail, isLoading } = useQuery({
    queryKey: ['release-detail', releaseId],
    queryFn: () => getReleaseDetail(releaseId!),
    enabled: needsFetch,
    staleTime: 60_000,
  })

  const fetchedTrack = useMemo(
    () => releaseDetail?.tracks.find((entry) => entry.id === trackId),
    [releaseDetail?.tracks, trackId],
  )

  return useMemo(() => {
    const lyrics = currentTrack?.lyrics ?? fetchedTrack?.lyrics
    const syncedLyrics = currentTrack?.syncedLyrics?.length
      ? currentTrack.syncedLyrics
      : fetchedTrack?.syncedLyrics
    const syncedLyricsStatus = currentTrack?.syncedLyricsStatus ?? fetchedTrack?.syncedLyricsStatus

    return {
      lyrics,
      syncedLyrics,
      syncedLyricsStatus,
      hasLyrics: hasAnyLyrics(lyrics, syncedLyrics),
      hasSyncedPlayback: hasSyncedLyricsForPlayback(syncedLyrics, syncedLyricsStatus),
      isLoading: needsFetch && isLoading,
    }
  }, [currentTrack, fetchedTrack, isLoading, needsFetch])
}

export function useActiveSyncedLyricLine(
  currentTrack: PlayerTrack | null,
  currentTime: number,
): string | null {
  const { syncedLyrics, hasSyncedPlayback } = useTrackLyrics(currentTrack)

  return useMemo(() => {
    if (!hasSyncedPlayback || !syncedLyrics?.length) return null
    return getActiveSyncedLyricText(syncedLyrics, currentTime * 1000)
  }, [currentTime, hasSyncedPlayback, syncedLyrics])
}
