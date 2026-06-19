import type { ComponentType } from 'react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { ArticleFeedCard } from '@/modules/feed/components/cards/article-feed-card'
import { ImageFeedCard } from '@/modules/feed/components/cards/image-feed-card'
import { MusicFeedCard } from '@/modules/feed/components/cards/music-feed-card'
import { TextFeedCard } from '@/modules/feed/components/cards/text-feed-card'
import { VideoFeedCard } from '@/modules/feed/components/cards/video-feed-card'

export interface FeedCardProps {
  item: FeedItemDto
  defaultCommentsOpen?: boolean
  compact?: boolean
}

export const FEED_RENDERERS = {
  music: MusicFeedCard,
  video: VideoFeedCard,
  image: ImageFeedCard,
  text: TextFeedCard,
  article: ArticleFeedCard,
} satisfies Record<FeedItemDto['type'], ComponentType<FeedCardProps>>

export function FeedItemCard({ item, defaultCommentsOpen, compact }: FeedCardProps) {
  const Renderer = FEED_RENDERERS[item.type]
  return <Renderer item={item} defaultCommentsOpen={defaultCommentsOpen} compact={compact} />
}
