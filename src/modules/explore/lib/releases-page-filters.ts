import type { ReleaseDto, ReleasesPageFilter } from '@/modules/explore/types/explore.types'

const FORTY_FIVE_DAYS_MS = 45 * 86400000

export function filterReleasesForPage(
  releases: ReleaseDto[],
  filter: ReleasesPageFilter,
): ReleaseDto[] {
  const now = Date.now()

  switch (filter) {
    case 'album':
      return releases.filter((r) => r.type === 'album')
    case 'epsingles':
      return releases.filter((r) => r.type === 'ep' || r.type === 'single')
    case 'hot':
      return releases.filter((r) => r.isFeatured)
    case 'new':
      return releases.filter((r) => {
        if (!r.releaseDate) return false
        const age = now - new Date(r.releaseDate).getTime()
        return age >= 0 && age < FORTY_FIVE_DAYS_MS
      })
    default:
      return releases
  }
}

export function isNewReleaseOnPage(release: ReleaseDto): boolean {
  if (!release.releaseDate) return false
  const age = Date.now() - new Date(release.releaseDate).getTime()
  return age >= 0 && age < FORTY_FIVE_DAYS_MS
}

export function isHotReleaseOnPage(release: ReleaseDto): boolean {
  return release.isFeatured === true
}
