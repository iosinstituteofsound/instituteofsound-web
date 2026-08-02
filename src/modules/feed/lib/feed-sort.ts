/** Organic posts between sponsored cards (feed + reels). */
export const FEED_AD_EVERY_N = 4

export function compareFeedByLatest<T extends { createdAt: string; id: string }>(left: T, right: T) {
  const timeDiff = Date.parse(right.createdAt) - Date.parse(left.createdAt)
  if (timeDiff !== 0) return timeDiff
  return right.id.localeCompare(left.id)
}

export function sortFeedItemsLatest<T extends { createdAt: string; id: string }>(items: T[]) {
  return [...items].sort(compareFeedByLatest)
}

/**
 * Sort organic items by latest, then re-insert sponsored cards every `everyN` posts.
 * Prevents ads (often stamped "now") from jumping to index 0 after a global date sort.
 */
export function orderFeedItemsWithAds<
  T extends { createdAt: string; id: string; type: string },
>(items: T[], everyN = FEED_AD_EVERY_N): T[] {
  const organic = items.filter((item) => item.type !== 'sponsored')
  const ads = items.filter((item) => item.type === 'sponsored')
  const sorted = sortFeedItemsLatest(organic)

  if (!ads.length || everyN < 1) return sorted

  const result: T[] = []
  let adIndex = 0

  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]!)
    if ((i + 1) % everyN === 0 && adIndex < ads.length) {
      result.push(ads[adIndex++]!)
    }
  }

  return result
}
