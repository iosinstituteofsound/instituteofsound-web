import type { ExploreFilter, LabelProfileDto } from '@/modules/explore/types/explore.types'

const CITY_POOL = [
  'Mumbai',
  'Berlin',
  'London',
  'Tokyo',
  'São Paulo',
  'Lagos',
  'Detroit',
  'Seoul',
  'Paris',
  'Johannesburg',
  'Mexico City',
  'Melbourne',
] as const

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 23) % 100000
  return h
}

export function labelInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  return (parts[0]?.slice(0, 2) ?? 'LB').toUpperCase()
}

export function labelCity(label: LabelProfileDto): string {
  return CITY_POOL[hashSlug(label.slug) % CITY_POOL.length]!
}

export function labelGenreLine(label: LabelProfileDto): string {
  const genre =
    label.genres.length >= 2
      ? `${label.genres[0]} / ${label.genres[1]}`
      : label.genres[0] ?? 'Independent electronic'
  return `${genre} • ${labelCity(label)}`
}

export function labelArtistCount(label: LabelProfileDto): number {
  return 2 + (hashSlug(label.slug) % 9)
}

export function labelReleaseCount(label: LabelProfileDto): number {
  return 4 + (hashSlug(label.slug) % 18)
}

export function filterLabels(labels: LabelProfileDto[], filter: ExploreFilter): LabelProfileDto[] {
  if (filter === 'top' || filter === 'vibe') {
    return labels.filter((label) => label.genres.length > 0 || label.bio).slice(0, 8)
  }
  if (filter === 'new') return [...labels].reverse()
  return labels
}

export function labelNetworkStats(
  labels: LabelProfileDto[],
  artistCount: number,
  releaseCount: number,
) {
  const cities = new Set(labels.map(labelCity))

  return {
    verifiedLabels: labels.length,
    artists: artistCount || labels.reduce((sum, label) => sum + labelArtistCount(label), 0),
    releases: releaseCount || labels.reduce((sum, label) => sum + labelReleaseCount(label), 0),
    cities: cities.size || Math.min(12, labels.length + 3),
  }
}
