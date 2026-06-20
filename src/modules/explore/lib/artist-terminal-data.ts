import type { ArtistProfileDto, DiscographyDto, ReleaseDto } from '@/modules/explore/types/explore.types'
import { isDiscographyPreviewId } from '@/modules/profile/lib/discography-format'
import {
  buildArtistDiscographyStats,
  formatDiscographyStatValue,
} from '@/modules/profile/lib/discography-stats'
import { artistFollowers } from '@/modules/explore/lib/artist-meta'
import { artistReleaseStats } from '@/modules/explore/lib/release-meta'

export type ArtistTerminalStats = {
  trackCount: number | string
  totalPlays: string
  releaseCount: number
  listeners: string
}

export function collectDiscographyReleases(data: DiscographyDto): ReleaseDto[] {
  const seen = new Set<string>()
  const items: ReleaseDto[] = []

  for (const release of [data.latestRelease, ...(data.albumsAndEps ?? []), ...(data.singles ?? [])]) {
    if (!release || isDiscographyPreviewId(release.id) || seen.has(release.id)) continue
    seen.add(release.id)
    items.push(release)
  }

  return items
}

export function buildArtistTerminalStats(
  artist: ArtistProfileDto,
  discography: DiscographyDto | undefined,
  fallbackReleases: ReleaseDto[],
): ArtistTerminalStats | null {
  if (discography) {
    const stats = buildArtistDiscographyStats(discography)
    const releases = collectDiscographyReleases(discography)

    return {
      trackCount: stats.totalTracks,
      totalPlays: formatDiscographyStatValue(stats.totalStreams, true),
      releaseCount: releases.length,
      listeners: artistFollowers(artist.slug),
    }
  }

  if (fallbackReleases.length > 0) {
    const legacy = artistReleaseStats(artist, fallbackReleases)
    return {
      trackCount: legacy.trackCount,
      totalPlays: legacy.totalPlays,
      releaseCount: legacy.releaseCount,
      listeners: legacy.listeners,
    }
  }

  return null
}
