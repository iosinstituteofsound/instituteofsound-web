import type { DiscoverPremiereCard } from './premieres'
import { filterPremiereCards } from './premieres'

/** Full releases page filter tabs (mockup-aligned labels). */
export type ReleasesPageFilter = 'all' | 'album' | 'epsingles' | 'archive'

export const RELEASES_PAGE_FILTERS: { id: ReleasesPageFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'album', label: 'Albums' },
  { id: 'epsingles', label: 'EPs & singles' },
  { id: 'archive', label: 'Compilations' },
]

export function filterForReleasesPage(
  cards: DiscoverPremiereCard[],
  filter: ReleasesPageFilter
): DiscoverPremiereCard[] {
  if (filter === 'all') return cards
  if (filter === 'album') return cards.filter((c) => c.releaseType === 'album')
  if (filter === 'epsingles') {
    return cards.filter((c) => c.releaseType === 'ep' || c.releaseType === 'single')
  }
  return filterPremiereCards(cards, 'archive')
}
