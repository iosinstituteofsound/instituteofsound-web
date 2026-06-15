import type { FeedItemDto } from '@/modules/feed/types/feed.types'

export function isStoryItem(item: FeedItemDto) {
  return item.payload?.isStory === true
}
