import type { ReleaseDto, ReleasesPageFilter } from '@/modules/explore/types/explore.types'

export type WireReleaseSection = 'trending' | 'all' | 'new' | 'undiscovered'
export type WireSort = 'featured' | 'newest' | 'oldest' | 'plays-desc' | 'plays-asc' | 'az'
export type WireTypeFilter = 'all' | 'single' | 'ep' | 'album'
export type WireSourceTab = 'releases' | 'community' | 'search'

export const WIRE_SECTION_LABELS: Record<WireReleaseSection, string> = {
  trending: 'Trending',
  all: 'All',
  new: 'New',
  undiscovered: 'Less discovered',
}

export const WIRE_SECTION_TO_FILTER: Record<WireReleaseSection, ReleasesPageFilter> = {
  trending: 'hot',
  all: 'all',
  new: 'new',
  undiscovered: 'undiscovered',
}

export const WIRE_SOURCE_TAB_LABELS: Record<WireSourceTab, string> = {
  releases: 'Releases',
  community: 'Community',
  search: 'Site audio',
}

export const WIRE_SORT_OPTIONS: Array<{ id: WireSort; label: string }> = [
  { id: 'featured', label: 'Featured first' },
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'plays-desc', label: 'Most plays' },
  { id: 'plays-asc', label: 'Least plays' },
  { id: 'az', label: 'A → Z' },
]

export const WIRE_TYPE_OPTIONS: Array<{ id: WireTypeFilter; label: string }> = [
  { id: 'all', label: 'All types' },
  { id: 'single', label: 'Singles' },
  { id: 'ep', label: 'EPs' },
  { id: 'album', label: 'Albums' },
]

function releaseDateMs(release: ReleaseDto): number {
  if (!release.releaseDate) return 0
  return new Date(release.releaseDate).getTime()
}

export function filterWireReleasesByType(
  releases: ReleaseDto[],
  type: WireTypeFilter,
): ReleaseDto[] {
  if (type === 'all') return releases
  return releases.filter((release) => release.type === type)
}

export function filterWireReleasesByGenre(
  releases: ReleaseDto[],
  genre?: string,
): ReleaseDto[] {
  if (!genre) return releases
  const normalized = genre.toLowerCase()
  return releases.filter((release) => (release.genre ?? '').toLowerCase() === normalized)
}

export function sortWireReleases(releases: ReleaseDto[], sort: WireSort): ReleaseDto[] {
  const copy = [...releases]
  switch (sort) {
    case 'featured':
      return copy.sort(
        (a, b) =>
          Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) ||
          releaseDateMs(b) - releaseDateMs(a),
      )
    case 'newest':
      return copy.sort((a, b) => releaseDateMs(b) - releaseDateMs(a))
    case 'oldest':
      return copy.sort((a, b) => releaseDateMs(a) - releaseDateMs(b))
    case 'plays-desc':
      return copy.sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
    case 'plays-asc':
      return copy.sort((a, b) => (a.playCount ?? 0) - (b.playCount ?? 0))
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return copy
  }
}

export function collectWireGenres(releases: ReleaseDto[]): string[] {
  const genres = new Set<string>()
  for (const release of releases) {
    if (release.genre?.trim()) genres.add(release.genre.trim())
  }
  return [...genres].sort((a, b) => a.localeCompare(b))
}
