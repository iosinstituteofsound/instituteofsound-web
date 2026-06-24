import type { PlayTrackOptions, PlayerTrack, PlayPlaylistOptions, QueueSource } from '@/modules/player/types/player.types'
import type { PlaylistDetailDto, PlaylistTrackRefDto, ReleaseDetailDto, TrackDto } from '@/modules/music/types/music.types'
import type { PlaylistDto } from '@/modules/explore/types/explore.types'

export function fisherYatesShuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function trackToPlayerTrack(
  track: {
    id?: string
    trackId?: string
    title: string
    artistName?: string
    artist?: string
    audioUrl?: string
    streamUrl?: string
    durationSec?: number
    releaseId?: string
    artistProfileId?: string
    coverUrl?: string
    lyrics?: string
    syncedLyrics?: TrackDto['syncedLyrics']
    syncedLyricsStatus?: TrackDto['syncedLyricsStatus']
    duplicateInfo?: TrackDto['duplicateInfo']
  },
  artworkUrl?: string,
): PlayerTrack | null {
  const audioUrl = track.audioUrl ?? track.streamUrl
  if (!audioUrl) return null
  return {
    id: track.id ?? track.trackId ?? `${track.title}-${audioUrl}`,
    trackId: track.trackId ?? track.id,
    title: track.title,
    artist: track.artistName ?? track.artist ?? 'Unknown',
    audioUrl,
    durationSec: track.durationSec,
    artworkUrl: track.coverUrl ?? artworkUrl,
    lyrics: track.lyrics,
    syncedLyrics: track.syncedLyrics,
    syncedLyricsStatus: track.syncedLyricsStatus,
    releaseId: track.releaseId,
    artistProfileId: track.artistProfileId,
    duplicateInfo: track.duplicateInfo,
  }
}

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
    releaseId?: string
    artistProfileId?: string
  }>,
  artworkUrl?: string,
): PlayerTrack[] {
  return tracks
    .map((t) => trackToPlayerTrack(t, artworkUrl))
    .filter((t): t is PlayerTrack => Boolean(t))
}

export function releaseToPlayerQueue(release: ReleaseDetailDto): PlayerTrack[] {
  if (release.tracks.length) {
    const queue = tracksToPlayerQueue(
      release.tracks.map((t) => ({
        id: t.id,
        trackId: t.id,
        title: t.title,
        artist: release.artistName,
        audioUrl: t.audioUrl ?? release.streamUrl,
        durationSec: t.durationSec,
        lyrics: t.lyrics,
        syncedLyrics: t.syncedLyrics,
        syncedLyricsStatus: t.syncedLyricsStatus,
        releaseId: release.id,
        artistProfileId: release.artistProfileId,
        duplicateInfo: t.duplicateInfo,
      })),
      release.coverUrl,
    )
    if (queue.length > 0) return queue
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
      coverUrl: t.coverUrl,
    })),
    playlist.coverUrl,
  ).map((track, index) => ({
    ...track,
    artworkUrl: playable[index]?.coverUrl ?? playlist.coverUrl ?? track.artworkUrl,
  }))
}

export function explorePlaylistToPlayerQueue(playlist: PlaylistDto): PlayerTrack[] {
  return tracksToPlayerQueue(
    playlist.tracks.map((item, index) => ({
      id: `${playlist.id}-${index}`,
      title: item.title,
      artistName: item.artistName,
      audioUrl: item.audioUrl ?? item.streamUrl,
      durationSec: item.durationSec,
    })),
    playlist.coverUrl,
  )
}

export function playExplorePlaylist(
  playlist: PlaylistDto,
  playTrack: PlayTrackFn,
  options: PlayPlaylistOptions = {},
) {
  let queue = explorePlaylistToPlayerQueue(playlist)
  if (!queue.length) return

  if (options.shuffled) {
    queue = fisherYatesShuffle(queue)
  }

  const startIndex = Math.min(options.startIndex ?? 0, queue.length - 1)
  playTrack(queue[startIndex], {
    queue,
    queueIndex: startIndex,
    autoplay: options.autoplay !== false,
    queueSource: {
      kind: 'playlist',
      id: playlist.id,
      slug: playlist.slug,
      title: playlist.title,
      coverUrl: playlist.coverUrl,
    },
  })
}

export function playlistQueueSource(playlist: PlaylistDetailDto, isOwn = false): QueueSource {
  return {
    kind: 'playlist',
    id: playlist.id,
    slug: playlist.slug,
    title: playlist.title,
    coverUrl: playlist.coverUrl,
    isOwn,
  }
}

export function releaseQueueSource(release: ReleaseDetailDto): QueueSource {
  return {
    kind: 'release',
    id: release.id,
    slug: release.slug,
    title: release.title,
    coverUrl: release.coverUrl,
  }
}

type PlayTrackFn = (track: PlayerTrack, options?: PlayTrackOptions) => void

export function playPlaylistFromDetail(
  playlist: PlaylistDetailDto,
  playTrack: PlayTrackFn,
  options: PlayPlaylistOptions & { isOwn?: boolean } = {},
) {
  let queue = playlistToPlayerQueue(playlist)
  if (!queue.length) return

  if (options.shuffled) {
    queue = fisherYatesShuffle(queue)
  }

  const startIndex = Math.min(options.startIndex ?? 0, queue.length - 1)
  playTrack(queue[startIndex], {
    queue,
    queueIndex: startIndex,
    autoplay: options.autoplay !== false,
    queueSource: playlistQueueSource(playlist, options.isOwn),
  })
}

export function playReleaseFromDetail(
  release: ReleaseDetailDto,
  playTrack: PlayTrackFn,
  options: PlayPlaylistOptions = {},
) {
  let queue = releaseToPlayerQueue(release)
  if (!queue.length) return

  if (options.shuffled) {
    queue = fisherYatesShuffle(queue)
  }

  const startIndex = Math.min(options.startIndex ?? 0, queue.length - 1)
  playTrack(queue[startIndex], {
    queue,
    queueIndex: startIndex,
    autoplay: options.autoplay !== false,
    queueSource: releaseQueueSource(release),
  })
}

export function playerTrackFromCurrent(track: {
  trackId?: string
  id?: string
  title: string
  artist?: string
  artistName?: string
  audioUrl?: string
  streamUrl?: string
  artworkUrl?: string
  coverUrl?: string
  durationSec?: number
  releaseId?: string
  artistProfileId?: string
  lyrics?: string
  syncedLyrics?: TrackDto['syncedLyrics']
  syncedLyricsStatus?: TrackDto['syncedLyricsStatus']
}): PlayerTrack | null {
  return trackToPlayerTrack(
    {
      trackId: track.trackId ?? track.id,
      title: track.title,
      artistName: track.artistName ?? track.artist,
      audioUrl: track.audioUrl ?? track.streamUrl,
      durationSec: track.durationSec,
      releaseId: track.releaseId,
      artistProfileId: track.artistProfileId,
      coverUrl: track.coverUrl,
      lyrics: track.lyrics,
      syncedLyrics: track.syncedLyrics,
      syncedLyricsStatus: track.syncedLyricsStatus,
    },
    track.artworkUrl ?? track.coverUrl,
  )
}
