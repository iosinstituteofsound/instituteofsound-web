import type { DiscoverPremiereCard } from '@/lib/discovery/premieres'

/** Public URL for a catalog card (premiere slug, album shell, or studio track). */
export function catalogCardHref(card: DiscoverPremiereCard): string {
  if (card.releaseSlug) return `/release/${card.releaseSlug}`
  if (card.catalogKind === 'album' || card.trackId.startsWith('album-')) {
    return `/artist/${card.artistSlug}#releases`
  }
  return `/track/${card.artistSlug}/${card.trackId}`
}

export function trackDetailPath(artistSlug: string, trackId: string): string {
  return `/track/${artistSlug}/${trackId}`
}
