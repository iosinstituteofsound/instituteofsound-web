import type { ExplorePayload } from '@/modules/explore/types/explore.types'
import type { SessionAudioTrack } from '@/modules/editor/lib/session-audio-tracks'
import { sessionTrackFromUrl } from '@/modules/editor/lib/session-audio-tracks'

export interface SiteAudioTrack {
  id: string
  title: string
  artistName: string
  streamUrl: string
  durationSec?: number
  source: 'release' | 'playlist'
  sourceLabel?: string
  playlistSlug?: string
  releaseId?: string
}

export function collectSiteAudioTracks(explore: ExplorePayload): SiteAudioTrack[] {
  const tracks: SiteAudioTrack[] = []
  const seen = new Set<string>()

  const add = (track: SiteAudioTrack) => {
    const url = track.streamUrl.trim()
    if (!url || seen.has(url)) return
    seen.add(url)
    tracks.push(track)
  }

  for (const release of explore.releases) {
    if (!release.streamUrl?.trim()) continue
    add({
      id: `release-${release.id}`,
      title: release.title,
      artistName: release.artistName ?? 'Unknown artist',
      streamUrl: release.streamUrl.trim(),
      source: 'release',
      sourceLabel: release.type ? release.type.toUpperCase() : 'Release',
      releaseId: release.id,
    })
  }

  const playlists = [
    explore.playlists.featured,
    ...explore.playlists.items,
  ].filter((playlist): playlist is NonNullable<typeof playlist> => Boolean(playlist))

  for (const playlist of playlists) {
    playlist.tracks.forEach((track, index) => {
      if (!track.streamUrl?.trim()) return
      add({
        id: `playlist-${playlist.slug}-${index}`,
        title: track.title,
        artistName: track.artistName,
        streamUrl: track.streamUrl.trim(),
        durationSec: track.durationSec,
        source: 'playlist',
        sourceLabel: playlist.title,
        playlistSlug: playlist.slug,
      })
    })
  }

  return tracks.sort((a, b) => a.title.localeCompare(b.title))
}

export function searchSiteAudioTracks(tracks: SiteAudioTrack[], query: string, limit = 24): SiteAudioTrack[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return tracks.slice(0, limit)

  return tracks
    .filter((track) => {
      const haystack = `${track.title} ${track.artistName} ${track.sourceLabel ?? ''}`.toLowerCase()
      return haystack.includes(normalized)
    })
    .slice(0, limit)
}

function allPlaylists(explore: ExplorePayload) {
  return [
    ...(explore.playlists.featured ? [explore.playlists.featured] : []),
    ...explore.playlists.items,
  ]
}

export function resolveSiteCollectionTracks(
  explore: ExplorePayload,
  track: SiteAudioTrack,
): SessionAudioTrack[] {
  if (track.playlistSlug) {
    const playlist = allPlaylists(explore).find((item) => item.slug === track.playlistSlug)
    if (playlist) {
      return playlist.tracks
        .filter((item) => item.streamUrl?.trim())
        .map((item, index) =>
          sessionTrackFromUrl(
            `${playlist.slug}-${index}`,
            item.title,
            item.artistName?.trim() || track.artistName,
            item.streamUrl!.trim(),
            item.durationSec,
          ),
        )
    }
  }

  const playlists = allPlaylists(explore)
  const byStream = playlists.find((playlist) =>
    playlist.tracks.some((item) => item.streamUrl?.trim() === track.streamUrl),
  )
  if (byStream) {
    return byStream.tracks
      .filter((item) => item.streamUrl?.trim())
      .map((item, index) =>
        sessionTrackFromUrl(
          `${byStream.slug}-${index}`,
          item.title,
          item.artistName?.trim() || track.artistName,
          item.streamUrl!.trim(),
          item.durationSec,
        ),
      )
  }

  return [
    sessionTrackFromUrl(track.id, track.title, track.artistName, track.streamUrl, track.durationSec),
  ]
}

export function isSiteCollection(track: SiteAudioTrack, explore: ExplorePayload): boolean {
  return resolveSiteCollectionTracks(explore, track).length > 1
}
