import type { FeedAuthorDto } from '@/modules/feed/types/feed.types'

export function getFeedAuthorProfilePath(author: FeedAuthorDto): string {
  return `/profile/${author.id}`
}
