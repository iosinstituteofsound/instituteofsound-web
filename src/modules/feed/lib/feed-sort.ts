export function compareFeedByLatest<T extends { createdAt: string; id: string }>(left: T, right: T) {
  const timeDiff = Date.parse(right.createdAt) - Date.parse(left.createdAt)
  if (timeDiff !== 0) return timeDiff
  return right.id.localeCompare(left.id)
}

export function sortFeedItemsLatest<T extends { createdAt: string; id: string }>(items: T[]) {
  return [...items].sort(compareFeedByLatest)
}
