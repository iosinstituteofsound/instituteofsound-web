import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { isStoryItem } from '@/modules/feed/lib/story-utils'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'

/** Video feed items eligible for the reels viewer (excludes stories). */
export function isReelItem(item: FeedItemDto): boolean {
  if (item.type !== 'video') return false
  if (isStoryItem(item)) return false
  if (item.payload?.isReel === false) return false
  return Boolean(payloadString(item.payload, 'videoUrl'))
}

export function reelVideoUrl(item: FeedItemDto): string | undefined {
  return payloadString(item.payload, 'videoUrl')
}

export function reelPosterUrl(item: FeedItemDto): string | undefined {
  return payloadString(item.payload, 'posterUrl')
}

export function reelCaption(item: FeedItemDto): string {
  return item.body?.trim() || item.title?.trim() || ''
}
