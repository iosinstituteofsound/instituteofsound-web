import type { DiscographyTrackDto, ReleaseDto } from '@/modules/explore/types/explore.types'
import type { ReleaseDetailDto, TrackDto } from '@/modules/music/types/music.types'
import type { PlayerTrack } from '@/modules/player/types/player.types'

type ReleaseStreamSource = {
  id: string
  title: string
  artistName?: string
  artistProfileId?: string
  coverUrl?: string
  streamUrl?: string
  durationSec?: number
  primaryTrackId?: string
  tracks?: Array<
    Pick<
      TrackDto,
      'id' | 'title' | 'audioUrl' | 'durationSec' | 'lyrics' | 'syncedLyrics' | 'syncedLyricsStatus'
    >
  >
}

export function releaseStreamToPlayerTrack(release: ReleaseStreamSource): PlayerTrack | null {
  if (!release.streamUrl) return null

  const primaryTrack =
    release.tracks?.find((track) => track.id === release.primaryTrackId) ?? release.tracks?.[0]
  const trackId = release.primaryTrackId ?? primaryTrack?.id
  const audioUrl = primaryTrack?.audioUrl ?? release.streamUrl

  return {
    id: trackId ?? release.id,
    trackId,
    releaseId: release.id,
    artistProfileId: release.artistProfileId,
    title: primaryTrack?.title ?? release.title,
    artist: release.artistName ?? 'Unknown',
    audioUrl,
    artworkUrl: release.coverUrl,
    durationSec: primaryTrack?.durationSec ?? release.durationSec,
    lyrics: primaryTrack?.lyrics,
    syncedLyrics: primaryTrack?.syncedLyrics,
    syncedLyricsStatus: primaryTrack?.syncedLyricsStatus,
  }
}

export function releaseDtoToPlayerTrack(release: ReleaseDto): PlayerTrack | null {
  return releaseStreamToPlayerTrack(release)
}

export function releaseDetailToPlayerTrack(release: ReleaseDetailDto): PlayerTrack | null {
  return releaseStreamToPlayerTrack({
    ...release,
    primaryTrackId: release.tracks[0]?.id,
    tracks: release.tracks,
  })
}

export function discographyTrackToPlayerTrack(
  track: DiscographyTrackDto,
  artistName?: string,
): PlayerTrack | null {
  if (!track.streamUrl) return null

  return {
    id: track.id,
    trackId: track.id,
    releaseId: track.releaseId,
    artistProfileId: track.artistProfileId,
    title: track.title,
    artist: track.artistName ?? artistName ?? 'Unknown',
    audioUrl: track.streamUrl,
    artworkUrl: track.coverUrl,
    durationSec: track.durationSec,
  }
}
