import type { SceneHubDto } from '@/modules/explore/types/explore.types'

export type SceneHubCardVariant = 'hero' | 'side' | 'tile'

export interface SceneHubMosaicItem {
  hub: SceneHubDto
  variant: SceneHubCardVariant
}

export const SCENE_GENRES = [
  { slug: 'electronic', label: 'Electronic' },
  { slug: 'metal', label: 'Metal' },
  { slug: 'indie', label: 'Indie' },
  { slug: 'hip-hop', label: 'Hip-Hop' },
  { slug: 'rock', label: 'Rock' },
  { slug: 'experimental', label: 'Experimental' },
  { slug: 'jazz', label: 'Jazz' },
  { slug: 'folk', label: 'Folk' },
] as const

const HUB_COPY: Record<string, string> = {
  bangalore: 'Underground electronic culture and nightlife.',
  delhi: 'Capital circuits — club, metal, and experimental density.',
  kolkata: 'Poetry, jazz, and post-punk corridors.',
  mumbai: 'Bollywood fringe and indie crossover heat.',
  chandigarh: 'North-west bass and Punjabi rap lanes.',
  chennai: 'Carnatic fusion and film-score underground.',
  jaipur: 'Desert folk and electronic ritual nights.',
  goa: 'Beach raves, psy-trance, and sunset sessions.',
  hyderabad: 'Tech-city hip-hop and Telugu indie waves.',
  pune: 'College circuits and metal rehearsal dens.',
}

export function sceneHubPath(citySlug: string, genreSlug = 'electronic') {
  return `/scenes/${citySlug}/${genreSlug}`
}

export function sceneHubDescription(hub: SceneHubDto) {
  return hub.description?.trim() || HUB_COPY[hub.slug] || 'Local scene density — artists, releases, and events.'
}

export function sceneHubCover(hub: SceneHubDto) {
  return hub.coverUrl ?? `https://picsum.photos/seed/hub-${hub.slug}/900/520`
}

export function buildSceneHubMosaic(hubs: SceneHubDto[]): SceneHubMosaicItem[][] {
  const sorted = [...hubs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  if (sorted.length === 0) return []

  const rows: SceneHubMosaicItem[][] = []

  if (sorted.length === 1) {
    rows.push([{ hub: sorted[0]!, variant: 'hero' }])
    return rows
  }

  rows.push([
    { hub: sorted[0]!, variant: 'hero' },
    { hub: sorted[1]!, variant: 'side' },
  ])

  const tiles = sorted.slice(2)
  for (let i = 0; i < tiles.length; i += 4) {
    rows.push(tiles.slice(i, i + 4).map((hub) => ({ hub, variant: 'tile' as const })))
  }

  return rows
}

function formatStatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K+`
  return `${value}+`
}

export function sceneHubNetworkStats(
  hubs: SceneHubDto[],
  artistCount: number,
  releaseCount: number,
  eventCount: number,
) {
  return {
    hubs: String(hubs.length || 10),
    artists: formatStatCount(Math.max(artistCount, 2100)),
    releases: formatStatCount(Math.max(releaseCount, 6800)),
    events: formatStatCount(Math.max(eventCount, 420)),
  }
}
