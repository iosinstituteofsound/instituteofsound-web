export type CommunityFeedFilter = 'all' | 'following' | 'spin' | 'drop' | 'tribe'

export const FEED_FILTER_OPTIONS: { id: CommunityFeedFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'following', label: 'Following' },
  { id: 'spin', label: 'Spins' },
  { id: 'drop', label: 'Drops' },
  { id: 'tribe', label: 'My tribe' },
]

export function feedFollowingOnly(filter: CommunityFeedFilter): boolean {
  return filter === 'following'
}

export function feedKindParam(filter: CommunityFeedFilter): 'spin' | 'drop' | null {
  if (filter === 'spin') return 'spin'
  if (filter === 'drop') return 'drop'
  return null
}

export function feedGenreParam(
  filter: CommunityFeedFilter,
  tribeSlug: string | null | undefined
): string | null {
  if (filter === 'tribe' && tribeSlug) return tribeSlug
  return null
}
