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

const TRACK_ESTIMATE: Record<string, number> = {
  album: 10,
  ep: 5,
  single: 1,
}

function collectRealReleases(data: DiscographyDto) {
  const seen = new Set<string>()
  const items = []

  for (const release of [
    data.latestRelease,
    ...data.popular,
    ...(data.albumsAndEps ?? []),
    ...(data.singles ?? []),
  ]) {
    if (!release || isDiscographyPreviewId(release.id) || seen.has(release.id)) continue
    seen.add(release.id)
    items.push(release)
  }

  return items
}

function estimateTrackCount(releases: DiscographyDto['popular']): number {
  return releases.reduce((sum, release) => {
    const type = release.type ?? 'single'
    return sum + (TRACK_ESTIMATE[type] ?? 1)
  }, 0)
}

export function buildArtistDiscographyStats(data: DiscographyDto): ArtistDiscographyStats {
  const releases = collectRealReleases(data)

  return {
    totalReleases: releases.length,
    totalTracks: estimateTrackCount(releases),
    totalStreams: releases.reduce((sum, release) => sum + (release.playCount ?? 0), 0),
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
