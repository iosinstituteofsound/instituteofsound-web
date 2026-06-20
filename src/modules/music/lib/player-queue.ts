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
      trackId: t.trackId ?? t.id,
      title: t.title,
      artist: t.artistName ?? t.artist ?? 'Unknown',
      audioUrl: (t.audioUrl ?? t.streamUrl)!,
      durationSec: t.durationSec,
      artworkUrl,
      releaseId: (t as { releaseId?: string }).releaseId,
      artistProfileId: (t as { artistProfileId?: string }).artistProfileId,
    }))
}

export function releaseToPlayerQueue(release: ReleaseDetailDto): PlayerTrack[] {
  if (release.tracks.length) {
    return tracksToPlayerQueue(
      release.tracks.map((t) => ({
        id: t.id,
        trackId: t.id,
        title: t.title,
        artist: release.artistName,
        audioUrl: t.audioUrl,
        durationSec: t.durationSec,
        releaseId: release.id,
        artistProfileId: release.artistProfileId,
      })),
      release.coverUrl,
    )
  }
  if (release.streamUrl) {
    const primaryTrack = release.tracks[0]
    const durationSec = release.tracks.reduce((sum, track) => sum + (track.durationSec ?? 0), 0)
    return [
      {
        id: primaryTrack?.id ?? release.id,
        trackId: primaryTrack?.id,
        releaseId: release.id,
        artistProfileId: release.artistProfileId,
        title: primaryTrack?.title ?? release.title,
        artist: release.artistName ?? 'Unknown',
        audioUrl: primaryTrack?.audioUrl ?? release.streamUrl,
        artworkUrl: release.coverUrl,
        durationSec:
          primaryTrack?.durationSec ?? (durationSec > 0 ? durationSec : undefined),
      },
    ]
  }
  return []
}

export function playlistToPlayerQueue(playlist: PlaylistDetailDto): PlayerTrack[] {
  const playable = playlist.tracks.filter((t) => t.audioUrl || t.streamUrl)
  return tracksToPlayerQueue(
    playable.map((t: PlaylistTrackRefDto) => ({
      trackId: t.trackId,
      title: t.title,
      artistName: t.artistName,
      audioUrl: t.audioUrl ?? t.streamUrl,
      durationSec: t.durationSec,
      releaseId: t.releaseId,
    })),
    playlist.coverUrl,
  ).map((track, index) => ({
    ...track,
    artworkUrl: playable[index]?.coverUrl ?? playlist.coverUrl ?? track.artworkUrl,
  }))
}
