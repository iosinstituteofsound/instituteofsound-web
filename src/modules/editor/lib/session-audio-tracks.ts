import type { ArticleSessionTrack } from '@/modules/explore/lib/article-content'

export type SessionAudioTrack = ArticleSessionTrack

export interface AudioCollectionMeta {
  collectionTitle?: string
  collectionUrl?: string
  isCollection: boolean
}

export function toSessionTracks(
  items: Array<{
    id: string
    title: string
    artistName: string
    durationSec?: number
    streamUrl?: string
    audioUrl?: string
  }>,
): SessionAudioTrack[] {
  return items
    .map((item) => {
      const streamUrl = item.streamUrl?.trim() || item.audioUrl?.trim() || ''
      if (!streamUrl) return null
      return {
        id: item.id,
        title: item.title,
        artistName: item.artistName,
        durationSec: item.durationSec ?? 0,
        streamUrl,
      }
    })
    .filter((track): track is SessionAudioTrack => track !== null)
}

export function sessionTrackFromUrl(
  id: string,
  title: string,
  artistName: string,
  url: string,
  durationSec?: number,
): SessionAudioTrack {
  return {
    id,
    title,
    artistName,
    durationSec: durationSec ?? 0,
    streamUrl: url,
  }
}

export function pickActiveTrackIndex(tracks: SessionAudioTrack[], audioUrl: string, trackTitle?: string): number {
  const normalizedUrl = audioUrl.trim()
  const byUrl = tracks.findIndex((track) => track.streamUrl === normalizedUrl)
  if (byUrl >= 0) return byUrl

  const title = trackTitle?.trim().toLowerCase()
  if (title) {
    const byTitle = tracks.findIndex((track) => track.title.trim().toLowerCase() === title)
    if (byTitle >= 0) return byTitle
  }

  return 0
}
