import type { FeedItemDto } from '@/modules/feed/types/feed.types'

export interface FeedCardProps {
  item: FeedItemDto
  defaultCommentsOpen?: boolean
  compact?: boolean
  onPostDeleted?: () => void
}
