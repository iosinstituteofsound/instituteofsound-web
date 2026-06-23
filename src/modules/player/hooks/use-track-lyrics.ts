import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getArtistTrack, getReleaseDetail, getTrackLyrics } from '@/modules/music/api/music.api'
import {
  getActiveSyncedLyricText,
  hasAnyLyrics,
  hasSyncedLyricsForPlayback,
} from '@/modules/music/lib/lyrics-sync-utils'
import type { SyncedLyricLineDto, SyncedLyricsStatus } from '@/modules/music/types/lyrics-sync.types'
import type { TrackDto } from '@/modules/music/types/music.types'
import type { PlayerTrack } from '@/modules/player/types/player.types'
import { tokenStorage } from '@/shared/services/api/token-storage'

function isMongoId(value?: string): value is string {
  return Boolean(value && /^[a-f0-9]{24}$/i.test(value))
}

function resolveTrackId(track: PlayerTrack | null): string | undefined {
  if (!track) return undefined
  if (isMongoId(track.trackId)) return track.trackId
  if (isMongoId(track.id) && track.id !== track.releaseId) return track.id
  return undefined
}

function resolveReleaseId(track: PlayerTrack | null): string | undefined {
  if (!track) return undefined
  if (isMongoId(track.releaseId)) return track.releaseId
  return undefined
}

function pickReleaseTrack(
  tracks: TrackDto[],
  trackId?: string,
  audioUrl?: string,
): TrackDto | undefined {
  if (trackId) {
    const byId = tracks.find((track) => track.id === trackId)
    if (byId) return byId
  }
  if (audioUrl) {
    const byAudio = tracks.find((track) => track.audioUrl === audioUrl)
    if (byAudio) return byAudio
  }
  return tracks[0]
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
  const releaseId = resolveReleaseId(currentTrack)
  const embeddedHasLyrics = hasAnyLyrics(currentTrack?.lyrics, currentTrack?.syncedLyrics)
  const needsFetch = Boolean(currentTrack && !embeddedHasLyrics && (trackId || releaseId))

  const { data: trackLyrics, isLoading: trackLyricsLoading } = useQuery({
    queryKey: ['track-lyrics', trackId],
    queryFn: async () => {
      try {
        return await getTrackLyrics(trackId!)
      } catch {
        if (tokenStorage.hasSession()) {
          const artistTrack = await getArtistTrack(trackId!)
          return {
            releaseId: artistTrack.releaseId ?? '',
            lyrics: artistTrack.lyrics,
            syncedLyrics: artistTrack.syncedLyrics,
            syncedLyricsStatus: artistTrack.syncedLyricsStatus,
          }
        }
        return null
      }
    },
    enabled: needsFetch && Boolean(trackId),
    staleTime: 30_000,
    retry: false,
  })

  const { data: releaseDetail, isLoading: releaseLoading } = useQuery({
    queryKey: ['release-detail', releaseId],
    queryFn: () => getReleaseDetail(releaseId!),
    enabled: needsFetch && Boolean(releaseId),
    staleTime: 30_000,
    retry: false,
  })

  return useMemo(() => {
    const releaseTrack = releaseDetail?.tracks.length
      ? pickReleaseTrack(releaseDetail.tracks, trackId, currentTrack?.audioUrl)
      : undefined

    const lyrics =
      currentTrack?.lyrics ??
      trackLyrics?.lyrics ??
      releaseTrack?.lyrics
    const syncedLyrics = currentTrack?.syncedLyrics?.length
      ? currentTrack.syncedLyrics
      : trackLyrics?.syncedLyrics?.length
        ? trackLyrics.syncedLyrics
        : releaseTrack?.syncedLyrics
    const syncedLyricsStatus =
      currentTrack?.syncedLyricsStatus ??
      trackLyrics?.syncedLyricsStatus ??
      releaseTrack?.syncedLyricsStatus

    return {
      lyrics,
      syncedLyrics,
      syncedLyricsStatus,
      hasLyrics: hasAnyLyrics(lyrics, syncedLyrics),
      hasSyncedPlayback: hasSyncedLyricsForPlayback(syncedLyrics, syncedLyricsStatus),
      isLoading: needsFetch && (trackLyricsLoading || releaseLoading),
    }
  }, [
    currentTrack,
    needsFetch,
    releaseDetail?.tracks,
    releaseLoading,
    trackId,
    trackLyrics,
    trackLyricsLoading,
  ])
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
