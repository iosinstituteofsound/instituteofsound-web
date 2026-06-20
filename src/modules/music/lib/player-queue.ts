import type { PlayerTrack } from '@/modules/player/types/player.types'
import type { PlaylistDetailDto, PlaylistTrackRefDto, ReleaseDetailDto } from '@/modules/music/types/music.types'

export function tracksToPlayerQueue(
  tracks: Array<{
    id?: string
    trackId?: string
    title: string
    artistName?: string
    artist?: string
    audioUrl?: string
    streamUrl?: string
    durationSec?: number
  }>,
  artworkUrl?: string,
): PlayerTrack[] {
  return tracks
    .filter((t) => t.audioUrl || t.streamUrl)
    .map((t) => ({
      id: t.id ?? t.trackId ?? `${t.title}-${t.audioUrl ?? t.streamUrl}`,
      title: t.title,
      artist: t.artistName ?? t.artist ?? 'Unknown',
      audioUrl: (t.audioUrl ?? t.streamUrl)!,
      durationSec: t.durationSec,
      artworkUrl,
    }))
}

export function releaseToPlayerQueue(release: ReleaseDetailDto): PlayerTrack[] {
  if (release.tracks.length) {
    return tracksToPlayerQueue(
      release.tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: release.artistName,
        audioUrl: t.audioUrl,
        durationSec: t.durationSec,
      })),
      release.coverUrl,
    )
  }
  if (release.streamUrl) {
    const durationSec = release.tracks.reduce((sum, track) => sum + (track.durationSec ?? 0), 0)
    return [
      {
        id: release.id,
        title: release.title,
        artist: release.artistName ?? 'Unknown',
        audioUrl: release.streamUrl,
        artworkUrl: release.coverUrl,
        durationSec: durationSec > 0 ? durationSec : undefined,
      },
    ]
  }
  return []
}

export function playlistToPlayerQueue(playlist: PlaylistDetailDto): PlayerTrack[] {
  return tracksToPlayerQueue(
    playlist.tracks.map((t: PlaylistTrackRefDto) => ({
      trackId: t.trackId,
      title: t.title,
      artistName: t.artistName,
      audioUrl: t.audioUrl ?? t.streamUrl,
      durationSec: t.durationSec,
    })),
    playlist.coverUrl,
  )
}
