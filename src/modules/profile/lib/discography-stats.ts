import type { DiscographyDto } from '@/modules/explore/types/explore.types'
import { isDiscographyPreviewId } from '@/modules/profile/lib/discography-format'

export type ArtistDiscographyStats = {
  totalReleases: number
  totalTracks: number
  totalStreams: number
  monthlyListeners: number
  followers: number
  countriesReached: number
}

function collectRealReleases(data: DiscographyDto) {
  const seen = new Set<string>()
  const items = []

  for (const release of [data.latestRelease, ...(data.albumsAndEps ?? []), ...(data.singles ?? [])]) {
    if (!release || isDiscographyPreviewId(release.id) || seen.has(release.id)) continue
    seen.add(release.id)
    items.push(release)
  }

  return items
}

function collectRealTracks(data: DiscographyDto) {
  return (data.tracks ?? []).filter((track) => !isDiscographyPreviewId(track.id))
}

export function buildArtistDiscographyStats(data: DiscographyDto): ArtistDiscographyStats {
  const releases = collectRealReleases(data)
  const tracks = collectRealTracks(data)

  return {
    totalReleases: tracks.length > 0 ? tracks.length : releases.length,
    totalTracks: tracks.length > 0 ? tracks.length : releases.length,
    totalStreams: tracks.reduce((sum, track) => sum + (track.playCount ?? 0), 0),
    monthlyListeners: 0,
    followers: 0,
    countriesReached: 0,
  }
}

export function formatDiscographyStatValue(value: number, compact = false): string {
  if (value <= 0) return '—'

  if (!compact) return value.toLocaleString('en-US')

  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString('en-US')
}
